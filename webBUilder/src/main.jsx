import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ToastContainer } from 'react-toastify'
import { ClerkProvider } from '@clerk/clerk-react'

// 🔑 Replace with your actual Clerk key
const PUBLISHABLE_KEY = "pk_test_cm9tYW50aWMtZ251LTMuY2xlcmsuYWNjb3VudHMuZGV2JA"

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <App />
      <ToastContainer />
    </ClerkProvider>
  </StrictMode>,
)
