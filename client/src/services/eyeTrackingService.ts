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

      // Configure WebGazer
      webgazer.showVideoPreview(true)
      webgazer.showPredictionPoints(true)
      webgazer.applyKalmanFilter(true) // Smooth predictions

      this.isInitialized = true
      console.log('Eye tracking initialized')
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
    // WebGazer automatically improves with user clicks
    webgazer.recordScreenPosition(x, y)
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
