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
  const supabase = useSupabase()

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
        const serverEntry = await supabase.createDailyEntry(entry)
        
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
  }, [addDailyEntry, updateDailyEntry, isOnline, addPendingOperation, supabase, setError])

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
        const serverEntry = await supabase.updateDailyEntry(id, updates)
        
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
  }, [updateDailyEntry, isOnline, addPendingOperation, supabase, setError])

  // Optimistic weekly entry creation
  const createWeeklyEntryOptimistic = useCallback(async (
    entry: Omit<WeeklyEntry, 'id' | 'created_at' | 'updated_at'>
  ) => {
    const optimisticEntry: WeeklyEntry = {
      ...entry,
      id: `temp_weekly_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    addWeeklyEntry(optimisticEntry)

    try {
      if (isOnline) {
        const serverEntry = await supabase.createWeeklyEntry(entry)
        
        if (serverEntry) {
          updateWeeklyEntry(optimisticEntry.id, serverEntry)
        }
      } else {
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
      updateWeeklyEntry(optimisticEntry.id, {
        ...optimisticEntry,
        id: `failed_${optimisticEntry.id}`
      })
      setError(error.message)
    }

    return optimisticEntry
  }, [addWeeklyEntry, updateWeeklyEntry, isOnline, addPendingOperation, supabase, setError])

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
        const serverConfig = await supabase.createGoalsConfig(config)
        
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
  }, [addGoalsConfig, updateGoalsConfig, isOnline, addPendingOperation, supabase, setError])

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
        const serverConfig = await supabase.updateGoalsConfig(id, updates)
        
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
  }, [updateGoalsConfig, isOnline, addPendingOperation, supabase, setError])

  // Optimistic weekly entry update
  const updateWeeklyEntryOptimistic = useCallback(async (
    id: string, 
    updates: Partial<WeeklyEntry>
  ) => {
    const optimisticUpdates = {
      ...updates,
      updated_at: new Date().toISOString()
    }
    
    updateWeeklyEntry(id, optimisticUpdates)

    try {
      if (isOnline) {
        // Note: We'd need to add updateWeeklyEntry to supabase client
        // For now, just update locally
      } else {
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
      setError(error.message)
    }
  }, [updateWeeklyEntry, isOnline, addPendingOperation, setError])

  return {
    createDailyEntryOptimistic,
    updateDailyEntryOptimistic,
    createWeeklyEntryOptimistic,
    updateWeeklyEntryOptimistic,
    createGoalsConfigOptimistic,
    updateGoalsConfigOptimistic,
  }
}