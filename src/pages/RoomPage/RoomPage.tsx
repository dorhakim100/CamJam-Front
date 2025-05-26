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

  const [currMembers, setCurrentMembers] = React.useState<SocketUser[]>([])

  useEffect(() => {
    if (!id || !user) return
    socketService.on(SOCKET_EVENT_MEMBER_CHANGE, (members: SocketUser[]) => {
      members = members.filter((member) => member)
      setCurrentMembers(members)
      // e.g. setParticipants(prev => [...prev, userId]);
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
    <div className='main room-page'>
      <div className='video-container'>
        <video
          // ref={videoRef}
          className='room-video'
          autoPlay
          playsInline
          muted
          src='https://www.w3schools.com/html/mov_bbb.mp4' // Placeholder video
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
