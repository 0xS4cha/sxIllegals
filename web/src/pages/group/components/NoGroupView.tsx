import { AlertCircle, Check, Mail, RefreshCw, Users, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button, KeyBadge, Panel, PanelHeader, Row } from '../../../components/ui'
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
    <div className="flex h-full w-full flex-col">
      <PanelHeader
        className="h-[68px] shrink-0 px-6"
        icon={Users}
        subtitle={t('group_none_subtitle')}
        title={t('group_none_title')}
        watermark="SXILLEGALS"
        actions={
          <>
            <Button
              size="sm"
              icon={RefreshCw}
              iconClassName={loading ? 'animate-spin' : ''}
              onClick={() => void onRefresh()}
              disabled={loading}
              title={t('btn_refresh')}
            />
            <Button size="sm" onClick={() => void fetchNui('close')}>
              {t('btn_close')}
              <KeyBadge label="ESC" size={20} />
            </Button>
          </>
        }
      />

      {error && (
        <div className="flex items-center gap-2 bg-help-danger px-6 py-2 text-[15px] font-semibold uppercase tracking-wide text-help-panel">
          <AlertCircle className="h-4 w-4" />
          {t(`group_error_${error}`)}
        </div>
      )}

      <main className="flex-1 space-y-6 overflow-auto p-6">
        <Panel header={{ title: t('group_invitations_title'), icon: Mail }}>
          {invitations.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <Users className="mb-3 h-8 w-8 text-white/30" />
              <p className="text-[15px] uppercase tracking-wide text-white/55">{t('group_none_desc')}</p>
            </div>
          ) : (
            invitations.map((invitation, i) => (
              <Row
                key={invitation.groupId}
                index={i}
                last={i === invitations.length - 1}
                label={
                  <span className="flex items-center gap-3">
                    <span
                      className="h-8 w-[5px] shrink-0"
                      style={{ backgroundColor: `rgb(${invitation.rgb.r}, ${invitation.rgb.g}, ${invitation.rgb.b})` }}
                    />
                    <span className="min-w-0">
                      <span className="block truncate">{invitation.groupName}</span>
                      <span className="block truncate text-[13px] font-medium normal-case tracking-normal text-white/55">
                        {t('group_invitation_from', { name: invitation.inviter, seconds: invitation.expiresIn })}
                      </span>
                    </span>
                  </span>
                }
              >
                <span className="flex gap-2">
                  <Button size="sm" icon={X} onClick={() => void onRespond(invitation.groupId, false)}>
                    {t('group_invitation_decline')}
                  </Button>
                  <Button size="sm" variant="safe" icon={Check} onClick={() => void onRespond(invitation.groupId, true)}>
                    {t('group_invitation_accept')}
                  </Button>
                </span>
              </Row>
            ))
          )}
        </Panel>

        {children}
      </main>
    </div>
  )
}
