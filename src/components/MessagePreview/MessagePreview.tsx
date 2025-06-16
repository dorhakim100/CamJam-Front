import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'

export function MessagePreview({ message }: { message: any }) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  return (
    <li
      key={message.id}
      className={`message-container ${message.isMe ? 'me' : ''} ${
        prefs.isDarkMode ? 'dark-mode' : ''
      }`}
    >
      <span className='user-name'>
        {message.isMe ? 'You' : message.userName || 'Unknown User'}
      </span>
      <img className='user-image' src={message.userImg} alt='user' />
      <span className='message-text'>{message.text}</span>
    </li>
  )
}
