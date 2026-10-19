
import { createContext, useContext, useState } from 'react'

const LanguageContext = createContext(null)

export const LANGUAGES = [
  { value: 'english', label: 'English', native: 'English' },
  { value: 'hindi', label: 'Hindi', native: 'हिन्दी' },
  { value: 'kannada', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { value: 'telugu', label: 'Telugu', native: 'తెలుగు' },
]

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    const saved = localStorage.getItem('preferred_language')
    return LANGUAGES.some((item) => item.value === saved)
      ? saved
      : 'english'
  })

  function setLanguage(value) {
    if (!LANGUAGES.some((item) => item.value === value)) return

    localStorage.setItem('preferred_language', value)
    setLanguageState(value)
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)

  if (!context) {
    throw new Error('useLanguage must be used inside LanguageProvider')
  }

  return context
}
