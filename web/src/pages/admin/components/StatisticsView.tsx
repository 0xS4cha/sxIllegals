import { useState } from 'react'
import { motion } from 'motion/react'
import {
  Activity,
  BarChart3,
  Calendar,
  TrendingUp,
  Zap,
} from 'lucide-react'
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
        <div>
          <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-zinc-300" />
            {t('stats_title')}
          </h3>
          <p className="text-xs text-zinc-400">
            {t('stats_subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-950/80 p-1">
          <Calendar className="ml-2 h-3.5 w-3.5 text-zinc-500" />
          <button
            type="button"
            onClick={() => onTimeFrameChange('24h')}
            className={`rounded-md px-3 py-1 text-xs font-medium transition ${timeFrame === '24h'
              ? 'bg-zinc-800 text-zinc-100 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
              }`}
          >
            {t('stats_time_24h')}
          </button>
          <button
            type="button"
            onClick={() => onTimeFrameChange('7d')}
            className={`rounded-md px-3 py-1 text-xs font-medium transition ${timeFrame === '7d'
              ? 'bg-zinc-800 text-zinc-100 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
              }`}
          >
            {t('stats_time_7d')}
          </button>
          <button
            type="button"
            onClick={() => onTimeFrameChange('30d')}
            className={`rounded-md px-3 py-1 text-xs font-medium transition ${timeFrame === '30d'
              ? 'bg-zinc-800 text-zinc-100 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
              }`}
          >
            {t('stats_time_30d')}
          </button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              {t('stats_sales_evolution')}
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-zinc-100">
                {t('money', { amount: stats.totalDrugSales24h.toLocaleString() })}
              </span>
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
                <TrendingUp className="h-3.5 w-3.5" /> +14.2%
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
              <span className="text-zinc-400">{t('overview_sales')}</span>
            </div>
          </div>
        </div>

        <div className="relative w-full overflow-x-auto py-2">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48 overflow-visible">
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#e4e4e7" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#e4e4e7" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            <line x1="0" y1={padding} x2={width} y2={padding} stroke="#27272a" strokeDasharray="4 4" />
            <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="#27272a" strokeDasharray="4 4" />
            <line x1="0" y1={height - padding} x2={width} y2={height - padding} stroke="#27272a" />

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
              stroke="#e4e4e7"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, ease: 'easeInOut' }}
            />

            {chartPoints.map((pt, idx) => (
              <g key={pt.label}>
                <motion.circle
                  cx={pt.x}
                  cy={pt.y}
                  r={hoveredPointIndex === idx ? 6 : 4}
                  className="cursor-pointer fill-zinc-950 stroke-zinc-100 transition-all duration-200"
                  strokeWidth={hoveredPointIndex === idx ? 3 : 2}
                  onMouseEnter={() => setHoveredPointIndex(idx)}
                  onMouseLeave={() => setHoveredPointIndex(null)}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 + idx * 0.05 }}
                />

                <text
                  x={pt.x}
                  y={height - 2}
                  textAnchor="middle"
                  className="fill-zinc-500 text-[10px] font-mono"
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
              className="absolute top-2 left-1/2 -translate-x-1/2 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs shadow-xl"
            >
              <span className="font-semibold text-zinc-200">
                {points[hoveredPointIndex].label}
              </span>
              <span className="ml-2 font-mono text-emerald-400">
                {t('money', { amount: points[hoveredPointIndex].sales.toLocaleString() })}
              </span>
            </motion.div>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
              <Zap className="h-4 w-4 text-zinc-300" /> {t('stats_prod_category')}
            </h4>
            <span className="text-xs text-zinc-500">{t('stats_total_volume')}</span>
          </div>

          <div className="mt-4 space-y-3">
            {stats.activityBreakdown.map((item, idx) => (
              <div key={item.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-zinc-300">{item.label}</span>
                  <span className="font-mono text-zinc-400">
                    {item.value.toLocaleString()} ({item.percentage}%)
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-800">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{ delay: 0.2 + idx * 0.08, duration: 0.6 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-6 space-y-4"
        >
          <h4 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
            <Activity className="h-4 w-4 text-zinc-300" /> {t('stats_synthetic')}
          </h4>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/60 p-3.5">
              <span className="text-[11px] text-zinc-500 uppercase tracking-wider">
                {t('stats_avg_cart')}
              </span>
              <p className="mt-1 text-lg font-bold text-zinc-100">1,537 $</p>
              <p className="mt-0.5 text-[10px] text-zinc-400">{t('stats_avg_cart_sub')}</p>
            </div>

            <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/60 p-3.5">
              <span className="text-[11px] text-zinc-500 uppercase tracking-wider">
                {t('stats_peak_hour')}
              </span>
              <p className="mt-1 text-lg font-bold text-zinc-100">20:00 - 22:00</p>
              <p className="mt-0.5 text-[10px] text-zinc-400">{t('stats_peak_hour_sub')}</p>
            </div>

            <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/60 p-3.5">
              <span className="text-[11px] text-zinc-500 uppercase tracking-wider">
                {t('stats_top_seller')}
              </span>
              <p className="mt-1 text-lg font-bold text-zinc-100">Vagos</p>
              <p className="mt-0.5 text-[10px] text-zinc-400">{t('stats_top_seller_sub')}</p>
            </div>

            <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/60 p-3.5">
              <span className="text-[11px] text-zinc-500 uppercase tracking-wider">
                {t('stats_success_ratio')}
              </span>
              <p className="mt-1 text-lg font-bold text-emerald-400">98.4 %</p>
              <p className="mt-0.5 text-[10px] text-zinc-400">{t('stats_success_ratio_sub')}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
