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
      <h1 className="text-2xl font-bold text-dark-text-primary mb-6">Settings</h1>
      
      {/* Status Messages */}
      {exportStatus && (
        <div className="mb-4 p-3 bg-blue-900/20 border border-accent-primary/30 text-accent-primary rounded-lg text-sm">
          {exportStatus}
        </div>
      )}
      
      {importStatus && (
        <div className="mb-4 p-3 bg-yellow-900/20 border border-accent-warning/30 text-accent-warning rounded-lg text-sm">
          {importStatus}
        </div>
      )}
      
      <div className="space-y-4">
        {/* Goal Configuration */}
        <div className="bg-dark-card border border-dark-border rounded-lg">
          <Link
            to="/goals"
            className="flex items-center justify-between p-4 hover:bg-dark-surface transition-colors"
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🎯</span>
              <div>
                <h3 className="font-medium text-dark-text-primary">Goal Configuration</h3>
                <p className="text-sm text-dark-text-secondary">Set your monthly goals and targets</p>
              </div>
            </div>
            <span className="text-dark-text-muted">→</span>
          </Link>
        </div>

        {/* Data Export */}
        <div className="bg-dark-card border border-dark-border rounded-lg">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📤</span>
              <div>
                <h3 className="font-medium text-dark-text-primary">Export Data</h3>
                <p className="text-sm text-dark-text-secondary">Download your data as JSON</p>
              </div>
            </div>
            <button 
              onClick={handleExport}
              className="text-accent-primary text-sm font-medium hover:text-blue-400"
            >
              Export
            </button>
          </div>
        </div>

        {/* Data Import */}
        <div className="bg-dark-card border border-dark-border rounded-lg">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📥</span>
              <div>
                <h3 className="font-medium text-dark-text-primary">Import Data</h3>
                <p className="text-sm text-dark-text-secondary">Restore from backup file</p>
              </div>
            </div>
            <button 
              onClick={handleImport}
              className="text-accent-primary text-sm font-medium hover:text-blue-400"
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
        <div className="bg-dark-card border border-dark-border rounded-lg p-4">
          <h3 className="font-medium text-dark-text-primary mb-2">📱 Session Information</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-dark-text-secondary">Session Status:</span>
              <span className="text-accent-success font-medium">Connected</span>
            </div>
            <div className="flex justify-between">
              <span className="text-dark-text-secondary">Sync Status:</span>
              <span className="text-accent-primary font-medium">Online</span>
            </div>
            <div className="flex justify-between">
              <span className="text-dark-text-secondary">Last Sync:</span>
              <span className="text-dark-text-secondary">Just now</span>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="bg-dark-card border border-dark-border rounded-lg p-4">
          <h3 className="font-medium text-dark-text-primary mb-2">ℹ️ About Prague Tracker</h3>
          <div className="text-sm text-dark-text-secondary space-y-1">
            <p>Version: 1.0.0</p>
            <p>A personal health and lifestyle tracking app for your 30-day challenge.</p>
            <p className="mt-2 text-xs">Track workouts, reading, sleep, nutrition, and more across all your devices.</p>
          </div>
        </div>
      </div>
    </div>
  )
}