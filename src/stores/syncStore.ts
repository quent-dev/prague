import { create } from 'zustand'

interface SyncState {
  isOnline: boolean
  isSyncing: boolean
  lastSyncTime: string | null
  pendingOperations: PendingOperation[]
  syncError: string | null
  
  // Actions
  setOnline: (online: boolean) => void
  setSyncing: (syncing: boolean) => void
  setLastSyncTime: (time: string) => void
  addPendingOperation: (operation: PendingOperation) => void
  removePendingOperation: (id: string) => void
  clearPendingOperations: () => void
  setSyncError: (error: string | null) => void
}

export interface PendingOperation {
  id: string
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: 'daily_entries' | 'weekly_entries' | 'goals_config' | 'sessions'
  data: any
  timestamp: string
  retryCount: number
}

export const useSyncStore = create<SyncState>((set) => ({
  isOnline: navigator.onLine,
  isSyncing: false,
  lastSyncTime: null,
  pendingOperations: [],
  syncError: null,
  
  setOnline: (online) => set({ isOnline: online }),
  
  setSyncing: (syncing) => set({ isSyncing: syncing }),
  
  setLastSyncTime: (time) => set({ lastSyncTime: time }),
  
  addPendingOperation: (operation) => set((state) => ({
    pendingOperations: [...state.pendingOperations, operation]
  })),
  
  removePendingOperation: (id) => set((state) => ({
    pendingOperations: state.pendingOperations.filter(op => op.id !== id)
  })),
  
  clearPendingOperations: () => set({ pendingOperations: [] }),
  
  setSyncError: (error) => set({ syncError: error }),
}))

// Listen for online/offline events
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useSyncStore.getState().setOnline(true)
  })
  
  window.addEventListener('offline', () => {
    useSyncStore.getState().setOnline(false)
  })
}