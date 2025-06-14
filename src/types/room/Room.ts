export interface Room {
  id: string
  host_id: string
  host: RoomHost
  name?: string
  is_private?: boolean
  max_participants?: number
  created_at: Date
  password?: string
}

interface RoomHost {
  fullname: string
}
