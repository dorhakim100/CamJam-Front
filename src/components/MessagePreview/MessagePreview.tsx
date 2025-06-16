import React from 'react'

export function MessagePreview({ message }: { message: any }) {
  return (
    <li
      key={message.id}
      className={`message-container ${message.isMe ? 'me' : ''}`}
    >
      <img className='user-image' src={message.userImg} alt='user' />
      <span className='message-text'>{message.text}</span>
    </li>
  )
}
