// src/utils/webRTC.ts

import { ICE_SERVERS } from '../../config/webrtc'
import {
  socketService,
  SOCKET_EVENT_OFFER,
  SOCKET_EVENT_ANSWER,
  SOCKET_EVENT_ICE_CANDIDATE,
  SOCKET_EVENT_MEMBER_CHANGE,
} from '../socket.service'
import type { SocketUser } from '../socket.service'

// A map from peerId → RTCPeerConnection, so we can look up connections by remote peer's ID.
const pcMap: Record<string, RTCPeerConnection> = {}
// A map to keep track of remote streams by peer ID
const remoteStreamMap: Record<string, MediaStream> = {}

/**
 * Create a new RTCPeerConnection for a given remote peerId.
 * - Registers ICE‐candidate handling (sending candidates via signaling).
 * - Registers ontrack to surface remote streams.
 * - Attaches all local tracks for sending.
 */
export function createPeerConnection(
  peerId: string,
  localStream: MediaStream,
  roomId: string,
  onRemoteTrack: (stream: MediaStream, peerId: string) => void
): RTCPeerConnection {
  const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS })
  // Whenever WebRTC finds a new ICE candidate, send it to the remote peer.
  pc.onicecandidate = (event) => {
    if (event.candidate) {
      console.log(`ICE state for peer`)
      socketService.emit(SOCKET_EVENT_ICE_CANDIDATE, {
        to: peerId,
        candidate: event.candidate,
        room: roomId,
      })
    }
  }

  pcMap[peerId] = pc

  // Whenever a remote track arrives, call the provided callback with that stream.
  pc.ontrack = (event) => {
    // Note: event.streams[0] is the remote MediaStream object
    console.log(event.streams)
    const remoteStream = event.streams[0]
    remoteStreamMap[peerId] = remoteStream
    onRemoteTrack(remoteStream, peerId)
  }

  // Add all local tracks (video + audio) into this connection so they get sent out.
  localStream.getTracks().forEach((track) => {
    pc.addTrack(track, localStream)
  })

  return pc
}

/**
 * Cleanup and close all existing peer connections.
 */
export function closeAllPeerConnections() {
  Object.values(pcMap).forEach((pc) => pc.close())
  Object.keys(pcMap).forEach((id) => delete pcMap[id])
  Object.keys(remoteStreamMap).forEach((id) => delete remoteStreamMap[id])
}

/**
 * Kick off the "offer" process for a newly joined peer:
 * 1. Create a PeerConnection (with localStream attached).
 * 2. Generate an SDP offer, set it as local description.
 * 3. Emit "offer" over signaling to the remote peer.
 */
export async function sendOffer(
  peerId: string,
  localStream: MediaStream,
  roomId: string,
  onRemoteTrack: (stream: MediaStream, peerId: string) => void
) {
  const pc = createPeerConnection(peerId, localStream, roomId, onRemoteTrack)

  // Create an SDP offer
  const offer = await pc.createOffer()
  await pc.setLocalDescription(offer)

  // Send the offer to the remote peer via your signaling layer
  socketService.emit(SOCKET_EVENT_OFFER, {
    to: peerId,
    offer,
    room: roomId,
  })
}

/**
 * Handle an incoming SDP "offer" from another peer:
 * 1. Create a PeerConnection (with localStream attached).
 * 2. Set the remote description to the received offer.
 * 3. Create an answer, set it as local description.
 * 4. Emit "answer" over signaling back to the caller.
 */
export async function handleReceivedOffer(
  fromPeerId: string,
  offer: RTCSessionDescriptionInit,
  localStream: MediaStream,
  roomId: string,
  onRemoteTrack: (stream: MediaStream, peerId: string) => void
) {
  // If we already have a connection to this peer, skip (unlikely for first offer).
  if (pcMap[fromPeerId]) return

  const pc = createPeerConnection(fromPeerId, localStream, roomId, onRemoteTrack)

  await pc.setRemoteDescription(new RTCSessionDescription(offer))
  const answer = await pc.createAnswer()
  await pc.setLocalDescription(answer)

  // Send the answer back to the original caller
  socketService.emit(SOCKET_EVENT_ANSWER, {
    to: fromPeerId,
    answer,
    room: roomId,
  })
}

/**
 * Handle an incoming SDP "answer" from a remote peer.
 * Sets the remote description on the existing RTCPeerConnection.
 */
export async function handleReceivedAnswer(
  fromPeerId: string,
  answer: RTCSessionDescriptionInit
) {
  const pc = pcMap[fromPeerId]
  if (!pc) return
  await pc.setRemoteDescription(new RTCSessionDescription(answer))
}

/**
 * Handle an incoming ICE candidate from a remote peer.
 * Adds the candidate into the matching RTCPeerConnection.
 */
export function handleReceivedIceCandidate(
  fromPeerId: string,
  candidate: RTCIceCandidateInit
) {
  const pc = pcMap[fromPeerId]
  if (!pc || !candidate) return
  pc.addIceCandidate(new RTCIceCandidate(candidate))
}

/**
 * Clean up a specific peer connection and its associated stream
 */
function cleanupPeerConnection(peerId: string, onRemoteStreamRemoved: (peerId: string) => void) {
  const pc = pcMap[peerId]
  if (pc) {
    pc.close()
    delete pcMap[peerId]
  }
  delete remoteStreamMap[peerId]
  onRemoteStreamRemoved(peerId)
}

/**
 * Wire up all socket listeners needed for WebRTC:
 *  - "members-change": informs us of the current list of peers in the room,
 *      so we can initiate calls to any new peer IDs.
 *  - "offer": called when another peer wants to connect; we respond with an answer.
 *  - "answer": peer's response to our offer.
 *  - "ice-candidate": a piece of ICE info from peer; we add it to our PC.
 *
 *  This function should be called **after** you have acquired your localStream.
 */
export function registerWebRTCListeners(
  roomId: string,
  userId: string,
  localStream: MediaStream,
  onRemoteStreamAdded: (stream: MediaStream, peerId: string) => void,
  onRemoteStreamRemoved: (peerId: string) => void,
  onMembersUpdate: (members: SocketUser[]) => void
) {
  // 1. When the member list changes, connect to any new peer.
  socketService.on(SOCKET_EVENT_MEMBER_CHANGE, (members: SocketUser[]) => {
    // Filter out nullish entries and ourselves
    const otherPeers = members
      .filter((m) => m && m.id !== userId)
      .map((m) => m.id)

    // Let caller see the updated member list if desired
    onMembersUpdate(members)

    // Clean up connections for peers that are no longer in the room
    Object.keys(pcMap).forEach((peerId) => {
      if (!otherPeers.includes(peerId)) {
        cleanupPeerConnection(peerId, onRemoteStreamRemoved)
      }
    })

    // For each peer we haven't already set up, send an offer
    otherPeers.forEach((peerId) => {
      if (!pcMap[peerId]) {
        sendOffer(peerId, localStream, roomId, onRemoteStreamAdded)
      }
    })
  })

  // 2. When someone sends us an offer, handle it and reply with answer
  socketService.on(
    SOCKET_EVENT_OFFER,
    async ({
      from,
      offer,
    }: {
      from: string
      offer: RTCSessionDescriptionInit
    }) => {
      console.log('🔹 Received OFFER in', 'from', from)
      console.log('🔹 Offer details:', offer)

      await handleReceivedOffer(from, offer, localStream, roomId, onRemoteStreamAdded)
    }
  )

  // 3. When we get an answer to our offer, finalize the connection
  socketService.on(
    SOCKET_EVENT_ANSWER,
    async ({
      from,
      answer,
    }: {
      from: string
      answer: RTCSessionDescriptionInit
    }) => {
      console.log('🔹 Received ANSWER in', 'from', from)

      await handleReceivedAnswer(from, answer)
    }
  )

  // 4. When a peer's ICE candidate arrives, add it to our RTCPeerConnection
  socketService.on(
    SOCKET_EVENT_ICE_CANDIDATE,
    ({ from, candidate }: { from: string; candidate: RTCIceCandidateInit }) => {
      console.log('🔹 Received ICE candidate in', 'from', from)
      handleReceivedIceCandidate(from, candidate)
    }
  )
}

/**
 * Call this to tear down all WebRTC event listeners and close connections.
 * Should be invoked when leaving the room or unmounting the component.
 */
export function unregisterWebRTCListeners(roomId: string | undefined) {
  socketService.off(SOCKET_EVENT_MEMBER_CHANGE)
  socketService.off(SOCKET_EVENT_OFFER)
  socketService.off(SOCKET_EVENT_ANSWER)
  socketService.off(SOCKET_EVENT_ICE_CANDIDATE)
  closeAllPeerConnections()
}
