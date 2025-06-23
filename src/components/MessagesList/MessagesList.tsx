import React, { useEffect } from 'react'
import { MessagePreview } from '../MessagePreview/MessagePreview'

export function MessagesList({
  messages,
  messagesListRef,
}: {
  messages: any[]
  messagesListRef: React.RefObject<HTMLUListElement | null>
}) {
  useEffect(() => {
    // console.log(messages)
  }, [messages])
  if (messages)
    return (
      <ul className='messages-list' ref={messagesListRef}>
        {messages.map((message) => (
          <MessagePreview message={message} key={message.id} />
        ))}
      </ul>
    )
}
