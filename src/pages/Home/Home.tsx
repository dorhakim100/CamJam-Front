import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import Clock from 'react-clock'

import 'react-clock/dist/Clock.css'
import { RootState } from '../../store/store'

export function Home() {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const [dateValue, setDateValue] = useState(new Date())
  const [timeString, setTimeString] = useState(
    new Date().toLocaleTimeString('he', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  )
  const [dateString, setDateString] = useState(
    new Date().toLocaleDateString('eng', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
  )

  useEffect(() => {
    const interval = setInterval(() => {
      const date = new Date()
      const string = date.toLocaleTimeString('he', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
      setTimeString(string)
      setDateValue(date)
    }, 1000)

    return () => {
      clearInterval(interval)
    }
  }, [])

  return (
    <div className='home-container'>
      <div className='times-container'>
        <div className='time-date-container'>
          <span className='time'>{timeString}</span>
          <span className='date'>{dateString}</span>
        </div>
        <div
          className={`clock-container ${prefs.isDarkMode ? 'dark-clock' : ''}`}
        >
          <Clock value={dateValue} />
        </div>
      </div>
    </div>
  )
}
