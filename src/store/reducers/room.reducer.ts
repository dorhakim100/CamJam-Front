import { roomService } from '../../services/room/room.service'

import { Room } from '../../types/room/Room'
import { RoomFilter } from '../../types/roomFilter/RoomFilter'

export const SET_ROOMS = 'SET_ROOMS'
export const SET_ROOM = 'SET_ROOM'
// export const REMOVE_ROOM = 'REMOVE_ROOM'
// export const ADD_ROOM = 'ADD_ROOM'
// export const UPDATE_ROOM = 'UPDATE_ROOM'
export const SET_ROOM_FILTER = 'SET_ROOM_FILTER'

export interface RoomState {
  rooms: Room[]
  room: Room | null
  filter: RoomFilter
  lastRemovedRoom?: Room
  currRoomId: string
}

const initialState: RoomState = {
  rooms: [],
  room: null,
  filter: roomService.getDefaultFilter(),
  currRoomId: '',
}

export function roomReducer(state = initialState, action: any) {
  var newState = state
  // var rooms
  switch (action.type) {
    case SET_ROOMS:
      newState = { ...state, rooms: [...action.rooms] }
      break
    case SET_ROOM:
      newState = {
        ...state,
        room: { ...action.room },
        currRoomId: action.room.id,
      }
      break
    //   case REMOVE_ROOM:
    //     const lastRemovedRoom = state.rooms.find(
    //       (room:Room) => room._id === action.roomId
    //     )
    //     rooms = state.rooms.filter((room:Room) => room._id !== action.roomId)
    //     newState = { ...state, rooms, lastRemovedRoom }
    //     break
    //   case ADD_ROOM:
    //     newState = { ...state, rooms: [...state.rooms, action.room] }
    //     break
    //   case UPDATE_ROOM:
    //     rooms = state.rooms.map((room: Room) =>
    //       room._id === action.room._id ? action.room : room
    //     )
    //     newState = { ...state, rooms }
    //     break

    case SET_ROOM_FILTER:
      newState = { ...state, filter: action.filter }
      break
    default:
  }
  return newState
}
