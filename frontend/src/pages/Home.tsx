import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, Search, BookOpen, HelpCircle, BarChart3, Eye, Camera, Accessibility, ArrowRight, Zap } from 'lucide-react'
import { useI18n } from '../hooks/useI18n'

export default function Home() {
  const { t } = useI18n()

  const features = [
    { icon: Search, title: 'Claim Analyzer', description: 'AI-powered extraction of claims, facts, and entities from any content', link: '/analyze', color: 'accent-blue' },
    { icon: Camera, title: 'AI Image Detector', description: 'Forensic analysis to distinguish AI-generated images from real photographs', link: '/image-detector', color: 'accent-purple' },
    { icon: Shield, title: 'Credibility Score', description: 'Multi-dimensional scoring across source reliability, evidence, and manipulation', link: '/analyze', color: 'accent-cyan' },
    { icon: Eye, title: 'Bias Detector', description: 'Identify political bias, emotional manipulation, and propaganda techniques', link: '/analyze', color: 'accent-amber' },
    { icon: BookOpen, title: 'Learn Mode', description: 'Understand WHY something is misleading — not just that it is', link: '/learn', color: 'accent-cyan' },
    { icon: HelpCircle, title: 'Daily Quizzes', description: 'Test your media literacy with interactive challenges and earn XP', link: '/quiz', color: 'accent-amber' },
    { icon: BarChart3, title: 'Progress Tracking', description: 'Visualize your critical thinking journey with analytics', link: '/dashboard', color: 'accent-blue' },
    { icon: Accessibility, title: 'Universal Access', description: 'Voice control, sign language, 6 languages, screen reader optimized', link: '/accessibility', color: 'accent-purple' },
  ]

  const stats = [
    { value: '6+', label: 'Languages' },
    { value: '4', label: 'Sign Languages' },
    { value: '9', label: 'Analysis Tools' },
    { value: '∞', label: 'Critical Thinkers' },
  ]

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/5 via-transparent to-accent-purple/5" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-accent-blue/5 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 py-24 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <span className="badge-blue text-sm mb-6 inline-flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5" /> UNESCO MIL Hackathon 2025
              </span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display text-5xl lg:text-7xl font-bold text-white mb-6 leading-[1.1] tracking-tight"
            >
              {t.home.title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-dark-100 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              {t.home.subtitle}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/analyze" className="btn-primary text-lg px-8 py-3.5 inline-flex items-center gap-2">
                {t.home.cta} <ArrowRight className="h-5 w-5" />
              </Link>
              <Link to="/image-detector" className="btn-secondary text-lg px-8 py-3.5 inline-flex items-center gap-2">
                <Camera className="h-5 w-5" /> Detect AI Images
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-dark-600/50 bg-surface-secondary/50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="text-center"
              >
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-dark-200 text-sm mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <h2 className="section-title mb-3">Verification Tools</h2>
          <p className="text-dark-200 text-lg max-w-xl mx-auto">A comprehensive toolkit for evaluating digital information and building media literacy.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
            >
              <Link to={feature.link} className="card-hover p-6 h-full flex flex-col group">
                <div className={`inline-flex p-2.5 rounded-lg bg-${feature.color}/10 text-${feature.color} mb-4 w-fit`}>
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2 group-hover:text-accent-blue transition-colors">{feature.title}</h3>
                <p className="text-dark-200 text-sm leading-relaxed flex-1">{feature.description}</p>
                <div className="mt-4 flex items-center text-accent-blue text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Explore</span> <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-surface-secondary/50 border-y border-dark-600/50">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <h2 className="section-title text-center mb-14">How TruthLens Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Submit Content', description: 'Paste any article, tweet, or image you want to verify.' },
              { step: '02', title: 'AI Analysis', description: 'Our hybrid pipeline extracts claims, detects bias, and cross-references sources.' },
              { step: '03', title: 'Learn & Understand', description: 'Get explained results that teach you how to evaluate information yourself.' },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="text-center"
              >
                <span className="text-5xl font-bold text-dark-500 font-mono">{item.step}</span>
                <h3 className="text-lg font-semibold text-white mt-4 mb-2">{item.title}</h3>
                <p className="text-dark-200">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
