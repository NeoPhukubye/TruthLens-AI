import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Upload, Camera, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { useI18n } from '../hooks/useI18n'
import { speak } from '../hooks/useVoice'

interface ImageResult {
  is_likely_ai_generated: boolean
  confidence: number
  indicators: string[]
  manipulation_likelihood: string
  metadata_notes: string[]
  explanation: string
}

export default function ImageDetector() {
  const { t, language } = useI18n()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImageResult | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File) => {
    setFile(f)
    setResult(null)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(f)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f && f.type.startsWith('image/')) handleFile(f)
  }

  const analyzeImage = async () => {
    if (!file) return
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/images/analyze', { method: 'POST', body: formData })
      const data = await res.json()
      setResult(data)
      // Read result aloud for blind users
      const verdict = data.is_likely_ai_generated ? t.imageDetector.aiGenerated : t.imageDetector.realPhoto
      speak(`${verdict}. ${t.imageDetector.confidence}: ${Math.round(data.confidence * 100)}%. ${data.explanation}`, language)
    } catch {
      speak(t.common.error, language)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">{t.imageDetector.title}</h1>
      <p className="text-gray-600 mb-8">{t.imageDetector.subtitle}</p>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-primary-400 transition cursor-pointer"
        onClick={() => fileRef.current?.click()}
        role="button"
        aria-label={t.imageDetector.upload}
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        {preview ? (
          <img src={preview} alt="Upload preview" className="max-h-64 mx-auto rounded-lg" />
        ) : (
          <div className="space-y-3">
            <Upload className="h-12 w-12 text-gray-400 mx-auto" />
            <p className="text-gray-500">{t.imageDetector.upload}</p>
            <p className="text-sm text-gray-400">Drag & drop or click to browse</p>
          </div>
        )}
      </div>

      {file && (
        <button
          onClick={analyzeImage}
          disabled={loading}
          className="mt-6 bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition flex items-center gap-2 mx-auto"
          aria-live="polite"
        >
          <Camera className="h-5 w-5" />
          {loading ? t.imageDetector.analyzing : t.analyze.button}
        </button>
      )}

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-6" role="region" aria-live="polite" aria-label="Analysis results">
          {/* Verdict */}
          <div className={`rounded-xl p-6 border-2 ${result.is_likely_ai_generated ? 'border-red-300 bg-red-50' : 'border-green-300 bg-green-50'}`}>
            <div className="flex items-center gap-3 mb-3">
              {result.is_likely_ai_generated ? (
                <XCircle className="h-8 w-8 text-red-600" />
              ) : (
                <CheckCircle className="h-8 w-8 text-green-600" />
              )}
              <h2 className="text-xl font-bold">
                {result.is_likely_ai_generated ? t.imageDetector.aiGenerated : t.imageDetector.realPhoto}
              </h2>
            </div>
            <p className="text-lg">
              {t.imageDetector.confidence}: <strong>{Math.round(result.confidence * 100)}%</strong>
            </p>
          </div>

          {/* Indicators */}
          {result.indicators.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" /> Indicators Found
              </h3>
              <ul className="space-y-2">
                {result.indicators.map((ind, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-700">
                    <span className="text-yellow-500 mt-1">&#9679;</span>
                    {ind}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Explanation (Learn Mode) */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
            <h3 className="font-semibold text-blue-800 mb-2">How to spot this yourself</h3>
            <p className="text-blue-700">{result.explanation}</p>
          </div>
        </motion.div>
      )}
    </div>
  )
}
