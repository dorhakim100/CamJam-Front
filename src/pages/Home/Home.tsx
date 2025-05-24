import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import { RootState } from '../../store/store'
import { ClockTime } from '../../components/ClockTime/ClockTime'

export function Home() {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const buttons = [
    {
      label: 'New meeting',
      action: () => console.log('Button 1 clicked'),
      id: 'new-meeting-button',
    },
    {
      label: 'Join',
      action: () => console.log('Button 2 clicked'),
      id: 'join-button',
    },
  ]

  return (
    <div className='home-container'>
      <ClockTime />
      <div className='buttons-container'>
        {buttons.map((button) => (
          <button
            key={button.id}
            className='home-button'
            onClick={button.action}
          >
            {button.label}
          </button>
        ))}
      </div>
    </div>
  )
}
