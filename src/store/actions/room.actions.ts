import { roomService } from '../../services/room/room.service'
import { store } from '../store'
import {
  SET_ROOMS,
  SET_ROOM,
  SET_ROOM_FILTER,
  REMOVE_ROOM,
  SET_IS_NEW_ROOM_MODAL_OPEN,
  ADD_MESSAGE,
} from '../reducers/room.reducer'
import { RoomFilter } from '../../types/roomFilter/RoomFilter'
import { Room } from '../../types/room/Room'
import { RoomToAdd } from '../../types/roomToAdd/RoomToAdd'
import { User } from '../../types/user/User'
import { SOCKET_EVENT_END_MEETING, socket } from '../../services/socket.service'
import { Message } from '../../types/Message/Message'
import { chatService } from '../../services/chat/chat.service'
import { MessageToAdd } from '../../types/messageToAdd/MessageToAdd'

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

export async function loadRoom(roomId: string): Promise<Room> {
  try {
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

export async function removeRoom(room: Room, user: User): Promise<any> {
  try {
    const roomId = room.id
    const body = {
      userId: user.id,
      id: room.host_id,
    }
    store.dispatch({ type: REMOVE_ROOM, roomId })
    await roomService.remove(roomId, body)
    socket.emit(SOCKET_EVENT_END_MEETING, roomId)
  } catch (err) {
    // console.log('Cannot remove room', err)
    throw err
  }
}

export async function sendMessage(
  messageToSend: Message | MessageToAdd,
  roomToSave: Room
) {
  try {
    if (!roomToSave.chat) throw new Error(`Couldn't send message`)

    const savedMessage = await chatService.saveMessage(messageToSend)
    const updatedRoom: Room = {
      ...roomToSave,
      chat: {
        ...roomToSave.chat,
        messages: [...roomToSave.chat.messages, savedMessage],
      },
    }
    store.dispatch(getCmdSetRoom(updatedRoom))
    return savedMessage
  } catch (err) {
    // console.log(err);
    throw err
  }
}

export function setNewRoomModal(stateToSet: boolean) {
  store.dispatch({
    type: SET_IS_NEW_ROOM_MODAL_OPEN,
    isOpen: stateToSet,
  })
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
