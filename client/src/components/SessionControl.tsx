import { useState, useEffect } from 'react'
import { Play, Square, Download, Clock } from 'lucide-react'
import { useTrackingStore } from '../store/trackingStore'
import { useRetailStore } from '../store/retailStore'
import { retailAnalyticsService } from '../services/retailAnalyticsService'

export default function SessionControl() {
  const [isRecording, setIsRecording] = useState(false)
  const [duration, setDuration] = useState(0)
  const [showReport, setShowReport] = useState(false)

  const { gazeData, eegData, emotionData } = useTrackingStore()
  const { productZones } = useRetailStore()

  useEffect(() => {
    if (!isRecording) return

    const interval = setInterval(() => {
      setDuration(d => d + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [isRecording])

  const start = () => {
    setIsRecording(true)
    setDuration(0)
    setShowReport(false)
    retailAnalyticsService.startSession()
  }

  const stop = () => {
    setIsRecording(false)
    setShowReport(true)
  }

  const download = () => {
    const metrics = retailAnalyticsService.calculateProductMetrics(
      productZones,
      gazeData,
      emotionData,
      undefined
    )

    const report = {
      session: { duration },
      data: {
        gazePoints: gazeData.length,
        eegPoints: eegData.length
      },
      products: Array.from(metrics.values())
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rapport-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="bg-gradient-to-r from-slate-800 to-purple-900/30 rounded-xl p-6 border-2 border-purple-500/50">
      <div className="flex items-center justify-between">
        {/* Status */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className={`w-4 h-4 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-600'}`} />
            <span className="text-white font-bold text-lg">
              {isRecording ? '🔴 ENREGISTREMENT' : '⏹️ ARRÊTÉ'}
            </span>
          </div>

          {isRecording && (
            <div className="flex items-center space-x-2 bg-black/30 px-4 py-2 rounded-lg">
              <Clock className="w-5 h-5 text-purple-400" />
              <span className="text-white font-mono text-xl font-bold">{formatTime(duration)}</span>
            </div>
          )}

          <div className="text-sm text-slate-300">
            👁️ {gazeData.length} | 🧠 {eegData.length}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex space-x-3">
          {!isRecording ? (
            <button
              onClick={start}
              className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-lg text-lg transition-all transform hover:scale-105 shadow-lg"
            >
              <Play className="w-6 h-6" />
              <span>DÉMARRER</span>
            </button>
          ) : (
            <button
              onClick={stop}
              className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-3 rounded-lg text-lg transition-all transform hover:scale-105 shadow-lg"
            >
              <Square className="w-6 h-6" />
              <span>TERMINER</span>
            </button>
          )}

          {showReport && (
            <button
              onClick={download}
              className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 py-3 rounded-lg text-lg transition-all"
            >
              <Download className="w-5 h-5" />
              <span>TÉLÉCHARGER</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary */}
      {showReport && (
        <div className="mt-4 pt-4 border-t border-purple-500/30">
          <div className="bg-green-500/20 border-2 border-green-500 rounded-lg p-4">
            <h4 className="text-green-300 font-bold text-lg mb-3">✅ EXPÉRIENCE TERMINÉE</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-slate-400">Durée</p>
                <p className="text-white font-bold text-xl">{formatTime(duration)}</p>
              </div>
              <div>
                <p className="text-slate-400">Points regard</p>
                <p className="text-white font-bold text-xl">{gazeData.length}</p>
              </div>
              <div>
                <p className="text-slate-400">Produits</p>
                <p className="text-white font-bold text-xl">{productZones.length}</p>
              </div>
            </div>
            <p className="text-green-200 mt-3 font-semibold">
              📊 Scroll vers le bas pour voir le rapport complet
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
