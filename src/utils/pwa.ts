// PWA utilities for service worker registration and management

export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

let deferredPrompt: BeforeInstallPromptEvent | null = null

// Register service worker
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      console.log('Service Worker registered successfully:', registration)
      
      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available
              console.log('New version available')
              // Could show update notification here
            }
          })
        }
      })

      return registration
    } catch (error) {
      console.error('Service Worker registration failed:', error)
      return null
    }
  }
  return null
}

// Setup install prompt handling
export const setupInstallPrompt = (): void => {
  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('Install prompt available')
    e.preventDefault()
    deferredPrompt = e as BeforeInstallPromptEvent
  })

  window.addEventListener('appinstalled', () => {
    console.log('App installed successfully')
    deferredPrompt = null
  })
}

// Show install prompt
export const showInstallPrompt = async (): Promise<boolean> => {
  if (deferredPrompt) {
    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      deferredPrompt = null
      return outcome === 'accepted'
    } catch (error) {
      console.error('Install prompt failed:', error)
      return false
    }
  }
  return false
}

// Check if app can be installed
export const canInstall = (): boolean => {
  return deferredPrompt !== null
}

// Check if app is installed (running in standalone mode)
export const isInstalled = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true
}

// Request persistent storage
export const requestPersistentStorage = async (): Promise<boolean> => {
  if ('storage' in navigator && 'persist' in navigator.storage) {
    try {
      const persistent = await navigator.storage.persist()
      console.log('Persistent storage:', persistent ? 'granted' : 'denied')
      return persistent
    } catch (error) {
      console.error('Persistent storage request failed:', error)
      return false
    }
  }
  return false
}

// Get storage estimate
export const getStorageEstimate = async (): Promise<StorageEstimate | null> => {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const estimate = await navigator.storage.estimate()
      console.log('Storage estimate:', estimate)
      return estimate
    } catch (error) {
      console.error('Storage estimate failed:', error)
      return null
    }
  }
  return null
}

// Setup background sync
export const registerBackgroundSync = async (tag: string): Promise<void> => {
  if ('serviceWorker' in navigator && 'ServiceWorkerRegistration' in window && 'sync' in ServiceWorkerRegistration.prototype) {
    try {
      const registration = await navigator.serviceWorker.ready
      if ('sync' in registration) {
        await (registration as any).sync.register(tag)
        console.log('Background sync registered:', tag)
      }
    } catch (error) {
      console.error('Background sync registration failed:', error)
    }
  }
}

// Listen for service worker messages
export const setupServiceWorkerMessages = (): void => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      console.log('Message from service worker:', event.data)
      
      // Handle different message types
      switch (event.data.type) {
        case 'BACKGROUND_SYNC':
          console.log('Background sync message received')
          // Trigger data sync in the app
          window.dispatchEvent(new CustomEvent('pwa-background-sync'))
          break
        default:
          console.log('Unknown service worker message type:', event.data.type)
      }
    })
  }
}

// Check online status
export const isOnline = (): boolean => {
  return navigator.onLine
}

// Setup online/offline listeners
export const setupNetworkListeners = (
  onOnline: () => void,
  onOffline: () => void
): (() => void) => {
  const handleOnline = () => {
    console.log('App is online')
    onOnline()
  }
  
  const handleOffline = () => {
    console.log('App is offline')
    onOffline()
  }

  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  }
}