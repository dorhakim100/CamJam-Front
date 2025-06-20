import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { SocketUser } from '../../services/socket.service'

import { BsFillCameraVideoFill } from 'react-icons/bs'
import { BsFillCameraVideoOffFill } from 'react-icons/bs'
import { CiMicrophoneOn } from 'react-icons/ci'
import { CiMicrophoneOff } from 'react-icons/ci'
import { LocalTracks } from '../../types/LocalTracks/LocalTracks'
import { showErrorMsg, showSuccessMsg } from '../../services/event-bus.service'
import { TracksState } from '../../types/TracksState/TracksState'
import { BsMicMuteFill } from 'react-icons/bs'
import { PiPhoneDisconnectBold } from 'react-icons/pi'
import { removeRoom } from '../../store/actions/room.actions'

export function VideoStream({
  member,
  label,
  isRemote,
  isHost = false,
  remoteVideosRef,
  localVideoRef,
  localTracks,
  toggleMedia,
  initializeMedia,
  tracksState,
}: {
  member: SocketUser
  label: string
  isRemote: boolean
  isHost?: boolean
  remoteVideosRef: React.MutableRefObject<Map<string, HTMLVideoElement>>
  localVideoRef?: React.MutableRefObject<HTMLVideoElement | null>
  localTracks?: LocalTracks
  toggleMedia?: (stateToSet: TracksState) => Promise<void>
  initializeMedia?: (isRestart: boolean) => Promise<void>
  tracksState?: TracksState
}) {
  const room = useSelector(
    (stateSelector: RootState) => stateSelector.roomModule.room
  )

  const user = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.user
  )

  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const [isVisble, setIsVisible] = useState(true)
  const [isAudio, setIsAudio] = useState(true)

  const buttons = [
    {
      label: 'Mute',
      action: () => {
        if (!toggleMedia || !initializeMedia) return

        // const stateToSet = localTracks?.audio ? false : true
        const stateToSet = isAudio ? false : true
        const state = {
          audio: stateToSet,
          video: localTracks?.video ? true : false,
        }
        try {
          // if (!stateToSet) {
          //   toggleMedia('audio')
          // } else initializeMedia(true)
          toggleMedia(state)
          setIsAudio(stateToSet)
        } catch (error) {
          // console.error('Error toggling video:', error)
          showErrorMsg('Failed to toggle audio')
        }
      },
      id: 'mute-toggle-button',
      icon: isAudio ? (
        <CiMicrophoneOn className='icon' />
      ) : (
        <CiMicrophoneOff className='icon' />
      ),
      color: '#2D8CFF',
    },
    {
      label: 'Camera',
      action: () => {
        if (!toggleMedia || !initializeMedia) return

        const stateToSet = localTracks?.video ? false : true
        const state = {
          video: stateToSet,
          audio: localTracks?.audio ? true : false,
        }
        try {
          if (!stateToSet) {
            toggleMedia(state)
          } else initializeMedia(true)
          setIsVisible(stateToSet)
        } catch (error) {
          // console.error('Error toggling video:', error)
          showErrorMsg('Failed to toggle video')
        }
      },
      id: 'video-toggle-button',
      icon: isVisble ? (
        <BsFillCameraVideoFill className='icon' />
      ) : (
        <BsFillCameraVideoOffFill className='icon' />
      ),
      color: '#F26D21',
    },
    {
      label: 'End',
      action: () => {
        if (!room || !user) {
          showErrorMsg(`Couldn't end meeting`)
          return
        }
        removeRoom(room, user)
      },
      statement: user && user.id === room?.host_id,
      id: 'end-meeting-button',
      icon: <PiPhoneDisconnectBold />,
      color: '#e53935',
    },
  ]

  const handleVideoRef = (element: HTMLVideoElement | null) => {
    if (element) {
      if (!isRemote && localVideoRef) {
        localVideoRef.current = element
      } else if (member.socketId) {
        remoteVideosRef.current.set(member.socketId, element)
      }
      element.autoplay = true
      element.playsInline = true

      element.onloadedmetadata = () => {
        const playPromise = element.play()
        if (playPromise) {
          playPromise.catch((e) => {
            console.log(e)
          })
        }
      }

      // Ensure srcObject is set if it already exists
      const streamToSet =
        !isRemote && localVideoRef?.current?.srcObject
          ? localVideoRef.current.srcObject
          : member.socketId
          ? remoteVideosRef.current.get(member.socketId)?.srcObject
          : undefined

      if (streamToSet && element.srcObject !== streamToSet) {
        element.srcObject = streamToSet
        const playPromise = element.play()
        if (playPromise) {
          playPromise.catch((e) => {
            console.log(e)
          })
        }
      }
    }
  }

  useEffect(() => {
    const arr = [...remoteVideosRef.current.values()]
    arr.forEach((videoElement) => {
      console.log(videoElement)
    })
  }, [remoteVideosRef.current])

  if (member)
    return (
      <div
        key={member.socketId}
        className={`video-container ${isHost ? 'host' : ''} ${
          isRemote ? 'remote' : 'local'
        } ${prefs.isDarkMode ? 'dark-mode' : ''} ${
          user?.id === member.id ? 'self' : ''
        }`}
      >
        {(!member.isAudioOn || !isAudio) && (
          <div className='mute-container'>
            <BsMicMuteFill />
          </div>
        )}

        {!isRemote && localTracks && !isVisble && (
          <div className='video-off'>
            <img src={member.imgUrl} alt='' />
            <span>Video off</span>
          </div>
        )}
        {isRemote && !member.isVideoOn && (
          <div className='video-off'>
            <img src={member.imgUrl} alt='' />
            <span>Video off</span>
          </div>
        )}

        <video
          ref={handleVideoRef}
          // muted={!isRemote} // Mute local video
          muted={!isRemote || !tracksState?.audio ? true : false} // Mute local video
        />
        <div className='label'>{label}</div>
        <div className='buttons-container'>
          {buttons.map((button, idx) => {
            // renders the button if statement is undefuend, or if the statement is true
            if (button.statement ?? true)
              return (
                <button onClick={button.action} key={button.label + idx}>
                  <span className='icon'>{button.icon}</span>
                  {/* <span>{button.label}</span> */}
                </button>
              )
          })}
        </div>
      </div>
    )
}
