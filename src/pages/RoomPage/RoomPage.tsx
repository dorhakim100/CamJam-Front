import React, { useEffect, useState, useRef } from 'react'
import { useSelector } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'

import {
  socketService,
  SocketUser,
  SOCKET_EVENT_MEMBER_CHANGE,
  socket,
  SOCKET_EVENT_OFFER,
  SOCKET_EVENT_ANSWER,
  SOCKET_EVENT_ICE_CANDIDATE,
} from '../../services/socket.service'

import { loadRoom } from '../../store/actions/room.actions'

import { RootState } from '../../store/store'
import { User } from '../../types/user/User'
import { MembersList } from '../../components/MembersList/MembersList'
import {
  registerWebRTCListeners,
  unregisterWebRTCListeners,
} from '../../services/webRTC/webRTC'
import { WebRTCService } from '../../services/webRTC/webRTC2'
import { showErrorMsg } from '../../services/event-bus.service'
import { s } from 'framer-motion/client'

interface RemoteStreamInfo {
  stream: MediaStream
  peerId: string
}

export function RoomPage() {
  const { id } = useParams()

  const navigate = useNavigate()

  const room = useSelector(
    (stateSelector: RootState) => stateSelector.roomModule.room
  )

  const user = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.user
  )

  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const [webRTCService, setWebRTCService] = useState<WebRTCService | null>(null)
  const localVideoRef = useRef<HTMLVideoElement | null>(null)

  const remoteVideosRef = useRef<Map<string, HTMLVideoElement>>(new Map())

  const connectedPeers = useRef<Set<string>>(new Set())

  const [currMembers, setCurrentMembers] = useState<SocketUser[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setRoom()
  }, [id])

  useEffect(() => {
    const testCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        })
        // console.log(
        //   'Camera access successful:',
        //   stream.getVideoTracks()[0].label
        // )
        // Stop the test stream
        stream.getTracks().forEach((track) => track.stop())
      } catch (err) {
        console.error('Camera access error:', err)
        showErrorMsg(
          'Failed to access camera or microphone. Please check permissions.'
        )
      }
    }
    testCamera()
  }, [])

  useEffect(() => {
    const newWebRTCService = new WebRTCService(socket)
    setWebRTCService(newWebRTCService)
  }, [])

  useEffect(() => {
    if (!socketService || !webRTCService || !id || !user) return

    const initializeMedia = async () => {
      try {
        const stream = await webRTCService.getLocalStream()
        if (localVideoRef.current && stream) {
          localVideoRef.current.srcObject = stream
          console.log('Setting local video stream')

          // Add event listeners for local video
          localVideoRef.current.onloadedmetadata = () => {
            console.log('Local video metadata loaded')
            console.log(
              'Local video dimensions:',
              localVideoRef.current?.videoWidth,
              'x',
              localVideoRef.current?.videoHeight
            )
            const playPromise = localVideoRef.current?.play()
            if (playPromise) {
              playPromise.catch((e) =>
                console.error('Error playing local video:', e)
              )
            }
          }
        }
        console.log('Local stream initialized, joining room...')
        socketService.login({
          id: user.id,
          fullname: user.fullname,
          imgUrl: user.imgUrl,
        })
        socketService.joinRoom(id)
      } catch (error) {
        console.error('Error getting local stream:', error)
        setError('Failed to access camera/microphone')
      }
    }

    socket.on(SOCKET_EVENT_MEMBER_CHANGE, (members) => {
      members = members.filter((member: SocketUser) => member)
      setCurrentMembers(members)

      members.forEach(async (member: any) => {
        if (
          member.socketId !== socket.id &&
          !connectedPeers.current.has(member.socketId)
        ) {
          try {
            console.log('Initiating connection with:', member.socketId)
            await webRTCService.createPeerConnection(
              member.socketId,
              (stream) => {
                console.log('Received remote stream from:', member.socketId)
                const video = remoteVideosRef.current.get(member.socketId)
                if (video) {
                  console.log(
                    'Setting stream to video element for:',
                    member.socketId
                  )
                  video.srcObject = stream
                  video
                    .play()
                    .then(() =>
                      console.log('Video playing for:', member.socketId)
                    )
                    .catch((e) => console.error('Error playing video:', e))
                } else {
                  console.warn('No video element found for:', member.socketId)
                }
              }
            )
            connectedPeers.current.add(member.socketId)
          } catch (error) {
            console.error('Error creating peer connection:', error)
          }
        }
      })
    })

    socket.on(SOCKET_EVENT_OFFER, async ({ offer, from }) => {
      console.log('Received offer from:', from)
      console.log('Connected peers:', connectedPeers.current)

      try {
        await webRTCService.handleOffer(offer, from, (stream) => {
          console.log('Setting remote stream for:', from)
          const video = remoteVideosRef.current.get(from)
          console.log('Remote video element for:', from, video)

          if (video) {
            console.log('Setting stream to video element')
            video.srcObject = stream
            video
              .play()
              .then(() => console.log('Video playing for:', from))
              .catch((e) => console.error('Error playing video:', e))
          } else {
            console.warn('No video element found for:', from)
          }
        })
        connectedPeers.current.add(from)
      } catch (error) {
        console.error('Error handling offer:', error)
      }
    })

    socket.on(SOCKET_EVENT_ANSWER, async ({ answer, from }) => {
      console.log('Received answer from:', from)
      try {
        await webRTCService.handleAnswer(answer, from)
      } catch (error) {
        console.error('Error handling answer:', error)
      }
    })

    socket.on(SOCKET_EVENT_ICE_CANDIDATE, async ({ candidate, from }) => {
      console.log('Received ICE candidate from:', from)
      try {
        await webRTCService.handleIceCandidate(candidate, from)
      } catch (error) {
        console.error('Error handling ICE candidate:', error)
      }
    })
    initializeMedia()
    return () => {
      console.log('Cleaning up WebRTC connections')
      socket.off(SOCKET_EVENT_MEMBER_CHANGE)
      socket.off(SOCKET_EVENT_OFFER)
      socket.off(SOCKET_EVENT_ANSWER)
      socket.off(SOCKET_EVENT_ICE_CANDIDATE)
      if (webRTCService) {
        webRTCService.closeAllConnections()
      }
      socketService.leaveRoom(id)
      connectedPeers.current.clear()
    }
  }, [socket, webRTCService, id, user])

  async function setRoom() {
    if (!id) return
    try {
      await loadRoom(id)
    } catch (error) {
      console.log('Error setting room:', error)
      showErrorMsg('Failed to set room details')
    }
  }

  const handleVideoRef = (element: HTMLVideoElement | null, userId: string) => {
    if (element) {
      remoteVideosRef.current.set(userId, element)
      console.log('Remote video element created for:', userId)

      // Ensure the video element has the correct properties
      element.autoplay = true
      element.playsInline = true

      // Add event listeners for debugging
      element.onloadedmetadata = () => {
        console.log('Remote video metadata loaded for:', userId)
        console.log(
          'Video dimensions:',
          element.videoWidth,
          'x',
          element.videoHeight
        )
        console.log('Video ready state:', element.readyState)
        console.log('Video network state:', element.networkState)

        // Force play when metadata is loaded
        const playPromise = element.play()
        if (playPromise) {
          playPromise.catch((e) =>
            console.error('Error playing video after metadata:', e)
          )
        }
      }

      element.onplay = () => {
        console.log('Remote video started playing for:', userId)
        console.log(
          'Video dimensions:',
          element.videoWidth,
          'x',
          element.videoHeight
        )
        console.log('Video ready state:', element.readyState)
      }

      element.onpause = () => {
        console.log('Remote video paused for:', userId)
      }

      element.onerror = (e) => {
        console.error('Remote video error for:', userId, e)
      }

      // Check if we already have a stream for this user
      const existingVideo = remoteVideosRef.current.get(userId)
      if (existingVideo && existingVideo.srcObject) {
        element.srcObject = existingVideo.srcObject
        const playPromise = element.play()
        if (playPromise) {
          playPromise.catch((e) =>
            console.error('Error playing existing stream:', e)
          )
        }
      }
    }
  }

  return (
    <div className='video-chat'>
      {error && (
        <div
          className='error-message'
          style={{
            backgroundColor: '#ff5555',
            color: 'white',
            padding: '1rem',
            marginBottom: '1rem',
            borderRadius: '4px',
          }}
        >
          {error}
        </div>
      )}
      <div className='room-info'>
        {room && (
          <>
            <h1>{room.name}</h1>
            <p>Room ID: {id}</p>
            {room.host && <p>Host: {room.host.fullname}</p>}
            <p>Members: {currMembers.length}</p>
            <MembersList members={currMembers} />
          </>
        )}
      </div>
      <div className='video-grid'>
        <div className='video-container local'>
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: 'scaleX(-1)', // Mirror the local video
            }}
          />
          <div className='label'>You</div>
        </div>
        {currMembers
          .filter((member) => member.socketId !== socket.id && member.socketId)
          .map((member) => (
            <div key={member.socketId} className='video-container remote'>
              <video
                ref={(element) => {
                  if (member.socketId) {
                    handleVideoRef(element, member.socketId)
                  }
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              <div className='label'>
                {member.fullname || `User ${member.socketId?.slice(0, 4)}`}
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}
