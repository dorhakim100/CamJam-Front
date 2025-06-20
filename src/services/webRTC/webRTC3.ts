import { Socket } from 'socket.io-client'
import { SOCKET_EVENT_ICE_CANDIDATE } from '../socket.service'

// State managed via closure
export function createWebRTCService(socket: Socket) {
  let peerConnections: Map<string, RTCPeerConnection> = new Map()
  let localStream: MediaStream | null = null

  async function getLocalStream() {
    try {
      localStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      })
      return localStream
    } catch (error) {
      throw error
    }
  }

  async function disableLocalStream(type: string) {
    try {
      localStream = await navigator.mediaDevices.getUserMedia({
        video:
          type === 'video'
            ? false
            : {
                width: { ideal: 640 },
                height: { ideal: 480 },
              },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      })
      return localStream
    } catch (error) {
      throw error
    }
  }

  async function createPeerConnection(
    remoteUserId: string,
    onTrack: (stream: MediaStream) => void
  ) {
    try {
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

      if (localStream) {
        localStream.getTracks().forEach((track) => {
          if (localStream) {
            peerConnection.addTrack(track, localStream)
          }
        })
      }

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit(SOCKET_EVENT_ICE_CANDIDATE, {
            candidate: event.candidate,
            to: remoteUserId,
          })
        }
      }

      peerConnection.onconnectionstatechange = () => {
        if (
          peerConnection.connectionState === 'disconnected' ||
          peerConnection.connectionState === 'failed'
        ) {
          closeConnection(remoteUserId)
        }
      }

      peerConnection.oniceconnectionstatechange = () => {
        // No-op, can add logging if needed
      }

      peerConnection.onnegotiationneeded = async () => {
        if (peerConnection.signalingState === 'stable') {
          try {
            await createOffer(remoteUserId)
          } catch (error) {}
        }
      }

      peerConnection.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          onTrack(event.streams[0])
        }
        event.track.onended = () => {}
        event.track.onmute = () => {}
        event.track.onunmute = () => {}
      }

      peerConnections.set(remoteUserId, peerConnection)
      return peerConnection
    } catch (error) {
      throw error
    }
  }

  async function createOffer(remoteUserId: string) {
    const peerConnection = peerConnections.get(remoteUserId)
    if (peerConnection) {
      try {
        const offer = await peerConnection.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        })
        await peerConnection.setLocalDescription(offer)
        socket.emit('offer', {
          offer,
          to: remoteUserId,
        })
      } catch (error) {
        throw error
      }
    }
  }

  async function handleOffer(
    offer: RTCSessionDescriptionInit,
    from: string,
    onTrack: (stream: MediaStream) => void
  ) {
    try {
      let peerConnection = peerConnections.get(from)
      let isConnection = true
      if (!socket || typeof socket.id === 'undefined') {
        return
      }
      const currentSocketId = socket.id
      if (
        peerConnection &&
        peerConnection.signalingState === 'have-local-offer'
      ) {
        if (currentSocketId < from) {
          return
        } else {
          await peerConnection.setLocalDescription({ type: 'rollback' })
          closeConnection(from)
          isConnection = false
        }
      } else if (peerConnection) {
        closeConnection(from)
        isConnection = false
      }
      if (!isConnection) {
        peerConnection = await createPeerConnection(from, onTrack)
      }
      await peerConnection?.setRemoteDescription(
        new RTCSessionDescription(offer)
      )
      const answer = await peerConnection?.createAnswer()
      await peerConnection?.setLocalDescription(answer)
      socket.emit('answer', {
        answer,
        to: from,
      })
    } catch (error) {
      throw error
    }
  }

  async function handleAnswer(answer: RTCSessionDescriptionInit, from: string) {
    const peerConnection = peerConnections.get(from)
    if (peerConnection) {
      try {
        if (peerConnection.signalingState !== 'have-local-offer') {
          throw new Error(
            `Cannot handle answer from ${from} when signaling state is ${peerConnection.signalingState}. Expected 'have-local-offer'.`
          )
        }
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(answer)
        )
      } catch (error) {
        throw error
      }
    }
  }

  async function handleIceCandidate(candidate: RTCIceCandidate, from: string) {
    const peerConnection = peerConnections.get(from)
    if (peerConnection) {
      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
      } catch (error) {
        throw error
      }
    }
  }

  function closeConnection(userId: string) {
    const peerConnection = peerConnections.get(userId)
    if (peerConnection) {
      peerConnection.close()
      // Optionally: peerConnections.delete(userId)
    }
  }

  function closeAllConnections() {
    peerConnections.forEach((connection) => {
      connection.close()
    })
    peerConnections.clear()
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop())
      localStream = null
    }
  }

  return {
    getLocalStream,
    disableLocalStream,
    createPeerConnection,
    createOffer,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    closeConnection,
    closeAllConnections,
  }
}
