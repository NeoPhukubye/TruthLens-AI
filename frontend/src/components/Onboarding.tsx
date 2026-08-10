import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Search, Shield, BookOpen, Trophy, ArrowRight, X, Sparkles } from 'lucide-react'

const steps = [
  {
    icon: Search,
    title: 'Analyze Any Content',
    description: 'Paste a headline, article, or social media post. Our AI extracts claims, detects bias, and identifies manipulation techniques.',
    action: 'Try pasting a news headline to see it in action.',
    color: 'accent-blue',
  },
  {
    icon: Shield,
    title: 'Understand Why',
    description: "TruthLens doesn't just flag misinformation — it explains WHY something is misleading and teaches you to spot it yourself.",
    action: 'Each result links to a UNESCO MIL competency you are building.',
    color: 'accent-cyan',
  },
  {
    icon: BookOpen,
    title: 'Learn & Practice',
    description: 'Take AI-generated quizzes, join live debates, and complete lessons to build your media literacy skills.',
    action: 'Earn XP and badges as you progress!',
    color: 'accent-purple',
  },
  {
    icon: Trophy,
    title: 'Track Your Journey',
    description: 'Watch your critical thinking skills grow. Maintain streaks, climb the leaderboard, and unlock achievements.',
    action: 'Ready to start your media literacy journey?',
    color: 'accent-amber',
  },
]

export default function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0)
  const navigate = useNavigate()

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
      navigate('/analyze')
    }
  }

  const handleSkip = () => {
    onComplete()
  }

  const step = steps[currentStep]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-900/90 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-lg card p-8"
      >
        <button onClick={handleSkip} className="absolute top-4 right-4 text-dark-300 hover:text-white transition" aria-label="Skip onboarding">
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="h-4 w-4 text-accent-blue" />
          <span className="text-dark-200 text-sm">Getting Started ({currentStep + 1}/{steps.length})</span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className={`inline-flex p-3 rounded-xl bg-${step.color}/10 text-${step.color} mb-5`}>
              <step.icon className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">{step.title}</h2>
            <p className="text-dark-100 leading-relaxed mb-4">{step.description}</p>
            <p className="text-sm text-dark-200 italic">{step.action}</p>
          </motion.div>
        </AnimatePresence>

        {/* Progress dots */}
        <div className="flex items-center justify-between mt-8">
          <div className="flex gap-2">
            {steps.map((_, i) => (
              <div key={i} className={`h-2 rounded-full transition-all ${i === currentStep ? 'w-6 bg-accent-blue' : 'w-2 bg-dark-500'}`} />
            ))}
          </div>
          <button onClick={handleNext} className="btn-primary flex items-center gap-2">
            {currentStep === steps.length - 1 ? "Let's Go!" : 'Next'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    </div>
  )
}
