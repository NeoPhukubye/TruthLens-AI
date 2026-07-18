import { useState } from 'react'
import { Mic, MicOff, Volume2, Hand, Globe, VolumeX } from 'lucide-react'
import { useI18n } from '../hooks/useI18n'
import { useVoice, speak, stopSpeaking } from '../hooks/useVoice'
import { languages, signLanguages } from '../lib/i18n'
import type { Language } from '../lib/i18n'

export default function Accessibility() {
  const { language, setLanguage, t } = useI18n()
  const [voiceResult, setVoiceResult] = useState('')
  const [selectedSignLang, setSelectedSignLang] = useState('asl')

  const { isListening, startListening, stopListening, supported } = useVoice({
    lang: language,
    onResult: (text) => {
      setVoiceResult(text)
      speak(`You said: ${text}`, language)
    },
  })

  const signLanguageVideos: Record<string, { action: string; description: string }[]> = {
    asl: [
      { action: 'Analyze', description: 'Move flat hand across other palm (reading motion)' },
      { action: 'True', description: 'Index finger moves forward from lips' },
      { action: 'False', description: 'Index finger crosses in front of face' },
      { action: 'Question', description: 'Draw question mark in air with index finger' },
      { action: 'Help', description: 'Fist on open palm, raise together' },
    ],
    bsl: [
      { action: 'Analyze', description: 'Two hands breaking apart (examining)' },
      { action: 'True', description: 'Thumb up with nod' },
      { action: 'False', description: 'Shake head with flat hand wave' },
      { action: 'Question', description: 'Point index finger, questioning expression' },
      { action: 'Help', description: 'Tap back of hand twice' },
    ],
    sasl: [
      { action: 'Analyze', description: 'Flat hands moving apart examining motion' },
      { action: 'True', description: 'Nod with thumbs up' },
      { action: 'False', description: 'Shake head, cross arms briefly' },
      { action: 'Question', description: 'Open palm raised, questioning face' },
      { action: 'Help', description: 'One hand lifting the other' },
    ],
    isl: [
      { action: 'Analyze', description: 'Hands open, examining gesture' },
      { action: 'True', description: 'Forward nod with open palm' },
      { action: 'False', description: 'Side-to-side hand wave' },
      { action: 'Question', description: 'Raised eyebrows, point forward' },
      { action: 'Help', description: 'Raise hand from closed to open' },
    ],
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="section-title mb-2">{t.nav.accessibility}</h1>
      <p className="text-dark-200 text-lg mb-8">TruthLens AI is designed to be accessible to everyone.</p>

      {/* Language Selector */}
      <section className="card p-6 mb-6" aria-label="Language selection">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Globe className="h-5 w-5 text-accent-blue" /> Language / Langue / Idioma
        </h2>
        <div className="flex flex-wrap gap-2">
          {(Object.entries(languages) as [Language, string][]).map(([code, name]) => (
            <button
              key={code}
              onClick={() => setLanguage(code)}
              className={`px-4 py-2 rounded-full text-sm transition-all duration-200 ${
                language === code ? 'bg-accent-blue text-white shadow-glow-sm' : 'bg-dark-600 text-dark-100 hover:bg-dark-500'
              }`}
              aria-pressed={language === code}
            >
              {name}
            </button>
          ))}
        </div>
      </section>

      {/* Voice Control */}
      <section className="card p-6 mb-6" aria-label="Voice control">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Mic className="h-5 w-5 text-accent-blue" /> {t.accessibility.voiceActivated}
        </h2>
        {supported ? (
          <div className="space-y-4">
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={isListening ? stopListening : startListening}
                className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all duration-200 ${
                  isListening ? 'bg-accent-red text-white shadow-glow' : 'btn-primary'
                }`}
                aria-label={isListening ? t.accessibility.stopListening : t.accessibility.startListening}
              >
                {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                {isListening ? t.accessibility.stopListening : t.accessibility.startListening}
              </button>
              <button
                onClick={() => speak('Welcome to TruthLens AI. I can help you analyze content and detect misinformation.', language)}
                className="btn-secondary flex items-center gap-2"
              >
                <Volume2 className="h-5 w-5" /> {t.accessibility.readAloud}
              </button>
              <button onClick={stopSpeaking} className="bg-dark-600 text-dark-100 px-4 py-3 rounded-lg hover:bg-dark-500 transition flex items-center gap-2">
                <VolumeX className="h-4 w-4" /> Stop
              </button>
            </div>
            {isListening && (
              <div className="flex items-center gap-2 text-accent-red">
                <span className="w-3 h-3 bg-accent-red rounded-full animate-pulse" />
                <span className="text-sm">Listening...</span>
              </div>
            )}
            {voiceResult && (
              <div className="bg-dark-700 rounded-lg p-4 border border-dark-500">
                <p className="text-xs text-dark-300 mb-1">You said:</p>
                <p className="text-white font-medium">{voiceResult}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-dark-300">Voice recognition is not supported in this browser. Try Chrome or Edge.</p>
        )}
      </section>

      {/* Sign Language Guide */}
      <section className="card p-6" aria-label="Sign language guide">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Hand className="h-5 w-5 text-accent-blue" /> {t.accessibility.signLanguage}
        </h2>
        <p className="text-dark-200 text-sm mb-4">Key signs for using TruthLens AI:</p>

        <div className="flex gap-2 mb-5 flex-wrap">
          {Object.entries(signLanguages).map(([code, info]) => (
            <button
              key={code}
              onClick={() => setSelectedSignLang(code)}
              className={`px-4 py-1.5 rounded-full text-sm transition-all ${
                selectedSignLang === code ? 'bg-accent-purple text-white' : 'bg-dark-600 text-dark-100 hover:bg-dark-500'
              }`}
            >
              {info.code}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {signLanguageVideos[selectedSignLang]?.map((sign) => (
            <div key={sign.action} className="flex items-center gap-4 p-3 rounded-lg bg-dark-700/50">
              <span className="bg-accent-purple/10 text-accent-purple px-3 py-1 rounded-full text-xs font-medium min-w-[80px] text-center border border-accent-purple/20">
                {sign.action}
              </span>
              <p className="text-dark-100 text-sm">{sign.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 rounded-lg bg-accent-purple/5 border border-accent-purple/20">
          <p className="text-sm text-dark-100">
            <strong className="text-accent-purple">Note:</strong> Full sign language video tutorials are in development.
            Community contributors for ASL, BSL, SASL, and International Sign are welcome.
          </p>
        </div>
      </section>
    </div>
  )
}
