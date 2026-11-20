import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowRight, Crown, Plus, Shield, ShieldAlert, ShieldCheck, Trash2, UserCheck, X } from 'lucide-react'
import { Button, Input, PanelFooter, PanelHeader, Panel, Row, SearchField, SectionLabel, SegmentBar, Tabs, Tag } from '../../../components/ui'
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

const groupColor = (group: GroupItem) => `rgb(${group.rgb.r}, ${group.rgb.g}, ${group.rgb.b})`

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
    const query = searchQuery.toLowerCase()
    const matchesSearch =
      g.name.toLowerCase().includes(query) ||
      g.devise.toLowerCase().includes(query) ||
      g.leaderName.toLowerCase().includes(query)

    if (!matchesSearch) return false
    if (activeFilter === 'official') return g.is_official
    if (activeFilter === 'unofficial') return !g.is_official
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <SearchField value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t('groups_search')} />
          <Tabs
            value={activeFilter}
            onChange={setActiveFilter}
            options={[
              { value: 'all', label: t('filter_all', { count: groups.length }) },
              { value: 'official', label: t('groups_filter_official', { count: groups.filter((g) => g.is_official).length }) },
              { value: 'unofficial', label: t('groups_filter_unofficial', { count: groups.filter((g) => !g.is_official).length }) },
            ]}
          />
        </div>

        <Button variant="primary" icon={Plus} onClick={onOpenCreateModal}>
          {t('groups_create')}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredGroups.map((group, idx) => (
          <Panel
            key={group.id}
            delay={idx * 0.04}
            className={selectedGroup?.id === group.id ? 'ring-2 ring-white' : ''}
            header={{
              subtitle: `#${group.id} · ${group.devise || t('group_no_devise')}`,
              title: (
                <span className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 shrink-0" style={{ backgroundColor: groupColor(group) }} />
                  <span className="truncate">{group.name}</span>
                </span>
              ),
              watermark: group.name,
              actions: (
                <button
                  type="button"
                  onClick={() => onToggleOfficial(group.id)}
                  title={group.is_official ? t('groups_make_unofficial') : t('groups_make_official')}
                  className={`flex h-8 w-8 items-center justify-center transition ${
                    group.is_official ? 'bg-help-safe text-help-panel' : 'border border-help-line text-white/60 hover:text-white'
                  }`}
                >
                  {group.is_official ? <ShieldCheck className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                </button>
              ),
            }}
            footer={{
              children: (
                <span className="flex items-center gap-1">
                  <Button size="sm" variant="subtle" icon={ArrowRight} onClick={() => onSelectGroup(group)}>
                    {t('groups_manage_members', { count: group.members?.length ?? 0 })}
                  </Button>
                  <Button
                    size="sm"
                    variant="subtle"
                    icon={Trash2}
                    className="hover:!text-help-danger"
                    onClick={() => onDeleteGroup(group.id)}
                    title={t('groups_delete')}
                  />
                </span>
              ),
            }}
          >
            <Row label={t('group_members_title')} index={0}>
              <span className="flex items-center gap-2.5">
                <SegmentBar value={group.membersCount} max={group.slots} tone="neutral" />
                <span className="text-[17px] font-semibold uppercase tabular-nums text-white">
                  {group.membersCount}/{group.slots}
                </span>
              </span>
            </Row>
            <Row label={t('group_kpi_leader')} index={1} last>
              <span className="flex items-center gap-2 text-[17px] font-semibold uppercase text-white">
                {group.leaderName}
                <Crown className="h-4 w-4 text-help-warning" />
              </span>
            </Row>
          </Panel>
        ))}
      </div>

      <AnimatePresence>
        {selectedGroup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex justify-end bg-black/60 p-4"
            onClick={() => onSelectGroup(null)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="flex h-full w-full max-w-md flex-col overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.5)]"
              onClick={(e) => e.stopPropagation()}
            >
              <PanelHeader
                subtitle={`ID #${selectedGroup.id}`}
                title={
                  <span className="flex items-center gap-2">
                    <span className="h-3.5 w-3.5 shrink-0" style={{ backgroundColor: groupColor(selectedGroup) }} />
                    {selectedGroup.name}
                  </span>
                }
                watermark={selectedGroup.name}
                actions={
                  <button
                    type="button"
                    onClick={() => onSelectGroup(null)}
                    className="flex h-8 w-8 items-center justify-center text-white/60 transition hover:bg-white/10 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                }
              />

              <div className="flex-1 space-y-5 overflow-auto bg-help-glass-solid px-5 py-4">
                <div>
                  <Row label={t('groups_status')} index={0}>
                    <button type="button" onClick={() => onToggleOfficial(selectedGroup.id)}>
                      <Tag tone={selectedGroup.is_official ? 'safe' : 'neutral'} solid={selectedGroup.is_official}>
                        {selectedGroup.is_official ? t('group_official') : t('group_unofficial')}
                      </Tag>
                    </button>
                  </Row>
                  <p className="pt-2 text-[15px] text-white/60">
                    {selectedGroup.is_official ? t('groups_status_official_desc') : t('groups_status_unofficial_desc')}
                  </p>
                </div>

                <Row label={t('groups_max_slots')} index={1}>
                  <span className="flex items-center gap-3">
                    <span className="text-[15px] uppercase text-white/60">
                      {t('groups_slots_used', { count: selectedGroup.membersCount })}
                    </span>
                    <Input
                      type="number"
                      min={1}
                      max={50}
                      value={selectedGroup.slots}
                      onChange={(e) => onUpdateGroup({ id: selectedGroup.id, slots: Number(e.target.value) })}
                      className="!w-20 text-center"
                    />
                  </span>
                </Row>

                <div className="space-y-1">
                  <SectionLabel>{t('groups_member_list', { count: selectedGroup.members?.length ?? 0 })}</SectionLabel>
                  {selectedGroup.members?.map((member, i, list) => (
                    <Row
                      key={member.identifier}
                      index={i + 2}
                      last={i === list.length - 1}
                      label={
                        <span className="flex items-center gap-2.5">
                          <UserCheck className="h-4 w-4 shrink-0 text-white/60" />
                          <span className="min-w-0">
                            <span className="block truncate">{member.name}</span>
                            <span className="block truncate text-[12px] font-medium normal-case tracking-normal text-white/45">
                              {member.identifier}
                            </span>
                          </span>
                        </span>
                      }
                    >
                      <Tag>{member.rank}</Tag>
                    </Row>
                  ))}
                </div>
              </div>

              <PanelFooter>
                <Button variant="danger" icon={ShieldAlert} onClick={() => onDeleteGroup(selectedGroup.id)}>
                  {t('groups_disband')}
                </Button>
              </PanelFooter>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
