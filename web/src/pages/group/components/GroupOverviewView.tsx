import { Activity, ArrowRight, Edit3, Flame, ShieldCheck, Users, Zap } from 'lucide-react'
import { Button, Panel, Row, Tag } from '../../../components/ui'
import { useTranslation } from '../../../hooks/useTranslation'
import type { GroupCategory, GroupDetail } from '../../../types/group'

interface GroupOverviewViewProps {
  group: GroupDetail
  onSelectCategory: (cat: GroupCategory) => void
  onOpenEditDeviseModal: () => void
}

export function GroupOverviewView({
  group,
  onSelectCategory,
  onOpenEditDeviseModal,
}: GroupOverviewViewProps) {
  const { t } = useTranslation()
  const onlineCount = group.members.filter((m) => m.isOnline).length

  const kpiCards = [
    {
      title: t('group_kpi_online'),
      value: `${onlineCount} / ${group.members.length}`,
      subtitle: t('group_kpi_online_sub', { slots: group.slots }),
      icon: Users,
      actionCat: 'members' as GroupCategory,
    },
    {
      title: t('group_kpi_influence'),
      value: t('group_points', { points: group.influenceTotal.toLocaleString() }),
      subtitle: t('group_kpi_influence_sub'),
      icon: Flame,
      actionCat: 'stats' as GroupCategory,
    },
    {
      title: t('group_kpi_status'),
      value: group.is_official ? t('group_official') : t('group_unofficial'),
      subtitle: group.is_official ? t('group_kpi_status_official_sub') : t('group_kpi_status_unofficial_sub'),
      icon: ShieldCheck,
      actionCat: 'overview' as GroupCategory,
    },
    {
      title: t('group_kpi_leader'),
      value: group.leaderName,
      subtitle: t('group_kpi_leader_sub', { name: group.name }),
      icon: Zap,
      actionCat: 'members' as GroupCategory,
    },
  ]

  return (
    <div className="space-y-6">
      <Panel
        header={{
          subtitle: `"${group.devise || t('group_no_devise')}"`,
          title: (
            <span className="flex items-center gap-2.5">
              <span className="h-5 w-5 shrink-0" style={{ backgroundColor: `rgb(${group.rgb.r}, ${group.rgb.g}, ${group.rgb.b})` }} />
              <span className="text-[26px]">{group.name}</span>
              {group.is_official && (
                <Tag tone="safe" solid icon={ShieldCheck}>
                  {t('group_official_badge')}
                </Tag>
              )}
            </span>
          ),
          watermark: group.name,
          actions: group.myRole.permissions.canEditDevise ? (
            <Button size="sm" icon={Edit3} onClick={onOpenEditDeviseModal}>
              {t('group_edit_devise')}
            </Button>
          ) : undefined,
        }}
        footer={{
          label: t('group_kpi_influence'),
          items: [{ value: t('group_points', { points: group.influenceTotal.toLocaleString() }), icon: Flame }],
        }}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((card, idx) => (
          <Panel
            key={card.title}
            delay={idx * 0.05}
            onClick={() => onSelectCategory(card.actionCat)}
            header={{ subtitle: card.title, title: card.value }}
            footer={{ label: <span className="text-[15px] text-white/70">{card.subtitle}</span>, items: [{ value: '', icon: card.icon }] }}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Panel
          delay={0.2}
          className="lg:col-span-2"
          header={{
            subtitle: t('group_members_see_all', { count: group.members.length }),
            title: t('group_members_title'),
            icon: Users,
            actions: <Button size="sm" variant="subtle" icon={ArrowRight} onClick={() => onSelectCategory('members')} />,
          }}
        >
          {group.members.slice(0, 5).map((member, i, list) => (
            <Row
              key={member.identifier}
              index={i}
              last={i === list.length - 1}
              label={
                <span className="flex items-center gap-3">
                  <span
                    className={`h-2.5 w-2.5 shrink-0 ${member.isOnline ? 'animate-pulse bg-help-safe' : 'bg-white/30'}`}
                    title={member.isOnline ? t('group_online') : t('group_offline')}
                  />
                  <span className="truncate">{member.name}</span>
                  <span className="truncate text-[13px] font-medium normal-case tracking-normal text-white/45">{member.identifier}</span>
                </span>
              }
            >
              <Tag>{member.rank}</Tag>
            </Row>
          ))}
        </Panel>

        <Panel
          delay={0.25}
          bodyClassName="overflow-auto px-4 py-1"
          header={{ title: t('group_activity_title'), icon: Activity }}
        >
          {group.activities.length === 0 && (
            <p className="py-6 text-center text-[15px] uppercase tracking-wide text-white/50">{t('group_activity_empty')}</p>
          )}
          {group.activities.map((act, i, list) => (
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
