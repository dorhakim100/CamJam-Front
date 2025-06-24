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

import SearchIcon from '@mui/icons-material/Search'
import SettingsIcon from '@mui/icons-material/Settings'
import PersonIcon from '@mui/icons-material/Person'
import { userService } from '../../services/user/user.service.ts'
import { login, setRemembered } from '../../store/actions/user.actios.ts'
import { showErrorMsg } from '../../services/event-bus.service.ts'
import { loadRoom } from '../../store/actions/room.actions.ts'
import { PasswordRoom } from '../../types/PasswordRoom/PasswordRoom.ts'
import { RoomPasswordModal } from '../RoomPasswordModal/RoomPasswordModal.tsx'

import logo from '../../../public/logo.png'
import logoDark from '../../../public/logo-dark.png'

export function SearchBar() {
  const navigate = useNavigate()
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )
  const user = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.user
  )

  const isPrefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.isPrefs
  )

  const isHeader = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.isHeader
  )

  const [searchRoom, setSearchRoom] = useState<string>('')

  const [dropdownOptions, setDropdownOptions] = useState<DropdownOption[]>([])

  const [currentLogo, setCurrentLogo] = useState(logo)

  const [isPasswordModal, setIsPasswordModal] = useState(false)
  const [currPasswordModal, setCurrPasswordModal] =
    useState<PasswordRoom | null>(null)

  const onToggleMenu = () => {
    setIsHeader(!isHeader)
  }

  useEffect(() => {
    setCurrentLogo(prefs.isDarkMode ? logoDark : logo)
  }, [prefs.isDarkMode])

  useEffect(() => {
    let filteredRoutes
    const options = routes
      // .filter((route) => {
      //   const lastIdx = route.path.length
      //   const startIdx = route.path.length - 4
      //   const slice = route.path.slice(startIdx, lastIdx)
      //   return slice !== '/:id'
      // })
      .filter((route) => !route.path.endsWith('/:id'))
      .map((route) => {
        return {
          title: route.title,
          onClick: (): void => {
            navigate(route.path)
          },
        }
      })
    if (user && !user.isGuest)
      filteredRoutes = options.filter((option) => option.title !== 'Sign in')
    else filteredRoutes = options.filter((option) => option.title !== 'Profile')

    setDropdownOptions(filteredRoutes)
  }, [user])

  useEffect(() => {
    const setRememberedUser = async () => {
      try {
        const remembered = await userService.getRememberedUser()

        if (!remembered) return

        setRemembered(remembered)

        const cred = {
          email: remembered.email,
          password: '',
          isRemember: true,
        }

        await login(cred)
      } catch (err) {
        // // console.log(err)

        showErrorMsg(`Couldn't load saved user`)
      }
    }
    setRememberedUser()
  }, [])

  const onHandleSearchChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    ev.preventDefault()
    const { value } = ev.target
    setSearchRoom(value)

    // Navigate to the room list with the search query
    // if (value) {
    //   navigate(`/room?search=${value}`)
    // } else {
    //   navigate('/room')
    // }
  }

  const navigateToRoom = async () => {
    try {
      if (!searchRoom) {
        showErrorMsg('Please enter a room id')
        return
      }
      if (!user) {
        showErrorMsg('Please sign in to search for rooms')
        return
      }

      // Navigate to the room list with the search query

      const roomToSearch = await loadRoom(searchRoom)
      if (!roomToSearch) {
        showErrorMsg('Room not found')
        return
      }

      if (roomToSearch.is_private && roomToSearch.password) {
        setCurrPasswordModal({
          roomId: roomToSearch.id,
          password: roomToSearch.password || '',
        })
        setIsPasswordModal(true)
        setSearchRoom('')
        return
      } else {
        navigate(`/room/${roomToSearch.id}`)
        setSearchRoom('')
      }
    } catch (error) {
      // console.error('Error navigating to room:', error)
      showErrorMsg('Error navigating to room')
    }
  }

  const preventSubmit = (ev: React.KeyboardEvent<HTMLFormElement>) => {
    ev.preventDefault()
  }

  const handleEnterClick = (ev: React.KeyboardEvent<HTMLFormElement>) => {
    if (ev.key !== 'Enter') return
    navigateToRoom()
  }

  const navigateToUser = () => {
    if (user) navigate(`/user/${user.id}`)
  }
  const navigateToHome = () => {
    navigate(`/`)
  }

  return (
    <>
      {isPasswordModal && currPasswordModal && (
        <RoomPasswordModal
          roomData={currPasswordModal}
          setIsPasswordModal={setIsPasswordModal}
        />
      )}
      <div className='search-bar-container'>
        <Paper
          component='form'
          sx={{
            p: '2px 4px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 100,
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            backgroundColor: prefs.isDarkMode ? '#333' : '#fff',
          }}
          onSubmit={preventSubmit}
          onKeyUp={handleEnterClick}
        >
          <div className='logo-container' onClick={navigateToHome}>
            <img src={currentLogo} alt='' />
          </div>

          <div
            className={`search-container ${
              prefs.isDarkMode ? 'dark-mode' : ''
            }`}
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
              onChange={onHandleSearchChange}
              value={searchRoom}
              // type='search'
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
              onClick={navigateToRoom}
            >
              <SearchIcon />
            </IconButton>
          </div>
          <div className='buttons-container'>
            {user && !user.isGuest && (
              <div className='profile-container'>
                <IconButton
                  color='primary'
                  sx={{
                    p: '10px',
                    color: prefs.isDarkMode ? '#fff' : '#000',
                    '&:focus': {
                      outline: 'none',
                    },
                  }}
                  onClick={navigateToUser}
                >
                  <PersonIcon />
                </IconButton>
              </div>
            )}
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
            <div className='menu-container'>
              <DropdownMenu options={dropdownOptions} />
            </div>
          </div>
        </Paper>
      </div>
    </>
  )
}
