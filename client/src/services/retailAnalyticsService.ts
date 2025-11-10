import { GazeData, EmotionData } from '../store/trackingStore'
import { ProductZone, ProductMetrics } from '../store/retailStore'

interface FixationEvent {
  productId: string
  startTime: number
  endTime: number
  duration: number
  gazePoints: GazeData[]
}

class RetailAnalyticsService {
  private fixationThreshold = 100 // pixels - max movement for fixation
  private fixationMinDuration = 100 // ms - minimum fixation duration
  private sessionStartTime: number = 0
  private productFirstViews: Map<string, number> = new Map()
  private currentFixation: FixationEvent | null = null
  private productFixations: Map<string, FixationEvent[]> = new Map()

  startSession() {
    this.sessionStartTime = Date.now()
    this.productFirstViews.clear()
    this.currentFixation = null
    this.productFixations.clear()
  }

  /**
   * Detect which product zone the gaze is currently on
   */
  detectProductFromGaze(
    gaze: GazeData,
    productZones: ProductZone[],
    shelfDimensions?: { width: number; height: number }
  ): string | null {
    if (!shelfDimensions) return null

    for (const zone of productZones) {
      // Convert zone coordinates (relative to shelf image) to screen coordinates
      const zoneLeft = zone.x
      const zoneTop = zone.y
      const zoneRight = zone.x + zone.width
      const zoneBottom = zone.y + zone.height

      if (
        gaze.x >= zoneLeft &&
        gaze.x <= zoneRight &&
        gaze.y >= zoneTop &&
        gaze.y <= zoneBottom
      ) {
        return zone.id
      }
    }

    return null
  }

  /**
   * Process gaze data to detect fixations on products
   */
  processGazeForProduct(
    gazeData: GazeData[],
    productZones: ProductZone[],
    shelfDimensions?: { width: number; height: number }
  ): Map<string, FixationEvent[]> {
    if (!shelfDimensions || gazeData.length === 0) {
      return this.productFixations
    }

    gazeData.forEach((gaze, index) => {
      const productId = this.detectProductFromGaze(gaze, productZones, shelfDimensions)

      if (productId) {
        // Check if we're continuing a fixation or starting a new one
        if (this.currentFixation && this.currentFixation.productId === productId) {
          // Continue current fixation
          const lastGaze = this.currentFixation.gazePoints[this.currentFixation.gazePoints.length - 1]
          const distance = Math.sqrt(
            Math.pow(gaze.x - lastGaze.x, 2) + Math.pow(gaze.y - lastGaze.y, 2)
          )

          if (distance <= this.fixationThreshold) {
            this.currentFixation.gazePoints.push(gaze)
            this.currentFixation.endTime = gaze.timestamp
            this.currentFixation.duration = this.currentFixation.endTime - this.currentFixation.startTime
          } else {
            // Movement too large, end current fixation and start new one
            this.endCurrentFixation()
            this.startNewFixation(productId, gaze)
          }
        } else {
          // End previous fixation (if any) and start new one
          this.endCurrentFixation()
          this.startNewFixation(productId, gaze)
        }

        // Record first view
        if (!this.productFirstViews.has(productId)) {
          this.productFirstViews.set(productId, gaze.timestamp)
        }
      } else {
        // Not looking at any product, end current fixation
        this.endCurrentFixation()
      }
    })

    return this.productFixations
  }

  private startNewFixation(productId: string, gaze: GazeData) {
    this.currentFixation = {
      productId,
      startTime: gaze.timestamp,
      endTime: gaze.timestamp,
      duration: 0,
      gazePoints: [gaze]
    }
  }

  private endCurrentFixation() {
    if (this.currentFixation && this.currentFixation.duration >= this.fixationMinDuration) {
      // Store the fixation
      const productId = this.currentFixation.productId
      if (!this.productFixations.has(productId)) {
        this.productFixations.set(productId, [])
      }
      this.productFixations.get(productId)!.push(this.currentFixation)
    }
    this.currentFixation = null
  }

  /**
   * Calculate comprehensive metrics for each product
   */
  calculateProductMetrics(
    productZones: ProductZone[],
    gazeData: GazeData[],
    emotionData: EmotionData[],
    shelfDimensions?: { width: number; height: number }
  ): Map<string, ProductMetrics> {
    const metrics = new Map<string, ProductMetrics>()

    // Process all gaze data
    this.processGazeForProduct(gazeData, productZones, shelfDimensions)

    // End any ongoing fixation
    this.endCurrentFixation()

    // Calculate metrics for each product
    productZones.forEach((zone, index) => {
      const productId = zone.id
      const fixations = this.productFixations.get(productId) || []
      const firstViewTime = this.productFirstViews.get(productId)

      // Basic fixation metrics
      const totalFixationTime = fixations.reduce((sum, f) => sum + f.duration, 0)
      const fixationCount = fixations.length
      const averageFixationDuration = fixationCount > 0 ? totalFixationTime / fixationCount : 0

      // Time to first fixation
      const timeToFirstFixation = firstViewTime
        ? firstViewTime - this.sessionStartTime
        : null

      // View order
      const viewOrder = firstViewTime
        ? Array.from(this.productFirstViews.entries())
            .sort((a, b) => a[1] - b[1])
            .findIndex(([id]) => id === productId) + 1
        : null

      // Visited metrics
      const visited = fixationCount > 0
      const revisited = fixationCount > 1

      // Calculate attention score based on fixation time and emotion data
      const attentionScore = this.calculateAttentionScore(
        fixations,
        emotionData,
        totalFixationTime
      )

      // Calculate interest score
      const interestScore = this.calculateInterestScore(
        fixations,
        emotionData,
        totalFixationTime
      )

      // Calculate engagement score
      const engagementScore = this.calculateEngagementScore(
        fixations,
        emotionData,
        totalFixationTime
      )

      metrics.set(productId, {
        productId,
        productName: zone.name,
        timeToFirstFixation,
        totalFixationTime,
        fixationCount,
        averageFixationDuration,
        attentionScore,
        interestScore,
        engagementScore,
        visited,
        revisited,
        viewOrder
      })
    })

    return metrics
  }

  private calculateAttentionScore(
    fixations: FixationEvent[],
    emotionData: EmotionData[],
    totalFixationTime: number
  ): number {
    if (fixations.length === 0) return 0

    // Get average attention during fixations
    const fixationAttention = fixations.map(fix => {
      const emotionsInFixation = emotionData.filter(
        e => e.timestamp >= fix.startTime && e.timestamp <= fix.endTime
      )
      if (emotionsInFixation.length === 0) return 0
      return emotionsInFixation.reduce((sum, e) => sum + e.attention, 0) / emotionsInFixation.length
    })

    const avgAttention = fixationAttention.reduce((sum, a) => sum + a, 0) / fixationAttention.length

    // Weight by total fixation time (more time = higher score)
    const timeWeight = Math.min(100, (totalFixationTime / 5000) * 50) // 5s = 50 points max

    return Math.round(avgAttention * 0.6 + timeWeight * 0.4)
  }

  private calculateInterestScore(
    fixations: FixationEvent[],
    emotionData: EmotionData[],
    totalFixationTime: number
  ): number {
    if (fixations.length === 0) return 0

    // Get average interest during fixations
    const fixationInterest = fixations.map(fix => {
      const emotionsInFixation = emotionData.filter(
        e => e.timestamp >= fix.startTime && e.timestamp <= fix.endTime
      )
      if (emotionsInFixation.length === 0) return 0
      return emotionsInFixation.reduce((sum, e) => sum + e.interest, 0) / emotionsInFixation.length
    })

    const avgInterest = fixationInterest.reduce((sum, i) => sum + i, 0) / fixationInterest.length

    // Bonus for revisiting (shows sustained interest)
    const revisitBonus = fixations.length > 1 ? 10 : 0

    return Math.round(Math.min(100, avgInterest + revisitBonus))
  }

  private calculateEngagementScore(
    fixations: FixationEvent[],
    emotionData: EmotionData[],
    totalFixationTime: number
  ): number {
    if (fixations.length === 0) return 0

    // Get average engagement during fixations
    const fixationEngagement = fixations.map(fix => {
      const emotionsInFixation = emotionData.filter(
        e => e.timestamp >= fix.startTime && e.timestamp <= fix.endTime
      )
      if (emotionsInFixation.length === 0) return 0
      return emotionsInFixation.reduce((sum, e) => sum + e.engagement, 0) / emotionsInFixation.length
    })

    const avgEngagement = fixationEngagement.reduce((sum, e) => sum + e, 0) / fixationEngagement.length

    // Weight by number and duration of fixations
    const fixationQuality = Math.min(100, (fixations.length * 10) + (totalFixationTime / 100))

    return Math.round(avgEngagement * 0.7 + fixationQuality * 0.3)
  }

  /**
   * Generate heatmap data for a specific product zone
   */
  getProductHeatmap(
    productId: string,
    gazeData: GazeData[],
    productZone: ProductZone
  ): Array<{ x: number; y: number; value: number }> {
    const fixations = this.productFixations.get(productId) || []
    const heatmapData: Array<{ x: number; y: number; value: number }> = []

    fixations.forEach(fixation => {
      fixation.gazePoints.forEach(gaze => {
        // Convert to relative coordinates within the product zone
        const relativeX = gaze.x - productZone.x
        const relativeY = gaze.y - productZone.y

        if (relativeX >= 0 && relativeX <= productZone.width &&
            relativeY >= 0 && relativeY <= productZone.height) {
          heatmapData.push({
            x: relativeX,
            y: relativeY,
            value: 1
          })
        }
      })
    })

    return heatmapData
  }

  /**
   * Compare metrics between two shelf variants (A/B test)
   */
  compareVariants(
    variantAMetrics: Map<string, ProductMetrics>,
    variantBMetrics: Map<string, ProductMetrics>
  ) {
    const comparison: any = {
      variantA: {
        totalProductsViewed: 0,
        averageTimeToFirstFixation: 0,
        averageAttention: 0,
        averageInterest: 0,
        averageEngagement: 0,
        topProducts: [] as any[]
      },
      variantB: {
        totalProductsViewed: 0,
        averageTimeToFirstFixation: 0,
        averageAttention: 0,
        averageInterest: 0,
        averageEngagement: 0,
        topProducts: [] as any[]
      },
      winner: null as 'A' | 'B' | 'tie' | null
    }

    // Calculate for variant A
    const metricsA = Array.from(variantAMetrics.values())
    comparison.variantA.totalProductsViewed = metricsA.filter(m => m.visited).length
    comparison.variantA.averageTimeToFirstFixation = this.average(
      metricsA.map(m => m.timeToFirstFixation).filter(t => t !== null) as number[]
    )
    comparison.variantA.averageAttention = this.average(metricsA.map(m => m.attentionScore))
    comparison.variantA.averageInterest = this.average(metricsA.map(m => m.interestScore))
    comparison.variantA.averageEngagement = this.average(metricsA.map(m => m.engagementScore))
    comparison.variantA.topProducts = metricsA
      .sort((a, b) => b.attentionScore - a.attentionScore)
      .slice(0, 3)

    // Calculate for variant B
    const metricsB = Array.from(variantBMetrics.values())
    comparison.variantB.totalProductsViewed = metricsB.filter(m => m.visited).length
    comparison.variantB.averageTimeToFirstFixation = this.average(
      metricsB.map(m => m.timeToFirstFixation).filter(t => t !== null) as number[]
    )
    comparison.variantB.averageAttention = this.average(metricsB.map(m => m.attentionScore))
    comparison.variantB.averageInterest = this.average(metricsB.map(m => m.interestScore))
    comparison.variantB.averageEngagement = this.average(metricsB.map(m => m.engagementScore))
    comparison.variantB.topProducts = metricsB
      .sort((a, b) => b.attentionScore - a.attentionScore)
      .slice(0, 3)

    // Determine winner
    const scoreA = comparison.variantA.averageAttention +
                   comparison.variantA.averageInterest +
                   comparison.variantA.averageEngagement
    const scoreB = comparison.variantB.averageAttention +
                   comparison.variantB.averageInterest +
                   comparison.variantB.averageEngagement

    if (Math.abs(scoreA - scoreB) < 10) {
      comparison.winner = 'tie'
    } else {
      comparison.winner = scoreA > scoreB ? 'A' : 'B'
    }

    return comparison
  }

  private average(values: number[]): number {
    if (values.length === 0) return 0
    return values.reduce((sum, val) => sum + val, 0) / values.length
  }

  reset() {
    this.sessionStartTime = 0
    this.productFirstViews.clear()
    this.currentFixation = null
    this.productFixations.clear()
  }
}

export const retailAnalyticsService = new RetailAnalyticsService()
