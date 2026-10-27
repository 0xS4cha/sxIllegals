import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useTranslation } from '../../../hooks/useTranslation'
import type { CreateGroupPayload, GroupCreationSettings } from '../../../types/group'

const COLORS = [
  { r: 147, g: 51, b: 234 },
  { r: 234, g: 179, b: 8 },
  { r: 34, g: 197, b: 94 },
  { r: 14, g: 165, b: 233 },
  { r: 239, g: 68, b: 68 },
  { r: 236, g: 72, b: 153 },
  { r: 249, g: 115, b: 22 },
  { r: 107, g: 114, b: 128 },
]

interface CreateGroupFormProps {
  settings: GroupCreationSettings
  onCreate: (payload: CreateGroupPayload) => Promise<boolean>
}

export function CreateGroupForm({ settings, onCreate }: CreateGroupFormProps) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [devise, setDevise] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [submitting, setSubmitting] = useState(false)

  const nameLength = name.trim().length
  const valid = nameLength >= settings.minLength && nameLength <= settings.maxLength

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!valid || submitting) return
    setSubmitting(true)
    await onCreate({ name: name.trim(), devise: devise.trim(), rgb: color })
    setSubmitting(false)
  }

  return (
    <section className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5">
      <div className="flex items-center justify-between border-b border-zinc-800/60 pb-4">
        <div className="flex items-center gap-2">
          <Plus className="h-4 w-4 text-zinc-300" />
          <h3 className="text-sm font-semibold text-zinc-200">{t('group_create_title')}</h3>
        </div>
        {settings.price > 0 && (
          <span className="rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-400">
            {t('group_create_price', { price: settings.price.toLocaleString() })}
          </span>
        )}
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="mt-4 space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-300">{t('group_create_name')}</label>
          <input
            type="text"
            value={name}
            maxLength={settings.maxLength}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('group_create_name_placeholder')}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-zinc-700 focus:outline-none"
          />
          <p className="text-[11px] text-zinc-500">{t('group_create_name_hint', { min: settings.minLength, max: settings.maxLength })}</p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-300">{t('group_create_devise')}</label>
          <input
            type="text"
            value={devise}
            maxLength={120}
            onChange={(e) => setDevise(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-zinc-700 focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-300">{t('group_create_color')}</label>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((c) => {
              const active = c === color
              return (
                <button
                  key={`${c.r}-${c.g}-${c.b}`}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-7 w-7 rounded-full border-2 transition ${active ? 'border-white' : 'border-transparent hover:border-zinc-600'}`}
                  style={{ backgroundColor: `rgb(${c.r}, ${c.g}, ${c.b})` }}
                />
              )
            })}
          </div>
        </div>

        <div className="flex justify-end border-t border-zinc-800 pt-4">
          <button
            type="submit"
            disabled={!valid || submitting}
            className="rounded-lg border border-zinc-700 bg-zinc-100 px-4 py-2 text-xs font-semibold text-zinc-900 transition hover:bg-white disabled:opacity-50"
          >
            {t('group_create_submit')}
          </button>
        </div>
      </form>
    </section>
  )
}
