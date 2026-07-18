import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { I18nProvider } from './hooks/useI18n'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <I18nProvider>
      <BrowserRouter basename="/TruthLens-AI">
        <App />
      </BrowserRouter>
    </I18nProvider>
  </React.StrictMode>,
)
