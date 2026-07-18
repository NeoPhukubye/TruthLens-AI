import { useState } from 'react'
import { BookOpen, ChevronRight } from 'lucide-react'

const topics = [
  { id: 'source-verification', title: 'Source Verification', description: 'Learn how to evaluate if a source is credible' },
  { id: 'bias-detection', title: 'Detecting Bias', description: 'Identify political and emotional bias in content' },
  { id: 'fact-checking', title: 'Fact-Checking Basics', description: 'Step-by-step guide to verifying claims' },
  { id: 'image-verification', title: 'Image Verification', description: 'Spot manipulated and AI-generated images' },
  { id: 'clickbait', title: 'Recognizing Clickbait', description: 'Understand manipulation tactics in headlines' },
  { id: 'statistics', title: 'Misleading Statistics', description: 'How numbers can be used to deceive' },
]

export default function Learn() {
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
      <h1 className="text-3xl font-bold mb-2">Learn Mode</h1>
      <p className="text-gray-600 mb-8">Master media literacy skills step by step.</p>

      {!selectedTopic ? (
        <div className="grid md:grid-cols-2 gap-4">
          {topics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => loadLesson(topic.id)}
              className="text-left p-6 bg-white rounded-xl border border-gray-200 hover:shadow-md transition flex items-center justify-between"
            >
              <div className="flex items-start gap-3">
                <BookOpen className="h-6 w-6 text-primary-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold">{topic.title}</h3>
                  <p className="text-sm text-gray-500">{topic.description}</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>
          ))}
        </div>
      ) : loading ? (
        <div className="text-center py-12 text-gray-500">Loading lesson...</div>
      ) : lesson ? (
        <div>
          <button onClick={() => { setSelectedTopic(null); setLesson(null) }} className="text-primary-600 mb-6 hover:underline">
            &larr; Back to topics
          </button>
          <h2 className="text-2xl font-bold mb-2">{lesson.title}</h2>
          <p className="text-gray-600 mb-6">{lesson.introduction}</p>
          <div className="space-y-6">
            {lesson.steps?.map((step: any) => (
              <div key={step.step_number} className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold mb-2">Step {step.step_number}: {step.title}</h3>
                <p className="text-gray-700 mb-2">{step.content}</p>
                {step.example && <p className="text-sm bg-blue-50 p-3 rounded-lg text-blue-800"><strong>Example:</strong> {step.example}</p>}
                {step.tip && <p className="text-sm text-green-700 mt-2"><strong>Tip:</strong> {step.tip}</p>}
              </div>
            ))}
          </div>
          {lesson.key_takeaways && (
            <div className="mt-8 bg-green-50 rounded-xl p-6">
              <h3 className="font-semibold text-green-800 mb-2">Key Takeaways</h3>
              <ul className="list-disc list-inside text-green-700 space-y-1">
                {lesson.key_takeaways.map((t: string, i: number) => <li key={i}>{t}</li>)}
              </ul>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}
