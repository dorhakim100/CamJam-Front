import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import {
  socketService,
  SocketUser,
  SOCKET_EVENT_MEMBER_CHANGE,
} from '../../services/socket.service'

import { loadRoom } from '../../store/actions/room.actions'

import { RootState } from '../../store/store'
import { User } from '../../types/user/User'
import { MembersList } from '../../components/MembersList/MembersList'

export function RoomPage() {
  const { id } = useParams()

  const room = useSelector(
    (stateSelector: RootState) => stateSelector.roomModule.room
  )

  const user = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.user
  )

  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const localVideoRef = React.useRef<HTMLVideoElement | null>(null)
  const localStreamRef = React.useRef<MediaStream | null>(null)

  const [currMembers, setCurrentMembers] = React.useState<SocketUser[]>([])

  useEffect(() => {
    if (!id || !user) return
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localStreamRef.current = stream
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
        }
      })
      .catch((error) => {
        console.error('Error accessing media devices:', error)
      })
    socketService.on(SOCKET_EVENT_MEMBER_CHANGE, (members: SocketUser[]) => {
      members = members.filter((member) => member)
      setCurrentMembers(members)
    })
    const handleJoinRoom = async (data: any) => {
      await loadRoom(id)
      // console.log('Joined room:', data)
    }
    handleJoinRoom(id)
    socketService.joinRoom(id)
    const socketUser = {
      id: user.id,
      fullname: user.fullname,
      imgUrl: user.imgUrl,
    }
    socketService.login(socketUser)
    return () => {
      socketService.leaveRoom(id)
      // console.log('Left room:', id)
    }
  }, [id])

  useEffect(() => {
    // when someone joins
    // cleanup
    // return () => {
    //   socketService.off(SOCKET_EVENT_MEMBER_CHANGE)
    // }
  }, [id])

  return (
    <div className={`main ${prefs.isDarkMode ? 'dark-mode' : ''} room-page`}>
      <div className='video-container'>
        <video
          ref={(e) => {
            localVideoRef.current = e
            if (e) {
              e.srcObject = localStreamRef.current
            }
          }}
          className='room-video'
          autoPlay
          playsInline
          muted
        />
      </div>
      <div className='room-info'>
        <h1>{room?.name || 'Loading...'}</h1>
        <p>Room ID: {id}</p>
        <p>Host: {room?.host_id || 'Loading...'}</p>
        {/* <p>Created at: {room?.created_at || 'Loading...'}</p> */}
        <p>Members: {currMembers.length || 0}</p>
        <MembersList members={currMembers} />
        {/* <p>Status: {room?.is_private ? 'Private' : 'Public'}</p> */}
      </div>
    </div>
  )
}
