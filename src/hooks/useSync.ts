import { useEffect, useCallback } from 'react'
import { useAppStore } from '../stores/appStore'
import { useSyncStore } from '../stores/syncStore'
import { syncService } from '../lib/syncService'

export const useSync = () => {
  const { sessionKey, isInitialized } = useAppStore()
  const { isOnline, isSyncing, pendingOperations } = useSyncStore()

  // Initialize sync when session is ready
  useEffect(() => {
    if (isInitialized && sessionKey) {
      if (isOnline) {
        syncService.startAutoSync()
        syncService.syncData()
      }
    }

    return () => {
      syncService.stopAutoSync()
    }
  }, [isInitialized, sessionKey, isOnline])

  // Force sync manually
  const forceSync = useCallback(async () => {
    if (!isOnline) {
      throw new Error('Cannot sync while offline')
    }
    
    await syncService.forceSyncNow()
  }, [isOnline])

  // Get sync status
  const getSyncStatus = useCallback(() => {
    return {
      isOnline,
      isSyncing,
      hasPendingChanges: pendingOperations.length > 0,
      pendingCount: pendingOperations.length,
      canSync: isOnline && !isSyncing,
    }
  }, [isOnline, isSyncing, pendingOperations])

  return {
    forceSync,
    getSyncStatus,
    syncService,
  }
}