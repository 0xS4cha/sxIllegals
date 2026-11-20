import { useState } from 'react'
import { motion } from 'motion/react'
import {
  Activity,
  BarChart3,
  Calendar,
  TrendingUp,
  Zap,
} from 'lucide-react'
import { IconBadge, Panel, Row, SegmentBar, Tabs } from '../../../components/ui'
import type { AdminStats } from '../../../types/admin'
import { useTranslation } from '../../../hooks/useTranslation'

export type TimeFrame = '24h' | '7d' | '30d'

interface StatisticsViewProps {
  stats: AdminStats
  timeFrame: TimeFrame
  onTimeFrameChange: (tf: TimeFrame) => void
}

export function StatisticsView({ stats, timeFrame, onTimeFrameChange }: StatisticsViewProps) {
  const { t } = useTranslation()
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null)

  const points = stats.timeSeriesData
  const maxSales = Math.max(...points.map((p) => p.sales)) || 100000

  const width = 600
  const height = 180
  const padding = 20

  const chartPoints = points.map((p, i) => {
    const x = padding + (i / (points.length - 1)) * (width - padding * 2)
    const y = height - padding - (p.sales / maxSales) * (height - padding * 2)
    return { x, y, label: p.label, sales: p.sales }
  })

  const linePathD = chartPoints.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`
  }, '')

  const areaPathD = `${linePathD} L ${chartPoints[chartPoints.length - 1].x} ${height} L ${chartPoints[0].x} ${height} Z`

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <IconBadge icon={BarChart3} size={30} />
          <div>
            <div className="text-[21px] font-bold uppercase leading-tight tracking-wide text-white">{t('stats_title')}</div>
            <div className="text-[15px] font-semibold uppercase tracking-wide text-white/55">{t('stats_subtitle')}</div>
          </div>
        </div>

        <span className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-white/50" />
          <Tabs
            value={timeFrame}
            onChange={onTimeFrameChange}
            options={[
              { value: '24h', label: t('stats_time_24h') },
              { value: '7d', label: t('stats_time_7d') },
              { value: '30d', label: t('stats_time_30d') },
            ]}
          />
        </span>
      </div>

      <Panel
        header={{
          subtitle: t('stats_sales_evolution'),
          title: (
            <span className="flex items-baseline gap-3">
              <span className="text-[28px]">{t('money', { amount: stats.totalDrugSales24h.toLocaleString() })}</span>
              <span className="flex items-center gap-1 text-[17px] text-help-safe">
                <TrendingUp className="h-4 w-4" /> +14.2%
              </span>
            </span>
          ),
          actions: (
            <span className="flex items-center gap-2 text-[15px] font-semibold uppercase tracking-wide text-white/60">
              <span className="h-2.5 w-2.5 bg-help-accent" />
              {t('overview_sales')}
            </span>
          ),
        }}
        bodyClassName="px-4 py-3"
      >
        <div className="relative w-full overflow-x-auto py-2">
          <svg viewBox={`0 0 ${width} ${height}`} className="h-48 w-full overflow-visible">
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3ee6ff" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#3ee6ff" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            <line x1="0" y1={padding} x2={width} y2={padding} stroke="rgba(255,255,255,0.12)" strokeDasharray="4 4" />
            <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="rgba(255,255,255,0.12)" strokeDasharray="4 4" />
            <line x1="0" y1={height - padding} x2={width} y2={height - padding} stroke="rgba(255,255,255,0.25)" />

            <motion.path
              d={areaPathD}
              fill="url(#areaGradient)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            />

            <motion.path
              d={linePathD}
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinejoin="miter"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, ease: 'easeInOut' }}
            />

            {chartPoints.map((pt, idx) => (
              <g key={pt.label}>
                <motion.rect
                  x={pt.x - (hoveredPointIndex === idx ? 6 : 4)}
                  y={pt.y - (hoveredPointIndex === idx ? 6 : 4)}
                  width={hoveredPointIndex === idx ? 12 : 8}
                  height={hoveredPointIndex === idx ? 12 : 8}
                  className="cursor-pointer transition-all duration-200"
                  fill={hoveredPointIndex === idx ? '#3ee6ff' : '#1b1e2e'}
                  stroke="#ffffff"
                  strokeWidth={2}
                  onMouseEnter={() => setHoveredPointIndex(idx)}
                  onMouseLeave={() => setHoveredPointIndex(null)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 + idx * 0.05 }}
                />

                <text
                  x={pt.x}
                  y={height - 2}
                  textAnchor="middle"
                  className="fill-white/55 text-[12px] font-semibold uppercase"
                >
                  {pt.label}
                </text>
              </g>
            ))}
          </svg>

          {hoveredPointIndex !== null && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute left-1/2 top-2 -translate-x-1/2 bg-help-panel px-3 py-1.5 text-[16px] font-semibold uppercase shadow-xl"
            >
              <span className="text-white">{points[hoveredPointIndex].label}</span>
              <span className="ml-2 text-help-accent">
                {t('money', { amount: points[hoveredPointIndex].sales.toLocaleString() })}
              </span>
            </motion.div>
          )}
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel
          delay={0.1}
          header={{ subtitle: t('stats_total_volume'), title: t('stats_prod_category'), icon: Zap }}
        >
          {stats.activityBreakdown.map((item, idx, list) => (
            <Row key={item.label} label={item.label} index={idx} last={idx === list.length - 1}>
              <span className="flex items-center gap-2.5">
                <SegmentBar value={item.percentage} max={100} tone={item.color} />
                <span className="min-w-[110px] text-right text-[17px] font-semibold tabular-nums text-white">
                  {item.value.toLocaleString()} <span className="text-white/55">({item.percentage}%)</span>
                </span>
              </span>
            </Row>
          ))}
        </Panel>

        <Panel delay={0.15} header={{ title: t('stats_synthetic'), icon: Activity }} bodyClassName="p-0">
          <div className="grid grid-cols-2">
            {[
              { label: t('stats_avg_cart'), value: '1,537 $', sub: t('stats_avg_cart_sub') },
              { label: t('stats_peak_hour'), value: '20:00 - 22:00', sub: t('stats_peak_hour_sub') },
              { label: t('stats_top_seller'), value: 'Vagos', sub: t('stats_top_seller_sub') },
              { label: t('stats_success_ratio'), value: '98.4 %', sub: t('stats_success_ratio_sub'), tone: 'text-help-safe' },
            ].map((cell, i) => (
              <div
                key={cell.label}
                className={`space-y-0.5 px-4 py-3 ${i % 2 === 0 ? 'border-r border-help-line' : ''} ${i < 2 ? 'border-b border-help-line' : ''}`}
              >
                <span className="block text-[13px] font-semibold uppercase tracking-[0.12em] text-white/55">{cell.label}</span>
                <p className={`text-[24px] font-bold uppercase leading-tight ${cell.tone ?? 'text-white'}`}>{cell.value}</p>
                <p className="text-[14px] text-white/55">{cell.sub}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  )
}
