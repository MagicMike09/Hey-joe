import { Server, Socket } from 'socket.io'
import { Database } from './database.js'

interface GazeData {
  x: number
  y: number
  timestamp: number
}

interface EEGData {
  alpha: number
  beta: number
  theta: number
  delta: number
  gamma: number
  timestamp: number
}

interface EmotionData {
  attention: number
  engagement: number
  stress: number
  interest: number
  timestamp: number
}

// Store active sessions
const activeSessions = new Map<string, string>() // socketId -> sessionId

export function setupSocketHandlers(io: Server, db: Database) {
  io.on('connection', (socket: Socket) => {
    console.log(`✅ Client connected: ${socket.id}`)

    // Start session
    socket.on('session:start', (data: { sessionId: string; metadata?: object }) => {
      try {
        const { sessionId, metadata } = data

        // Create session in database
        db.createSession(sessionId, metadata)

        // Store session mapping
        activeSessions.set(socket.id, sessionId)

        // Join room for this session
        socket.join(sessionId)

        console.log(`📝 Session started: ${sessionId}`)
        socket.emit('session:started', { sessionId })
      } catch (error) {
        console.error('Error starting session:', error)
        socket.emit('session:error', { error: 'Failed to start session' })
      }
    })

    // End session
    socket.on('session:end', () => {
      try {
        const sessionId = activeSessions.get(socket.id)

        if (sessionId) {
          db.endSession(sessionId)
          activeSessions.delete(socket.id)
          socket.leave(sessionId)

          console.log(`🏁 Session ended: ${sessionId}`)
          socket.emit('session:ended', { sessionId })
        }
      } catch (error) {
        console.error('Error ending session:', error)
        socket.emit('session:error', { error: 'Failed to end session' })
      }
    })

    // Receive gaze data
    socket.on('data:gaze', (data: GazeData | GazeData[]) => {
      try {
        const sessionId = activeSessions.get(socket.id)
        if (!sessionId) return

        const gazeArray = Array.isArray(data) ? data : [data]

        // Insert into database
        const records = gazeArray.map(d => ({
          sessionId,
          timestamp: d.timestamp,
          x: d.x,
          y: d.y
        }))

        db.insertGazeDataBatch(records)

        // Broadcast to other clients in the same session (for monitoring)
        socket.to(sessionId).emit('data:gaze', data)
      } catch (error) {
        console.error('Error processing gaze data:', error)
      }
    })

    // Receive EEG data
    socket.on('data:eeg', (data: EEGData | EEGData[]) => {
      try {
        const sessionId = activeSessions.get(socket.id)
        if (!sessionId) return

        const eegArray = Array.isArray(data) ? data : [data]

        // Insert into database
        const records = eegArray.map(d => ({
          sessionId,
          timestamp: d.timestamp,
          alpha: d.alpha,
          beta: d.beta,
          theta: d.theta,
          delta: d.delta,
          gamma: d.gamma
        }))

        db.insertEEGDataBatch(records)

        // Broadcast to other clients
        socket.to(sessionId).emit('data:eeg', data)
      } catch (error) {
        console.error('Error processing EEG data:', error)
      }
    })

    // Receive emotion data
    socket.on('data:emotion', (data: EmotionData | EmotionData[]) => {
      try {
        const sessionId = activeSessions.get(socket.id)
        if (!sessionId) return

        const emotionArray = Array.isArray(data) ? data : [data]

        // Insert into database
        const records = emotionArray.map(d => ({
          sessionId,
          timestamp: d.timestamp,
          attention: d.attention,
          engagement: d.engagement,
          stress: d.stress,
          interest: d.interest
        }))

        db.insertEmotionDataBatch(records)

        // Broadcast to other clients
        socket.to(sessionId).emit('data:emotion', data)
      } catch (error) {
        console.error('Error processing emotion data:', error)
      }
    })

    // Handle disconnection
    socket.on('disconnect', () => {
      const sessionId = activeSessions.get(socket.id)

      if (sessionId) {
        // Auto-end session on disconnect
        db.endSession(sessionId)
        activeSessions.delete(socket.id)
        console.log(`🔌 Client disconnected, session ended: ${sessionId}`)
      } else {
        console.log(`🔌 Client disconnected: ${socket.id}`)
      }
    })

    // Ping/pong for connection health check
    socket.on('ping', () => {
      socket.emit('pong')
    })
  })

  console.log('🔌 Socket.io handlers registered')
}
