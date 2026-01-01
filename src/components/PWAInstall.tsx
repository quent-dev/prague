import { useState, useEffect } from 'react'
import { canInstall, showInstallPrompt, isInstalled } from '../utils/pwa'

export const PWAInstall = () => {
  const [canShowInstall, setCanShowInstall] = useState(false)
  const [isAppInstalled, setIsAppInstalled] = useState(false)

  useEffect(() => {
    setCanShowInstall(canInstall())
    setIsAppInstalled(isInstalled())

    // Listen for install prompt availability
    const checkInstall = () => {
      setCanShowInstall(canInstall())
      setIsAppInstalled(isInstalled())
    }

    window.addEventListener('beforeinstallprompt', checkInstall)
    window.addEventListener('appinstalled', checkInstall)

    return () => {
      window.removeEventListener('beforeinstallprompt', checkInstall)
      window.removeEventListener('appinstalled', checkInstall)
    }
  }, [])

  const handleInstall = async () => {
    const accepted = await showInstallPrompt()
    if (accepted) {
      setCanShowInstall(false)
      setIsAppInstalled(true)
    }
  }

  if (isAppInstalled) {
    return (
      <div className="bg-white rounded-lg shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">✅</span>
            <div>
              <h3 className="font-medium text-gray-900">App Installed</h3>
              <p className="text-sm text-gray-600">Prague Tracker is installed on your device</p>
            </div>
          </div>
          <span className="text-green-600 text-sm font-medium">Installed</span>
        </div>
      </div>
    )
  }

  if (!canShowInstall) {
    return (
      <div className="bg-white rounded-lg shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">📱</span>
            <div>
              <h3 className="font-medium text-gray-900">Install App</h3>
              <p className="text-sm text-gray-600">Use your browser's menu to install Prague Tracker</p>
            </div>
          </div>
          <span className="text-gray-500 text-sm">Available</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">📱</span>
          <div>
            <h3 className="font-medium text-gray-900">Install App</h3>
            <p className="text-sm text-gray-600">Install Prague Tracker for offline access</p>
          </div>
        </div>
        <button 
          onClick={handleInstall}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Install
        </button>
      </div>
    </div>
  )
}