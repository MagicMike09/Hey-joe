import { useState, useEffect } from 'react'
import { CheckCircle, Circle, Eye, Play, Square, Target } from 'lucide-react'
import { eyeTrackingService } from '../services/eyeTrackingService'
import { useTrackingStore } from '../store/trackingStore'

export default function EyeTrackingCalibration() {
  const [status, setStatus] = useState<'idle' | 'initializing' | 'calibrating' | 'validating' | 'active'>('idle')
  const [currentPoint, setCurrentPoint] = useState(0)
  const [calibrationPoints, setCalibrationPoints] = useState<Array<{ x: number; y: number }>>([])
  const [precisionScore, setPrecisionScore] = useState<number | null>(null)
  const [isRecording, setIsRecording] = useState(false)

  const { setEyeTrackingActive, setCalibrating, addGazeData, setCurrentGaze } = useTrackingStore()

  const startCalibration = async () => {
    try {
      setStatus('initializing')
      setCalibrating(true)

      // Initialize eye tracking
      await eyeTrackingService.initialize()

      // Get enhanced 13-point calibration
      const points = await eyeTrackingService.calibrate()
      setCalibrationPoints(points)

      // Wait a bit for camera to stabilize
      setTimeout(() => {
        setStatus('calibrating')
        setCurrentPoint(0)
      }, 2000)
    } catch (error) {
      console.error('Failed to start calibration:', error)
      setStatus('idle')
      setCalibrating(false)
      alert('Échec de l\'initialisation de l\'eye tracking. Veuillez autoriser l\'accès à la webcam.')
    }
  }

  const handleCalibrationClick = (point: { x: number; y: number }, index: number) => {
    setIsRecording(true)

    // Record calibration point (now records 15 times for 1.2 seconds)
    eyeTrackingService.recordCalibrationPoint(point.x, point.y)

    // Wait for recordings to complete (15 recordings * 80ms + buffer)
    setTimeout(() => {
      setIsRecording(false)

      // Move to next point
      if (index < calibrationPoints.length - 1) {
        setCurrentPoint(index + 1)
      } else {
        // Calibration complete - validate precision
        validateCalibration()
      }
    }, 1400) // 1.2s recording + 200ms buffer
  }

  const validateCalibration = async () => {
    setStatus('validating')

    // Wait a bit for the model to process
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Use 5 test points (corners + center)
    const testPoints = [
      calibrationPoints[0], // Top-left corner
      calibrationPoints[1], // Top-right corner
      calibrationPoints[2], // Bottom-left corner
      calibrationPoints[3], // Bottom-right corner
      calibrationPoints[8]  // Center
    ]

    const precision = await eyeTrackingService.validatePrecision(testPoints)
    setPrecisionScore(Math.round(precision))

    // If precision is too low, suggest recalibration
    if (precision < 60) {
      setTimeout(() => {
        const retry = confirm(
          `Précision : ${Math.round(precision)}%\n\n` +
          `La précision est faible. Recommandations :\n` +
          `- Ajustez votre position face à l'écran\n` +
          `- Assurez-vous d'avoir un bon éclairage\n` +
          `- Évitez les reflets sur vos lunettes\n\n` +
          `Voulez-vous recommencer la calibration ?`
        )

        if (retry) {
          restartCalibration()
        } else {
          finishCalibration()
        }
      }, 1000)
    } else {
      setTimeout(() => {
        finishCalibration()
      }, 2000)
    }
  }

  const restartCalibration = () => {
    eyeTrackingService.clearCalibration()
    setCurrentPoint(0)
    setPrecisionScore(null)
    setStatus('calibrating')
  }

  const finishCalibration = () => {
    setStatus('active')
    setCalibrating(false)
    setEyeTrackingActive(true)

    // Start tracking
    eyeTrackingService.startTracking((data) => {
      addGazeData(data)
      setCurrentGaze(data)
    })

    // Hide video preview after calibration
    eyeTrackingService.showVideo(false)
  }

  const stopTracking = () => {
    eyeTrackingService.stopTracking()
    setEyeTrackingActive(false)
    setStatus('idle')
    setPrecisionScore(null)
  }

  return (
    <div className="space-y-4">
      {status === 'idle' && (
        <>
          <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4 mb-4">
            <h4 className="text-blue-300 font-bold mb-2">💡 Conseils pour un calibrage optimal</h4>
            <ul className="list-disc list-inside text-sm space-y-1 text-blue-200">
              <li>Positionnez-vous à 50-70 cm de l'écran</li>
              <li>Gardez la tête stable pendant le calibrage</li>
              <li>Assurez-vous d'un éclairage uniforme (évitez contre-jour)</li>
              <li>Retirez vos lunettes si elles ont des reflets</li>
              <li>Fixez intensément chaque point rouge qui apparaît</li>
            </ul>
          </div>

          <div className="text-slate-300 space-y-2">
            <p className="font-semibold">13 points de calibration pour une précision maximale</p>
            <p className="text-sm text-slate-400">
              Le calibrage prendra environ 30 secondes. Restez concentré !
            </p>
          </div>

          <button
            onClick={startCalibration}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
          >
            <Play className="w-5 h-5" />
            <span>Commencer la calibration</span>
          </button>
        </>
      )}

      {status === 'initializing' && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-slate-300 font-semibold">Initialisation de la caméra...</p>
          <p className="text-sm text-slate-400 mt-2">Veuillez autoriser l'accès à la webcam</p>
          <p className="text-xs text-slate-500 mt-4">Attente de stabilisation de l'image...</p>
        </div>
      )}

      {status === 'calibrating' && (
        <>
          {/* Fullscreen calibration overlay */}
          <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
            {/* Instructions */}
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-center">
              <h3 className="text-white text-2xl font-bold mb-2">
                {isRecording ? '🔴 Fixez le point rouge !' : 'Calibration en cours'}
              </h3>
              <p className="text-slate-300">
                Point {currentPoint + 1} / {calibrationPoints.length}
              </p>
              <div className="mt-4 bg-white/10 rounded-full h-2 w-64 mx-auto overflow-hidden">
                <div
                  className="bg-purple-500 h-full transition-all duration-300"
                  style={{ width: `${((currentPoint) / calibrationPoints.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Calibration points */}
            {calibrationPoints.map((point, index) => {
              const isActive = index === currentPoint
              const isDone = index < currentPoint

              return (
                <button
                  key={index}
                  onClick={() => isActive && handleCalibrationClick(point, index)}
                  disabled={!isActive}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${point.x}px`,
                    top: `${point.y}px`,
                    pointerEvents: isActive ? 'auto' : 'none'
                  }}
                >
                  {isDone ? (
                    <div className="relative">
                      <CheckCircle className="w-8 h-8 text-green-400" />
                    </div>
                  ) : isActive ? (
                    <div className="relative">
                      {/* Outer pulsing ring */}
                      <div className={`absolute inset-0 ${isRecording ? 'animate-ping' : 'animate-pulse'}`}>
                        <div className="w-16 h-16 rounded-full bg-red-500/30 transform -translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2" />
                      </div>
                      {/* Middle ring */}
                      <div className="absolute inset-0">
                        <div className={`w-12 h-12 rounded-full border-2 border-red-400 transform -translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 ${isRecording ? 'animate-pulse' : ''}`} />
                      </div>
                      {/* Center dot */}
                      <div className={`w-6 h-6 rounded-full ${isRecording ? 'bg-red-600 animate-pulse' : 'bg-red-500'} transform -translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 cursor-pointer`} />

                      {!isRecording && (
                        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                          <div className="bg-white text-black px-3 py-1 rounded-full text-sm font-bold animate-bounce">
                            Cliquez ici !
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-slate-600 opacity-30" />
                  )}
                </button>
              )
            })}

            {/* Camera preview reminder */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center">
              <p className="text-slate-400 text-sm">
                🎥 Gardez votre visage dans le cadre de la caméra (en haut à droite)
              </p>
            </div>
          </div>
        </>
      )}

      {status === 'validating' && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-slate-300 font-semibold">Validation de la précision...</p>
          <p className="text-sm text-slate-400 mt-2">Calcul en cours...</p>
          {precisionScore !== null && (
            <div className="mt-6 bg-green-500/20 border border-green-500/50 rounded-lg p-4">
              <p className="text-green-300 font-bold text-lg">
                Précision : {precisionScore}%
              </p>
              <p className="text-sm text-green-200 mt-2">
                {precisionScore >= 80 ? '🎉 Excellente précision !' :
                 precisionScore >= 60 ? '✅ Précision acceptable' :
                 '⚠️ Précision faible - Recalibration recommandée'}
              </p>
            </div>
          )}
        </div>
      )}

      {status === 'active' && (
        <div className="space-y-4">
          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">Eye tracking actif</span>
              </div>
              {precisionScore !== null && (
                <span className="text-green-300 font-bold">
                  {precisionScore}% précision
                </span>
              )}
            </div>
            <p className="text-sm text-slate-300">
              Votre regard est maintenant suivi en temps réel avec filtrage avancé.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={restartCalibration}
              className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 font-semibold py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors border border-yellow-500/50"
            >
              <Target className="w-4 h-4" />
              <span>Recalibrer</span>
            </button>

            <button
              onClick={stopTracking}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors border border-red-500/50"
            >
              <Square className="w-4 h-4" />
              <span>Arrêter</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
