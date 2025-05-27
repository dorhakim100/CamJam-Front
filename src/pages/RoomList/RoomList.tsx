import React, { useState, useEffect } from 'react'
import { loadRooms } from '../../store/actions/room.actions'

import { RoomCard } from '../../components/RoomCard/RoomCard'
import { roomService } from '../../services/room/room.service'

import { RoomFilter } from '../../types/roomFilter/RoomFilter'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'

export function RoomList() {
  const rooms = useSelector(
    (stateSelector: RootState) => stateSelector.roomModule.rooms
  )

  const [filter, setFilter] = useState(roomService.getDefaultFilter())

  useEffect(() => {
    loadRooms(filter)
  }, [filter])

  return (
    <div>
      RoomList
      <div className='room-list-container'>
        {rooms.map((room) => (
          <RoomCard key={room.id} room={room} />
        ))}
      </div>
    </div>
  )
}
