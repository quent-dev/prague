import { Link } from 'react-router-dom'
import { useAppStore } from '../stores/appStore'
import { format } from 'date-fns'
import { useState } from 'react'
import { DailyEntry, WeeklyEntry, GoalsConfig } from '../lib/types'
import { PWAInstall } from '../components/PWAInstall'
import { SyncTest } from '../components/SyncTest'

export const Settings = () => {
  const { 
    dailyEntries, 
    weeklyEntries, 
    goalsConfig, 
    currentSession,
    setDailyEntries,
    setWeeklyEntries,
    setGoalsConfig
  } = useAppStore()
  const [exportStatus, setExportStatus] = useState<string | null>(null)
  const [importStatus, setImportStatus] = useState<string | null>(null)

  const handleExport = () => {
    try {
      const exportData = {
        session_id: currentSession?.id,
        export_date: new Date().toISOString(),
        version: '1.0.0',
        data: {
          dailyEntries,
          weeklyEntries,
          goalsConfig
        }
      }

      const dataStr = JSON.stringify(exportData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `prague-tracker-backup-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.json`
      link.click()
      
      URL.revokeObjectURL(url)
      setExportStatus('✅ Data exported successfully!')
      setTimeout(() => setExportStatus(null), 3000)
    } catch (error) {
      setExportStatus('❌ Export failed')
      setTimeout(() => setExportStatus(null), 3000)
    }
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importData = JSON.parse(e.target?.result as string)
          
          // Basic validation
          if (!importData.data || !importData.version) {
            throw new Error('Invalid backup file format')
          }

          // Validate data structure
          const { data } = importData
          if (!data.dailyEntries || !data.weeklyEntries || !data.goalsConfig) {
            throw new Error('Missing required data fields')
          }

          // Validate that entries are arrays
          if (!Array.isArray(data.dailyEntries) || !Array.isArray(data.weeklyEntries) || !Array.isArray(data.goalsConfig)) {
            throw new Error('Invalid data structure')
          }

          // Update session IDs to match current session
          if (currentSession) {
            const updatedDailyEntries = data.dailyEntries.map((entry: DailyEntry) => ({
              ...entry,
              session_id: currentSession.id
            }))
            
            const updatedWeeklyEntries = data.weeklyEntries.map((entry: WeeklyEntry) => ({
              ...entry,
              session_id: currentSession.id
            }))

            const updatedGoalsConfig = data.goalsConfig.map((config: GoalsConfig) => ({
              ...config,
              session_id: currentSession.id
            }))

            // Import data to app store
            setDailyEntries(updatedDailyEntries)
            setWeeklyEntries(updatedWeeklyEntries)
            setGoalsConfig(updatedGoalsConfig)

            setImportStatus(`✅ Imported ${updatedDailyEntries.length} daily entries, ${updatedWeeklyEntries.length} weekly entries, and ${updatedGoalsConfig.length} goal configs`)
            setTimeout(() => setImportStatus(null), 5000)
          } else {
            throw new Error('No active session found')
          }
        } catch (error) {
          setImportStatus('❌ Import failed - Invalid file format')
          setTimeout(() => setImportStatus(null), 3000)
        }
      }
      reader.readAsText(file)
    }
    
    input.click()
  }
  return (
    <div className="p-4 pb-20">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
      
      {/* Status Messages */}
      {exportStatus && (
        <div className="mb-4 p-3 bg-blue-50 text-blue-800 rounded-lg text-sm">
          {exportStatus}
        </div>
      )}
      
      {importStatus && (
        <div className="mb-4 p-3 bg-yellow-50 text-yellow-800 rounded-lg text-sm">
          {importStatus}
        </div>
      )}
      
      <div className="space-y-4">
        {/* Goal Configuration */}
        <div className="bg-white rounded-lg shadow-sm">
          <Link
            to="/goals"
            className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🎯</span>
              <div>
                <h3 className="font-medium text-gray-900">Goal Configuration</h3>
                <p className="text-sm text-gray-600">Set your monthly goals and targets</p>
              </div>
            </div>
            <span className="text-gray-400">→</span>
          </Link>
        </div>

        {/* Data Export */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📤</span>
              <div>
                <h3 className="font-medium text-gray-900">Export Data</h3>
                <p className="text-sm text-gray-600">Download your data as JSON</p>
              </div>
            </div>
            <button 
              onClick={handleExport}
              className="text-blue-600 text-sm font-medium hover:text-blue-700"
            >
              Export
            </button>
          </div>
        </div>

        {/* Data Import */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📥</span>
              <div>
                <h3 className="font-medium text-gray-900">Import Data</h3>
                <p className="text-sm text-gray-600">Restore from backup file</p>
              </div>
            </div>
            <button 
              onClick={handleImport}
              className="text-blue-600 text-sm font-medium hover:text-blue-700"
            >
              Import
            </button>
          </div>
        </div>

        {/* PWA Install */}
        <PWAInstall />

        {/* Sync Test */}
        <SyncTest />

        {/* Session Info */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="font-medium text-gray-900 mb-2">📱 Session Information</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Session Status:</span>
              <span className="text-green-600 font-medium">Connected</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Sync Status:</span>
              <span className="text-blue-600 font-medium">Online</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Last Sync:</span>
              <span className="text-gray-600">Just now</span>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="font-medium text-gray-900 mb-2">ℹ️ About Prague Tracker</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Version: 1.0.0</p>
            <p>A personal health and lifestyle tracking app for your 30-day challenge.</p>
            <p className="mt-2 text-xs">Track workouts, reading, sleep, nutrition, and more across all your devices.</p>
          </div>
        </div>
      </div>
    </div>
  )
}