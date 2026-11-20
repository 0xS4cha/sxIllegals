import { Activity, ArrowRight, DollarSign, FlaskConical, MapPin, ShieldCheck, Users } from 'lucide-react'
import { Button, Panel, StackBar, Tag } from '../../../components/ui'
import { useTranslation } from '../../../hooks/useTranslation'
import type { AdminCategory, AdminStats, GroupItem, TerritoryItem } from '../../../types/admin'

interface OverviewViewProps {
  stats: AdminStats
  groups: GroupItem[]
  territories: TerritoryItem[]
  onSelectCategory: (cat: AdminCategory) => void
}

export function OverviewView({ stats, groups, territories, onSelectCategory }: OverviewViewProps) {
  const { t } = useTranslation()

  const kpiCards = [
    {
      title: t('overview_card_groups'),
      value: stats.totalGroups,
      subtitle: t('overview_groups_sub', { official: stats.officialGroups, unofficial: stats.unofficialGroups }),
      icon: Users,
      actionCat: 'groups' as AdminCategory,
    },
    {
      title: t('overview_card_territories'),
      value: stats.totalTerritories,
      subtitle: t('overview_territories_sub', { count: stats.contestedTerritories }),
      icon: MapPin,
      actionCat: 'territories' as AdminCategory,
    },
    {
      title: t('overview_sales'),
      value: t('money', { amount: stats.totalDrugSales24h.toLocaleString() }),
      subtitle: t('overview_sales_sub'),
      icon: DollarSign,
      actionCat: 'statistics' as AdminCategory,
    },
    {
      title: t('overview_card_labs'),
      value: stats.activeLabsCount,
      subtitle: t('overview_labs_sub'),
      icon: FlaskConical,
      actionCat: 'statistics' as AdminCategory,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((card, idx) => (
          <Panel
            key={card.title}
            delay={idx * 0.05}
            onClick={() => onSelectCategory(card.actionCat)}
            header={{ subtitle: card.title, title: <span className="text-[30px]">{card.value}</span> }}
            footer={{ label: <span className="text-[15px] text-white/70">{card.subtitle}</span>, items: [{ value: '', icon: card.icon }] }}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Panel
            delay={0.2}
            header={{
              subtitle: t('overview_see_all', { count: groups.length }),
              title: t('groups_title'),
              icon: Users,
              actions: (
                <Button size="sm" variant="subtle" icon={ArrowRight} onClick={() => onSelectCategory('groups')} />
              ),
            }}
          >
            {groups.slice(0, 3).map((group, i, list) => (
              <div
                key={group.id}
                className={`flex items-center justify-between gap-4 py-3 ${i < list.length - 1 ? 'border-b border-help-line' : ''}`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className="h-8 w-[5px] shrink-0"
                    style={{ backgroundColor: `rgb(${group.rgb.r}, ${group.rgb.g}, ${group.rgb.b})` }}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-[19px] font-semibold uppercase leading-tight tracking-wide text-white">
                        {group.name}
                      </span>
                      {group.is_official && (
                        <Tag tone="safe" icon={ShieldCheck}>
                          {t('group_official')}
                        </Tag>
                      )}
                    </div>
                    <p className="truncate text-[15px] text-white/60">{group.devise || t('group_no_devise')}</p>
                  </div>
                </div>
                <span className="shrink-0 text-[19px] font-semibold uppercase tabular-nums text-white">
                  {group.membersCount}
                  <span className="text-white/50"> {t('overview_members_slots', { slots: group.slots })}</span>
                </span>
              </div>
            ))}
          </Panel>

          <Panel
            delay={0.25}
            header={{
              subtitle: t('overview_manage_territories'),
              title: t('overview_territories_title'),
              icon: MapPin,
              actions: (
                <Button size="sm" variant="subtle" icon={ArrowRight} onClick={() => onSelectCategory('territories')} />
              ),
            }}
          >
            {territories.slice(0, 3).map((territory, i, list) => (
              <div
                key={territory.id}
                className={`space-y-2.5 py-3 ${i < list.length - 1 ? 'border-b border-help-line' : ''}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="truncate text-[19px] font-semibold uppercase tracking-wide text-white">
                      {territory.label}
                    </span>
                    {territory.attackState === 1 && (
                      <Tag tone="danger" solid className="animate-pulse">
                        {t('territory_state_attack')}
                      </Tag>
                    )}
                    {territory.attackState === 2 && <Tag tone="warning">{t('territory_state_contested')}</Tag>}
                  </div>
                  <span className="shrink-0 text-[17px] font-semibold uppercase tabular-nums text-white/70">
                    {t('overview_total_points', { points: territory.totalInfluence })}
                  </span>
                </div>
                <StackBar
                  items={territory.influences.map((inf) => ({
                    key: String(inf.groupId),
                    value: inf.percentage,
                    color: inf.color,
                    title: `${inf.groupName}: ${inf.percentage}%`,
                  }))}
                />
              </div>
            ))}
          </Panel>
        </div>

        <Panel
          delay={0.3}
          className="lg:max-h-[560px]"
          bodyClassName="overflow-auto px-4 py-1"
          header={{
            title: t('overview_recent_activity'),
            icon: Activity,
            actions: <span className="h-2.5 w-2.5 animate-pulse bg-help-safe" />,
          }}
        >
          {stats.recentActivities.map((act, i, list) => (
            <div key={act.id} className={`space-y-1 py-3 ${i < list.length - 1 ? 'border-b border-help-line' : ''}`}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="truncate text-[17px] font-semibold uppercase tracking-wide text-white">{act.title}</span>
                <span className="shrink-0 text-[13px] font-semibold uppercase text-white/50">{act.timestamp}</span>
              </div>
              <p className="text-[15px] leading-snug text-white/70">{act.description}</p>
            </div>
          ))}
        </Panel>
      </div>
    </div>
  )
}
