import React, { useState } from 'react'
import { useSelector } from 'react-redux'

import {
  setPrefs,
  setIsPrefs,
  onClosePrefsHeader,
} from '../../store/actions/system.actions'

import { DarkModeSwitch } from '../DarkModeSwitch/DarkModeSwitch'

import CloseIcon from '@mui/icons-material/Close'

import { RootState } from '../../store/store'
import { ShadowOverlay } from '../ShadowOverlay/ShadowOverlay'

export function Prefs() {
  const prefs = useSelector(
    (storeState: RootState) => storeState.systemModule.prefs
  )
  const isPrefs = useSelector(
    (storeState: RootState) => storeState.systemModule.isPrefs
  )

  const isHeader = useSelector(
    (storeState: RootState) => storeState.systemModule.isHeader
  )

  const [darkMode, setDarkMode] = useState(prefs.isDarkMode)

  function onSetPrefs(type: string) {
    let newPrefs
    switch (type) {
      case 'lang':
        const newLang = !prefs.isEnglish
        newPrefs = { ...prefs, isEnglish: newLang }
        setPrefs(newPrefs)
        // closePrefsModal()
        return

      case 'darkMode':
        const newMode = !prefs.isDarkMode
        newPrefs = { ...prefs, isDarkMode: newMode }
        setDarkMode(newMode)
        setPrefs(newPrefs)
        // closePrefsModal()
        return

      default:
        break
    }
  }

  const closePrefsModal = () => setIsPrefs(false)
  return (
    <>
      <ShadowOverlay
        isVisble={isHeader || isPrefs}
        handleClose={onClosePrefsHeader}
      />
      <div
        className={`prefs-panel ${isPrefs ? 'visible' : ''} ${
          prefs.isDarkMode ? 'dark-mode' : ''
        }`}
        // onMouseLeave={closePrefsModal}
      >
        <div className='close-container' onClick={closePrefsModal}>
          <CloseIcon />
        </div>
        <div className='prefs-control'>
          {/* <LanguageSwitch
            onClick={() => onSetPrefs('lang')}
            checked={!prefs.isEnglish}
          /> */}
          <DarkModeSwitch
            onClick={() => onSetPrefs('darkMode')}
            checked={prefs.isDarkMode}
          />
          {/* <button onClick={() => onSetPrefs('lang')}>
          {prefs.isEnglish ? 'Hebrew' : 'אנגלית'}
          <LanguageIcon />
        </button>
        <button onClick={() => onSetPrefs('darkMode')}>
          {prefs.isDarkMode
            ? prefs.isEnglish
              ? 'Light mode'
              : 'מסך בהיר'
            : prefs.isEnglish
            ? 'Dark mode'
            : 'מסך כהה'}
          {prefs.isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}{' '}
        </button> */}
        </div>
      </div>{' '}
    </>
  )
}
