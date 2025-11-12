import { useState, useRef, useEffect } from 'react'
import { Upload, Trash2, Save, Image as ImageIcon, X } from 'lucide-react'
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
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null)
  const [currentPos, setCurrentPos] = useState<{ x: number; y: number } | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        setShelfImage(event.target?.result as string, {
          width: img.naturalWidth,
          height: img.naturalHeight
        })
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !imageRef.current) return

    const rect = imageRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setIsDrawing(true)
    setStartPos({ x, y })
    setCurrentPos({ x, y })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !containerRef.current || !imageRef.current) return

    const rect = imageRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setCurrentPos({ x, y })
  }

  const handleMouseUp = () => {
    if (!isDrawing || !startPos || !currentPos) return

    setIsDrawing(false)

    const width = Math.abs(currentPos.x - startPos.x)
    const height = Math.abs(currentPos.y - startPos.y)

    // Only create zone if it has meaningful size
    if (width > 30 && height > 30) {
      setShowAddForm(true)
    } else {
      setStartPos(null)
      setCurrentPos(null)
    }
  }

  const saveNewZone = (name: string, brand: string, price: number, category: string) => {
    if (!startPos || !currentPos) return

    const x = Math.min(startPos.x, currentPos.x)
    const y = Math.min(startPos.y, currentPos.y)
    const width = Math.abs(currentPos.x - startPos.x)
    const height = Math.abs(currentPos.y - startPos.y)

    const zone: ProductZone = {
      id: `product_${Date.now()}`,
      name,
      brand,
      price,
      category,
      x,
      y,
      width,
      height,
      color: getRandomColor()
    }

    addProductZone(zone)
    setStartPos(null)
    setCurrentPos(null)
    setShowAddForm(false)
  }

  const cancelDrawing = () => {
    setShowAddForm(false)
    setStartPos(null)
    setCurrentPos(null)
    setIsDrawing(false)
  }

  const getRandomColor = () => {
    const colors = ['#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ef4444']
    return colors[Math.floor(Math.random() * colors.length)]
  }

  // Calculate current drawing rectangle
  const getCurrentRect = () => {
    if (!startPos || !currentPos) return null
    return {
      x: Math.min(startPos.x, currentPos.x),
      y: Math.min(startPos.y, currentPos.y),
      width: Math.abs(currentPos.x - startPos.x),
      height: Math.abs(currentPos.y - startPos.y)
    }
  }

  const currentRect = getCurrentRect()

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
            <p className="text-xs text-slate-400">
              Astuce : Dessinez des rectangles généreux (avec marge) pour compenser l'imprécision de l'eye tracking.
            </p>
          </div>

          {/* Image with overlay */}
          <div
            ref={containerRef}
            className="relative inline-block bg-slate-900 rounded-lg overflow-hidden"
            style={{ cursor: 'crosshair' }}
          >
            <img
              ref={imageRef}
              src={shelfImage}
              alt="Shelf"
              className="max-w-full h-auto block"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={() => {
                if (isDrawing) {
                  handleMouseUp()
                }
              }}
              draggable={false}
            />

            {/* Existing zones overlay */}
            {productZones.map((zone) => (
              <div
                key={zone.id}
                className="absolute pointer-events-none"
                style={{
                  left: `${zone.x}px`,
                  top: `${zone.y}px`,
                  width: `${zone.width}px`,
                  height: `${zone.height}px`,
                  border: `3px solid ${zone.color}`,
                  boxShadow: `0 0 10px ${zone.color}50`
                }}
              >
                <div
                  className="absolute -top-7 left-0 px-2 py-1 rounded text-white text-xs font-semibold whitespace-nowrap"
                  style={{ backgroundColor: zone.color }}
                >
                  {zone.name}
                </div>
              </div>
            ))}

            {/* Current drawing rectangle */}
            {currentRect && (
              <div
                className="absolute pointer-events-none"
                style={{
                  left: `${currentRect.x}px`,
                  top: `${currentRect.y}px`,
                  width: `${currentRect.width}px`,
                  height: `${currentRect.height}px`,
                  border: '3px dashed #ec4899',
                  backgroundColor: 'rgba(236, 72, 153, 0.1)'
                }}
              />
            )}
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
                        className="w-4 h-4 rounded flex-shrink-0"
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
                      onClick={() => deleteProductZone(zone.id)}
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
      {showAddForm && currentRect && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Informations produit</h3>
              <button
                onClick={cancelDrawing}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

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
                  autoFocus
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
                  onClick={cancelDrawing}
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
