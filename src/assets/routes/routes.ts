// routes.ts
import React from 'react'

import { Home } from '../../pages/Home/Home'
import { About } from '../../pages/About/About'
import { RoomList } from '../../pages/RoomList/RoomList.tsx'
import { RoomPage } from '../../pages/RoomPage/RoomPage.tsx'
import { UserDetails } from '../../pages/UserDetails/UserDetails.tsx'

import { SignIn } from '../../CustomMui/SignIn/SignIn.tsx'

export interface Route {
  title: string
  path: string
  element: React.ComponentType
}

export const routes: Route[] = [
  {
    title: 'Home',
    path: '/',
    element: Home,
  },

  {
    title: 'Sign in',
    path: '/signin',
    element: SignIn,
  },
  {
    title: 'Profile',
    path: '/user/:id',
    element: UserDetails,
  },
  {
    title: 'Rooms',
    path: '/room',
    element: RoomList,
  },
  {
    title: 'Room Page',
    path: '/room/:id',
    element: RoomPage,
  },
  {
    title: 'About',
    path: '/about',
    element: About,
  },
]
