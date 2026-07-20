import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Analyze from './pages/Analyze'
import Dashboard from './pages/Dashboard'
import Learn from './pages/Learn'
import Quiz from './pages/Quiz'
import ImageDetector from './pages/ImageDetector'
import Accessibility from './pages/Accessibility'
import Debates from './pages/Debates'
import Login from './pages/Login'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="analyze" element={<Analyze />} />
        <Route path="image-detector" element={<ImageDetector />} />
        <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="learn" element={<Learn />} />
        <Route path="quiz" element={<Quiz />} />
        <Route path="debates" element={<Debates />} />
        <Route path="accessibility" element={<Accessibility />} />
        <Route path="login" element={<Login />} />
      </Route>
    </Routes>
  )
}

export default App
