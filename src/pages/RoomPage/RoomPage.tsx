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
import { createWebRTCService } from '../../services/webRTC/webRTC3'
import { showErrorMsg, showSuccessMsg } from '../../services/event-bus.service'
import { Button, IconButton } from '@mui/material'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { setIsFirstRender } from '../../store/actions/system.actions'
import { VideoStream } from '../../components/VideoStream/VideoStream'
import { LocalTracks } from '../../types/LocalTracks/LocalTracks'
import { TracksState } from '../../types/TracksState/TracksState'
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn'
import { Room } from '../../types/room/Room'
import { RoomChat } from '../../components/RoomChat/RoomChat'

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

  // const [webRTCService, setWebRTCService] = useState<WebRTCService | null>(null)
  const [webRTCService, setWebRTCService] = useState<any>(null)
  const localVideoRef = useRef<HTMLVideoElement | null>(null)
  const remoteVideosRef = useRef<Map<string, HTMLVideoElement>>(new Map())

  const connectedPeers = useRef<Set<string>>(new Set())
  const [localTracks, setLocalTracks] = useState<LocalTracks>({
    video: null,
    audio: null,
  })

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
    // testCamera()
  }, [])

  useEffect(() => {
    // const newWebRTCService = new WebRTCService(socket)
    const newWebRTCService = createWebRTCService(socket)
    setWebRTCService(newWebRTCService)
  }, [])

  useEffect(() => {
    if (!socketService || !webRTCService || !id || !user) return

    initializeMedia()
    addListeners()

    return () => {
      clearAllConnections()
    }
  }, [socket, webRTCService, user, id])

  useEffect(() => {
    if (!isFirstRender || !webRTCService || !currMembers.length) return
    currMembers.forEach((member: SocketUser) => {
      if (!member.socketId) return
      webRTCService.createPeerConnection(
        member.socketId,
        (stream: MediaStream) => {
          if (!member.socketId) return
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
      setIsFirstRender(false)
    })
  }, [currMembers])

  async function setRoom() {
    if (!id) return
    try {
      const roomToSet = await loadRoom(id)
      // if (roomToSet.id !== currRoomId) setIsFirstRender(true)
    } catch (error) {
      showErrorMsg('Failed to set room details')
    }
  }

  async function addListeners() {
    if (!socketService || !webRTCService || !id || !user) return

    socket.on(SOCKET_EVENT_MEMBER_CHANGE, (members) => {
      members = members.filter((member: SocketUser) => member)
      setCurrentMembers(members)

      // console.log('bla')

      members.forEach(async (member: any) => {
        if (
          member.socketId !== socket.id
          //  && !connectedPeers.current.has(member.socketId)
        ) {
          if (connectedPeers.current.has(member.socketId)) {
            connectedPeers.current.delete(member.socketId)
          }
          try {
            await webRTCService.createPeerConnection(
              member.socketId,
              (stream: MediaStream) => {
                const videoTrack = stream.getVideoTracks()[0] || null
                const audioTrack = stream.getAudioTracks()[0] || null
                console.log(videoTrack, audioTrack)
                const video = remoteVideosRef.current.get(member.socketId)
                if (video) {
                  video.srcObject = stream
                  video.play().catch((e) => {
                    // console.log(e)
                    // video.play()
                  })
                }
              }
            )
            connectedPeers.current.add(member.socketId)
            setErrorBanner('')
          } catch (error) {
            // console.log(error)
          }
        }
      })
    })

    socket.on(SOCKET_EVENT_OFFER, async ({ offer, from }) => {
      try {
        await webRTCService.handleOffer(offer, from, (stream: MediaStream) => {
          const video = remoteVideosRef.current.get(from)

          if (video) {
            video.srcObject = stream
            video.play().catch((e) => {
              // console.log(e)
              throw new Error('Failed to play video')
              // setErrorBanner('Failed to connect to peer')
            })
          }
        })
        connectedPeers.current.add(from)
        setErrorBanner('')
      } catch (error) {
        // console.log(error)
        setErrorBanner('Failed to connect to peer')
      }
    })

    socket.on(SOCKET_EVENT_ANSWER, async ({ answer, from }) => {
      try {
        await webRTCService.handleAnswer(answer, from)
        // setErrorBanner('')
      } catch (error) {
        // console.log(error)
        setErrorBanner('Failed to connect to peer')
      }
    })

    socket.on(SOCKET_EVENT_ICE_CANDIDATE, async ({ candidate, from }) => {
      try {
        await webRTCService.handleIceCandidate(candidate, from)
        // setErrorBanner('')
      } catch (error) {
        // console.log(error)
        // setErrorBanner('Failed to connect to peer')
      }
    })
  }

  async function initializeMedia(
    isRestart: boolean = false,
    isMuted: boolean = false
  ) {
    try {
      if (!socketService || !webRTCService || !id || !user) return
      // socketService.leaveRoom(id)
      // socketService.logout()
      if (isRestart) {
        clearAllConnections()
      }

      const stream = await webRTCService.getLocalStream()
      // console.log('stream', stream)

      const videoTrack = stream.getVideoTracks()[0] || null
      const audioTrack = stream.getAudioTracks()[0] || null
      // console.log(localVideoRef, videoTrack, audioTrack)

      if (localVideoRef.current && stream) {
        localVideoRef.current.srcObject = stream
        setLocalTracks({
          video: videoTrack,
          audio: audioTrack,
        })
      }
      socketService.login({
        id: user.id,
        fullname: user.fullname,
        imgUrl: user.imgUrl,
        isVideoOn: videoTrack ? true : false,
        isAudioOn: !isMuted || audioTrack ? true : false,
      })
      socketService.joinRoom(id)
      if (isRestart) addListeners()
      setErrorBanner('')
    } catch (error) {
      setErrorBanner('Failed to access camera/microphone')
    }
  }

  async function toggleMedia(stateToSet: TracksState): Promise<void> {
    try {
      if (
        !localTracks ||
        !localVideoRef.current ||
        !webRTCService ||
        !user ||
        !id
      )
        return
      socketService.leaveRoom(id)
      socketService.logout()
      // clearAllConnections()

      let type = ''

      if (!stateToSet.video) {
        type = 'video'
      } else type = 'audio'

      const stream = await webRTCService.disableLocalStream(type)

      const videoTrack = stream.getVideoTracks()[0] || null
      const audioTrack = stream.getAudioTracks()[0] || null
      console.log(videoTrack, audioTrack)

      if (localVideoRef.current && stream) {
        localVideoRef.current.srcObject = stream
        setLocalTracks({
          video: videoTrack,
          audio: audioTrack,
        })
      }

      socketService.login({
        id: user.id,
        fullname: user.fullname,
        imgUrl: user.imgUrl,
        isVideoOn: videoTrack ? true : false,
        // isAudioOn: audioTrack ? true : false,
        isAudioOn: stateToSet.audio ? true : false,
      })
      socketService.joinRoom(id)
      // addListeners()
    } catch (error) {
      console.error('Error disabling media:', error)
      setErrorBanner('Failed to disable media')
    }
  }

  function clearAllConnections() {
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

  // if(isPasswordModal && room) return <PasswordModal room={room} setIsPasswordModal={setIsPasswordModal}/>
  return (
    <div className='room-page'>
      <IconButton
        className='close-button'
        onClick={() => {
          navigate('/room')
        }}
      >
        <KeyboardReturnIcon htmlColor={prefs.isDarkMode ? '#fff' : ''} />
      </IconButton>
      {errorBanner && (
        <div className='error-message'>
          <span>{errorBanner}</span>
          <IconButton
            onClick={() => {
              clearAllConnections()
              initializeMedia()
              addListeners()
            }}
          >
            <RestartAltIcon htmlColor='#fff' />
          </IconButton>
        </div>
      )}
      <div className='video-grid'>
        <VideoStream
          member={{
            socketId: socket.id,
            id: user?.id || '',
            fullname: user?.fullname || '',
            imgUrl: user?.imgUrl || '',
            isVideoOn: localTracks.video ? true : false,
            isAudioOn: localTracks.audio ? true : false,
          }}
          remoteVideosRef={remoteVideosRef}
          localVideoRef={localVideoRef}
          isRemote={false}
          isHost={user?.id === room?.host_id}
          label={` You${user?.id === room?.host_id ? ' (Host)' : ''}`}
          localTracks={localTracks}
          toggleMedia={toggleMedia}
          initializeMedia={initializeMedia}
        />
        {currMembers
          .filter((member) => member.socketId !== socket.id && member.socketId)
          .map((member) => (
            <VideoStream
              member={member}
              remoteVideosRef={remoteVideosRef}
              isRemote={true}
              isHost={member.id === room?.host_id}
              label={`${member.fullname}${
                member?.id === room?.host_id ? ' (Host)' : ''
              }`}
              tracksState={{
                video: member.isVideoOn,
                audio: member.isAudioOn,
              }}
            />
          ))}
      </div>
      <div
        className={`room-info-chat-container ${
          prefs.isDarkMode ? 'dark-mode' : ''
        }`}
      >
        <h1>{room?.name}</h1>
        {room && (
          <div className='room-interface'>
            <div className={`room-info ${prefs.isDarkMode ? 'dark-mode' : ''}`}>
              {room.host && (
                <p className='room-host'>Host: {room.host.fullname}</p>
              )}
              <div className='room-id'>
                <p>Room ID</p>
                <IconButton
                  onClick={() => {
                    navigator.clipboard
                      .writeText(room.id)
                      .then(() => {
                        showSuccessMsg('ID copied successfully')
                      })
                      .catch((err) => {
                        // console.log(err);

                        showErrorMsg(`Couldn't copy id`)
                      })
                  }}
                >
                  <ContentCopyIcon htmlColor={prefs.isDarkMode ? '#fff' : ''} />
                </IconButton>

                <span>{id}</span>
              </div>
              <p>Members: {currMembers.length}</p>
            </div>
            <MembersList members={currMembers} />
            <RoomChat />
          </div>
        )}
      </div>
    </div>
  )
}
