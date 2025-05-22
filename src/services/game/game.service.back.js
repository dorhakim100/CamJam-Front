import { httpService } from '../http.service'
import { makeId } from '../util.service'

const KEY = 'game'

export const gameService = {
  query,
  getById,
  save,
  remove,
  getEmptyGame,
  getDefaultFilter,
  getMaxPage,
}

async function query(
  filterBy = {
    txt: '',
    maxPrice: 0,
    sortDir: '',
    types: [],
    pageIdx: 0,
    isAll: false,
  }
) {
  try {
    const games = await httpService.get(KEY, filterBy)

    return games
  } catch (err) {
    // // console.log(err)
    throw err
  }
}

async function getById(gameId, filter) {
  try {
    const res = await httpService.get(`${KEY}/${gameId}`, filter)
    return res
  } catch (err) {
    // // console.log(err)
    throw err
  }
}

async function remove(gameId) {
  try {
    return await httpService.delete(`${KEY}/${gameId}`)
  } catch (err) {
    // // console.log(err)
    throw err
  }
}
async function save(game) {
  try {
    var savedGame
    if (game._id) {
      savedGame = await httpService.put(`${KEY}/${game._id}`, game)
    } else {
      savedGame = await httpService.post(KEY, game)
    }
    return savedGame
  } catch (err) {
    // // console.log(err)
    throw err
  }
}

function getEmptyGame() {
  return {
    _id: makeId(),
    price: '',
    title: { he: '', eng: '' },
    preview: { he: '', eng: '' },
    types: [],
    cover: '',
  }
}

function getDefaultFilter() {
  return {
    txt: '',
    maxPrice: '',
    sortDir: '',
    types: [],
    pageIdx: 0,
  }
}

async function getMaxPage(filterBy) {
  const PAGE_SIZE = 6

  try {
    var games = await query({ ...filterBy, isAll: true })

    let maxPage = games.length / PAGE_SIZE
    maxPage = Math.ceil(maxPage)
    return maxPage
  } catch (err) {
    // // console.log(err)
  }
}
