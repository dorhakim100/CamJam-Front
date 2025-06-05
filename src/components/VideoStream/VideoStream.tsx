import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { SocketUser } from '../../services/socket.service'

export function VideoStream({
  member,
  label,
  isRemote,
  isHost = false,
  remoteVideosRef,
  localVideoRef,
}: {
  member: SocketUser
  label: string
  isRemote: boolean
  isHost?: boolean
  remoteVideosRef: React.MutableRefObject<Map<string, HTMLVideoElement>>
  localVideoRef?: React.MutableRefObject<HTMLVideoElement | null>
}) {
  const room = useSelector(
    (stateSelector: RootState) => stateSelector.roomModule.room
  )

  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

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

  if (member)
    return (
      <div
        key={member.socketId}
        className={`video-container ${isHost ? 'host' : ''} ${
          isRemote ? 'remote' : 'local'
        } ${prefs.isDarkMode ? 'dark-mode' : ''}`}
      >
        <video
          ref={handleVideoRef}
          muted={!isRemote} // Mute local video
        />
        <div className='label'>{label}</div>
      </div>
    )
}
