import { AlertCircle, Check, Mail, RefreshCw, Users, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from '../../../hooks/useTranslation'
import type { GroupInvitation } from '../../../types/group'
import { fetchNui } from '../../../utils/fetchNui'

interface NoGroupViewProps {
  loading: boolean
  error: string | null
  invitations: GroupInvitation[]
  onRefresh: () => Promise<void>
  onRespond: (groupId: string, accept: boolean) => Promise<boolean>
  runAction: (event: string, data: unknown) => Promise<boolean>
  children?: ReactNode
}

export function NoGroupView({ loading, error, invitations, onRefresh, onRespond, children }: NoGroupViewProps) {
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

      {error && (
        <div className="flex items-center gap-2 border-b border-rose-500/20 bg-rose-500/10 px-6 py-2 text-xs text-rose-300">
          <AlertCircle className="h-3.5 w-3.5" />
          {t(`group_error_${error}`)}
        </div>
      )}

      <main className="flex-1 space-y-6 overflow-auto p-6">
        <section className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5">
          <div className="flex items-center gap-2 border-b border-zinc-800/60 pb-4">
            <Mail className="h-4 w-4 text-zinc-300" />
            <h3 className="text-sm font-semibold text-zinc-200">{t('group_invitations_title')}</h3>
          </div>

          {invitations.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <Users className="mb-3 h-8 w-8 text-zinc-700" />
              <p className="text-xs text-zinc-500">{t('group_none_desc')}</p>
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              {invitations.map((invitation) => (
                <div key={invitation.groupId} className="flex items-center justify-between gap-3 rounded-lg border border-zinc-800/60 bg-zinc-950/60 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: `rgb(${invitation.rgb.r}, ${invitation.rgb.g}, ${invitation.rgb.b})` }}
                    />
                    <div>
                      <p className="text-sm font-semibold text-zinc-100">{invitation.groupName}</p>
                      <p className="text-[11px] text-zinc-500">
                        {t('group_invitation_from', { name: invitation.inviter, seconds: invitation.expiresIn })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => void onRespond(invitation.groupId, false)}
                      className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-400 transition hover:text-zinc-200"
                    >
                      <X className="h-3.5 w-3.5" />
                      {t('group_invitation_decline')}
                    </button>
                    <button
                      type="button"
                      onClick={() => void onRespond(invitation.groupId, true)}
                      className="flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-500/20"
                    >
                      <Check className="h-3.5 w-3.5" />
                      {t('group_invitation_accept')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {children}
      </main>
    </div>
  )
}
