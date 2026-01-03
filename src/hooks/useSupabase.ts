import { useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAppStore } from '../stores/appStore'
import { useSyncStore } from '../stores/syncStore'
import { Session, DailyEntry, WeeklyEntry, GoalsConfig } from '../lib/types'

export const useSupabase = () => {
  const { sessionKey, currentSession, setLoading, setError } = useAppStore()
  const { addPendingOperation, isOnline } = useSyncStore()

  // Session management
  const createSession = useCallback(async (newSessionKey: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase
        .from('sessions')
        .insert([{ session_key: newSessionKey }])
        .select()
        .single()

      if (error) throw error
      return data as Session
    } catch (error: any) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError])

  const getSession = useCallback(async (sessionKey: string) => {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('session_key', sessionKey)
        .single()

      if (error) throw error
      return data as Session
    } catch (error: any) {
      setError(error.message)
      throw error
    }
  }, [setError])

  // Get session by pairing code (first 8 chars of session key)
  const getSessionByPairingCode = useCallback(async (pairingCode: string) => {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .ilike('session_key', `${pairingCode.toLowerCase()}%`)
        .single()

      if (error) throw error
      return data as Session
    } catch (error: any) {
      setError(error.message)
      throw error
    }
  }, [setError])

  // Daily entries
  const getDailyEntries = useCallback(async () => {
    if (!sessionKey) throw new Error('No session key')
    
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('daily_entries')
        .select('*')
        .order('date', { ascending: false })

      if (error) throw error
      return data as DailyEntry[]
    } catch (error: any) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }, [sessionKey, setLoading, setError])

  const createDailyEntry = useCallback(async (entry: Omit<DailyEntry, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true)
    setError(null)
    
    try {
      if (!isOnline) {
        // Add to pending operations for offline sync
        addPendingOperation({
          id: `daily_${Date.now()}`,
          type: 'INSERT',
          table: 'daily_entries',
          data: entry,
          timestamp: new Date().toISOString(),
          retryCount: 0
        })
        return null // Will be synced when online
      }

      const { data, error } = await supabase
        .from('daily_entries')
        .insert([entry])
        .select()
        .single()

      if (error) throw error
      return data as DailyEntry
    } catch (error: any) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError, isOnline, addPendingOperation])

  const updateDailyEntry = useCallback(async (id: string, updates: Partial<DailyEntry>) => {
    setLoading(true)
    setError(null)
    
    try {
      if (!isOnline) {
        addPendingOperation({
          id: `daily_update_${Date.now()}`,
          type: 'UPDATE',
          table: 'daily_entries',
          data: { id, ...updates },
          timestamp: new Date().toISOString(),
          retryCount: 0
        })
        return null
      }

      const { data, error } = await supabase
        .from('daily_entries')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as DailyEntry
    } catch (error: any) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError, isOnline, addPendingOperation])

  // Weekly entries
  const getWeeklyEntries = useCallback(async () => {
    if (!sessionKey) throw new Error('No session key')
    
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('weekly_entries')
        .select('*')
        .order('week_start_date', { ascending: false })

      if (error) throw error
      return data as WeeklyEntry[]
    } catch (error: any) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }, [sessionKey, setLoading, setError])

  const createWeeklyEntry = useCallback(async (entry: Omit<WeeklyEntry, 'id' | 'created_at' | 'updated_at'>) => {
    console.log('🗃️ createWeeklyEntry called with:', entry)
    console.log('📋 Session key for RLS:', sessionKey)
    console.log('🆔 Current session ID:', currentSession?.id)
    
    setLoading(true)
    setError(null)
    
    try {
      if (!isOnline) {
        addPendingOperation({
          id: `weekly_${Date.now()}`,
          type: 'INSERT',
          table: 'weekly_entries',
          data: entry,
          timestamp: new Date().toISOString(),
          retryCount: 0
        })
        return null
      }

      console.log('🌐 Making Supabase insert call...')
      const { data, error } = await supabase
        .from('weekly_entries')
        .insert([entry])
        .select()
        .single()

      console.log('📥 Supabase insert response:', { data, error })
      
      if (error) throw error
      console.log('✅ Weekly entry created successfully:', data)
      return data as WeeklyEntry
    } catch (error: any) {
      console.error('❌ Error in createWeeklyEntry:', error)
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError, isOnline, addPendingOperation])

  // Update weekly entry
  const updateWeeklyEntry = useCallback(async (id: string, updates: Partial<WeeklyEntry>) => {
    console.log('🔄 updateWeeklyEntry called with:', { id, updates })
    console.log('📋 Session key for RLS:', sessionKey)
    console.log('🆔 Current session ID for filtering:', currentSession?.id)
    
    if (!currentSession?.id) throw new Error('No current session')
    
    setLoading(true)
    try {
      if (!isOnline) {
        // Add to pending operations when offline
        addPendingOperation({
          id: `update_weekly_${id}_${Date.now()}`,
          type: 'UPDATE',
          table: 'weekly_entries',
          data: { id, ...updates },
          timestamp: new Date().toISOString(),
          retryCount: 0
        })
        return null // Return null instead of throwing for offline operations
      }

      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      }
      console.log('🌐 Making Supabase update call with data:', updateData)
      console.log('🎯 Filtering by id:', id, '(relying on RLS for session filtering)')
      
      const { data, error } = await supabase
        .from('weekly_entries')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      console.log('📥 Supabase update response:', { data, error })
      
      if (error) throw error
      console.log('✅ Weekly entry updated successfully:', data)
      return data as WeeklyEntry
    } catch (error: any) {
      console.error('❌ Error in updateWeeklyEntry:', error)
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }, [currentSession?.id, sessionKey, setLoading, setError, isOnline, addPendingOperation])

  // Goals config
  const getGoalsConfig = useCallback(async (monthYear: string) => {
    if (!sessionKey) throw new Error('No session key')
    
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('goals_config')
        .select('*')
        .eq('month_year', monthYear)
        .single()

      if (error && error.code !== 'PGRST116') throw error // Ignore "not found" errors
      return data as GoalsConfig | null
    } catch (error: any) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }, [sessionKey, setLoading, setError])

  const createGoalsConfig = useCallback(async (config: Omit<GoalsConfig, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true)
    setError(null)
    
    try {
      if (!isOnline) {
        addPendingOperation({
          id: `goals_${Date.now()}`,
          type: 'INSERT',
          table: 'goals_config',
          data: config,
          timestamp: new Date().toISOString(),
          retryCount: 0
        })
        return null
      }

      const { data, error } = await supabase
        .from('goals_config')
        .insert([config])
        .select()
        .single()

      if (error) throw error
      return data as GoalsConfig
    } catch (error: any) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError, isOnline, addPendingOperation])

  const updateGoalsConfig = useCallback(async (id: string, updates: Partial<GoalsConfig>) => {
    setLoading(true)
    setError(null)
    
    try {
      if (!isOnline) {
        addPendingOperation({
          id: `update_goals_${id}_${Date.now()}`,
          type: 'UPDATE',
          table: 'goals_config',
          data: { id, ...updates },
          timestamp: new Date().toISOString(),
          retryCount: 0
        })
        return null
      }

      const { data, error } = await supabase
        .from('goals_config')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as GoalsConfig
    } catch (error: any) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError, isOnline, addPendingOperation])

  return {
    // Session
    createSession,
    getSession,
    getSessionByPairingCode,
    
    // Daily entries
    getDailyEntries,
    createDailyEntry,
    updateDailyEntry,
    
    // Weekly entries
    getWeeklyEntries,
    createWeeklyEntry,
    updateWeeklyEntry,
    
    // Goals config
    getGoalsConfig,
    createGoalsConfig,
    updateGoalsConfig,
  }
}