import { useState } from 'react'
import { motion } from 'framer-motion'
import { HelpCircle, CheckCircle, XCircle } from 'lucide-react'

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
    if (questions[currentQ].options[idx].is_correct) {
      setScore((s) => s + 1)
    }
  }

  const nextQuestion = () => {
    if (currentQ + 1 >= questions.length) {
      setFinished(true)
    } else {
      setCurrentQ((q) => q + 1)
      setSelected(null)
    }
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <HelpCircle className="h-16 w-16 text-primary-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Quiz Mode</h1>
        <p className="text-gray-600 mb-8">Test your media literacy skills and earn XP.</p>
        <div className="flex gap-2 justify-center mb-6">
          {['general', 'bias', 'sources', 'claims'].map((t) => (
            <button key={t} onClick={() => setTopic(t)} className={`px-4 py-2 rounded-full text-sm capitalize ${topic === t ? 'bg-primary-600 text-white' : 'bg-gray-100'}`}>{t}</button>
          ))}
        </div>
        <button onClick={startQuiz} disabled={loading} className="bg-primary-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50">
          {loading ? 'Generating...' : 'Start Quiz'}
        </button>
      </div>
    )
  }

  if (finished) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <h2 className="text-3xl font-bold mb-4">Quiz Complete!</h2>
          <p className="text-5xl font-bold text-primary-600 mb-2">{score}/{questions.length}</p>
          <p className="text-gray-600 mb-6">+{score * 10} XP earned</p>
          <button onClick={() => setQuestions([])} className="bg-primary-600 text-white px-6 py-2 rounded-lg">Try Another Quiz</button>
        </motion.div>
      </div>
    )
  }

  const q = questions[currentQ]
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-6">
        <span className="text-sm text-gray-500">Question {currentQ + 1}/{questions.length}</span>
        <span className="text-sm font-medium text-primary-600">Score: {score}</span>
      </div>
      <h2 className="text-xl font-semibold mb-6">{q.question}</h2>
      <div className="space-y-3 mb-6">
        {q.options.map((opt: any, i: number) => {
          let style = 'border-gray-200 hover:border-primary-300'
          if (selected !== null) {
            if (opt.is_correct) style = 'border-green-500 bg-green-50'
            else if (i === selected) style = 'border-red-500 bg-red-50'
          }
          return (
            <button key={i} onClick={() => selectAnswer(i)} className={`w-full text-left p-4 rounded-lg border ${style} transition flex items-center gap-3`}>
              {selected !== null && opt.is_correct && <CheckCircle className="h-5 w-5 text-green-600" />}
              {selected !== null && i === selected && !opt.is_correct && <XCircle className="h-5 w-5 text-red-600" />}
              <span>{opt.text}</span>
            </button>
          )
        })}
      </div>
      {selected !== null && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800"><strong>Explanation:</strong> {q.explanation}</p>
          </div>
          <button onClick={nextQuestion} className="bg-primary-600 text-white px-6 py-2 rounded-lg">
            {currentQ + 1 >= questions.length ? 'See Results' : 'Next Question'}
          </button>
        </motion.div>
      )}
    </div>
  )
}
