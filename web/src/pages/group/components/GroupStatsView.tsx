import { useState } from 'react'
import { motion } from 'motion/react'
import { BarChart3, Trophy } from 'lucide-react'
import type { GroupDetail } from '../../../types/group'

interface GroupStatsViewProps {
  group: GroupDetail
}

export function GroupStatsView({ group }: GroupStatsViewProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const history = group.salesHistory
  const maxSales = Math.max(...history.map((h) => h.sales)) || 50000

  const totalWeekSales = history.reduce((acc, h) => acc + h.sales, 0)
  const totalUnits = history.reduce((acc, h) => acc + h.units, 0)

  const width = 600
  const height = 180
  const padding = 20

  const chartPoints = history.map((pt, i) => {
    const x = padding + (i / (history.length - 1)) * (width - padding * 2)
    const y = height - padding - (pt.sales / maxSales) * (height - padding * 2)
    return { x, y, label: pt.label, sales: pt.sales, units: pt.units }
  })

  const linePathD = chartPoints.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`
  }, '')

  const areaPathD = `${linePathD} L ${chartPoints[chartPoints.length - 1].x} ${height} L ${chartPoints[0].x} ${height} Z`

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-zinc-300" />
          Statistiques de la Faction
        </h3>
        <p className="text-xs text-zinc-400">
          Suivi exclusif des ventes de drogues et contributions des membres de {group.name}
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Ventes de la Semaine ($)
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-zinc-100">
                {totalWeekSales.toLocaleString('fr-FR')} $
              </span>
              <span className="text-xs font-mono text-zinc-400">({totalUnits} pochons)</span>
            </div>
          </div>
        </div>

        <div className="relative w-full overflow-x-auto py-2">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48 overflow-visible">
            <defs>
              <linearGradient id="groupAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={`rgb(${group.rgb.r}, ${group.rgb.g}, ${group.rgb.b})`}
                  stopOpacity="0.25"
                />
                <stop
                  offset="100%"
                  stopColor={`rgb(${group.rgb.r}, ${group.rgb.g}, ${group.rgb.b})`}
                  stopOpacity="0.0"
                />
              </linearGradient>
            </defs>

            <line x1="0" y1={padding} x2={width} y2={padding} stroke="#27272a" strokeDasharray="4 4" />
            <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="#27272a" strokeDasharray="4 4" />
            <line x1="0" y1={height - padding} x2={width} y2={height - padding} stroke="#27272a" />

            <motion.path
              d={areaPathD}
              fill="url(#groupAreaGradient)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            />

            <motion.path
              d={linePathD}
              fill="none"
              stroke={`rgb(${group.rgb.r}, ${group.rgb.g}, ${group.rgb.b})`}
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
                  r={hoveredIndex === idx ? 6 : 4}
                  className="cursor-pointer fill-zinc-950 stroke-zinc-100 transition-all duration-200"
                  strokeWidth={hoveredIndex === idx ? 3 : 2}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4 + idx * 0.05 }}
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

          {hoveredIndex !== null && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-2 left-1/2 -translate-x-1/2 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs shadow-xl"
            >
              <span className="font-semibold text-zinc-200">
                {history[hoveredIndex].label}
              </span>
              <span className="ml-2 font-mono text-emerald-400">
                {history[hoveredIndex].sales.toLocaleString('fr-FR')} $ ({history[hoveredIndex].units} pochons)
              </span>
            </motion.div>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-400" /> Classement des Contributeurs Faction
          </h4>
          <span className="text-xs text-zinc-400">Pourcentage du chiffre d'affaires</span>
        </div>

        <div className="mt-4 space-y-3">
          {group.topContributors.map((c, idx) => (
            <div key={c.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-200 flex items-center gap-2">
                  <span className="text-zinc-500 font-mono text-[11px]">#{idx + 1}</span>
                  {c.name}
                </span>
                <span className="font-mono text-zinc-300 font-medium">
                  {c.amount.toLocaleString('fr-FR')} $ ({c.percentage}%)
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${c.percentage}%` }}
                  transition={{ delay: 0.2 + idx * 0.05, duration: 0.5 }}
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: `rgb(${group.rgb.r}, ${group.rgb.g}, ${group.rgb.b})`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
