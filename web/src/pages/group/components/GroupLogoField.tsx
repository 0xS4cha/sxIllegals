import { useRef, useState } from 'react'
import { ImageIcon, Link, Upload, X } from 'lucide-react'
import { Button, fieldClass } from '../../../components/ui'
import { useTranslation } from '../../../hooks/useTranslation'
import type { GroupLogoSettings } from '../../../types/group'

type Mode = 'upload' | 'url'

interface GroupLogoFieldProps {
  settings: GroupLogoSettings
  value: string
  onChange: (value: string) => void
}

const URL_PATTERN = /^https?:\/\/[^\s"'<>`]+$/i

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('read'))
    reader.onload = () => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('decode'))
      img.src = String(reader.result)
    }
    reader.readAsDataURL(file)
  })
}

async function encodeLogo(file: File, size: number, maxLength: number): Promise<string | null> {
  const img = await loadImage(file)
  const scale = Math.min(size / img.width, size / img.height, 1)
  const w = Math.max(1, Math.round(img.width * scale))
  const h = Math.max(1, Math.round(img.height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h)

  for (const quality of [0.9, 0.75, 0.6, 0.45]) {
    let data = canvas.toDataURL('image/webp', quality)
    if (!data.startsWith('data:image/webp')) data = canvas.toDataURL('image/png')
    if (data.length <= maxLength) return data
  }
  return null
}

export function GroupLogoField({ settings, value, onChange }: GroupLogoFieldProps) {
  const { t } = useTranslation()
  const [mode, setMode] = useState<Mode>(settings.upload ? 'upload' : 'url')
  const [url, setUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [previewFailed, setPreviewFailed] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  const switchMode = (next: Mode) => {
    setMode(next)
    setError(null)
    setUrl('')
    onChange('')
  }

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    setError(null)
    setPreviewFailed(false)
    if (!file.type.startsWith('image/')) {
      setError('invalid_logo')
      return
    }
    try {
      const data = await encodeLogo(file, settings.uploadSize, settings.maxUploadLength)
      if (!data) {
        setError('logo_too_large')
        return
      }
      onChange(data)
    } catch {
      setError('invalid_logo')
    }
  }

  const handleUrl = (next: string) => {
    setUrl(next)
    setPreviewFailed(false)
    const trimmed = next.trim()
    if (trimmed === '') {
      setError(null)
      onChange('')
    } else if (trimmed.length > settings.maxUrlLength || !URL_PATTERN.test(trimmed)) {
      setError('invalid_logo')
      onChange('')
    } else {
      setError(null)
      onChange(trimmed)
    }
  }

  const clear = () => {
    setUrl('')
    setError(null)
    setPreviewFailed(false)
    onChange('')
    if (fileInput.current) fileInput.current.value = ''
  }

  const tabClass = (active: boolean) =>
    `flex items-center gap-1.5 px-2.5 py-1 text-[14px] font-semibold uppercase tracking-wide transition ${active ? 'bg-white text-help-panel' : 'text-white/55 hover:text-white'}`

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-[14px] font-semibold uppercase tracking-wider text-white/60">{t('group_create_logo')}</label>
        {settings.upload && settings.url && (
          <div className="flex gap-1 bg-help-panel/80 p-0.5">
            <button type="button" onClick={() => switchMode('upload')} className={tabClass(mode === 'upload')}>
              <Upload className="h-3 w-3" />
              {t('group_create_logo_upload')}
            </button>
            <button type="button" onClick={() => switchMode('url')} className={tabClass(mode === 'url')}>
              <Link className="h-3 w-3" />
              {t('group_create_logo_url')}
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden border border-white/20 bg-help-panel/80">
          {value && !previewFailed ? (
            <img src={value} alt="" className="h-full w-full object-contain" onError={() => setPreviewFailed(true)} />
          ) : (
            <ImageIcon className="h-5 w-5 text-white/30" />
          )}
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-2">
          {mode === 'upload' ? (
            <>
              <input
                ref={fileInput}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={(e) => void handleFile(e.target.files?.[0])}
              />
              <Button icon={Upload} onClick={() => fileInput.current?.click()}>
                {t('group_create_logo_choose')}
              </Button>
            </>
          ) : (
            <input
              type="text"
              value={url}
              maxLength={settings.maxUrlLength}
              onChange={(e) => handleUrl(e.target.value)}
              placeholder="https://"
              className={fieldClass}
            />
          )}
          {value && (
            <button
              type="button"
              onClick={clear}
              title={t('group_create_logo_remove')}
              className="p-1.5 text-white/50 transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {error ? (
        <p className="text-[13px] font-semibold uppercase text-help-danger">{t(`group_error_${error}`)}</p>
      ) : (
        <p className="text-[13px] text-white/45">
          {previewFailed ? t('group_create_logo_preview_failed') : t('group_create_logo_hint')}
        </p>
      )}
    </div>
  )
}
