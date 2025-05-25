import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import { socketService } from '../../services/socket.service'

import { loadRoom } from '../../store/actions/room.actions'

import { RootState } from '../../store/store'

export function RoomPage() {
  const { id } = useParams()

  const room = useSelector(
    (stateSelector: RootState) => stateSelector.roomModule.room
  )

  console.log(room)

  useEffect(() => {
    if (!id) return
    const handleJoinRoom = async (data: any) => {
      await loadRoom(id)
      console.log('Joined room:', data)
    }
    handleJoinRoom(id)
    socketService.joinRoom(id)
    return () => {
      socketService.leaveRoom(id)
      console.log('Left room:', id)
    }
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
        />
      </div>
    </div>
  )
}
