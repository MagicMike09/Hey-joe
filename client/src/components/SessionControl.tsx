import { useState, useEffect } from 'react'
import { Play, Square, Download, Clock } from 'lucide-react'
import { useTrackingStore } from '../store/trackingStore'
import { useRetailStore } from '../store/retailStore'
import { retailAnalyticsService } from '../services/retailAnalyticsService'
import * as XLSX from 'xlsx'

export default function SessionControl() {
  const [isRecording, setIsRecording] = useState(false)
  const [duration, setDuration] = useState(0)
  const [showReport, setShowReport] = useState(false)

  const { gazeData, eegData, emotionData } = useTrackingStore()
  const { productZones } = useRetailStore()

  useEffect(() => {
    if (!isRecording) return

    const interval = setInterval(() => {
      setDuration(d => d + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [isRecording])

  const start = () => {
    setIsRecording(true)
    setDuration(0)
    setShowReport(false)
    retailAnalyticsService.startSession()
  }

  const stop = () => {
    setIsRecording(false)
    setShowReport(true)
  }

  const downloadShelfImage = () => {
    const { shelfImage } = useRetailStore.getState()
    if (!shelfImage) return

    // Create canvas to draw image with zones
    const canvas = document.createElement('canvas')
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')

      if (!ctx) return

      // Draw the shelf image
      ctx.drawImage(img, 0, 0)

      // Draw all product zones
      productZones.forEach((zone) => {
        ctx.strokeStyle = zone.color
        ctx.lineWidth = 4
        ctx.strokeRect(zone.x, zone.y, zone.width, zone.height)

        // Draw label
        ctx.fillStyle = zone.color
        ctx.fillRect(zone.x, zone.y - 30, zone.name.length * 10 + 20, 30)
        ctx.fillStyle = 'white'
        ctx.font = 'bold 16px Arial'
        ctx.fillText(zone.name, zone.x + 10, zone.y - 8)
      })

      // Download the image
      canvas.toBlob((blob) => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `etagere-zones-${Date.now()}.png`
        a.click()
        URL.revokeObjectURL(url)
      })
    }

    img.src = shelfImage
  }

  const download = async () => {
    const metrics = retailAnalyticsService.calculateProductMetrics(
      productZones,
      gazeData,
      emotionData,
      undefined
    )

    const metricsArray = Array.from(metrics.values())

    // Create workbook
    const wb = XLSX.utils.book_new()

    // === Sheet 1: Résumé ===
    const summaryData = [
      ['📊 RAPPORT D\'ANALYSE RETAIL'],
      [],
      ['Date', new Date().toLocaleString('fr-FR')],
      ['Durée de la session', formatTime(duration)],
      ['Points de regard collectés', gazeData.length],
      ['Points EEG collectés', eegData.length],
      ['Nombre de produits analysés', productZones.length],
      [],
      ['=== STATISTIQUES GLOBALES ==='],
      [],
      ['Produits vus', metricsArray.filter(m => m.visited).length + ' / ' + metricsArray.length],
      ['Attention moyenne', Math.round(metricsArray.reduce((sum, m) => sum + m.attentionScore, 0) / metricsArray.length) + '%'],
      ['Intérêt moyen', Math.round(metricsArray.reduce((sum, m) => sum + m.interestScore, 0) / metricsArray.length) + '%'],
      ['Engagement moyen', Math.round(metricsArray.reduce((sum, m) => sum + m.engagementScore, 0) / metricsArray.length) + '%']
    ]
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData)
    wsSummary['!cols'] = [{ width: 35 }, { width: 25 }]
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Résumé')

    // === Sheet 2: Métriques détaillées ===
    const detailsData = [
      ['Produit', 'Marque', 'Prix', 'Ordre vue', 'Temps 1ère vue (ms)', 'Nombre fixations', 'Durée totale (ms)', 'Attention (%)', 'Intérêt (%)', 'Engagement (%)', 'Stress (%)', 'Revisité'],
      ...metricsArray.map(m => [
        m.productName,
        productZones.find(z => z.id === m.productId)?.brand || '',
        productZones.find(z => z.id === m.productId)?.price || '',
        m.viewOrder || 'Non vu',
        m.timeToFirstFixation || 'N/A',
        m.fixationCount,
        m.totalFixationTime,
        m.attentionScore,
        m.interestScore,
        m.engagementScore,
        m.stressScore,
        m.revisited ? 'Oui' : 'Non'
      ])
    ]
    const wsDetails = XLSX.utils.aoa_to_sheet(detailsData)
    wsDetails['!cols'] = [
      { width: 25 }, { width: 15 }, { width: 10 }, { width: 12 },
      { width: 18 }, { width: 16 }, { width: 18 }, { width: 12 },
      { width: 12 }, { width: 14 }, { width: 12 }, { width: 10 }
    ]
    XLSX.utils.book_append_sheet(wb, wsDetails, 'Métriques détaillées')

    // === Sheet 3: Ordre de visualisation ===
    const visitedProducts = metricsArray.filter(m => m.visited).sort((a, b) => (a.viewOrder || 999) - (b.viewOrder || 999))
    const orderData = [
      ['Ordre', 'Produit', 'Temps avant première vue (s)', 'Temps total de fixation (s)', 'Score attention (%)'],
      ...visitedProducts.map((m, idx) => [
        idx + 1,
        m.productName,
        ((m.timeToFirstFixation || 0) / 1000).toFixed(1),
        (m.totalFixationTime / 1000).toFixed(1),
        m.attentionScore
      ])
    ]
    const wsOrder = XLSX.utils.aoa_to_sheet(orderData)
    wsOrder['!cols'] = [{ width: 8 }, { width: 30 }, { width: 25 }, { width: 25 }, { width: 20 }]
    XLSX.utils.book_append_sheet(wb, wsOrder, 'Ordre de visualisation')

    // === Sheet 4: Zones produits ===
    const zonesData = [
      ['Produit', 'Marque', 'Prix (€)', 'Catégorie', 'Position X', 'Position Y', 'Largeur', 'Hauteur', 'Couleur'],
      ...productZones.map(z => [
        z.name,
        z.brand || '',
        z.price || '',
        z.category || '',
        z.x,
        z.y,
        z.width,
        z.height,
        z.color
      ])
    ]
    const wsZones = XLSX.utils.aoa_to_sheet(zonesData)
    wsZones['!cols'] = [
      { width: 25 }, { width: 15 }, { width: 10 }, { width: 15 },
      { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 15 }
    ]
    XLSX.utils.book_append_sheet(wb, wsZones, 'Zones produits')

    // === Sheet 5: Image (Instructions) ===
    const imageData = [
      ['📷 IMAGE DE L\'ÉTAGÈRE'],
      [],
      ['L\'image de l\'étagère avec les zones produits a été téléchargée séparément.'],
      ['Fichier : etagere-zones-[timestamp].png'],
      [],
      ['Cette image montre :'],
      ['- L\'étagère complète en haute résolution'],
      ['- Toutes les zones produits dessinées avec leurs couleurs'],
      ['- Les noms des produits étiquetés sur chaque zone'],
      [],
      ['Note : Excel ne supporte pas nativement les images base64.'],
      ['L\'image est donc fournie en tant que fichier PNG séparé pour une meilleure qualité.']
    ]
    const wsImage = XLSX.utils.aoa_to_sheet(imageData)
    wsImage['!cols'] = [{ width: 70 }]
    XLSX.utils.book_append_sheet(wb, wsImage, 'Image')

    // Download shelf image first
    downloadShelfImage()

    // Then generate Excel file after a small delay to ensure proper ordering
    setTimeout(() => {
      XLSX.writeFile(wb, `rapport-retail-${Date.now()}.xlsx`)
    }, 500)
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="bg-gradient-to-r from-slate-800 to-purple-900/30 rounded-xl p-6 border-2 border-purple-500/50">
      <div className="flex items-center justify-between">
        {/* Status */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className={`w-4 h-4 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-600'}`} />
            <span className="text-white font-bold text-lg">
              {isRecording ? '🔴 ENREGISTREMENT' : '⏹️ ARRÊTÉ'}
            </span>
          </div>

          {isRecording && (
            <div className="flex items-center space-x-2 bg-black/30 px-4 py-2 rounded-lg">
              <Clock className="w-5 h-5 text-purple-400" />
              <span className="text-white font-mono text-xl font-bold">{formatTime(duration)}</span>
            </div>
          )}

          <div className="text-sm text-slate-300">
            👁️ {gazeData.length} | 🧠 {eegData.length}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex space-x-3">
          {!isRecording ? (
            <button
              onClick={start}
              className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-lg text-lg transition-all transform hover:scale-105 shadow-lg"
            >
              <Play className="w-6 h-6" />
              <span>DÉMARRER</span>
            </button>
          ) : (
            <button
              onClick={stop}
              className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-3 rounded-lg text-lg transition-all transform hover:scale-105 shadow-lg"
            >
              <Square className="w-6 h-6" />
              <span>TERMINER</span>
            </button>
          )}

          {showReport && (
            <button
              onClick={download}
              className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 py-3 rounded-lg text-lg transition-all shadow-lg"
              title="Télécharge le rapport Excel + l'image de l'étagère"
            >
              <Download className="w-5 h-5" />
              <span>TÉLÉCHARGER EXCEL</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary */}
      {showReport && (
        <div className="mt-4 pt-4 border-t border-purple-500/30">
          <div className="bg-green-500/20 border-2 border-green-500 rounded-lg p-4">
            <h4 className="text-green-300 font-bold text-lg mb-3">✅ EXPÉRIENCE TERMINÉE</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-slate-400">Durée</p>
                <p className="text-white font-bold text-xl">{formatTime(duration)}</p>
              </div>
              <div>
                <p className="text-slate-400">Points regard</p>
                <p className="text-white font-bold text-xl">{gazeData.length}</p>
              </div>
              <div>
                <p className="text-slate-400">Produits</p>
                <p className="text-white font-bold text-xl">{productZones.length}</p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <p className="text-green-200 font-semibold">
                📊 Scroll vers le bas pour voir le rapport complet
              </p>
              <p className="text-blue-200 text-sm">
                💾 Cliquez sur "TÉLÉCHARGER EXCEL" pour obtenir le rapport complet + l'image de l'étagère
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
