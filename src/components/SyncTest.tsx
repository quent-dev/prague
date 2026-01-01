import { useState } from 'react'
import { useAppStore } from '../stores/appStore'
import { useSyncStore } from '../stores/syncStore'
import { useSupabase } from '../hooks/useSupabase'

export const SyncTest = () => {
  const { currentSession, dailyEntries, weeklyEntries, goalsConfig } = useAppStore()
  const { isOnline, pendingOperations, lastSyncTime } = useSyncStore()
  const [testResult, setTestResult] = useState<string | null>(null)
  const [isTestingSync, setIsTestingSync] = useState(false)
  const supabase = useSupabase()

  const runSyncTest = async () => {
    if (!currentSession) {
      setTestResult('❌ No active session found')
      return
    }

    setIsTestingSync(true)
    setTestResult(null)

    try {
      // Test 1: Check network connectivity
      const networkTest = navigator.onLine
      if (!networkTest) {
        setTestResult('❌ Network connectivity test failed')
        setIsTestingSync(false)
        return
      }

      // Test 2: Fetch data from Supabase
      const dailyData = await supabase.getDailyEntries()
      const weeklyData = await supabase.getWeeklyEntries()

      // Test 3: Check data consistency
      const localDailyCount = dailyEntries.length
      const remoteDailyCount = dailyData.length
      const localWeeklyCount = weeklyEntries.length
      const remoteWeeklyCount = weeklyData.length

      const results = [
        `✅ Network: Connected`,
        `✅ Database: Accessible`,
        `📊 Daily entries: ${localDailyCount} local, ${remoteDailyCount} remote`,
        `📊 Weekly entries: ${localWeeklyCount} local, ${remoteWeeklyCount} remote`,
        `📊 Goals config: ${goalsConfig.length} local configs`,
        `⏰ Last sync: ${lastSyncTime ? new Date(lastSyncTime).toLocaleString() : 'Never'}`,
        `🔄 Pending operations: ${pendingOperations.length}`,
        isOnline ? '✅ Sync status: Online' : '⚠️ Sync status: Offline'
      ]

      setTestResult(results.join('\n'))

    } catch (error: any) {
      setTestResult(`❌ Sync test failed: ${error.message}`)
    } finally {
      setIsTestingSync(false)
    }
  }

  const formatSyncReport = (result: string) => {
    return result.split('\n').map((line, i) => (
      <div key={i} className="text-sm py-1">{line}</div>
    ))
  }

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <h3 className="font-medium text-gray-900 mb-4">🔄 Sync Test</h3>
      
      <div className="space-y-4">
        <button
          onClick={runSyncTest}
          disabled={isTestingSync || !currentSession}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50"
        >
          {isTestingSync ? 'Testing...' : 'Test Cross-Device Sync'}
        </button>

        {testResult && (
          <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
            <div className="text-xs font-medium text-gray-600 mb-2">Test Results:</div>
            <div className="font-mono text-xs text-gray-700">
              {formatSyncReport(testResult)}
            </div>
          </div>
        )}

        {/* Real-time sync status */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center">
            <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
            <div className="text-xs text-gray-600">
              {isOnline ? 'Online' : 'Offline'}
            </div>
          </div>
          
          <div className="text-center">
            <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${
              pendingOperations.length === 0 ? 'bg-green-500' : 'bg-yellow-500'
            }`} />
            <div className="text-xs text-gray-600">
              {pendingOperations.length} Pending
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>To test cross-device sync:</strong></p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Run this test on your first device</li>
            <li>Note your pairing code in Settings</li>
            <li>Open the app on a second device</li>
            <li>Enter the pairing code to join</li>
            <li>Make changes on either device</li>
            <li>Verify changes appear on both devices</li>
          </ol>
        </div>
      </div>
    </div>
  )
}