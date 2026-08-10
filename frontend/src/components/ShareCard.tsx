import { useState } from 'react'
import { Share2, Copy, Check, Twitter, MessageCircle } from 'lucide-react'

interface ShareCardProps {
  title: string
  summary: string
  score?: number
  type: string
}

export default function ShareCard({ title, summary, score, type }: ShareCardProps) {
  const [copied, setCopied] = useState(false)
  const [showShare, setShowShare] = useState(false)

  const shareText = `I just analyzed content with TruthLens AI!\n\n${type}: "${title}"\n${summary}${score !== undefined ? `\nCredibility Score: ${score}/100` : ''}\n\nBuild your media literacy: #TruthLensAI #MediaLiteracy #UNESCO`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`
    window.open(url, '_blank', 'width=550,height=420')
  }

  const handleWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`
    window.open(url, '_blank')
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowShare(!showShare)}
        className="btn-secondary text-sm flex items-center gap-1.5"
        aria-label="Share results"
      >
        <Share2 className="h-4 w-4" /> Share
      </button>

      {showShare && (
        <div className="absolute right-0 top-full mt-2 w-64 card p-4 z-50 shadow-xl">
          <p className="text-white text-sm font-medium mb-3">Share your analysis</p>
          <div className="space-y-2">
            <button onClick={handleCopy} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 transition text-sm text-dark-100">
              {copied ? <Check className="h-4 w-4 text-accent-cyan" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied!' : 'Copy to clipboard'}
            </button>
            <button onClick={handleTwitter} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 transition text-sm text-dark-100">
              <Twitter className="h-4 w-4" /> Share on X
            </button>
            <button onClick={handleWhatsApp} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 transition text-sm text-dark-100">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
