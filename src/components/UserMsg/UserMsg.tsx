import React, { useState, useEffect, useRef } from 'react'
import { eventBus } from '../../services/event-bus.service'

import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'

interface UserMsgData {
  txt: string
  type: 'success' | 'error'
}

export const UserMsg: React.FC = () => {
  const [msg, setMsg] = useState<UserMsgData | null>(null)
  // const msg = {
  //   txt: 'This is a message',
  //   type: 'success' as 'success' | 'error',
  // }
  const timeoutIdRef = useRef<number | null>(null)

  useEffect(() => {
    const unsubscribe = eventBus.on('show-msg', (incomingMsg: UserMsgData) => {
      setMsg(incomingMsg)

      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current)
      }

      // window.setTimeout returns a number in browsers
      timeoutIdRef.current = window.setTimeout(closeMsg, 3000)
    })

    return () => {
      unsubscribe()
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current)
      }
    }
  }, [])

  const closeMsg = () => {
    setMsg(null)
  }

  const className = `user-msg ${msg?.type ?? ''} ${msg ? 'visible' : ''}`

  return (
    <section className={className}>
      {msg && (
        <Alert severity={msg.type}>
          <AlertTitle>
            {msg.type === 'success' ? 'Success' : 'Error'}
          </AlertTitle>
          {msg.txt}
        </Alert>
      )}
    </section>
  )
}
