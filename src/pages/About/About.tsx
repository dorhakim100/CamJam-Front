import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

import logo from '../../../public/logo.png'
import logoDark from '../../../public/logo-dark.png'
import { RootState } from '../../store/store'

export function About() {
  const navigate = useNavigate()

  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const [currentLogo, setCurrentLogo] = useState(logo)

  useEffect(() => {
    setCurrentLogo(prefs.isDarkMode ? logoDark : logo)
  }, [prefs.isDarkMode])

  const navigateToHome = () => {
    navigate('/')
  }

  return (
    <section className='about-container'>
      <div className='about-card'>
        <img src={currentLogo} alt='CamJam' />
        {/* <h1>About CamJam</h1> */}
        <p>
          <strong>CamJam</strong> is your modern, friendly platform for seamless
          video rooms and collaboration. Whether you want to connect with
          friends, host a meeting, or join a vibrant community, CamJam makes it
          easy and fun.
        </p>
        <ul className='about-features'>
          <li>Effortless video rooms for any occasion</li>
          <li>Secure and private connections</li>
          <li>Real-time chat and messaging</li>
          <li>Beautiful light & dark modes</li>
          <li>Fast, responsive, and easy to use</li>
        </ul>
        <div className='about-cta'>
          {/* <p>
            Ready to get started?{' '}
            <span role='img' aria-label='rocket'>
              🚀
            </span>
          </p> */}

          <button className='primary-button' onClick={navigateToHome}>
            Start Communicating
          </button>
        </div>
      </div>
    </section>
  )
}
