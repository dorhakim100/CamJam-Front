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
  const localStreamRef = useRef<MediaStream>(null)
  const remoteVideosRef = useRef<Map<string, HTMLVideoElement>>(new Map())

  const connectedPeers = useRef<Set<string>>(new Set())

  let isCleanup = false // a guard to prevent state updates after unmount

  const [currMembers, setCurrentMembers] = useState<SocketUser[]>([])
  const [remoteStreams, setRemoteStreams] = useState<RemoteStreamInfo[]>([])

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
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
          // console.log('Set local video stream')
        }
        // console.log('Local stream initialized, joining room...')
        socketService.login({
          id: user.id,
          fullname: user.fullname,
          imgUrl: user.imgUrl,
        })
        socketService.joinRoom(id)
      } catch (error) {
        // console.error('Error getting local stream:', error)
        showErrorMsg(
          'Failed to access camera or microphone. Please check permissions.'
        )
      }
    }

    socket.on(SOCKET_EVENT_MEMBER_CHANGE, (members) => {
      members = members.filter((member: SocketUser) => member)
      // const filteredUsers = updatedUsers.filter(
      //   (user) => user.socketId !== socket.id
      // )

      setCurrentMembers(members)
      // setUsers(filteredUsers)

      // Initiate connections with new users

      members.forEach(async (member: any) => {
        if (!connectedPeers.current.has(member.socketId)) {
          try {
            // 1) Just createPeerConnection. That immediately adds your transceivers /
            //    tracks and fires `onnegotiationneeded` exactly once.
            await webRTCService.createPeerConnection(
              member.socketId,
              (stream) => {
                const video = remoteVideosRef.current.get(member.socketId)
                if (video) {
                  video.srcObject = stream
                  video
                    .play()
                    .catch((e) => console.error('Error playing video:', e))
                }
              }
            )

            // 2) No manual createOffer() here.
            //    onnegotiationneeded in WebRTCService will trigger a single createOffer().
            connectedPeers.current.add(member.socketId)
          } catch (error) {
            console.error('Error creating peer connection:', error)
          }
        }
      })
    })

    socket.on(SOCKET_EVENT_OFFER, async ({ offer, from }) => {
      // console.log('Received offer from:', from)
      if (!connectedPeers.current.has(from)) {
        try {
          await webRTCService.handleOffer(offer, from, (stream) => {
            // console.log('Setting remote stream for:', from)
            const video = remoteVideosRef.current.get(from)
            if (video) {
              video.srcObject = stream
              video
                .play()
                .catch((e: string) => console.error('Error playing video:', e))
            }
          })
          connectedPeers.current.add(from)
        } catch (error) {
          console.error('Error handling offer:', error)
        }
      }
    })

    socket.on(SOCKET_EVENT_ANSWER, async ({ answer, from }) => {
      // console.log('Received answer from:', from)
      try {
        await webRTCService.handleAnswer(answer, from)
      } catch (error) {
        console.error('Error handling answer:', error)
      }
    })

    socket.on(SOCKET_EVENT_ICE_CANDIDATE, async ({ candidate, from }) => {
      // console.log('Received ICE candidate from:', from)
      try {
        await webRTCService.handleIceCandidate(candidate, from)
      } catch (error) {
        console.error('Error handling ICE candidate:', error)
      }
    })
    initializeMedia()
    return () => {
      socket.off(SOCKET_EVENT_MEMBER_CHANGE)
      socket.off(SOCKET_EVENT_OFFER)
      socket.off(SOCKET_EVENT_ANSWER)
      socket.off(SOCKET_EVENT_ICE_CANDIDATE)
      socketService.leaveRoom(id)
    }
  }, [socket, webRTCService])

  // useEffect(() => {
  //   // handlePeerConnection()

  //   // CLEANUP: runs when component unmounts or room id/user changes
  //   return () => {
  //     isCleanup = true

  //     // 1) Leave the room so server updates other peers
  //     socketService.leaveRoom(id)

  //     // 2) Unregister all WebRTC listeners and close all connections
  //     unregisterWebRTCListeners(id)

  //     // 3) If we have a local media stream, stop all its tracks
  //     if (localStreamRef.current) {
  //       localStreamRef.current.getTracks().forEach((t) => t.stop())
  //     }

  //     // 4) Clear any UI state if desired
  //     setCurrentMembers([])
  //     setRemoteStreams([])
  //   }
  // }, [id, user])

  // Optional: whenever remoteStreams changes, you can log or do additional effects
  // useEffect(() => {
  //   console.log('Current remote streams:', remoteStreams)
  // }, [remoteStreams])

  // async function handlePeerConnection() {
  //   if (!id || !user) {
  //     navigate('/')
  //     return
  //   }

  //   // This immediately‐invoked async block:
  //   // 1) gets local media
  //   // 2) sets up all WebRTC listeners
  //   // 3) joins the room via socket
  //   isCleanup = false
  //   try {
  //     // 1) Get camera + mic
  //     const stream = await navigator.mediaDevices.getUserMedia({
  //       video: true,
  //       audio: true,
  //     })
  //     if (isCleanup) {
  //       stream.getTracks().forEach((t) => t.stop())
  //       return
  //     }
  //     localStreamRef.current = stream
  //     if (localVideoRef.current) {
  //       localVideoRef.current.srcObject = stream
  //     }

  //     // 2) Register all WebRTC (offer/answer/ice/member‐change) listeners in one place
  //     registerWebRTCListeners(
  //       id,
  //       user.id,
  //       stream,
  //       (remoteStream, peerId) => {
  //         console.log(
  //           'New remote stream added:',
  //           remoteStream,
  //           'from peer:',
  //           peerId
  //         )

  //         // Called whenever a new remote track arrives
  //         setRemoteStreams((prev) => {
  //           if (prev.find((s) => s.stream.id === remoteStream.id)) {
  //             return prev
  //           }
  //           return [...prev, { stream: remoteStream, peerId }]
  //         })
  //       },
  //       (peerId) => {
  //         console.log('Remote stream removed for peer:', peerId)
  //         setRemoteStreams((prev) => prev.filter((s) => s.peerId !== peerId))
  //       },
  //       (members) => {
  //         members = members.filter((member) => member)
  //         // Called whenever the member list changes
  //         setCurrentMembers(members)
  //       }
  //     )

  //     // 3) Now that listeners are ready, tell the server who we are and join the room
  //     socketService.login({
  //       id: user.id,
  //       fullname: user.fullname,
  //       imgUrl: user.imgUrl,
  //     })
  //     socketService.joinRoom(id)
  //   } catch (err) {
  //     console.error('Error during WebRTC initialization:', err)
  //     // Show an error to the user as needed
  //   }
  // }

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
      // console.log(remoteVideosRef.current, 'remote videos map before set')

      remoteVideosRef.current.set(userId, element)
      // console.log('Remote video element created for:', userId)

      // If we already have a stream for this user, set it
      const existingVideo = remoteVideosRef.current.get(userId)
      // console.log(existingVideo, 'existing video element for:', userId)

      if (existingVideo && existingVideo.srcObject) {
        element.srcObject = existingVideo.srcObject
        // console.log(element.srcObject, 'Setting existing stream for:', userId)

        element.play().catch((e) => console.error('Error playing video:', e))
      }
    }
  }

  if (room && room.host)
    return (
      <div className={`main ${prefs.isDarkMode ? 'dark-mode' : ''} room-page`}>
        <div className='video-container'>
          {/* 1) Local preview */}
          <video
            ref={(el) => {
              localVideoRef.current = el
              if (el && localStreamRef.current) {
                el.srcObject = localStreamRef.current
              }
            }}
            className='room-video'
            autoPlay
            playsInline
            muted
            style={{ width: 200, border: '1px solid #333', marginBottom: 12 }}
          />

          {/* 2) Remote previews */}
          {/* {remoteStreams
            .filter(
              (streamInfo, index, self) =>
                // Filter out duplicate streams based on their ID
                index ===
                self.findIndex((s) => s.stream.id === streamInfo.stream.id)
            )
            .map(({ stream, peerId }, idx) => {
              console.log(
                '---- Remote stream #',
                idx,
                'from peer:',
                peerId,
                '----'
              )
              console.log('  videoTracks:', stream.getVideoTracks())
              console.log('  audioTracks:', stream.getAudioTracks())

              return (
                <MediaStreamVideo
                  key={peerId}
                  stream={stream}
                  className='room-video'
                  style={{
                    width: 200,
                    border: '1px solid #555',
                    marginLeft: 12,
                  }}
                />
              )
            })} */}
          {currMembers.map((member) => (
            <div key={member.id} className='video-container remote'>
              <video
                ref={(element) => handleVideoRef(element, member.id)}
                autoPlay
                playsInline
                onPlay={() =>
                  console.log('Remote video started playing for:', member.id)
                }
                onLoadedMetadata={() =>
                  console.log('Remote video metadata loaded for:', member.id)
                }
              />
              <div className='label'>User {member.id.slice(0, 4)}</div>
            </div>
          ))}
        </div>

        <div className='room-info'>
          <h1>{room?.name}</h1>
          <p>Room ID: {id}</p>
          <p>Host: {room?.host.fullname}</p>
          {/* <p>Created at: {room?.created_at || 'Loading...'}</p> */}
          <p>Members: {currMembers.length}</p>
          <MembersList members={currMembers} />
          {/* <p>Status: {room?.is_private ? 'Private' : 'Public'}</p> */}
        </div>
      </div>
    )
}

// MediaStreamVideo.tsx
import { CSSProperties } from 'react'
import { io } from 'socket.io-client'

interface MediaStreamVideoProps {
  stream: MediaStream | null
  muted?: boolean
  autoPlay?: boolean
  playsInline?: boolean
  className?: string
  style?: CSSProperties
}

export function MediaStreamVideo({
  stream,
  muted = false,
  autoPlay = true,
  playsInline = true,
  className,
  style,
}: MediaStreamVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const el = videoRef.current
    if (!el) return

    // Only re-bind if srcObject is not already this exact MediaStream:
    if (stream && el.srcObject !== stream) {
      el.srcObject = stream
      console.log('stream:', stream)
      const playPromise = el.play()
      // debugger
      if (playPromise && playPromise.catch) {
        playPromise.catch((err) => {
          console.warn('⏯️ autoplay interrupted:', err)
        })
      }
    } else if (!stream && el.srcObject) {
      el.srcObject = null
    }
  }, [stream])

  return (
    <video
      ref={videoRef}
      muted={muted}
      autoPlay={autoPlay}
      playsInline={playsInline}
      className={className}
      style={style}
    />
  )
}
