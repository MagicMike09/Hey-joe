import { useEffect, useState } from 'react'
import { Heart, Brain, AlertCircle, Sparkles } from 'lucide-react'
import { useTrackingStore } from '../store/trackingStore'
import { emotionAnalysisService } from '../services/emotionAnalysisService'

export default function EmotionAnalysis() {
  const { gazeData, eegData, emotionData, currentEmotion, addEmotionData, setCurrentEmotion } = useTrackingStore()
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Analyze emotions periodically
  useEffect(() => {
    if (gazeData.length === 0 || eegData.length === 0) return

    const interval = setInterval(() => {
      setIsAnalyzing(true)

      // Get recent data (last 5 seconds)
      const recentGaze = gazeData.slice(-50)
      const recentEEG = eegData.slice(-50)

      // Analyze emotions
      const emotion = emotionAnalysisService.analyzeEmotion(recentGaze, recentEEG)

      addEmotionData(emotion)
      setCurrentEmotion(emotion)

      setTimeout(() => setIsAnalyzing(false), 500)
    }, 2000) // Analyze every 2 seconds

    return () => clearInterval(interval)
  }, [gazeData, eegData, addEmotionData, setCurrentEmotion])

  if (!currentEmotion) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700 text-center">
        <Brain className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <p className="text-slate-300 text-lg font-semibold mb-2">Analyse des émotions</p>
        <p className="text-slate-400">En attente de données suffisantes...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Main Emotion Display */}
      <div className="bg-gradient-to-br from-slate-800 to-purple-900/30 backdrop-blur-sm rounded-xl p-8 border border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">État émotionnel actuel</h2>
          {isAnalyzing && (
            <div className="flex items-center space-x-2 text-purple-400">
              <div className="animate-pulse">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-sm">Analyse...</span>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <EmotionCard
            icon={Brain}
            label="Attention"
            value={currentEmotion.attention}
            description="Niveau de concentration"
            color="from-blue-500 to-blue-600"
          />
          <EmotionCard
            icon={Heart}
            label="Engagement"
            value={currentEmotion.engagement}
            description="Implication émotionnelle"
            color="from-pink-500 to-pink-600"
          />
          <EmotionCard
            icon={AlertCircle}
            label="Stress"
            value={currentEmotion.stress}
            description="Niveau de tension"
            color="from-red-500 to-red-600"
          />
          <EmotionCard
            icon={Sparkles}
            label="Intérêt"
            value={currentEmotion.interest}
            description="Curiosité et fascination"
            color="from-purple-500 to-purple-600"
          />
        </div>
      </div>

      {/* Emotion Timeline */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Évolution des émotions</h3>

        <div className="space-y-4">
          <EmotionTimeline
            label="Attention"
            data={emotionData.map(d => d.attention)}
            color="rgb(59, 130, 246)"
          />
          <EmotionTimeline
            label="Engagement"
            data={emotionData.map(d => d.engagement)}
            color="rgb(236, 72, 153)"
          />
          <EmotionTimeline
            label="Stress"
            data={emotionData.map(d => d.stress)}
            color="rgb(239, 68, 68)"
          />
          <EmotionTimeline
            label="Intérêt"
            data={emotionData.map(d => d.interest)}
            color="rgb(168, 85, 247)"
          />
        </div>
      </div>

      {/* Insights */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Insights</h3>
        <div className="space-y-3">
          <Insight
            text={getInsight(currentEmotion)}
            type="info"
          />
        </div>
      </div>
    </div>
  )
}

interface EmotionCardProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
  description: string
  color: string
}

function EmotionCard({ icon: Icon, label, value, description, color }: EmotionCardProps) {
  return (
    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
      <div className={`bg-gradient-to-r ${color} w-12 h-12 rounded-lg flex items-center justify-center mb-3`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <p className="text-2xl font-bold text-white mb-1">{value}%</p>
      <p className="text-sm font-semibold text-slate-300 mb-1">{label}</p>
      <p className="text-xs text-slate-400">{description}</p>

      {/* Progress bar */}
      <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${color} transition-all duration-500`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

interface EmotionTimelineProps {
  label: string
  data: number[]
  color: string
}

function EmotionTimeline({ label, data, color }: EmotionTimelineProps) {
  const recentData = data.slice(-30)
  const maxValue = 100

  return (
    <div>
      <p className="text-sm text-slate-400 mb-2">{label}</p>
      <div className="flex items-end space-x-1 h-16 bg-slate-900/50 rounded-lg p-2">
        {recentData.map((value, index) => (
          <div
            key={index}
            className="flex-1 rounded-sm transition-all duration-300"
            style={{
              height: `${(value / maxValue) * 100}%`,
              backgroundColor: color,
              opacity: 0.5 + (index / recentData.length) * 0.5
            }}
          />
        ))}
      </div>
    </div>
  )
}

interface InsightProps {
  text: string
  type: 'info' | 'warning' | 'success'
}

function Insight({ text, type }: InsightProps) {
  const colors = {
    info: 'bg-blue-500/20 border-blue-500/50 text-blue-300',
    warning: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300',
    success: 'bg-green-500/20 border-green-500/50 text-green-300'
  }

  return (
    <div className={`rounded-lg p-3 border ${colors[type]}`}>
      <p className="text-sm">{text}</p>
    </div>
  )
}

function getInsight(emotion: { attention: number; engagement: number; stress: number; interest: number }): string {
  if (emotion.attention > 70 && emotion.engagement > 70) {
    return "Excellente concentration ! Le visiteur est très attentif et engagé."
  } else if (emotion.stress > 70) {
    return "Niveau de stress élevé détecté. Le contenu pourrait être trop complexe ou intense."
  } else if (emotion.interest > 70) {
    return "Le visiteur montre un fort intérêt. C'est le moment idéal pour présenter plus d'informations."
  } else if (emotion.attention < 30 && emotion.engagement < 30) {
    return "Faible attention et engagement. Envisagez de rendre le contenu plus interactif."
  } else {
    return "État émotionnel équilibré. Le visiteur explore calmement."
  }
}
