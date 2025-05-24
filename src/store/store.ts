import { legacy_createStore as createStore, combineReducers } from 'redux'

import { roomReducer } from './reducers/room.reducer.ts'
import { systemReducer } from './reducers/system.reducer.ts'
import { userReducer } from './reducers/user.reducer.ts'

const rootReducer = combineReducers({
  roomModule: roomReducer,
  systemModule: systemReducer,
  userModule: userReducer,
})

export const store = createStore(rootReducer, undefined)

export type RootState = ReturnType<typeof rootReducer>
