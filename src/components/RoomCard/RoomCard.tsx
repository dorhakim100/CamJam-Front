import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Room } from '../../types/room/Room'
import { RootState } from '../../store/store'
import { Button } from '@mui/material'
import HttpsIcon from '@mui/icons-material/Https';

export function RoomCard({ room, setIsPasswordModal, setCurrPasswordModal }: { room: Room, setIsPasswordModal: (isOpen: boolean) => void, setCurrPasswordModal: (currPasswordModal: {roomId: string, password: string} | null) => void }) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const navigate = useNavigate()

  return (
    <div
      className={`room-card-container ${prefs.isDarkMode ? 'dark-mode' : ''}`}
    >
      <div className={`room-card ${prefs.isDarkMode ? 'dark-mode' : ''}`}>
      {room.is_private && room.password && (
        <HttpsIcon className='private-icon' />
      )}
        <h3 className='room-name'>{room.name}</h3>

        <span className='room-host'>Host: {room.host.fullname}</span>
        <span className='room-created-at'>
          Created at: {new Date(room.created_at).toLocaleString()}
        </span>
        <button
          className='primary-button'
          onClick={() => {
            if(!room.is_private && !room.password) navigate(`/room/${room.id}`)
            else {
              setIsPasswordModal(true)

              setCurrPasswordModal({roomId: room.id, password: room.password || ''})
            } 
          }}
        >
          Join
        </button>
      </div>
    </div>
  )
}
