export interface RoomToAdd {
  host_id: string
  name?: string
  is_private?: boolean
  max_participants?: number
  created_at: Date
}
