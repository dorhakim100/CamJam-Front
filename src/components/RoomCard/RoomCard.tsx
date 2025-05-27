import React from 'react'
import { useSelector } from 'react-redux'
import { Room } from '../../types/room/Room'
import { RootState } from '../../store/store'
import { Button } from '@mui/material'

export function RoomCard({ room }: { room: Room }) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  return (
    <div
      className={`room-card-container ${prefs.isDarkMode ? 'dark-mode' : ''}`}
    >
      <div className={`room-card ${prefs.isDarkMode ? 'dark-mode' : ''}`}>
        <h3 className='room-name'>{room.name}</h3>

        <span className='room-host'>Host: {room.host.fullname}</span>
        <span className='room-created-at'>
          Created at: {new Date(room.created_at).toLocaleString()}
        </span>
        <Button variant='contained'>Join</Button>
      </div>
    </div>
  )
}
