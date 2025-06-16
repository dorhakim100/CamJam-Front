import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import SendIcon from '@mui/icons-material/Send'
import { IconButton } from '@mui/material'
import { MessagesList } from '../MessagesList/MessagesList'

export function RoomChat() {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  return (
    <div className={`chat-container ${prefs.isDarkMode ? 'dark-mode' : ''}`}>
      <MessagesList messages={messages} />

      <div className='input-container'>
        <input
          type='text'
          placeholder='Type a message...'
          className='chat-input'
        />
        <IconButton>
          <SendIcon />
        </IconButton>
      </div>
    </div>
  )
}

//  later be replaced with actual chat messages
const messages = [
  {
    id: 1,
    text: 'Hey! How’s it going?',
    userImg: 'https://i.pravatar.cc/40?img=1',
    isMe: false,
  },
  {
    id: 2,
    text: 'All good, just working on a chat feature.',
    userImg: 'https://i.pravatar.cc/40?img=2',
    isMe: true,
  },
  {
    id: 3,
    text: 'Nice! Let me know if you need help.',
    userImg: 'https://i.pravatar.cc/40?img=1',
    isMe: false,
  },
]
