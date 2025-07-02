import { useEffect, useState, useRef } from 'react'
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
  SOCKET_EVENT_END_MEETING,
  SOCKET_EVENT_MEDIA_STATE_CHANGED,
  SOCKET_EVENT_CHANGE_MEDIA,
  SOCKET_EVENT_USER_LEFT,
} from '../../services/socket.service'

import { loadRoom } from '../../store/actions/room.actions'
import { RootState } from '../../store/store'
import { MembersList } from '../../components/MembersList/MembersList'
import { WebRTCService } from '../../services/webRTC/webRTC'
import { showErrorMsg, showSuccessMsg } from '../../services/event-bus.service'
import { IconButton } from '@mui/material'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import {
  setIsFirstRender,
  setIsLoading,
} from '../../store/actions/system.actions'
import { VideoStream } from '../../components/VideoStream/VideoStream'
import { LocalTracks } from '../../types/LocalTracks/LocalTracks'
import { TracksState } from '../../types/TracksState/TracksState'
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn'
import { RoomChat } from '../../components/RoomChat/RoomChat'
import { handleGuestMode } from '../../store/actions/user.actios'

export function RoomPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const room = useSelector(
    (stateSelector: RootState) => stateSelector.roomModule.room
  )

  // const currRoomId = useSelector(
  //   (stateSelector: RootState) => stateSelector.roomModule.currRoomId
  // )

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
  const [localTracks, setLocalTracks] = useState<LocalTracks>({
    video: null,
    audio: null,
  })

  const [currMembers, setCurrentMembers] = useState<SocketUser[]>([])
  const [errorBanner, setErrorBanner] = useState<string | null>(null)

  useEffect(() => {
    setRoom()
  }, [id])

  // useEffect(() => {
  // const testCamera = async () => {
  //   try {
  //     const stream = await navigator.mediaDevices.getUserMedia({
  //       video: true,
  //       audio: true,
  //     })
  //     stream.getTracks().forEach((track) => track.stop())
  //   } catch (err) {
  //     showErrorMsg(
  //       'Failed to access camera or microphone. Please check permissions.'
  //     )
  //   }
  // }
  // testCamera()
  // }, [])

  useEffect(() => {
    const newWebRTCService = new WebRTCService(socket)
    setWebRTCService(newWebRTCService)
  }, [user])

  useEffect(() => {
    if (!socketService || !webRTCService || !id || !user) return

    initializeMedia()
    addListeners()

    return () => {
      clearAllConnections()
    }
  }, [socket, webRTCService, user, id])

  useEffect(() => {
    const handleBeforeUnload = () => {
      socketService.leaveRoom(id)
      socketService.logout()
      if (webRTCService) webRTCService.closeAllConnections()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [id, webRTCService])

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
      setIsLoading(true)
      if (!user) {
        handleGuestMode()
      }
      await loadRoom(id)
      // const roomToSet = await loadRoom(id)

      // if (roomToSet.id !== currRoomId) setIsFirstRender(true)
    } catch (error) {
      showErrorMsg('Failed to set room details')
    } finally {
      setIsLoading(false)
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
            setIsLoading(true)
            await webRTCService.createPeerConnection(
              member.socketId,
              (stream) => {
                const videoTrack = stream.getVideoTracks()[0] || null
                const audioTrack = stream.getAudioTracks()[0] || null
                // console.log(videoTrack, audioTrack)
                const video = remoteVideosRef.current.get(member.socketId)
                if (video) {
                  video.srcObject = stream
                  video.play().catch(() => {
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
          } finally {
            setIsLoading(false)
          }
        }
      })
    })

    socket.on(SOCKET_EVENT_OFFER, async ({ offer, from }) => {
      try {
        setIsLoading(true)
        await webRTCService.handleOffer(offer, from, (stream) => {
          const video = remoteVideosRef.current.get(from)

          if (video) {
            video.srcObject = stream
            video.play().catch(() => {
              // console.log(e)
              // throw new Error('Failed to play video')
              // setErrorBanner('Failed to connect to peer')
            })
          }
        })
        connectedPeers.current.add(from)
        setErrorBanner('')
      } catch (error) {
        // console.log(error)
        setErrorBanner('Failed to connect to peer')
      } finally {
        setIsLoading(false)
      }
    })

    socket.on(SOCKET_EVENT_ANSWER, async ({ answer, from }) => {
      try {
        setIsLoading(true)
        await webRTCService.handleAnswer(answer, from)
        // setErrorBanner('')
      } catch (error) {
        // console.log(error)
        setErrorBanner('Failed to connect to peer')
      } finally {
        setIsLoading(false)
      }
    })

    socket.on(SOCKET_EVENT_ICE_CANDIDATE, async ({ candidate, from }) => {
      try {
        setIsLoading(true)
        await webRTCService.handleIceCandidate(candidate, from)
        // setErrorBanner('')
      } catch (error) {
        // console.log(error)
        // setErrorBanner('Failed to connect to peer')
      } finally {
        setIsLoading(false)
      }
    })
    socket.on(SOCKET_EVENT_USER_LEFT, (userId: string) => {
      console.log(userId)

      // Remove from members
      setCurrentMembers((prev) => prev.filter((member) => member.id !== userId))
      // Close peer connection
      if (webRTCService) webRTCService.closeConnection(userId)
      // Remove from connectedPeers
      connectedPeers.current.delete(userId)
    })
    socket.on(SOCKET_EVENT_END_MEETING, async () => {
      try {
        setIsLoading(true)
        clearAllConnections()
        navigate('/room')
        showSuccessMsg('Meeting ended')
        // setErrorBanner('')
      } catch (error) {
        // console.log(error)
        // setErrorBanner('Failed to connect to peer')
      } finally {
        setIsLoading(false)
      }
    })

    socket.on(SOCKET_EVENT_CHANGE_MEDIA, (updatedUser) => {
      const { id: userId } = updatedUser

      setCurrentMembers((prevMembers) =>
        prevMembers.map((member) => {
          return member.id === userId
            ? {
                ...member,
                isVideoOn: updatedUser.isVideoOn,
                isAudioOn: updatedUser.isAudioOn,
              }
            : member
        })
      )
    })
  }

  async function initializeMedia(
    isRestart: boolean = false,
    isMuted: boolean = false
  ) {
    try {
      if (!socketService || !webRTCService || !id || !user) return
      setIsLoading(true)

      if (isRestart) {
        // clearAllConnections()
      }

      const stream = await webRTCService.getLocalStream()

      const videoTrack = stream.getVideoTracks()[0] || null
      const audioTrack = stream.getAudioTracks()[0] || null

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
    } finally {
      setIsLoading(false)
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
      setIsLoading(true)

      emitMediaStateChange(id, user.id, stateToSet.video, stateToSet.audio)
    } catch (error) {
      // console.error('Error disabling media:', error)
      setErrorBanner('Failed to disable media')
    } finally {
      setIsLoading(false)
    }
  }

  function clearAllConnections() {
    socket.off(SOCKET_EVENT_MEMBER_CHANGE)
    socket.off(SOCKET_EVENT_OFFER)
    socket.off(SOCKET_EVENT_ANSWER)
    socket.off(SOCKET_EVENT_ICE_CANDIDATE)
    socket.off(SOCKET_EVENT_END_MEETING)
    socket.off(SOCKET_EVENT_MEDIA_STATE_CHANGED)

    if (webRTCService) {
      webRTCService.closeAllConnections()
    }
    socketService.leaveRoom(id)
    connectedPeers.current.clear()
  }

  function emitMediaStateChange(
    roomId: string,
    userId: string,
    isVideo: boolean,
    isAudio: boolean
  ) {
    socket.emit(SOCKET_EVENT_MEDIA_STATE_CHANGED, {
      roomId,
      userId,
      stateToChange: {
        isVideo,
        isAudio,
      },
    })
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
                      .catch(() => {
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
