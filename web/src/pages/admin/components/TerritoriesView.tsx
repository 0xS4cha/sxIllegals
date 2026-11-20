import { useState } from 'react'
import { Flame, MapPin, Navigation, Plus, RotateCcw, ShieldCheck, Trash2, Zap } from 'lucide-react'
import { Button, Panel, Row, SearchField, StackBar, Tabs, Tag } from '../../../components/ui'
import { useConfirm } from '../../../hooks/useConfirm'
import { useTranslation } from '../../../hooks/useTranslation'
import type { TerritoryItem } from '../../../types/admin'

interface TerritoriesViewProps {
  territories: TerritoryItem[]
  onResetInfluence: (id: string) => void
  onDelete: (id: string) => void
  onTeleport: (coords: { x: number; y: number; z: number }) => void
  onOpenCreateModal: () => void
}

type TerritoryFilter = 'all' | 'attack' | 'contested' | 'peaceful'

export function TerritoriesView({ territories, onResetInfluence, onDelete, onTeleport, onOpenCreateModal }: TerritoriesViewProps) {
  const { t } = useTranslation()
  const confirmDelete = useConfirm<string>()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterState, setFilterState] = useState<TerritoryFilter>('all')

  const filteredTerritories = territories.filter((item) => {
    const query = searchQuery.toLowerCase()
    const matchesSearch =
      item.label.toLowerCase().includes(query) ||
      item.id.toLowerCase().includes(query) ||
      (item.controlledBy?.name.toLowerCase().includes(query) ?? false)

    if (!matchesSearch) return false
    if (filterState === 'attack') return item.attackState === 1
    if (filterState === 'contested') return item.attackState === 2
    if (filterState === 'peaceful') return item.attackState === 0
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <SearchField value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t('territories_search')} />
        <Tabs
          value={filterState}
          onChange={setFilterState}
          options={[
            { value: 'all', label: t('filter_all', { count: territories.length }) },
            { value: 'attack', label: t('territories_filter_attack', { count: territories.filter((item) => item.attackState === 1).length }) },
            { value: 'contested', label: t('territories_filter_contested', { count: territories.filter((item) => item.attackState === 2).length }) },
          ]}
        />
        <Button variant="primary" icon={Plus} onClick={onOpenCreateModal}>
          {t('territories_create')}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {filteredTerritories.map((territory, idx) => (
          <Panel
            key={territory.id}
            delay={idx * 0.05}
            header={{
              subtitle: `#${territory.id} · X ${territory.coords.x.toFixed(1)} Y ${territory.coords.y.toFixed(1)}`,
              title: territory.label,
              icon: MapPin,
              watermark: territory.label,
              actions: (
                <>
                  {territory.attackState === 1 && (
                    <Tag tone="danger" solid icon={Flame} className="animate-pulse">
                      {t('territory_state_attack')}
                    </Tag>
                  )}
                  {territory.attackState === 2 && (
                    <Tag tone="warning" icon={Zap}>
                      {t('territory_state_contested')}
                    </Tag>
                  )}
                  {territory.attackState === 0 && (
                    <Tag tone="safe" icon={ShieldCheck}>
                      {t('territory_state_calm')}
                    </Tag>
                  )}
                </>
              ),
            }}
            footer={{
              children: (
                <span className="flex flex-wrap items-center gap-1">
                  <Button size="sm" variant="subtle" icon={Navigation} onClick={() => onTeleport(territory.coords)}>
                    {t('btn_teleport')}
                  </Button>
                  <Button
                    size="sm"
                    variant="subtle"
                    icon={RotateCcw}
                    className="hover:!text-help-warning"
                    onClick={() => onResetInfluence(territory.id)}
                  >
                    {t('territories_reset')}
                  </Button>
                  <Button
                    size="sm"
                    variant={confirmDelete.pending === territory.id ? 'danger' : 'subtle'}
                    icon={Trash2}
                    className="hover:!text-help-danger"
                    onClick={() => confirmDelete.request(territory.id, () => onDelete(territory.id))}
                  >
                    {confirmDelete.pending === territory.id ? t('btn_confirm_delete') : t('territories_delete')}
                  </Button>
                </span>
              ),
            }}
          >
            <Row
              index={0}
              label={t('territories_controlled_by')}
              value={territory.controlledBy?.name ?? t('territories_nobody')}
            />
            <Row
              index={1}
              label={t('territories_total_influence')}
              value={t('group_points', { points: territory.totalInfluence })}
            />
            <div className="space-y-2.5 py-3">
              <div className="flex items-center justify-between text-[15px] font-semibold uppercase tracking-wide text-white/60">
                <span>{t('territories_influence_split')}</span>
                <span>{t('territories_groups_present', { count: territory.influences.length })}</span>
              </div>
              <StackBar
                items={territory.influences.map((inf) => ({
                  key: String(inf.groupId),
                  value: inf.percentage,
                  color: inf.color,
                }))}
              />
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-1">
                {territory.influences.map((inf) => (
                  <div key={inf.groupId} className="flex items-center gap-2 text-[15px] font-semibold uppercase">
                    <span className="h-2.5 w-2.5 shrink-0" style={{ backgroundColor: inf.color }} />
                    <span className="truncate text-white/80">{inf.groupName}</span>
                    <span className="ml-auto tabular-nums text-white">{inf.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  )
}
