import { motion } from 'motion/react'
import {
  Activity,
  ArrowUpRight,
  DollarSign,
  FlaskConical,
  MapPin,
  ShieldCheck,
  Users,
} from 'lucide-react'
import type { AdminCategory, AdminStats, GroupItem, TerritoryItem } from '../../../types/admin'

interface OverviewViewProps {
  stats: AdminStats
  groups: GroupItem[]
  territories: TerritoryItem[]
  onSelectCategory: (cat: AdminCategory) => void
}

export function OverviewView({
  stats,
  groups,
  territories,
  onSelectCategory,
}: OverviewViewProps) {
  const kpiCards = [
    {
      title: 'Groupes Totaux',
      value: stats.totalGroups,
      subtitle: `${stats.officialGroups} officiels • ${stats.unofficialGroups} non-officiels`,
      icon: Users,
      actionCat: 'groups' as AdminCategory,
    },
    {
      title: 'Territoires',
      value: stats.totalTerritories,
      subtitle: `${stats.contestedTerritories} en conflit d'influence`,
      icon: MapPin,
      actionCat: 'territories' as AdminCategory,
    },
    {
      title: 'Ventes 24h',
      value: `${stats.totalDrugSales24h.toLocaleString('fr-FR')} $`,
      subtitle: '+14.2% par rapport à hier',
      icon: DollarSign,
      actionCat: 'statistics' as AdminCategory,
    },
    {
      title: 'Laboratoires Actifs',
      value: stats.activeLabsCount,
      subtitle: 'Coke, Meth & Weed sous tension',
      icon: FlaskConical,
      actionCat: 'statistics' as AdminCategory,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((card, idx) => {
          const Icon = card.icon
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.2 }}
              onClick={() => onSelectCategory(card.actionCat)}
              className="group cursor-pointer rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-4 transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-900"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400">{card.title}</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-300 transition group-hover:border-zinc-700 group-hover:text-white">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-zinc-100">{card.value}</span>
                <ArrowUpRight className="h-4 w-4 text-zinc-500 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-zinc-300" />
              </div>
              <p className="mt-1 text-xs text-zinc-400">{card.subtitle}</p>
            </motion.div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5"
          >
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800/60">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-zinc-300" />
                <h3 className="text-sm font-semibold text-zinc-200">Aperçu des Groupes</h3>
              </div>
              <button
                type="button"
                onClick={() => onSelectCategory('groups')}
                className="text-xs text-zinc-400 transition hover:text-zinc-200"
              >
                Voir tout ({groups.length}) →
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {groups.slice(0, 3).map((group) => (
                <div
                  key={group.id}
                  className="flex items-center justify-between rounded-lg border border-zinc-800/50 bg-zinc-950/60 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-3 w-3 rounded-full shadow-sm"
                      style={{
                        backgroundColor: `rgb(${group.rgb.r}, ${group.rgb.g}, ${group.rgb.b})`,
                      }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-zinc-100">{group.name}</span>
                        {group.is_official && (
                          <span className="flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                            <ShieldCheck className="h-3 w-3" /> Officiel
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400">{group.devise || 'Aucune devise'}</p>
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    <span className="font-semibold text-zinc-200">{group.membersCount}</span>
                    <span className="text-zinc-400"> / {group.slots} membres</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5"
          >
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800/60">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-zinc-300" />
                <h3 className="text-sm font-semibold text-zinc-200">Territoires sous Tension</h3>
              </div>
              <button
                type="button"
                onClick={() => onSelectCategory('territories')}
                className="text-xs text-zinc-400 transition hover:text-zinc-200"
              >
                Gérer les territoires →
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {territories.slice(0, 3).map((territory) => (
                <div
                  key={territory.id}
                  className="rounded-lg border border-zinc-800/50 bg-zinc-950/60 p-3.5 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-zinc-100">{territory.label}</span>
                      {territory.attackState === 1 && (
                        <span className="rounded bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold text-rose-400 border border-rose-500/20 animate-pulse">
                          Attaque en cours
                        </span>
                      )}
                      {territory.attackState === 2 && (
                        <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-500/20">
                          Contesté
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-zinc-400">
                      Total: {territory.totalInfluence} pts
                    </span>
                  </div>

                  <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800 flex">
                    {territory.influences.map((inf) => (
                      <div
                        key={inf.groupId}
                        style={{ width: `${inf.percentage}%`, backgroundColor: inf.color }}
                        className="h-full transition-all duration-300"
                        title={`${inf.groupName}: ${inf.percentage}%`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 flex flex-col"
        >
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800/60">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-zinc-300" />
              <h3 className="text-sm font-semibold text-zinc-200">Activités Récentes</h3>
            </div>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <div className="mt-4 flex-1 space-y-4 overflow-auto">
            {stats.recentActivities.map((act) => (
              <div
                key={act.id}
                className="relative pl-4 border-l border-zinc-800 space-y-1 py-0.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-200">{act.title}</span>
                  <span className="text-[10px] text-zinc-400">{act.timestamp}</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">{act.description}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
