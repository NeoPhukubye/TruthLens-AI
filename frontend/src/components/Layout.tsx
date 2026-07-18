import { Outlet, Link, useLocation } from 'react-router-dom'
import { Shield, BookOpen, BarChart3, HelpCircle, Search, Camera, Accessibility, Globe, Mic, Menu, X, MessageSquare } from 'lucide-react'
import { useI18n } from '../hooks/useI18n'
import { useVoice, speak } from '../hooks/useVoice'
import { languages } from '../lib/i18n'
import type { Language } from '../lib/i18n'
import { useState } from 'react'

export default function Layout() {
  const { language, setLanguage, t, rtl } = useI18n()
  const [showLangMenu, setShowLangMenu] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)
  const location = useLocation()

  const { isListening, startListening, stopListening, supported } = useVoice({
    lang: language,
    onResult: (text) => {
      const lower = text.toLowerCase()
      if (lower.includes('analyze')) window.location.href = '#/analyze'
      else if (lower.includes('quiz')) window.location.href = '#/quiz'
      else if (lower.includes('learn')) window.location.href = '#/learn'
      else if (lower.includes('image') || lower.includes('photo')) window.location.href = '#/image-detector'
      else if (lower.includes('dashboard')) window.location.href = '#/dashboard'
      else speak(`Say: analyze, quiz, learn, image, or dashboard.`, language)
    },
  })

  const navItems = [
    { to: '/analyze', icon: Search, label: t.nav.analyze },
    { to: '/image-detector', icon: Camera, label: 'Detect' },
    { to: '/debates', icon: MessageSquare, label: 'Debates' },
    { to: '/learn', icon: BookOpen, label: t.nav.learn },
    { to: '/quiz', icon: HelpCircle, label: t.nav.quiz },
    { to: '/dashboard', icon: BarChart3, label: t.nav.dashboard },
    { to: '/accessibility', icon: Accessibility, label: t.nav.accessibility },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <div className={`min-h-screen flex flex-col ${rtl ? 'rtl' : 'ltr'}`} dir={rtl ? 'rtl' : 'ltr'}>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 btn-primary z-50">
        Skip to content
      </a>

      {/* Top Bar */}
      <div className="bg-dark-900 border-b border-dark-700/50 text-dark-200 text-xs py-1.5">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <span>UNESCO Media & Information Literacy Hackathon</span>
          <span className="hidden sm:inline">Empowering critical thinkers worldwide</span>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-surface-primary/95 backdrop-blur-md border-b border-dark-600/50 sticky top-0 z-50" role="banner">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group" aria-label="TruthLens AI Home">
              <div className="relative">
                <Shield className="h-8 w-8 text-accent-blue transition-transform group-hover:scale-110" />
                <div className="absolute inset-0 bg-accent-blue/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-white tracking-tight leading-none">TruthLens</span>
                <span className="text-[10px] text-accent-blue uppercase tracking-widest font-medium">AI Fact Checker</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(item.to) ? 'text-accent-blue bg-accent-blue/10' : 'text-dark-100 hover:text-white hover:bg-dark-600/50'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>

            {/* Right Controls */}
            <div className="flex items-center space-x-2">
              {supported && (
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    isListening ? 'bg-accent-red/20 text-accent-red animate-pulse' : 'text-dark-200 hover:text-white hover:bg-dark-600/50'
                  }`}
                  aria-label={isListening ? t.accessibility.stopListening : t.accessibility.startListening}
                >
                  <Mic className="h-4 w-4" />
                </button>
              )}

              {/* Language */}
              <div className="relative">
                <button
                  onClick={() => setShowLangMenu(!showLangMenu)}
                  className="flex items-center space-x-1 text-dark-200 hover:text-white p-2 rounded-lg hover:bg-dark-600/50 transition-all duration-200"
                  aria-label="Change language"
                >
                  <Globe className="h-4 w-4" />
                  <span className="text-xs uppercase font-medium">{language}</span>
                </button>
                {showLangMenu && (
                  <div className="absolute right-0 mt-2 bg-surface-tertiary border border-dark-500 rounded-xl shadow-card py-2 min-w-[160px] z-50">
                    {(Object.entries(languages) as [Language, string][]).map(([code, name]) => (
                      <button
                        key={code}
                        onClick={() => { setLanguage(code); setShowLangMenu(false) }}
                        className={`block w-full text-left px-4 py-2 text-sm transition ${
                          language === code ? 'text-accent-blue bg-accent-blue/5' : 'text-dark-100 hover:text-white hover:bg-dark-600/50'
                        }`}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenu(!mobileMenu)}
                className="lg:hidden p-2 rounded-lg text-dark-200 hover:text-white hover:bg-dark-600/50"
              >
                {mobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Nav */}
          {mobileMenu && (
            <div className="lg:hidden border-t border-dark-600/50 py-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenu(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${
                    isActive(item.to) ? 'text-accent-blue bg-accent-blue/10' : 'text-dark-100 hover:text-white hover:bg-dark-600/50'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          )}
        </nav>
      </header>

      <main id="main-content" className="flex-1" role="main">
        <Outlet />
      </main>

      <footer className="bg-surface-primary border-t border-dark-600/50 py-8" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-accent-blue" />
              <span className="text-dark-200 text-sm">TruthLens AI</span>
            </div>
            <p className="text-dark-300 text-sm">Built for the UNESCO Media & Information Literacy Hackathon</p>
            <div className="flex items-center space-x-4">
              <span className="text-dark-300 text-xs">Empowering critical thinkers</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
