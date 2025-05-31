import React, { useEffect, useState, useRef } from 'react'
import { useSelector } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'

import {
  socketService,
  SocketUser,
  SOCKET_EVENT_MEMBER_CHANGE,
} from '../../services/socket.service'

import { loadRoom } from '../../store/actions/room.actions'

import { RootState } from '../../store/store'
import { User } from '../../types/user/User'
import { MembersList } from '../../components/MembersList/MembersList'
import {
  registerWebRTCListeners,
  unregisterWebRTCListeners,
} from '../../services/webRTC/webRTC'
import { showErrorMsg } from '../../services/event-bus.service'
import { s } from 'framer-motion/client'

export function RoomPage() {
  const { id } = useParams()

  const navigate = useNavigate()

  const room = useSelector(
    (stateSelector: RootState) => stateSelector.roomModule.room
  )

  const user = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.user
  )

  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  let isCleanup = false // a guard to prevent state updates after unmount

  const localVideoRef = useRef<HTMLVideoElement | null>(null)
  const localStreamRef = useRef<MediaStream>(null)

  const [currMembers, setCurrentMembers] = useState<SocketUser[]>([])
  const [currRemoteStreams, setCurrRemoteStreams] = useState<MediaStream[]>([])

  useEffect(() => {
    setRoom()
  }, [id])
  useEffect(() => {
    console.log('RoomPage useEffect - room:', room)
  }, [room])

  useEffect(() => {
    handlePeerConnection()

    // CLEANUP: runs when component unmounts or room id/user changes
    return () => {
      isCleanup = true

      // 1) Leave the room so server updates other peers
      socketService.leaveRoom(id)

      // 2) Unregister all WebRTC listeners and close all connections
      unregisterWebRTCListeners(id)

      // 3) If we have a local media stream, stop all its tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop())
      }

      // 4) Clear any UI state if desired
      setCurrentMembers([])
      setCurrRemoteStreams([])
    }
  }, [id, user])

  // Optional: whenever remoteStreams changes, you can log or do additional effects
  useEffect(() => {
    console.log('Current remote streams:', currRemoteStreams)
  }, [currRemoteStreams])

  async function handlePeerConnection() {
    if (!id || !user) {
      navigate('/')
      return
    }

    // This immediately‐invoked async block:
    // 1) gets local media
    // 2) sets up all WebRTC listeners
    // 3) joins the room via socket
    isCleanup = false
    try {
      // 1) Get camera + mic
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })
      if (isCleanup) return // skip if unmounted already

      localStreamRef.current = stream
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      // 2) Register all WebRTC (offer/answer/ice/member‐change) listeners in one place
      registerWebRTCListeners(
        id,
        user.id,
        stream,
        (remoteStream) => {
          console.log('New remote stream added:', remoteStream)

          // Called whenever a new remote track arrives
          setCurrRemoteStreams((prev) => [...prev, remoteStream])
        },
        (members) => {
          members = members.filter((member) => member)
          // Called whenever the member list changes
          setCurrentMembers(members)
        }
      )

      // 3) Now that listeners are ready, tell the server who we are and join the room
      socketService.login({
        id: user.id,
        fullname: user.fullname,
        imgUrl: user.imgUrl,
      })
      socketService.joinRoom(id)
    } catch (err) {
      console.error('Error during WebRTC initialization:', err)
      // Show an error to the user as needed
    }
  }

  async function setRoom() {
    if (!id) return
    try {
      await loadRoom(id)
    } catch (error) {
      console.log('Error setting room:', error)
      showErrorMsg('Failed to set room details')
    }
  }

  if (room && room.host)
    return (
      <div className={`main ${prefs.isDarkMode ? 'dark-mode' : ''} room-page`}>
        <div className='video-container'>
          {/* 1) Local preview */}
          <video
            ref={(el) => {
              localVideoRef.current = el
              if (el && localStreamRef.current) {
                el.srcObject = localStreamRef.current
              }
            }}
            className='room-video'
            autoPlay
            playsInline
            muted
            style={{ width: 200, border: '1px solid #333', marginBottom: 12 }}
          />

          {/* 2) Remote previews */}
          {currRemoteStreams
            .filter(
              (stream, index, self) =>
                // Filter out duplicate streams based on their ID
                index === self.findIndex((s) => s.id === stream.id)
            )
            .map((stream, idx) => {
              console.log('---- Remote stream #', idx, '----')
              console.log('  videoTracks:', stream.getVideoTracks())
              console.log('  audioTracks:', stream.getAudioTracks())

              // if (
              //   JSON.stringify(stream) !== JSON.stringify(localStreamRef.current)
              // )
              return (
                <video
                  key={idx}
                  autoPlay
                  playsInline
                  ref={(el) => {
                    if (el) el.srcObject = stream
                  }}
                  style={{
                    width: 200,
                    border: '1px solid #555',
                    marginLeft: 12,
                  }}
                />
              )
            })}
        </div>

        <div className='room-info'>
          <h1>{room?.name}</h1>
          <p>Room ID: {id}</p>
          <p>Host: {room?.host.fullname}</p>
          {/* <p>Created at: {room?.created_at || 'Loading...'}</p> */}
          <p>Members: {currMembers.length}</p>
          <MembersList members={currMembers} />
          {/* <p>Status: {room?.is_private ? 'Private' : 'Public'}</p> */}
        </div>
      </div>
    )
}
