import { useEffect, useCallback } from 'react'
import { useAppStore } from '../stores/appStore'
import { useSupabase } from './useSupabase'
import { storage } from '../lib/storage'

export const useSession = () => {
  const {
    currentSession,
    sessionKey,
    isInitialized,
    setSession,
    clearSession,
    setLoading,
    setError,
    initialize
  } = useAppStore()
  
  const { createSession, getSession } = useSupabase()

  // Initialize session on app load
  useEffect(() => {
    const initializeSession = async () => {
      if (isInitialized) return

      const storedSessionKey = storage.getSessionKey()
      
      if (storedSessionKey) {
        try {
          setLoading(true)
          const session = await getSession(storedSessionKey)
          setSession(session, storedSessionKey)
        } catch (error) {
          console.error('Failed to load existing session:', error)
          // Clear invalid session
          storage.clearSessionKey()
          clearSession()
        } finally {
          setLoading(false)
        }
      }
      
      initialize()
    }

    initializeSession()
  }, [isInitialized, getSession, setSession, clearSession, setLoading, initialize])

  // Create new session
  const createNewSession = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const newSessionKey = storage.generateSessionKey()
      const session = await createSession(newSessionKey)
      
      storage.setSessionKey(newSessionKey)
      setSession(session, newSessionKey)
      
      return { session, sessionKey: newSessionKey }
    } catch (error: any) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }, [createSession, setSession, setLoading, setError])

  // Join existing session with session key
  const joinSession = useCallback(async (existingSessionKey: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const session = await getSession(existingSessionKey)
      
      storage.setSessionKey(existingSessionKey)
      setSession(session, existingSessionKey)
      
      return session
    } catch (error: any) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }, [getSession, setSession, setLoading, setError])

  // Logout/clear session
  const logout = useCallback(() => {
    storage.clearSessionKey()
    clearSession()
  }, [clearSession])

  // Generate pairing code (first 8 chars of session key for easier sharing)
  const getPairingCode = useCallback(() => {
    if (!sessionKey) return null
    return sessionKey.substring(0, 8).toUpperCase()
  }, [sessionKey])

  return {
    currentSession,
    sessionKey,
    isInitialized,
    createNewSession,
    joinSession,
    logout,
    getPairingCode,
    hasSession: !!currentSession && !!sessionKey,
  }
}