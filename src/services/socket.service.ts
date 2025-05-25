import io, { Socket } from 'socket.io-client'
import { userService } from './user/user.service'

export const SOCKET_EVENT_JOIN_ROOM = 'join-room'
export const SOCKET_EVENT_USER_JOINED = 'user-joined'
export const SOCKET_EVENT_USER_LEFT = 'user-left'
export const SOCKET_EVENT_OFFER = 'offer'
export const SOCKET_EVENT_ANSWER = 'answer'
export const SOCKET_EVENT_ICE_CANDIDATE = 'ice-candidate'

const SOCKET_EMIT_LOGIN = 'set-user-socket'
const SOCKET_EMIT_LOGOUT = 'unset-user-socket'

// const baseUrl =
//   process.env.NODE_ENV === 'production' ? 'production' : '//localhost:3030'

const baseUrl = 'http://localhost:3030'
console.log('Socket service base URL:', baseUrl)

export const socketService = createSocketService()

if (typeof window !== 'undefined') {
  ;(window as any).socketService = socketService
  socketService.setup()
}

interface ISocketService {
  setup(): void
  on(eventName: string, cb: Function): void
  off(eventName: string, cb?: Function): void
  emit(eventName: string, data: any): void
  login(userId: string): void
  logout(): void
  terminate(): void
  joinRoom(roomId: string): void
  leaveRoom(roomId: string): void
}

function createSocketService(): ISocketService {
  let socket: Socket | null = null

  const socketService: ISocketService = {
    setup() {
      socket = io(
        baseUrl
        //    {
        //   transports: ['websocket'],
        //   reconnection: true,
        //   reconnectionDelay: 1000,
        //   reconnectionDelayMax: 5000,
        //   reconnectionAttempts: 5,
        // }
      )

      // const user =  userService.getLoggedinUser()
      // console.log(user)

      // if (user) this.login(user.id)

      socket.on('connection', () => {
        console.log('Connected to socket server')
      })

      socket.on('disconnect', () => {
        console.log('Disconnected from socket server')
      })
    },

    on(eventName: string, cb: Function) {
      if (!socket) return
      socket.on(eventName, cb as any)
    },

    off(eventName: string, cb: Function | undefined = undefined) {
      if (!socket) return
      if (!cb) socket.removeAllListeners(eventName)
      else socket.off(eventName, cb as any)
    },

    emit(eventName: string, data: any) {
      if (!socket) return
      socket.emit(eventName, data)
    },

    login(userId: string) {
      if (!socket) return
      socket.emit(SOCKET_EMIT_LOGIN, userId)
    },

    logout() {
      if (!socket) return
      socket.emit(SOCKET_EMIT_LOGOUT)
    },

    joinRoom(roomId: string) {
      if (!socket) return
      socket.emit(SOCKET_EVENT_JOIN_ROOM, { roomId })
    },

    leaveRoom(roomId: string) {
      if (!socket) return
      socket.emit(SOCKET_EVENT_USER_LEFT, { roomId })
    },

    terminate() {
      if (socket) {
        socket.disconnect()
        socket = null
      }
    },
  }

  return socketService
}
