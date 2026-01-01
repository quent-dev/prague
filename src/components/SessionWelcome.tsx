import { useState } from 'react'
import { useSession } from '../hooks/useSession'
import { Loading } from './Loading'
import { FormFeedback } from './FormFeedback'

interface SessionWelcomeProps {
  onSessionReady: () => void
}

export const SessionWelcome = ({ onSessionReady }: SessionWelcomeProps) => {
  const [mode, setMode] = useState<'welcome' | 'create' | 'join' | 'scan'>('welcome')
  const [joinCode, setJoinCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { createNewSession, joinSession } = useSession()

  const handleCreateSession = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      await createNewSession()
      onSessionReady()
    } catch (err: any) {
      setError(err.message || 'Failed to create session')
    } finally {
      setIsLoading(false)
    }
  }

  const handleJoinSession = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!joinCode.trim()) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      // First try to parse as QR code JSON
      let pairingCode = joinCode
      
      try {
        const qrData = JSON.parse(joinCode)
        if (qrData.app === 'prague-tracker' && qrData.code) {
          pairingCode = qrData.code
        }
      } catch {
        // Not JSON, treat as regular code
      }
      
      // Convert 8-digit code back to full session key format
      const sessionKey = pairingCode.toLowerCase().padEnd(30, 'x') + Math.random().toString(36).substring(2)
      await joinSession(sessionKey)
      onSessionReady()
    } catch (err: any) {
      setError(err.message || 'Failed to join session')
    } finally {
      setIsLoading(false)
    }
  }

  if (mode === 'welcome') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to Prague Tracker
            </h1>
            <p className="text-gray-600">
              Your 30-day health and lifestyle challenge tracker
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setMode('create')}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Start New Challenge
            </button>
            
            <button
              onClick={() => setMode('join')}
              className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Continue on Another Device
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              No account needed • Data syncs across devices
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (mode === 'create') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Start Your Challenge
            </h2>
            <p className="text-gray-600">
              We'll create a secure session to track your progress
            </p>
          </div>

          {error && (
            <div className="mb-6">
              <FormFeedback type="error" message={error} onClose={() => setError(null)} />
            </div>
          )}

          {isLoading ? (
            <Loading message="Creating your challenge..." />
          ) : (
            <div className="space-y-4">
              <button
                onClick={handleCreateSession}
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 tap-target focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Create My Challenge
              </button>
            
              <button
                onClick={() => setMode('welcome')}
                className="w-full text-gray-600 py-2 hover:text-gray-800 transition-colors tap-target focus:outline-none focus:ring-2 focus:ring-gray-400 rounded"
              >
                ← Back
              </button>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Your data is stored securely and can be accessed from any device with your pairing code
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (mode === 'join') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Continue Your Challenge
            </h2>
            <p className="text-gray-600">
              Enter your 8-digit pairing code
            </p>
          </div>

          {error && (
            <div className="mb-6">
              <FormFeedback type="error" message={error} onClose={() => setError(null)} />
            </div>
          )}

          <form onSubmit={handleJoinSession} className="space-y-4">
            <div>
              <label htmlFor="joinCode" className="block text-sm font-medium text-gray-700 mb-1">
                Pairing Code or QR Code Data
              </label>
              <textarea
                id="joinCode"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="ABC12DEF or paste QR code data"
                rows={3}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the 8-digit code or paste QR code data from another device
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || joinCode.trim().length === 0}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
            >
              {isLoading ? 'Joining...' : 'Continue Challenge'}
            </button>
            
            <button
              type="button"
              onClick={() => setMode('welcome')}
              className="w-full text-gray-600 py-2 hover:text-gray-800 transition-colors"
            >
              ← Back
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              You can find your pairing code in the settings of your other device
            </p>
          </div>
        </div>
      </div>
    )
  }

  return null
}