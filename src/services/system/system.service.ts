import {Prefs} from '../../types/system/Prefs'


const KEY = 'prefs'

export const systemService = {
    getPrefs,
    setPrefs
}




function getPrefs(): Prefs {
    const entityType = KEY
    let prefs: Prefs
    const stored = localStorage.getItem(entityType);

    if (!stored) {
      prefs = { isEnglish: false, isDarkMode: false }
        setPrefs(prefs)
    } else {
        try {
            prefs = JSON.parse(stored) as Prefs 
            
        } catch (error) {
            prefs = { isEnglish: false, isDarkMode: false };
            setPrefs(prefs)
            
        }
    }
    
    return prefs
}

function setPrefs(prefs:Prefs) {
    const entityType = 'prefs'
    
    localStorage.setItem(entityType, JSON.stringify(prefs))
}