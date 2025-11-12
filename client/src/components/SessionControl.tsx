import { useState } from 'react'
import { Play, Square, Download, Clock } from 'lucide-react'
import { useTrackingStore } from '../store/trackingStore'
import { useRetailStore } from '../store/retailStore'
import { retailAnalyticsService } from '../services/retailAnalyticsService'

export default function SessionControl() {
  const [isRecording, setIsRecording] = useState(false)
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null)
  const [sessionDuration, setSessionDuration] = useState(0)
  const [showFinalReport, setShowFinalReport] = useState(false)

  const { gazeData, eegData, emotionData } = useTrackingStore()
  const { productZones } = useRetailStore()

  const startSession = () => {
    setIsRecording(true)
    setSessionStartTime(Date.now())
    retailAnalyticsService.startSession()

    // Update duration every second
    const interval = setInterval(() => {
      if (sessionStartTime) {
        setSessionDuration(Math.floor((Date.now() - sessionStartTime) / 1000))
      }
    }, 1000)

    // Store interval ID for cleanup
    ;(window as any).__sessionInterval = interval
  }

  const stopSession = () => {
    setIsRecording(false)
    setShowFinalReport(true)

    // Clear interval
    if ((window as any).__sessionInterval) {
      clearInterval((window as any).__sessionInterval)
    }
  }

  const downloadReport = () => {
    // Calculate final metrics
    const metrics = retailAnalyticsService.calculateProductMetrics(
      productZones,
      gazeData,
      emotionData,
      undefined
    )

    const report = {
      session: {
        startTime: sessionStartTime,
        endTime: Date.now(),
        duration: sessionDuration
      },
      data: {
        gazePoints: gazeData.length,
        eegPoints: eegData.length,
        emotionPoints: emotionData.length
      },
      products: Array.from(metrics.values()).map(m => ({
        name: m.productName,
        visited: m.visited,
        timeToFirstFixation: m.timeToFirstFixation,
        totalFixationTime: m.totalFixationTime,
        fixationCount: m.fixationCount,
        attentionScore: m.attentionScore,
        interestScore: m.interestScore,
        engagementScore: m.engagementScore,
        viewOrder: m.viewOrder
      }))
    }

    // Create download
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `retail-report-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Session Status */}
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-600'}`} />
            <span className="text-sm font-semibold text-slate-300">
              {isRecording ? 'Enregistrement en cours' : 'Session arrêtée'}
            </span>
          </div>

          {/* Duration */}
          {isRecording && (
            <div className="flex items-center space-x-2 bg-slate-700/50 px-3 py-1 rounded-lg">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-mono text-white">
                {formatDuration(sessionDuration)}
              </span>
            </div>
          )}

          {/* Data points */}
          <div className="flex items-center space-x-4 text-xs text-slate-400">
            <span>
              👁️ {gazeData.length} points
            </span>
            <span>
              🧠 {eegData.length} mesures
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2">
          {!isRecording ? (
            <button
              onClick={startSession}
              className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              <Play className="w-4 h-4" />
              <span>Démarrer l'expérience</span>
            </button>
          ) : (
            <button
              onClick={stopSession}
              className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              <Square className="w-4 h-4" />
              <span>Terminer l'expérience</span>
            </button>
          )}

          {showFinalReport && (
            <button
              onClick={downloadReport}
              className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Télécharger rapport</span>
            </button>
          )}
        </div>
      </div>

      {/* Final report summary */}
      {showFinalReport && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
            <h4 className="text-green-300 font-semibold mb-2">✅ Expérience terminée !</h4>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-slate-400">Durée totale</p>
                <p className="text-white font-semibold">{formatDuration(sessionDuration)}</p>
              </div>
              <div>
                <p className="text-slate-400">Points de regard collectés</p>
                <p className="text-white font-semibold">{gazeData.length}</p>
              </div>
              <div>
                <p className="text-slate-400">Produits analysés</p>
                <p className="text-white font-semibold">{productZones.length}</p>
              </div>
            </div>
            <p className="text-slate-300 text-sm mt-3">
              Scroll vers le bas pour consulter le rapport détaillé ou téléchargez-le en JSON.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
