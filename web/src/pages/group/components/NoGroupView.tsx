import { RefreshCw, Users, X } from 'lucide-react'
import { useTranslation } from '../../../hooks/useTranslation'
import { fetchNui } from '../../../utils/fetchNui'

interface NoGroupViewProps {
  loading: boolean
  onRefresh: () => Promise<void>
  runAction: (event: string, data: unknown) => Promise<boolean>
}

export function NoGroupView({ loading, onRefresh }: NoGroupViewProps) {
  const { t } = useTranslation()

  return (
    <div className="flex h-full w-full flex-col bg-zinc-950">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-800/80 px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-zinc-100">{t('group_none_title')}</h2>
            <p className="text-[11px] text-zinc-400">{t('group_none_subtitle')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void onRefresh()}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-1.5 text-xs text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-800 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => void fetchNui('close')}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-1.5 text-xs text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-800"
          >
            <X className="h-3.5 w-3.5" />
            {t('btn_close')}
          </button>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center p-6">
        <div className="flex max-w-sm flex-col items-center text-center">
          <Users className="mb-3 h-10 w-10 text-zinc-700" />
          <p className="text-sm font-semibold text-zinc-300">{t('group_none_title')}</p>
          <p className="mt-1 text-xs text-zinc-500">{t('group_none_desc')}</p>
        </div>
      </main>
    </div>
  )
}
