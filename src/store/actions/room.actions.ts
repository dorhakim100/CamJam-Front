import { roomService } from '../../services/room/room.service'
import { store } from '../store'
import { SET_ROOMS, SET_ROOM, SET_ROOM_FILTER } from '../reducers/room.reducer'
import { RoomFilter } from '../../types/roomFilter/RoomFilter'
import { Room } from '../../types/room/Room'
import { RoomToAdd } from '../../types/roomToAdd/RoomToAdd'

export async function loadRooms(filterBy: RoomFilter): Promise<any> {
  try {
    const rooms = await roomService.query(filterBy)

    store.dispatch(getCmdSetRooms(rooms))
    store.dispatch({ type: SET_ROOM_FILTER, filter: filterBy })
    return rooms
  } catch (err) {
    // console.log('Cannot load rooms', err)
    throw err
  }
}

export async function loadRoom(roomId: string): Promise<any> {
  try {
    console.log(roomId)

    const room = await roomService.getById(roomId)
    store.dispatch(getCmdSetRoom(room))
    return room
  } catch (err) {
    // console.log('Cannot load room', err)
    throw err
  }
}

export async function saveRoom(roomToSave: Room | RoomToAdd): Promise<any> {
  try {
    const room = await roomService.save(roomToSave)
    store.dispatch(getCmdSetRoom(room))
    return room
  } catch (err) {
    // console.log('Cannot load room', err)
    throw err
  }
}

function getCmdSetRooms(rooms: Room[]) {
  return {
    type: SET_ROOMS,
    rooms,
  }
}
function getCmdSetRoom(room: Room) {
  return {
    type: SET_ROOM,
    room,
  }
}
