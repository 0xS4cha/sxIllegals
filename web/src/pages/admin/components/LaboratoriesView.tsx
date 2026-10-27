import { useState } from 'react'
import {
  Activity,
  FlaskConical,
  Leaf,
  FlaskRound,
  Navigation,
  Package,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'
import { useConfirm } from '../../../hooks/useConfirm'
import { useTranslation } from '../../../hooks/useTranslation'
import type { GroupItem, LaboratoryItem, UpdateLaboratoryPayload } from '../../../types/admin'

interface LaboratoriesViewProps {
  labs: LaboratoryItem[]
  groups: GroupItem[]
  onUpdateLab: (payload: UpdateLaboratoryPayload) => void
  onTeleport: (coords: { x: number; y: number; z: number }) => void
  onDelete: (labId: string | number) => void
  onOpenCreateModal: () => void
}

type LaboratoryFilter = 'all' | 'weed' | 'coke' | 'meth'

export function LaboratoriesView({ labs, groups, onUpdateLab, onTeleport, onDelete, onOpenCreateModal }: LaboratoriesViewProps) {
  const { t } = useTranslation()
  const confirmDelete = useConfirm<string | number>()
  const [search, setSearch] = useState('')
  const [filterState, setFilterState] = useState<LaboratoryFilter>('all')

  const filteredLabs = labs.filter((l) => {
      const matchesSearch = l.label.toLowerCase().includes(search.toLowerCase()) ||
      l.territoryName.toLowerCase().includes(search.toLowerCase()) ||
      l.type.toLowerCase().includes(search.toLowerCase())
    if (!matchesSearch) return false

    if (filterState === 'coke') return l.type === "coke"
    if (filterState === 'weed') return l.type === "weed"
    if (filterState === 'meth') return l.type === "meth"
    return true
  })

  const getLabIcon = (type: 'coke' | 'meth' | 'weed') => {
    switch (type) {
      case 'coke':
        return <Package className="h-3 w-3 text-sky-400 animate-pulse" />
      case 'meth':
        return <FlaskConical className="h-3 w-3 text-purple-400" />
      case 'weed':
        return <Leaf className="h-3 w-3 text-emerald-400" />
    }
  }

  const getLabBadgeColor = (type: 'coke' | 'meth' | 'weed') => {
    switch (type) {
      case 'coke':
        return 'border-sky-500/20 bg-sky-500/10 text-sky-400'
      case 'meth':
        return 'border-purple-500/20 bg-purple-500/10 text-purple-400'
      case 'weed':
        return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
    }
  }

  const getLabTypeText = (type: 'coke' | 'meth' | 'weed') => {
    switch (type) {
      case 'coke':
        return t('lab_type_coke')
      case 'meth':
        return t('lab_type_meth')
      case 'weed':
        return t('lab_type_weed')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder={t('labs_search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900/60 py-2.5 pl-10 pr-4 text-xs text-zinc-200 placeholder-zinc-500 transition focus:border-zinc-700 focus:outline-none focus:ring-0"
          />
        </div>
          <div className="flex rounded-lg border border-zinc-800 bg-zinc-950/80 p-1">
            <button
              type="button"
              onClick={() => setFilterState('all')}
              className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                filterState === 'all'
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {t('filter_all', { count: labs.length })}
            </button>
            <button
              type="button"
              onClick={() => setFilterState('coke')}
              className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                filterState === 'coke'
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {t('lab_type_coke')} ({labs.filter((item) => item.type === 'coke').length})
            </button>
            <button
              type="button"
              onClick={() => setFilterState('weed')}
              className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                filterState === 'weed'
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {t('lab_type_weed')} ({labs.filter((item) => item.type === 'weed').length})
            </button>
            <button
              type="button"
              onClick={() => setFilterState('meth')}
              className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                filterState === 'meth'
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {t('lab_type_meth')} ({labs.filter((item) => item.type === 'meth').length})
            </button>
          </div>
        <button
          type="button"
          onClick={onOpenCreateModal}
          className="flex items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-100 px-4 py-2.5 text-xs font-semibold text-zinc-900 hover:bg-white transition"
        >
          <Plus className="h-4 w-4" />
          <span>{t('labs_create')}</span>
        </button>
      </div>

      {filteredLabs.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-900/10 p-6 text-center">
          <FlaskConical className="h-8 w-8 text-zinc-600 mb-2" />
          <p className="text-sm font-medium text-zinc-400">{t('labs_empty_title')}</p>
          <p className="text-xs text-zinc-500 max-w-xs mt-1">
            {t('labs_empty_desc')}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          {filteredLabs.map((lab) => (
            <div
              key={lab.id}
              className="group relative overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-900/60 shadow-lg"
            >
              <div
                className={`absolute inset-x-0 top-0 h-[2px] transition-all duration-300`}
              />

              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <FlaskRound className="h-4 w-4 text-zinc-300" />
                    <h4 className="text-base font-bold text-zinc-100">{lab.label}</h4>
                    <span className="text-xs font-mono text-zinc-500">#{lab.id}</span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-400">
                    {t('lab_level')}:{' '}
                    <span className="font-semibold text-zinc-200">
                      {lab.level}
                    </span>
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[9px] font-bold tracking-wider uppercase ${getLabBadgeColor(
                    lab.type
                  )}`}
                >
                  {getLabIcon(lab.type)}
                  <span>{getLabTypeText(lab.type)}</span>
                </span>
              </div>

              <div className="mt-5 space-y-3.5 border-t border-zinc-800/60 pt-4">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-500">{t('labs_territory')}</span>
                  <div className="flex items-center gap-1 text-zinc-300">
                    <FlaskRound className="h-3 w-3 text-zinc-500" />
                    <span>{lab.territoryName}</span>
                  </div>
                </div>

                {(lab.sealedFor ?? 0) > 0 && (
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-[11px] text-rose-300">
                    <span>{t('lab_sealed_for', { minutes: Math.ceil((lab.sealedFor ?? 0) / 60) })}</span>
                    <button
                      type="button"
                      onClick={() => onUpdateLab({ labId: lab.id, ownerId: lab.ownerId ?? null, level: lab.level, unseal: true })}
                      className="rounded-md border border-rose-500/30 px-2 py-0.5 font-semibold text-rose-200 transition hover:bg-rose-500/20"
                    >
                      {t('lab_unseal')}
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between gap-3 text-[11px]">
                  <span className="text-zinc-500">{t('lab_owner')}</span>
                  <select
                    value={lab.ownerId ?? ''}
                    onChange={(e) => onUpdateLab({ labId: lab.id, ownerId: e.target.value || null, level: lab.level })}
                    className="max-w-[60%] rounded-md border border-zinc-800 bg-zinc-950 px-2 py-1 text-[11px] text-zinc-200 focus:border-zinc-700 focus:outline-none"
                  >
                    <option value="">{t('lab_owner_none')}</option>
                    {groups.map((g) => (
                      <option key={g.id} value={String(g.id)}>{g.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between gap-3 text-[11px]">
                  <span className="text-zinc-500">{t('lab_level')}</span>
                  <div className="flex gap-1">
                    {Array.from({ length: lab.maxLevel ?? 3 }, (_, i) => i + 1).map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => onUpdateLab({ labId: lab.id, ownerId: lab.ownerId ?? null, level })}
                        className={`h-6 w-6 rounded-md border text-[11px] font-bold transition ${lab.level === level ? 'border-zinc-500 bg-zinc-700 text-zinc-100' : 'border-zinc-800 bg-zinc-950 text-zinc-500 hover:text-zinc-300'}`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-500">{t('labs_entrance')}</span>
                  <span className="font-mono text-zinc-400">
                    {lab.coords.x.toFixed(1)}, {lab.coords.y.toFixed(1)}, {lab.coords.z.toFixed(1)}
                  </span>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[10px] font-semibold">
                    <span className="text-zinc-500">{t('labs_progress')}</span>
                    <span className="text-zinc-300">{lab.productionPercentage}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-zinc-950 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${lab.type === 'coke'
                        ? 'bg-sky-500'
                        : lab.type === 'meth'
                          ? 'bg-purple-500'
                          : 'bg-emerald-500'
                        }`}
                      style={{ width: `${lab.productionPercentage}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-lg bg-zinc-950/40 border border-zinc-900/60 p-2.5 mt-2.5">
                  <Activity className="h-3.5 w-3.5 text-zinc-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">{t('labs_status')}</p>
                    <p className="text-[11px] font-semibold text-zinc-300 truncate">
                      {lab.productionStatus}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-zinc-800/60 pt-3">
                  <button
                    type="button"
                    onClick={() => onTeleport(lab.coords)}
                    className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
                  >
                    <Navigation className="h-3.5 w-3.5" />
                    <span>{t('btn_teleport')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => confirmDelete.request(lab.id, () => onDelete(lab.id))}
                    className="flex min-w-[160px] items-center justify-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-400 transition hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>{confirmDelete.pending === lab.id ? t('btn_confirm_delete') : t('labs_delete')}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
