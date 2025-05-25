import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Routes, Route } from 'react-router'

import { routes } from './assets/routes/routes'

import { AppHeader } from './components/AppHeader/AppHeader'
import { AppFooter } from './components/AppFooter/AppFooter.tsx'
import { Prefs } from './components/Prefs/Prefs'
import { PrefsButton } from './components/PrefsButton/PrefsButton.tsx'
import { UserMsg } from './components/UserMsg/UserMsg.tsx'

import { RootState } from './store/store.ts'

import './App.css'
import { SearchBar } from './components/SearchBar/SearchBar.tsx'
import { socketService } from './services/socket.service'

function App() {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const user = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.user
  )

  useEffect(() => {
    if (prefs.isDarkMode) {
      document.body.classList.add('dark-mode')
    } else {
      document.body.classList.remove('dark-mode')
    }
  }, [prefs])

  useEffect(() => {
    socketService.setup()
    return () => {
      socketService.terminate()
    }
  }, [])

  return (
    <>
      <AppHeader routes={routes} />
      <Prefs />
      {/* <PrefsButton /> */}
      <UserMsg />
      <main className={`main ${prefs.isDarkMode ? 'dark-mode' : ''}`}>
        <SearchBar />
        <Routes>
          {routes.map((route, index) => {
            if (user && route.path === '/signin') return

            return (
              <Route
                key={index}
                path={route.path}
                element={<route.element />}
              />
            )
          })}
        </Routes>
      </main>
      <AppFooter />
    </>
  )
}

export default App
