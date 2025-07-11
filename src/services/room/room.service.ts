import { httpService } from '../http.service'
import { makeId } from '../util.service'

import { Room } from '../../types/room/Room'
import { RoomFilter } from '../../types/roomFilter/RoomFilter'
import { RoomToAdd } from '../../types/roomToAdd/RoomToAdd'
import { AuthBody } from '../../types/AuthBody/AuthBody'

const KEY = 'room'

export const roomService = {
  query,
  getById,
  save,
  remove,
  getEmptyRoom,
  getDefaultFilter,
  // getMaxPage,
}

async function query(
  filterBy: RoomFilter = {
    txt: '',
    hostId: '',
    pageIdx: 0,
  }
) {
  try {
    const rooms = await httpService.get(KEY, filterBy)

    return rooms
  } catch (err) {
    // // console.log(err)
    throw err
  }
}

async function getById(roomId: string, filter: RoomFilter | null = null) {
  try {
    const res = await httpService.get(`${KEY}/${roomId}`, filter)
    return res
  } catch (err) {
    // // console.log(err)
    throw err
  }
}

async function remove(roomId: string, body: AuthBody) {
  try {
    return await httpService.delete(`${KEY}/${roomId}`, body)
  } catch (err) {
    // // console.log(err)
    throw err
  }
}
async function save(room: Room | RoomToAdd) {
  try {
    let saved

    if ('id' in room && room.id) {
      saved = await httpService.put(`${KEY}/${room.id}`, room)
    } else {
      saved = await httpService.post(KEY, room)
    }

    return saved
  } catch (err) {
    // // console.log(err)
    throw err
  }
}

function getEmptyRoom() {
  return {
    id: makeId(),
    name: '',
    host_id: '',
    host: { fullname: '' },
    is_private: false,
    max_participants: 10,
    created_at: new Date(),
  }
}

function getDefaultFilter() {
  return {
    txt: '',
    hostId: '',
    pageIdx: 0,
  }
}

// async function getMaxPage(filterBy:RoomFilter) {
//   const PAGE_SIZE = 6

//   try {
//     var rooms = await query({ ...filterBy, isAll: true })

//     let maxPage = rooms.length / PAGE_SIZE
//     maxPage = Math.ceil(maxPage)
//     return maxPage
//   } catch (err) {
//     // // console.log(err)
//   }
// }
