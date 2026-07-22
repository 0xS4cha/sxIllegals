import { motion } from 'motion/react'
import {
  Activity,
  Edit3,
  Flame,
  ShieldCheck,
  Users,
  Zap,
} from 'lucide-react'
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
  const onlineCount = group.members.filter((m) => m.isOnline).length

  const kpiCards = [
    {
      title: 'Membres Connectés',
      value: `${onlineCount} / ${group.members.length}`,
      subtitle: `Slots maximaux : ${group.slots}`,
      icon: Users,
      actionCat: 'members' as GroupCategory,
    },
    {
      title: 'Influence du Groupe',
      value: `${group.influenceTotal} pts`,
      subtitle: 'Cumul des missions et ventes',
      icon: Flame,
      actionCat: 'stats' as GroupCategory,
    },
    {
      title: 'Statut de Faction',
      value: group.is_official ? 'Officiel' : 'Non-officiel',
      subtitle: group.is_official ? 'Accès complet aux labos' : 'Faction en développement',
      icon: ShieldCheck,
      actionCat: 'overview' as GroupCategory,
    },
    {
      title: 'Chef de Faction',
      value: group.leaderName,
      subtitle: `Leader principal de ${group.name}`,
      icon: Zap,
      actionCat: 'members' as GroupCategory,
    },
  ]

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-xl border border-zinc-800/80 bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 p-6 shadow-md"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/20 shadow-lg shrink-0"
              style={{
                backgroundColor: `rgb(${group.rgb.r}, ${group.rgb.g}, ${group.rgb.b})`,
              }}
            >
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-zinc-100">{group.name}</h3>
                {group.is_official && (
                  <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                    Groupe Officiel
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-zinc-300 italic">
                "{group.devise || 'Aucune devise définie'}"
              </p>
            </div>
          </div>

          {group.myRole.canManage && (
            <button
              type="button"
              onClick={onOpenEditDeviseModal}
              className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800/80 px-3.5 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 hover:text-white transition shadow-xs"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Modifier Devise</span>
            </button>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((card, idx) => {
          const Icon = card.icon
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => onSelectCategory(card.actionCat)}
              className="group cursor-pointer rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-4 transition hover:border-zinc-700 hover:bg-zinc-900"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400">{card.title}</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-300">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-xl font-bold text-zinc-100">{card.value}</span>
              </div>
              <p className="mt-1 text-xs text-zinc-400">{card.subtitle}</p>
            </motion.div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 lg:col-span-2"
        >
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800/60">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-zinc-300" />
              <h3 className="text-sm font-semibold text-zinc-200">Membres du Groupe</h3>
            </div>
            <button
              type="button"
              onClick={() => onSelectCategory('members')}
              className="text-xs text-zinc-400 hover:text-zinc-200 transition"
            >
              Voir l'annuaire complet ({group.members.length}) →
            </button>
          </div>

          <div className="mt-4 space-y-2.5">
            {group.members.slice(0, 5).map((member) => (
              <div
                key={member.identifier}
                className="flex items-center justify-between rounded-lg border border-zinc-800/50 bg-zinc-950/60 px-4 py-2.5"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      member.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'
                    }`}
                    title={member.isOnline ? 'En ligne' : 'Hors ligne'}
                  />
                  <div>
                    <span className="text-xs font-semibold text-zinc-100">{member.name}</span>
                    <span className="ml-2 text-[10px] font-mono text-zinc-400">
                      {member.identifier}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-300 border border-zinc-700/60">
                    {member.rank}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 flex flex-col"
        >
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800/60">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-zinc-300" />
              <h3 className="text-sm font-semibold text-zinc-200">Journal du Groupe</h3>
            </div>
          </div>

          <div className="mt-4 flex-1 space-y-4 overflow-auto">
            {group.activities.map((act) => (
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
