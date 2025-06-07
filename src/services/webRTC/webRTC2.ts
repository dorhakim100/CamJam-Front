import { Socket } from 'socket.io-client'
import { SOCKET_EVENT_ICE_CANDIDATE } from '../socket.service'

export class WebRTCService {
  private peerConnections: Map<string, RTCPeerConnection> = new Map()
  private socket: Socket
  private localStream: MediaStream | null = null

  constructor(socket: Socket) {
    this.socket = socket
  }

  async getLocalStream() {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      })
      return this.localStream
    } catch (error) {
      // console.error('Error accessing media devices:', error)
      throw error
    }
  }

  async createPeerConnection(
    remoteUserId: string,
    onTrack: (stream: MediaStream) => void
  ) {
    try {
      // console.log('Creating peer connection for:', remoteUserId)
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          {
            urls: 'turn:numb.viagenie.ca',
            username: 'webrtc@live.com',
            credential: 'muazkh',
          },
        ],
        iceCandidatePoolSize: 10,
        bundlePolicy: 'max-bundle',
        rtcpMuxPolicy: 'require',
      })

      // Add local tracks to the peer connection
      if (this.localStream) {
        // console.log('Adding local tracks to peer connection')
        this.localStream.getTracks().forEach((track) => {
          if (this.localStream) {
            const sender = peerConnection.addTrack(track, this.localStream)
            // console.log('Added track:', track.kind, 'to peer connection')
          }
        })
      } else {
        // console.warn('No local stream available when creating peer connection')
      }

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          // console.log('Sending ICE candidate to:', remoteUserId)
          this.socket.emit(SOCKET_EVENT_ICE_CANDIDATE, {
            candidate: event.candidate,
            to: remoteUserId,
          })
        } else {
          // console.log('All ICE candidates have been sent')
        }
      }

      // Handle connection state changes
      peerConnection.onconnectionstatechange = () => {
        // console.log(
        // `Connection state for ${remoteUserId}:`,
        // peerConnection.connectionState
        // )
        if (peerConnection.connectionState === 'connected') {
          // console.log('Peer connection fully established')
        } else if (
          peerConnection.connectionState === 'disconnected' ||
          peerConnection.connectionState === 'failed'
        ) {
          // console.log(
          //   `Peer connection for ${remoteUserId} ${peerConnection.connectionState}. Closing connection.`
          // )
          this.closeConnection(remoteUserId)
        }
      }

      // Handle ICE connection state changes
      peerConnection.oniceconnectionstatechange = () => {
        // console.log(
        //   `ICE connection state for ${remoteUserId}:`,
        //   peerConnection.iceConnectionState
        // )
        if (peerConnection.iceConnectionState === 'connected') {
          // console.log('ICE connection established')
        }
      }

      // Handle negotiation needed
      peerConnection.onnegotiationneeded = async () => {
        // console.log('Negotiation needed for:', remoteUserId)

        if (peerConnection.signalingState === 'stable') {
          try {
            await this.createOffer(remoteUserId)
          } catch (error) {
            // console.error('Error during negotiation:', error)
          }
        } else {
          // console.log(
          //   'Skipping offer creation, signaling state is not stable:',
          //   peerConnection.signalingState
          // )
        }
      }

      // Handle incoming tracks
      peerConnection.ontrack = (event) => {
        // console.log(
        //   'Received remote track:',
        //   event.track.kind,
        //   'from:',
        //   remoteUserId
        // )

        if (event.streams && event.streams[0]) {
          onTrack(event.streams[0])
        }

        // Monitor track ending
        event.track.onended = () => {
          // console.log('Remote track ended:', event.track.kind)
        }

        // Monitor track muting
        event.track.onmute = () => {
          // console.log('Remote track muted:', event.track.kind)
        }

        event.track.onunmute = () => {
          // console.log('Remote track unmuted:', event.track.kind)
        }
      }

      this.peerConnections.set(remoteUserId, peerConnection)
      return peerConnection
    } catch (error) {
      // console.error('Error creating peer connection:', error)
      throw error
    }
  }

  async createOffer(remoteUserId: string) {
    const peerConnection = this.peerConnections.get(remoteUserId)
    if (peerConnection) {
      try {
        // console.log('Creating offer for:', remoteUserId)
        const offer = await peerConnection.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        })
        // console.log('Setting local description')
        await peerConnection.setLocalDescription(offer)
        // console.log('Sending offer to:', remoteUserId)
        this.socket.emit('offer', {
          offer,
          to: remoteUserId,
        })
      } catch (error) {
        // console.error('Error creating offer:', error)
        throw error
      }
    }
  }

  async handleOffer(
    offer: RTCSessionDescriptionInit,
    from: string,
    onTrack: (stream: MediaStream) => void
  ) {
    try {
      // console.log('Handling offer from:', from)
      let peerConnection = this.peerConnections.get(from)

      // Ensure socket and its ID are available for glare resolution.
      if (!this.socket || typeof this.socket.id === 'undefined') {
        // console.error(
        //   'Error: Local socket or socket ID is unavailable for glare resolution. Cannot process offer.'
        // )
        return // Critical: Exit if socket or ID is not available to prevent crashes.
      }
      const currentSocketId = this.socket.id // Safely access socket ID here.

      // Glare handling: if we have a local offer, apply tie-breaking rule.
      if (
        peerConnection &&
        peerConnection.signalingState === 'have-local-offer'
      ) {
        if (currentSocketId < from) {
          // We win glare (local ID is smaller): ignore the incoming offer.
          // console.log(
          //   'Glare detected: We win (local ID is smaller), ignoring incoming offer from',
          //   from
          // )
          return // Exit function as we are ignoring this offer
        } else {
          // We lose glare (local ID is larger or equal): rollback our local offer
          // and then process the incoming offer as the primary negotiation.
          // console.log(
          //   'Glare detected: We lose (local ID is larger or equal), rolling back local offer for',
          //   from
          // )
          await peerConnection.setLocalDescription({ type: 'rollback' })
          // After rollback, aggressively close the existing problematic connection.
          this.closeConnection(from) // Ensure old PC is completely removed.
          peerConnection = null // Set to null to trigger new creation below.
        }
      } else if (peerConnection) {
        // If peerConnection exists but NOT in 'have-local-offer' state
        // This means it's an offer that's not part of a glare, but an existing connection.
        // It could be a re-negotiation, or a stale connection.
        // Aggressively close and recreate to ensure a clean state for this new offer.
        // console.warn(
        //   `Existing peer connection for ${from} detected (not glare). Closing and recreating for clean negotiation.`
        // )
        this.closeConnection(from)
        peerConnection = null // Set to null to trigger new creation below.
      }

      // At this point, peerConnection should be null if it was closed or didn't exist,
      // or it's the winning peer's already established connection.
      // If it's null, create a new one to handle this incoming offer.
      if (!peerConnection) {
        peerConnection = await this.createPeerConnection(from, onTrack)
      }

      // console.log('Setting remote description')
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(offer)
      )

      // console.log('Creating answer')
      const answer = await peerConnection.createAnswer()
      // console.log('Setting local description')
      await peerConnection.setLocalDescription(answer)
      // console.log('Sending answer to:', from)
      this.socket.emit('answer', {
        answer,
        to: from,
      })
    } catch (error) {
      // console.error('Error handling offer:', error)
      throw error
    }
  }

  async handleAnswer(answer: RTCSessionDescriptionInit, from: string) {
    const peerConnection = this.peerConnections.get(from)
    if (peerConnection) {
      try {
        // console.log(
        //   'Current signaling state for',
        //   from,
        //   'before handling answer:',
        //   peerConnection.signalingState
        // )

        // Only set remote description if we have a local offer waiting for an answer.
        // This addresses the InvalidStateError during glare by ignoring redundant answers.

        if (peerConnection.signalingState !== 'have-local-offer') {
          // console.warn(
          //   `Skipping answer from ${from}: Peer connection not in 'have-local-offer' state. Current state: ${peerConnection.signalingState}`
          // )
          throw new Error(
            `Cannot handle answer from ${from} when signaling state is ${peerConnection.signalingState}. Expected 'have-local-offer'.`
          )
          return
        }

        // console.log('Setting remote description for answer from:', from)
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(answer)
        )
      } catch (error) {
        // console.error('Error handling answer:', error)
        throw error
      }
    }
  }

  async handleIceCandidate(candidate: RTCIceCandidate, from: string) {
    const peerConnection = this.peerConnections.get(from)
    if (peerConnection) {
      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
      } catch (error) {
        // console.error('Error handling ICE candidate:', error)
        throw error
      }
    }
  }

  closeConnection(userId: string) {
    const peerConnection = this.peerConnections.get(userId)
    if (peerConnection) {
      peerConnection.close()
      // this.peerConnections.delete(userId)
    }
  }

  closeAllConnections() {
    this.peerConnections.forEach((connection) => {
      connection.close()
    })
    this.peerConnections.clear()
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop())
      this.localStream = null
    }
  }
}
