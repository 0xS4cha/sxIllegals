import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button, Field, Input, Panel, Tag } from '../../../components/ui'
import { useTranslation } from '../../../hooks/useTranslation'
import type { CreateGroupPayload, GroupCreationSettings } from '../../../types/group'
import { GroupLogoField } from './GroupLogoField'

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
  const [logo, setLogo] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const nameLength = name.trim().length
  const valid = nameLength >= settings.minLength && nameLength <= settings.maxLength

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!valid || submitting) return
    setSubmitting(true)
    await onCreate({ name: name.trim(), devise: devise.trim(), rgb: color, logo: logo || undefined })
    setSubmitting(false)
  }

  return (
    <Panel
      delay={0.1}
      header={{
        title: t('group_create_title'),
        icon: Plus,
        actions:
          settings.price > 0 ? (
            <Tag tone="warning">{t('group_create_price', { price: settings.price.toLocaleString() })}</Tag>
          ) : undefined,
      }}
      footer={{
        children: (
          <Button variant="primary" type="submit" form="player-create-group-form" disabled={!valid || submitting}>
            {t('group_create_submit')}
          </Button>
        ),
      }}
      bodyClassName="px-5 py-4"
    >
      <form id="player-create-group-form" onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        <Field label={t('group_create_name')} hint={t('group_create_name_hint', { min: settings.minLength, max: settings.maxLength })}>
          <Input
            type="text"
            value={name}
            maxLength={settings.maxLength}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('group_create_name_placeholder')}
          />
        </Field>

        <Field label={t('group_create_devise')}>
          <Input type="text" value={devise} maxLength={120} onChange={(e) => setDevise(e.target.value)} />
        </Field>

        <Field label={t('group_create_color')}>
          <span className="flex flex-wrap gap-2">
            {COLORS.map((c) => {
              const active = c === color
              return (
                <button
                  key={`${c.r}-${c.g}-${c.b}`}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-8 w-8 transition ${active ? 'ring-2 ring-white ring-offset-2 ring-offset-help-panel' : 'opacity-75 hover:opacity-100'}`}
                  style={{ backgroundColor: `rgb(${c.r}, ${c.g}, ${c.b})` }}
                />
              )
            })}
          </span>
        </Field>

        {settings.logo && (settings.logo.upload || settings.logo.url) && (
          <GroupLogoField settings={settings.logo} value={logo} onChange={setLogo} />
        )}
      </form>
    </Panel>
  )
}
