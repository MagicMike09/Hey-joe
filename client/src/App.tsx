import { useEffect, useState } from 'react'
import { Brain, Eye, Activity, Settings } from 'lucide-react'
import Dashboard from './components/Dashboard'
import EyeTrackingCalibration from './components/EyeTrackingCalibration'
import BrainBitConnection from './components/BrainBitConnection'
import EmotionAnalysis from './components/EmotionAnalysis'
import { useTrackingStore } from './store/trackingStore'

function App() {
  const [view, setView] = useState<'setup' | 'dashboard'>('setup')
  const { isEyeTrackingActive, isBrainBitConnected } = useTrackingStore()

  useEffect(() => {
    if (isEyeTrackingActive && isBrainBitConnected) {
      setView('dashboard')
    }
  }, [isEyeTrackingActive, isBrainBitConnected])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Hey Joe</h1>
                <p className="text-sm text-slate-300">Emotion Tracker</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <StatusIndicator
                icon={Eye}
                label="Eye Tracking"
                active={isEyeTrackingActive}
              />
              <StatusIndicator
                icon={Activity}
                label="Brain Bit"
                active={isBrainBitConnected}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {view === 'setup' ? (
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">
                Configuration du système
              </h2>
              <p className="text-slate-300 text-lg">
                Configurez l'eye tracking et connectez votre dispositif Brain Bit pour commencer
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Eye Tracking Setup */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                <div className="flex items-center space-x-3 mb-6">
                  <Eye className="w-6 h-6 text-purple-400" />
                  <h3 className="text-xl font-semibold text-white">Eye Tracking</h3>
                </div>
                <EyeTrackingCalibration />
              </div>

              {/* Brain Bit Connection */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                <div className="flex items-center space-x-3 mb-6">
                  <Activity className="w-6 h-6 text-pink-400" />
                  <h3 className="text-xl font-semibold text-white">Brain Bit EEG</h3>
                </div>
                <BrainBitConnection />
              </div>
            </div>

            {isEyeTrackingActive && isBrainBitConnected && (
              <div className="text-center">
                <button
                  onClick={() => setView('dashboard')}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-8 py-3 rounded-lg transition-all transform hover:scale-105"
                >
                  Démarrer l'analyse des émotions
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-white">
                Analyse en temps réel
              </h2>
              <button
                onClick={() => setView('setup')}
                className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Configuration</span>
              </button>
            </div>
            <Dashboard />
            <EmotionAnalysis />
          </div>
        )}
      </main>
    </div>
  )
}

interface StatusIndicatorProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  active: boolean
}

function StatusIndicator({ icon: Icon, label, active }: StatusIndicatorProps) {
  return (
    <div className="flex items-center space-x-2">
      <div className={`p-2 rounded-lg ${active ? 'bg-green-500/20' : 'bg-slate-700'}`}>
        <Icon className={`w-4 h-4 ${active ? 'text-green-400' : 'text-slate-400'}`} />
      </div>
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className={`text-sm font-semibold ${active ? 'text-green-400' : 'text-slate-400'}`}>
          {active ? 'Actif' : 'Inactif'}
        </p>
      </div>
    </div>
  )
}

export default App
