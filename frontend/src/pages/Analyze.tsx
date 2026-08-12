import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Shield, Eye, CheckCircle, AlertTriangle, Loader2, XCircle, HelpCircle } from 'lucide-react'
import ShareCard from '../components/ShareCard'
import { useI18n } from '../hooks/useI18n'
import { speak } from '../hooks/useVoice'
import { analyzeApi, factcheckApi, ApiError } from '../services/api'

interface AnalysisResult {
  claims: { claim: string; importance: string }[]
  key_facts: string[]
  entities: string[]
  statistics: string[]
  summary: string
  mil_competency?: string
  mil_competency_description?: string
}

interface FactCheckResult {
  claim: string
  verdict: string
  confidence: number
  reasoning: string
  sources: string[]
  learn_more: string
}

export default function Analyze() {
  const { t, language } = useI18n()
  const [content, setContent] = useState('')
  const [contentType, setContentType] = useState('article')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [factResults, setFactResults] = useState<FactCheckResult[]>([])
  const [factLoading, setFactLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    if (!content.trim()) return
    setLoading(true)
    setError(null)
    setFactResults([])
    try {
      const res = await analyzeApi.analyze(content, contentType)
      setResult(res.data)
      speak(`Analysis complete. Found ${res.data.claims.length} claims. Now verifying...`, language)

      // Automatically fact-check extracted claims
      if (res.data.claims.length > 0) {
        setFactLoading(true)
        try {
          const claims = res.data.claims.map((c: { claim: string }) => c.claim)
          const factRes = await factcheckApi.check(claims)
          setFactResults(factRes.data.results)
          const verdicts = factRes.data.results.map((r: FactCheckResult) => r.verdict).join(', ')
          speak(`Verification complete. Verdicts: ${verdicts}`, language)
        } catch {
          // Non-critical: show analysis even if fact-check fails
        } finally {
          setFactLoading(false)
        }
      }
    } catch (e) {
      const message = e instanceof ApiError ? e.message : t.common.error
      setError(message)
      speak(message, language)
    } finally {
      setLoading(false)
    }
  }

  const getVerdictStyle = (verdict: string) => {
    switch (verdict) {
      case 'supported': return { bg: 'bg-green-500/10 border-green-500/20', text: 'text-green-400', label: 'Supported' }
      case 'unsupported': return { bg: 'bg-red-500/10 border-red-500/20', text: 'text-red-400', label: 'Unsupported' }
      case 'partially_supported': return { bg: 'bg-amber-500/10 border-amber-500/20', text: 'text-amber-400', label: 'Partially Supported' }
      default: return { bg: 'bg-gray-500/10 border-gray-500/20', text: 'text-gray-400', label: 'Unverifiable' }
    }
  }

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'supported': return <CheckCircle className="h-5 w-5 text-green-400" />
      case 'unsupported': return <XCircle className="h-5 w-5 text-red-400" />
      case 'partially_supported': return <AlertTriangle className="h-5 w-5 text-amber-400" />
      default: return <HelpCircle className="h-5 w-5 text-gray-400" />
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
        {error && (
          <div className="mt-4 p-3 rounded-lg bg-accent-red/10 border border-accent-red/20 text-accent-red text-sm">
            {error}
          </div>
        )}
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

          {/* MIL Competency */}
          {result.mil_competency && (
            <div className="card p-4 border-l-4 border-accent-purple bg-accent-purple/5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-accent-purple text-xs font-medium uppercase tracking-wider mb-1">UNESCO MIL Competency</p>
                  <p className="text-white font-semibold">{result.mil_competency}</p>
                  <p className="text-dark-200 text-sm mt-1">{result.mil_competency_description}</p>
                </div>
                <ShareCard title={result.summary.slice(0, 60)} summary={result.summary} type="Content Analysis" />
              </div>
            </div>
          )}

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
