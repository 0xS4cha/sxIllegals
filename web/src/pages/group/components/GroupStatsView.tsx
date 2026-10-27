import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { BarChart3, DollarSign, Flame, FlaskConical, Package, Trophy } from 'lucide-react'
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
      <div>
        <h3 className="flex items-center gap-2 text-base font-bold text-zinc-100">
          <BarChart3 className="h-5 w-5 text-zinc-300" />
          {t('group_stats_title')}
        </h3>
        <p className="text-xs text-zinc-400">{t('group_stats_subtitle', { name: group.name })}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon
          const active = metric === kpi.id
          return (
            <motion.button
              key={kpi.id}
              type="button"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => setMetric(kpi.id)}
              className={`rounded-xl border p-4 text-left transition ${active ? 'border-zinc-600 bg-zinc-900' : 'border-zinc-800/80 bg-zinc-900/60 hover:border-zinc-700'}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400">{kpi.title}</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-300">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-3 text-xl font-bold text-zinc-100">{kpi.value}</p>
              <p className="mt-1 text-xs text-zinc-400">{kpi.subtitle}</p>
            </motion.button>
          )
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="space-y-4 rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-6"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            {t(`group_stats_chart_${metric}`)}
          </span>
          {loading && <span className="text-[11px] text-zinc-500">{t('group_stats_loading')}</span>}
        </div>

        {!hasData ? (
          <div className="flex h-48 flex-col items-center justify-center text-center">
            <Package className="mb-2 h-8 w-8 text-zinc-700" />
            <p className="text-xs text-zinc-500">{t('group_stats_empty')}</p>
          </div>
        ) : (
          <div className="relative w-full py-2">
            <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-48 w-full overflow-visible">
              <defs>
                <linearGradient id="groupAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity="0.25" />
                  <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
              </defs>

              <line x1="0" y1={PADDING} x2={WIDTH} y2={PADDING} stroke="#27272a" strokeDasharray="4 4" />
              <line x1="0" y1={HEIGHT / 2} x2={WIDTH} y2={HEIGHT / 2} stroke="#27272a" strokeDasharray="4 4" />
              <line x1="0" y1={HEIGHT - PADDING} x2={WIDTH} y2={HEIGHT - PADDING} stroke="#27272a" />

              {areaPath && <path d={areaPath} fill="url(#groupAreaGradient)" />}
              <motion.path
                key={metric}
                d={linePath}
                fill="none"
                stroke={color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
              />

              {chartPoints.map((pt, idx) => (
                <g key={days[idx].date}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={hoveredIndex === idx ? 6 : 4}
                    className="cursor-pointer fill-zinc-950 stroke-zinc-100 transition-all duration-200"
                    strokeWidth={hoveredIndex === idx ? 3 : 2}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                  <text x={pt.x} y={HEIGHT - 2} textAnchor="middle" className="fill-zinc-500 font-mono text-[10px]">
                    {pt.label}
                  </text>
                </g>
              ))}
            </svg>

            {hoveredIndex !== null && days[hoveredIndex] && (
              <div className="absolute top-2 left-1/2 -translate-x-1/2 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs shadow-xl">
                <span className="font-semibold text-zinc-200">{chartPoints[hoveredIndex].label}</span>
                <span className="ml-2 font-mono text-emerald-400">{formatValue(days[hoveredIndex][metric])}</span>
                {metric === 'sales' && (
                  <span className="ml-2 text-zinc-400">{t('group_stats_units', { count: days[hoveredIndex].units })}</span>
                )}
              </div>
            )}
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4 rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-6"
      >
        <div className="flex items-center justify-between">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-zinc-200">
            <Trophy className="h-4 w-4 text-amber-400" />
            {t('group_stats_contributors')}
          </h4>
          <span className="text-xs text-zinc-400">{t('group_stats_contributors_sub')}</span>
        </div>

        {contributors.length === 0 ? (
          <p className="py-4 text-center text-xs text-zinc-500">{t('group_stats_contributors_empty')}</p>
        ) : (
          <div className="mt-4 space-y-3">
            {contributors.map((c, idx) => (
              <div key={c.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 font-semibold text-zinc-200">
                    <span className="font-mono text-[11px] text-zinc-500">#{idx + 1}</span>
                    {c.name}
                  </span>
                  <span className="font-mono font-medium text-zinc-300">
                    {t('group_points', { points: c.amount.toLocaleString(locale) })} ({c.percentage}%)
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${c.percentage}%` }}
                    transition={{ delay: 0.2 + idx * 0.05, duration: 0.5 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: color }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
