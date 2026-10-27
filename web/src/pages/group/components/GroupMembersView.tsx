import { useState } from 'react'
import { motion } from 'motion/react'
import {
  ArrowDown,
  ArrowUp,
  Crown,
  LogOut,
  Search,
  UserPlus,
  UserX,
} from 'lucide-react'
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('group_members_search')}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900/80 pl-9 pr-4 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:border-zinc-700 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => confirmLeave.request(true, onLeave)}
          className="flex items-center justify-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 transition"
        >
          <LogOut className="h-4 w-4" />
          <span>{confirmLeave.pending ? t('group_leave_confirm') : t('group_leave')}</span>
        </button>

        {permissions.canInvite && onOpenInviteModal && (
          <button
            type="button"
            onClick={onOpenInviteModal}
            className="flex items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-100 px-4 py-2 text-xs font-semibold text-zinc-900 hover:bg-white transition shadow-xs"
          >
            <UserPlus className="h-4 w-4" />
            <span>{t('group_invite_button')}</span>
          </button>
        )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {filteredMembers.map((member, idx) => (
          <motion.div
            key={member.identifier}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-4 gap-4 hover:border-zinc-700 transition"
          >
            <div className="flex items-center gap-3.5">
              <span
                className={`h-3 w-3 rounded-full shrink-0 ${
                  member.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'
                }`}
                title={member.isOnline ? t('group_online') : t('group_offline')}
              />

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-zinc-100">{member.name}</span>
                  {member.isLeader && (
                    <span title={t('group_kpi_leader')}>
                      <Crown className="h-3.5 w-3.5 text-amber-400" />
                    </span>
                  )}
                </div>
                <span className="text-xs text-zinc-400 font-mono">{member.identifier}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div className="rounded border border-zinc-700/80 bg-zinc-800 px-2.5 py-1 text-zinc-200 font-semibold">
                {member.rank}
              </div>

              <div className="text-zinc-400">
                {t('group_member_contributions')}{' '}
                <span className="font-semibold text-zinc-200">
                  {t('group_points', { points: member.contributions.toLocaleString() })}
                </span>
              </div>

            </div>

            {member.rankLevel < myLevel && (permissions.canPromote || permissions.canKick) && (
              <div className="flex items-center gap-1.5 self-end sm:self-auto">
                {permissions.canPromote && (
                <>
                <button
                  type="button"
                  onClick={() => onPromote(member.identifier)}
                  title={t('group_action_promote')}
                  className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-xs font-medium text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/10 transition"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                  <span className="hidden lg:inline">{t('group_action_promote')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onDemote(member.identifier)}
                  title={t('group_action_demote')}
                  className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-xs font-medium text-amber-400 hover:border-amber-500/30 hover:bg-amber-500/10 transition"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                  <span className="hidden lg:inline">{t('group_action_demote')}</span>
                </button>
                </>
                )}

                {permissions.canKick && (
                <button
                  type="button"
                  onClick={() => onKick(member.identifier)}
                  title={t('group_action_kick')}
                  className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-950 p-1.5 text-xs font-medium text-rose-400 hover:border-rose-500/30 hover:bg-rose-500/10 transition ml-1"
                >
                  <UserX className="h-4 w-4" />
                </button>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
