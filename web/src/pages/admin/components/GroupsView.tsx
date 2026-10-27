import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Crown,
  Plus,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserCheck,
  Users,
  X,
} from 'lucide-react'
import { useTranslation } from '../../../hooks/useTranslation'
import type { CreateGroupPayload, GroupItem, UpdateGroupPayload } from '../../../types/admin'

interface GroupsViewProps {
  groups: GroupItem[]
  onToggleOfficial: (id: string | number) => void
  onDeleteGroup: (id: string | number) => void
  onCreateGroup: (payload: CreateGroupPayload) => void
  onUpdateGroup: (payload: UpdateGroupPayload) => void
  selectedGroup: GroupItem | null
  onSelectGroup: (group: GroupItem | null) => void
  onOpenCreateModal: () => void
}

type FilterTab = 'all' | 'official' | 'unofficial'

export function GroupsView({
  groups,
  onToggleOfficial,
  onDeleteGroup,
  onCreateGroup: _onCreateGroup,
  onUpdateGroup,
  selectedGroup,
  onSelectGroup,
  onOpenCreateModal,
}: GroupsViewProps) {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all')

  const filteredGroups = groups.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.devise.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.leaderName.toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false

    if (activeFilter === 'official') return g.is_official
    if (activeFilter === 'unofficial') return !g.is_official
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('groups_search')}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900/80 pl-9 pr-4 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:border-zinc-700 focus:outline-none"
            />
          </div>

          <div className="flex rounded-lg border border-zinc-800 bg-zinc-950/80 p-1">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`rounded-md px-3 py-1 text-xs font-medium transition ${activeFilter === 'all'
                ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
                }`}
            >
              {t('filter_all', { count: groups.length })}
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('official')}
              className={`rounded-md px-3 py-1 text-xs font-medium transition ${activeFilter === 'official'
                ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
                }`}
            >
              {t('groups_filter_official', { count: groups.filter((g) => g.is_official).length })}
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('unofficial')}
              className={`rounded-md px-3 py-1 text-xs font-medium transition ${activeFilter === 'unofficial'
                ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
                }`}
            >
              {t('groups_filter_unofficial', { count: groups.filter((g) => !g.is_official).length })}
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenCreateModal}
          className="flex items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-100 px-4 py-2 text-xs font-semibold text-zinc-900 transition hover:bg-white hover:shadow-md"
        >
          <Plus className="h-4 w-4" />
          <span>{t('groups_create')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredGroups.map((group, idx) => (
          <motion.div
            key={group.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
            className={`group relative flex flex-col justify-between rounded-xl border bg-zinc-900/60 p-5 transition-all duration-200 hover:bg-zinc-900 ${selectedGroup?.id === group.id
              ? 'border-zinc-500 shadow-lg ring-1 ring-zinc-500/20'
              : 'border-zinc-800/80 hover:border-zinc-700'
              }`}
          >
            <div>
                <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                  <div
                    className="h-4 w-4 rounded-full border border-white/20 shadow-md"
                    style={{
                      backgroundColor: `rgb(${group.rgb.r}, ${group.rgb.g}, ${group.rgb.b})`,
                    }}
                  />
                    <h4 className="text-base font-bold text-zinc-100">{group.name}</h4>
                    <span className="text-xs font-mono text-zinc-500">#{group.id}</span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-400">
                    {t('groups_devise')}{' '}
                    <span className="font-semibold text-zinc-200">
                      {group.devise || t('group_no_devise')}
                    </span>
                  </p>
                </div>


                <button
                  type="button"
                  onClick={() => onToggleOfficial(group.id)}
                  title={group.is_official ? t('groups_make_unofficial') : t('groups_make_official')}
                  className={`rounded-lg p-1.5 transition ${group.is_official
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                    : 'bg-zinc-800/60 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                    }`}
                >
                  {group.is_official ? (
                    <ShieldCheck className="h-4 w-4" />
                  ) : (
                    <Shield className="h-4 w-4" />
                  )}
                </button>
              </div>

              <div className="mt-5 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400 flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-zinc-400" /> {t('group_members_title')}
                  </span>
                  <span className="font-semibold text-zinc-200">
                    {t('groups_slots', { count: group.membersCount, slots: group.slots })}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full bg-zinc-300 transition-all duration-300"
                    style={{
                      width: `${Math.min(100, (group.membersCount / group.slots) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-lg border border-zinc-800/60 bg-zinc-950/60 px-3 py-2 text-xs">
                <span className="text-zinc-400 flex items-center gap-1.5">
                  <Crown className="h-3.5 w-3.5 text-amber-400" /> {t('group_kpi_leader')}
                </span>
                <span className="font-medium text-zinc-200">{group.leaderName}</span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between pt-3 border-t border-zinc-800/60">
              <button
                type="button"
                onClick={() => onSelectGroup(group)}
                className="text-xs font-medium text-zinc-300 hover:text-white transition"
              >
                {t('groups_manage_members', { count: group.members?.length ?? 0 })} →
              </button>

              <button
                type="button"
                onClick={() => onDeleteGroup(group.id)}
                className="p-1 text-zinc-500 hover:text-rose-400 transition"
                title={t('groups_delete')}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedGroup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs p-4"
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="flex h-full w-full max-w-md flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="h-4 w-4 rounded-full border border-white/20"
                    style={{
                      backgroundColor: `rgb(${selectedGroup.rgb.r}, ${selectedGroup.rgb.g}, ${selectedGroup.rgb.b})`,
                    }}
                  />
                  <div>
                    <h3 className="text-lg font-bold text-zinc-100">{selectedGroup.name}</h3>
                    <p className="text-xs text-zinc-400">ID #{selectedGroup.id}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectGroup(null)}
                  className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-auto py-4 space-y-6">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-zinc-300">{t('groups_status')}</span>
                      <p className="text-[11px] text-zinc-400">
                        {selectedGroup.is_official
                          ? t('groups_status_official_desc')
                          : t('groups_status_unofficial_desc')}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onToggleOfficial(selectedGroup.id)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${selectedGroup.is_official
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                        }`}
                    >
                      {selectedGroup.is_official ? t('group_official') : t('group_unofficial')}
                    </button>
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
                  <span className="text-xs font-semibold text-zinc-300">{t('groups_max_slots')}</span>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={selectedGroup.slots}
                      onChange={(e) =>
                        onUpdateGroup({
                          id: selectedGroup.id,
                          slots: Number(e.target.value),
                        })
                      }
                      className="w-24 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-100 focus:outline-none"
                    />
                    <span className="text-xs text-zinc-400">
                      {t('groups_slots_used', { count: selectedGroup.membersCount })}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    {t('groups_member_list', { count: selectedGroup.members?.length ?? 0 })}
                  </h4>

                  <div className="space-y-2">
                    {selectedGroup.members?.map((member) => (
                      <div
                        key={member.identifier}
                        className="flex items-center justify-between rounded-lg border border-zinc-800/80 bg-zinc-900/40 px-3.5 py-2.5"
                      >
                        <div className="flex items-center gap-2.5">
                          <UserCheck className="h-4 w-4 text-zinc-400" />
                          <div>
                            <span className="text-xs font-medium text-zinc-200">
                              {member.name}
                            </span>
                            <span className="block text-[10px] text-zinc-500 font-mono">
                              {member.identifier}
                            </span>
                          </div>
                        </div>

                        <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-300">
                          {member.rank}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-zinc-800 pt-4">
                <button
                  type="button"
                  onClick={() => onDeleteGroup(selectedGroup.id)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 py-2.5 text-xs font-semibold text-rose-400 transition hover:bg-rose-500/20"
                >
                  <ShieldAlert className="h-4 w-4" />
                  {t('groups_disband')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
