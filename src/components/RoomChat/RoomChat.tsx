import React, { useRef, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import SendIcon from '@mui/icons-material/Send'
import { IconButton } from '@mui/material'
import { MessagesList } from '../MessagesList/MessagesList'
import { showErrorMsg } from '../../services/event-bus.service'
import { Message } from '../../types/Message/Message'
import { MessageToAdd } from '../../types/messageToAdd/MessageToAdd'
import { loadRoom, sendMessage } from '../../store/actions/room.actions'
import { userService } from '../../services/user/user.service'
import { SOCKET_EVENT_ADD_MSG, socket } from '../../services/socket.service'
import { setIsLoading } from '../../store/actions/system.actions'

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

  useEffect(() => {
    const handleMsg = async () => {
      if (!room?.id) return
      try {
        setIsLoading(true)
        const updatedRoom = await loadRoom(room.id)

        loadMessages(updatedRoom)
      } catch (err) {
        // console.log(err);
      } finally {
        setIsLoading(false)
      }
    }

    socket.on(SOCKET_EVENT_ADD_MSG, handleMsg)

    return () => {
      socket.off(SOCKET_EVENT_ADD_MSG, handleMsg)
    }
  }, [])

  const handleInputChange = () => {
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
      setIsLoading(true)

      const messageToSend: MessageToAdd = {
        fromId: user.id,
        content: textAreaRef.current.value,
        sentAt: new Date(),
        roomId: room.id,
        chatId: room.chat._id,
      }

      await sendMessage(messageToSend, room)
      // const savedMessage = await sendMessage(messageToSend, room)
      // console.log(savedMessage)
      const updatedRoom = await loadRoom(room.id)

      loadMessages(updatedRoom)

      textAreaRef.current.value = ''
      // showSuccessMsg('Message sent')
    } catch (err) {
      // console.log(err)
      showErrorMsg(`Couldn't send message`)
    } finally {
      setIsLoading(false)
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

  const handleEnter = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
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
          onKeyDown={handleEnter}
        />

        <IconButton onClick={handleSend}>
          <SendIcon />
        </IconButton>
      </div>
    </div>
  )
}
