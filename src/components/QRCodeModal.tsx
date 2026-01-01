import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

interface QRCodeModalProps {
  isOpen: boolean
  onClose: () => void
  pairingCode: string
}

export const QRCodeModal = ({ isOpen, onClose, pairingCode }: QRCodeModalProps) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [showManualCode, setShowManualCode] = useState(false)

  useEffect(() => {
    if (isOpen && pairingCode) {
      // Generate QR code containing the pairing code
      const qrData = JSON.stringify({
        app: 'prague-tracker',
        code: pairingCode,
        timestamp: Date.now()
      })
      
      QRCode.toDataURL(qrData, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      }).then(setQrCodeUrl).catch(console.error)
    }
  }, [isOpen, pairingCode])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm">
        <h3 className="text-lg font-semibold mb-4 text-center">
          Pair Another Device
        </h3>
        
        <div className="text-center mb-6">
          {qrCodeUrl ? (
            <div>
              <img 
                src={qrCodeUrl} 
                alt="QR Code for device pairing" 
                className="w-48 h-48 mx-auto mb-4 border border-gray-200 rounded-lg"
              />
              <p className="text-sm text-gray-600 mb-4">
                Scan this QR code with your other device
              </p>
            </div>
          ) : (
            <div className="w-48 h-48 mx-auto mb-4 border border-gray-200 rounded-lg flex items-center justify-center">
              <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" />
            </div>
          )}
          
          <button
            onClick={() => setShowManualCode(!showManualCode)}
            className="text-blue-600 hover:text-blue-800 text-sm underline"
          >
            {showManualCode ? 'Hide' : 'Show'} manual code
          </button>
          
          {showManualCode && (
            <div className="mt-3 p-3 bg-gray-50 rounded border">
              <div className="font-mono text-lg tracking-widest mb-2">
                {pairingCode}
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(pairingCode)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Copy code
              </button>
            </div>
          )}
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            On your other device, choose "Continue on Another Device" and scan this code or enter the manual code
          </p>
        </div>
      </div>
    </div>
  )
}