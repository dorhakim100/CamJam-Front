import { gameService } from '../../services/game/game.service'

import { Game } from '../../types/game/Game'
import { GameFilter } from '../../types/gameFilter/GameFilter'

export const SET_GAMES = 'SET_GAMES'
export const SET_GAME = 'SET_GAME'
// export const REMOVE_GAME = 'REMOVE_GAME'
// export const ADD_GAME = 'ADD_GAME'
// export const UPDATE_GAME = 'UPDATE_GAME'
export const SET_GAME_FILTER = 'SET_GAME_FILTER'

export interface GameState {
    games:Game[],
    game: Game,
    filter: GameFilter
    lastRemovedGame?: Game;
  
  }
  

  const initialState:GameState = {
    games: [],
    game: gameService.getEmptyGame(),
    filter: gameService.getDefaultFilter(),
  
  }


  export function gameReducer(state = initialState, action:any) {
    var newState = state
    // var games
    switch (action.type) {
      case SET_GAMES:
        newState = { ...state, games: action.games }
        break
      case SET_GAME:
        newState = { ...state, game: action.game }
        break
    //   case REMOVE_GAME:
    //     const lastRemovedGame = state.games.find(
    //       (game:Game) => game._id === action.gameId
    //     )
    //     games = state.games.filter((game:Game) => game._id !== action.gameId)
    //     newState = { ...state, games, lastRemovedGame }
    //     break
    //   case ADD_GAME:
    //     newState = { ...state, games: [...state.games, action.game] }
    //     break
    //   case UPDATE_GAME:
    //     games = state.games.map((game: Game) =>
    //       game._id === action.game._id ? action.game : game
    //     )
    //     newState = { ...state, games }
    //     break
     
      case SET_GAME_FILTER:
        newState = { ...state, filter: action.filter }
        break
      default:
    }
    return newState
  }
  