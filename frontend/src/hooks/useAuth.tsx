import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authApi } from '../services/api'

interface User {
  id: number
  email: string
  username: string
  created_at: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('truthlens-token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      authApi.me()
        .then((res) => setUser(res.data))
        .catch(() => { setToken(null); localStorage.removeItem('truthlens-token') })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [token])

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password)
    const newToken = res.data.access_token
    localStorage.setItem('truthlens-token', newToken)
    setToken(newToken)
  }

  const register = async (email: string, username: string, password: string) => {
    await authApi.register({ email, username, password })
    await login(email, password)
  }

  const logout = () => {
    localStorage.removeItem('truthlens-token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
