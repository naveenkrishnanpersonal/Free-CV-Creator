import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/styles/fonts.css'
import '@/styles/app.css'
import '@/styles/print.css'
import { App } from '@/app/App'

const root = document.getElementById('root')
if (!root) throw new Error('Root element is missing from index.html')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
