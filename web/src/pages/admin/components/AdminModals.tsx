import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ShieldCheck, Plus, X } from 'lucide-react'
import type { CreateGroupPayload } from '../../../types/admin'

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

    // Reset form
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
                    className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                      selectedRgb.hex === color.hex
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
