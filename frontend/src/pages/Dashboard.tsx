import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, Shield, BookOpen, AlertTriangle } from 'lucide-react'

const mockStats = {
  articlesChecked: 215,
  avgCredibility: 81,
  badSourcesAvoided: 43,
  lessonsCompleted: 12,
}

const weeklyData = [
  { day: 'Mon', checks: 4 },
  { day: 'Tue', checks: 7 },
  { day: 'Wed', checks: 3 },
  { day: 'Thu', checks: 8 },
  { day: 'Fri', checks: 5 },
  { day: 'Sat', checks: 2 },
  { day: 'Sun', checks: 6 },
]

export default function Dashboard() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="section-title mb-8">Your Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard icon={Shield} label="Articles Checked" value={mockStats.articlesChecked} color="blue" />
        <StatCard icon={TrendingUp} label="Avg Credibility" value={`${mockStats.avgCredibility}%`} color="cyan" />
        <StatCard icon={AlertTriangle} label="Bad Sources Avoided" value={mockStats.badSourcesAvoided} color="red" />
        <StatCard icon={BookOpen} label="Lessons Completed" value={mockStats.lessonsCompleted} color="purple" />
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-white mb-6">Weekly Activity</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={weeklyData}>
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
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string | number; color: string }) {
  const colorMap: Record<string, string> = {
    blue: 'bg-accent-blue/10 text-accent-blue',
    cyan: 'bg-accent-cyan/10 text-accent-cyan',
    red: 'bg-accent-red/10 text-accent-red',
    purple: 'bg-accent-purple/10 text-accent-purple',
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
