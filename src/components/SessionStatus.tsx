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
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Online status indicator */}
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-600">
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>

          {/* Sync status */}
          {isSyncing && (
            <div className="flex items-center space-x-1 text-blue-600">
              <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full" />
              <span className="text-sm">Syncing...</span>
            </div>
          )}

          {hasPendingSync && !isSyncing && (
            <div className="flex items-center space-x-1 text-orange-600">
              <div className="w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center">
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
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Device Code
          </button>
          
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="text-sm text-red-600 hover:text-red-800"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Last sync time */}
      {lastSyncTime && (
        <div className="mt-1 text-xs text-gray-500">
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
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4 text-red-600">Reset Challenge?</h3>
            
            <p className="text-sm text-gray-600 mb-6">
              This will clear all your progress data from this device. Make sure you have your pairing code saved to continue on other devices.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  logout()
                  setShowLogoutConfirm(false)
                }}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
              >
                Reset
              </button>
              
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300"
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