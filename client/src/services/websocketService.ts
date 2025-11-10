import { io, Socket } from 'socket.io-client'
import { GazeData, EEGData, EmotionData } from '../store/trackingStore'

class WebSocketService {
  private socket: Socket | null = null
  private currentSessionId: string | null = null
  private isConnected = false

  connect() {
    const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'

    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    })

    this.socket.on('connect', () => {
      console.log('✅ Connected to server')
      this.isConnected = true
    })

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from server')
      this.isConnected = false
    })

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error)
    })

    // Session events
    this.socket.on('session:started', (data: { sessionId: string }) => {
      console.log('Session started:', data.sessionId)
    })

    this.socket.on('session:ended', (data: { sessionId: string }) => {
      console.log('Session ended:', data.sessionId)
    })

    this.socket.on('session:error', (data: { error: string }) => {
      console.error('Session error:', data.error)
    })

    // Pong response
    this.socket.on('pong', () => {
      // Connection is healthy
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
    }
  }

  startSession(metadata?: object): string {
    if (!this.socket || !this.isConnected) {
      throw new Error('Not connected to server')
    }

    const sessionId = this.generateSessionId()
    this.currentSessionId = sessionId

    this.socket.emit('session:start', { sessionId, metadata })

    return sessionId
  }

  endSession() {
    if (!this.socket || !this.currentSessionId) return

    this.socket.emit('session:end')
    this.currentSessionId = null
  }

  sendGazeData(data: GazeData | GazeData[]) {
    if (!this.socket || !this.currentSessionId) return

    this.socket.emit('data:gaze', data)
  }

  sendEEGData(data: EEGData | EEGData[]) {
    if (!this.socket || !this.currentSessionId) return

    this.socket.emit('data:eeg', data)
  }

  sendEmotionData(data: EmotionData | EmotionData[]) {
    if (!this.socket || !this.currentSessionId) return

    this.socket.emit('data:emotion', data)
  }

  getSessionId(): string | null {
    return this.currentSessionId
  }

  getConnectionStatus(): boolean {
    return this.isConnected
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Health check
  ping() {
    if (this.socket) {
      this.socket.emit('ping')
    }
  }
}

export const websocketService = new WebSocketService()
