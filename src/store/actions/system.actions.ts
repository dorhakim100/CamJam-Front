import { store } from '../store'
import { Prefs } from '../../types/system/Prefs'
import { systemService } from '../../services/system/system.service'

import {
  LOADING_START,
  LOADING_DONE,
  SET_PREFS,
  SET_IS_HEADER,
  SET_IS_ACCESSIBILITY,
  SET_IS_PREFS,
  SET_IS_MODAL,
  SET_MODAL_MESSAGE,
  SET_SHOWED_UPDATE_MESSAGE,
} from '../reducers/system.reducer'

export function setIsLoading(stateToSet: boolean) {
  stateToSet
    ? store.dispatch({ type: LOADING_START })
    : store.dispatch({ type: LOADING_DONE })
}

export function setPrefs(prefsToSet: Prefs) {
  const prefs = { ...prefsToSet }

  systemService.setPrefs(prefs)
  store.dispatch({ type: SET_PREFS, prefs })
}
export function setIsPrefs(stateToSet: boolean) {
  store.dispatch({ type: SET_IS_PREFS, isPrefs: stateToSet })
}

export function setIsHeader(stateToSet: boolean) {
  store.dispatch({ type: SET_IS_HEADER, isHeader: stateToSet })
}
export function setIsAccessibility(stateToSet: boolean) {
  store.dispatch({ type: SET_IS_ACCESSIBILITY, isAccessibility: stateToSet })
}

export function setIsModal(stateToSet: boolean) {
  store.dispatch({ type: SET_IS_MODAL, isModal: stateToSet })
}
export function setModalMessage(messageToSet: string) {
  store.dispatch({ type: SET_MODAL_MESSAGE, modalMessage: messageToSet })
}

export function onClosePrefsHeader() {
  setIsPrefs(false)
  setIsHeader(false)
}
