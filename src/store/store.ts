import { legacy_createStore as createStore, combineReducers } from 'redux'

import { gameReducer } from './reducers/game.reducer'
import { systemReducer } from './reducers/system.reducer.ts'



const rootReducer = combineReducers({
    gameModule: gameReducer,
    systemModule: systemReducer,
    // userModule: userReducer,
  })

  export const store = createStore(rootReducer, undefined)

export type RootState = ReturnType<typeof rootReducer>;