import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { logout, updateUser } from '../../store/actions/user.actios'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import {
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material'
import ModeEditIcon from '@mui/icons-material/ModeEdit'
import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { uploadService } from '../../services/upload.service'
import { showErrorMsg } from '../../services/event-bus.service'
import { setIsLoading } from '../../store/actions/system.actions'

export function UserDetails() {
  const navigate = useNavigate()
  const user = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.user
  )
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const [open, setOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleOpen = () => setOpen(true)
  const handleClose = () => {
    setOpen(false)
    setSelectedFile(null)
    setPreviewUrl(null)
  }

  const handleSave = async () => {
    if (!selectedFile) {
      showErrorMsg(`Couldn't upload file`)
      return
    }
    try {
      setIsLoading(true)
      const res = await uploadService.uploadImg(selectedFile)

      if (!res.url || !user?.id) {
        showErrorMsg(`Couldn't upload file`)
        return
      }
      const userToSave = { ...user, imgUrl: res.url }

      await updateUser(userToSave)
    } catch (err) {
      console.log(err)

      showErrorMsg(`Couldn't upload file`)
    } finally {
      setIsLoading(false)
      setOpen(false)
      setSelectedFile(null)
      setPreviewUrl(null)
    }
  }

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    setSelectedFile(file || null)
    if (file) {
      setPreviewUrl(URL.createObjectURL(file))
    } else {
      setPreviewUrl(null)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  })

  if (!user)
    return (
      <div
        className={`user-details-container${
          prefs.isDarkMode ? ' dark-mode' : ''
        }`}
      >
        No user found.
      </div>
    )

  return (
    <div
      className={`user-details-container${
        prefs.isDarkMode ? ' dark-mode' : ''
      }`}
    >
      <div className='user-card'>
        <div className='img-container'>
          <img
            className='user-avatar'
            src={user.imgUrl || '/assets/img/user.png'}
            alt={user.fullname}
          />
          <div className='button-container'>
            <IconButton onClick={handleOpen}>
              <ModeEditIcon />
            </IconButton>
          </div>
        </div>
        <div className='user-info'>
          <h2 className='user-fullname'>{user.fullname}</h2>
          <p className='user-email'>{user.email}</p>
          {user.isGuest && <span className='user-guest'>Guest</span>}
        </div>
      </div>
      <button
        className='primary-button remove-button'
        onClick={() => {
          logout()
          navigate('/')
        }}
      >
        Logout
      </button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Edit Profile Image</DialogTitle>
        <DialogContent>
          <div
            {...getRootProps({
              className: `dropzone-area${isDragActive ? ' active' : ''}`,
            })}
          >
            <input {...getInputProps()} />
            {previewUrl ? (
              <img
                src={previewUrl}
                alt='Preview'
                className='dropzone-preview'
              />
            ) : (
              <p>
                {isDragActive
                  ? 'Drop the image here...'
                  : 'Drag and drop an image here, or click to select'}
              </p>
            )}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color='secondary'>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            color='primary'
            disabled={!selectedFile}
            // sx={{
            //   color: prefs.isDarkMode ? '#fff' : '',
            // }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
