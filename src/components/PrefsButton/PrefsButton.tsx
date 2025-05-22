import { useRef } from 'react'
import { useSelector } from 'react-redux'

import { setIsPrefs } from '../../store/actions/system.actions'

import { RootState } from '../../store/store'

import SettingsIcon from '@mui/icons-material/Settings'
import TranslateIcon from '@mui/icons-material/Translate'

export function PrefsButton() {
  const isVisible = useSelector(
    (storeState: RootState) => storeState.systemModule.isPrefs
  )
  console.log(isVisible)

  // const buttonRef = useRef<HTMLButtonElement>(null)

  // function spinButton() {
  //   if (buttonRef.current) {
  //     buttonRef.current.style.transition = '0.2s'
  //   }
  // }
  return (
    <button
      className='prefs-button'
      // ref={buttonRef}
      onClick={() => {
        // spinButton()

        setIsPrefs(!isVisible)
      }}
    >
      <TranslateIcon />
      <SettingsIcon className='settings-btn' />
    </button>
  )
}
