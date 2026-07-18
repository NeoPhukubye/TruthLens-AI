import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Shield, Eye, CheckCircle } from 'lucide-react'

interface AnalysisResult {
  claims: { claim: string; importance: string }[]
  key_facts: string[]
  entities: string[]
  statistics: string[]
  summary: string
}

export default function Analyze() {
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
    } catch {
      console.error('Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Analyze Content</h1>
      <p className="text-gray-600 mb-8">Paste any article, tweet, or message to extract claims and evaluate credibility.</p>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <div className="flex gap-2 mb-4">
          {['article', 'tweet', 'post', 'message', 'blog'].map((type) => (
            <button
              key={type}
              onClick={() => setContentType(type)}
              className={`px-3 py-1 rounded-full text-sm capitalize ${contentType === type ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              {type}
            </button>
          ))}
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste your content here..."
          rows={8}
          className="w-full border border-gray-300 rounded-lg p-4 resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <button
          onClick={handleAnalyze}
          disabled={loading || !content.trim()}
          className="mt-4 bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition flex items-center gap-2"
        >
          <Search className="h-4 w-4" />
          {loading ? 'Analyzing...' : 'Analyze'}
        </button>
      </div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-2 flex items-center gap-2"><Shield className="h-5 w-5 text-primary-600" /> Summary</h2>
            <p className="text-gray-700">{result.summary}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-600" /> Claims Extracted</h2>
            <ul className="space-y-2">
              {result.claims.map((c, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full mt-1 ${c.importance === 'high' ? 'bg-red-100 text-red-700' : c.importance === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                    {c.importance}
                  </span>
                  <span className="text-gray-700">{c.claim}</span>
                </li>
              ))}
            </ul>
          </div>

          {result.entities.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><Eye className="h-5 w-5 text-purple-600" /> Entities</h2>
              <div className="flex flex-wrap gap-2">
                {result.entities.map((e, i) => (
                  <span key={i} className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm">{e}</span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
