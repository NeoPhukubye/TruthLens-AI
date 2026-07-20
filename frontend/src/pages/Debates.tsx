import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Users, Flame, Plus, ArrowLeft, Send, Zap, AlertCircle, CheckCircle, Trophy, Clock } from 'lucide-react'
import { debatesApi } from '../services/api'

interface Debate {
  id: string
  topic: string
  description: string
  side_a_label: string
  side_b_label: string
  participants: { a: string[]; b: string[] }
  arguments: Argument[]
  status: string
  created_at: string
}

interface Argument {
  id: string
  username: string
  side: string
  argument: string
  timestamp: string
  fact_check: {
    quality_score: number
    logical_fallacies: string[]
    strength: string
    feedback: string
    fact_check_notes: string
  } | null
}

interface TrendingTopic {
  topic: string
  category: string
  heat: string
}

export default function Debates() {
  const [view, setView] = useState<'list' | 'debate' | 'create'>('list')
  const [debates, setDebates] = useState<Debate[]>([])
  const [currentDebate, setCurrentDebate] = useState<Debate | null>(null)
  const [trending, setTrending] = useState<TrendingTopic[]>([])
  const [username, setUsername] = useState(() => localStorage.getItem('truthlens-username') || '')

  useEffect(() => {
    fetchDebates()
    fetchTrending()
  }, [])

  const fetchDebates = async () => {
    try {
      const res = await debatesApi.list()
      setDebates(res.data)
    } catch { /* ignore */ }
  }

  const fetchTrending = async () => {
    try {
      const res = await debatesApi.trending()
      setTrending(res.data.topics || [])
    } catch { /* ignore */ }
  }

  const openDebate = async (id: string) => {
    try {
      const res = await debatesApi.get(id)
      setCurrentDebate(res.data)
      setView('debate')
    } catch { /* ignore */ }
  }

  if (!username) {
    return <UsernamePrompt onSet={(name) => { setUsername(name); localStorage.setItem('truthlens-username', name) }} />
  }

  if (view === 'create') return <CreateDebate onBack={() => setView('list')} onCreated={(d) => { setDebates([d, ...debates]); setCurrentDebate(d); setView('debate') }} trending={trending} />
  if (view === 'debate' && currentDebate) return <DebateRoom debate={currentDebate} username={username} onBack={() => { setView('list'); fetchDebates() }} onUpdate={setCurrentDebate} />

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="section-title">Live Debates</h1>
          <p className="text-dark-200 mt-1">Debate the latest news. Sharpen your critical thinking.</p>
        </div>
        <button onClick={() => setView('create')} className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" /> New Debate
        </button>
      </div>

      {/* Trending Topics */}
      {trending.length > 0 && (
        <section className="mb-10">
          <h2 className="text-sm font-semibold text-dark-200 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Flame className="h-4 w-4 text-accent-amber" /> Trending Topics
          </h2>
          <div className="grid md:grid-cols-3 gap-3">
            {trending.map((t, i) => (
              <div key={i} className="card p-4 flex items-start gap-3">
                <span className={`badge ${t.heat === 'hot' ? 'badge-red' : t.heat === 'trending' ? 'badge-amber' : 'badge-blue'}`}>
                  {t.heat}
                </span>
                <div>
                  <p className="text-sm text-white font-medium leading-snug">{t.topic}</p>
                  <p className="text-xs text-dark-300 mt-1">{t.category}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Active Debates */}
      <section>
        <h2 className="text-sm font-semibold text-dark-200 uppercase tracking-wider mb-4 flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-accent-blue" /> Active Debates
        </h2>
        {debates.length === 0 ? (
          <div className="card p-12 text-center">
            <MessageSquare className="h-10 w-10 text-dark-400 mx-auto mb-3" />
            <p className="text-dark-200">No debates yet. Start one!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {debates.map((debate) => (
              <motion.button
                key={debate.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => openDebate(debate.id)}
                className="card-hover p-5 w-full text-left flex items-center gap-4"
              >
                <div className={`w-3 h-3 rounded-full ${debate.status === 'active' ? 'bg-accent-cyan animate-pulse' : 'bg-dark-400'}`} />
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium truncate">{debate.topic}</h3>
                  <p className="text-dark-300 text-sm mt-1 truncate">{debate.description}</p>
                </div>
                <div className="flex items-center gap-4 text-sm text-dark-300 shrink-0">
                  <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {debate.participants.a.length + debate.participants.b.length}</span>
                  <span className="flex items-center gap-1"><MessageSquare className="h-4 w-4" /> {debate.arguments.length}</span>
                  <span className={`badge ${debate.status === 'active' ? 'badge-green' : 'badge-amber'}`}>{debate.status}</span>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function UsernamePrompt({ onSet }: { onSet: (name: string) => void }) {
  const [name, setName] = useState('')
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <div className="card p-8">
        <Users className="h-10 w-10 text-accent-blue mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Choose your debate name</h2>
        <p className="text-dark-200 text-sm mb-6">This will be shown to other participants.</p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name..."
          className="input-dark w-full mb-4"
          onKeyDown={(e) => e.key === 'Enter' && name.trim() && onSet(name.trim())}
        />
        <button onClick={() => name.trim() && onSet(name.trim())} className="btn-primary w-full">
          Enter Debates
        </button>
      </div>
    </div>
  )
}

function CreateDebate({ onBack, onCreated, trending }: { onBack: () => void; onCreated: (d: Debate) => void; trending: TrendingTopic[] }) {
  const [topic, setTopic] = useState('')
  const [description, setDescription] = useState('')
  const [sideA, setSideA] = useState('For')
  const [sideB, setSideB] = useState('Against')
  const [loading, setLoading] = useState(false)

  const create = async () => {
    if (!topic.trim()) return
    setLoading(true)
    try {
      const res = await debatesApi.create({ topic, description, side_a_label: sideA, side_b_label: sideB })
      onCreated(res.data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <button onClick={onBack} className="flex items-center gap-1.5 text-accent-blue mb-8 text-sm font-medium hover:underline">
        <ArrowLeft className="h-4 w-4" /> Back to debates
      </button>
      <h1 className="section-title mb-8">Start a New Debate</h1>

      <div className="card p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-dark-100 mb-2">Topic / Question</label>
          <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., Should AI-generated content be labeled by law?" className="input-dark w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium text-dark-100 mb-2">Description (optional)</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Provide context for the debate..." rows={3} className="input-dark w-full resize-none" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark-100 mb-2">Side A Label</label>
            <input value={sideA} onChange={(e) => setSideA(e.target.value)} className="input-dark w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-100 mb-2">Side B Label</label>
            <input value={sideB} onChange={(e) => setSideB(e.target.value)} className="input-dark w-full" />
          </div>
        </div>
        <button onClick={create} disabled={loading || !topic.trim()} className="btn-primary w-full flex items-center justify-center gap-2">
          <Zap className="h-4 w-4" /> {loading ? 'Creating...' : 'Launch Debate'}
        </button>
      </div>

      {trending.length > 0 && (
        <div className="mt-8">
          <p className="text-sm text-dark-300 mb-3">Or pick a trending topic:</p>
          <div className="flex flex-wrap gap-2">
            {trending.map((t, i) => (
              <button key={i} onClick={() => { setTopic(t.topic); setDescription(`Category: ${t.category}`) }} className="bg-dark-600 text-dark-100 px-3 py-1.5 rounded-full text-xs hover:bg-dark-500 transition">
                {t.topic.slice(0, 50)}...
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function DebateRoom({ debate, username, onBack, onUpdate }: { debate: Debate; username: string; onBack: () => void; onUpdate: (d: Debate) => void }) {
  const [argument, setArgument] = useState('')
  const [mySide, setMySide] = useState<'a' | 'b' | null>(
    debate.participants.a.includes(username) ? 'a' : debate.participants.b.includes(username) ? 'b' : null
  )
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState<any>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [debate.arguments.length])

  const joinSide = async (side: 'a' | 'b') => {
    const res = await debatesApi.join(debate.id, username, side)
    onUpdate(res.data)
    setMySide(side)
  }

  const submitArgument = async () => {
    if (!argument.trim() || !mySide) return
    setLoading(true)
    try {
      const res = await debatesApi.argue(debate.id, username, mySide, argument)
      onUpdate({ ...debate, arguments: [...debate.arguments, res.data] })
      setArgument('')
    } finally {
      setLoading(false)
    }
  }

  const requestSummary = async () => {
    const res = await debatesApi.summarize(debate.id)
    setSummary(res.data)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button onClick={onBack} className="flex items-center gap-1.5 text-accent-blue mb-6 text-sm font-medium hover:underline">
        <ArrowLeft className="h-4 w-4" /> Back to debates
      </button>

      {/* Header */}
      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">{debate.topic}</h1>
            {debate.description && <p className="text-dark-200 text-sm mt-1">{debate.description}</p>}
          </div>
          <span className={`badge ${debate.status === 'active' ? 'badge-green' : 'badge-amber'}`}>
            {debate.status === 'active' ? 'LIVE' : 'Closed'}
          </span>
        </div>
        <div className="flex items-center gap-6 mt-4 text-sm">
          <span className="text-dark-200 flex items-center gap-1"><Users className="h-4 w-4" /> {debate.participants.a.length + debate.participants.b.length} participants</span>
          <span className="text-dark-200 flex items-center gap-1"><MessageSquare className="h-4 w-4" /> {debate.arguments.length} arguments</span>
          <span className="text-dark-200 flex items-center gap-1"><Clock className="h-4 w-4" /> {new Date(debate.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Side Selection */}
      {!mySide && (
        <div className="card p-6 mb-6 text-center">
          <p className="text-white font-medium mb-4">Choose your side:</p>
          <div className="flex gap-4 justify-center">
            <button onClick={() => joinSide('a')} className="px-8 py-3 rounded-xl bg-accent-blue/10 border border-accent-blue/30 text-accent-blue font-medium hover:bg-accent-blue/20 transition">
              {debate.side_a_label} ({debate.participants.a.length})
            </button>
            <button onClick={() => joinSide('b')} className="px-8 py-3 rounded-xl bg-accent-red/10 border border-accent-red/30 text-accent-red font-medium hover:bg-accent-red/20 transition">
              {debate.side_b_label} ({debate.participants.b.length})
            </button>
          </div>
        </div>
      )}

      {/* Arguments Feed */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div ref={scrollRef} className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {debate.arguments.length === 0 && (
              <div className="card p-8 text-center text-dark-300">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 text-dark-400" />
                No arguments yet. Be the first to speak!
              </div>
            )}
            {debate.arguments.map((arg) => (
              <motion.div
                key={arg.id}
                initial={{ opacity: 0, x: arg.side === 'a' ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`card p-5 border-l-4 ${arg.side === 'a' ? 'border-accent-blue' : 'border-accent-red'}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-bold ${arg.side === 'a' ? 'text-accent-blue' : 'text-accent-red'}`}>
                    {arg.side === 'a' ? debate.side_a_label : debate.side_b_label}
                  </span>
                  <span className="text-dark-300 text-xs">&#8226;</span>
                  <span className="text-dark-200 text-xs font-medium">{arg.username}</span>
                  <span className="text-dark-400 text-xs ml-auto">{new Date(arg.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="text-dark-100 leading-relaxed">{arg.argument}</p>

                {/* AI Fact Check */}
                {arg.fact_check && (
                  <div className="mt-3 pt-3 border-t border-dark-500/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-3.5 w-3.5 text-accent-amber" />
                      <span className="text-xs font-medium text-accent-amber">AI Moderator</span>
                      <span className={`badge ml-auto ${
                        arg.fact_check.strength === 'strong' ? 'badge-green' : arg.fact_check.strength === 'moderate' ? 'badge-amber' : 'badge-red'
                      }`}>
                        {arg.fact_check.quality_score}/10
                      </span>
                    </div>
                    <p className="text-dark-200 text-xs leading-relaxed">{arg.fact_check.feedback}</p>
                    {arg.fact_check.logical_fallacies.length > 0 && (
                      <div className="flex items-start gap-1.5 mt-2">
                        <AlertCircle className="h-3.5 w-3.5 text-accent-red mt-0.5 shrink-0" />
                        <p className="text-xs text-accent-red">Fallacies: {arg.fact_check.logical_fallacies.join(', ')}</p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Input */}
          {mySide && debate.status === 'active' && (
            <div className="mt-4 flex gap-3">
              <input
                value={argument}
                onChange={(e) => setArgument(e.target.value)}
                placeholder="Make your argument..."
                className="input-dark flex-1"
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && submitArgument()}
              />
              <button onClick={submitArgument} disabled={loading || !argument.trim()} className="btn-primary flex items-center gap-2 disabled:opacity-40">
                {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Participants</h3>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-accent-blue font-medium mb-1">{debate.side_a_label}</p>
                {debate.participants.a.length === 0 ? <p className="text-xs text-dark-400">None yet</p> : debate.participants.a.map((p) => (
                  <span key={p} className="inline-block bg-accent-blue/10 text-accent-blue text-xs px-2 py-0.5 rounded mr-1 mb-1">{p}</span>
                ))}
              </div>
              <div>
                <p className="text-xs text-accent-red font-medium mb-1">{debate.side_b_label}</p>
                {debate.participants.b.length === 0 ? <p className="text-xs text-dark-400">None yet</p> : debate.participants.b.map((p) => (
                  <span key={p} className="inline-block bg-accent-red/10 text-accent-red text-xs px-2 py-0.5 rounded mr-1 mb-1">{p}</span>
                ))}
              </div>
            </div>
          </div>

          {debate.arguments.length >= 2 && (
            <button onClick={requestSummary} className="btn-secondary w-full flex items-center justify-center gap-2">
              <Trophy className="h-4 w-4" /> Get AI Summary
            </button>
          )}

          {summary && (
            <div className="card p-5 border-accent-cyan/20">
              <h3 className="text-sm font-semibold text-accent-cyan mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" /> Debate Summary
              </h3>
              <p className="text-dark-100 text-xs leading-relaxed mb-3">{summary.summary}</p>
              {summary.key_insights && (
                <div className="space-y-1">
                  {summary.key_insights.map((insight: string, i: number) => (
                    <p key={i} className="text-xs text-dark-200 flex items-start gap-1.5">
                      <span className="text-accent-cyan">&#10003;</span>{insight}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
