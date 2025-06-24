import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { showErrorMsg } from '../../services/event-bus.service';

import { IconButton } from '@mui/material';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';

import { RootState } from '../../store/store';



export function RoomPasswordModal({roomData,setIsPasswordModal}: {roomData:{roomId:string,password:string},setIsPasswordModal: (isOpen: boolean) => void}) {

    const prefs = useSelector((stateSelector: RootState) => stateSelector.systemModule.prefs)
    const navigate = useNavigate()
  
    const [password, setPassword] = useState<string>('')
  
    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(e.target.value)
    }
    const checkPassword = ()=>{
      if (roomData.password && roomData.password !== password) {
        showErrorMsg('Incorrect password')
        return
      }
      setIsPasswordModal(false)
      navigate(`/room/${roomData.roomId}`)
  
    }

    const closeModal = ()=>{
        setIsPasswordModal(false)

    }

    useEffect(()=>{
        console.log('RoomPasswordModal mounted', roomData);
        
    },[roomData])

    return <div className="overlay" onClick={closeModal}>
  
    
    <div className={`password-modal-container ${prefs.isDarkMode ? 'dark-mode':''}`}       onClick={(e) => e.stopPropagation()}>
      <IconButton
        className='close-button'
        onClick={closeModal}
      >
        <KeyboardReturnIcon />
      </IconButton>
      <h2>Room Password Required</h2>
      <p>Please enter the password to join this room.</p>
      <input type="search" name="" id="" value={password} onChange={handlePasswordChange} />
      <button
      className='primary-button'
        disabled={!password}
        onClick={checkPassword}
        >
        Enter Password
      </button>
    </div>
  
        </div>
  }
  
  