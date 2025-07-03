import { useState, useEffect } from 'react'
import { loadRooms } from '../../store/actions/room.actions'

import { RoomCard } from '../../components/RoomCard/RoomCard'
import { roomService } from '../../services/room/room.service'

import { RoomFilter } from '../../types/roomFilter/RoomFilter'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { RoomPasswordModal } from '../../components/RoomPasswordModal/RoomPasswordModal'
import { showErrorMsg } from '../../services/event-bus.service'
import { PasswordRoom } from '../../types/PasswordRoom/PasswordRoom'
import { setIsLoading } from '../../store/actions/system.actions'

export function RoomList() {
  const rooms = useSelector(
    (stateSelector: RootState) => stateSelector.roomModule.rooms
  )
  // const room = useSelector(
  //   (stateSelector: RootState) => stateSelector.roomModule.room
  // )

  // const user = useSelector(
  //   (stateSelector: RootState) => stateSelector.userModule.user
  // )

  const [filter, setFilter] = useState(roomService.getDefaultFilter())

  const [isPasswordModal, setIsPasswordModal] = useState(false)
  const [currPasswordModal, setCurrPasswordModal] =
    useState<PasswordRoom | null>(null)

  useEffect(() => {
    setRooms(filter)
  }, [filter])

  async function setRooms(filterBy: RoomFilter) {
    try {
      setIsLoading(true)
      const rooms = await loadRooms(filterBy)
    } catch (err) {
      // console.error('Error setting rooms:', err)
      showErrorMsg('Failed to load rooms. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <div className='room-list-container'>
        {rooms.map((room) => (
          <RoomCard
            key={room.id}
            room={room}
            setIsPasswordModal={setIsPasswordModal}
            setCurrPasswordModal={setCurrPasswordModal}
          />
        ))}
        {isPasswordModal && currPasswordModal && (
          <RoomPasswordModal
            key={`password-modal`}
            roomData={currPasswordModal}
            setIsPasswordModal={setIsPasswordModal}
          />
        )}
      </div>
    </div>
  )
}
