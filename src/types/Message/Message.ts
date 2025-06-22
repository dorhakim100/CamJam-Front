export interface Message {
  _id: string
  fromId: string
  roomId?: string
  content: string
  sentAt: Date
}
