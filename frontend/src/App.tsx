import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Onboarding from './components/Onboarding'
import Home from './pages/Home'
import Analyze from './pages/Analyze'
import Dashboard from './pages/Dashboard'
import Learn from './pages/Learn'
import Quiz from './pages/Quiz'
import ImageDetector from './pages/ImageDetector'
import ImageCompare from './pages/ImageCompare'
import Accessibility from './pages/Accessibility'
import Debates from './pages/Debates'
import Login from './pages/Login'

function App() {
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    const seen = localStorage.getItem('truthlens-onboarding-seen')
    if (!seen) setShowOnboarding(true)
  }, [])

  const handleOnboardingComplete = () => {
    localStorage.setItem('truthlens-onboarding-seen', 'true')
    setShowOnboarding(false)
  }

  return (
    <>
      {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="analyze" element={<Analyze />} />
          <Route path="image-detector" element={<ImageDetector />} />
          <Route path="image-compare" element={<ImageCompare />} />
          <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="learn" element={<Learn />} />
          <Route path="quiz" element={<Quiz />} />
          <Route path="debates" element={<Debates />} />
          <Route path="accessibility" element={<Accessibility />} />
          <Route path="login" element={<Login />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
