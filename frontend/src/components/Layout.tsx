import { Outlet, Link } from 'react-router-dom'
import { Shield, BookOpen, BarChart3, HelpCircle, Search } from 'lucide-react'

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">TruthLens AI</span>
            </Link>
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/analyze" className="flex items-center space-x-1 text-gray-600 hover:text-primary-600 transition">
                <Search className="h-4 w-4" />
                <span>Analyze</span>
              </Link>
              <Link to="/learn" className="flex items-center space-x-1 text-gray-600 hover:text-primary-600 transition">
                <BookOpen className="h-4 w-4" />
                <span>Learn</span>
              </Link>
              <Link to="/quiz" className="flex items-center space-x-1 text-gray-600 hover:text-primary-600 transition">
                <HelpCircle className="h-4 w-4" />
                <span>Quiz</span>
              </Link>
              <Link to="/dashboard" className="flex items-center space-x-1 text-gray-600 hover:text-primary-600 transition">
                <BarChart3 className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </div>
          </div>
        </nav>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          TruthLens AI &mdash; Empowering critical thinking in the digital age.
        </div>
      </footer>
    </div>
  )
}
