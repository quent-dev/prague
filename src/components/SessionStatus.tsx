import { useState } from 'react'
import { useSession } from '../hooks/useSession'
import { useSyncStore } from '../stores/syncStore'
import { QRCodeModal } from './QRCodeModal'

export const SessionStatus = () => {
  const [showPairingCode, setShowPairingCode] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  
  const { getPairingCode, logout, hasSession } = useSession()
  const { isOnline, isSyncing, lastSyncTime, pendingOperations } = useSyncStore()

  if (!hasSession) return null

  const pairingCode = getPairingCode()
  const hasPendingSync = pendingOperations.length > 0

  return (
    <div className="bg-dark-surface border-b border-dark-border px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Online status indicator */}
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-accent-success' : 'bg-accent-error'}`} />
            <span className="text-sm text-dark-text-secondary">
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>

          {/* Sync status */}
          {isSyncing && (
            <div className="flex items-center space-x-1 text-accent-primary">
              <div className="spinner w-4 h-4" />
              <span className="text-sm">Syncing...</span>
            </div>
          )}

          {hasPendingSync && !isSyncing && (
            <div className="flex items-center space-x-1 text-accent-warning">
              <div className="w-4 h-4 rounded-full bg-accent-warning flex items-center justify-center">
                <span className="text-xs text-white font-bold">{pendingOperations.length}</span>
              </div>
              <span className="text-sm">Pending sync</span>
            </div>
          )}
        </div>

        {/* Session actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowPairingCode(!showPairingCode)}
            className="text-sm text-accent-primary hover:text-blue-400"
          >
            Device Code
          </button>
          
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="text-sm text-accent-error hover:text-red-400"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Last sync time */}
      {lastSyncTime && (
        <div className="mt-1 text-xs text-dark-text-muted">
          Last sync: {new Date(lastSyncTime).toLocaleTimeString()}
        </div>
      )}

      {/* QR Code modal */}
      <QRCodeModal 
        isOpen={showPairingCode} 
        onClose={() => setShowPairingCode(false)} 
        pairingCode={pairingCode || ''} 
      />

      {/* Logout confirmation */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-dark-card border border-dark-border rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4 text-accent-error">Reset Challenge?</h3>
            
            <p className="text-sm text-dark-text-secondary mb-6">
              This will clear all your progress data from this device. Make sure you have your pairing code saved to continue on other devices.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  logout()
                  setShowLogoutConfirm(false)
                }}
                className="flex-1 bg-accent-error text-white py-2 px-4 rounded-lg hover:bg-red-700"
              >
                Reset
              </button>
              
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 bg-dark-surface border border-dark-border text-dark-text-primary py-2 px-4 rounded-lg hover:bg-dark-border"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}