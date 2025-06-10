import React from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { NewRoomForm } from '../../types/NewRoomForm/NewRoomForm'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { saveRoom, setNewRoomModal } from '../../store/actions/room.actions'
import { label } from 'framer-motion/client'
import { showErrorMsg, showSuccessMsg } from '../../services/event-bus.service'

const inputs = [
  {
    type: 'search',
    id: 'room-name',
    name: 'name',
    placeholder: 'Room name',
    isLable: false,
  },
  {
    type: 'number',
    name: 'max_participants',
    id: 'max-participntes',
    isLable: true,
  },
  {
    type: 'checkbox',
    name: 'is_private',
    id: 'is-private',
    isLable: true,
  },

  {
    type: 'search',
    name: 'password',
    id: 'room-password',
    placeholder: 'Room password',
  },
]

export function NewRoomModal() {
  const isOpen = useSelector(
    (stateSelector: RootState) => stateSelector.roomModule.isNewRoomModalOpen
  )

  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const user = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.user
  )

  const [formData, setFormData] = useState<NewRoomForm>({
    name: '',
    max_participants: 10,
    is_private: false,
  })

  const [isNavigateModal, setIsNavigateModal] = useState(false)
  const [lastCreatedRoomId, setLastCreatedRoomId] = useState<string | null>(
    null
  )

  const navigate = useNavigate()

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // if (!event.target) return
    const { value, type, name } = event.target
    const key = name as keyof NewRoomForm

    if (type === 'checkbox') {
      const { checked } = event.target

      if (!checked) delete formData.password

      setFormData((prevData) => ({
        ...prevData,
        [key]: checked, // for checkbox, use checked property
      }))
      return
    }
    setFormData((prevData) => ({
      ...prevData,
      [key]: value,
    }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!user) return
    try {
      const roomToSave = {
        ...formData,
        max_participants: +formData.max_participants,
        host_id: user.id,
        created_at: new Date(),
      }

      const savedToom = await saveRoom(roomToSave)
      setLastCreatedRoomId(savedToom.id)
      setIsNavigateModal(true)
      setFormData({
        name: '',
        max_participants: 10,
        is_private: false,
      })
      showSuccessMsg('Room created successfully')
    } catch (err) {
      // console.log('Error creating room:', err);
      showErrorMsg('Error creating room, please try again later')
    }
  }

  const closeModal = () => {
    setNewRoomModal(false)
    setIsNavigateModal(false)
    setLastCreatedRoomId(null)
  }

  const handleNavigateToRoom = () => {
    const roomToNavigate = lastCreatedRoomId
    closeModal()
    navigate(`/room/${roomToNavigate}`)
  }

  if (isOpen)
    return (
      <div
        className='overlay'
        // style={
        //   {
        //   backgroundColor: 'rgba(0, 0, 0, 0.5)',
        //   }
        // }
        onClick={closeModal}
      >
        <div
          className={`new-room-modal ${prefs.isDarkMode ? 'dark-mode' : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
          <IconButton className='close-btn' onClick={closeModal}>
            <CloseIcon />
          </IconButton>
          {isNavigateModal ? (
            <div className='navigation-modal'>
              <h2>Room Created Successfully</h2>
              <p>
                You can now join the room with ID: <br />
                <span>{lastCreatedRoomId || 'N/A'}</span>
              </p>
              <button onClick={handleNavigateToRoom}>Enter Room</button>
            </div>
          ) : (
            <>
              <h2>Create New Room</h2>
              <form onSubmit={handleSubmit}>
                {inputs.map((input, index) => {
                  const { name, id, type, placeholder } = input
                  const key = name as keyof NewRoomForm
                  const fieldValue = formData[key]

                  return (
                    <div key={index} className='input-container'>
                      {input.isLable && (
                        <label htmlFor={input.id || name}>
                          {`${name.toUpperCase().slice(0, 1)}${name
                            .slice(1)
                            .replace('_', ' ')}`}
                        </label>
                      )}

                      {type === 'checkbox' ? (
                        <input
                          type='checkbox'
                          id={id}
                          name={name}
                          checked={Boolean(fieldValue)} // use checked for booleans
                          onChange={handleChange}
                        />
                      ) : (
                        // neglecting password field
                        input.name !== 'password' && (
                          <input
                            type={type}
                            id={id}
                            name={name}
                            placeholder={placeholder}
                            min={type === 'number' ? 2 : undefined}
                            // cast to string|number so TS is happy
                            value={fieldValue as string | number | undefined}
                            onChange={handleChange}
                          />
                        )
                      )}
                      {/* rendering the password field if is_private */}
                      {formData.is_private && input.name === 'password' && (
                        <>
                          <label htmlFor={input.id || name}>
                            {`${name.toUpperCase().slice(0, 1)}${name
                              .slice(1)
                              .replace('_', ' ')}`}
                          </label>
                          <input
                            type={'search'}
                            id={id}
                            name={name}
                            placeholder={placeholder}
                            required={formData.is_private}
                            // cast to string|number so TS is happy
                            value={(formData['password'] as string) || ''}
                            onChange={handleChange}
                          />
                        </>
                      )}
                    </div>
                  )
                })}

                <button type='submit'>Create Room</button>
              </form>{' '}
            </>
          )}
        </div>
      </div>
    )
}
