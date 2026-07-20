import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Loader2 } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { ApiError } from '../services/api'

export default function Login() {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        await register(email, username, password)
      }
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <div className="text-center mb-8">
        <div className="inline-flex p-3 rounded-xl bg-accent-blue/10 mb-4">
          <Shield className="h-8 w-8 text-accent-blue" />
        </div>
        <h1 className="text-2xl font-bold text-white">
          {mode === 'login' ? 'Welcome Back' : 'Create Account'}
        </h1>
        <p className="text-dark-200 mt-2">
          {mode === 'login' ? 'Sign in to track your progress' : 'Join TruthLens AI'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-dark-100 mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-dark w-full"
            required
          />
        </div>

        {mode === 'register' && (
          <div>
            <label className="block text-sm font-medium text-dark-100 mb-1.5">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-dark w-full"
              required
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-dark-100 mb-1.5">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-dark w-full"
            required
          />
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-accent-red/10 border border-accent-red/20 text-accent-red text-sm">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === 'login' ? 'Sign In' : 'Create Account'}
        </button>

        <p className="text-center text-sm text-dark-200">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="text-accent-blue hover:underline"
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </form>
    </div>
  )
}
