import { userService } from '../../services/user/user.service'

import { User } from '../../types/user/User'
import { UserFilter } from '../../types/userFilter/UserFilter'

export const SET_USERS = 'SET_USERS'
export const SET_USER = 'SET_USER'
export const REMOVE_USER = 'REMOVE_USER'
export const ADD_USER = 'ADD_USER'
export const UPDATE_USER = 'UPDATE_USER'
export const SET_USER_FILTER = 'SET_USER_FILTER'
export const SET_WATCHED_USER = 'SET_WATCHED_USER'

export interface UserState {
  users: User[]
  user: User | null
  filter: UserFilter
  lastRemovedUser?: User
}

const initialState: UserState = {
  users: [],
  user: null,
  filter: userService.getDefaultFilter(),
}

export function userReducer(state = initialState, action: any) {
  let newState = state
  let users
  switch (action.type) {
    case SET_USERS:
      newState = { ...state, users: action.users }
      break
    case SET_USER:
      newState = { ...state, user: action.user }
      break
    //   case REMOVE_USER:
    //     const lastRemovedGame = state.users.find(
    //       (user:User) => user._id === action.userId
    //     )
    //     users = state.users.filter((user:User) => user._id !== action.userId)
    //     newState = { ...state, users, lastRemovedGame }
    //     break
    case ADD_USER:
      newState = { ...state, users: [...state.users, action.user] }
      break
    case UPDATE_USER:
      users = state.users.map((user: User) =>
        user.id === action.user.id ? action.user : user
      )
      newState = { ...state, users }
      break

    case SET_USER_FILTER:
      newState = { ...state, filter: action.filter }
      break
    default:
  }
  return newState
}
