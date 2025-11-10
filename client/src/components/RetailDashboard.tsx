import { useEffect, useRef, useState } from 'react'
import { Eye, Maximize2, Minimize2 } from 'lucide-react'
import { useTrackingStore } from '../store/trackingStore'
import { useRetailStore } from '../store/retailStore'
import { retailAnalyticsService } from '../services/retailAnalyticsService'

export default function RetailDashboard() {
  const { gazeData, currentGaze } = useTrackingStore()
  const { shelfImage, shelfImageDimensions, productZones, currentProductViewed } = useRetailStore()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const [showZones, setShowZones] = useState(true)
  const [showGazeTrail, setShowGazeTrail] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Draw visualization
  useEffect(() => {
    if (!canvasRef.current || !imageRef.current || !shelfImage) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw product zones
    if (showZones) {
      productZones.forEach(zone => {
        // Determine if this product is currently being viewed
        const isActive = zone.id === currentProductViewed

        ctx.strokeStyle = isActive ? '#ec4899' : zone.color
        ctx.lineWidth = isActive ? 4 : 2
        ctx.strokeRect(zone.x, zone.y, zone.width, zone.height)

        // Draw label background
        const labelWidth = Math.max(120, zone.name.length * 8)
        ctx.fillStyle = isActive ? '#ec4899' : zone.color
        ctx.fillRect(zone.x, zone.y - 30, labelWidth, 30)

        // Draw label text
        ctx.fillStyle = 'white'
        ctx.font = isActive ? 'bold 14px sans-serif' : '12px sans-serif'
        ctx.fillText(zone.name, zone.x + 8, zone.y - 10)

        // If active, add glow effect
        if (isActive) {
          ctx.shadowColor = '#ec4899'
          ctx.shadowBlur = 20
          ctx.strokeRect(zone.x, zone.y, zone.width, zone.height)
          ctx.shadowBlur = 0
        }
      })
    }

    // Draw gaze trail
    if (showGazeTrail) {
      const recentGaze = gazeData.slice(-100)
      recentGaze.forEach((point, index) => {
        const opacity = (index / recentGaze.length) * 0.5
        const size = 2 + (index / recentGaze.length) * 4

        ctx.fillStyle = `rgba(168, 85, 247, ${opacity})`
        ctx.beginPath()
        ctx.arc(point.x, point.y, size, 0, Math.PI * 2)
        ctx.fill()
      })
    }

    // Draw current gaze position
    if (currentGaze) {
      // Check which product is being viewed
      const viewedProduct = retailAnalyticsService.detectProductFromGaze(
        currentGaze,
        productZones,
        shelfImageDimensions || undefined
      )

      const color = viewedProduct ? '#ec4899' : '#a855f7'

      ctx.strokeStyle = color
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(currentGaze.x, currentGaze.y, 15, 0, Math.PI * 2)
      ctx.stroke()

      ctx.fillStyle = color
      ctx.globalAlpha = 0.5
      ctx.beginPath()
      ctx.arc(currentGaze.x, currentGaze.y, 10, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 1
    }
  }, [gazeData, currentGaze, productZones, currentProductViewed, showZones, showGazeTrail, shelfImage, shelfImageDimensions])

  // Process gaze data to detect current product
  useEffect(() => {
    if (!currentGaze || productZones.length === 0) return

    const productId = retailAnalyticsService.detectProductFromGaze(
      currentGaze,
      productZones,
      shelfImageDimensions || undefined
    )

    if (productId && productId !== currentProductViewed) {
      useRetailStore.getState().setCurrentProductViewed(productId)
      useRetailStore.getState().addProductView(productId, currentGaze.timestamp)
    } else if (!productId && currentProductViewed) {
      useRetailStore.getState().setCurrentProductViewed(null)
    }
  }, [currentGaze, productZones, shelfImageDimensions, currentProductViewed])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  if (!shelfImage) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700 text-center">
        <Eye className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <p className="text-slate-300 text-lg font-semibold mb-2">Dashboard Retail</p>
        <p className="text-slate-400">Veuillez d'abord configurer l'étagère et les produits</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showZones}
                onChange={(e) => setShowZones(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-slate-300">Afficher les zones produits</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showGazeTrail}
                onChange={(e) => setShowGazeTrail(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-slate-300">Afficher le trail du regard</span>
            </label>
          </div>

          <button
            onClick={toggleFullscreen}
            className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-4 h-4" />
                <span>Quitter plein écran</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4" />
                <span>Plein écran</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Visualization */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Visualisation en temps réel</h3>
          {currentProductViewed && (
            <div className="bg-pink-500/20 border border-pink-500/50 rounded-lg px-4 py-2">
              <p className="text-sm text-pink-300">
                Regard sur : <span className="font-semibold">
                  {productZones.find(z => z.id === currentProductViewed)?.name}
                </span>
              </p>
            </div>
          )}
        </div>

        <div className="relative bg-slate-900 rounded-lg overflow-hidden">
          <img
            ref={imageRef}
            src={shelfImage}
            alt="Shelf"
            className="w-full"
            onLoad={() => {
              if (canvasRef.current && imageRef.current) {
                canvasRef.current.width = imageRef.current.clientWidth
                canvasRef.current.height = imageRef.current.clientHeight
              }
            }}
          />
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <QuickStat
          label="Produit actuel"
          value={currentProductViewed
            ? productZones.find(z => z.id === currentProductViewed)?.name || '-'
            : 'Aucun'
          }
        />
        <QuickStat
          label="Points de regard"
          value={gazeData.length.toString()}
        />
        <QuickStat
          label="Zones définies"
          value={productZones.length.toString()}
        />
        <QuickStat
          label="Position X, Y"
          value={currentGaze ? `${Math.round(currentGaze.x)}, ${Math.round(currentGaze.y)}` : '-'}
        />
      </div>

      {/* Product List */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Liste des produits</h3>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {productZones.map((zone) => (
            <div
              key={zone.id}
              className={`rounded-lg p-3 border-2 transition-all ${
                zone.id === currentProductViewed
                  ? 'bg-pink-500/20 border-pink-500'
                  : 'bg-slate-700/30 border-transparent'
              }`}
            >
              <div className="flex items-center space-x-2 mb-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: zone.color }}
                />
                <span className="text-white font-semibold">{zone.name}</span>
              </div>
              {zone.brand && (
                <p className="text-xs text-slate-400 ml-6">{zone.brand}</p>
              )}
              {zone.price && (
                <p className="text-xs text-slate-400 ml-6">{zone.price}€</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

interface QuickStatProps {
  label: string
  value: string
}

function QuickStat({ label, value }: QuickStatProps) {
  return (
    <div className="bg-slate-700/30 rounded-lg p-3">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className="text-lg font-bold text-white truncate">{value}</p>
    </div>
  )
}
