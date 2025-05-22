import React from 'react'

interface ShadowOverlayProps {
  isVisble: boolean
  handleClose: () => void
}

export function ShadowOverlay({ isVisble, handleClose }: ShadowOverlayProps) {
  return isVisble && <div className='overlay' onClick={handleClose}></div>
}
