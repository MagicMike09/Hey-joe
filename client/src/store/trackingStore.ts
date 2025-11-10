import { create } from 'zustand'

export interface GazeData {
  x: number
  y: number
  timestamp: number
}

export interface EEGData {
  alpha: number
  beta: number
  theta: number
  delta: number
  gamma: number
  timestamp: number
}

export interface EmotionData {
  attention: number
  engagement: number
  stress: number
  interest: number
  timestamp: number
}

interface TrackingState {
  // Eye Tracking
  isEyeTrackingActive: boolean
  isCalibrating: boolean
  gazeData: GazeData[]
  currentGaze: GazeData | null

  // Brain Bit EEG
  isBrainBitConnected: boolean
  isConnecting: boolean
  eegData: EEGData[]
  currentEEG: EEGData | null

  // Emotion Analysis
  emotionData: EmotionData[]
  currentEmotion: EmotionData | null

  // Session
  sessionId: string | null
  isRecording: boolean

  // Actions
  setEyeTrackingActive: (active: boolean) => void
  setCalibrating: (calibrating: boolean) => void
  addGazeData: (data: GazeData) => void
  setCurrentGaze: (data: GazeData | null) => void

  setBrainBitConnected: (connected: boolean) => void
  setConnecting: (connecting: boolean) => void
  addEEGData: (data: EEGData) => void
  setCurrentEEG: (data: EEGData | null) => void

  addEmotionData: (data: EmotionData) => void
  setCurrentEmotion: (data: EmotionData | null) => void

  startSession: (sessionId: string) => void
  stopSession: () => void
  setRecording: (recording: boolean) => void

  clearData: () => void
}

export const useTrackingStore = create<TrackingState>((set) => ({
  // Initial state
  isEyeTrackingActive: false,
  isCalibrating: false,
  gazeData: [],
  currentGaze: null,

  isBrainBitConnected: false,
  isConnecting: false,
  eegData: [],
  currentEEG: null,

  emotionData: [],
  currentEmotion: null,

  sessionId: null,
  isRecording: false,

  // Actions
  setEyeTrackingActive: (active) => set({ isEyeTrackingActive: active }),
  setCalibrating: (calibrating) => set({ isCalibrating: calibrating }),
  addGazeData: (data) => set((state) => ({
    gazeData: [...state.gazeData.slice(-1000), data] // Keep last 1000 points
  })),
  setCurrentGaze: (data) => set({ currentGaze: data }),

  setBrainBitConnected: (connected) => set({ isBrainBitConnected: connected }),
  setConnecting: (connecting) => set({ isConnecting: connecting }),
  addEEGData: (data) => set((state) => ({
    eegData: [...state.eegData.slice(-1000), data]
  })),
  setCurrentEEG: (data) => set({ currentEEG: data }),

  addEmotionData: (data) => set((state) => ({
    emotionData: [...state.emotionData.slice(-1000), data]
  })),
  setCurrentEmotion: (data) => set({ currentEmotion: data }),

  startSession: (sessionId) => set({ sessionId, isRecording: true }),
  stopSession: () => set({ sessionId: null, isRecording: false }),
  setRecording: (recording) => set({ isRecording: recording }),

  clearData: () => set({
    gazeData: [],
    currentGaze: null,
    eegData: [],
    currentEEG: null,
    emotionData: [],
    currentEmotion: null
  })
}))
