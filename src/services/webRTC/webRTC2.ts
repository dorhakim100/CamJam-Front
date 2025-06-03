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

  private pendingCandidates: Map<string, RTCIceCandidateInit[]> = new Map()
  private remoteDescSet: Map<string, boolean> = new Map()

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
      console.error('Error accessing media devices:', error)
      throw error
    }
  }

  async createPeerConnection(
    remoteUserId: string,
    onTrack: (stream: MediaStream) => void
  ) {
    try {
      console.log('Creating peer connection for:', remoteUserId)
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
      // if (this.localStream) {
      //   // console.log('Adding local tracks to peer connection')
      //   this.localStream.getTracks().forEach((track) => {
      //     if (this.localStream) {
      //       const sender = peerConnection.addTrack(track, this.localStream)
      //       // console.log('Added track:', track.kind, 'to peer connection')
      //     }
      //   })
      // } else {
      //   console.warn('No local stream available when creating peer connection')
      // }

      // 1) Create one audio transceiver, then one video transceiver,
      //    so SDP m-lines always come in the same order (audio first, then video).
      if (this.localStream) {
        const audioTracks = this.localStream.getAudioTracks()
        const videoTracks = this.localStream.getVideoTracks()

        // Create an audio transceiver
        const audioTransceiver = peerConnection.addTransceiver('audio', {
          direction: 'sendrecv',
        })
        if (audioTracks.length > 0) {
          // Replace the “send” slot with our actual audio track
          audioTransceiver.sender.replaceTrack(audioTracks[0])
        } else {
          // If no microphone is available, that track stays inactive
          audioTransceiver.direction = 'recvonly'
        }

        // Create a video transceiver
        const videoTransceiver = peerConnection.addTransceiver('video', {
          direction: 'sendrecv',
        })
        if (videoTracks.length > 0) {
          videoTransceiver.sender.replaceTrack(videoTracks[0])
        } else {
          videoTransceiver.direction = 'recvonly'
        }
      } else {
        console.warn('No local stream available when creating peer connection')
      }

      this.peerConnections.set(remoteUserId, peerConnection)

      // Initialize the buffer & flag for this peer
      this.pendingCandidates.set(remoteUserId, [])
      this.remoteDescSet.set(remoteUserId, false)

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          // console.log('Sending ICE candidate to:', remoteUserId)
          socketService.emit(SOCKET_EVENT_ICE_CANDIDATE, {
            candidate: event.candidate,
            to: remoteUserId,
          })
        } else {
          console.log('All ICE candidates have been sent')
        }
      }

      // Handle connection state changes
      peerConnection.onconnectionstatechange = () => {
        // console.log(
        //   `Connection state for ${remoteUserId}:`,
        //   peerConnection.connectionState
        // )
        if (peerConnection.connectionState === 'connected') {
          console.log('Peer connection fully established')
        }
      }

      // Handle ICE connection state changes
      peerConnection.oniceconnectionstatechange = () => {
        // console.log(
        //   `ICE connection state for ${remoteUserId}:`,
        //   peerConnection.iceConnectionState
        // )
        if (peerConnection.iceConnectionState === 'connected') {
          console.log('ICE connection established')
        }
      }

      // Handle negotiation needed
      peerConnection.onnegotiationneeded = async () => {
        // console.log('Negotiation needed for:', remoteUserId)
        try {
          await this.createOffer(remoteUserId)
        } catch (error) {
          console.error('Error during negotiation:', error)
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

        // Create a new MediaStream if we don't have one for this peer
        if (!this.remoteStreams.has(remoteUserId)) {
          const newStream = new MediaStream()
          this.remoteStreams.set(remoteUserId, newStream)
          onTrack(newStream)
        }

        // Get the existing stream and add the track
        const stream = this.remoteStreams.get(remoteUserId)!
        if (!stream.getTracks().some((t) => t.id === event.track.id)) {
          stream.addTrack(event.track)
          console.log('Added track to remote stream:', event.track.kind)
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
      console.error('Error creating peer connection:', error)
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
          iceRestart: true,
        })

        // console.log('Setting local description')
        await peerConnection.setLocalDescription(offer)

        // console.log('Sending offer to:', remoteUserId)
        socketService.emit(SOCKET_EVENT_OFFER, {
          offer,
          to: remoteUserId,
        })
      } catch (error) {
        console.error('Error creating offer:', error)
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
      const peerConnection = await this.createPeerConnection(from, onTrack)
      // console.log('Setting remote description')
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(offer)
      )
      // ── After setting the remote SDP, mark “remoteDescSet” and drain queue ──
      this.remoteDescSet.set(from, true)
      const queue = this.pendingCandidates.get(from) || []
      for (const candInit of queue) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candInit))
      }
      this.pendingCandidates.set(from, []) // clear it
      // console.log('Creating answer')
      const answer = await peerConnection.createAnswer()
      // console.log('Setting local description')
      await peerConnection.setLocalDescription(answer)
      // console.log('Sending answer to:', from)
      socketService.emit(SOCKET_EVENT_ANSWER, {
        answer,
        to: from,
      })
    } catch (error) {
      console.error('Error handling offer:', error)
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

        // ── Mark remoteDescSet and drain queue ──
        this.remoteDescSet.set(from, true)
        const queue = this.pendingCandidates.get(from) || []
        for (const candInit of queue) {
          await peerConnection.addIceCandidate(new RTCIceCandidate(candInit))
        }
        this.pendingCandidates.set(from, [])
      } catch (error) {
        console.error('Error handling answer:', error)
        throw error
      }
    }
  }

  async handleIceCandidate(candidate: RTCIceCandidate, from: string) {
    const peerConnection = this.peerConnections.get(from)
    if (!peerConnection) return

    // const candInit = candidate.toJSON()
    const candInit = candidate
    const isRemoteDescSet = this.remoteDescSet.get(from)

    if (isRemoteDescSet) {
      // If remoteDesc was already set, we can add directly
      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candInit))
      } catch (err) {
        console.error('Error adding ICE candidate immediately:', err)
        throw err
      }
    } else {
      // Otherwise, buffer it for later
      const queue = this.pendingCandidates.get(from) || []
      queue.push(candInit)
      this.pendingCandidates.set(from, queue)
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
