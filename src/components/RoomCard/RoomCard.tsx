import React from 'react'
import { Room } from '../../types/room/Room'

export function RoomCard({ room }: { room: Room }) {
  console.log('room', room)

  return (
    <div className='room-card-container'>
      <div className='room-card'>
        <h3 className='room-name'>{room.name}</h3>

        <span className='room-host'>Host: {room.host_id}</span>
        <span className='room-created-at'>
          Created at: {new Date(room.created_at).toLocaleString()}
        </span>
      </div>
    </div>
  )
}
