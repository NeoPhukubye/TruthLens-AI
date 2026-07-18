import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Shield, Eye, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react'
import { useI18n } from '../hooks/useI18n'
import { speak } from '../hooks/useVoice'

interface AnalysisResult {
  claims: { claim: string; importance: string }[]
  key_facts: string[]
  entities: string[]
  statistics: string[]
  summary: string
}

export default function Analyze() {
  const { t, language } = useI18n()
  const [content, setContent] = useState('')
  const [contentType, setContentType] = useState('article')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)

  const handleAnalyze = async () => {
    if (!content.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/analyze/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, content_type: contentType }),
      })
      const data = await res.json()
      setResult(data)
      speak(`Analysis complete. Found ${data.claims.length} claims. ${data.summary}`, language)
    } catch {
      speak(t.common.error, language)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="section-title mb-2">{t.analyze.title}</h1>
        <p className="text-dark-200 text-lg">{t.analyze.subtitle}</p>
      </div>

      <div className="card p-6 mb-8">
        <div className="flex gap-2 mb-5 flex-wrap">
          {['article', 'tweet', 'post', 'message', 'blog'].map((type) => (
            <button
              key={type}
              onClick={() => setContentType(type)}
              className={`px-4 py-1.5 rounded-full text-sm capitalize transition-all duration-200 ${
                contentType === type ? 'bg-accent-blue text-white shadow-glow-sm' : 'bg-dark-600 text-dark-100 hover:bg-dark-500'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t.analyze.placeholder}
          rows={8}
          className="input-dark w-full resize-none font-mono text-sm"
          aria-label={t.analyze.placeholder}
        />
        <button
          onClick={handleAnalyze}
          disabled={loading || !content.trim()}
          className="btn-primary mt-4 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          {loading ? t.analyze.analyzing : t.analyze.button}
        </button>
      </div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Summary */}
          <div className="card p-6 border-l-4 border-accent-blue">
            <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
              <Shield className="h-5 w-5 text-accent-blue" /> Summary
            </h2>
            <p className="text-dark-100 leading-relaxed">{result.summary}</p>
          </div>

          {/* Claims */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-accent-cyan" /> Claims Extracted
              <span className="badge-blue ml-auto">{result.claims.length} found</span>
            </h2>
            <div className="space-y-3">
              {result.claims.map((c, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-dark-700/50">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium mt-0.5 ${
                    c.importance === 'high' ? 'badge-red' : c.importance === 'medium' ? 'badge-amber' : 'bg-dark-500 text-dark-100'
                  }`}>
                    {c.importance}
                  </span>
                  <span className="text-dark-100 text-sm">{c.claim}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Entities & Stats */}
          <div className="grid md:grid-cols-2 gap-6">
            {result.entities.length > 0 && (
              <div className="card p-6">
                <h2 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                  <Eye className="h-4 w-4 text-accent-purple" /> Entities
                </h2>
                <div className="flex flex-wrap gap-2">
                  {result.entities.map((e, i) => (
                    <span key={i} className="bg-accent-purple/10 text-accent-purple border border-accent-purple/20 px-3 py-1 rounded-full text-xs">{e}</span>
                  ))}
                </div>
              </div>
            )}
            {result.statistics.length > 0 && (
              <div className="card p-6">
                <h2 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-accent-amber" /> Statistics Mentioned
                </h2>
                <ul className="space-y-1.5">
                  {result.statistics.map((s, i) => (
                    <li key={i} className="text-dark-100 text-sm flex items-start gap-2">
                      <span className="text-accent-amber mt-1">&#8226;</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}
