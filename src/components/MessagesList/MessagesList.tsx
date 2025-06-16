import React from 'react'
import { MessagePreview } from '../MessagePreview/MessagePreview'

export function MessagesList({ messages }: { messages: any[] }) {
  return (
    <ul className='messages-list'>
      {messages.map((message) => (
        <MessagePreview message={message} key={message.id} />
      ))}
    </ul>
  )
}
