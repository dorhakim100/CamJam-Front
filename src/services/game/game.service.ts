import { storageService } from '../async-storage.service'
import { makeId } from '../util.service'

import { GameFilter } from '../../types/gameFilter/GameFilter'
import { Game } from '../../types/game/Game'


const STORAGE_KEY = 'game'
const PAGE_SIZE = 6

export const gameService = {
  query,
  getById,

  remove,

  getEmptyGame,
  getDefaultFilter,
  getMaxPage,
}
// window.cs = gameService

// if (!localStorage.getGame(STORAGE_KEY)) {
//   _createGames()
// }

async function query(filterBy:GameFilter = { txt: '',  categories: [],  sortDir: 0,  pageIdx: 0, isAll:false }):Promise<any> {
  try {
     var games = await storageService.query(STORAGE_KEY)
  const { txt,  sortDir, categories,  pageIdx, isAll } = filterBy

  if(isAll) return games

  if (txt) {
    const regex = new RegExp(filterBy.txt, 'i')
    games = games.filter(
      (game:Game) =>
        regex.test(game.title) ||
        regex.test(game.description) 

    )
  }


  if (categories.length > 0) {
    games = games.filter((game:Game) =>
      categories.some((type) => game.categories.includes(type))
    )
  }

  if (sortDir) {
    games.sort((game1: Game, game2: Game) =>game1.title.localeCompare(game2.title) * sortDir)
  }

  if (pageIdx !== undefined) {
    const startIdx = pageIdx * PAGE_SIZE
    games = games.slice(startIdx, startIdx + PAGE_SIZE)
  }

  return games
  } catch (err:Error | any) {
    // // console.log('Had issues, reverting to demo data', err)
    throw err
    
  }
 
}

function getById(gameId:string):Promise<any> {
  try {
    
    return storageService.get(STORAGE_KEY, gameId)
  } catch (error:Error | any) {
    // // console.log('Had issues, reverting to demo data', error)
    throw error
  }
}

async function remove(gameId:string) {
  // throw new Error('Nope')
  try {
    
    await storageService.remove(STORAGE_KEY, gameId)
  } catch (error:Error | any) {
    // // console.log('Had issues, reverting to demo data', error)
    throw error
    
  }
}

// async function save(game:Game) {
//   try {
//      var savedGame
//   if (game._id) {
//     const gameToSave = {
//       _id: game._id,
//       title: game.title,

//     }
//     savedGame = await storageService.put(STORAGE_KEY, gameToSave)
//   } else {
//     const gameToSave = {
//       cover:
//         'https://res.cloudinary.com/dnxi70mfs/image/upload/v1729010361/cropping_j9auka.webp',
//       preview: game.preview,
//       price: game.price,
//       stockQuantity: game.stockQuantity,
//       title: game.title,
//       types: [],
//     }
//     savedGame = await storageService.post(STORAGE_KEY, gameToSave)
//   }
//   return savedGame
//   } catch (error:Error | any) {
//     // // console.log('Had issues, reverting to demo data', error)
//     throw error
    
//   }
 
// }


function getEmptyGame():Game {
  return {
    _id: makeId(),

    title: '',
    description: '',
    categories: [],
    images: [],
  }
}

function getDefaultFilter():GameFilter {
  return {
    txt: '',
    sortDir: 1,
    categories: [],
    pageIdx: 0,
    isAll: false,
  }
}

async function getMaxPage(filterBy:GameFilter):Promise<any> {
  try {
    var games = await query({ ...filterBy, isAll: true })
    let maxPage = games.length / PAGE_SIZE
    maxPage = Math.ceil(maxPage)
    return maxPage
  } catch (err) {
    // // console.log(err)
  }
}

// function _createGames() {
//   const games = [
//     {
//       _id: makeId(),
//       title: {
//         he: 'כרטיסייה - כל השבוע',
//         eng: '12 Passes - All Week',
//       },
//       preview: {
//         he: '12 ביקורים במחיר מוזל',
//         eng: 'Visit us 12 times, discount price',
//       },
//       price: 800,
//       types: ['card'],
//       stockQuantity: true,
//       cover:
//         'https://res.cloudinary.com/dnxi70mfs/image/upload/v1729002831/picture_mz9ke7.jpg',
//     },
//     {
//       _id: makeId(),
//       title: {
//         he: 'כרטיסייה - אמצע השבוע',
//         eng: '12 Passes - Sunday-Thursday',
//       },
//       preview: {
//         he: '12 ביקורים במחיר מוזל',
//         eng: 'Visit us 12 times, discount price',
//       },
//       price: 600,
//       types: ['card'],
//       stockQuantity: true,
//       cover:
//         'https://res.cloudinary.com/dnxi70mfs/image/upload/v1729002473/20_rjsrgf.jpg',
//     },

//     {
//       _id: makeId(),
//       title: {
//         he: 'כובע ים',
//         eng: 'Swimming Cap',
//       },
//       preview: {
//         he: 'מתאים למבוגרים ולילדים',
//         eng: 'Suits adults and children',
//       },
//       price: 20,
//       types: ['accessories'],
//       stockQuantity: 30,
//       cover:
//         'https://res.cloudinary.com/dnxi70mfs/image/upload/v1729002558/HPIM0594_g0hqlu.jpg',
//     },
//     {
//       _id: makeId(),
//       title: {
//         he: 'משקפת שחייה',
//         eng: 'Swimming Goggles',
//       },
//       preview: {
//         he: 'מתאים למבוגרים ולילדים',
//         eng: 'Suits adults and children',
//       },
//       price: 40,
//       types: ['accessories'],
//       stockQuantity: 25,
//       cover:
//         'https://res.cloudinary.com/dnxi70mfs/image/upload/v1729002533/45_shdnag.jpg',
//     },
//     {
//       _id: makeId(),
//       title: {
//         he: 'מצופים - 3-6',
//         eng: 'Floats - 3-6',
//       },
//       preview: {
//         he: 'מתאים לגילאי 3-6',
//         eng: 'Suits children ages 3-6',
//       },
//       price: 40,
//       types: ['accessories'],
//       stockQuantity: 21,
//       cover:
//         'https://res.cloudinary.com/dnxi70mfs/image/upload/v1729002559/HPIM0347_vdpqdu.jpg',
//     },
//     {
//       _id: makeId(),
//       title: {
//         he: 'מצופים - 6-12',
//         eng: 'Floats - 6-12',
//       },
//       preview: {
//         he: 'מתאים לגילאי 6-12',
//         eng: 'Suits children ages 6-12',
//       },
//       price: 40,
//       types: ['accessories'],
//       stockQuantity: 13,
//       cover:
//         'https://res.cloudinary.com/dnxi70mfs/image/upload/v1729002831/picture_mz9ke7.jpg',
//     },
//   ]
//   localStorage.setGame(STORAGE_KEY, JSON.stringify(games))
// }
