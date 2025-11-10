import { useState } from 'react'
import { Bluetooth, CheckCircle, WifiOff, TestTube } from 'lucide-react'
import { brainBitService } from '../services/brainBitService'
import { useTrackingStore } from '../store/trackingStore'

export default function BrainBitConnection() {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected'>('idle')
  const [useMockData, setUseMockData] = useState(false)

  const { setBrainBitConnected, setConnecting, addEEGData, setCurrentEEG } = useTrackingStore()

  const connectToBrainBit = async () => {
    try {
      setStatus('connecting')
      setConnecting(true)

      const connected = await brainBitService.connect()

      if (connected) {
        setStatus('connected')
        setBrainBitConnected(true)
        setConnecting(false)

        // Start data stream
        await brainBitService.startDataStream((data) => {
          addEEGData(data)
          setCurrentEEG(data)
        })
      } else {
        throw new Error('Connection failed')
      }
    } catch (error) {
      console.error('Failed to connect to Brain Bit:', error)
      setStatus('idle')
      setConnecting(false)
      alert(
        'Échec de la connexion au Brain Bit. ' +
        'Veuillez vérifier que le dispositif est allumé et que Bluetooth est activé. ' +
        'Vous pouvez aussi utiliser le mode démo avec des données simulées.'
      )
    }
  }

  const connectWithMockData = () => {
    setStatus('connecting')
    setConnecting(true)
    setUseMockData(true)

    // Simulate connection delay
    setTimeout(() => {
      setStatus('connected')
      setBrainBitConnected(true)
      setConnecting(false)

      // Start mock data stream
      brainBitService.startMockDataStream((data) => {
        addEEGData(data)
        setCurrentEEG(data)
      })
    }, 1000)
  }

  const disconnect = async () => {
    await brainBitService.stopDataStream()
    await brainBitService.disconnect()
    setStatus('idle')
    setBrainBitConnected(false)
    setUseMockData(false)
  }

  return (
    <div className="space-y-4">
      {status === 'idle' && (
        <>
          <div className="text-slate-300 space-y-2">
            <p>Connectez votre dispositif Brain Bit pour capturer les signaux EEG.</p>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>Allumez votre Brain Bit</li>
              <li>Assurez-vous que Bluetooth est activé</li>
              <li>Le dispositif doit être correctement positionné</li>
            </ul>
          </div>

          <div className="space-y-2">
            <button
              onClick={connectToBrainBit}
              className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
            >
              <Bluetooth className="w-5 h-5" />
              <span>Se connecter au Brain Bit</span>
            </button>

            <button
              onClick={connectWithMockData}
              className="w-full bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors text-sm"
            >
              <TestTube className="w-4 h-4" />
              <span>Mode démo (données simulées)</span>
            </button>
          </div>

          <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-3">
            <p className="text-xs text-slate-400">
              <strong>Note :</strong> Le mode démo permet de tester l'application sans dispositif physique.
              Les données générées sont simulées mais réalistes.
            </p>
          </div>
        </>
      )}

      {status === 'connecting' && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Connexion au Brain Bit...</p>
          {!useMockData && (
            <p className="text-sm text-slate-400 mt-2">
              Veuillez sélectionner votre dispositif dans la fenêtre Bluetooth
            </p>
          )}
        </div>
      )}

      {status === 'connected' && (
        <div className="space-y-4">
          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-green-400 mb-2">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">
                {useMockData ? 'Mode démo actif' : 'Brain Bit connecté'}
              </span>
            </div>
            <p className="text-sm text-slate-300">
              {useMockData
                ? 'Les données EEG simulées sont en cours de génération.'
                : 'Les signaux EEG sont captés en temps réel.'}
            </p>
          </div>

          {useMockData && (
            <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-3">
              <p className="text-xs text-blue-300">
                Vous utilisez des données simulées. Pour des résultats réels, connectez un dispositif Brain Bit.
              </p>
            </div>
          )}

          <button
            onClick={disconnect}
            className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors border border-red-500/50"
          >
            <WifiOff className="w-4 h-4" />
            <span>Déconnecter</span>
          </button>
        </div>
      )}
    </div>
  )
}
