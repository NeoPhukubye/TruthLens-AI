import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, Shield, BookOpen, AlertTriangle, Trophy, Flame, Star, Award, Loader2, Users } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import api from '../services/api'

interface DashboardStats {
  stats: {
    articles_checked: number
    avg_credibility: number
    quizzes_completed: number
    lessons_completed: number
    debates_participated: number
    total_xp: number
    level: number
    streak_days: number
  }
  weekly_activity: { day: string; checks: number }[]
  badges: { id: string; name: string; earned_at: string }[]
  level_progress: {
    current_level: number
    current_xp: number
    xp_for_next_level: number
  }
}

interface LeaderboardEntry {
  username: string
  xp: number
  level: number
  streak: number
  badges_count: number
}

export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardStats | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'leaderboard'>('overview')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, lbRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/leaderboard'),
        ])
        setData(statsRes.data)
        setLeaderboard(lbRes.data.leaderboard)
      } catch {
        // Fallback for when user has no data yet
        setData({
          stats: { articles_checked: 0, avg_credibility: 0, quizzes_completed: 0, lessons_completed: 0, debates_participated: 0, total_xp: 0, level: 1, streak_days: 0 },
          weekly_activity: [
            { day: 'Mon', checks: 0 }, { day: 'Tue', checks: 0 }, { day: 'Wed', checks: 0 },
            { day: 'Thu', checks: 0 }, { day: 'Fri', checks: 0 }, { day: 'Sat', checks: 0 }, { day: 'Sun', checks: 0 },
          ],
          badges: [],
          level_progress: { current_level: 1, current_xp: 0, xp_for_next_level: 100 },
        })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-accent-blue" />
      </div>
    )
  }

  if (!data) return null

  const xpProgress = data.level_progress.xp_for_next_level > 0
    ? (data.level_progress.current_xp % data.level_progress.xp_for_next_level) / data.level_progress.xp_for_next_level * 100
    : 0

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="section-title">Your Dashboard</h1>
          {user && <p className="text-dark-200 mt-1">Welcome back, {user.username}</p>}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg text-sm transition ${activeTab === 'overview' ? 'bg-accent-blue text-white' : 'bg-dark-600 text-dark-100 hover:bg-dark-500'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-4 py-2 rounded-lg text-sm transition ${activeTab === 'leaderboard' ? 'bg-accent-blue text-white' : 'bg-dark-600 text-dark-100 hover:bg-dark-500'}`}
          >
            <Users className="h-4 w-4 inline mr-1" />Leaderboard
          </button>
        </div>
      </div>

      {activeTab === 'overview' ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Level & XP Bar */}
          <div className="card p-6 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="bg-accent-blue/10 text-accent-blue p-2.5 rounded-xl">
                  <Star className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-white font-bold text-lg">Level {data.stats.level}</p>
                  <p className="text-dark-200 text-sm">{data.stats.total_xp} XP total</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-accent-amber">
                  <Flame className="h-5 w-5" />
                  <span className="font-bold">{data.stats.streak_days}</span>
                  <span className="text-dark-200 text-sm">day streak</span>
                </div>
              </div>
            </div>
            <div className="bg-dark-700 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-accent-blue to-accent-cyan rounded-full"
              />
            </div>
            <p className="text-dark-300 text-xs mt-2">{Math.round(xpProgress)}% to Level {data.stats.level + 1}</p>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard icon={Shield} label="Articles Checked" value={data.stats.articles_checked} color="blue" />
            <StatCard icon={BookOpen} label="Lessons Done" value={data.stats.lessons_completed} color="cyan" />
            <StatCard icon={Trophy} label="Quizzes Passed" value={data.stats.quizzes_completed} color="purple" />
            <StatCard icon={AlertTriangle} label="Debates Joined" value={data.stats.debates_participated} color="amber" />
          </div>

          {/* Weekly Chart */}
          <div className="card p-6 mb-8">
            <h2 className="text-lg font-semibold text-white mb-6">Weekly Activity</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.weekly_activity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d2d4a" />
                <XAxis dataKey="day" stroke="#8888a4" fontSize={12} />
                <YAxis stroke="#8888a4" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #2d2d4a', borderRadius: '8px', color: '#fff' }}
                  labelStyle={{ color: '#b4b4cc' }}
                />
                <Bar dataKey="checks" fill="#4f8fff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Badges */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-accent-amber" /> Badges Earned
            </h2>
            {data.badges.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {data.badges.map((badge) => (
                  <div key={badge.id} className="bg-dark-700/50 rounded-lg p-4 text-center border border-accent-amber/20">
                    <Award className="h-8 w-8 text-accent-amber mx-auto mb-2" />
                    <p className="text-white text-sm font-medium">{badge.name}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-dark-300">
                <Trophy className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Start analyzing content and taking quizzes to earn badges!</p>
              </div>
            )}
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="card overflow-hidden">
            <div className="p-6 border-b border-dark-600">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Trophy className="h-5 w-5 text-accent-amber" /> Global Leaderboard
              </h2>
            </div>
            {leaderboard.length > 0 ? (
              <div className="divide-y divide-dark-600/50">
                {leaderboard.map((entry, i) => (
                  <div key={entry.username} className={`flex items-center gap-4 px-6 py-4 ${i < 3 ? 'bg-accent-amber/5' : ''}`}>
                    <span className={`text-lg font-bold w-8 ${i === 0 ? 'text-accent-amber' : i === 1 ? 'text-dark-100' : i === 2 ? 'text-amber-700' : 'text-dark-300'}`}>
                      #{i + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-white font-medium">{entry.username}</p>
                      <p className="text-dark-300 text-xs">Level {entry.level} · {entry.badges_count} badges</p>
                    </div>
                    <div className="text-right">
                      <p className="text-accent-blue font-bold">{entry.xp} XP</p>
                      {entry.streak > 0 && (
                        <p className="text-accent-amber text-xs flex items-center gap-1 justify-end">
                          <Flame className="h-3 w-3" />{entry.streak}d
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-dark-300">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No one on the leaderboard yet. Be the first!</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string | number; color: string }) {
  const colorMap: Record<string, string> = {
    blue: 'bg-accent-blue/10 text-accent-blue',
    cyan: 'bg-accent-cyan/10 text-accent-cyan',
    red: 'bg-accent-red/10 text-accent-red',
    purple: 'bg-accent-purple/10 text-accent-purple',
    amber: 'bg-accent-amber/10 text-accent-amber',
  }
  return (
    <div className="stat-card">
      <div className={`inline-flex p-2.5 rounded-lg mb-3 w-fit ${colorMap[color]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-dark-200 mt-1">{label}</p>
    </div>
  )
}
