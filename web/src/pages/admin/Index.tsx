import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  BarChart3,
  FlaskConical,
  LayoutDashboard,
  MapPin,
  RefreshCw,
  Users,
} from 'lucide-react'

import { useAdminData } from '../../hooks/useAdminData'
import type { AdminCategory } from '../../types/admin'
import { CreateGroupModal } from './components/AdminModals'
import { AdminSidebar } from './components/AdminSidebar'
import { GroupsView } from './components/GroupsView'
import { OverviewView } from './components/OverviewView'
import { StatisticsView } from './components/StatisticsView'
import { TerritoriesView } from './components/TerritoriesView'

export function AdminPanel() {
  const [activeCategory, setActiveCategory] = useState<AdminCategory>('overview')
  const [collapsedSidebar, setCollapsedSidebar] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const {
    groups,
    territories,
    stats,
    loading,
    selectedGroup,
    setSelectedGroup,
    refreshData,
    toggleOfficialGroup,
    deleteGroup,
    createGroup,
    updateGroup,
    resetTerritoryInfluence,
    teleportToTerritory,
  } = useAdminData()

  const contestedCount = territories.filter((t) => t.attackState > 0).length

  const categoryHeaders: Record<AdminCategory, { title: string; subtitle: string; icon: typeof LayoutDashboard }> = {
    overview: {
      title: 'Vue globale du Système',
      subtitle: 'Indicateurs majeurs d\'activité illégale et gestion générale',
      icon: LayoutDashboard,
    },
    groups: {
      title: 'Gestion des Groupes (Groups List)',
      subtitle: 'Contrôle des factions, attribution des slots et statuts officiels',
      icon: Users,
    },
    territories: {
      title: 'Territoires & Influences (Territory List)',
      subtitle: 'Surveillance des zones sous contrôle, conflits et réinitialisations',
      icon: MapPin,
    },
    statistics: {
      title: 'Statistiques & Graphiques de Ventes',
      subtitle: 'Analyse approfondie du trafic de stupéfiants et de la rentabilité',
      icon: BarChart3,
    },
    laboratories: {
      title: 'Laboratoires & Production',
      subtitle: 'Suivi des laboratoires de Cocaïne, Méthamphétamine et Weed',
      icon: FlaskConical,
    },
  }

  const currentHeader = categoryHeaders[activeCategory]
  const CategoryIcon = currentHeader.icon

  return (
    <div className="flex h-full w-full overflow-hidden bg-zinc-950">
      <AdminSidebar
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        groupsCount={groups.length}
        territoriesCount={territories.length}
        contestedCount={contestedCount}
        collapsed={collapsedSidebar}
        onToggleCollapse={() => setCollapsedSidebar((prev) => !prev)}
      />


      <div className="flex flex-1 flex-col overflow-hidden">
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
              onClick={() => void refreshData()}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-1.5 text-xs text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-800 hover:text-white disabled:opacity-50"
              title="Rafraîchir les données NUI"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Actualiser</span>
            </button>
          </div>
        </header>

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
                <OverviewView
                  stats={stats}
                  groups={groups}
                  territories={territories}
                  onSelectCategory={setActiveCategory}
                />
              )}

              {activeCategory === 'groups' && (
                <GroupsView
                  groups={groups}
                  onToggleOfficial={toggleOfficialGroup}
                  onDeleteGroup={deleteGroup}
                  onCreateGroup={createGroup}
                  onUpdateGroup={updateGroup}
                  selectedGroup={selectedGroup}
                  onSelectGroup={setSelectedGroup}
                  onOpenCreateModal={() => setIsCreateModalOpen(true)}
                />
              )}

              {activeCategory === 'territories' && (
                <TerritoriesView
                  territories={territories}
                  onResetInfluence={resetTerritoryInfluence}
                  onTeleport={teleportToTerritory}
                />
              )}

              {activeCategory === 'statistics' && (
                <StatisticsView stats={stats} />
              )}

              {activeCategory === 'laboratories' && (
                <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-900/20 text-center p-6 space-y-2">
                  <FlaskConical className="h-8 w-8 text-zinc-500" />
                  <h3 className="text-sm font-semibold text-zinc-300">Section Laboratoires</h3>
                  <p className="text-xs text-zinc-400 max-w-md">
                    Visualisation et paramétrage des laboratoires de Weed, Cocaïne et Méthamphétamine.
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={createGroup}
      />
    </div>
  )
}
