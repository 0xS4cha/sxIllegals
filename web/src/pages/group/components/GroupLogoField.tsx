import { useRef, useState } from 'react'
import { ImageIcon, Link, Upload, X } from 'lucide-react'
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
    `flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-semibold transition ${active ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-zinc-300">{t('group_create_logo')}</label>
        {settings.upload && settings.url && (
          <div className="flex gap-1 rounded-lg border border-zinc-800 bg-zinc-900 p-0.5">
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
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900">
          {value && !previewFailed ? (
            <img src={value} alt="" className="h-full w-full object-contain" onError={() => setPreviewFailed(true)} />
          ) : (
            <ImageIcon className="h-5 w-5 text-zinc-600" />
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
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                className="rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs font-semibold text-zinc-200 transition hover:border-zinc-700"
              >
                {t('group_create_logo_choose')}
              </button>
            </>
          ) : (
            <input
              type="text"
              value={url}
              maxLength={settings.maxUrlLength}
              onChange={(e) => handleUrl(e.target.value)}
              placeholder="https://"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-zinc-700 focus:outline-none"
            />
          )}
          {value && (
            <button
              type="button"
              onClick={clear}
              title={t('group_create_logo_remove')}
              className="rounded-md p-1.5 text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-200"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {error ? (
        <p className="text-[11px] text-red-400">{t(`group_error_${error}`)}</p>
      ) : (
        <p className="text-[11px] text-zinc-500">
          {previewFailed ? t('group_create_logo_preview_failed') : t('group_create_logo_hint')}
        </p>
      )}
    </div>
  )
}
