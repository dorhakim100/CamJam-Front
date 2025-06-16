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
    username: 'Alice',
    isMe: false,
  },
  {
    id: 2,
    text: 'All good, just working on a chat feature.',
    userImg: 'https://i.pravatar.cc/40?img=2',
    username: 'You',
    isMe: true,
  },
  {
    id: 3,
    text: 'Nice! Let me know if you need help.',
    userImg: 'https://i.pravatar.cc/40?img=1',
    username: 'Alice',
    isMe: false,
  },
  {
    id: 4,
    text: 'Actually yeah — do you know how to style message tails in SASS?',
    userImg: 'https://i.pravatar.cc/40?img=2',
    username: 'You',
    isMe: true,
  },
  {
    id: 5,
    text: 'Definitely! Want a triangle or something more like Telegram?',
    userImg: 'https://i.pravatar.cc/40?img=1',
    username: 'Alice',
    isMe: false,
  },
  {
    id: 6,
    text: 'More like Telegram. Smooth and modern.',
    userImg: 'https://i.pravatar.cc/40?img=2',
    username: 'You',
    isMe: true,
  },
  {
    id: 7,
    text: 'Got it. Let me find a sample snippet for you.',
    userImg: 'https://i.pravatar.cc/40?img=1',
    username: 'Alice',
    isMe: false,
  },
  {
    id: 8,
    text: 'Thanks! I’ll adapt it to my dark mode setup too.',
    userImg: 'https://i.pravatar.cc/40?img=2',
    username: 'You',
    isMe: true,
  },
  {
    id: 9,
    text: 'You’re building this whole chat from scratch?',
    userImg: 'https://i.pravatar.cc/40?img=3',
    username: 'Ben',
    isMe: false,
  },
  {
    id: 10,
    text: 'Yeah, front and back. I like having full control.',
    userImg: 'https://i.pravatar.cc/40?img=2',
    username: 'You',
    isMe: true,
  },
  {
    id: 11,
    text: 'Respect. Are you deploying it too?',
    userImg: 'https://i.pravatar.cc/40?img=3',
    username: 'Ben',
    isMe: false,
  },
  {
    id: 12,
    text: 'Eventually yeah — Socket.IO on the backend, MongoDB for storage.',
    userImg: 'https://i.pravatar.cc/40?img=2',
    username: 'You',
    isMe: true,
  },
  {
    id: 13,
    text: 'I’m following this thread and learning a lot, thanks!',
    userImg: 'https://i.pravatar.cc/40?img=4',
    username: 'Dana',
    isMe: false,
  },
]
