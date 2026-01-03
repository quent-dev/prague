import { useCallback } from 'react'
import { useAppStore } from '../stores/appStore'
import { useSyncStore } from '../stores/syncStore'
import { useSupabase } from './useSupabase'
import { DailyEntry, WeeklyEntry, GoalsConfig } from '../lib/types'

export const useOptimistic = () => {
  const { 
    addDailyEntry, 
    updateDailyEntry, 
    addWeeklyEntry, 
    updateWeeklyEntry,
    addGoalsConfig,
    updateGoalsConfig,
    setError 
  } = useAppStore()
  
  const { isOnline, addPendingOperation } = useSyncStore()
  const { 
    createDailyEntry: createDailyEntryDB, 
    updateDailyEntry: updateDailyEntryDB, 
    createWeeklyEntry: createWeeklyEntryDB,
    updateWeeklyEntry: updateWeeklyEntryDB,
    createGoalsConfig: createGoalsConfigDB,
    updateGoalsConfig: updateGoalsConfigDB 
  } = useSupabase()

  // Optimistic daily entry creation
  const createDailyEntryOptimistic = useCallback(async (
    entry: Omit<DailyEntry, 'id' | 'created_at' | 'updated_at'>
  ) => {
    // Create optimistic entry with temporary ID
    const optimisticEntry: DailyEntry = {
      ...entry,
      id: `temp_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Immediately add to store for instant UI feedback
    addDailyEntry(optimisticEntry)

    try {
      if (isOnline) {
        // Try to sync with server
        const serverEntry = await createDailyEntryDB(entry)
        
        if (serverEntry) {
          // Replace optimistic entry with server entry
          updateDailyEntry(optimisticEntry.id, {
            ...serverEntry,
            // Keep the optimistic ID for replacement
            id: serverEntry.id
          })
        }
      } else {
        // Add to pending operations
        addPendingOperation({
          id: optimisticEntry.id,
          type: 'INSERT',
          table: 'daily_entries',
          data: entry,
          timestamp: new Date().toISOString(),
          retryCount: 0
        })
      }
    } catch (error: any) {
      // Remove optimistic entry on error
      updateDailyEntry(optimisticEntry.id, {
        ...optimisticEntry,
        // Mark as failed
        id: `failed_${optimisticEntry.id}`
      })
      setError(error.message)
    }

    return optimisticEntry
  }, [addDailyEntry, updateDailyEntry, isOnline, addPendingOperation, createDailyEntryDB, setError])

  // Optimistic daily entry update
  const updateDailyEntryOptimistic = useCallback(async (
    id: string, 
    updates: Partial<DailyEntry>
  ) => {
    // Immediately update in store
    const optimisticUpdates = {
      ...updates,
      updated_at: new Date().toISOString()
    }
    
    updateDailyEntry(id, optimisticUpdates)

    try {
      if (isOnline) {
        const serverEntry = await updateDailyEntryDB(id, updates)
        
        if (serverEntry) {
          // Update with server response
          updateDailyEntry(id, serverEntry)
        }
      } else {
        addPendingOperation({
          id: `update_${id}_${Date.now()}`,
          type: 'UPDATE',
          table: 'daily_entries',
          data: { id, ...updates },
          timestamp: new Date().toISOString(),
          retryCount: 0
        })
      }
    } catch (error: any) {
      // TODO: Implement rollback mechanism
      setError(error.message)
    }
  }, [updateDailyEntry, isOnline, addPendingOperation, updateDailyEntryDB, setError])

  // Optimistic weekly entry creation
  const createWeeklyEntryOptimistic = useCallback(async (
    entry: Omit<WeeklyEntry, 'id' | 'created_at' | 'updated_at'>
  ) => {
    console.log('🆕 createWeeklyEntryOptimistic called with:', entry)
    
    const optimisticEntry: WeeklyEntry = {
      ...entry,
      id: `temp_weekly_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    console.log('📝 Adding optimistic weekly entry to store:', optimisticEntry)
    addWeeklyEntry(optimisticEntry)

    try {
      if (isOnline) {
        console.log('🌐 Online: calling createWeeklyEntryDB with:', entry)
        const serverEntry = await createWeeklyEntryDB(entry)
        console.log('💾 Server response:', serverEntry)
        
        if (serverEntry) {
          console.log('🔄 Updating store with server entry')
          updateWeeklyEntry(optimisticEntry.id, serverEntry)
        }
      } else {
        console.log('📴 Offline: adding to pending operations')
        addPendingOperation({
          id: optimisticEntry.id,
          type: 'INSERT',
          table: 'weekly_entries',
          data: entry,
          timestamp: new Date().toISOString(),
          retryCount: 0
        })
      }
    } catch (error: any) {
      console.error('❌ Error in createWeeklyEntryOptimistic:', error)
      updateWeeklyEntry(optimisticEntry.id, {
        ...optimisticEntry,
        id: `failed_${optimisticEntry.id}`
      })
      setError(error.message)
      throw error
    }

    return optimisticEntry
  }, [addWeeklyEntry, updateWeeklyEntry, isOnline, addPendingOperation, createWeeklyEntryDB, setError])

  // Optimistic goals config creation/update
  const createGoalsConfigOptimistic = useCallback(async (
    config: Omit<GoalsConfig, 'id' | 'created_at' | 'updated_at'>
  ) => {
    const optimisticConfig: GoalsConfig = {
      ...config,
      id: `temp_goals_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    addGoalsConfig(optimisticConfig)

    try {
      if (isOnline) {
        const serverConfig = await createGoalsConfigDB(config)
        
        if (serverConfig) {
          updateGoalsConfig(optimisticConfig.id, serverConfig)
        }
      } else {
        addPendingOperation({
          id: optimisticConfig.id,
          type: 'INSERT',
          table: 'goals_config',
          data: config,
          timestamp: new Date().toISOString(),
          retryCount: 0
        })
      }
    } catch (error: any) {
      // On error, could revert to null or show error state
      setError(error.message)
    }

    return optimisticConfig
  }, [addGoalsConfig, updateGoalsConfig, isOnline, addPendingOperation, createGoalsConfigDB, setError])

  // Optimistic goals config update
  const updateGoalsConfigOptimistic = useCallback(async (
    id: string,
    updates: Partial<GoalsConfig>
  ) => {
    const optimisticUpdates = {
      ...updates,
      updated_at: new Date().toISOString()
    }
    
    updateGoalsConfig(id, optimisticUpdates)

    try {
      if (isOnline) {
        const serverConfig = await updateGoalsConfigDB(id, updates)
        
        if (serverConfig) {
          updateGoalsConfig(id, serverConfig)
        }
      } else {
        addPendingOperation({
          id: `update_goals_${id}_${Date.now()}`,
          type: 'UPDATE',
          table: 'goals_config',
          data: { id, ...updates },
          timestamp: new Date().toISOString(),
          retryCount: 0
        })
      }
    } catch (error: any) {
      setError(error.message)
    }
  }, [updateGoalsConfig, isOnline, addPendingOperation, updateGoalsConfigDB, setError])

  // Optimistic weekly entry update
  const updateWeeklyEntryOptimistic = useCallback(async (
    id: string, 
    updates: Partial<WeeklyEntry>
  ) => {
    console.log('🔄 updateWeeklyEntryOptimistic called with:', { id, updates })
    
    const optimisticUpdates = {
      ...updates,
      updated_at: new Date().toISOString()
    }
    
    console.log('📝 Updating weekly entry in store with optimistic updates:', optimisticUpdates)
    updateWeeklyEntry(id, optimisticUpdates)

    try {
      if (isOnline) {
        console.log('🌐 Online: calling updateWeeklyEntryDB with:', { id, updates })
        const serverEntry = await updateWeeklyEntryDB(id, updates)
        console.log('💾 Server response:', serverEntry)
        
        if (serverEntry) {
          console.log('🔄 Updating store with server entry')
          updateWeeklyEntry(id, serverEntry)
        }
      } else {
        console.log('📴 Offline: adding to pending operations')
        addPendingOperation({
          id: `update_weekly_${id}_${Date.now()}`,
          type: 'UPDATE',
          table: 'weekly_entries',
          data: { id, ...updates },
          timestamp: new Date().toISOString(),
          retryCount: 0
        })
      }
    } catch (error: any) {
      console.error('❌ Error in updateWeeklyEntryOptimistic:', error)
      // TODO: Implement rollback mechanism
      setError(error.message)
      throw error
    }
  }, [updateWeeklyEntry, updateWeeklyEntryDB, isOnline, addPendingOperation, setError])

  return {
    createDailyEntryOptimistic,
    updateDailyEntryOptimistic,
    createWeeklyEntryOptimistic,
    updateWeeklyEntryOptimistic,
    createGoalsConfigOptimistic,
    updateGoalsConfigOptimistic,
  }
}