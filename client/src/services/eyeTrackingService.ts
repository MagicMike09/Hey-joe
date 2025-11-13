// @ts-ignore - WebGazer types
import webgazer from 'webgazer'
import { GazeData } from '../store/trackingStore'

class EyeTrackingService {
  private isInitialized = false
  private calibrationPoints: Array<{ x: number; y: number }> = []
  private gazeHistory: Array<{ x: number; y: number }> = []
  private historySize = 8 // Increased for better smoothing

  async initialize() {
    if (this.isInitialized) return

    try {
      await webgazer
        .setGazeListener((data: any, timestamp: number) => {
          // Handled by custom listeners
        })
        .begin()

      // Configure WebGazer for MAXIMUM precision
      webgazer.showVideoPreview(true)
      webgazer.showPredictionPoints(true)

      // Apply Kalman filter for smoothing
      webgazer.applyKalmanFilter(true)

      // Set regression model (ridge is most accurate)
      webgazer.setRegression('ridge')

      // Save data across sessions for continuous improvement
      webgazer.saveDataAcrossSessions(true)

      // Set tracker (TFFacemesh is most accurate)
      webgazer.setTracker('TFFacemesh')

      this.isInitialized = true
      console.log('Eye tracking initialized with maximum precision settings')
    } catch (error) {
      console.error('Failed to initialize eye tracking:', error)
      throw error
    }
  }

  // Smoothing filter using weighted moving average
  private smoothGaze(x: number, y: number): { x: number; y: number } {
    this.gazeHistory.push({ x, y })

    // Keep only recent history
    if (this.gazeHistory.length > this.historySize) {
      this.gazeHistory.shift()
    }

    // Weighted average (recent data has more weight)
    let totalWeight = 0
    let smoothX = 0
    let smoothY = 0

    this.gazeHistory.forEach((point, index) => {
      const weight = index + 1 // Recent points get higher weight
      smoothX += point.x * weight
      smoothY += point.y * weight
      totalWeight += weight
    })

    return {
      x: smoothX / totalWeight,
      y: smoothY / totalWeight
    }
  }

  startTracking(callback: (data: GazeData) => void) {
    if (!this.isInitialized) {
      throw new Error('Eye tracking not initialized')
    }

    webgazer.setGazeListener((data: any, timestamp: number) => {
      if (data) {
        // Apply smoothing filter
        const smoothed = this.smoothGaze(data.x, data.y)

        callback({
          x: smoothed.x,
          y: smoothed.y,
          timestamp
        })
      }
    })

    webgazer.resume()
  }

  stopTracking() {
    webgazer.pause()
    this.gazeHistory = [] // Clear history when stopping
  }

  async calibrate(points?: Array<{ x: number; y: number }>) {
    if (points) {
      this.calibrationPoints = points
    } else {
      // Simple and efficient 5-point calibration
      const width = window.innerWidth
      const height = window.innerHeight
      const margin = 0.1 // 10% margin from edges

      this.calibrationPoints = [
        // 4 corners + center (classic 5-point calibration)
        { x: width * margin, y: height * margin },           // Top-left
        { x: width * (1 - margin), y: height * margin },     // Top-right
        { x: width * 0.5, y: height * 0.5 },                 // Center
        { x: width * margin, y: height * (1 - margin) },     // Bottom-left
        { x: width * (1 - margin), y: height * (1 - margin) } // Bottom-right
      ]
    }

    return this.calibrationPoints
  }

  recordCalibrationPoint(x: number, y: number) {
    // Record MORE times for much better accuracy (15 recordings instead of 5)
    for (let i = 0; i < 15; i++) {
      setTimeout(() => {
        webgazer.recordScreenPosition(x, y)
      }, i * 80) // Space out recordings by 80ms (total 1.2 seconds per point)
    }
  }

  // Clear old calibration data and start fresh
  clearCalibration() {
    webgazer.clearData()
    this.gazeHistory = []
  }

  // Validate precision after calibration
  async validatePrecision(testPoints: Array<{ x: number; y: number }>): Promise<number> {
    const errors: number[] = []

    for (const testPoint of testPoints) {
      const prediction = await this.getCurrentPrediction()
      if (prediction) {
        const error = Math.sqrt(
          Math.pow(prediction.x - testPoint.x, 2) +
          Math.pow(prediction.y - testPoint.y, 2)
        )
        errors.push(error)
      }
    }

    if (errors.length === 0) return 0

    const avgError = errors.reduce((sum, err) => sum + err, 0) / errors.length

    // Convert to percentage (lower error = higher precision)
    // Assume 200px error = 0% precision, 0px error = 100% precision
    const precision = Math.max(0, Math.min(100, 100 - (avgError / 2)))

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
    this.gazeHistory = []
  }
}

export const eyeTrackingService = new EyeTrackingService()
