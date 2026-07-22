import { useState } from 'react'
import { motion } from 'motion/react'
import {
  Flame,
  MapPin,
  Navigation,
  RotateCcw,
  Search,
  ShieldCheck,
  Plus,
  Zap,
} from 'lucide-react'
import type { TerritoryItem } from '../../../types/admin'

interface TerritoriesViewProps {
  territories: TerritoryItem[]
  onResetInfluence: (id: string) => void
  onTeleport: (coords: { x: number; y: number; z: number }) => void
  onOpenCreateModal: () => void
}

type TerritoryFilter = 'all' | 'attack' | 'contested' | 'peaceful'

export function TerritoriesView({
  territories,
  onResetInfluence,
  onTeleport,
  onOpenCreateModal,
}: TerritoriesViewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterState, setFilterState] = useState<TerritoryFilter>('all')

  const filteredTerritories = territories.filter((t) => {
    const matchesSearch =
      t.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.controlledBy?.name.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)

    if (!matchesSearch) return false

    if (filterState === 'attack') return t.attackState === 1
    if (filterState === 'contested') return t.attackState === 2
    if (filterState === 'peaceful') return t.attackState === 0
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom de zone, ID ou groupe contrôleur..."
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900/80 pl-9 pr-4 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:border-zinc-700 focus:outline-none"
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
              Tous ({territories.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterState('attack')}
              className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                filterState === 'attack'
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Attaques ({territories.filter((t) => t.attackState === 1).length})
            </button>
            <button
              type="button"
              onClick={() => setFilterState('contested')}
              className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                filterState === 'contested'
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Contestés ({territories.filter((t) => t.attackState === 2).length})
            </button>
          </div>
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="flex items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-100 px-4 py-2 text-xs font-semibold text-zinc-900 transition hover:bg-white hover:shadow-md"
          >
            <Plus className="h-4 w-4" />
            <span>Créer un Territoire</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {filteredTerritories.map((territory, idx) => (
          <motion.div
            key={territory.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="flex flex-col justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-5 space-y-4 hover:border-zinc-700 transition"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-zinc-300" />
                    <h4 className="text-base font-bold text-zinc-100">{territory.label}</h4>
                    <span className="text-xs font-mono text-zinc-500">#{territory.id}</span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-400">
                    Contrôlé par:{' '}
                    <span className="font-semibold text-zinc-200">
                      {territory.controlledBy?.name ?? 'Aucun'}
                    </span>
                  </p>
                </div>

                <div>
                  {territory.attackState === 1 && (
                    <span className="flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-1 text-[11px] font-semibold text-rose-400 border border-rose-500/20 animate-pulse">
                      <Flame className="h-3 w-3" /> Attaque
                    </span>
                  )}
                  {territory.attackState === 2 && (
                    <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-400 border border-amber-500/20">
                      <Zap className="h-3 w-3" /> Contesté
                    </span>
                  )}
                  {territory.attackState === 0 && (
                    <span className="flex items-center gap-1 rounded-full bg-zinc-800 px-2.5 py-1 text-[11px] font-medium text-zinc-400">
                      <ShieldCheck className="h-3 w-3" /> Calme
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-lg border border-zinc-800/60 bg-zinc-950/60 px-3.5 py-2 text-xs">
                <span className="text-zinc-400">
                  Influence Totale:{' '}
                  <span className="font-semibold text-zinc-200">
                    {territory.totalInfluence} pts
                  </span>
                </span>
                <span className="text-zinc-400 font-mono text-[11px]">
                  X: {territory.coords.x.toFixed(1)}, Y: {territory.coords.y.toFixed(1)}
                </span>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>Répartition d'influence</span>
                  <span>{territory.influences.length} groupes présents</span>
                </div>

                <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-800 flex">
                  {territory.influences.map((inf) => (
                    <div
                      key={inf.groupId}
                      style={{ width: `${inf.percentage}%`, backgroundColor: inf.color }}
                      className="h-full transition-all duration-300"
                    />
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  {territory.influences.map((inf) => (
                    <div key={inf.groupId} className="flex items-center gap-2 text-xs">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: inf.color }}
                      />
                      <span className="truncate text-zinc-300 font-medium">{inf.groupName}</span>
                      <span className="ml-auto text-[11px] text-zinc-400 font-semibold">
                        {inf.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-zinc-800/60">
              <button
                type="button"
                onClick={() => onTeleport(territory.coords)}
                className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800 hover:text-white transition"
              >
                <Navigation className="h-3.5 w-3.5" />
                <span>Téléporter TP</span>
              </button>

              <button
                type="button"
                onClick={() => onResetInfluence(territory.id)}
                className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-400 hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-400 transition"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Réinitialiser influence</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
