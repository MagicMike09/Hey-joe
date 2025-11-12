// @ts-ignore - WebGazer types
import webgazer from 'webgazer'
import { GazeData } from '../store/trackingStore'

class EyeTrackingService {
  private isInitialized = false
  private calibrationPoints: Array<{ x: number; y: number }> = []

  async initialize() {
    if (this.isInitialized) return

    try {
      await webgazer
        .setGazeListener((data: any, timestamp: number) => {
          // Handled by custom listeners
        })
        .begin()

      // Configure WebGazer for maximum precision
      webgazer.showVideoPreview(true)
      webgazer.showPredictionPoints(true)

      // Apply Kalman filter for smoothing
      webgazer.applyKalmanFilter(true)

      // Set regression model (ridge is more accurate than linear)
      webgazer.setRegression('ridge')

      // Save data more frequently for better accuracy
      webgazer.saveDataAcrossSessions(true)

      // Set tracker (TFFacemesh is more accurate but slower, clmtracker is faster)
      webgazer.setTracker('TFFacemesh')

      this.isInitialized = true
      console.log('Eye tracking initialized with high precision settings')
    } catch (error) {
      console.error('Failed to initialize eye tracking:', error)
      throw error
    }
  }

  startTracking(callback: (data: GazeData) => void) {
    if (!this.isInitialized) {
      throw new Error('Eye tracking not initialized')
    }

    webgazer.setGazeListener((data: any, timestamp: number) => {
      if (data) {
        callback({
          x: data.x,
          y: data.y,
          timestamp
        })
      }
    })

    webgazer.resume()
  }

  stopTracking() {
    webgazer.pause()
  }

  async calibrate(points?: Array<{ x: number; y: number }>) {
    if (points) {
      this.calibrationPoints = points
    } else {
      // Default 9-point calibration
      const width = window.innerWidth
      const height = window.innerHeight
      this.calibrationPoints = [
        { x: width * 0.1, y: height * 0.1 },
        { x: width * 0.5, y: height * 0.1 },
        { x: width * 0.9, y: height * 0.1 },
        { x: width * 0.1, y: height * 0.5 },
        { x: width * 0.5, y: height * 0.5 },
        { x: width * 0.9, y: height * 0.5 },
        { x: width * 0.1, y: height * 0.9 },
        { x: width * 0.5, y: height * 0.9 },
        { x: width * 0.9, y: height * 0.9 }
      ]
    }

    return this.calibrationPoints
  }

  recordCalibrationPoint(x: number, y: number) {
    // Record multiple times for better accuracy (5 clicks per point)
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        webgazer.recordScreenPosition(x, y)
      }, i * 100) // Space out recordings by 100ms
    }
  }

  // Clear old calibration data and start fresh
  clearCalibration() {
    webgazer.clearData()
  }

  // Get accuracy score (0-100)
  async validatePrecision(): Promise<number> {
    // This would need to be called after showing test points
    // Returns a precision score
    const precision = webgazer.getTracker()?.getAccuracy?.() || 0
    return precision
  }

  showVideo(show: boolean) {
    webgazer.showVideoPreview(show)
  }

  showPredictions(show: boolean) {
    webgazer.showPredictionPoints(show)
  }

  async getCurrentPrediction(): Promise<GazeData | null> {
    return new Promise((resolve) => {
      webgazer.getCurrentPrediction()
        .then((data: any) => {
          if (data) {
            resolve({
              x: data.x,
              y: data.y,
              timestamp: Date.now()
            })
          } else {
            resolve(null)
          }
        })
        .catch(() => resolve(null))
    })
  }

  async destroy() {
    await webgazer.end()
    this.isInitialized = false
  }
}

export const eyeTrackingService = new EyeTrackingService()
