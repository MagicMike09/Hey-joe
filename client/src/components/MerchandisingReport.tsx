import { useEffect, useState } from 'react'
import { BarChart3, Eye, Clock, TrendingUp, Award, AlertTriangle } from 'lucide-react'
import { useRetailStore, ProductMetrics } from '../store/retailStore'
import { useTrackingStore } from '../store/trackingStore'
import { retailAnalyticsService } from '../services/retailAnalyticsService'

export default function MerchandisingReport() {
  const { productZones, shelfImageDimensions } = useRetailStore()
  const { gazeData, emotionData } = useTrackingStore()
  const [metrics, setMetrics] = useState<Map<string, ProductMetrics>>(new Map())

  // Calculate metrics periodically
  useEffect(() => {
    if (productZones.length === 0 || gazeData.length < 10) return

    const interval = setInterval(() => {
      const calculatedMetrics = retailAnalyticsService.calculateProductMetrics(
        productZones,
        gazeData,
        emotionData,
        shelfImageDimensions || undefined
      )
      setMetrics(calculatedMetrics)
    }, 2000) // Update every 2 seconds

    return () => clearInterval(interval)
  }, [productZones, gazeData, emotionData, shelfImageDimensions])

  const metricsArray = Array.from(metrics.values())
  const visitedProducts = metricsArray.filter(m => m.visited)
  const notVisitedProducts = metricsArray.filter(m => !m.visited)

  // Sort products by different metrics
  const topByAttention = [...metricsArray].sort((a, b) => b.attentionScore - a.attentionScore)
  const topByInterest = [...metricsArray].sort((a, b) => b.interestScore - a.interestScore)
  const topByEngagement = [...metricsArray].sort((a, b) => b.engagementScore - a.engagementScore)
  const byViewOrder = [...visitedProducts].sort((a, b) => (a.viewOrder || 999) - (b.viewOrder || 999))

  if (metricsArray.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700 text-center">
        <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <p className="text-slate-300 text-lg font-semibold mb-2">Rapport de merchandising</p>
        <p className="text-slate-400">En attente de données...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <SummaryCard
          icon={Eye}
          label="Produits vus"
          value={`${visitedProducts.length}/${metricsArray.length}`}
          color="bg-blue-500"
        />
        <SummaryCard
          icon={Clock}
          label="Temps moyen par produit"
          value={`${Math.round(average(visitedProducts.map(m => m.totalFixationTime)) / 1000)}s`}
          color="bg-purple-500"
        />
        <SummaryCard
          icon={TrendingUp}
          label="Attention moyenne"
          value={`${Math.round(average(metricsArray.map(m => m.attentionScore)))}%`}
          color="bg-pink-500"
        />
        <SummaryCard
          icon={Award}
          label="Intérêt moyen"
          value={`${Math.round(average(metricsArray.map(m => m.interestScore)))}%`}
          color="bg-green-500"
        />
      </div>

      {/* Top Performers */}
      <div className="grid md:grid-cols-3 gap-6">
        <TopProductsCard
          title="Top Attention"
          products={topByAttention.slice(0, 3)}
          metricKey="attentionScore"
          icon={Eye}
          color="text-blue-400"
        />
        <TopProductsCard
          title="Top Intérêt"
          products={topByInterest.slice(0, 3)}
          metricKey="interestScore"
          icon={Award}
          color="text-green-400"
        />
        <TopProductsCard
          title="Top Engagement"
          products={topByEngagement.slice(0, 3)}
          metricKey="engagementScore"
          icon={TrendingUp}
          color="text-purple-400"
        />
      </div>

      {/* View Order */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <Clock className="w-5 h-5 text-pink-400" />
          <span>Ordre de visualisation</span>
        </h3>

        <div className="space-y-2">
          {byViewOrder.map((product, index) => (
            <div
              key={product.productId}
              className="bg-slate-700/30 rounded-lg p-3 flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-pink-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div>
                  <p className="text-white font-semibold">{product.productName}</p>
                  <p className="text-sm text-slate-400">
                    Vu après {formatTime(product.timeToFirstFixation)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-semibold">
                  {formatTime(product.totalFixationTime)}
                </p>
                <p className="text-xs text-slate-400">temps total</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Not Visited Products Warning */}
      {notVisitedProducts.length > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-300 mb-2">
                Produits non vus ({notVisitedProducts.length})
              </h3>
              <p className="text-yellow-200 mb-3">
                Ces produits n'ont pas été regardés pendant la session. Considérez un repositionnement.
              </p>
              <div className="flex flex-wrap gap-2">
                {notVisitedProducts.map(product => (
                  <span
                    key={product.productId}
                    className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-sm"
                  >
                    {product.productName}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Metrics Table */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Métriques détaillées</h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left text-slate-300 font-semibold py-3 px-2">Produit</th>
                <th className="text-center text-slate-300 font-semibold py-3 px-2">Ordre</th>
                <th className="text-center text-slate-300 font-semibold py-3 px-2">Temps 1ère vue</th>
                <th className="text-center text-slate-300 font-semibold py-3 px-2">Fixations</th>
                <th className="text-center text-slate-300 font-semibold py-3 px-2">Durée totale</th>
                <th className="text-center text-slate-300 font-semibold py-3 px-2">Attention</th>
                <th className="text-center text-slate-300 font-semibold py-3 px-2">Intérêt</th>
                <th className="text-center text-slate-300 font-semibold py-3 px-2">Engagement</th>
              </tr>
            </thead>
            <tbody>
              {metricsArray.map((product) => (
                <tr
                  key={product.productId}
                  className="border-b border-slate-700/50 hover:bg-slate-700/20"
                >
                  <td className="py-3 px-2">
                    <span className="text-white font-medium">{product.productName}</span>
                  </td>
                  <td className="py-3 px-2 text-center text-slate-300">
                    {product.viewOrder || '-'}
                  </td>
                  <td className="py-3 px-2 text-center text-slate-300">
                    {product.timeToFirstFixation ? formatTime(product.timeToFirstFixation) : '-'}
                  </td>
                  <td className="py-3 px-2 text-center text-slate-300">
                    {product.fixationCount}
                    {product.revisited && <span className="ml-1 text-green-400">↻</span>}
                  </td>
                  <td className="py-3 px-2 text-center text-slate-300">
                    {formatTime(product.totalFixationTime)}
                  </td>
                  <td className="py-3 px-2 text-center">
                    <ScoreBadge score={product.attentionScore} />
                  </td>
                  <td className="py-3 px-2 text-center">
                    <ScoreBadge score={product.interestScore} />
                  </td>
                  <td className="py-3 px-2 text-center">
                    <ScoreBadge score={product.engagementScore} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Insights & Recommandations</h3>
        <div className="space-y-3">
          {generateInsights(metricsArray, visitedProducts, notVisitedProducts).map((insight, index) => (
            <Insight key={index} text={insight.text} type={insight.type} />
          ))}
        </div>
      </div>
    </div>
  )
}

interface SummaryCardProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  color: string
}

function SummaryCard({ icon: Icon, label, value, color }: SummaryCardProps) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
      <div className={`${color} w-12 h-12 rounded-lg flex items-center justify-center mb-3`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  )
}

interface TopProductsCardProps {
  title: string
  products: ProductMetrics[]
  metricKey: keyof ProductMetrics
  icon: React.ComponentType<{ className?: string }>
  color: string
}

function TopProductsCard({ title, products, metricKey, icon: Icon, color }: TopProductsCardProps) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
      <h3 className={`text-lg font-semibold ${color} mb-4 flex items-center space-x-2`}>
        <Icon className="w-5 h-5" />
        <span>{title}</span>
      </h3>

      <div className="space-y-3">
        {products.map((product, index) => (
          <div key={product.productId} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-slate-400 font-bold">#{index + 1}</span>
              <span className="text-white">{product.productName}</span>
            </div>
            <span className="text-white font-bold">
              {Math.round(product[metricKey] as number)}
              {typeof product[metricKey] === 'number' && '%'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ScoreBadge({ score }: { score: number }) {
  const getColor = (score: number) => {
    if (score >= 70) return 'bg-green-500'
    if (score >= 40) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-white font-semibold text-sm ${getColor(score)}`}>
      {score}%
    </span>
  )
}

interface InsightProps {
  text: string
  type: 'success' | 'warning' | 'info'
}

function Insight({ text, type }: InsightProps) {
  const colors = {
    success: 'bg-green-500/20 border-green-500/50 text-green-300',
    warning: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300',
    info: 'bg-blue-500/20 border-blue-500/50 text-blue-300'
  }

  return (
    <div className={`rounded-lg p-3 border ${colors[type]}`}>
      <p className="text-sm">{text}</p>
    </div>
  )
}

function formatTime(ms: number | null): string {
  if (ms === null) return '-'
  if (ms < 1000) return `${Math.round(ms)}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

function average(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, val) => sum + val, 0) / values.length
}

function generateInsights(
  allProducts: ProductMetrics[],
  visitedProducts: ProductMetrics[],
  notVisitedProducts: ProductMetrics[]
): InsightProps[] {
  const insights: InsightProps[] = []

  // Coverage insight
  const coverageRate = (visitedProducts.length / allProducts.length) * 100
  if (coverageRate >= 80) {
    insights.push({
      type: 'success',
      text: `Excellent taux de couverture (${Math.round(coverageRate)}%) ! La plupart des produits ont été vus.`
    })
  } else if (coverageRate < 50) {
    insights.push({
      type: 'warning',
      text: `Faible taux de couverture (${Math.round(coverageRate)}%). Envisagez de repositionner les produits non vus.`
    })
  }

  // Attention insight
  const avgAttention = average(allProducts.map(p => p.attentionScore))
  if (avgAttention >= 60) {
    insights.push({
      type: 'success',
      text: 'Niveau d\'attention global élevé. Votre disposition capte bien le regard.'
    })
  } else if (avgAttention < 40) {
    insights.push({
      type: 'warning',
      text: 'Niveau d\'attention faible. Les produits ne retiennent pas assez l\'attention.'
    })
  }

  // Hot product insight
  const topProduct = allProducts.reduce((max, p) =>
    p.attentionScore > max.attentionScore ? p : max
  , allProducts[0])
  if (topProduct && topProduct.attentionScore >= 70) {
    insights.push({
      type: 'success',
      text: `"${topProduct.productName}" est le produit star avec ${topProduct.attentionScore}% d'attention.`
    })
  }

  // Time to first fixation insight
  const avgTimeToFirst = average(
    visitedProducts.map(p => p.timeToFirstFixation).filter(t => t !== null) as number[]
  )
  if (avgTimeToFirst > 5000) {
    insights.push({
      type: 'info',
      text: `Temps moyen avant première vue : ${(avgTimeToFirst / 1000).toFixed(1)}s. Les visiteurs mettent du temps à trouver les produits.`
    })
  }

  // Revisit insight
  const revisitedCount = visitedProducts.filter(p => p.revisited).length
  if (revisitedCount > 0) {
    insights.push({
      type: 'success',
      text: `${revisitedCount} produit(s) revisité(s), montrant un intérêt soutenu.`
    })
  }

  return insights
}
