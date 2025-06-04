import { Socket } from 'socket.io-client'
import {
  SOCKET_EVENT_ANSWER,
  SOCKET_EVENT_ICE_CANDIDATE,
  SOCKET_EVENT_OFFER,
  socketService,
} from '../socket.service'

export class WebRTCService {
  private peerConnections: Map<string, RTCPeerConnection> = new Map()
  private socket: Socket
  private localStream: MediaStream | null = null
  private remoteStreams: Map<string, MediaStream> = new Map()

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
      throw error
    }
  }

  async createPeerConnection(
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

      if (this.localStream) {
        this.localStream.getTracks().forEach((track) => {
          if (this.localStream) {
            peerConnection.addTrack(track, this.localStream)
          }
        })
      } else {
      }

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socketService.emit(SOCKET_EVENT_ICE_CANDIDATE, {
            candidate: event.candidate,
            to: remoteUserId,
          })
        } else {
        }
      }

      peerConnection.onconnectionstatechange = () => {
        if (peerConnection.connectionState === 'connected') {
        }
      }

      peerConnection.oniceconnectionstatechange = () => {
        if (peerConnection.iceConnectionState === 'connected') {
        }
      }

      peerConnection.onnegotiationneeded = async () => {
        try {
          await this.createOffer(remoteUserId)
        } catch (error) {}
      }

      peerConnection.ontrack = (event) => {
        if (!this.remoteStreams.has(remoteUserId)) {
          const newStream = new MediaStream()
          this.remoteStreams.set(remoteUserId, newStream)
          onTrack(newStream)
        }

        const stream = this.remoteStreams.get(remoteUserId)!
        if (!stream.getTracks().some((t) => t.id === event.track.id)) {
          stream.addTrack(event.track)
        }

        if (event.streams && event.streams[0]) {
          onTrack(event.streams[0])
        }

        event.track.onended = () => {}

        event.track.onmute = () => {}

        event.track.onunmute = () => {}
      }

      this.peerConnections.set(remoteUserId, peerConnection)
      return peerConnection
    } catch (error) {
      throw error
    }
  }

  async createOffer(remoteUserId: string) {
    const peerConnection = this.peerConnections.get(remoteUserId)
    if (peerConnection) {
      try {
        const offer = await peerConnection.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        })

        await peerConnection.setLocalDescription(offer)

        socketService.emit(SOCKET_EVENT_OFFER, {
          offer,
          to: remoteUserId,
        })
      } catch (error) {
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
      const peerConnection = await this.createPeerConnection(from, onTrack)

      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(offer)
      )

      const answer = await peerConnection.createAnswer()

      await peerConnection.setLocalDescription(answer)

      socketService.emit(SOCKET_EVENT_ANSWER, {
        answer,
        to: from,
      })
    } catch (error) {
      throw error
    }
  }

  async handleAnswer(answer: RTCSessionDescriptionInit, from: string) {
    const peerConnection = this.peerConnections.get(from)
    if (peerConnection) {
      try {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(answer)
        )
      } catch (error) {
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
        throw error
      }
    }
  }

  closeConnection(userId: string) {
    const peerConnection = this.peerConnections.get(userId)
    if (peerConnection) {
      peerConnection.close()
      this.peerConnections.delete(userId)
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
