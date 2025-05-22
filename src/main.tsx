import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { BrowserRouter as Router } from 'react-router-dom'
import { Provider } from 'react-redux'

import { CssVarsProvider } from '@mui/material/styles'

import { store } from './store/store'

import './index.css'
import './assets/styles/main.scss'

import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <Router>
        <CssVarsProvider>
          <link
            rel='stylesheet'
            href='https://fonts.googleapis.com/icon?family=Material+Icons'
          />
          <App />
        </CssVarsProvider>
      </Router>
    </Provider>
  </StrictMode>
)
