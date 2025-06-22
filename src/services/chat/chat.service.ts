import { httpService } from '../http.service'
import { makeId } from '../util.service'

import { Chat } from '../../types/chat/Chat'
import { ChatToAdd } from '../../types/chatToAdd/ChatToAdd'
import { ChatFilter } from '../../types/chatFilter/ChatFilter'
import { MessageToAdd } from '../../types/messageToAdd/MessageToAdd'
import { Message } from '../../types/Message/Message'

const KEY = 'chat'

export const chatService = {
  getByRoomId,
  saveMessage,
  removeMessage,
  getEmptyChat,
  getEmptyMessage,
  getDefaultFilter,
  // getMaxPage,
  // query,
}

async function getByRoomId(roomId: string, filter: ChatFilter | null = null) {
  try {
    const res = await httpService.get(`${KEY}/${roomId}`, filter)
    return res
  } catch (err) {
    // // console.log(err)
    throw err
  }
}

async function removeMessage(messageId: string) {
  try {
    return await httpService.delete(`${KEY}/${messageId}`, null)
  } catch (err) {
    // // console.log(err)
    throw err
  }
}

async function saveMessage(message: Message | MessageToAdd) {
  try {
    let saved

    if ('_id' in message && message._id) {
      saved = await httpService.put(`${KEY}/message/${message._id}`, message)
    } else {
      saved = await httpService.post(`${KEY}/message`, message)
    }

    return saved
  } catch (err) {
    // // console.log(err)
    throw err
  }
}

function getEmptyChat() {
  return {
    _id: makeId(),
    roomId: '',
    messages: [],
    createdAt: new Date(),
  }
}

function getEmptyMessage() {
  return {
    _id: makeId(),
    roomId: '',
    fromId: '',
    content: '',
    createdAt: new Date(),
  }
}

function getDefaultFilter() {
  return {
    roomId: '',
    pageIdx: 0,
  }
}

// async function getMaxPage(filterBy:ChatFilter) {
//   const PAGE_SIZE = 6

//   try {
//     var chats = await query({ ...filterBy, isAll: true })

//     let maxPage = chats.length / PAGE_SIZE
//     maxPage = Math.ceil(maxPage)
//     return maxPage
//   } catch (err) {
//     // // console.log(err)
//   }
// }

// async function query(
//   filterBy: ChatFilter = {
//     roomId: '',
//     pageIdx: 0,
//   }
// ) {
//   try {
//     const chats = await httpService.get(KEY, filterBy)

//     return chats
//   } catch (err) {
//     // // console.log(err)
//     throw err
//   }
// }
