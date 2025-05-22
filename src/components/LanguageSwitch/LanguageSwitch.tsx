import * as React from 'react'
import { styled } from '@mui/material/styles'
import Switch from '@mui/material/Switch'

export const LanguageSwitch = styled(Switch)(({ theme }) => ({
  width: 80, // overall width of the switch
  height: 44, // overall height of the switch
  padding: 10, // extra padding for a larger feel
  '& .MuiSwitch-switchBase': {
    margin: 2, // adjust margin to suit new dimensions
    padding: 0,
    transform: 'translateX(8px)', // starting position for unchecked state
    '&.Mui-checked': {
      transform: 'translateX(36px)', // move the thumb to the right when checked
      '& .MuiSwitch-thumb:before': {
        content: '"עברית"',
      },
    },
  },

  '& .MuiSwitch-thumb': {
    backgroundColor: '#001e3c',
    width: 40, // larger thumb width
    height: 40, // larger thumb height
    position: 'relative',
    '&:before': {
      content: '"ENG"',
      position: 'absolute',
      width: '100%',
      height: '100%',
      left: 0,
      top: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontSize: '0.9rem',
    },
  },
  '& .MuiSwitch-track': {
    opacity: 1,
    backgroundColor: '#aab4be',
    borderRadius: 44 / 2, // half the height for a fully rounded track
  },
  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
    opacity: 1,
    backgroundColor: '##aab4be', // example: a different color when checked
  },
}))

// Usage in a component:
// <LargeLanguageSwitch
//   checked={isHebrew}
//   onChange={(e) => setIsHebrew(e.target.checked)}
// />
