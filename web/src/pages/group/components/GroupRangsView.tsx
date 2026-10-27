import { useState } from 'react'
import { motion } from 'motion/react'
import { Check, Edit2, Shield, ShieldAlert, ShieldCheck } from 'lucide-react'
import { useTranslation } from '../../../hooks/useTranslation'
import { GROUP_PERMISSION_KEYS } from '../../../types/group'
import type { GroupDetail, GroupPermissionKey, GroupRankDetail } from '../../../types/group'

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
    onUpdatePermissions(rank.id, { ...rank.permissions, [key]: !rank.permissions[key] })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
          <Shield className="h-5 w-5 text-zinc-300" />
          Hiérarchie & Permissions des Rangs
        </h3>
        <p className="text-xs text-zinc-400">
          Organisation des grades de la faction et droits associés à chaque niveau
        </p>
      </div>

      <div className="space-y-4">
        {group.ranks.map((rank, idx) => (
          <motion.div
            key={rank.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="flex flex-col md:flex-row md:items-center justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-5 gap-4"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 text-xs font-bold text-zinc-200">
                Lvl {rank.level}
              </span>

              <div>
                {editingRankId === rank.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={tempRankName}
                      onChange={(e) => setTempRankName(e.target.value)}
                      className="rounded border border-zinc-700 bg-zinc-950 px-2.5 py-1 text-xs text-zinc-100 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(rank.id)}
                      className="rounded bg-emerald-500/20 p-1 text-emerald-400 hover:bg-emerald-500/30"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-zinc-100">{rank.name}</h4>
                    {canManage && (
                      <button
                        type="button"
                        onClick={() => handleStartEdit(rank.id, rank.name)}
                        className="text-zinc-500 hover:text-zinc-300 transition"
                        title="Renommer ce rang"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                )}
                <span className="text-[11px] text-zinc-400">
                  {rank.id === 0
                    ? 'Niveau Suprême (Chef)'
                    : rank.level === (group.ranks[0]?.level ?? 0) - 1
                    ? 'Commandement Secondaire'
                    : 'Grade Opérationnel'}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {GROUP_PERMISSION_KEYS.map((key) => (
                <PermissionBadge
                  key={key}
                  label={t(`group_perm_${key}`)}
                  enabled={rank.permissions[key]}
                  onToggle={canEditPermissions && rank.id !== 0 ? () => togglePermission(rank, key) : undefined}
                />
              ))}
            </div>
          </motion.div>
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
      className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition enabled:cursor-pointer enabled:hover:brightness-125 ${
        enabled
          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
          : 'border-zinc-800 bg-zinc-950/60 text-zinc-600'
      }`}
    >
      {enabled ? <ShieldCheck className="h-3 w-3" /> : <ShieldAlert className="h-3 w-3" />}
      {label}
    </button>
  )
}
