import { useState, useRef } from 'react'
import { Upload, Trash2, Save, Image as ImageIcon, X } from 'lucide-react'
import { useRetailStore, ProductZone } from '../store/retailStore'

export default function ShelfSetup() {
  const {
    shelfImage,
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
  const [startX, setStartX] = useState(0)
  const [startY, setStartY] = useState(0)
  const [currentX, setCurrentX] = useState(0)
  const [currentY, setCurrentY] = useState(0)
  const [showForm, setShowForm] = useState(false)
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

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!imageRef.current) return
    const rect = imageRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setIsDrawing(true)
    setStartX(x)
    setStartY(y)
    setCurrentX(x)
    setCurrentY(y)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !imageRef.current) return
    const rect = imageRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setCurrentX(x)
    setCurrentY(y)
  }

  const handleMouseUp = () => {
    if (!isDrawing) return
    setIsDrawing(false)

    const width = Math.abs(currentX - startX)
    const height = Math.abs(currentY - startY)

    if (width > 20 && height > 20) {
      setShowForm(true)
    }
  }

  const resetDrawing = () => {
    setIsDrawing(false)
    setShowForm(false)
    setStartX(0)
    setStartY(0)
    setCurrentX(0)
    setCurrentY(0)
  }

  const saveZone = (name: string, brand: string, price: string, category: string) => {
    const x = Math.min(startX, currentX)
    const y = Math.min(startY, currentY)
    const width = Math.abs(currentX - startX)
    const height = Math.abs(currentY - startY)

    const colors = ['#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6']
    const color = colors[productZones.length % colors.length]

    const zone: ProductZone = {
      id: `prod_${Date.now()}`,
      name,
      brand,
      price: parseFloat(price) || 0,
      category,
      x,
      y,
      width,
      height,
      color
    }

    addProductZone(zone)
    resetDrawing()
  }

  const getRectStyle = () => {
    if (!isDrawing && !showForm) return null

    const x = Math.min(startX, currentX)
    const y = Math.min(startY, currentY)
    const width = Math.abs(currentX - startX)
    const height = Math.abs(currentY - startY)

    return { left: x, top: y, width, height }
  }

  const rect = getRectStyle()

  return (
    <div className="space-y-6">
      {/* Configuration */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-white mb-4">Configuration</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-300 mb-2">Nom du test</label>
            <input
              type="text"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              placeholder="Mon test"
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-2">Type</label>
            <select
              value={testType}
              onChange={(e) => setTestType(e.target.value as 'single' | 'ab-test')}
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:outline-none"
            >
              <option value="single">Test simple</option>
              <option value="ab-test">Test A/B</option>
            </select>
          </div>
        </div>
      </div>

      {/* Image */}
      {!shelfImage ? (
        <div className="bg-slate-800/50 rounded-xl p-8 border border-slate-700 text-center">
          <ImageIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-4">Importer l'image</h3>
          <label className="inline-block bg-purple-500 hover:bg-purple-600 text-white font-semibold px-6 py-3 rounded-lg cursor-pointer">
            <Upload className="w-5 h-5 inline mr-2" />
            Choisir une image
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>
        </div>
      ) : (
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">Zones produits ({productZones.length})</h3>
            <label className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg cursor-pointer">
              Changer
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>

          <div className="bg-purple-900/50 border border-purple-500 rounded-lg p-4 mb-4">
            <p className="text-white font-bold mb-2">✏️ MODE DESSIN ACTIF {isDrawing && '🎨 (DESSIN EN COURS...)'}</p>
            <p className="text-sm text-purple-200">
              <strong>CLIQUEZ ET MAINTENEZ</strong> le bouton de la souris, puis <strong>GLISSEZ</strong> pour dessiner un rectangle.
            </p>
            <p className="text-sm text-yellow-300 mt-1">
              💡 Après avoir enregistré une zone, vous pouvez immédiatement dessiner une autre zone !
            </p>
            {productZones.length > 0 && (
              <p className="text-sm text-green-300 mt-2 font-bold">
                ✅ {productZones.length} zone(s) créée(s) - DESSINEZ LA SUIVANTE !
              </p>
            )}
          </div>

          {/* Image container */}
          <div className="relative inline-block bg-black" style={{ cursor: isDrawing ? 'crosshair' : 'crosshair' }}>
            <img
              ref={imageRef}
              src={shelfImage}
              alt="Shelf"
              className="max-w-full block"
              style={{ userSelect: 'none', cursor: 'crosshair' }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={() => {
                if (isDrawing) {
                  setIsDrawing(false)
                }
              }}
              draggable={false}
            />

            {/* Existing zones */}
            {productZones.map((zone) => (
              <div
                key={zone.id}
                className="absolute pointer-events-none"
                style={{
                  left: zone.x,
                  top: zone.y,
                  width: zone.width,
                  height: zone.height,
                  border: `3px solid ${zone.color}`
                }}
              >
                <div
                  className="absolute -top-6 left-0 px-2 py-1 text-white text-xs font-bold"
                  style={{ backgroundColor: zone.color }}
                >
                  {zone.name}
                </div>
              </div>
            ))}

            {/* Current drawing */}
            {rect && (
              <div
                className="absolute pointer-events-none border-4 border-dashed border-pink-500 animate-pulse"
                style={{
                  left: rect.left,
                  top: rect.top,
                  width: rect.width,
                  height: rect.height,
                  backgroundColor: 'rgba(236, 72, 153, 0.4)',
                  boxShadow: '0 0 20px rgba(236, 72, 153, 0.8)'
                }}
              >
                <div className="absolute top-0 left-0 bg-pink-500 text-white px-2 py-1 text-xs font-bold">
                  NOUVEAU PRODUIT
                </div>
              </div>
            )}
          </div>

          {/* Products list */}
          {productZones.length > 0 && (
            <div className="mt-6">
              <h4 className="text-white font-semibold mb-3">Produits</h4>
              <div className="space-y-2">
                {productZones.map((zone) => (
                  <div key={zone.id} className="bg-slate-700/30 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: zone.color }} />
                      <span className="text-white font-semibold">{zone.name}</span>
                      {zone.brand && <span className="text-slate-400 text-sm">{zone.brand}</span>}
                    </div>
                    <button
                      onClick={() => deleteProductZone(zone.id)}
                      className="text-red-400 hover:text-red-300"
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

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full m-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Nouveau produit</h3>
              <button onClick={resetDrawing} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                const form = e.target as HTMLFormElement
                const name = (form.elements.namedItem('name') as HTMLInputElement).value
                const brand = (form.elements.namedItem('brand') as HTMLInputElement).value
                const price = (form.elements.namedItem('price') as HTMLInputElement).value
                const category = (form.elements.namedItem('category') as HTMLInputElement).value
                saveZone(name, brand, price, category)
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm text-slate-300 mb-1">Nom *</label>
                <input
                  type="text"
                  name="name"
                  required
                  autoFocus
                  placeholder="Ex: Coca-Cola 33cl"
                  className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1">Marque</label>
                <input
                  type="text"
                  name="brand"
                  placeholder="Ex: Coca-Cola"
                  className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1">Prix (€)</label>
                <input
                  type="number"
                  name="price"
                  step="0.01"
                  placeholder="Ex: 1.50"
                  className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1">Catégorie</label>
                <input
                  type="text"
                  name="category"
                  placeholder="Ex: Boissons"
                  className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:outline-none"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={resetDrawing}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-lg flex items-center justify-center space-x-2"
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
