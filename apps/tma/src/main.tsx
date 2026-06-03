import './index.css'
import './lib/i18n'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from './app/app'
import { initTelegram } from './app/bootstrap/telegram-init'

// Initialize Telegram SDK at module level, before rendering.
// This is required so that initData, viewport, etc. are available
// synchronously when components mount and auth bootstrap runs.
const telegramCleanup = initTelegram()

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element #root not found')
}

const root = createRoot(rootElement)

root.render(
  <StrictMode>
    <App telegramCleanup={telegramCleanup} />
  </StrictMode>,
)
