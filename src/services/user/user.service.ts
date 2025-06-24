import { httpService } from '../http.service'

const STORAGE_KEY_LOGGEDIN_USER = 'loggedinUser'

import { UserFilter } from '../../types/userFilter/UserFilter'
import { User } from '../../types/user/User'
import { UserCred } from '../../types/userCred/UserCred'
import { u } from 'framer-motion/client'
import { getPrefs } from '../util.service'
import { setPrefs } from '../util.service'

export const userService = {
  login,
  logout,
  signup,
  getUsers,
  getById,
  remove,
  update,
  getLoggedinUser,
  getDefaultFilter,
  saveLoggedinUser,
  getEmptyUser,

  getRememberedUser,
  // getMaxPage,
}

async function getUsers(filter: UserFilter) {
  try {
    const users = await httpService.get(`user`, filter)

    return users
  } catch (err) {
    // console.log(err)
    throw err
  }
}

async function getById(userId: string) {
  try {
    const user = await httpService.get(`user/${userId}`, null)
    return user
  } catch (err) {
    // console.log(err)
    throw err
  }
}

async function remove(userId: string) {
  try {
    return await httpService.delete(`user/${userId}`, null)
  } catch (err) {
    // console.log(err)
    throw err
  }
}

async function update(user: User) {
  try {
    const { id } = user

    const savedUser = await httpService.put(`user/${id}`, user)
    // When admin updates other user's details, do not update loggedinUser
    // console.log(savedUser)
    // return

    const loggedinUser = await getLoggedinUser() // Might not work because its defined in the main service???

    // if (loggedinUser.id === user.id) saveLoggedinUser(savedUser)

    delete savedUser.password
    return savedUser
    // return saveLoggedinUser(savedUser)
  } catch (err) {
    // console.log(err)
    throw err
  }
}

async function login(userCred: UserCred) {
  try {
    const user = await httpService.post('auth/login', userCred)

    const prefs = getPrefs()
    setPrefs({
      ...prefs,
      user: userCred.isRemember ? user.id : null,
    })

    // console.log(user)
    if (user) {
      const saved = saveLoggedinUser(user)

      return saved
    }
  } catch (err) {
    console.log(err)
    throw err
  }
}

async function signup(userCred: UserCred) {
  try {
    if (!userCred.imgUrl)
      userCred.imgUrl =
        'https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_1280.png'

    const user = await httpService.post('auth/signup', userCred)

    return saveLoggedinUser(user)
  } catch (err) {
    // console.log(err)
    throw err
  }
}

async function logout() {
  sessionStorage.removeItem(STORAGE_KEY_LOGGEDIN_USER)
  try {
    const prefs = getPrefs()
    setPrefs({
      ...prefs,
      user: null,
    })
    return await httpService.post('auth/logout', null)
  } catch (err) {
    // console.log(err)
    throw err
  }
}

async function getLoggedinUser() {
  try {
    const remembered = await getRememberedUser()

    if (!remembered) {
      const sessionStr = sessionStorage.getItem(STORAGE_KEY_LOGGEDIN_USER)
      if (!sessionStr) return null
      const logged = JSON.parse(sessionStr)
      if (!logged) return

      const retrieved = await getById(logged._id)

      saveLoggedinUser(retrieved)
      return retrieved
    }
    saveLoggedinUser(remembered)
    return remembered
  } catch (err) {
    // console.log(err)
    throw err
  }
}

function saveLoggedinUser(user: User) {
  user = {
    id: user.id,
    fullname: user.fullname,

    imgUrl: user.imgUrl,
    // isAdmin: user.isAdmin,
    email: user.email,
    isGuest: user.isGuest || false,
  }

  sessionStorage.setItem(STORAGE_KEY_LOGGEDIN_USER, JSON.stringify(user))
  return user
}

function getEmptyUser() {
  return {
    id: '',
    password: '',
    fullname: '',
    email: '',
    imgUrl: '',
  }
}

function getDefaultFilter() {
  return {
    txt: '',
  }
}

async function getRememberedById(userId: string) {
  try {
    const user = await httpService.get(`user/rememberMe/${userId}`, null)
    return user
  } catch (err) {
    // console.log(err)
    throw err
  }
}

async function getRememberedUser() {
  // const sessionStr = sessionStorage.getItem(STORAGE_KEY_LOGGEDIN_USER)
  // if (!sessionStr) return null
  // const sessionUser = JSON.parse(sessionStr)

  try {
    // if (sessionUser) {
    //   const retrievedUser = await getRememberedById(sessionUser._id)

    //   return saveLoggedinUser(retrievedUser)
    // }
    const prefs = getPrefs()

    if (!prefs.user) return
    const userId = prefs.user ? prefs.user : null
    if (userId) {
      // const cred = {
      //   username: prefs.user.username,
      //   password: '',
      //   isRemembered: true,
      // }
      // const user = await login(cred)

      const user = await getRememberedById(userId)
      // const user = await loginToken()
      if (user) return saveLoggedinUser(user)
    } else {
      throw new Error('No userId found in prefs')
      return null
    }
  } catch (err) {
    // console.log(err)
    throw err
  }
}

// async function getMaxPage(filter: UserFilter) {
//   const PAGE_SIZE = 6
//   try {
//     var maxPage = await getUsers({ ...filter, isAll: true, isMax: true })

//     // let maxPage = messages.length / PAGE_SIZE
//     // maxPage = Math.ceil(maxPage)

//     return maxPage
//   } catch (err) {
//     // console.log(err)
//     throw err
//   }
// }
