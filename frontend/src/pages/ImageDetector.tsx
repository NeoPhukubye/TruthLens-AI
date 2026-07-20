import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Upload, Camera, CheckCircle, XCircle, AlertTriangle, Loader2, Info } from 'lucide-react'
import { useI18n } from '../hooks/useI18n'
import { speak } from '../hooks/useVoice'
import { imagesApi, ApiError } from '../services/api'

interface ImageResult {
  is_likely_ai_generated: boolean
  confidence: number
  indicators: string[]
  manipulation_likelihood: string
  metadata_notes: string[]
  explanation: string
  detection_methods_used?: string[]
  what_to_look_for?: string[]
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
      const res = await imagesApi.analyze(file)
      setResult(res.data)
      const verdict = res.data.is_likely_ai_generated ? t.imageDetector.aiGenerated : t.imageDetector.realPhoto
      speak(`${verdict}. ${t.imageDetector.confidence}: ${Math.round(res.data.confidence * 100)}%.`, language)
    } catch (e) {
      speak(e instanceof ApiError ? e.message : t.common.error, language)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="section-title mb-2">{t.imageDetector.title}</h1>
      <p className="text-dark-200 text-lg mb-8">{t.imageDetector.subtitle}</p>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="card border-2 border-dashed border-dark-400 hover:border-accent-blue/50 p-16 text-center cursor-pointer transition-all duration-300 group"
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
          <img src={preview} alt="Upload preview" className="max-h-72 mx-auto rounded-lg shadow-card" />
        ) : (
          <div className="space-y-4">
            <div className="inline-flex p-4 rounded-2xl bg-dark-600 group-hover:bg-accent-blue/10 transition">
              <Upload className="h-10 w-10 text-dark-300 group-hover:text-accent-blue transition" />
            </div>
            <p className="text-dark-100 font-medium">{t.imageDetector.upload}</p>
            <p className="text-sm text-dark-300">Drag & drop or click to browse (JPG, PNG, WebP)</p>
          </div>
        )}
      </div>

      {file && (
        <div className="flex justify-center mt-6">
          <button onClick={analyzeImage} disabled={loading} className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-3">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
            {loading ? t.imageDetector.analyzing : 'Analyze Image'}
          </button>
        </div>
      )}

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-10 space-y-6" aria-live="polite">
          {/* Verdict */}
          <div className={`card p-6 border-l-4 ${result.is_likely_ai_generated ? 'border-accent-red' : 'border-accent-cyan'}`}>
            <div className="flex items-center gap-3 mb-3">
              {result.is_likely_ai_generated ? (
                <XCircle className="h-7 w-7 text-accent-red" />
              ) : (
                <CheckCircle className="h-7 w-7 text-accent-cyan" />
              )}
              <h2 className="text-xl font-bold text-white">
                {result.is_likely_ai_generated ? t.imageDetector.aiGenerated : t.imageDetector.realPhoto}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1 bg-dark-700 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${result.is_likely_ai_generated ? 'bg-accent-red' : 'bg-accent-cyan'}`}
                  style={{ width: `${result.confidence * 100}%` }}
                />
              </div>
              <span className="text-white font-mono font-bold">{Math.round(result.confidence * 100)}%</span>
            </div>
          </div>

          {/* Indicators */}
          {result.indicators.length > 0 && (
            <div className="card p-6">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-accent-amber" /> Indicators Detected
              </h3>
              <div className="space-y-2">
                {result.indicators.map((ind, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-dark-700/50">
                    <span className="text-accent-amber mt-0.5">&#9679;</span>
                    <span className="text-dark-100 text-sm">{ind}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* What to Look For */}
          {result.what_to_look_for && result.what_to_look_for.length > 0 && (
            <div className="card p-6 border-accent-cyan/20">
              <h3 className="font-semibold text-accent-cyan mb-4 flex items-center gap-2">
                <Info className="h-5 w-5" /> How to Spot This Yourself
              </h3>
              <ul className="space-y-2">
                {result.what_to_look_for.map((tip, i) => (
                  <li key={i} className="text-dark-100 text-sm flex items-start gap-2">
                    <span className="text-accent-cyan font-bold">{i + 1}.</span>{tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Explanation */}
          <div className="card p-6 border-accent-blue/20">
            <h3 className="font-semibold text-accent-blue mb-2">Analysis Explanation</h3>
            <p className="text-dark-100 leading-relaxed">{result.explanation}</p>
          </div>
        </motion.div>
      )}
    </div>
  )
}
