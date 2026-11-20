import { useState } from 'react'
import { ShieldCheck, Plus, MapPin, Trash2, FlaskConical } from 'lucide-react'
import { Button, Field, Input, Modal, SectionLabel, Tabs, TextArea } from '../../../components/ui'
import type { CreateGroupPayload, CreateTerritoryPayload, CreateLaboratoryPayload } from '../../../types/admin'
import type { GroupLogoSettings } from '../../../types/group'
import { GroupLogoField } from '../../group/components/GroupLogoField'
import { fetchNui } from '../../../utils/fetchNui'
import { isEnvBrowser } from '../../../utils/nui'
import { useTranslation } from '../../../hooks/useTranslation'

interface CreateGroupModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (payload: CreateGroupPayload) => void
  logoSettings?: GroupLogoSettings | null
}

const PRESET_COLORS = [
  { r: 147, g: 51, b: 234, hex: '#9333ea', label: 'Ballas' },
  { r: 234, g: 179, b: 8, hex: '#eab308', label: 'Vagos' },
  { r: 34, g: 197, b: 94, hex: '#22c55e', label: 'Families' },
  { r: 14, g: 165, b: 233, hex: '#0ea5e9', label: 'Marabunta' },
  { r: 239, g: 68, b: 68, hex: '#ef4444', label: 'Triads' },
  { r: 236, g: 72, b: 153, hex: '#ec4899', label: 'Magenta' },
  { r: 107, g: 114, b: 128, hex: '#6b7280', label: 'Gray' },
]

export function CreateGroupModal({ isOpen, onClose, onCreate, logoSettings }: CreateGroupModalProps) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [devise, setDevise] = useState('')
  const [isOfficial, setIsOfficial] = useState(false)
  const [slots, setSlots] = useState(15)
  const [selectedRgb, setSelectedRgb] = useState(PRESET_COLORS[0])
  const [logo, setLogo] = useState('')

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
      logo: logo || undefined,
    })

    setName('')
    setDevise('')
    setIsOfficial(false)
    setSlots(15)
    setLogo('')
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      icon={Plus}
      subtitle={t('admin_sidebar_groups')}
      title={t('modal_group_title')}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t('btn_cancel')}
          </Button>
          <Button variant="primary" type="submit" form="create-group-form">
            {t('groups_create')}
          </Button>
        </>
      }
    >
      <form id="create-group-form" onSubmit={handleSubmit} className="space-y-4">
        <Field label={t('modal_group_name')}>
          <Input
            type="text"
            required
            placeholder={t('modal_group_name_placeholder')}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>

        <Field label={t('group_devise_label')}>
          <Input
            type="text"
            placeholder={t('modal_group_devise_placeholder')}
            value={devise}
            onChange={(e) => setDevise(e.target.value)}
          />
        </Field>

        <Field label={t('modal_group_color')}>
          <span className="flex flex-wrap gap-2">
            {PRESET_COLORS.map((color) => (
              <button
                key={color.hex}
                type="button"
                onClick={() => setSelectedRgb(color)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[15px] font-semibold uppercase tracking-wide transition ${
                  selectedRgb.hex === color.hex
                    ? 'bg-white text-help-panel'
                    : 'border border-help-line text-white/65 hover:text-white'
                }`}
              >
                <span className="h-3 w-3" style={{ backgroundColor: color.hex }} />
                <span>{color.label}</span>
              </button>
            ))}
          </span>
        </Field>

        {logoSettings && (logoSettings.upload || logoSettings.url) && (
          <GroupLogoField settings={logoSettings} value={logo} onChange={setLogo} />
        )}

        <div className="grid grid-cols-2 gap-4">
          <Field label={t('modal_group_slots')}>
            <Input type="number" min={1} max={50} value={slots} onChange={(e) => setSlots(Number(e.target.value))} />
          </Field>

          <Field label={t('group_official_badge')}>
            <button
              type="button"
              onClick={() => setIsOfficial((prev) => !prev)}
              className={`flex h-[42px] w-full items-center justify-between px-3 text-[17px] font-semibold uppercase tracking-wide transition ${
                isOfficial ? 'bg-help-safe text-help-panel' : 'border border-white/20 bg-help-panel/80 text-white/65'
              }`}
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                {isOfficial ? t('group_official') : t('group_unofficial')}
              </span>
              <span className={`h-4 w-4 ${isOfficial ? 'bg-help-panel' : 'border border-white/40'}`} />
            </button>
          </Field>
        </div>
      </form>
    </Modal>
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
  const { t } = useTranslation()
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
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      icon={MapPin}
      subtitle={t('admin_sidebar_territories')}
      title={t('modal_territory_title')}
      footer={
        <>
          <Button variant="ghost" onClick={handleCancel}>
            {t('btn_cancel')}
          </Button>
          <Button variant="primary" type="submit" form="create-territory-form" disabled={coords.length < 3 || !label.trim()}>
            {t('territories_create')}
          </Button>
        </>
      }
    >
      <form id="create-territory-form" onSubmit={handleSubmit} className="space-y-4">
        <Field label={t('modal_territory_name')}>
          <Input
            type="text"
            required
            placeholder={t('modal_territory_name_placeholder')}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label={t('modal_territory_min_z')}>
            <Input type="number" step="any" value={minZ} onChange={(e) => setMinZ(Number(e.target.value))} />
          </Field>
          <Field label={t('modal_territory_max_z')}>
            <Input type="number" step="any" value={maxZ} onChange={(e) => setMaxZ(Number(e.target.value))} />
          </Field>
        </div>

        <Field label={t('modal_coords_mode')}>
          <Tabs
            value={inputMode}
            onChange={setInputMode}
            options={[
              { value: 'position', label: t('modal_coords_position') },
              { value: 'manual', label: t('modal_coords_paste_vectors') },
            ]}
          />
        </Field>

        {inputMode === 'manual' && (
          <Field label={t('modal_coords_paste')} hint={t('modal_coords_paste_hint')}>
            <TextArea
              rows={4}
              value={rawText}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder={`vector2(-1586.36, 1146.97),\nvector2(-1295.45, 407.58),\nvector2(462.12, 498.48)`}
              className="!text-[15px]"
            />
          </Field>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <SectionLabel>{t('modal_territory_points', { count: coords.length })}</SectionLabel>
            {inputMode === 'position' && (
              <Button size="sm" icon={MapPin} onClick={handleAddCurrentPosition} disabled={loading}>
                {loading ? t('modal_coords_loading') : t('modal_coords_add_position')}
              </Button>
            )}
          </div>

          <div className="max-h-40 overflow-y-auto bg-help-panel/60 px-3">
            {coords.length === 0 ? (
              <p className="py-4 text-center text-[15px] uppercase tracking-wide text-white/45">{t('modal_territory_no_points')}</p>
            ) : (
              coords.map((point, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between py-2 text-[15px] font-semibold uppercase tabular-nums text-white/80 ${
                    index < coords.length - 1 ? 'border-b border-help-line' : ''
                  }`}
                >
                  <span>
                    #{index + 1} · X {point.x.toFixed(2)} · Y {point.y.toFixed(2)} · Z {point.z.toFixed(2)}
                  </span>
                  {inputMode === 'position' && (
                    <button
                      type="button"
                      onClick={() => handleRemovePoint(index)}
                      className="text-white/50 transition hover:text-help-danger"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
          {coords.length < 3 && coords.length > 0 && (
            <p className="text-[14px] font-semibold uppercase text-help-warning">{t('modal_territory_min_points')}</p>
          )}
        </div>
      </form>
    </Modal>
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
  const { t } = useTranslation()
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
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      icon={FlaskConical}
      subtitle={t('modal_lab_subtitle')}
      title={t('labs_create')}
      width="max-w-md"
      footer={
        <>
          <Button variant="ghost" onClick={handleCancel}>
            {t('btn_cancel')}
          </Button>
          <Button variant="primary" type="submit" form="create-lab-form" disabled={!coords || !label.trim()}>
            {t('labs_create')}
          </Button>
        </>
      }
    >
      <form id="create-lab-form" onSubmit={handleSubmit} className="space-y-4">
        <Field label={t('modal_lab_name')}>
          <Input
            type="text"
            required
            placeholder={t('modal_lab_name_placeholder')}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </Field>

        <Field label={t('modal_lab_type')}>
          <Tabs
            value={type}
            onChange={setType}
            options={(['weed', 'meth', 'coke'] as const).map((labType) => ({ value: labType, label: t(`lab_type_${labType}`) }))}
          />
        </Field>

        <Field label={t('modal_coords_mode')}>
          <Tabs
            value={inputMode}
            onChange={setInputMode}
            options={[
              { value: 'position', label: t('modal_coords_position') },
              { value: 'manual', label: t('modal_coords_paste') },
            ]}
          />
        </Field>

        {inputMode === 'position' ? (
          <Button className="w-full" icon={MapPin} onClick={handleGetCurrentPosition} disabled={loading}>
            {coords ? t('modal_lab_update_position') : t('modal_lab_capture_position')}
          </Button>
        ) : (
          <Field label={t('modal_coords_paste')}>
            <TextArea
              placeholder={t('modal_lab_coords_placeholder')}
              value={rawText}
              onChange={(e) => handleManualTextChange(e.target.value)}
              className="h-16 resize-none !text-[15px]"
            />
          </Field>
        )}

        {coords ? (
          <div className="flex items-center justify-between bg-help-panel/60 px-3 py-2.5 text-[15px] font-semibold uppercase">
            <span className="text-white/60">{t('modal_lab_position_saved')}</span>
            <span className="tabular-nums text-help-safe">
              X {coords.x.toFixed(2)} · Y {coords.y.toFixed(2)} · Z {coords.z.toFixed(2)}
            </span>
          </div>
        ) : (
          <p className="border border-dashed border-help-line px-3 py-2.5 text-center text-[14px] uppercase tracking-wide text-white/45">
            {t('modal_lab_no_position')}
          </p>
        )}
      </form>
    </Modal>
  )
}
