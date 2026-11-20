import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { BarChart3, DollarSign, Flame, FlaskConical, Package, Trophy } from 'lucide-react'
import { IconBadge, Panel, Row, SegmentBar } from '../../../components/ui'
import { useTranslation } from '../../../hooks/useTranslation'
import type { GroupDetail, GroupStats, GroupStatsDay } from '../../../types/group'

interface GroupStatsViewProps {
  group: GroupDetail
  stats: GroupStats | null
  loading: boolean
  onLoad: () => Promise<void>
}

type Metric = 'sales' | 'influence' | 'production'

const WIDTH = 600
const HEIGHT = 180
const PADDING = 20

export function GroupStatsView({ group, stats, loading, onLoad }: GroupStatsViewProps) {
  const { t, locale } = useTranslation()
  const [metric, setMetric] = useState<Metric>('sales')
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  useEffect(() => {
    void onLoad()
  }, [onLoad])

  const color = `rgb(${group.rgb.r}, ${group.rgb.g}, ${group.rgb.b})`
  const days = stats?.days ?? []
  const totals = stats?.totals ?? { sales: 0, units: 0, production: 0, influence: 0 }
  const contributors = stats?.contributors ?? []

  const dayLabel = (day: GroupStatsDay) => {
    const date = new Date(`${day.date}T12:00:00`)
    return Number.isNaN(date.getTime()) ? day.date : date.toLocaleDateString(locale, { weekday: 'short' })
  }

  const formatValue = (value: number) =>
    metric === 'sales' ? t('group_stats_money', { amount: value.toLocaleString(locale) }) : value.toLocaleString(locale)

  const values = days.map((day) => day[metric])
  const maxValue = Math.max(1, ...values)
  const hasData = values.some((value) => value > 0)

  const chartPoints = days.map((day, i) => ({
    x: days.length > 1 ? PADDING + (i / (days.length - 1)) * (WIDTH - PADDING * 2) : WIDTH / 2,
    y: HEIGHT - PADDING - (day[metric] / maxValue) * (HEIGHT - PADDING * 2),
    label: dayLabel(day),
  }))

  const linePath = chartPoints.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`).join(' ')
  const areaPath = chartPoints.length > 1
    ? `${linePath} L ${chartPoints[chartPoints.length - 1].x} ${HEIGHT - PADDING} L ${chartPoints[0].x} ${HEIGHT - PADDING} Z`
    : ''

  const kpis = [
    { id: 'sales' as const, title: t('group_stats_sales'), value: t('group_stats_money', { amount: totals.sales.toLocaleString(locale) }), subtitle: t('group_stats_units', { count: totals.units }), icon: DollarSign },
    { id: 'influence' as const, title: t('group_stats_influence'), value: t('group_points', { points: totals.influence.toLocaleString(locale) }), subtitle: t('group_stats_influence_sub'), icon: Flame },
    { id: 'production' as const, title: t('group_stats_production'), value: totals.production.toLocaleString(locale), subtitle: t('group_stats_production_sub'), icon: FlaskConical },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <IconBadge icon={BarChart3} size={30} />
        <div>
          <div className="text-[21px] font-bold uppercase leading-tight tracking-wide text-white">{t('group_stats_title')}</div>
          <div className="text-[15px] font-semibold uppercase tracking-wide text-white/55">
            {t('group_stats_subtitle', { name: group.name })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {kpis.map((kpi, idx) => (
          <Panel
            key={kpi.id}
            delay={idx * 0.05}
            onClick={() => setMetric(kpi.id)}
            className={metric === kpi.id ? 'ring-2 ring-white' : 'opacity-80'}
            header={{ subtitle: kpi.title, title: kpi.value }}
            footer={{ label: <span className="text-[15px] text-white/70">{kpi.subtitle}</span>, items: [{ value: '', icon: kpi.icon }] }}
          />
        ))}
      </div>

      <Panel
        delay={0.15}
        header={{
          title: t(`group_stats_chart_${metric}`),
          actions: loading ? (
            <span className="text-[14px] font-semibold uppercase text-white/50">{t('group_stats_loading')}</span>
          ) : undefined,
        }}
        bodyClassName="px-4 py-3"
      >
        {!hasData ? (
          <div className="flex h-48 flex-col items-center justify-center text-center">
            <Package className="mb-2 h-8 w-8 text-white/30" />
            <p className="text-[15px] uppercase tracking-wide text-white/50">{t('group_stats_empty')}</p>
          </div>
        ) : (
          <div className="relative w-full py-2">
            <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-48 w-full overflow-visible">
              <defs>
                <linearGradient id="groupAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity="0.35" />
                  <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
              </defs>

              <line x1="0" y1={PADDING} x2={WIDTH} y2={PADDING} stroke="rgba(255,255,255,0.12)" strokeDasharray="4 4" />
              <line x1="0" y1={HEIGHT / 2} x2={WIDTH} y2={HEIGHT / 2} stroke="rgba(255,255,255,0.12)" strokeDasharray="4 4" />
              <line x1="0" y1={HEIGHT - PADDING} x2={WIDTH} y2={HEIGHT - PADDING} stroke="rgba(255,255,255,0.25)" />

              {areaPath && <path d={areaPath} fill="url(#groupAreaGradient)" />}
              <motion.path
                key={metric}
                d={linePath}
                fill="none"
                stroke={color}
                strokeWidth="2.5"
                strokeLinejoin="miter"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
              />

              {chartPoints.map((pt, idx) => (
                <g key={days[idx].date}>
                  <rect
                    x={pt.x - (hoveredIndex === idx ? 6 : 4)}
                    y={pt.y - (hoveredIndex === idx ? 6 : 4)}
                    width={hoveredIndex === idx ? 12 : 8}
                    height={hoveredIndex === idx ? 12 : 8}
                    className="cursor-pointer transition-all duration-200"
                    fill={hoveredIndex === idx ? color : '#1b1e2e'}
                    stroke="#ffffff"
                    strokeWidth={2}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                  <text x={pt.x} y={HEIGHT - 2} textAnchor="middle" className="fill-white/55 text-[12px] font-semibold uppercase">
                    {pt.label}
                  </text>
                </g>
              ))}
            </svg>

            {hoveredIndex !== null && days[hoveredIndex] && (
              <div className="absolute left-1/2 top-2 -translate-x-1/2 bg-help-panel px-3 py-1.5 text-[16px] font-semibold uppercase shadow-xl">
                <span className="text-white">{chartPoints[hoveredIndex].label}</span>
                <span className="ml-2 text-help-safe">{formatValue(days[hoveredIndex][metric])}</span>
                {metric === 'sales' && (
                  <span className="ml-2 text-white/55">{t('group_stats_units', { count: days[hoveredIndex].units })}</span>
                )}
              </div>
            )}
          </div>
        )}
      </Panel>

      <Panel
        delay={0.2}
        header={{ subtitle: t('group_stats_contributors_sub'), title: t('group_stats_contributors'), icon: Trophy }}
      >
        {contributors.length === 0 ? (
          <p className="py-4 text-center text-[15px] uppercase tracking-wide text-white/50">{t('group_stats_contributors_empty')}</p>
        ) : (
          contributors.map((c, idx) => (
            <Row
              key={c.name}
              index={idx}
              last={idx === contributors.length - 1}
              label={
                <span className="flex items-center gap-2">
                  <span className="text-white/45">#{idx + 1}</span>
                  {c.name}
                </span>
              }
            >
              <span className="flex items-center gap-2.5">
                <SegmentBar value={c.percentage} max={100} tone={color} />
                <span className="min-w-[120px] text-right text-[17px] font-semibold uppercase tabular-nums text-white">
                  {t('group_points', { points: c.amount.toLocaleString(locale) })} <span className="text-white/55">({c.percentage}%)</span>
                </span>
              </span>
            </Row>
          ))
        )}
      </Panel>
    </div>
  )
}
