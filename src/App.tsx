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
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="bg-dark-card p-8 rounded-lg border border-dark-border">
          <div className="spinner w-8 h-8 mx-auto mb-4" />
          <p className="text-dark-text-secondary">Loading Prague Tracker...</p>
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
      <div className="min-h-screen bg-dark-bg text-dark-text-primary flex flex-col">
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
