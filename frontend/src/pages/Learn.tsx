import { useState } from 'react'
import { BookOpen, ChevronRight, ArrowLeft } from 'lucide-react'
import { useI18n } from '../hooks/useI18n'

const topics = [
  { id: 'source-verification', title: 'Source Verification', description: 'Learn how to evaluate if a source is credible' },
  { id: 'bias-detection', title: 'Detecting Bias', description: 'Identify political and emotional bias in content' },
  { id: 'fact-checking', title: 'Fact-Checking Basics', description: 'Step-by-step guide to verifying claims' },
  { id: 'image-verification', title: 'Image Verification', description: 'Spot manipulated and AI-generated images' },
  { id: 'clickbait', title: 'Recognizing Clickbait', description: 'Understand manipulation tactics in headlines' },
  { id: 'statistics', title: 'Misleading Statistics', description: 'How numbers can be used to deceive' },
]

export default function Learn() {
  const { t } = useI18n()
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [lesson, setLesson] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const loadLesson = async (topicId: string) => {
    setSelectedTopic(topicId)
    setLoading(true)
    try {
      const res = await fetch('/api/learn/lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topicId, level: 'beginner' }),
      })
      const data = await res.json()
      setLesson(data)
    } catch {
      console.error('Failed to load lesson')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="section-title mb-2">{t.nav.learn}</h1>
      <p className="text-dark-200 text-lg mb-8">Master media literacy skills step by step.</p>

      {!selectedTopic ? (
        <div className="grid md:grid-cols-2 gap-4">
          {topics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => loadLesson(topic.id)}
              className="card-hover text-left p-6 flex items-center justify-between group"
            >
              <div className="flex items-start gap-3">
                <BookOpen className="h-5 w-5 text-accent-cyan mt-0.5" />
                <div>
                  <h3 className="font-semibold text-white group-hover:text-accent-blue transition">{topic.title}</h3>
                  <p className="text-sm text-dark-200 mt-1">{topic.description}</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-dark-300 group-hover:text-accent-blue transition" />
            </button>
          ))}
        </div>
      ) : loading ? (
        <div className="text-center py-16 text-dark-200">{t.common.loading}</div>
      ) : lesson ? (
        <div>
          <button onClick={() => { setSelectedTopic(null); setLesson(null) }} className="flex items-center gap-1.5 text-accent-blue mb-8 hover:underline text-sm font-medium">
            <ArrowLeft className="h-4 w-4" /> {t.common.back}
          </button>
          <h2 className="text-2xl font-bold text-white mb-2">{lesson.title}</h2>
          <p className="text-dark-200 mb-8">{lesson.introduction}</p>
          <div className="space-y-4">
            {lesson.steps?.map((step: any) => (
              <div key={step.step_number} className="card p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="bg-accent-blue/10 text-accent-blue text-xs font-mono font-bold px-2.5 py-1 rounded">{String(step.step_number).padStart(2, '0')}</span>
                  <h3 className="font-semibold text-white">{step.title}</h3>
                </div>
                <p className="text-dark-100 mb-3 leading-relaxed">{step.content}</p>
                {step.example && (
                  <div className="bg-accent-blue/5 border border-accent-blue/20 p-4 rounded-lg">
                    <p className="text-sm text-accent-blue"><strong>Example:</strong> {step.example}</p>
                  </div>
                )}
                {step.tip && <p className="text-sm text-accent-cyan mt-3"><strong>Tip:</strong> {step.tip}</p>}
              </div>
            ))}
          </div>
          {lesson.key_takeaways && (
            <div className="mt-8 card border-accent-cyan/30 p-6">
              <h3 className="font-semibold text-accent-cyan mb-3">Key Takeaways</h3>
              <ul className="space-y-2">
                {lesson.key_takeaways.map((t: string, i: number) => (
                  <li key={i} className="text-dark-100 text-sm flex items-start gap-2">
                    <span className="text-accent-cyan mt-0.5">&#10003;</span>{t}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}
