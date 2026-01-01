import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Session, DailyEntry, WeeklyEntry, GoalsConfig } from '../lib/types'

interface AppState {
  // Session management
  currentSession: Session | null
  sessionKey: string | null
  isInitialized: boolean
  
  // UI state
  isLoading: boolean
  error: string | null
  
  // Data state
  dailyEntries: DailyEntry[]
  weeklyEntries: WeeklyEntry[]
  goalsConfig: GoalsConfig[]
  currentDate: string // YYYY-MM-DD format
  
  // Actions
  setSession: (session: Session, sessionKey: string) => void
  clearSession: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // Data actions
  setDailyEntries: (entries: DailyEntry[]) => void
  addDailyEntry: (entry: DailyEntry) => void
  updateDailyEntry: (entryId: string, updates: Partial<DailyEntry>) => void
  
  setWeeklyEntries: (entries: WeeklyEntry[]) => void
  addWeeklyEntry: (entry: WeeklyEntry) => void
  updateWeeklyEntry: (entryId: string, updates: Partial<WeeklyEntry>) => void
  
  setGoalsConfig: (configs: GoalsConfig[]) => void
  addGoalsConfig: (config: GoalsConfig) => void
  updateGoalsConfig: (configId: string, updates: Partial<GoalsConfig>) => void
  
  setCurrentDate: (date: string) => void
  
  // Utility actions
  reset: () => void
  initialize: () => void
}

const initialState = {
  currentSession: null,
  sessionKey: null,
  isInitialized: false,
  isLoading: false,
  error: null,
  dailyEntries: [],
  weeklyEntries: [],
  goalsConfig: [],
  currentDate: new Date().toISOString().split('T')[0],
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialState,
      
      setSession: (session, sessionKey) => set({ 
        currentSession: session, 
        sessionKey,
        isInitialized: true 
      }),
      
      clearSession: () => set({ 
        currentSession: null, 
        sessionKey: null,
        dailyEntries: [],
        weeklyEntries: [],
        goalsConfig: [],
        isInitialized: false 
      }),
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      setError: (error) => set({ error }),
      
      setDailyEntries: (entries) => set({ dailyEntries: entries }),
      
      addDailyEntry: (entry) => set((state) => ({
        dailyEntries: [...state.dailyEntries, entry]
      })),
      
      updateDailyEntry: (entryId, updates) => set((state) => ({
        dailyEntries: state.dailyEntries.map(entry =>
          entry.id === entryId ? { ...entry, ...updates } : entry
        )
      })),
      
      setWeeklyEntries: (entries) => set({ weeklyEntries: entries }),
      
      addWeeklyEntry: (entry) => set((state) => ({
        weeklyEntries: [...state.weeklyEntries, entry]
      })),
      
      updateWeeklyEntry: (entryId, updates) => set((state) => ({
        weeklyEntries: state.weeklyEntries.map(entry =>
          entry.id === entryId ? { ...entry, ...updates } : entry
        )
      })),
      
      setGoalsConfig: (configs) => set({ goalsConfig: configs }),
      
      addGoalsConfig: (config) => set((state) => ({
        goalsConfig: [...state.goalsConfig, config]
      })),
      
      updateGoalsConfig: (configId, updates) => set((state) => ({
        goalsConfig: state.goalsConfig.map(config =>
          config.id === configId ? { ...config, ...updates } : config
        )
      })),
      
      setCurrentDate: (date) => set({ currentDate: date }),
      
      reset: () => set(initialState),
      
      initialize: () => set({ isInitialized: true }),
    }),
    {
      name: 'prague-app-store',
      partialize: (state) => ({
        sessionKey: state.sessionKey,
        currentDate: state.currentDate,
        // Don't persist sensitive data or large datasets
        // These will be loaded fresh on app start
      }),
    }
  )
)