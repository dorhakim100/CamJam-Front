import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import { RootState } from '../../store/store'
import { ClockTime } from '../../components/ClockTime/ClockTime'

import { BsFillCameraVideoFill } from 'react-icons/bs'
import { BsPlusSquareFill } from 'react-icons/bs'

export function Home() {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const buttons = [
    {
      label: 'New meeting',
      action: () => console.log('Button 1 clicked'),
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

  return (
    <div className='home-container'>
      <ClockTime />
      <div className='buttons-container'>
        {buttons.map((button) => (
          <div
            className={`button-container ${
              prefs.isDarkMode ? 'dark-mode' : ''
            }`}
          >
            <button
              key={button.id}
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
