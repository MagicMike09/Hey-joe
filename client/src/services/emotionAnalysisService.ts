import { GazeData, EEGData, EmotionData } from '../store/trackingStore'

interface AnalysisWindow {
  gazeData: GazeData[]
  eegData: EEGData[]
  startTime: number
}

class EmotionAnalysisService {
  private analysisWindow: AnalysisWindow = {
    gazeData: [],
    eegData: [],
    startTime: Date.now()
  }

  private readonly WINDOW_SIZE = 5000 // 5 seconds
  private readonly MIN_DATA_POINTS = 10

  /**
   * Analyze emotions based on gaze and EEG data
   */
  analyzeEmotion(gazeData: GazeData[], eegData: EEGData[]): EmotionData {
    // Update analysis window
    this.updateWindow(gazeData, eegData)

    // Calculate each emotional dimension
    const attention = this.calculateAttention(this.analysisWindow.eegData)
    const engagement = this.calculateEngagement(
      this.analysisWindow.gazeData,
      this.analysisWindow.eegData
    )
    const stress = this.calculateStress(this.analysisWindow.eegData)
    const interest = this.calculateInterest(
      this.analysisWindow.gazeData,
      this.analysisWindow.eegData
    )

    return {
      attention,
      engagement,
      stress,
      interest,
      timestamp: Date.now()
    }
  }

  private updateWindow(gazeData: GazeData[], eegData: EEGData[]) {
    const now = Date.now()
    const cutoffTime = now - this.WINDOW_SIZE

    // Add new data
    this.analysisWindow.gazeData.push(...gazeData)
    this.analysisWindow.eegData.push(...eegData)

    // Remove old data
    this.analysisWindow.gazeData = this.analysisWindow.gazeData.filter(
      d => d.timestamp > cutoffTime
    )
    this.analysisWindow.eegData = this.analysisWindow.eegData.filter(
      d => d.timestamp > cutoffTime
    )
  }

  /**
   * Calculate attention level based on beta/alpha ratio
   * High attention: high beta (active thinking) and moderate alpha
   */
  private calculateAttention(eegData: EEGData[]): number {
    if (eegData.length < this.MIN_DATA_POINTS) return 0

    const recentData = eegData.slice(-20) // Last 2 seconds at 10Hz
    const avgBeta = this.average(recentData.map(d => d.beta))
    const avgAlpha = this.average(recentData.map(d => d.alpha))

    // Beta/Alpha ratio indicates attention
    // Normalize to 0-100 scale
    const betaAlphaRatio = avgBeta / (avgAlpha + 1)
    const attention = Math.min(100, (betaAlphaRatio / 2) * 100)

    return Math.round(attention)
  }

  /**
   * Calculate engagement based on gaze fixations and beta waves
   * High engagement: stable gaze + high beta activity
   */
  private calculateEngagement(gazeData: GazeData[], eegData: EEGData[]): number {
    if (gazeData.length < this.MIN_DATA_POINTS || eegData.length < this.MIN_DATA_POINTS) {
      return 0
    }

    // Gaze stability (low variance = high engagement)
    const gazeStability = this.calculateGazeStability(gazeData)

    // Beta power (higher = more engaged)
    const recentEEG = eegData.slice(-20)
    const avgBeta = this.average(recentEEG.map(d => d.beta))
    const betaNormalized = Math.min(100, (avgBeta / 60) * 100)

    // Combine metrics (weighted average)
    const engagement = gazeStability * 0.6 + betaNormalized * 0.4

    return Math.round(engagement)
  }

  /**
   * Calculate stress level based on beta/theta ratio and gaze jitter
   * High stress: high beta, low theta, erratic gaze
   */
  private calculateStress(eegData: EEGData[]): number {
    if (eegData.length < this.MIN_DATA_POINTS) return 0

    const recentData = eegData.slice(-20)
    const avgBeta = this.average(recentData.map(d => d.beta))
    const avgTheta = this.average(recentData.map(d => d.theta))

    // High beta + low theta = stress
    const stressRatio = avgBeta / (avgTheta + 1)
    const stress = Math.min(100, (stressRatio / 3) * 100)

    return Math.round(stress)
  }

  /**
   * Calculate interest based on fixation duration and gamma waves
   * High interest: long fixations + gamma activity
   */
  private calculateInterest(gazeData: GazeData[], eegData: EEGData[]): number {
    if (gazeData.length < this.MIN_DATA_POINTS || eegData.length < this.MIN_DATA_POINTS) {
      return 0
    }

    // Fixation duration
    const fixationScore = this.calculateFixationDuration(gazeData)

    // Gamma power (associated with attention and interest)
    const recentEEG = eegData.slice(-20)
    const avgGamma = this.average(recentEEG.map(d => d.gamma))
    const gammaNormalized = Math.min(100, (avgGamma / 30) * 100)

    // Combine metrics
    const interest = fixationScore * 0.5 + gammaNormalized * 0.5

    return Math.round(interest)
  }

  /**
   * Calculate gaze stability (0-100)
   * Lower variance in gaze position = higher stability
   */
  private calculateGazeStability(gazeData: GazeData[]): number {
    if (gazeData.length < 2) return 0

    const recentGaze = gazeData.slice(-30) // Last 3 seconds at 10Hz

    // Calculate movement variance
    let totalMovement = 0
    for (let i = 1; i < recentGaze.length; i++) {
      const dx = recentGaze[i].x - recentGaze[i - 1].x
      const dy = recentGaze[i].y - recentGaze[i - 1].y
      totalMovement += Math.sqrt(dx * dx + dy * dy)
    }

    const avgMovement = totalMovement / recentGaze.length

    // Convert to stability score (inverse of movement)
    // Lower movement = higher stability
    const stability = Math.max(0, 100 - avgMovement / 5)

    return Math.round(stability)
  }

  /**
   * Calculate fixation duration score (0-100)
   * Longer fixations indicate more interest
   */
  private calculateFixationDuration(gazeData: GazeData[]): number {
    if (gazeData.length < 2) return 0

    const FIXATION_THRESHOLD = 50 // pixels
    const recentGaze = gazeData.slice(-30)

    let fixationTime = 0
    let currentFixationStart = recentGaze[0].timestamp

    for (let i = 1; i < recentGaze.length; i++) {
      const dx = recentGaze[i].x - recentGaze[i - 1].x
      const dy = recentGaze[i].y - recentGaze[i - 1].y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < FIXATION_THRESHOLD) {
        // Still fixating
        fixationTime += recentGaze[i].timestamp - recentGaze[i - 1].timestamp
      } else {
        // Saccade (quick movement)
        currentFixationStart = recentGaze[i].timestamp
      }
    }

    // Normalize to 0-100 (assume max fixation of 3 seconds)
    const score = Math.min(100, (fixationTime / 3000) * 100)

    return Math.round(score)
  }

  /**
   * Get heatmap data for visualization
   */
  getHeatmapData(gazeData: GazeData[]): Array<{ x: number; y: number; value: number }> {
    const GRID_SIZE = 50
    const width = window.innerWidth
    const height = window.innerHeight

    // Create grid
    const grid: number[][] = Array(Math.ceil(height / GRID_SIZE))
      .fill(0)
      .map(() => Array(Math.ceil(width / GRID_SIZE)).fill(0))

    // Populate grid with gaze points
    gazeData.forEach(point => {
      const gridX = Math.floor(point.x / GRID_SIZE)
      const gridY = Math.floor(point.y / GRID_SIZE)

      if (gridY >= 0 && gridY < grid.length && gridX >= 0 && gridX < grid[0].length) {
        grid[gridY][gridX]++
      }
    })

    // Convert to heatmap format
    const heatmapData: Array<{ x: number; y: number; value: number }> = []
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        if (grid[y][x] > 0) {
          heatmapData.push({
            x: x * GRID_SIZE + GRID_SIZE / 2,
            y: y * GRID_SIZE + GRID_SIZE / 2,
            value: grid[y][x]
          })
        }
      }
    }

    return heatmapData
  }

  private average(values: number[]): number {
    if (values.length === 0) return 0
    return values.reduce((sum, val) => sum + val, 0) / values.length
  }
}

export const emotionAnalysisService = new EmotionAnalysisService()
