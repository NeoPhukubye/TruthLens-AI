import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Analyze from './pages/Analyze'
import Dashboard from './pages/Dashboard'
import Learn from './pages/Learn'
import Quiz from './pages/Quiz'
import ImageDetector from './pages/ImageDetector'
import Accessibility from './pages/Accessibility'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="analyze" element={<Analyze />} />
        <Route path="image-detector" element={<ImageDetector />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="learn" element={<Learn />} />
        <Route path="quiz" element={<Quiz />} />
        <Route path="accessibility" element={<Accessibility />} />
      </Route>
    </Routes>
  )
}

export default App
