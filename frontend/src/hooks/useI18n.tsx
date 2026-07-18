import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { type Language, getTranslations, isRTL, type Translations } from '../lib/i18n'

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: Translations
  rtl: boolean
}

const I18nContext = createContext<I18nContextType>({
  language: 'en',
  setLanguage: () => {},
  t: getTranslations('en'),
  rtl: false,
})

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('truthlens-lang')
    return (saved as Language) || 'en'
  })

  const setLanguage = useCallback((lang: Language) => {
    setLang(lang)
    localStorage.setItem('truthlens-lang', lang)
    document.documentElement.dir = isRTL(lang) ? 'rtl' : 'ltr'
    document.documentElement.lang = lang
  }, [])

  const t = getTranslations(language)
  const rtl = isRTL(language)

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, rtl }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  return useContext(I18nContext)
}
