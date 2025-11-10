import { useEffect, useState } from 'react'
import { Brain, Eye, Activity, Settings, ShoppingCart, Sparkles } from 'lucide-react'
import Dashboard from './components/Dashboard'
import EyeTrackingCalibration from './components/EyeTrackingCalibration'
import BrainBitConnection from './components/BrainBitConnection'
import EmotionAnalysis from './components/EmotionAnalysis'
import ShelfSetup from './components/ShelfSetup'
import RetailDashboard from './components/RetailDashboard'
import MerchandisingReport from './components/MerchandisingReport'
import { useTrackingStore } from './store/trackingStore'
import { useRetailStore } from './store/retailStore'
import { retailAnalyticsService } from './services/retailAnalyticsService'

type AppMode = 'general' | 'retail'
type ViewState = 'mode-selection' | 'shelf-setup' | 'tracking-setup' | 'dashboard'

function App() {
  const [mode, setMode] = useState<AppMode | null>(null)
  const [view, setView] = useState<ViewState>('mode-selection')
  const { isEyeTrackingActive, isBrainBitConnected } = useTrackingStore()
  const { productZones } = useRetailStore()

  useEffect(() => {
    if (mode === 'general' && isEyeTrackingActive && isBrainBitConnected) {
      setView('dashboard')
    } else if (mode === 'retail' && productZones.length > 0 && isEyeTrackingActive && isBrainBitConnected) {
      setView('dashboard')
      // Start retail analytics session
      retailAnalyticsService.startSession()
    }
  }, [mode, isEyeTrackingActive, isBrainBitConnected, productZones.length])

  const handleModeSelect = (selectedMode: AppMode) => {
    setMode(selectedMode)
    if (selectedMode === 'retail') {
      setView('shelf-setup')
    } else {
      setView('tracking-setup')
    }
  }

  const handleShelfSetupComplete = () => {
    if (productZones.length > 0) {
      setView('tracking-setup')
    } else {
      alert('Veuillez définir au moins un produit avant de continuer')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                {mode === 'retail' ? (
                  <ShoppingCart className="w-8 h-8 text-white" />
                ) : (
                  <Brain className="w-8 h-8 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Hey Joe</h1>
                <p className="text-sm text-slate-300">
                  {mode === 'retail' ? 'Retail Analytics' : 'Emotion Tracker'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {mode && (
                <>
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
                  {view === 'dashboard' && (
                    <button
                      onClick={() => {
                        setMode(null)
                        setView('mode-selection')
                        retailAnalyticsService.reset()
                      }}
                      className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Changer de mode</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Mode Selection */}
        {view === 'mode-selection' && (
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">
                Choisissez votre mode d'analyse
              </h2>
              <p className="text-slate-300 text-lg">
                Sélectionnez le type d'analyse que vous souhaitez effectuer
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* General Mode */}
              <button
                onClick={() => handleModeSelect('general')}
                className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border-2 border-slate-700 hover:border-purple-500 transition-all group text-left"
              >
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Mode Général</h3>
                <p className="text-slate-300 mb-4">
                  Analyse émotionnelle complète pour :
                </p>
                <ul className="text-slate-400 space-y-2">
                  <li>• Tests utilisateurs (UX/UI)</li>
                  <li>• Études en sciences cognitives</li>
                  <li>• Analyse de contenu visuel</li>
                  <li>• Recherche académique</li>
                </ul>
              </button>

              {/* Retail Mode */}
              <button
                onClick={() => handleModeSelect('retail')}
                className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border-2 border-slate-700 hover:border-green-500 transition-all group text-left"
              >
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <ShoppingCart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Mode Retail</h3>
                <p className="text-slate-300 mb-4">
                  Analyse de produits sur étagère pour :
                </p>
                <ul className="text-slate-400 space-y-2">
                  <li>• Merchandising et PLV</li>
                  <li>• Tests A/B de dispositions</li>
                  <li>• Optimisation de linéaires</li>
                  <li>• Études de packaging</li>
                </ul>
              </button>
            </div>
          </div>
        )}

        {/* Shelf Setup (Retail Mode) */}
        {view === 'shelf-setup' && mode === 'retail' && (
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-white mb-4">
                Configuration de l'étagère
              </h2>
              <p className="text-slate-300 text-lg">
                Importez l'image de votre étagère et définissez les zones produits
              </p>
            </div>

            <ShelfSetup />

            {productZones.length > 0 && (
              <div className="text-center">
                <button
                  onClick={handleShelfSetupComplete}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold px-8 py-3 rounded-lg transition-all transform hover:scale-105"
                >
                  Continuer vers la calibration
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tracking Setup */}
        {view === 'tracking-setup' && mode && (
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
                  {mode === 'retail' ? 'Démarrer l\'analyse retail' : 'Démarrer l\'analyse des émotions'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Dashboard */}
        {view === 'dashboard' && mode === 'general' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-white">
                Analyse en temps réel
              </h2>
              <button
                onClick={() => setView('tracking-setup')}
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

        {view === 'dashboard' && mode === 'retail' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-white">
                Analyse Retail en temps réel
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setView('shelf-setup')}
                  className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span>Étagère</span>
                </button>
                <button
                  onClick={() => setView('tracking-setup')}
                  className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span>Tracking</span>
                </button>
              </div>
            </div>
            <RetailDashboard />
            <MerchandisingReport />
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
