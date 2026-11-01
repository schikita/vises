import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from '@/app'
import { AppProviders } from '@/app/providers'
import { bootstrapI18n } from '@/shared/i18n'
import { bootstrapTheme, ThemeProvider } from '@/shared/theme'
import '@/index.css'

bootstrapI18n()
bootstrapTheme()

const basename = String(import.meta.env.BASE_URL || '/').replace(/\/$/, '')
const rootEl = document.getElementById('root')
if (!rootEl) {
  throw new Error('Root element #root not found')
}

createRoot(rootEl).render(
  <StrictMode>
    <BrowserRouter basename={basename || undefined}>
      <ThemeProvider>
        <AppProviders>
          <App />
        </AppProviders>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
