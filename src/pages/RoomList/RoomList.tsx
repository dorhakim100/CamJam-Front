import React, { useState, useEffect, useRef } from 'react'
import { loadRooms } from '../../store/actions/room.actions'

import { RoomCard } from '../../components/RoomCard/RoomCard'
import { roomService } from '../../services/room/room.service'

import { RoomFilter } from '../../types/roomFilter/RoomFilter'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { RoomPasswordModal } from '../../components/RoomPasswordModal/RoomPasswordModal'
import { showErrorMsg } from '../../services/event-bus.service'
import { Room } from '../../types/room/Room'

export function RoomList() {
  const rooms = useSelector(
    (stateSelector: RootState) => stateSelector.roomModule.rooms
  )
  const room = useSelector(
    (stateSelector: RootState) => stateSelector.roomModule.room
  )

  const [filter, setFilter] = useState(roomService.getDefaultFilter())

  const [isPasswordModal, setIsPasswordModal] = useState(false)
  const passwordModals = useRef<Set<{roomId: string,password:string}>>(new Set())
  const [currPasswordModal, setCurrPasswordModal] = useState<{roomId: string,password:string} | null>(null)

  useEffect(() => {
    setRooms(filter)

  }, [filter])
  
  async function setRooms(filterBy: RoomFilter) {
    try {
      const rooms = await loadRooms(filterBy)

      rooms.forEach((room: Room)=>{
        if(!room) return

        if (room.password) {
          const roomWithPassword = {roomId: room.id, password: room.password}
          passwordModals.current.add(roomWithPassword)
        } 

      })
      
    } catch (err) {
      // console.error('Error setting rooms:', err)
      showErrorMsg('Failed to load rooms. Please try again later.')
      
    }
  }

  return (
    <div>
      <div className='room-list-container'>
        {rooms.map((room) => (
          <>
          <RoomCard key={room.id} room={room} setIsPasswordModal={setIsPasswordModal} setCurrPasswordModal={setCurrPasswordModal} />
          </>
        ))}
        {isPasswordModal && currPasswordModal &&
        
        <RoomPasswordModal roomData={currPasswordModal}  setIsPasswordModal={setIsPasswordModal} />}
      </div>
    </div>
  )
}
