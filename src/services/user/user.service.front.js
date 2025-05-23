import { storageService } from '../async-storage.service'
import { itemService } from '../item/item.service'

const STORAGE_KEY_LOGGEDIN_USER = 'user'

export const userService = {
  login,
  logout,
  signup,
  getUsers,
  getById,
  remove,
  update,
  getLoggedinUser,
  saveLoggedinUser,
  getEmptyUser,
  getPrefs,
  setPrefs,
  getLoggedinCart,
  getCartItems,
}

async function getUsers() {
  try {
    const users = await storageService.query('user')
    return users.map((user) => {
      delete user.password
      return user
    })
  } catch (err) {
    // console.log(err)
    throw err
  }
}

async function getById(userId) {
  try {
    return await storageService.get('user', userId)
  } catch (err) {
    // console.log(err)
    throw err
  }
}

async function remove(userId) {
  try {
    return await storageService.remove('user', userId)
  } catch (err) {
    // console.log(err)
    throw err
  }
}

async function update(userToUpdate) {
  try {
    const { _id } = userToUpdate
    const user = await storageService.get('user', _id)

    const savedUser = await storageService.put('user', userToUpdate)

    // When admin updates other user's details, do not update loggedinUser
    const loggedinUser = getLoggedinUser()
    if (loggedinUser._id === user._id) saveLoggedinUser(userToUpdate)

    return savedUser
  } catch (err) {
    // console.log(err)
    throw err
  }
}

async function login(userCred) {
  try {
    const users = await storageService.query('user')

    const user = users.find(
      (user) =>
        user.username === userCred.username || user.email === userCred.username
    )

    if (
      (user && userCred.username === user.username) ||
      userCred.username === user.email
    ) {
      return saveLoggedinUser(user)
    } else {
      const err = new Error('User credentials do not match.')
      err.details = {
        he: 'שם משתמש או סיסמא לא תקינים',
        eng: 'Authentication failed',
      }
      throw err
    }
  } catch (err) {
    // console.log(err)
    throw err
  }
}

async function signup(userCred) {
  try {
    if (!userCred.imgUrl)
      userCred.imgUrl =
        'https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_1280.png'

    userCred.ordersIds = []
    if (!userCred.items) userCred.items = []

    const user = await storageService.post('user', userCred)
    return saveLoggedinUser(user)
  } catch (err) {
    // console.log(err)
    throw err
  }
}

async function logout() {
  try {
    sessionStorage.removeItem(STORAGE_KEY_LOGGEDIN_USER)
  } catch (err) {
    // console.log(err)
    throw err
  }
}

function getLoggedinUser() {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY_LOGGEDIN_USER))
  } catch (err) {
    // console.log(err)
    throw err
  }
}

function saveLoggedinUser(user) {
  try {
    user = {
      _id: user._id,
      fullname: user.fullname,
      username: user.username,
      imgUrl: user.imgUrl,
      isAdmin: user.isAdmin,
      email: user.email,
      phone: user.phone,
      ordersIds: user.ordersIds,
      items: user.items,
    }
    sessionStorage.setItem(STORAGE_KEY_LOGGEDIN_USER, JSON.stringify(user))
    return user
  } catch (err) {
    // console.log(err)
    throw err
  }
}

function getEmptyUser() {
  return {
    username: '',
    password: '',
    fullname: '',
    isAdmin: false,
    ordersIds: [],
    items: [],
    email: '',
  }
}

function getPrefs() {
  try {
    const entityType = 'sport-club-pref'
    let prefs
    if (!localStorage.getItem(entityType)) {
      prefs = { isEnglish: false, isDarkMode: false }
      localStorage.setItem(entityType, JSON.stringify(prefs))
    } else {
      prefs = JSON.parse(localStorage.getItem(entityType)) || {
        isEnglish: false,
      }
    }

    return prefs
  } catch (err) {
    // console.log(err)
    throw err
  }
}

function setPrefs(prefs) {
  try {
    const entityType = 'sport-club-pref'
    localStorage.setItem(entityType, JSON.stringify(prefs))
  } catch (err) {
    // console.log(err)
    throw err
  }
}

function getLoggedinCart() {
  try {
    const user = JSON.parse(sessionStorage.getItem(STORAGE_KEY_LOGGEDIN_USER))
    if (!user) return []
    const cart = user.items

    return cart
  } catch (err) {
    // console.log(err)
    throw err
  }
}

async function getCartItems(cart) {
  try {
    let items = await itemService.query({ isAll: true })
    const itemsToReturn = []
    let idx = 0
    cart.map((item) => {
      const currItem = items.find((itemToFind) => itemToFind._id === item.id)
      if (currItem) {
        itemsToReturn[idx] = {
          id: currItem._id,
          cover: currItem.cover,
          price: currItem.price,
          title: currItem.title,
          quantity: item.quantity,
        }
        idx++
      }
    })

    return itemsToReturn
  } catch (err) {
    // console.log(err)
    throw err
  }
}

// To quickly create an admin user, uncomment the next line
_createAdmin()
async function _createAdmin() {
  try {
    const userCred = {
      username: 'admin',
      password: 'admin123',
      fullname: 'Dor Hakim',
      imgUrl:
        'https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_1280.png',
      isAdmin: true,
      email: 'service.kfar@gmail.com',
      ordersIds: [],
      items: [],
    }

    const newUser = await storageService.post('user', userCred)
  } catch (err) {
    // console.log(err)
    throw err
  }
}
