import { User } from '../user/User'

export interface Message {
  _id: string
  fromId: string
  roomId?: string
  content: string
  sentAt: Date
  user?: UserWithIsMe
}

interface UserWithIsMe extends User {
  isMe: Boolean
}
