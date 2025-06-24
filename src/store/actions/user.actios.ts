import { store } from '../store'
import { userService } from '../../services/user/user.service'

import {
  SET_USER,
  SET_USERS,
  REMOVE_USER,
  SET_WATCHED_USER,
  SET_USER_FILTER,
} from '../reducers/user.reducer'

import { UserFilter } from '../../types/userFilter/UserFilter'
import { UserCred } from '../../types/userCred/UserCred'
import { User } from '../../types/user/User'

export async function loadUsers(filter: UserFilter) {
  try {
    store.dispatch({ type: SET_USER_FILTER, filter })
    const users = await userService.getUsers(filter)
    store.dispatch({ type: SET_USERS, users })
    return users
  } catch (err) {
    // console.log('UserActions: err in loadUsers', err)
    throw err
  }
}

export async function removeUser(userId: string) {
  try {
    await userService.remove(userId)
    store.dispatch({ type: REMOVE_USER, userId })
  } catch (err) {
    // console.log('UserActions: err in removeUser', err)
    throw err
  }
}

export async function login(credentials: UserCred) {
  try {
    await logout()
    const user = await userService.login(credentials)

    store.dispatch({
      type: SET_USER,
      user: user,
    })
    // socketService.login(user._id)
    return user
  } catch (err) {
    // console.log('Cannot login', err)
    throw err
  }
}

export async function handleGuestMode() {
  try {
    await _loginWithGuest()
  } catch (err) {
    throw err
    // console.log(err);
    // showErrorMsg(`Couldn't use guest mode`)
  }
}

async function _loginWithGuest() {
  try {
    const credentials = {
      // id: makeId(),
      fullname: 'Guest',
      password: 'Guest',
      email: 'Guest@guest.com',
      isGuest: true,
    }
    const user = await userService.signup(credentials)

    store.dispatch({
      type: SET_USER,
      user: user,
    })
    // socketService.login(user._id)
    return user
  } catch (err) {
    // console.log('Cannot login', err)
    throw err
  }
}

export async function updateUser(userToUpdate: User) {
  try {
    const saved = await userService.update(userToUpdate)
    store.dispatch({
      type: SET_USER,
      user: saved,
    })

    return saved
  } catch (err) {
    // console.log(err);
    throw err
  }
}

export async function signup(credentials: UserCred) {
  try {
    await logout()
    const user = await userService.signup(credentials)
    store.dispatch({
      type: SET_USER,
      user,
    })
    if (user && credentials.isRemember) return
    // socketService.login(user._id)
    return user
  } catch (err) {
    // console.log('Cannot signup', err)
    throw err
  }
}

export async function logout() {
  try {
    await userService.logout()
    store.dispatch({
      type: SET_USER,
      user: null,
    })

    // socketService.logout()
  } catch (err) {
    // console.log('Cannot logout', err)
    throw err
  }
}

export async function loadUser(userId: string) {
  try {
    // debugger
    const user = await userService.getById(userId)

    // store.dispatch({ type: SET_WATCHED_USER, user })
    store.dispatch({ type: SET_WATCHED_USER, user })
    return user
  } catch (err) {
    throw err
    // console.log('Cannot load user', err)
  }
}

export function setRemembered(user: User) {
  store.dispatch({
    type: SET_USER,
    user,
  })
}
