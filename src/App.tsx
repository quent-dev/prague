import { Routes, Route } from 'react-router-dom'
import { useSession } from './hooks/useSession'
import { useSync } from './hooks/useSync'
import { SessionWelcome } from './components/SessionWelcome'
import { SessionStatus } from './components/SessionStatus'
import { Navigation } from './components/Navigation'
import { DailyLog } from './pages/DailyLog'
import { Dashboard } from './pages/Dashboard'
import { Calendar } from './pages/Calendar'
import { GoalConfig } from './pages/GoalConfig'
import { Settings } from './pages/Settings'
import { ErrorBoundary } from './components/ErrorBoundary'

function App() {
  const { hasSession, isInitialized } = useSession()
  useSync() // Initialize sync service

  // Show loading while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Loading Prague Tracker...</p>
        </div>
      </div>
    )
  }

  // Show session welcome if no session
  if (!hasSession) {
    return <SessionWelcome onSessionReady={() => window.location.reload()} />
  }

  // Main app with navigation
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Session status bar */}
        <SessionStatus />
        
        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<DailyLog />} />
              <Route path="/daily" element={<DailyLog />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/goals" element={<GoalConfig />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </ErrorBoundary>
        </main>
        
        {/* Bottom navigation */}
        <Navigation />
      </div>
    </ErrorBoundary>
  )
}

export default App
