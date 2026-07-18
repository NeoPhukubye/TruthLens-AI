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
      <h1 className="text-3xl font-bold mb-8">Your Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard icon={Shield} label="Articles Checked" value={mockStats.articlesChecked} color="blue" />
        <StatCard icon={TrendingUp} label="Avg Credibility" value={`${mockStats.avgCredibility}%`} color="green" />
        <StatCard icon={AlertTriangle} label="Bad Sources Avoided" value={mockStats.badSourcesAvoided} color="red" />
        <StatCard icon={BookOpen} label="Lessons Completed" value={mockStats.lessonsCompleted} color="purple" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Weekly Activity</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="checks" fill="#2563eb" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string | number; color: string }) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
  }
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className={`inline-flex p-2 rounded-lg mb-3 ${colorMap[color]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  )
}
