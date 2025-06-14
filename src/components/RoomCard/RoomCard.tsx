import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Room } from '../../types/room/Room'
import { RootState } from '../../store/store'
import { Button } from '@mui/material'

export function RoomCard({ room }: { room: Room }) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const navigate = useNavigate()

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
        <button
          className='primary-button'
          onClick={() => {
            navigate(`/room/${room.id}`)
          }}
        >
          Join
        </button>
      </div>
    </div>
  )
}
