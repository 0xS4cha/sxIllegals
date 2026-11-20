import { useState } from 'react'
import { ArrowDown, ArrowUp, Crown, LogOut, UserPlus, UserX } from 'lucide-react'
import { Button, Panel, Row, SearchField, Tag } from '../../../components/ui'
import { useConfirm } from '../../../hooks/useConfirm'
import { useTranslation } from '../../../hooks/useTranslation'
import type { GroupDetail } from '../../../types/group'

interface GroupMembersViewProps {
  group: GroupDetail
  onPromote: (identifier: string) => void
  onDemote: (identifier: string) => void
  onKick: (identifier: string) => void
  onLeave: () => void
  onOpenInviteModal?: () => void
}

export function GroupMembersView({
  group,
  onPromote,
  onDemote,
  onKick,
  onLeave,
  onOpenInviteModal,
}: GroupMembersViewProps) {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const confirmLeave = useConfirm<boolean>()

  const filteredMembers = group.members.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.identifier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.rank.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const { permissions, level: myLevel } = group.myRole

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <SearchField value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t('group_members_search')} />
        <Button
          variant={confirmLeave.pending ? 'danger' : 'ghost'}
          icon={LogOut}
          className={confirmLeave.pending ? '' : 'hover:!border-help-danger hover:!text-help-danger'}
          onClick={() => confirmLeave.request(true, onLeave)}
        >
          {confirmLeave.pending ? t('group_leave_confirm') : t('group_leave')}
        </Button>
        {permissions.canInvite && onOpenInviteModal && (
          <Button variant="primary" icon={UserPlus} onClick={onOpenInviteModal}>
            {t('group_invite_button')}
          </Button>
        )}
      </div>

      <Panel
        header={{ title: t('group_members_title'), watermark: group.name }}
      >
        {filteredMembers.map((member, idx) => (
          <Row
            key={member.identifier}
            index={idx}
            last={idx === filteredMembers.length - 1}
            className="flex-wrap"
            label={
              <span className="flex items-center gap-3">
                <span
                  className={`h-2.5 w-2.5 shrink-0 ${member.isOnline ? 'animate-pulse bg-help-safe' : 'bg-white/30'}`}
                  title={member.isOnline ? t('group_online') : t('group_offline')}
                />
                <span className="min-w-0">
                  <span className="flex items-center gap-2">
                    <span className="truncate">{member.name}</span>
                    {member.isLeader && (
                      <span title={t('group_kpi_leader')}>
                        <Crown className="h-4 w-4 text-help-warning" />
                      </span>
                    )}
                  </span>
                  <span className="block truncate text-[13px] font-medium normal-case tracking-normal text-white/45">
                    {member.identifier}
                  </span>
                </span>
              </span>
            }
          >
            <span className="flex flex-wrap items-center justify-end gap-3">
              <span className="text-[15px] font-semibold uppercase tracking-wide text-white/60">
                {t('group_member_contributions')}{' '}
                <span className="text-white">{t('group_points', { points: member.contributions.toLocaleString() })}</span>
              </span>
              <Tag solid>{member.rank}</Tag>

              {member.rankLevel < myLevel && (permissions.canPromote || permissions.canKick) && (
                <span className="flex items-center gap-1">
                  {permissions.canPromote && (
                    <>
                      <Button
                        size="sm"
                        variant="subtle"
                        icon={ArrowUp}
                        className="!text-help-safe"
                        onClick={() => onPromote(member.identifier)}
                        title={t('group_action_promote')}
                      >
                        <span className="hidden lg:inline">{t('group_action_promote')}</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="subtle"
                        icon={ArrowDown}
                        className="!text-help-warning"
                        onClick={() => onDemote(member.identifier)}
                        title={t('group_action_demote')}
                      >
                        <span className="hidden lg:inline">{t('group_action_demote')}</span>
                      </Button>
                    </>
                  )}
                  {permissions.canKick && (
                    <Button
                      size="sm"
                      variant="subtle"
                      icon={UserX}
                      className="!text-help-danger"
                      onClick={() => onKick(member.identifier)}
                      title={t('group_action_kick')}
                    />
                  )}
                </span>
              )}
            </span>
          </Row>
        ))}
      </Panel>
    </div>
  )
}
