import { useState } from 'react'
import { motion } from 'framer-motion'
import { HelpCircle, CheckCircle, XCircle, Loader2, Trophy } from 'lucide-react'

export default function Quiz() {
  const [topic, setTopic] = useState('general')
  const [questions, setQuestions] = useState<any[]>([])
  const [currentQ, setCurrentQ] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [loading, setLoading] = useState(false)

  const startQuiz = async () => {
    setLoading(true)
    setScore(0)
    setCurrentQ(0)
    setSelected(null)
    setFinished(false)
    try {
      const res = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, difficulty: 'medium' }),
      })
      const data = await res.json()
      setQuestions(data.questions || [])
    } catch {
      console.error('Failed to load quiz')
    } finally {
      setLoading(false)
    }
  }

  const selectAnswer = (idx: number) => {
    if (selected !== null) return
    setSelected(idx)
    if (questions[currentQ].options[idx].is_correct) setScore((s) => s + 1)
  }

  const nextQuestion = () => {
    if (currentQ + 1 >= questions.length) setFinished(true)
    else { setCurrentQ((q) => q + 1); setSelected(null) }
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="inline-flex p-4 rounded-2xl bg-accent-amber/10 mb-6">
          <HelpCircle className="h-12 w-12 text-accent-amber" />
        </div>
        <h1 className="section-title mb-3">Quiz Mode</h1>
        <p className="text-dark-200 mb-8">Test your media literacy skills and earn XP.</p>
        <div className="flex gap-2 justify-center mb-8 flex-wrap">
          {['general', 'bias', 'sources', 'claims'].map((t) => (
            <button
              key={t}
              onClick={() => setTopic(t)}
              className={`px-5 py-2 rounded-full text-sm capitalize transition-all ${
                topic === t ? 'bg-accent-amber text-dark-900 font-medium' : 'bg-dark-600 text-dark-100 hover:bg-dark-500'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <button onClick={startQuiz} disabled={loading} className="btn-primary text-lg px-10 py-3.5 inline-flex items-center gap-2">
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
          {loading ? 'Generating...' : 'Start Quiz'}
        </button>
      </div>
    )
  }

  if (finished) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="inline-flex p-4 rounded-2xl bg-accent-cyan/10 mb-6">
            <Trophy className="h-12 w-12 text-accent-cyan" />
          </div>
          <h2 className="section-title mb-4">Quiz Complete!</h2>
          <p className="text-5xl font-bold text-accent-blue mb-2">{score}/{questions.length}</p>
          <p className="text-dark-200 mb-8">+{score * 10} XP earned</p>
          <button onClick={() => setQuestions([])} className="btn-primary">Try Another Quiz</button>
        </motion.div>
      </div>
    )
  }

  const q = questions[currentQ]
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <span className="text-sm text-dark-200 font-mono">Question {currentQ + 1}/{questions.length}</span>
        <span className="badge-blue">Score: {score}</span>
      </div>
      <h2 className="text-xl font-semibold text-white mb-6 leading-relaxed">{q.question}</h2>
      <div className="space-y-3 mb-6">
        {q.options.map((opt: any, i: number) => {
          let style = 'border-dark-500 hover:border-dark-300'
          if (selected !== null) {
            if (opt.is_correct) style = 'border-accent-cyan bg-accent-cyan/5'
            else if (i === selected) style = 'border-accent-red bg-accent-red/5'
          }
          return (
            <button
              key={i}
              onClick={() => selectAnswer(i)}
              className={`w-full text-left p-4 rounded-xl border ${style} transition-all duration-200 flex items-center gap-3 bg-surface-secondary`}
            >
              {selected !== null && opt.is_correct && <CheckCircle className="h-5 w-5 text-accent-cyan shrink-0" />}
              {selected !== null && i === selected && !opt.is_correct && <XCircle className="h-5 w-5 text-accent-red shrink-0" />}
              {selected === null && <span className="w-5 h-5 rounded-full border border-dark-400 shrink-0" />}
              <span className="text-dark-100">{opt.text}</span>
            </button>
          )
        })}
      </div>
      {selected !== null && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="card border-accent-blue/20 p-4 mb-5">
            <p className="text-sm text-dark-100"><strong className="text-accent-blue">Explanation:</strong> {q.explanation}</p>
          </div>
          <button onClick={nextQuestion} className="btn-primary">
            {currentQ + 1 >= questions.length ? 'See Results' : 'Next Question'}
          </button>
        </motion.div>
      )}
    </div>
  )
}
