import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Upload, GitCompare, Loader2, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { imagesApi, ApiError } from '../services/api'

interface CompareResult {
  similarity_score: number
  is_likely_manipulated: boolean
  differences: string[]
  manipulation_techniques: string[]
  explanation: string
  educational_tip: string
}

export default function ImageCompare() {
  const [original, setOriginal] = useState<File | null>(null)
  const [suspect, setSuspect] = useState<File | null>(null)
  const [originalPreview, setOriginalPreview] = useState<string | null>(null)
  const [suspectPreview, setSuspectPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CompareResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const origRef = useRef<HTMLInputElement>(null)
  const suspRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File, type: 'original' | 'suspect') => {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (type === 'original') {
        setOriginal(f)
        setOriginalPreview(e.target?.result as string)
      } else {
        setSuspect(f)
        setSuspectPreview(e.target?.result as string)
      }
    }
    reader.readAsDataURL(f)
    setResult(null)
    setError(null)
  }

  const handleCompare = async () => {
    if (!original || !suspect) return
    setLoading(true)
    setError(null)
    try {
      const res = await imagesApi.compare(original, suspect)
      setResult(res.data)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Comparison failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="section-title mb-2">Image Comparison</h1>
      <p className="text-dark-200 text-lg mb-8">
        Compare two images to detect manipulation, editing, or deepfake alterations.
        <span className="block text-sm text-dark-300 mt-1">UNESCO MIL Competency 6: Visual Literacy - Understanding how images can be altered to mislead</span>
      </p>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Original */}
        <div
          className="card border-2 border-dashed border-dark-400 hover:border-accent-cyan/50 p-8 text-center cursor-pointer transition-all group"
          onClick={() => origRef.current?.click()}
        >
          <input ref={origRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0], 'original')} />
          {originalPreview ? (
            <div>
              <p className="text-accent-cyan text-xs font-medium mb-3 uppercase tracking-wider">Original / Source</p>
              <img src={originalPreview} alt="Original" className="max-h-48 mx-auto rounded-lg" />
            </div>
          ) : (
            <div className="space-y-3 py-8">
              <Upload className="h-10 w-10 text-dark-300 group-hover:text-accent-cyan mx-auto transition" />
              <p className="text-dark-100 font-medium">Upload Original Image</p>
              <p className="text-xs text-dark-300">The source or trusted version</p>
            </div>
          )}
        </div>

        {/* Suspect */}
        <div
          className="card border-2 border-dashed border-dark-400 hover:border-accent-amber/50 p-8 text-center cursor-pointer transition-all group"
          onClick={() => suspRef.current?.click()}
        >
          <input ref={suspRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0], 'suspect')} />
          {suspectPreview ? (
            <div>
              <p className="text-accent-amber text-xs font-medium mb-3 uppercase tracking-wider">Suspect / Modified</p>
              <img src={suspectPreview} alt="Suspect" className="max-h-48 mx-auto rounded-lg" />
            </div>
          ) : (
            <div className="space-y-3 py-8">
              <Upload className="h-10 w-10 text-dark-300 group-hover:text-accent-amber mx-auto transition" />
              <p className="text-dark-100 font-medium">Upload Suspect Image</p>
              <p className="text-xs text-dark-300">The potentially manipulated version</p>
            </div>
          )}
        </div>
      </div>

      {original && suspect && (
        <div className="flex justify-center mb-8">
          <button onClick={handleCompare} disabled={loading} className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-3">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <GitCompare className="h-5 w-5" />}
            {loading ? 'Comparing...' : 'Compare Images'}
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-lg bg-accent-red/10 border border-accent-red/20 text-accent-red text-sm mb-6">
          {error}
        </div>
      )}

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Verdict */}
          <div className={`card p-6 border-l-4 ${result.is_likely_manipulated ? 'border-accent-red' : 'border-accent-cyan'}`}>
            <div className="flex items-center gap-3 mb-3">
              {result.is_likely_manipulated ? (
                <AlertTriangle className="h-7 w-7 text-accent-red" />
              ) : (
                <CheckCircle className="h-7 w-7 text-accent-cyan" />
              )}
              <h2 className="text-xl font-bold text-white">
                {result.is_likely_manipulated ? 'Manipulation Detected' : 'Images Appear Authentic'}
              </h2>
            </div>
            <div className="flex items-center gap-4 mb-3">
              <span className="text-dark-200 text-sm">Similarity:</span>
              <div className="flex-1 bg-dark-700 rounded-full h-3 overflow-hidden">
                <div className="h-full bg-accent-blue rounded-full" style={{ width: `${result.similarity_score * 100}%` }} />
              </div>
              <span className="text-white font-mono font-bold">{Math.round(result.similarity_score * 100)}%</span>
            </div>
            <p className="text-dark-100">{result.explanation}</p>
          </div>

          {/* Differences */}
          {result.differences.length > 0 && (
            <div className="card p-6">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-accent-amber" /> Differences Found
              </h3>
              <div className="space-y-2">
                {result.differences.map((diff, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-dark-700/50">
                    <span className="text-accent-amber">&#9679;</span>
                    <span className="text-dark-100 text-sm">{diff}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Educational Tip */}
          <div className="card p-6 border-accent-cyan/20">
            <h3 className="font-semibold text-accent-cyan mb-2 flex items-center gap-2">
              <Info className="h-5 w-5" /> Learn: Visual Verification
            </h3>
            <p className="text-dark-100 text-sm leading-relaxed">{result.educational_tip}</p>
          </div>
        </motion.div>
      )}
    </div>
  )
}
