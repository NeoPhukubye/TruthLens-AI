import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, Search, BookOpen, HelpCircle, BarChart3, Eye } from 'lucide-react'

const features = [
  { icon: Search, title: 'Claim Analyzer', description: 'Extract and analyze claims from any content', link: '/analyze' },
  { icon: Shield, title: 'Credibility Score', description: 'Get a detailed credibility breakdown', link: '/analyze' },
  { icon: Eye, title: 'Bias Detector', description: 'Detect political bias, emotional manipulation, and propaganda', link: '/analyze' },
  { icon: BookOpen, title: 'Learn Mode', description: 'Understand WHY something is trustworthy or not', link: '/learn' },
  { icon: HelpCircle, title: 'Daily Quizzes', description: 'Test your media literacy skills and earn XP', link: '/quiz' },
  { icon: BarChart3, title: 'Progress Dashboard', description: 'Track your critical thinking journey', link: '/dashboard' },
]

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-24 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold mb-4"
          >
            See Beyond the Headlines
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto"
          >
            Empowering youth to verify, understand, and critically evaluate digital information.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link
              to="/analyze"
              className="inline-block bg-white text-primary-700 font-semibold px-8 py-3 rounded-lg hover:bg-primary-50 transition"
            >
              Start Analyzing
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Core Features</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link to={feature.link} className="block p-6 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition">
                <feature.icon className="h-10 w-10 text-primary-600 mb-4" />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}
