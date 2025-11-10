import { create } from 'zustand'

export interface ProductZone {
  id: string
  name: string
  x: number
  y: number
  width: number
  height: number
  color: string
  brand?: string
  price?: number
  category?: string
}

export interface ProductMetrics {
  productId: string
  productName: string

  // Timing metrics
  timeToFirstFixation: number | null  // ms until first look
  totalFixationTime: number           // total time looking at product
  fixationCount: number                // number of times looked at
  averageFixationDuration: number      // average time per fixation

  // Attention metrics
  attentionScore: number               // 0-100 based on gaze + EEG
  interestScore: number                // 0-100 based on emotion analysis
  engagementScore: number              // 0-100

  // Visit metrics
  visited: boolean                     // was the product looked at?
  revisited: boolean                   // was it looked at multiple times?

  // Sequence
  viewOrder: number | null             // order in which product was viewed
}

interface RetailState {
  // Shelf setup
  shelfImage: string | null
  shelfImageDimensions: { width: number; height: number } | null
  productZones: ProductZone[]

  // Session info
  testName: string
  testType: 'single' | 'ab-test'
  shelfVariant: 'A' | 'B' | null

  // Product metrics
  productMetrics: Map<string, ProductMetrics>

  // Current tracking
  currentProductViewed: string | null
  lastProductViewed: string | null
  productViewHistory: Array<{ productId: string; timestamp: number }>

  // Actions
  setShelfImage: (image: string, dimensions: { width: number; height: number }) => void
  addProductZone: (zone: ProductZone) => void
  updateProductZone: (id: string, zone: Partial<ProductZone>) => void
  deleteProductZone: (id: string) => void
  clearProductZones: () => void

  setTestName: (name: string) => void
  setTestType: (type: 'single' | 'ab-test') => void
  setShelfVariant: (variant: 'A' | 'B') => void

  updateProductMetrics: (productId: string, metrics: Partial<ProductMetrics>) => void
  setCurrentProductViewed: (productId: string | null) => void
  addProductView: (productId: string, timestamp: number) => void

  resetRetailSession: () => void
}

export const useRetailStore = create<RetailState>((set, get) => ({
  // Initial state
  shelfImage: null,
  shelfImageDimensions: null,
  productZones: [],

  testName: '',
  testType: 'single',
  shelfVariant: null,

  productMetrics: new Map(),

  currentProductViewed: null,
  lastProductViewed: null,
  productViewHistory: [],

  // Actions
  setShelfImage: (image, dimensions) => set({
    shelfImage: image,
    shelfImageDimensions: dimensions
  }),

  addProductZone: (zone) => set((state) => ({
    productZones: [...state.productZones, zone],
    productMetrics: new Map(state.productMetrics).set(zone.id, {
      productId: zone.id,
      productName: zone.name,
      timeToFirstFixation: null,
      totalFixationTime: 0,
      fixationCount: 0,
      averageFixationDuration: 0,
      attentionScore: 0,
      interestScore: 0,
      engagementScore: 0,
      visited: false,
      revisited: false,
      viewOrder: null
    })
  })),

  updateProductZone: (id, zone) => set((state) => ({
    productZones: state.productZones.map(z =>
      z.id === id ? { ...z, ...zone } : z
    )
  })),

  deleteProductZone: (id) => set((state) => {
    const newMetrics = new Map(state.productMetrics)
    newMetrics.delete(id)
    return {
      productZones: state.productZones.filter(z => z.id !== id),
      productMetrics: newMetrics
    }
  }),

  clearProductZones: () => set({
    productZones: [],
    productMetrics: new Map()
  }),

  setTestName: (name) => set({ testName: name }),
  setTestType: (type) => set({ testType: type }),
  setShelfVariant: (variant) => set({ shelfVariant: variant }),

  updateProductMetrics: (productId, metrics) => set((state) => {
    const newMetrics = new Map(state.productMetrics)
    const current = newMetrics.get(productId)
    if (current) {
      newMetrics.set(productId, { ...current, ...metrics })
    }
    return { productMetrics: newMetrics }
  }),

  setCurrentProductViewed: (productId) => set((state) => ({
    currentProductViewed: productId,
    lastProductViewed: state.currentProductViewed
  })),

  addProductView: (productId, timestamp) => set((state) => ({
    productViewHistory: [...state.productViewHistory, { productId, timestamp }]
  })),

  resetRetailSession: () => set({
    currentProductViewed: null,
    lastProductViewed: null,
    productViewHistory: [],
    productMetrics: new Map(
      Array.from(get().productMetrics.keys()).map(id => [
        id,
        {
          productId: id,
          productName: get().productZones.find(z => z.id === id)?.name || '',
          timeToFirstFixation: null,
          totalFixationTime: 0,
          fixationCount: 0,
          averageFixationDuration: 0,
          attentionScore: 0,
          interestScore: 0,
          engagementScore: 0,
          visited: false,
          revisited: false,
          viewOrder: null
        }
      ])
    )
  })
}))
