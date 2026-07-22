import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ShieldCheck, Plus, X, MapPin, Trash2, FlaskConical } from 'lucide-react'
import type { CreateGroupPayload, CreateTerritoryPayload, CreateLaboratoryPayload } from '../../../types/admin'
import { fetchNui } from '../../../utils/fetchNui'
import { isEnvBrowser } from '../../../utils/nui'

interface CreateGroupModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (payload: CreateGroupPayload) => void
}

const PRESET_COLORS = [
  { r: 147, g: 51, b: 234, hex: '#9333ea', label: 'Ballas' },
  { r: 234, g: 179, b: 8, hex: '#eab308', label: 'Vagos' },
  { r: 34, g: 197, b: 94, hex: '#22c55e', label: 'Families' },
  { r: 14, g: 165, b: 233, hex: '#0ea5e9', label: 'Marabunta' },
  { r: 239, g: 68, b: 68, hex: '#ef4444', label: 'Triads' },
  { r: 236, g: 72, b: 153, hex: '#ec4899', label: 'Magenta' },
  { r: 107, g: 114, b: 128, hex: '#6b7280', label: 'Gris' },
]

export function CreateGroupModal({ isOpen, onClose, onCreate }: CreateGroupModalProps) {
  const [name, setName] = useState('')
  const [devise, setDevise] = useState('')
  const [isOfficial, setIsOfficial] = useState(false)
  const [slots, setSlots] = useState(15)
  const [selectedRgb, setSelectedRgb] = useState(PRESET_COLORS[0])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    onCreate({
      name: name.trim(),
      devise: devise.trim(),
      rgb: { r: selectedRgb.r, g: selectedRgb.g, b: selectedRgb.b },
      is_official: isOfficial,
      slots: Number(slots),
    })

    setName('')
    setDevise('')
    setIsOfficial(false)
    setSlots(15)
    onClose()
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-6"
        >
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-zinc-200" />
              <h3 className="text-base font-bold text-zinc-100">Créer un Nouveau Groupe</h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Nom du Groupe</label>
              <input
                type="text"
                required
                placeholder="Ex: Ballas, Cartel de Sinaloa..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-zinc-700 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Devise / Slogan</label>
              <input
                type="text"
                placeholder="Ex: Purple till we die..."
                value={devise}
                onChange={(e) => setDevise(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-zinc-700 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300">Couleur d'Identité (RGB)</label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color.hex}
                    type="button"
                    onClick={() => setSelectedRgb(color)}
                    className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${selectedRgb.hex === color.hex
                      ? 'border-white bg-zinc-800 text-zinc-100'
                      : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700'
                      }`}
                  >
                    <span
                      className="h-3 w-3 rounded-full shadow-xs"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span>{color.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Nombre de Slots</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={slots}
                  onChange={(e) => setSlots(Number(e.target.value))}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs text-zinc-100 focus:border-zinc-700 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/60 px-3.5 py-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-zinc-200">Groupe Officiel</span>
                </div>
                <input
                  type="checkbox"
                  checked={isOfficial}
                  onChange={(e) => setIsOfficial(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-700 bg-zinc-950 text-emerald-500 focus:ring-0"
                />
              </div>
            </div>


            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-zinc-800 px-4 py-2 text-xs font-medium text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 transition"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="rounded-lg border border-zinc-700 bg-zinc-100 px-4 py-2 text-xs font-semibold text-zinc-900 hover:bg-white transition"
              >
                Créer le Groupe
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

const parseCoordinates = (text: string): { x: number; y: number; z: number }[] => {
  const parsed: { x: number; y: number; z: number }[] = []
  const vectorRegex = /(?:vector[23]|vec[23])\s*\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)(?:\s*,\s*(-?\d+(?:\.\d+)?))?\s*\)/gi
  let match
  while ((match = vectorRegex.exec(text)) !== null) {
    const x = parseFloat(match[1])
    const y = parseFloat(match[2])
    const z = match[3] ? parseFloat(match[3]) : 0.0
    parsed.push({ x, y, z })
  }

  if (parsed.length > 0) return parsed

  const lines = text.split('\n')
  for (const line of lines) {
    const cleanLine = line.replace(/[{}\[\]()]/g, '').trim()
    if (!cleanLine) continue
    const numbers = cleanLine.match(/-?\d+(?:\.\d+)?/g)
    if (numbers && numbers.length >= 2) {
      const x = parseFloat(numbers[0])
      const y = parseFloat(numbers[1])
      const z = numbers[2] ? parseFloat(numbers[2]) : 0.0
      parsed.push({ x, y, z })
    }
  }

  return parsed
}

export interface CreateTerritoryModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (payload: CreateTerritoryPayload) => void
}

export function CreateTerritoryModal({ isOpen, onClose, onCreate }: CreateTerritoryModalProps) {
  const [label, setLabel] = useState('')
  const [minZ, setMinZ] = useState(-50)
  const [maxZ, setMaxZ] = useState(150)
  const [coords, setCoords] = useState<{ x: number; y: number; z: number }[]>([])
  const [inputMode, setInputMode] = useState<'position' | 'manual'>('position')
  const [rawText, setRawText] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleAddCurrentPosition = async () => {
    setLoading(true)
    try {
      if (isEnvBrowser()) {
        const newPoint = {
          x: Math.round((Math.random() * 1000 - 500) * 100) / 100,
          y: Math.round((Math.random() * 1000 - 500) * 100) / 100,
          z: Math.round((Math.random() * 50 + 10) * 100) / 100,
        }
        setCoords((prev) => [...prev, newPoint])
        if (coords.length === 0) {
          setMinZ(Math.floor(newPoint.z - 10))
          setMaxZ(Math.floor(newPoint.z + 50))
        }
      } else {
        const point = await fetchNui<{ x: number; y: number; z: number }>('getCurrentCoords')
        if (point) {
          const newPoint = {
            x: Math.round(point.x * 100) / 100,
            y: Math.round(point.y * 100) / 100,
            z: Math.round(point.z * 100) / 100,
          }
          setCoords((prev) => [...prev, newPoint])
          if (coords.length === 0) {
            setMinZ(Math.floor(newPoint.z - 10))
            setMaxZ(Math.floor(newPoint.z + 50))
          }
        }
      }
    } catch (err) {
      console.error('Failed to get coordinates from client:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRemovePoint = (index: number) => {
    setCoords((prev) => prev.filter((_, i) => i !== index))
  }

  const handleTextChange = (val: string) => {
    setRawText(val)
    const parsed = parseCoordinates(val)
    if (parsed.length > 0) {
      setCoords(parsed)
      const hasZValue = parsed.some((p) => p.z !== 0.0)
      if (hasZValue) {
        const avgZ = parsed.reduce((sum, p) => sum + p.z, 0) / parsed.length
        setMinZ(Math.floor(avgZ - 10))
        setMaxZ(Math.floor(avgZ + 50))
      }
    } else {
      setCoords([])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!label.trim() || coords.length < 3) return

    onCreate({
      label: label.trim(),
      minZ: Number(minZ),
      maxZ: Number(maxZ),
      coords,
    })

    setLabel('')
    setMinZ(-50)
    setMaxZ(150)
    setCoords([])
    setRawText('')
    setInputMode('position')
    onClose()
  }

  const handleCancel = () => {
    setLabel('')
    setMinZ(-50)
    setMaxZ(150)
    setCoords([])
    setRawText('')
    setInputMode('position')
    onClose()
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-5"
        >
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-zinc-200" />
              <h3 className="text-base font-bold text-zinc-100">Créer un Nouveau Territoire</h3>
            </div>
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Nom de la Zone / Label</label>
              <input
                type="text"
                required
                placeholder="Ex: Rancho Central, Cypress Flats..."
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-zinc-700 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Min Z (Hauteur Basse)</label>
                <input
                  type="number"
                  step="any"
                  value={minZ}
                  onChange={(e) => setMinZ(Number(e.target.value))}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs text-zinc-100 focus:border-zinc-700 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Max Z (Hauteur Haute)</label>
                <input
                  type="number"
                  step="any"
                  value={maxZ}
                  onChange={(e) => setMaxZ(Number(e.target.value))}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs text-zinc-100 focus:border-zinc-700 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300">Mode de saisie des coordonnées</label>
              <div className="flex border border-zinc-800 bg-zinc-900/60 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setInputMode('position')}
                  className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition ${inputMode === 'position'
                    ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                >
                  Position en jeu
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('manual')}
                  className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition ${inputMode === 'manual'
                    ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                >
                  Coller du texte (vector2/3)
                </button>
              </div>
            </div>

            {inputMode === 'manual' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400">Coller les coordonnées</label>
                <textarea
                  rows={4}
                  value={rawText}
                  onChange={(e) => handleTextChange(e.target.value)}
                  placeholder={`vector2(-1586.36, 1146.97),\nvector2(-1295.45, 407.58),\nvector2(462.12, 498.48)`}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs font-mono text-zinc-100 placeholder-zinc-500 focus:border-zinc-700 focus:outline-none"
                />
                <p className="text-[10px] text-zinc-500">
                  Collez vos vecteurs de zone Lua ou une liste de coordonnées séparées par des virgules.
                </p>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-300 font-medium">
                  Points de contour PolyZone ({coords.length})
                </label>
                {inputMode === 'position' && (
                  <button
                    type="button"
                    onClick={handleAddCurrentPosition}
                    disabled={loading}
                    className="flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1 text-xs text-zinc-200 hover:bg-zinc-800 disabled:opacity-50"
                  >
                    <MapPin className="h-3.5 w-3.5 text-rose-400" />
                    <span>{loading ? 'Récupération...' : 'Ajouter ma position'}</span>
                  </button>
                )}
              </div>

              <div className="max-h-40 overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-900/40 p-2 space-y-1.5">
                {coords.length === 0 ? (
                  <p className="text-center py-4 text-xs text-zinc-500 italic">
                    Aucun point configuré.
                  </p>
                ) : (
                  coords.map((point, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300 font-mono"
                    >
                      <span>
                        #{index + 1}: X: {point.x.toFixed(2)}, Y: {point.y.toFixed(2)}, Z: {point.z.toFixed(2)}
                      </span>
                      {inputMode === 'position' && (
                        <button
                          type="button"
                          onClick={() => handleRemovePoint(index)}
                          className="text-zinc-500 hover:text-rose-400 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
              {coords.length < 3 && coords.length > 0 && (
                <p className="text-[11px] text-amber-400">
                  ⚠️ Un polygone nécessite au moins 3 points de coordonnées pour être valide.
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-lg border border-zinc-800 px-4 py-2 text-xs font-medium text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 transition"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={coords.length < 3 || !label.trim()}
                className="rounded-lg border border-zinc-700 bg-zinc-100 px-4 py-2 text-xs font-semibold text-zinc-900 hover:bg-white transition disabled:opacity-50"
              >
                Créer le Territoire
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

const parseSingleCoordinate = (text: string): { x: number; y: number; z: number } | null => {
  const vectorRegex = /(?:vector[23]|vec[23])\s*\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)(?:\s*,\s*(-?\d+(?:\.\d+)?))?\s*\)/i
  const match = vectorRegex.exec(text)
  if (match) {
    return {
      x: parseFloat(match[1]),
      y: parseFloat(match[2]),
      z: match[3] ? parseFloat(match[3]) : 0.0
    }
  }

  const cleanText = text.replace(/[{}\[\]()]/g, '').trim()
  const numbers = cleanText.match(/-?\d+(?:\.\d+)?/g)
  if (numbers && numbers.length >= 2) {
    return {
      x: parseFloat(numbers[0]),
      y: parseFloat(numbers[1]),
      z: numbers[2] ? parseFloat(numbers[2]) : 0.0
    }
  }
  return null
}

export interface CreateLaboratoryModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (payload: CreateLaboratoryPayload) => void
}

export function CreateLaboratoryModal({ isOpen, onClose, onCreate }: CreateLaboratoryModalProps) {
  const [label, setLabel] = useState('')
  const [type, setType] = useState<'coke' | 'meth' | 'weed'>('weed')
  const [coords, setCoords] = useState<{ x: number; y: number; z: number } | null>(null)
  const [inputMode, setInputMode] = useState<'position' | 'manual'>('position')
  const [rawText, setRawText] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleGetCurrentPosition = async () => {
    setLoading(true)
    try {
      if (isEnvBrowser()) {
        const mockCoord = {
          x: Math.round((Math.random() * 1000 - 500) * 100) / 100,
          y: Math.round((Math.random() * 1000 - 500) * 100) / 100,
          z: Math.round((Math.random() * 50 + 10) * 100) / 100,
        }
        setCoords(mockCoord)
      } else {
        const response = await fetchNui<{ x: number; y: number; z: number }>('getCurrentCoords')
        if (response) {
          setCoords({
            x: Math.round(response.x * 100) / 100,
            y: Math.round(response.y * 100) / 100,
            z: Math.round(response.z * 100) / 100,
          })
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleManualTextChange = (text: string) => {
    setRawText(text)
    const parsed = parseSingleCoordinate(text)
    setCoords(parsed)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!label.trim() || !coords) return
    onCreate({
      label: label.trim(),
      type,
      coords,
    })
    handleCancel()
  }

  const handleCancel = () => {
    setLabel('')
    setType('weed')
    setCoords(null)
    setInputMode('position')
    setRawText('')
    onClose()
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-md overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl"
        >
          <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
              <FlaskConical className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100">Créer un Laboratoire</h3>
              <p className="text-[10px] text-zinc-400">Configurez l'entrée et le type de drogue du labo</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Nom du Laboratoire</label>
              <input
                type="text"
                required
                placeholder="Ex: Labo Coke Sud"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-3.5 py-2 text-xs text-zinc-200 placeholder-zinc-500 transition focus:border-zinc-700 focus:outline-none focus:ring-0"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Type de Production</label>
              <div className="mt-1.5 grid grid-cols-3 gap-2">
                {(['weed', 'meth', 'coke'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`flex flex-col items-center gap-1.5 rounded-lg border p-2.5 transition text-center ${type === t
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-semibold'
                      : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                      }`}
                  >
                    <span className="text-xs capitalize">{t === 'coke' ? 'Cocaïne' : t === 'meth' ? 'Méthamphétamine' : 'Weed'}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Méthode de Position</label>
              <div className="mt-1.5 flex rounded-lg border border-zinc-800 bg-zinc-900/40 p-1">
                <button
                  type="button"
                  onClick={() => setInputMode('position')}
                  className={`flex-1 rounded-md py-1.5 text-center text-xs font-semibold transition ${inputMode === 'position'
                    ? 'bg-zinc-800 text-zinc-100'
                    : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                >
                  Position en Jeu
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('manual')}
                  className={`flex-1 rounded-md py-1.5 text-center text-xs font-semibold transition ${inputMode === 'manual'
                    ? 'bg-zinc-800 text-zinc-100'
                    : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                >
                  Coller Coordonnées
                </button>
              </div>
            </div>

            {inputMode === 'position' ? (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleGetCurrentPosition}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/40 py-2.5 text-xs text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
                >
                  <MapPin className="h-4 w-4" />
                  {coords ? 'Mettre à jour la position' : 'Capturer ma position actuelle'}
                </button>
              </div>
            ) : (
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Coller les coordonnées</label>
                <textarea
                  placeholder="Ex: vector3(125.4, -1450.2, 29.5) ou 125.4, -1450.2, 29.5"
                  value={rawText}
                  onChange={(e) => handleManualTextChange(e.target.value)}
                  className="mt-1.5 h-16 w-full resize-none rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-xs text-zinc-200 placeholder-zinc-500 transition focus:border-zinc-700 focus:outline-none focus:ring-0"
                />
              </div>
            )}

            {coords ? (
              <div className="rounded-lg border border-zinc-800/80 bg-zinc-900/20 px-3.5 py-2.5">
                <div className="flex items-center justify-between text-[11px] font-medium">
                  <span className="text-zinc-400">Position d'entrée enregistrée :</span>
                  <span className="font-mono text-emerald-400">
                    X: {coords.x.toFixed(2)}, Y: {coords.y.toFixed(2)}, Z: {coords.z.toFixed(2)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-zinc-800 bg-zinc-900/10 px-3.5 py-2.5 text-center">
                <p className="text-[10px] text-zinc-500">Aucune position d'entrée configurée</p>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-lg border border-zinc-800 px-4 py-2 text-xs font-medium text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 transition"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={!coords || !label.trim()}
                className="rounded-lg border border-zinc-700 bg-zinc-100 px-4 py-2 text-xs font-semibold text-zinc-900 hover:bg-white transition disabled:opacity-50"
              >
                Créer le Laboratoire
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
