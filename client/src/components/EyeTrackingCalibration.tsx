import { useState, useEffect } from 'react'
import { CheckCircle, Play, Square, Target, AlertCircle } from 'lucide-react'
import { eyeTrackingService } from '../services/eyeTrackingService'
import { useTrackingStore } from '../store/trackingStore'

export default function EyeTrackingCalibration() {
  const [status, setStatus] = useState<'idle' | 'initializing' | 'calibrating' | 'active'>('idle')
  const [currentPoint, setCurrentPoint] = useState(0)
  const [calibrationPoints, setCalibrationPoints] = useState<Array<{ x: number; y: number }>>([])
  const [isRecording, setIsRecording] = useState(false)

  const { setEyeTrackingActive, setCalibrating, addGazeData, setCurrentGaze } = useTrackingStore()

  // Recalculate calibration points if window size changes during calibration
  useEffect(() => {
    if (status !== 'calibrating') return

    const handleResize = () => {
      // Recalculate points based on new window size
      const points = eyeTrackingService.calibrate()
      points.then(newPoints => setCalibrationPoints(newPoints))
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [status])

  const startCalibration = async () => {
    try {
      setStatus('initializing')
      setCalibrating(true)

      // Initialize eye tracking
      await eyeTrackingService.initialize()

      // Get 5-point calibration based on current viewport
      const points = await eyeTrackingService.calibrate()
      setCalibrationPoints(points)

      // Wait for camera to stabilize
      setTimeout(() => {
        setStatus('calibrating')
        setCurrentPoint(0)
      }, 2000)
    } catch (error) {
      console.error('Failed to start calibration:', error)
      setStatus('idle')
      setCalibrating(false)
      alert('Échec de l\'initialisation. Veuillez autoriser l\'accès à la webcam.')
    }
  }

  const handleCalibrationClick = (point: { x: number; y: number }, index: number) => {
    if (isRecording) return // Prevent double clicks

    setIsRecording(true)

    // Record calibration point (15 times for 1.2 seconds)
    eyeTrackingService.recordCalibrationPoint(point.x, point.y)

    // Wait for recordings to complete
    setTimeout(() => {
      setIsRecording(false)

      // Move to next point
      if (index < calibrationPoints.length - 1) {
        setCurrentPoint(index + 1)
      } else {
        // Calibration complete
        finishCalibration()
      }
    }, 1500)
  }

  const finishCalibration = () => {
    setStatus('active')
    setCalibrating(false)
    setEyeTrackingActive(true)

    // Start tracking with smoothing
    eyeTrackingService.startTracking((data) => {
      addGazeData(data)
      setCurrentGaze(data)
    })

    // Hide video preview after calibration
    eyeTrackingService.showVideo(false)
  }

  const restartCalibration = () => {
    eyeTrackingService.clearCalibration()
    setCurrentPoint(0)
    setStatus('idle')
    startCalibration()
  }

  const stopTracking = () => {
    eyeTrackingService.stopTracking()
    setEyeTrackingActive(false)
    setStatus('idle')
  }

  // Render calibration overlay
  if (status === 'calibrating') {
    return (
      <div className="fixed inset-0 bg-black z-[99999] flex items-center justify-center" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}>
        {/* Instructions - with pointer-events-none so they don't block clicks */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-center z-[100000] pointer-events-none">
          <h3 className="text-white text-3xl font-bold mb-3">
            {isRecording ? '🔴 Fixez le point rouge intensément !' : '🎯 Calibration Eye Tracking'}
          </h3>
          <p className="text-slate-300 text-lg mb-2">
            Point {currentPoint + 1} sur {calibrationPoints.length}
          </p>
          <p className="text-slate-400 text-sm">
            {isRecording ? 'Enregistrement en cours...' : 'Cliquez sur le point rouge qui clignote'}
          </p>

          {/* Progress bar */}
          <div className="mt-6 bg-white/10 rounded-full h-3 w-80 mx-auto overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-500"
              style={{ width: `${((currentPoint + (isRecording ? 0.5 : 0)) / calibrationPoints.length) * 100}%` }}
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
              onClick={() => isActive && !isRecording && handleCalibrationClick(point, index)}
              disabled={!isActive || isRecording}
              className="absolute focus:outline-none"
              style={{
                left: `${point.x}px`,
                top: `${point.y}px`,
                transform: 'translate(-50%, -50%)',
                zIndex: isActive ? 100002 : 100000,
                pointerEvents: isActive && !isRecording ? 'auto' : 'none',
                cursor: isActive && !isRecording ? 'pointer' : 'default'
              }}
            >
              {isDone ? (
                // Completed point
                <div className="relative">
                  <CheckCircle className="w-10 h-10 text-green-400" />
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {index + 1}
                  </div>
                </div>
              ) : isActive ? (
                // Active point - LARGER and more visible
                <div className="relative" style={{ width: '100px', height: '100px' }}>
                  {/* Outer pulsing ring - LARGER */}
                  {!isRecording && (
                    <div className="absolute inset-0 animate-ping" style={{ pointerEvents: 'none' }}>
                      <div className="w-32 h-32 rounded-full bg-red-500/40 transform -translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2" />
                    </div>
                  )}

                  {/* Middle ring - LARGER */}
                  <div className="absolute inset-0" style={{ pointerEvents: 'none' }}>
                    <div className={`w-20 h-20 rounded-full border-4 border-red-400 transform -translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 ${isRecording ? 'animate-pulse' : ''}`} />
                  </div>

                  {/* Center dot - LARGER and CLICKABLE */}
                  <div
                    className={`w-12 h-12 rounded-full ${isRecording ? 'bg-red-700 animate-ping' : 'bg-red-500'} transform -translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 shadow-2xl shadow-red-500/80 cursor-pointer`}
                    style={{ pointerEvents: 'auto' }}
                  />

                  {/* Number badge */}
                  <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-lg font-bold rounded-full w-10 h-10 flex items-center justify-center border-3 border-white shadow-xl" style={{ pointerEvents: 'none' }}>
                    {index + 1}
                  </div>

                  {/* "Click here" label */}
                  {!isRecording && (
                    <div className="absolute top-16 left-1/2 transform -translate-x-1/2 whitespace-nowrap" style={{ pointerEvents: 'none' }}>
                      <div className="bg-white text-black px-5 py-3 rounded-full text-base font-bold animate-bounce shadow-2xl">
                        👆 CLIQUEZ ICI
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Future point (not yet reached)
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-white/30 border-2 border-white/50 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{index + 1}</span>
                  </div>
                </div>
              )}
            </button>
          )
        })}

        {/* Camera reminder */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-center z-[100000] pointer-events-none">
          <div className="bg-blue-900/80 backdrop-blur-sm px-6 py-3 rounded-lg border border-blue-500/50">
            <p className="text-blue-200 text-sm font-semibold">
              🎥 Gardez votre visage dans le cadre de la caméra (en haut à droite)
            </p>
          </div>
        </div>

        {/* Screen size indicator (debug - remove in production) */}
        <div className="absolute top-2 left-2 text-xs text-white/50 z-[100000] pointer-events-none">
          {window.innerWidth}x{window.innerHeight}
        </div>
      </div>
    )
  }

  // Normal UI (not in calibration mode)
  return (
    <div className="space-y-4">
      {status === 'idle' && (
        <>
          <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-500/50 rounded-lg p-5">
            <h4 className="text-blue-300 font-bold mb-3 text-lg flex items-center space-x-2">
              <AlertCircle className="w-5 h-5" />
              <span>Conseils pour un calibrage optimal</span>
            </h4>
            <ul className="space-y-2 text-blue-200">
              <li className="flex items-start space-x-2">
                <span className="text-blue-400 font-bold">•</span>
                <span><strong>Distance :</strong> Positionnez-vous à 50-70 cm de l'écran</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-400 font-bold">•</span>
                <span><strong>Stabilité :</strong> Gardez la tête immobile pendant le calibrage</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-400 font-bold">•</span>
                <span><strong>Éclairage :</strong> Lumière uniforme, évitez le contre-jour</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-400 font-bold">•</span>
                <span><strong>Lunettes :</strong> Retirez-les si elles ont des reflets</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-400 font-bold">•</span>
                <span><strong>Fixation :</strong> Fixez intensément chaque point rouge</span>
              </li>
            </ul>
          </div>

          <div className="text-slate-300 space-y-2 text-center">
            <p className="font-bold text-lg text-white">5 points de calibration (rapide et efficace)</p>
            <p className="text-sm text-slate-400">
              Durée : ~10 secondes • 4 coins + centre de l'écran
            </p>
          </div>

          <button
            onClick={startCalibration}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-6 rounded-lg flex items-center justify-center space-x-3 transition-all transform hover:scale-105 shadow-lg"
          >
            <Play className="w-6 h-6" />
            <span className="text-lg">Commencer la calibration</span>
          </button>
        </>
      )}

      {status === 'initializing' && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500 mx-auto mb-6"></div>
          <p className="text-white text-xl font-bold mb-2">Initialisation de la caméra...</p>
          <p className="text-slate-400 mb-4">Veuillez autoriser l'accès à la webcam</p>
          <p className="text-slate-500 text-sm">Attente de stabilisation de l'image (2 secondes)...</p>
        </div>
      )}

      {status === 'active' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-green-900/40 to-emerald-900/40 border-2 border-green-500/50 rounded-lg p-5">
            <div className="flex items-center space-x-3 mb-3">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <span className="font-bold text-lg text-green-300">Eye tracking actif</span>
            </div>
            <p className="text-slate-300">
              Votre regard est maintenant suivi en temps réel avec filtrage avancé (moyenne mobile pondérée).
            </p>
            <div className="mt-3 bg-green-500/20 rounded-lg p-3">
              <p className="text-green-200 text-sm">
                ✅ 5 points calibrés (4 coins + centre) • ✅ 15 enregistrements par point • ✅ Lissage actif
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={restartCalibration}
              className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all shadow-md"
            >
              <Target className="w-5 h-5" />
              <span>Recalibrer</span>
            </button>

            <button
              onClick={stopTracking}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all shadow-md"
            >
              <Square className="w-5 h-5" />
              <span>Arrêter</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
