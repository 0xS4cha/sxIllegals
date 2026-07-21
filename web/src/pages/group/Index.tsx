import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  BarChart3,
  LayoutDashboard,
  RefreshCw,
  ShieldHalf,
  Users,
} from 'lucide-react'

import { useGroupData } from '../../hooks/useGroupData'
import type { GroupCategory } from '../../types/group'
import { EditDeviseModal, InviteMemberModal } from './components/GroupModals'
import { GroupMembersView } from './components/GroupMembersView'
import { GroupOverviewView } from './components/GroupOverviewView'
import { GroupRangsView } from './components/GroupRangsView'
import { GroupSidebar } from './components/GroupSidebar'
import { GroupStatsView } from './components/GroupStatsView'

export function GroupPanel() {
  const [activeCategory, setActiveCategory] = useState<GroupCategory>('overview')
  const [collapsedSidebar, setCollapsedSidebar] = useState(false)
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [isEditDeviseModalOpen, setIsEditDeviseModalOpen] = useState(false)

  const {
    group,
    loading,
    refreshGroupData,
    promoteMember,
    demoteMember,
    kickMember,
    inviteMember,
    updateDevise,
    updateRankName,
  } = useGroupData()

  const categoryHeaders: Record<GroupCategory, { title: string; subtitle: string; icon: typeof LayoutDashboard }> = {
    overview: {
      title: 'Accueil & Vue d\'ensemble de la Faction',
      subtitle: `Informations générales et actualités du groupe ${group.name}`,
      icon: LayoutDashboard,
    },
    members: {
      title: 'Membres du Groupe & Rôles',
      subtitle: `Gestion de l'effectif (${group.members.length} / ${group.slots} slots)`,
      icon: Users,
    },
    ranks: {
      title: 'Rangs & Permissions de Faction',
      subtitle: 'Hiérarchie interne et attribution des droits',
      icon: ShieldHalf,
    },
    stats: {
      title: 'Statistiques & Ventes du Groupe',
      subtitle: `Analyse exclusive de l'activité commerciale de ${group.name}`,
      icon: BarChart3,
    },
  }

  const currentHeader = categoryHeaders[activeCategory]
  const CategoryIcon = currentHeader.icon

  return (
    <div className="flex h-full w-full overflow-hidden bg-zinc-950">
      {/* Sidebar */}
      <GroupSidebar
        group={group}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        collapsed={collapsedSidebar}
        onToggleCollapse={() => setCollapsedSidebar((prev) => !prev)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-800/80 bg-zinc-950/60 px-6 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300">
              <CategoryIcon className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100">{currentHeader.title}</h2>
              <p className="text-[11px] text-zinc-400">{currentHeader.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => void refreshGroupData()}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-1.5 text-xs text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-800 hover:text-white disabled:opacity-50"
              title="Rafraîchir les données de groupe"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Actualiser</span>
            </button>
          </div>
        </header>

        {/* Dynamic Category View */}
        <main className="flex-1 overflow-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activeCategory === 'overview' && (
                <GroupOverviewView
                  group={group}
                  onSelectCategory={setActiveCategory}
                  onOpenEditDeviseModal={() => setIsEditDeviseModalOpen(true)}
                />
              )}

              {activeCategory === 'members' && (
                <GroupMembersView
                  group={group}
                  onPromote={promoteMember}
                  onDemote={demoteMember}
                  onKick={kickMember}
                  onOpenInviteModal={() => setIsInviteModalOpen(true)}
                />
              )}

              {activeCategory === 'ranks' && (
                <GroupRangsView
                  group={group}
                  onRenameRank={updateRankName}
                />
              )}

              {activeCategory === 'stats' && (
                <GroupStatsView group={group} />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Modals */}
      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onInvite={inviteMember}
      />

      <EditDeviseModal
        isOpen={isEditDeviseModalOpen}
        currentDevise={group.devise}
        onClose={() => setIsEditDeviseModalOpen(false)}
        onSave={updateDevise}
      />
    </div>
  )
}
