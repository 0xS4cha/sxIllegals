import { useState } from 'react'
import { Activity, FlaskConical, Leaf, Navigation, Package, Plus, Trash2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button, Panel, Row, SearchField, SegmentBar, Select, Tabs, Tag, type Tone } from '../../../components/ui'
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

type LabType = 'coke' | 'meth' | 'weed'
type LaboratoryFilter = 'all' | LabType

const LAB_STYLE: Record<LabType, { icon: LucideIcon; tone: Tone }> = {
  coke: { icon: Package, tone: 'accent' },
  meth: { icon: FlaskConical, tone: '#c39bff' },
  weed: { icon: Leaf, tone: 'safe' },
}

export function LaboratoriesView({ labs, groups, onUpdateLab, onTeleport, onDelete, onOpenCreateModal }: LaboratoriesViewProps) {
  const { t } = useTranslation()
  const confirmDelete = useConfirm<string | number>()
  const [search, setSearch] = useState('')
  const [filterState, setFilterState] = useState<LaboratoryFilter>('all')

  const filteredLabs = labs.filter((l) => {
    const query = search.toLowerCase()
    const matchesSearch =
      l.label.toLowerCase().includes(query) ||
      l.territoryName.toLowerCase().includes(query) ||
      l.type.toLowerCase().includes(query)
    if (!matchesSearch) return false
    return filterState === 'all' || l.type === filterState
  })

  const count = (type: LabType) => labs.filter((item) => item.type === type).length

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <SearchField value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('labs_search')} />
        <Tabs
          value={filterState}
          onChange={setFilterState}
          options={[
            { value: 'all', label: t('filter_all', { count: labs.length }) },
            { value: 'coke', label: `${t('lab_type_coke')} (${count('coke')})` },
            { value: 'weed', label: `${t('lab_type_weed')} (${count('weed')})` },
            { value: 'meth', label: `${t('lab_type_meth')} (${count('meth')})` },
          ]}
        />
        <Button variant="primary" icon={Plus} onClick={onOpenCreateModal}>
          {t('labs_create')}
        </Button>
      </div>

      {filteredLabs.length === 0 ? (
        <Panel
          header={{ title: t('labs_empty_title'), icon: FlaskConical }}
          bodyClassName="px-4 py-4 text-[16px] text-white/70"
        >
          {t('labs_empty_desc')}
        </Panel>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredLabs.map((lab, idx) => {
            const style = LAB_STYLE[lab.type]
            const sealed = (lab.sealedFor ?? 0) > 0
            return (
              <Panel
                key={lab.id}
                delay={idx * 0.05}
                header={{
                  subtitle: `#${lab.id} · ${lab.territoryName}`,
                  title: lab.label,
                  watermark: t(`lab_type_${lab.type}`),
                  actions: (
                    <Tag tone={style.tone} icon={style.icon}>
                      {t(`lab_type_${lab.type}`)}
                    </Tag>
                  ),
                }}
                footer={{
                  children: (
                    <span className="flex items-center gap-1">
                      <Button size="sm" variant="subtle" icon={Navigation} onClick={() => onTeleport(lab.coords)}>
                        {t('btn_teleport')}
                      </Button>
                      <Button
                        size="sm"
                        variant={confirmDelete.pending === lab.id ? 'danger' : 'subtle'}
                        icon={Trash2}
                        className="hover:!text-help-danger"
                        onClick={() => confirmDelete.request(lab.id, () => onDelete(lab.id))}
                      >
                        {confirmDelete.pending === lab.id ? t('btn_confirm_delete') : t('labs_delete')}
                      </Button>
                    </span>
                  ),
                }}
              >
                {sealed && (
                  <div className="-mx-4 flex items-center justify-between gap-3 bg-help-danger px-4 py-2 text-[16px] font-semibold uppercase tracking-wide text-help-panel">
                    <span>{t('lab_sealed_for', { minutes: Math.ceil((lab.sealedFor ?? 0) / 60) })}</span>
                    <button
                      type="button"
                      onClick={() => onUpdateLab({ labId: lab.id, ownerId: lab.ownerId ?? null, level: lab.level, unseal: true })}
                      className="bg-help-panel px-2 py-1 text-[14px] text-white transition hover:bg-black"
                    >
                      {t('lab_unseal')}
                    </button>
                  </div>
                )}

                <Row label={t('lab_owner')} index={0}>
                  <Select
                    value={lab.ownerId ?? ''}
                    onChange={(e) => onUpdateLab({ labId: lab.id, ownerId: e.target.value || null, level: lab.level })}
                    className="!w-auto max-w-[60%] !py-1 uppercase"
                  >
                    <option value="">{t('lab_owner_none')}</option>
                    {groups.map((g) => (
                      <option key={g.id} value={String(g.id)}>
                        {g.name}
                      </option>
                    ))}
                  </Select>
                </Row>

                <Row label={t('lab_level')} index={1}>
                  <span className="flex gap-1">
                    {Array.from({ length: lab.maxLevel ?? 3 }, (_, i) => i + 1).map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => onUpdateLab({ labId: lab.id, ownerId: lab.ownerId ?? null, level })}
                        className={`h-8 w-8 text-[17px] font-bold transition ${
                          lab.level === level ? 'bg-white text-help-panel' : 'border border-help-line text-white/55 hover:text-white'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </span>
                </Row>

                <Row
                  label={t('labs_entrance')}
                  index={2}
                  value={`${lab.coords.x.toFixed(1)}, ${lab.coords.y.toFixed(1)}, ${lab.coords.z.toFixed(1)}`}
                  tone="rgba(255,255,255,0.7)"
                />

                <Row label={t('labs_progress')} index={3}>
                  <span className="flex items-center gap-2.5">
                    <SegmentBar value={lab.productionPercentage} max={100} tone={style.tone} />
                    <span className="min-w-[48px] text-right text-[17px] font-semibold tabular-nums" style={{ color: 'white' }}>
                      {lab.productionPercentage}%
                    </span>
                  </span>
                </Row>

                <Row label={t('labs_status')} index={4} last>
                  <span className="flex min-w-0 items-center gap-2 text-[17px] font-semibold uppercase text-white">
                    <span className="truncate">{lab.productionStatus}</span>
                    <Activity className="h-4 w-4 shrink-0 text-white/60" />
                  </span>
                </Row>
              </Panel>
            )
          })}
        </div>
      )}
    </div>
  )
}
