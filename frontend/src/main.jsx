import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './pages/App.jsx'
import './styles.css'
import { SocketProvider } from './contexts/SocketContext'


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
    <SocketProvider>
        <App />
      </SocketProvider>
    </BrowserRouter>
  </React.StrictMode>
)


