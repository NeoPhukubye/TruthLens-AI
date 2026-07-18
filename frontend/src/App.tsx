import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Analyze from './pages/Analyze'
import Dashboard from './pages/Dashboard'
import Learn from './pages/Learn'
import Quiz from './pages/Quiz'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="analyze" element={<Analyze />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="learn" element={<Learn />} />
        <Route path="quiz" element={<Quiz />} />
      </Route>
    </Routes>
  )
}

export default App
