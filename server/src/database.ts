import DatabaseConstructor from 'better-sqlite3'
import { mkdir } from 'fs/promises'
import { dirname } from 'path'

interface Session {
  id: string
  startTime: number
  endTime?: number
  metadata?: string
}

interface GazeRecord {
  sessionId: string
  timestamp: number
  x: number
  y: number
}

interface EEGRecord {
  sessionId: string
  timestamp: number
  alpha: number
  beta: number
  theta: number
  delta: number
  gamma: number
}

interface EmotionRecord {
  sessionId: string
  timestamp: number
  attention: number
  engagement: number
  stress: number
  interest: number
}

export class Database {
  private db: DatabaseConstructor.Database

  constructor(dbPath: string = './data/sessions.db') {
    this.initializeDatabase(dbPath)
    this.db = new DatabaseConstructor(dbPath)
    this.createTables()
  }

  private async initializeDatabase(dbPath: string) {
    try {
      await mkdir(dirname(dbPath), { recursive: true })
    } catch (error) {
      console.error('Failed to create database directory:', error)
    }
  }

  private createTables() {
    // Sessions table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        start_time INTEGER NOT NULL,
        end_time INTEGER,
        metadata TEXT
      )
    `)

    // Gaze data table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS gaze_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        x REAL NOT NULL,
        y REAL NOT NULL,
        FOREIGN KEY (session_id) REFERENCES sessions(id)
      )
    `)

    // EEG data table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS eeg_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        alpha REAL NOT NULL,
        beta REAL NOT NULL,
        theta REAL NOT NULL,
        delta REAL NOT NULL,
        gamma REAL NOT NULL,
        FOREIGN KEY (session_id) REFERENCES sessions(id)
      )
    `)

    // Emotion data table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS emotion_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        attention REAL NOT NULL,
        engagement REAL NOT NULL,
        stress REAL NOT NULL,
        interest REAL NOT NULL,
        FOREIGN KEY (session_id) REFERENCES sessions(id)
      )
    `)

    // Create indexes for better query performance
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_gaze_session ON gaze_data(session_id);
      CREATE INDEX IF NOT EXISTS idx_eeg_session ON eeg_data(session_id);
      CREATE INDEX IF NOT EXISTS idx_emotion_session ON emotion_data(session_id);
    `)

    console.log('✅ Database tables created')
  }

  // Session methods
  createSession(id: string, metadata?: object): void {
    const stmt = this.db.prepare(
      'INSERT INTO sessions (id, start_time, metadata) VALUES (?, ?, ?)'
    )
    stmt.run(id, Date.now(), metadata ? JSON.stringify(metadata) : null)
  }

  endSession(id: string): void {
    const stmt = this.db.prepare('UPDATE sessions SET end_time = ? WHERE id = ?')
    stmt.run(Date.now(), id)
  }

  getSession(id: string): Session | undefined {
    const stmt = this.db.prepare('SELECT * FROM sessions WHERE id = ?')
    return stmt.get(id) as Session | undefined
  }

  getAllSessions(): Session[] {
    const stmt = this.db.prepare('SELECT * FROM sessions ORDER BY start_time DESC')
    return stmt.all() as Session[]
  }

  // Gaze data methods
  insertGazeData(data: GazeRecord): void {
    const stmt = this.db.prepare(
      'INSERT INTO gaze_data (session_id, timestamp, x, y) VALUES (?, ?, ?, ?)'
    )
    stmt.run(data.sessionId, data.timestamp, data.x, data.y)
  }

  insertGazeDataBatch(data: GazeRecord[]): void {
    const insert = this.db.prepare(
      'INSERT INTO gaze_data (session_id, timestamp, x, y) VALUES (?, ?, ?, ?)'
    )
    const insertMany = this.db.transaction((records: GazeRecord[]) => {
      for (const record of records) {
        insert.run(record.sessionId, record.timestamp, record.x, record.y)
      }
    })
    insertMany(data)
  }

  getGazeData(sessionId: string): GazeRecord[] {
    const stmt = this.db.prepare(
      'SELECT session_id, timestamp, x, y FROM gaze_data WHERE session_id = ? ORDER BY timestamp'
    )
    return stmt.all(sessionId) as GazeRecord[]
  }

  // EEG data methods
  insertEEGData(data: EEGRecord): void {
    const stmt = this.db.prepare(
      'INSERT INTO eeg_data (session_id, timestamp, alpha, beta, theta, delta, gamma) VALUES (?, ?, ?, ?, ?, ?, ?)'
    )
    stmt.run(data.sessionId, data.timestamp, data.alpha, data.beta, data.theta, data.delta, data.gamma)
  }

  insertEEGDataBatch(data: EEGRecord[]): void {
    const insert = this.db.prepare(
      'INSERT INTO eeg_data (session_id, timestamp, alpha, beta, theta, delta, gamma) VALUES (?, ?, ?, ?, ?, ?, ?)'
    )
    const insertMany = this.db.transaction((records: EEGRecord[]) => {
      for (const record of records) {
        insert.run(
          record.sessionId,
          record.timestamp,
          record.alpha,
          record.beta,
          record.theta,
          record.delta,
          record.gamma
        )
      }
    })
    insertMany(data)
  }

  getEEGData(sessionId: string): EEGRecord[] {
    const stmt = this.db.prepare(
      'SELECT session_id, timestamp, alpha, beta, theta, delta, gamma FROM eeg_data WHERE session_id = ? ORDER BY timestamp'
    )
    return stmt.all(sessionId) as EEGRecord[]
  }

  // Emotion data methods
  insertEmotionData(data: EmotionRecord): void {
    const stmt = this.db.prepare(
      'INSERT INTO emotion_data (session_id, timestamp, attention, engagement, stress, interest) VALUES (?, ?, ?, ?, ?, ?)'
    )
    stmt.run(data.sessionId, data.timestamp, data.attention, data.engagement, data.stress, data.interest)
  }

  insertEmotionDataBatch(data: EmotionRecord[]): void {
    const insert = this.db.prepare(
      'INSERT INTO emotion_data (session_id, timestamp, attention, engagement, stress, interest) VALUES (?, ?, ?, ?, ?, ?)'
    )
    const insertMany = this.db.transaction((records: EmotionRecord[]) => {
      for (const record of records) {
        insert.run(
          record.sessionId,
          record.timestamp,
          record.attention,
          record.engagement,
          record.stress,
          record.interest
        )
      }
    })
    insertMany(data)
  }

  getEmotionData(sessionId: string): EmotionRecord[] {
    const stmt = this.db.prepare(
      'SELECT session_id, timestamp, attention, engagement, stress, interest FROM emotion_data WHERE session_id = ? ORDER BY timestamp'
    )
    return stmt.all(sessionId) as EmotionRecord[]
  }

  // Analytics methods
  getSessionStats(sessionId: string) {
    const gazeCount = this.db.prepare('SELECT COUNT(*) as count FROM gaze_data WHERE session_id = ?').get(sessionId) as { count: number }
    const eegCount = this.db.prepare('SELECT COUNT(*) as count FROM eeg_data WHERE session_id = ?').get(sessionId) as { count: number }
    const emotionCount = this.db.prepare('SELECT COUNT(*) as count FROM emotion_data WHERE session_id = ?').get(sessionId) as { count: number }

    const avgEmotions = this.db.prepare(`
      SELECT
        AVG(attention) as avg_attention,
        AVG(engagement) as avg_engagement,
        AVG(stress) as avg_stress,
        AVG(interest) as avg_interest
      FROM emotion_data
      WHERE session_id = ?
    `).get(sessionId)

    return {
      gazePoints: gazeCount.count,
      eegPoints: eegCount.count,
      emotionPoints: emotionCount.count,
      averageEmotions: avgEmotions
    }
  }

  close() {
    this.db.close()
    console.log('Database connection closed')
  }
}
