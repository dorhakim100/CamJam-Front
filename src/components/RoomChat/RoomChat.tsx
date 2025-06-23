import React, { useRef, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import SendIcon from '@mui/icons-material/Send'
import { IconButton } from '@mui/material'
import { MessagesList } from '../MessagesList/MessagesList'
import { showErrorMsg, showSuccessMsg } from '../../services/event-bus.service'
import { Message } from '../../types/Message/Message'
import { MessageToAdd } from '../../types/messageToAdd/MessageToAdd'
import { loadRoom, sendMessage } from '../../store/actions/room.actions'
import { userService } from '../../services/user/user.service'
import { Chat } from '../../types/chat/Chat'

export function RoomChat() {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const room = useSelector(
    (stateSelector: RootState) => stateSelector.roomModule.room
  )

  const user = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.user
  )

  const textAreaRef = useRef<HTMLTextAreaElement | null>(null)
  const messagesListRef = useRef<HTMLUListElement | null>(null)

  const [messages, setMessages] = useState<Message[]>([])

  useEffect(() => {
    if (!room?.chat) return

    loadMessages()
  }, [room?.id])

  useEffect(() => {
    smoothScrollToBottom()
  }, [messages])

  const handleInputChange = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const elMessagesList = messagesListRef.current
    const textarea = textAreaRef.current
    if (!textarea) return

    const maxHeight = 115

    textarea.style.height = 'auto'
    const newHeight = Math.min(textarea.scrollHeight, maxHeight)

    textarea.style.height = `${newHeight}px`

    if (!elMessagesList) return

    let newMessageListPadding

    textarea.scrollHeight < 66
      ? (newMessageListPadding = '5em')
      : (newMessageListPadding = `calc(${newHeight}px + 2em)`)

    elMessagesList.style.paddingBottom = newMessageListPadding

    // elMessagesList?.scrollTo({
    //   top: elMessagesList.scrollHeight,
    //   behavior: 'smooth',
    // })
    // smoothScrollToBottom()
  }

  function smoothScrollToBottom() {
    const elMessagesList = messagesListRef.current

    if (elMessagesList) {
      elMessagesList.scrollTo({
        top: elMessagesList.scrollHeight + 200,

        behavior: 'smooth',
      })
      // elMessagesList.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleSend = async () => {
    try {
      if (
        !textAreaRef.current ||
        textAreaRef.current.value === '' ||
        !user ||
        !room ||
        !room.chat
      ) {
        showErrorMsg(`Couldn't send message`)
        return
      }
      const messageToSend: MessageToAdd = {
        fromId: user.id,
        content: textAreaRef.current.value,
        sentAt: new Date(),
        roomId: room.id,
        chatId: room.chat._id,
      }

      const savedMessage = await sendMessage(messageToSend, room)
      // console.log(savedMessage)
      const updatedRoom = await loadRoom(room.id)

      loadMessages(updatedRoom)

      textAreaRef.current.value = ''
      // showSuccessMsg('Message sent')
    } catch (err) {
      console.log(err)
      showErrorMsg(`Couldn't send message`)
    }
  }

  function _modifyIsMe(messages: Message[]) {
    return messages.map((message: Message) => {
      if (message.user)
        return {
          ...message,
          user: {
            ...message.user,
            isMe: message.user.id === user?.id ? true : false,
          },
        }
      else
        return {
          ...message,
          user: { ...userService.getEmptyUser(), isMe: false },
        }
    })
  }

  function loadMessages(roomToSet = room) {
    if (!roomToSet?.chat) return
    const modifiedMessages = _modifyIsMe([...roomToSet.chat.messages])

    setMessages(modifiedMessages)
  }

  return (
    <div className={`chat-container ${prefs.isDarkMode ? 'dark-mode' : ''}`}>
      <MessagesList messages={messages} messagesListRef={messagesListRef} />

      <div className='input-container'>
        <textarea
          placeholder='Type a message...'
          className='chat-input'
          rows={1}
          ref={textAreaRef}
          onInput={handleInputChange}
        />
        {/* <input
          type='text'
          placeholder='Type a message...'
          className='chat-input'
        /> */}
        <IconButton onClick={handleSend}>
          <SendIcon />
        </IconButton>
      </div>
    </div>
  )
}

//  later be replaced with actual chat messages
// const messages = [
//   {
//     id: 1,
//     text: 'Hey! How’s it going?',
//     userImg: 'https://i.pravatar.cc/40?img=1',
//     username: 'Alice',
//     isMe: false,
//   },
//   {
//     id: 2,
//     text: 'All good, just working on a chat feature.',
//     userImg: 'https://i.pravatar.cc/40?img=2',
//     username: 'You',
//     isMe: true,
//   },
//   {
//     id: 3,
//     text: 'Nice! Let me know if you need help.',
//     userImg: 'https://i.pravatar.cc/40?img=1',
//     username: 'Alice',
//     isMe: false,
//   },
//   {
//     id: 4,
//     text: 'Actually yeah — do you know how to style message tails in SASS?',
//     userImg: 'https://i.pravatar.cc/40?img=2',
//     username: 'You',
//     isMe: true,
//   },
//   {
//     id: 5,
//     text: 'Definitely! Want a triangle or something more like Telegram?',
//     userImg: 'https://i.pravatar.cc/40?img=1',
//     username: 'Alice',
//     isMe: false,
//   },
//   {
//     id: 6,
//     text: 'More like Telegram. Smooth and modern.',
//     userImg: 'https://i.pravatar.cc/40?img=2',
//     username: 'You',
//     isMe: true,
//   },
//   {
//     id: 7,
//     text: 'Got it. Let me find a sample snippet for you.',
//     userImg: 'https://i.pravatar.cc/40?img=1',
//     username: 'Alice',
//     isMe: false,
//   },
//   {
//     id: 8,
//     text: 'Thanks! I’ll adapt it to my dark mode setup too.',
//     userImg: 'https://i.pravatar.cc/40?img=2',
//     username: 'You',
//     isMe: true,
//   },
//   {
//     id: 9,
//     text: 'You’re building this whole chat from scratch?',
//     userImg: 'https://i.pravatar.cc/40?img=3',
//     username: 'Ben',
//     isMe: false,
//   },
//   {
//     id: 10,
//     text: 'Yeah, front and back. I like having full control.',
//     userImg: 'https://i.pravatar.cc/40?img=2',
//     username: 'You',
//     isMe: true,
//   },
//   {
//     id: 11,
//     text: 'Respect. Are you deploying it too?',
//     userImg: 'https://i.pravatar.cc/40?img=3',
//     username: 'Ben',
//     isMe: false,
//   },
//   {
//     id: 12,
//     text: 'Eventually yeah — Socket.IO on the backend, MongoDB for storage.',
//     userImg: 'https://i.pravatar.cc/40?img=2',
//     username: 'You',
//     isMe: true,
//   },
//   {
//     id: 13,
//     text: 'I’m following this thread and learning a lot, thanks!',
//     userImg: 'https://i.pravatar.cc/40?img=4',
//     username: 'Dana',
//     isMe: false,
//   },
// ]
