// Local storage utilities for offline functionality
const STORAGE_KEYS = {
  SESSION_KEY: 'prague_session_key',
  PENDING_SYNC: 'prague_pending_sync',
  LAST_SYNC: 'prague_last_sync',
} as const

export const storage = {
  // Session management
  getSessionKey(): string | null {
    return localStorage.getItem(STORAGE_KEYS.SESSION_KEY)
  },

  setSessionKey(sessionKey: string): void {
    localStorage.setItem(STORAGE_KEYS.SESSION_KEY, sessionKey)
  },

  clearSessionKey(): void {
    localStorage.removeItem(STORAGE_KEYS.SESSION_KEY)
  },

  // Offline sync queue
  getPendingSync(): any[] {
    try {
      const pending = localStorage.getItem(STORAGE_KEYS.PENDING_SYNC)
      return pending ? JSON.parse(pending) : []
    } catch {
      return []
    }
  },

  addPendingSync(operation: any): void {
    const pending = this.getPendingSync()
    pending.push({
      ...operation,
      timestamp: new Date().toISOString(),
    })
    localStorage.setItem(STORAGE_KEYS.PENDING_SYNC, JSON.stringify(pending))
  },

  clearPendingSync(): void {
    localStorage.removeItem(STORAGE_KEYS.PENDING_SYNC)
  },

  // Last sync timestamp
  getLastSync(): string | null {
    return localStorage.getItem(STORAGE_KEYS.LAST_SYNC)
  },

  setLastSync(timestamp: string): void {
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, timestamp)
  },

  // Generate session key
  generateSessionKey(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15)
  },
}