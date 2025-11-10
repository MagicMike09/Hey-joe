import { useState, useEffect } from 'react'
import { CheckCircle, Circle, Eye, Play, Square } from 'lucide-react'
import { eyeTrackingService } from '../services/eyeTrackingService'
import { useTrackingStore } from '../store/trackingStore'

export default function EyeTrackingCalibration() {
  const [status, setStatus] = useState<'idle' | 'initializing' | 'calibrating' | 'active'>('idle')
  const [currentPoint, setCurrentPoint] = useState(0)
  const [calibrationPoints, setCalibrationPoints] = useState<Array<{ x: number; y: number }>>([])

  const { setEyeTrackingActive, setCalibrating, addGazeData, setCurrentGaze } = useTrackingStore()

  const startCalibration = async () => {
    try {
      setStatus('initializing')
      setCalibrating(true)

      // Initialize eye tracking
      await eyeTrackingService.initialize()

      // Get calibration points
      const points = await eyeTrackingService.calibrate()
      setCalibrationPoints(points)

      setStatus('calibrating')
      setCurrentPoint(0)

      // Show instructions
      setTimeout(() => {
        setStatus('calibrating')
      }, 1000)
    } catch (error) {
      console.error('Failed to start calibration:', error)
      setStatus('idle')
      setCalibrating(false)
      alert('Échec de l\'initialisation de l\'eye tracking. Veuillez autoriser l\'accès à la webcam.')
    }
  }

  const handleCalibrationClick = (point: { x: number; y: number }, index: number) => {
    // Record calibration point
    eyeTrackingService.recordCalibrationPoint(point.x, point.y)

    // Move to next point
    if (index < calibrationPoints.length - 1) {
      setCurrentPoint(index + 1)
    } else {
      // Calibration complete
      finishCalibration()
    }
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
  }

  return (
    <div className="space-y-4">
      {status === 'idle' && (
        <>
          <div className="text-slate-300 space-y-2">
            <p>L'eye tracking utilise votre webcam pour suivre votre regard.</p>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>Assurez-vous d'être dans un endroit bien éclairé</li>
              <li>Positionnez-vous face à l'écran</li>
              <li>Évitez les reflets sur vos lunettes si vous en portez</li>
            </ul>
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
          <p className="text-slate-300">Initialisation de l'eye tracking...</p>
          <p className="text-sm text-slate-400 mt-2">Veuillez autoriser l'accès à la webcam</p>
        </div>
      )}

      {status === 'calibrating' && (
        <div className="space-y-4">
          <div className="bg-slate-700/50 p-4 rounded-lg">
            <p className="text-white font-semibold mb-2">Instructions de calibration :</p>
            <p className="text-slate-300 text-sm">
              Cliquez sur chaque point qui apparaît à l'écran ({currentPoint + 1}/{calibrationPoints.length})
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {calibrationPoints.map((point, index) => (
              <button
                key={index}
                onClick={() => handleCalibrationClick(point, index)}
                disabled={index !== currentPoint}
                className={`p-4 rounded-lg flex items-center justify-center transition-all ${
                  index === currentPoint
                    ? 'bg-purple-500 hover:bg-purple-600 scale-110'
                    : index < currentPoint
                    ? 'bg-green-500/20 cursor-default'
                    : 'bg-slate-700/30 cursor-not-allowed'
                }`}
              >
                {index < currentPoint ? (
                  <CheckCircle className="w-6 h-6 text-green-400" />
                ) : (
                  <Circle className={`w-6 h-6 ${index === currentPoint ? 'text-white' : 'text-slate-500'}`} />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {status === 'active' && (
        <div className="space-y-4">
          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-green-400 mb-2">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">Eye tracking actif</span>
            </div>
            <p className="text-sm text-slate-300">
              Votre regard est maintenant suivi en temps réel.
            </p>
          </div>

          <button
            onClick={stopTracking}
            className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors border border-red-500/50"
          >
            <Square className="w-4 h-4" />
            <span>Arrêter l'eye tracking</span>
          </button>
        </div>
      )}
    </div>
  )
}
