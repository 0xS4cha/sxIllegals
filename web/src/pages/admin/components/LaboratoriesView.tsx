import { useState } from 'react'
import {
  Activity,
  FlaskConical,
  Leaf,
  MapPin,
  Package,
  Plus,
  Search,
} from 'lucide-react'
import type { LaboratoryItem } from '../../../types/admin'

interface LaboratoriesViewProps {
  labs: LaboratoryItem[]
  onOpenCreateModal: () => void
}

export function LaboratoriesView({ labs, onOpenCreateModal }: LaboratoriesViewProps) {
  const [search, setSearch] = useState('')

  const filteredLabs = labs.filter(
    (l) =>
      l.label.toLowerCase().includes(search.toLowerCase()) ||
      l.territoryName.toLowerCase().includes(search.toLowerCase()) ||
      l.type.toLowerCase().includes(search.toLowerCase())
  )

  const getLabIcon = (type: 'coke' | 'meth' | 'weed') => {
    switch (type) {
      case 'coke':
        return <Package className="h-5 w-5 text-sky-400 animate-pulse" />
      case 'meth':
        return <FlaskConical className="h-5 w-5 text-purple-400" />
      case 'weed':
        return <Leaf className="h-5 w-5 text-emerald-400" />
    }
  }

  const getLabBadgeColor = (type: 'coke' | 'meth' | 'weed') => {
    switch (type) {
      case 'coke':
        return 'border-sky-500/20 bg-sky-500/10 text-sky-400'
      case 'meth':
        return 'border-purple-500/20 bg-purple-500/10 text-purple-400'
      case 'weed':
        return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
    }
  }

  const getLabTypeText = (type: 'coke' | 'meth' | 'weed') => {
    switch (type) {
      case 'coke':
        return 'Cocaïne'
      case 'meth':
        return 'Méthamphétamine'
      case 'weed':
        return 'Weed'
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Rechercher par nom, type, territoire..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900/60 py-2.5 pl-10 pr-4 text-xs text-zinc-200 placeholder-zinc-500 transition focus:border-zinc-700 focus:outline-none focus:ring-0"
          />
        </div>

        <button
          type="button"
          onClick={onOpenCreateModal}
          className="flex items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-100 px-4 py-2.5 text-xs font-semibold text-zinc-900 hover:bg-white transition"
        >
          <Plus className="h-4 w-4" />
          <span>Créer un Laboratoire</span>
        </button>
      </div>

      {filteredLabs.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-900/10 p-6 text-center">
          <FlaskConical className="h-8 w-8 text-zinc-600 mb-2" />
          <p className="text-sm font-medium text-zinc-400">Aucun laboratoire trouvé</p>
          <p className="text-xs text-zinc-500 max-w-xs mt-1">
            Modifiez votre recherche ou créez un nouveau laboratoire de Coke, Meth ou Weed.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredLabs.map((lab) => (
            <div
              key={lab.id}
              className="group relative overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-900/60 shadow-lg"
            >
              <div
                className={`absolute inset-x-0 top-0 h-[2px] transition-all duration-300 ${lab.type === 'coke'
                  ? 'bg-sky-500/40'
                  : lab.type === 'meth'
                    ? 'bg-purple-500/40'
                    : 'bg-emerald-500/40'
                  }`}
              />

              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg border ${getLabBadgeColor(
                      lab.type
                    )}`}
                  >
                    {getLabIcon(lab.type)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-100 group-hover:text-white transition">
                      {lab.label}
                    </h4>
                    <span className="text-[10px] font-semibold text-zinc-500">
                      Niveau {lab.level}
                    </span>
                  </div>
                </div>

                <span
                  className={`rounded-full border px-2.5 py-0.5 text-[9px] font-bold tracking-wider uppercase ${getLabBadgeColor(
                    lab.type
                  )}`}
                >
                  {getLabTypeText(lab.type)}
                </span>
              </div>

              <div className="mt-5 space-y-3.5 border-t border-zinc-800/60 pt-4">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-500">Territoire</span>
                  <div className="flex items-center gap-1 text-zinc-300">
                    <MapPin className="h-3 w-3 text-zinc-500" />
                    <span>{lab.territoryName}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-500">Coordonnées d'entrée</span>
                  <span className="font-mono text-zinc-400">
                    {lab.coords.x.toFixed(1)}, {lab.coords.y.toFixed(1)}, {lab.coords.z.toFixed(1)}
                  </span>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[10px] font-semibold">
                    <span className="text-zinc-500">Progression de Production</span>
                    <span className="text-zinc-300">{lab.productionPercentage}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-zinc-950 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${lab.type === 'coke'
                        ? 'bg-sky-500'
                        : lab.type === 'meth'
                          ? 'bg-purple-500'
                          : 'bg-emerald-500'
                        }`}
                      style={{ width: `${lab.productionPercentage}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-lg bg-zinc-950/40 border border-zinc-900/60 p-2.5 mt-2.5">
                  <Activity className="h-3.5 w-3.5 text-zinc-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">État actuel</p>
                    <p className="text-[11px] font-semibold text-zinc-300 truncate">
                      {lab.productionStatus}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
