export interface MessageToAdd {
  fromId: string
  roomId?: string
  content: string
  sentAt: Date
  chatId?: string
}
