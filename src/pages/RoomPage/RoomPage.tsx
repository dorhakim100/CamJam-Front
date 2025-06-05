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
import { WebRTCService } from '../../services/webRTC/webRTC2'
import { showErrorMsg } from '../../services/event-bus.service'
import { Button, IconButton } from '@mui/material'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { setIsFirstRender } from '../../store/actions/system.actions'

export function RoomPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const room = useSelector(
    (stateSelector: RootState) => stateSelector.roomModule.room
  )

  const currRoomId = useSelector(
    (stateSelector: RootState) => stateSelector.roomModule.currRoomId
  )

  const user = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.user
  )

  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const isFirstRender = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.isFirstRender
  )

  const [webRTCService, setWebRTCService] = useState<WebRTCService | null>(null)
  const localVideoRef = useRef<HTMLVideoElement | null>(null)
  const remoteVideosRef = useRef<Map<string, HTMLVideoElement>>(new Map())
  const connectedPeers = useRef<Set<string>>(new Set())

  const [currMembers, setCurrentMembers] = useState<SocketUser[]>([])
  const [errorBanner, setErrorBanner] = useState<string | null>(null)

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
        stream.getTracks().forEach((track) => track.stop())
      } catch (err) {
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

    socket.on(SOCKET_EVENT_MEMBER_CHANGE, (members) => {
      members = members.filter((member: SocketUser) => member)
      setCurrentMembers(members)

      members.forEach(async (member: any) => {
        if (
          member.socketId !== socket.id &&
          !connectedPeers.current.has(member.socketId)
        ) {
          try {
            await webRTCService.createPeerConnection(
              member.socketId,
              (stream) => {
                const video = remoteVideosRef.current.get(member.socketId)
                if (video) {
                  video.srcObject = stream
                  video.play().catch((e) => {
                    console.log(e)
                    video.play()
                  })
                }
              }
            )
            connectedPeers.current.add(member.socketId)
          } catch (error) {
            // console.log(error)
          }
        }
      })
    })

    socket.on(SOCKET_EVENT_OFFER, async ({ offer, from }) => {
      try {
        await webRTCService.handleOffer(offer, from, (stream) => {
          const video = remoteVideosRef.current.get(from)
          if (video) {
            video.srcObject = stream
            video.play().catch((e) => {
              console.log(e)
              // throw new Error('Failed to play video')
              // setErrorBanner('Failed to connect to peer')
            })
          }
        })
        connectedPeers.current.add(from)
      } catch (error) {
        console.log(error)
        // setErrorBanner('Failed to connect to peer')
      }
    })

    socket.on(SOCKET_EVENT_ANSWER, async ({ answer, from }) => {
      try {
        await webRTCService.handleAnswer(answer, from)
      } catch (error) {
        console.log(error)
      }
    })

    socket.on(SOCKET_EVENT_ICE_CANDIDATE, async ({ candidate, from }) => {
      try {
        await webRTCService.handleIceCandidate(candidate, from)
      } catch (error) {
        console.log(error)
      }
    })

    initializeMedia()

    return () => {
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
  }, [socket, webRTCService, user, id])

  useEffect(() => {
    if (!isFirstRender || !webRTCService || !currMembers.length) return
    currMembers.forEach((member: SocketUser) => {
      if (!member.socketId) return
      webRTCService.createPeerConnection(member.socketId, (stream) => {
        if (!member.socketId) return
        const video = remoteVideosRef.current.get(member.socketId)
        if (video) {
          video.srcObject = stream
          video.play().catch((e) => {
            console.log(e)
            video.play()
          })
        }
      })
      connectedPeers.current.add(member.socketId)
      setIsFirstRender(false)
    })
  }, [currMembers])

  async function setRoom() {
    if (!id) return
    try {
      const roomToSet = await loadRoom(id)
      if (roomToSet.id !== currRoomId) setIsFirstRender(true)
    } catch (error) {
      showErrorMsg('Failed to set room details')
    }
  }

  const handleVideoRef = (element: HTMLVideoElement | null, userId: string) => {
    if (element) {
      remoteVideosRef.current.set(userId, element)
      element.autoplay = true
      element.playsInline = true

      element.onloadedmetadata = () => {
        const playPromise = element.play()
        if (playPromise) {
          playPromise.catch((e) => {
            console.log(e)
          })
        }
      }

      const existingVideo = remoteVideosRef.current.get(userId)
      if (existingVideo && existingVideo.srcObject) {
        element.srcObject = existingVideo.srcObject
        const playPromise = element.play()
        if (playPromise) {
          playPromise.catch((e) => {
            console.log(e)
          })
        }
      }
    }
  }

  async function initializeMedia() {
    try {
      if (!socketService || !webRTCService || !id || !user) return

      const stream = await webRTCService.getLocalStream()
      if (localVideoRef.current && stream) {
        localVideoRef.current.srcObject = stream
      }
      socketService.login({
        id: user.id,
        fullname: user.fullname,
        imgUrl: user.imgUrl,
      })
      socketService.joinRoom(id)
      setErrorBanner('')
    } catch (error) {
      setErrorBanner('Failed to access camera/microphone')
    }
  }

  return (
    <div className='room-page'>
      {errorBanner && (
        <div className='error-message'>
          <span>{errorBanner}</span>
          <IconButton onClick={initializeMedia}>
            <RestartAltIcon htmlColor='#fff' />
          </IconButton>
        </div>
      )}
      <div className='video-grid'>
        <div
          className={`video-container local ${
            prefs.isDarkMode ? 'dark-mode' : ''
          } ${room?.host_id === user?.id ? 'host' : ''}`}
        >
          <video ref={localVideoRef} autoPlay playsInline muted />
          <div className='label'>
            You{user?.id === room?.host_id ? ' (Host)' : ''}
          </div>
        </div>
        {currMembers
          .filter((member) => member.socketId !== socket.id && member.socketId)
          .map((member) => (
            <div
              key={member.socketId}
              className={`video-container ${
                room?.host_id === member?.id ? 'host' : ''
              } remote ${prefs.isDarkMode ? 'dark-mode' : ''}`}
            >
              <video
                ref={(element) => {
                  if (member.socketId) {
                    handleVideoRef(element, member.socketId)
                  }
                }}
              />
              <div className='label'>{`${member.fullname}${
                member?.id === room?.host_id ? ' (Host)' : ''
              }`}</div>
            </div>
          ))}
      </div>
      <div className={`room-info ${prefs.isDarkMode ? 'dark-mode' : ''}`}>
        {room && (
          <>
            <h1>{room.name}</h1>
            {room.host && (
              <p className='room-host'>Host: {room.host.fullname}</p>
            )}
            <p className='room-id'>
              Room ID: <span>{id}</span>
              <IconButton>
                <ContentCopyIcon htmlColor={prefs.isDarkMode ? '#fff' : ''} />
              </IconButton>
            </p>
            <p>Members: {currMembers.length}</p>
            <MembersList members={currMembers} />
          </>
        )}
      </div>
    </div>
  )
}
