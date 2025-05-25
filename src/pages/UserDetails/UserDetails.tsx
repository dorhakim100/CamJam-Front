import React from 'react'
import { useNavigate } from 'react-router-dom'
import { logout } from '../../store/actions/user.actios'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'

export function UserDetails() {
  const navigate = useNavigate()
  const user = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.user
  )
  return (
    <div>
      UserDetails
      <button
        onClick={() => {
          if (!user) return
          logout()
          navigate('/')
        }}
        style={{ color: '#fff' }}
      >
        Logout
      </button>
    </div>
  )
}
