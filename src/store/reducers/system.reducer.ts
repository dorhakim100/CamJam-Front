// import { userService } from '../../services/user/user.service'
import { systemService } from '../../services/system/system.service.ts'
import { Prefs } from '../../types/system/Prefs.ts'

export const LOADING_START = 'LOADING_START'
export const LOADING_DONE = 'LOADING_DONE'
export const SET_IS_HEADER = 'SET_IS_HEADER'
export const SET_IS_ACCESSIBILITY = 'SET_IS_ACCESSIBILITY'
export const SET_IS_PREFS = 'SET_IS_PREFS'
export const SET_PREFS = 'SET_PREFS'
export const SET_IS_MODAL = 'SET_IS_MODAL'
export const SET_MODAL_MESSAGE = 'SET_MODAL_MESSAGE'
export const SET_SHOWED_UPDATE_MESSAGE = 'SET_SHOWED_UPDATE_MESSAGE'

export interface SystemState {
  isLoading: boolean
  prefs: Prefs
  isHeader: boolean
  isAccessibility: boolean

  isPrefs: boolean
  isModal: boolean
  modalMessage: string
}

const initialState: SystemState = {
  isLoading: false,
  prefs: systemService.getPrefs(),
  isHeader: false,
  isAccessibility: false,
  isPrefs: false,

  isModal: false,
  modalMessage: '',
}

export function systemReducer(state = initialState, action: any = {}) {
  switch (action.type) {
    case LOADING_START:
      return { ...state, isLoading: true }
    case LOADING_DONE:
      return { ...state, isLoading: false }
    case SET_IS_ACCESSIBILITY:
      return { ...state, isAccessibility: action.isAccessibility }
    case SET_IS_HEADER:
      return { ...state, isHeader: action.isHeader }
    case SET_IS_PREFS:
      return { ...state, isPrefs: action.isPrefs }
    case SET_PREFS:
      return { ...state, prefs: action.prefs }
    case SET_IS_MODAL:
      return { ...state, isModal: action.isModal }
    case SET_MODAL_MESSAGE:
      return { ...state, modalMessage: action.modalMessage }
    case SET_SHOWED_UPDATE_MESSAGE:
      return { ...state, showedUpdateMessage: action.showedUpdateMessage }
    default:
      return state
  }
}
