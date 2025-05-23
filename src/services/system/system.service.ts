import { Prefs } from '../../types/system/Prefs'

const KEY = 'CamJam-prefs'

export const systemService = {
  getPrefs,
  setPrefs,
}

function getPrefs(): Prefs {
  const entityType = KEY
  let prefs: Prefs
  const stored = localStorage.getItem(entityType)

  if (!stored) {
    prefs = { isDarkMode: false }
    setPrefs(prefs)
  } else {
    try {
      prefs = JSON.parse(stored) as Prefs
    } catch (error) {
      prefs = { isDarkMode: false }
      setPrefs(prefs)
    }
  }

  return prefs
}

function setPrefs(prefs: Prefs) {
  const entityType = KEY

  localStorage.setItem(entityType, JSON.stringify(prefs))
}
