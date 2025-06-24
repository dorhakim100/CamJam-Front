import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import { RootState } from '../../store/store'
import { ClockTime } from '../../components/ClockTime/ClockTime'

import { BsFillCameraVideoFill } from 'react-icons/bs'
import { BsPlusSquareFill } from 'react-icons/bs'
import { showErrorMsg, showSuccessMsg } from '../../services/event-bus.service'
import { s } from 'framer-motion/client'
import { RoomToAdd } from '../../types/roomToAdd/RoomToAdd'
import { saveRoom, setNewRoomModal } from '../../store/actions/room.actions'
import { handleGuestMode } from '../../store/actions/user.actios'

export function Home() {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const user = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.user
  )

  const buttons = [
    {
      label: 'New meeting',
      // action: () => createRoom(),
      action: () => setNewRoomModal(true),
      id: 'new-meeting-button',
      icon: <BsFillCameraVideoFill className='icon' />,
      color: '#F26D21',
    },
    {
      label: 'Join',
      action: () => console.log('Button 2 clicked'),
      id: 'join-button',
      icon: <BsPlusSquareFill className='icon' />,
      color: '#2D8CFF',
    },
  ]

  useEffect(() => {
    if (!user) handleGuestMode()
  }, [])

  const createRoom = async () => {
    if (!user) {
      showErrorMsg('You must be signed in to create a room')
      return
    }

    try {
      const room = {
        host_id: user.id,
        name: 'New Room',
        is_private: false,
        created_at: new Date(),
      }

      const saved = await saveRoom(room)

      console.log(saved)
      showSuccessMsg('Room created successfully')
    } catch (err) {
      showErrorMsg('Failed to create room')
    }
  }

  return (
    <div className='home-container'>
      <ClockTime />
      <div className='buttons-container'>
        {buttons.map((button) => (
          <div
            className={`button-container ${
              prefs.isDarkMode ? 'dark-mode' : ''
            }`}
            key={button.id}
          >
            <button
              className='home-button'
              onClick={button.action}
              style={{ backgroundColor: button.color }}
            >
              {button.icon}
            </button>
            <span>{button.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
