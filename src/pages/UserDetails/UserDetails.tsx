import React from 'react'
import { useNavigate } from 'react-router-dom'
import { logout } from '../../store/actions/user.actios'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { IconButton } from '@mui/material'

import ModeEditIcon from '@mui/icons-material/ModeEdit'

export function UserDetails() {
  const navigate = useNavigate()
  const user = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.user
  )
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  if (!user)
    return (
      <div
        className={`user-details-container${
          prefs.isDarkMode ? ' dark-mode' : ''
        }`}
      >
        No user found.
      </div>
    )

  return (
    <div
      className={`user-details-container${
        prefs.isDarkMode ? ' dark-mode' : ''
      }`}
    >
      <div className='user-card'>
        <div className='img-container'>
          <img
            className='user-avatar'
            src={user.imgUrl || '/assets/img/user.png'}
            alt={user.fullname}
          />
          <div className='button-container'>
            <IconButton>
              <ModeEditIcon />
            </IconButton>
          </div>
        </div>
        <div className='user-info'>
          <h2 className='user-fullname'>{user.fullname}</h2>
          <p className='user-email'>{user.email}</p>
          {user.isGuest && <span className='user-guest'>Guest</span>}
        </div>
      </div>
      <button
        className='primary-button remove-button'
        onClick={() => {
          logout()
          navigate('/')
        }}
      >
        Logout
      </button>
    </div>
  )
}
