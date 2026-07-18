import { Outlet, Link } from 'react-router-dom'
import { Shield, BookOpen, BarChart3, HelpCircle, Search, Camera, Accessibility, Globe, Mic } from 'lucide-react'
import { useI18n } from '../hooks/useI18n'
import { useVoice, speak } from '../hooks/useVoice'
import { languages } from '../lib/i18n'
import type { Language } from '../lib/i18n'
import { useState } from 'react'

export default function Layout() {
  const { language, setLanguage, t, rtl } = useI18n()
  const [showLangMenu, setShowLangMenu] = useState(false)
  const [voiceNav, setVoiceNav] = useState(false)

  const { isListening, startListening, stopListening, supported } = useVoice({
    lang: language,
    onResult: (text) => {
      const lower = text.toLowerCase()
      if (lower.includes('analyze') || lower.includes('analyz')) {
        window.location.hash = '/analyze'
        speak('Opening analyze page', language)
      } else if (lower.includes('quiz')) {
        window.location.hash = '/quiz'
        speak('Opening quiz', language)
      } else if (lower.includes('learn')) {
        window.location.hash = '/learn'
        speak('Opening learn mode', language)
      } else if (lower.includes('image') || lower.includes('photo')) {
        window.location.hash = '/image-detector'
        speak('Opening image detector', language)
      } else if (lower.includes('dashboard') || lower.includes('stats')) {
        window.location.hash = '/dashboard'
        speak('Opening dashboard', language)
      } else {
        speak(`I heard: ${text}. Say analyze, quiz, learn, image, or dashboard to navigate.`, language)
      }
    },
  })

  return (
    <div className={`min-h-screen flex flex-col ${rtl ? 'rtl' : 'ltr'}`} dir={rtl ? 'rtl' : 'ltr'}>
      {/* Skip to content for screen readers */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-primary-600 text-white px-4 py-2 rounded z-50">
        Skip to content
      </a>

      <header className="bg-white border-b border-gray-200 sticky top-0 z-50" role="banner">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2" aria-label="TruthLens AI Home">
              <Shield className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">TruthLens AI</span>
            </Link>
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/analyze" className="flex items-center space-x-1 text-gray-600 hover:text-primary-600 transition">
                <Search className="h-4 w-4" /><span>{t.nav.analyze}</span>
              </Link>
              <Link to="/image-detector" className="flex items-center space-x-1 text-gray-600 hover:text-primary-600 transition">
                <Camera className="h-4 w-4" /><span>Image</span>
              </Link>
              <Link to="/learn" className="flex items-center space-x-1 text-gray-600 hover:text-primary-600 transition">
                <BookOpen className="h-4 w-4" /><span>{t.nav.learn}</span>
              </Link>
              <Link to="/quiz" className="flex items-center space-x-1 text-gray-600 hover:text-primary-600 transition">
                <HelpCircle className="h-4 w-4" /><span>{t.nav.quiz}</span>
              </Link>
              <Link to="/dashboard" className="flex items-center space-x-1 text-gray-600 hover:text-primary-600 transition">
                <BarChart3 className="h-4 w-4" /><span>{t.nav.dashboard}</span>
              </Link>
              <Link to="/accessibility" className="flex items-center space-x-1 text-gray-600 hover:text-primary-600 transition">
                <Accessibility className="h-4 w-4" /><span className="sr-only md:not-sr-only">{t.nav.accessibility}</span>
              </Link>

              {/* Voice Nav Button */}
              {supported && (
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`p-2 rounded-full transition ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'text-gray-500 hover:text-primary-600 hover:bg-primary-50'}`}
                  aria-label={isListening ? t.accessibility.stopListening : t.accessibility.startListening}
                  title="Voice navigation"
                >
                  <Mic className="h-5 w-5" />
                </button>
              )}

              {/* Language Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowLangMenu(!showLangMenu)}
                  className="flex items-center space-x-1 text-gray-500 hover:text-primary-600 p-2 rounded-full hover:bg-primary-50"
                  aria-label="Change language"
                  aria-expanded={showLangMenu}
                >
                  <Globe className="h-5 w-5" />
                  <span className="text-xs uppercase">{language}</span>
                </button>
                {showLangMenu && (
                  <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[140px] z-50">
                    {(Object.entries(languages) as [Language, string][]).map(([code, name]) => (
                      <button
                        key={code}
                        onClick={() => { setLanguage(code); setShowLangMenu(false) }}
                        className={`block w-full text-left px-4 py-2 text-sm hover:bg-primary-50 ${language === code ? 'font-semibold text-primary-600' : 'text-gray-700'}`}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>
      </header>

      <main id="main-content" className="flex-1" role="main">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-gray-200 py-6" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          TruthLens AI &mdash; Empowering critical thinking in the digital age. | UNESCO MIL Hackathon
        </div>
      </footer>
    </div>
  )
}
