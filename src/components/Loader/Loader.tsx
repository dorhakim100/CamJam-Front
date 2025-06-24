import React from 'react'
import Lottie from 'lottie-react'
import { useSelector } from 'react-redux'
import animationData from '../../../public/loader-animation.json'
import { RootState } from '../../store/store'

export function Loader() {
  const isLoading = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.isLoading
  )

  return (
    isLoading && (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          // height: '100%',
        }}
        className='loader-container'
      >
        <Lottie
          animationData={animationData}
          loop={true}
          style={{ width: 120, height: 120 }}
        />
      </div>
    )
  )
}
