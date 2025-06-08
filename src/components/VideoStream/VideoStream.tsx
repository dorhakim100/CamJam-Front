import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { SocketUser } from '../../services/socket.service'

import { BsFillCameraVideoFill } from 'react-icons/bs'
import { BsFillCameraVideoOffFill } from 'react-icons/bs'
import { CiMicrophoneOn } from 'react-icons/ci'
import { CiMicrophoneOff } from 'react-icons/ci'
import { LocalTracks } from '../../types/LocalTracks/LocalTracks'
import { showErrorMsg } from '../../services/event-bus.service'

export function VideoStream({
  member,
  label,
  isRemote,
  isHost = false,
  remoteVideosRef,
  localVideoRef,
  localTracks,
  disableMedia,
  initializeMedia,
}: {
  member: SocketUser
  label: string
  isRemote: boolean
  isHost?: boolean
  remoteVideosRef: React.MutableRefObject<Map<string, HTMLVideoElement>>
  localVideoRef?: React.MutableRefObject<HTMLVideoElement | null>
  localTracks?: LocalTracks
  disableMedia?: (type: string) => Promise<void>
  initializeMedia?: (isRestart: boolean) => Promise<void>
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
        if (!disableMedia || !initializeMedia) return

        const stateToSet = localTracks?.audio ? false : true
        try {
          if (!stateToSet) {
            disableMedia('audio')
          } else initializeMedia(true)
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
        if (!disableMedia || !initializeMedia) return

        const stateToSet = localTracks?.video ? false : true
        try {
          if (!stateToSet) {
            disableMedia('video')
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
          muted={!isRemote} // Mute local video
        />
        <div className='label'>{label}</div>
        <div className='buttons-container'>
          {buttons.map((button) => {
            return (
              <button onClick={button.action}>
                <span className='icon'>{button.icon}</span>
                {/* <span>{button.label}</span> */}
              </button>
            )
          })}
        </div>
      </div>
    )
}
