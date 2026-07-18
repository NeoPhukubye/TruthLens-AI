import { useState, useCallback, useEffect, useRef } from 'react'

interface UseVoiceOptions {
  lang?: string
  continuous?: boolean
  onResult?: (text: string) => void
}

export function useVoice({ lang = 'en', continuous = true, onResult }: UseVoiceOptions = {}) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [supported, setSupported] = useState(false)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    setSupported(!!SpeechRecognition)
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = continuous
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = lang

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript
          }
        }
        if (finalTranscript) {
          setTranscript(finalTranscript)
          onResult?.(finalTranscript)
        }
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }
    return () => {
      recognitionRef.current?.stop()
    }
  }, [lang, continuous, onResult])

  const startListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = lang
      recognitionRef.current.start()
      setIsListening(true)
    }
  }, [lang])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }, [])

  return { isListening, transcript, startListening, stopListening, supported }
}

export function speak(text: string, lang: string = 'en') {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = lang
  utterance.rate = 0.9
  window.speechSynthesis.speak(utterance)
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
}
