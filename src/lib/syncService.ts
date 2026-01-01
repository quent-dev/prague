import { supabase } from './supabase'
import { useSyncStore, PendingOperation } from '../stores/syncStore'
import { useAppStore } from '../stores/appStore'

class SyncService {
  // private retryDelay = 1000 // Start with 1 second
  private maxRetries = 5
  private syncInterval: NodeJS.Timeout | null = null

  constructor() {
    // Listen for online events to trigger sync
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.handleOnlineChange(true)
      })
      
      window.addEventListener('offline', () => {
        this.handleOnlineChange(false)
      })
    }
  }

  private handleOnlineChange(isOnline: boolean) {
    const { setOnline } = useSyncStore.getState()
    setOnline(isOnline)
    
    if (isOnline) {
      this.startAutoSync()
      this.processPendingOperations()
    } else {
      this.stopAutoSync()
    }
  }

  startAutoSync() {
    if (this.syncInterval) return
    
    // Sync every 30 seconds when online
    this.syncInterval = setInterval(() => {
      this.syncData()
    }, 30000)
  }

  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }

  async syncData() {
    const { isOnline, isSyncing } = useSyncStore.getState()
    if (!isOnline || isSyncing) return

    const { sessionKey } = useAppStore.getState()
    if (!sessionKey) return

    const { setSyncing, setLastSyncTime, setSyncError } = useSyncStore.getState()
    const { setDailyEntries, setWeeklyEntries, setGoalsConfig } = useAppStore.getState()

    setSyncing(true)
    setSyncError(null)

    try {
      // Set session context for RLS
      await supabase.rpc('set_session_context', {
        session_key: sessionKey
      })

      // Fetch latest data
      const [dailyData, weeklyData, goalsData] = await Promise.all([
        supabase.from('daily_entries').select('*').order('date', { ascending: false }),
        supabase.from('weekly_entries').select('*').order('week_start_date', { ascending: false }),
        supabase.from('goals_config').select('*').order('created_at', { ascending: false }).limit(1)
      ])

      if (dailyData.data) setDailyEntries(dailyData.data)
      if (weeklyData.data) setWeeklyEntries(weeklyData.data)
      if (goalsData.data && goalsData.data[0]) setGoalsConfig(goalsData.data[0])

      setLastSyncTime(new Date().toISOString())
      
      // Process any pending operations
      await this.processPendingOperations()
      
    } catch (error: any) {
      setSyncError(error.message)
      console.error('Sync failed:', error)
    } finally {
      setSyncing(false)
    }
  }

  async processPendingOperations() {
    const { pendingOperations, removePendingOperation, setSyncError } = useSyncStore.getState()
    
    if (pendingOperations.length === 0) return

    for (const operation of pendingOperations) {
      try {
        await this.executeOperation(operation)
        removePendingOperation(operation.id)
      } catch (error: any) {
        console.error('Failed to execute pending operation:', error)
        
        // Increment retry count
        operation.retryCount++
        
        if (operation.retryCount >= this.maxRetries) {
          // Remove operation after max retries
          removePendingOperation(operation.id)
          setSyncError(`Failed to sync operation after ${this.maxRetries} attempts`)
        }
      }
    }
  }

  private async executeOperation(operation: PendingOperation) {
    const { sessionKey } = useAppStore.getState()
    if (!sessionKey) throw new Error('No session key')

    // Set session context
    await supabase.rpc('set_session_context', {
      session_key: sessionKey
    })

    switch (operation.type) {
      case 'INSERT':
        await supabase.from(operation.table).insert([operation.data])
        break
        
      case 'UPDATE':
        const { id, ...updateData } = operation.data
        await supabase.from(operation.table).update(updateData).eq('id', id)
        break
        
      case 'DELETE':
        await supabase.from(operation.table).delete().eq('id', operation.data.id)
        break
    }
  }

  async forceSyncNow() {
    await this.syncData()
  }

  // Save data locally for offline access
  saveToLocalStorage(key: string, data: any) {
    try {
      localStorage.setItem(`prague_${key}`, JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
    }
  }

  // Load data from local storage
  loadFromLocalStorage(key: string) {
    try {
      const data = localStorage.getItem(`prague_${key}`)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Failed to load from localStorage:', error)
      return null
    }
  }

  // Clear local storage
  clearLocalStorage() {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('prague_'))
    keys.forEach(key => localStorage.removeItem(key))
  }
}

export const syncService = new SyncService()