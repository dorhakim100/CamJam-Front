import { Message } from '../Message/Message'

export interface Chat {
  _id: string
  roomId: string
  messages: Message[]
}
