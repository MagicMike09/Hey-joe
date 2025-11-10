import { Express, Request, Response } from 'express'
import { Database } from './database.js'

export function setupRoutes(app: Express, db: Database) {
  // Get all sessions
  app.get('/api/sessions', (req: Request, res: Response) => {
    try {
      const sessions = db.getAllSessions()
      res.json(sessions)
    } catch (error) {
      console.error('Error fetching sessions:', error)
      res.status(500).json({ error: 'Failed to fetch sessions' })
    }
  })

  // Get session by ID
  app.get('/api/sessions/:id', (req: Request, res: Response) => {
    try {
      const session = db.getSession(req.params.id)
      if (!session) {
        return res.status(404).json({ error: 'Session not found' })
      }
      res.json(session)
    } catch (error) {
      console.error('Error fetching session:', error)
      res.status(500).json({ error: 'Failed to fetch session' })
    }
  })

  // Get session data (gaze, EEG, emotion)
  app.get('/api/sessions/:id/data', (req: Request, res: Response) => {
    try {
      const sessionId = req.params.id
      const session = db.getSession(sessionId)

      if (!session) {
        return res.status(404).json({ error: 'Session not found' })
      }

      const gazeData = db.getGazeData(sessionId)
      const eegData = db.getEEGData(sessionId)
      const emotionData = db.getEmotionData(sessionId)
      const stats = db.getSessionStats(sessionId)

      res.json({
        session,
        gazeData,
        eegData,
        emotionData,
        stats
      })
    } catch (error) {
      console.error('Error fetching session data:', error)
      res.status(500).json({ error: 'Failed to fetch session data' })
    }
  })

  // Get session statistics
  app.get('/api/sessions/:id/stats', (req: Request, res: Response) => {
    try {
      const stats = db.getSessionStats(req.params.id)
      res.json(stats)
    } catch (error) {
      console.error('Error fetching session stats:', error)
      res.status(500).json({ error: 'Failed to fetch session stats' })
    }
  })

  // Create new session
  app.post('/api/sessions', (req: Request, res: Response) => {
    try {
      const { id, metadata } = req.body

      if (!id) {
        return res.status(400).json({ error: 'Session ID is required' })
      }

      db.createSession(id, metadata)
      res.status(201).json({ id, message: 'Session created' })
    } catch (error) {
      console.error('Error creating session:', error)
      res.status(500).json({ error: 'Failed to create session' })
    }
  })

  // End session
  app.post('/api/sessions/:id/end', (req: Request, res: Response) => {
    try {
      db.endSession(req.params.id)
      res.json({ message: 'Session ended' })
    } catch (error) {
      console.error('Error ending session:', error)
      res.status(500).json({ error: 'Failed to end session' })
    }
  })

  // Export session data
  app.get('/api/sessions/:id/export', (req: Request, res: Response) => {
    try {
      const sessionId = req.params.id
      const session = db.getSession(sessionId)

      if (!session) {
        return res.status(404).json({ error: 'Session not found' })
      }

      const gazeData = db.getGazeData(sessionId)
      const eegData = db.getEEGData(sessionId)
      const emotionData = db.getEmotionData(sessionId)
      const stats = db.getSessionStats(sessionId)

      const exportData = {
        session,
        data: {
          gaze: gazeData,
          eeg: eegData,
          emotion: emotionData
        },
        stats,
        exportedAt: new Date().toISOString()
      }

      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Content-Disposition', `attachment; filename="session-${sessionId}.json"`)
      res.json(exportData)
    } catch (error) {
      console.error('Error exporting session:', error)
      res.status(500).json({ error: 'Failed to export session' })
    }
  })

  // Analytics endpoint - aggregate data across all sessions
  app.get('/api/analytics', (req: Request, res: Response) => {
    try {
      const sessions = db.getAllSessions()
      const analytics = {
        totalSessions: sessions.length,
        sessions: sessions.map(session => ({
          id: session.id,
          startTime: session.startTime,
          endTime: session.endTime,
          duration: session.endTime ? session.endTime - session.startTime : null,
          stats: db.getSessionStats(session.id)
        }))
      }

      res.json(analytics)
    } catch (error) {
      console.error('Error fetching analytics:', error)
      res.status(500).json({ error: 'Failed to fetch analytics' })
    }
  })
}
