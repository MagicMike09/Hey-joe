import { useEffect, useRef, useState } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { useTrackingStore } from '../store/trackingStore'
import { Activity, Eye, Waves } from 'lucide-react'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export default function Dashboard() {
  const { gazeData, eegData, currentGaze, currentEEG } = useTrackingStore()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [heatmapEnabled, setHeatmapEnabled] = useState(true)

  // Draw gaze heatmap
  useEffect(() => {
    if (!canvasRef.current || !heatmapEnabled) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = window.innerWidth
    canvas.height = 300

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw gaze trail (last 100 points)
    const recentGaze = gazeData.slice(-100)

    recentGaze.forEach((point, index) => {
      const opacity = (index / recentGaze.length) * 0.5
      const size = 3 + (index / recentGaze.length) * 5

      // Scale coordinates to canvas size
      const x = (point.x / window.innerWidth) * canvas.width
      const y = (point.y / window.innerHeight) * canvas.height

      ctx.fillStyle = `rgba(168, 85, 247, ${opacity})`
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fill()
    })

    // Draw current gaze position
    if (currentGaze) {
      const x = (currentGaze.x / window.innerWidth) * canvas.width
      const y = (currentGaze.y / window.innerHeight) * canvas.height

      ctx.strokeStyle = 'rgba(236, 72, 153, 1)'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(x, y, 15, 0, Math.PI * 2)
      ctx.stroke()

      ctx.fillStyle = 'rgba(236, 72, 153, 0.5)'
      ctx.beginPath()
      ctx.arc(x, y, 10, 0, Math.PI * 2)
      ctx.fill()
    }
  }, [gazeData, currentGaze, heatmapEnabled])

  // Prepare EEG chart data
  const eegChartData = {
    labels: eegData.slice(-50).map((_, i) => i.toString()),
    datasets: [
      {
        label: 'Alpha (8-13 Hz)',
        data: eegData.slice(-50).map(d => d.alpha),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Beta (13-30 Hz)',
        data: eegData.slice(-50).map(d => d.beta),
        borderColor: 'rgb(236, 72, 153)',
        backgroundColor: 'rgba(236, 72, 153, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Theta (4-8 Hz)',
        data: eegData.slice(-50).map(d => d.theta),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: 'rgb(203, 213, 225)'
        }
      },
      title: {
        display: false
      }
    },
    scales: {
      x: {
        display: false
      },
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          color: 'rgb(148, 163, 184)'
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)'
        }
      }
    },
    animation: {
      duration: 0
    }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Eye Tracking Visualization */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Eye className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Eye Tracking</h3>
          </div>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={heatmapEnabled}
              onChange={(e) => setHeatmapEnabled(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-slate-300">Afficher le trail</span>
          </label>
        </div>

        <div className="bg-slate-900/50 rounded-lg overflow-hidden border border-slate-700">
          <canvas ref={canvasRef} className="w-full" />
        </div>

        {currentGaze && (
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="bg-slate-700/30 rounded-lg p-3">
              <p className="text-xs text-slate-400 mb-1">Position X</p>
              <p className="text-lg font-bold text-white">{Math.round(currentGaze.x)}px</p>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-3">
              <p className="text-xs text-slate-400 mb-1">Position Y</p>
              <p className="text-lg font-bold text-white">{Math.round(currentGaze.y)}px</p>
            </div>
          </div>
        )}
      </div>

      {/* EEG Visualization */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <div className="flex items-center space-x-2 mb-4">
          <Waves className="w-5 h-5 text-pink-400" />
          <h3 className="text-lg font-semibold text-white">Ondes cérébrales (EEG)</h3>
        </div>

        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700" style={{ height: '300px' }}>
          {eegData.length > 0 ? (
            <Line data={eegChartData} options={chartOptions} />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400">
              En attente de données EEG...
            </div>
          )}
        </div>

        {currentEEG && (
          <div className="mt-4 grid grid-cols-3 gap-2">
            <MetricCard label="Alpha" value={currentEEG.alpha} color="bg-blue-500" />
            <MetricCard label="Beta" value={currentEEG.beta} color="bg-pink-500" />
            <MetricCard label="Theta" value={currentEEG.theta} color="bg-green-500" />
          </div>
        )}
      </div>
    </div>
  )
}

interface MetricCardProps {
  label: string
  value: number
  color: string
}

function MetricCard({ label, value, color }: MetricCardProps) {
  return (
    <div className="bg-slate-700/30 rounded-lg p-2">
      <div className="flex items-center space-x-1 mb-1">
        <div className={`w-2 h-2 rounded-full ${color}`}></div>
        <p className="text-xs text-slate-400">{label}</p>
      </div>
      <p className="text-sm font-bold text-white">{value.toFixed(1)}</p>
    </div>
  )
}
