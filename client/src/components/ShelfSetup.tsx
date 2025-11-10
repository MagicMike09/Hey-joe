import { useState, useRef } from 'react'
import { Upload, Plus, Trash2, Save, Image as ImageIcon } from 'lucide-react'
import { useRetailStore, ProductZone } from '../store/retailStore'

export default function ShelfSetup() {
  const {
    shelfImage,
    shelfImageDimensions,
    productZones,
    testName,
    testType,
    setShelfImage,
    addProductZone,
    deleteProductZone,
    setTestName,
    setTestType
  } = useRetailStore()

  const [isDrawing, setIsDrawing] = useState(false)
  const [newZone, setNewZone] = useState<Partial<ProductZone> | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const imageRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        setShelfImage(event.target?.result as string, {
          width: img.width,
          height: img.height
        })
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setIsDrawing(true)
    setNewZone({
      x,
      y,
      width: 0,
      height: 0
    })
  }

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !newZone || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const currentX = e.clientX - rect.left
    const currentY = e.clientY - rect.top

    setNewZone({
      ...newZone,
      width: currentX - newZone.x!,
      height: currentY - newZone.y!
    })

    // Redraw canvas
    drawCanvas()
  }

  const handleCanvasMouseUp = () => {
    if (!isDrawing || !newZone) return

    setIsDrawing(false)

    // Only create zone if it has meaningful size
    if (Math.abs(newZone.width!) > 20 && Math.abs(newZone.height!) > 20) {
      setShowAddForm(true)
    } else {
      setNewZone(null)
      drawCanvas()
    }
  }

  const saveNewZone = (name: string, brand: string, price: number, category: string) => {
    if (!newZone) return

    const zone: ProductZone = {
      id: `product_${Date.now()}`,
      name,
      brand,
      price,
      category,
      x: newZone.x!,
      y: newZone.y!,
      width: Math.abs(newZone.width!),
      height: Math.abs(newZone.height!),
      color: getRandomColor()
    }

    addProductZone(zone)
    setNewZone(null)
    setShowAddForm(false)
    drawCanvas()
  }

  const drawCanvas = () => {
    if (!canvasRef.current || !imageRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw existing zones
    productZones.forEach(zone => {
      ctx.strokeStyle = zone.color
      ctx.lineWidth = 3
      ctx.strokeRect(zone.x, zone.y, zone.width, zone.height)

      // Draw label
      ctx.fillStyle = zone.color
      ctx.fillRect(zone.x, zone.y - 25, Math.max(100, zone.name.length * 8), 25)
      ctx.fillStyle = 'white'
      ctx.font = '12px sans-serif'
      ctx.fillText(zone.name, zone.x + 5, zone.y - 8)
    })

    // Draw new zone being created
    if (newZone && newZone.x !== undefined && newZone.width !== undefined) {
      ctx.strokeStyle = '#ec4899'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      ctx.strokeRect(newZone.x, newZone.y!, newZone.width, newZone.height!)
      ctx.setLineDash([])
    }
  }

  const getRandomColor = () => {
    const colors = ['#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4']
    return colors[Math.floor(Math.random() * colors.length)]
  }

  // Redraw canvas when zones change
  useState(() => {
    drawCanvas()
  })

  return (
    <div className="space-y-6">
      {/* Test Configuration */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-white mb-4">Configuration du test</h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-300 mb-2">Nom du test</label>
            <input
              type="text"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              placeholder="Ex: Test disposition produits juin 2024"
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">Type de test</label>
            <select
              value={testType}
              onChange={(e) => setTestType(e.target.value as 'single' | 'ab-test')}
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-purple-500 focus:outline-none"
            >
              <option value="single">Test simple</option>
              <option value="ab-test">Test A/B</option>
            </select>
          </div>
        </div>
      </div>

      {/* Image Upload */}
      {!shelfImage ? (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700">
          <div className="flex flex-col items-center justify-center space-y-4">
            <ImageIcon className="w-16 h-16 text-slate-400" />
            <h3 className="text-xl font-semibold text-white">Importer l'image de l'étagère</h3>
            <p className="text-slate-400 text-center max-w-md">
              Importez une photo de votre étagère ou planogramme pour définir les zones produits
            </p>

            <label className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-6 py-3 rounded-lg cursor-pointer transition-all flex items-center space-x-2">
              <Upload className="w-5 h-5" />
              <span>Choisir une image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      ) : (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">
              Définir les zones produits ({productZones.length})
            </h3>
            <label className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors flex items-center space-x-2">
              <Upload className="w-4 h-4" />
              <span>Changer l'image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="bg-slate-900 rounded-lg p-4 mb-4">
            <p className="text-sm text-slate-300 mb-2">
              <strong>Instructions :</strong> Cliquez et glissez sur l'image pour dessiner un rectangle autour de chaque produit.
            </p>
          </div>

          {/* Canvas for drawing zones */}
          <div className="relative">
            <img
              ref={imageRef}
              src={shelfImage}
              alt="Shelf"
              className="w-full rounded-lg"
              onLoad={drawCanvas}
            />
            <canvas
              ref={canvasRef}
              width={shelfImageDimensions?.width}
              height={shelfImageDimensions?.height}
              className="absolute top-0 left-0 w-full h-full cursor-crosshair"
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={() => setIsDrawing(false)}
            />
          </div>

          {/* Product Zones List */}
          {productZones.length > 0 && (
            <div className="mt-6">
              <h4 className="text-lg font-semibold text-white mb-3">Produits définis</h4>
              <div className="grid md:grid-cols-2 gap-3">
                {productZones.map((zone) => (
                  <div
                    key={zone.id}
                    className="bg-slate-700/30 rounded-lg p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: zone.color }}
                      />
                      <div>
                        <p className="text-white font-semibold">{zone.name}</p>
                        {zone.brand && (
                          <p className="text-xs text-slate-400">{zone.brand}</p>
                        )}
                        {zone.price && (
                          <p className="text-xs text-slate-400">{zone.price}€</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        deleteProductZone(zone.id)
                        drawCanvas()
                      }}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Product Form Modal */}
      {showAddForm && newZone && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">Informations produit</h3>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                saveNewZone(
                  formData.get('name') as string,
                  formData.get('brand') as string,
                  parseFloat(formData.get('price') as string) || 0,
                  formData.get('category') as string
                )
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm text-slate-300 mb-1">Nom du produit *</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Ex: Coca-Cola 33cl"
                  className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1">Marque</label>
                <input
                  type="text"
                  name="brand"
                  placeholder="Ex: Coca-Cola"
                  className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1">Prix (€)</label>
                <input
                  type="number"
                  name="price"
                  step="0.01"
                  placeholder="Ex: 1.50"
                  className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1">Catégorie</label>
                <input
                  type="text"
                  name="category"
                  placeholder="Ex: Boissons"
                  className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false)
                    setNewZone(null)
                    drawCanvas()
                  }}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-2 rounded-lg transition-all flex items-center justify-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Enregistrer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
