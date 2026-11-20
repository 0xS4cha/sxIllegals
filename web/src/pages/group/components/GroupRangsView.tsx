import { useState } from 'react'
import { Check, Edit2, Shield, ShieldAlert, ShieldCheck } from 'lucide-react'
import { Button, IconBadge, Input, Panel, SectionLabel, Tag } from '../../../components/ui'
import { useTranslation } from '../../../hooks/useTranslation'
import { GROUP_PERMISSION_KEYS } from '../../../types/group'
import type { GroupDetail, GroupPermissionDefinition, GroupPermissionKey, GroupRankDetail } from '../../../types/group'

interface GroupRangsViewProps {
  group: GroupDetail
  onRenameRank: (rankId: number, newName: string) => void
  onUpdatePermissions: (rankId: number, permissions: GroupRankDetail['permissions']) => void
}

export function GroupRangsView({ group, onRenameRank, onUpdatePermissions }: GroupRangsViewProps) {
  const { t } = useTranslation()
  const [editingRankId, setEditingRankId] = useState<number | null>(null)
  const [tempRankName, setTempRankName] = useState('')

  const handleStartEdit = (rankId: number, currentName: string) => {
    setEditingRankId(rankId)
    setTempRankName(currentName)
  }

  const handleSaveEdit = (rankId: number) => {
    if (tempRankName.trim()) {
      onRenameRank(rankId, tempRankName.trim())
    }
    setEditingRankId(null)
  }

  const canManage = group.myRole.permissions.canManageRanks
  const canEditPermissions = group.myRole.isLeader

  const togglePermission = (rank: GroupRankDetail, key: GroupPermissionKey) => {
    onUpdatePermissions(rank.id, { ...rank.permissions, [key]: rank.permissions[key] !== true })
  }

  const received: GroupPermissionDefinition[] = Array.isArray(group.permissionDefinitions) ? group.permissionDefinitions : Object.values(group.permissionDefinitions ?? {}) as GroupPermissionDefinition[]
  const definitions: GroupPermissionDefinition[] = received.length > 0 ? received : GROUP_PERMISSION_KEYS.map((key) => ({ key }))
  const sections = definitions.reduce<{ resource?: string; items: GroupPermissionDefinition[] }[]>((list, definition) => {
    const last = list[list.length - 1]
    if (last && last.resource === definition.resource) last.items.push(definition)
    else list.push({ resource: definition.resource, items: [definition] })
    return list
  }, [])

  const permissionLabel = (definition: GroupPermissionDefinition) => {
    const key = `group_perm_${definition.key}`
    const text = t(key)
    return text === key && definition.label ? definition.label : text
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <IconBadge icon={Shield} size={30} />
        <div>
          <div className="text-[21px] font-bold uppercase leading-tight tracking-wide text-white">{t('group_ranks_title')}</div>
          <div className="text-[15px] font-semibold uppercase tracking-wide text-white/55">
            {canEditPermissions ? t('group_ranks_subtitle_leader') : t('group_ranks_subtitle')}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {group.ranks.map((rank, idx) => (
          <Panel
            key={rank.id}
            delay={idx * 0.05}
            header={{
              subtitle: rank.id === 0
                ? t('group_rank_leader')
                : rank.level === (group.ranks[0]?.level ?? 0) - 1
                ? t('group_rank_officer')
                : t('group_rank_member'),
              title: editingRankId === rank.id ? (
                <span className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={tempRankName}
                    onChange={(e) => setTempRankName(e.target.value)}
                    className="!w-56 !py-1 uppercase"
                    autoFocus
                  />
                  <Button size="sm" variant="safe" icon={Check} onClick={() => handleSaveEdit(rank.id)} />
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {rank.name}
                  {canManage && (
                    <button
                      type="button"
                      onClick={() => handleStartEdit(rank.id, rank.name)}
                      className="text-white/45 transition hover:text-white"
                      title={t('group_rank_rename')}
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  )}
                </span>
              ),
              watermark: rank.name,
              actions: <Tag solid>{t('group_rank_level', { level: rank.level })}</Tag>,
            }}
            bodyClassName="space-y-2.5 px-4 py-3"
          >
            {sections.map((section) => (
              <div key={section.resource ?? 'builtin'} className="flex flex-wrap items-center gap-2">
                {section.resource && <SectionLabel>{section.resource}</SectionLabel>}
                {section.items.map((definition) => (
                  <PermissionBadge
                    key={definition.key}
                    label={permissionLabel(definition)}
                    enabled={rank.id === 0 || rank.permissions[definition.key] === true}
                    onToggle={canEditPermissions && rank.id !== 0 ? () => togglePermission(rank, definition.key) : undefined}
                  />
                ))}
              </div>
            ))}
          </Panel>
        ))}
      </div>
    </div>
  )
}

function PermissionBadge({ label, enabled, onToggle }: { label: string; enabled: boolean; onToggle?: () => void }) {
  return (
    <button
      type="button"
      disabled={!onToggle}
      onClick={onToggle}
      className={`flex items-center gap-1.5 px-2.5 py-1 text-[15px] font-semibold uppercase tracking-wide transition enabled:cursor-pointer enabled:hover:brightness-110 ${
        enabled ? 'bg-help-safe text-help-panel' : 'border border-help-line text-white/45'
      }`}
    >
      {enabled ? <ShieldCheck className="h-3.5 w-3.5" /> : <ShieldAlert className="h-3.5 w-3.5" />}
      {label}
    </button>
  )
}
