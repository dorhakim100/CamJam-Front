import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Routes, Route } from 'react-router'

import { routes } from './assets/routes/routes'

import { AppHeader } from './components/AppHeader/AppHeader'
import { AppFooter } from './components/AppFooter/AppFooter.tsx'
import { Prefs } from './components/Prefs/Prefs'
import { PrefsButton } from './components/PrefsButton/PrefsButton.tsx'

import { RootState } from './store/store.ts'

import './App.css'
import { SearchBar } from './components/SearchBar/SearchBar.tsx'

function App() {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  useEffect(() => {
    if (prefs.isDarkMode) {
      document.body.classList.add('dark-mode')
    } else {
      document.body.classList.remove('dark-mode')
    }
  }, [prefs])

  return (
    <>
      <AppHeader routes={routes} />
      <Prefs />
      {/* <PrefsButton /> */}
      <main className={`main ${prefs.isDarkMode ? 'dark-mode' : ''}`}>
        <SearchBar />
        <Routes>
          {routes.map((route, index) => (
            <Route key={index} path={route.path} element={<route.element />} />
          ))}
        </Routes>
      </main>
      <AppFooter />
    </>
  )
}

export default App
