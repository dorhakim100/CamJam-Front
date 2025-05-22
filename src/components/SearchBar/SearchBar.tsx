import * as React from 'react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useSelector } from 'react-redux'

import { setIsHeader, setIsPrefs } from '../../store/actions/system.actions'

import { RootState } from '../../store/store'
import { routes } from '../../assets/routes/routes'
import { DropdownMenu } from '../DropdownMenu/DropdownMenu'

import { DropdownOption } from '../../types/DropdownOption.ts'

import Paper from '@mui/material/Paper'
import InputBase from '@mui/material/InputBase'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'
import MenuOpenIcon from '@mui/icons-material/MenuOpen'
import SearchIcon from '@mui/icons-material/Search'
import SettingsIcon from '@mui/icons-material/Settings'

export function SearchBar() {
  const navigate = useNavigate()
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )
  const isPrefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.isPrefs
  )

  const isHeader = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.isHeader
  )

  const [dropdownOptions, setDropdownOptions] = useState<DropdownOption[]>([])

  const onToggleMenu = () => {
    setIsHeader(!isHeader)
  }

  useEffect(() => {
    const options = routes.map((route) => {
      return {
        title: route.title,
        onClick: (): void => {
          navigate(route.path)
        },
      }
    })
    setDropdownOptions(options)
  }, [])

  return (
    <div className='search-bar-container'>
      <Paper
        component='form'
        sx={{
          p: '2px 4px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 1,
          position: 'fixed',
          top: '0',
          left: '0',
          right: '0',
          backgroundColor: prefs.isDarkMode ? '#333' : '#fff',
        }}
      >
        <div className='menu-container'>
          <DropdownMenu options={dropdownOptions} />
        </div>
        <div
          className={`search-container ${prefs.isDarkMode ? 'dark-mode' : ''}`}
        >
          <InputBase
            sx={{
              ml: 1,
              flex: 1,
              p: '10px',
              color: prefs.isDarkMode ? '#fff' : '#000',

              '&:focus': {
                // outline: 'none',
              },
            }}
            placeholder='Search meeting'
            inputProps={{ 'aria-label': 'search google maps' }}
          />
          <IconButton
            type='button'
            sx={{
              p: '10px',
              color: prefs.isDarkMode ? '#fff' : '#000',
              '&:focus': {
                outline: 'none',
              },
            }}
            aria-label='search'
          >
            <SearchIcon />
          </IconButton>
        </div>
        <div className='settings-container'>
          <Divider sx={{ height: 28, m: 0.5 }} orientation='vertical' />
          <IconButton
            color='primary'
            className='prefs-button'
            sx={{
              p: '10px',
              '&:focus': {
                outline: 'none',
              },
            }}
            aria-label='directions'
            onClick={() => {
              setIsPrefs(!isPrefs)
            }}
          >
            <SettingsIcon className='settings-btn' />
          </IconButton>
        </div>
      </Paper>
    </div>
  )
}
