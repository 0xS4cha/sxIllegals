import { motion } from 'motion/react'
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Crown,
  LayoutDashboard,
  ShieldCheck,
  ShieldHalf,
  Users,
  X,
} from 'lucide-react'

import type { GroupCategory, GroupDetail } from '../../../types/group'
import { fetchNui } from '../../../utils/fetchNui'

interface GroupSidebarProps {
  group: GroupDetail
  activeCategory: GroupCategory
  onSelectCategory: (category: GroupCategory) => void
  collapsed: boolean
  onToggleCollapse: () => void
}

interface NavItem {
  id: GroupCategory
  label: string
  icon: typeof LayoutDashboard
  badge?: number
}

export function GroupSidebar({
  group,
  activeCategory,
  onSelectCategory,
  collapsed,
  onToggleCollapse,
}: GroupSidebarProps) {
  const navItems: NavItem[] = [
    {
      id: 'overview',
      label: 'Accueil Groupe',
      icon: LayoutDashboard,
    },
    {
      id: 'members',
      label: 'Membres & Rôles',
      icon: Users,
      badge: group.members.length,
    },
    {
      id: 'ranks',
      label: 'Rangs & Permissions',
      icon: ShieldHalf,
    },
    {
      id: 'stats',
      label: 'Statistiques Groupe',
      icon: BarChart3,
    },
  ]

  const handleClose = () => {
    void fetchNui('close')
  }

  return (
    <aside
      className={`relative flex flex-col border-r border-zinc-800/80 bg-zinc-950/80 transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="flex h-16 items-center justify-between border-b border-zinc-800/80 px-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/20 shadow-md"
            style={{
              backgroundColor: `rgb(${group.rgb.r}, ${group.rgb.g}, ${group.rgb.b})`,
            }}
          >
            <Crown className="h-5 w-5 text-white drop-shadow-sm" />
          </div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col overflow-hidden"
            >
              <div className="flex items-center gap-1.5">
                <span className="truncate text-sm font-bold text-zinc-100">
                  {group.name}
                </span>
                {group.is_official && (
                  <span title="Groupe Officiel">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  </span>
                )}
              </div>
              <span className="truncate text-[10px] text-zinc-400 font-medium">
                {group.devise || 'Faction Illegale'}
              </span>
            </motion.div>
          )}
        </div>

        <button
          type="button"
          onClick={onToggleCollapse}
          className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 transition hover:bg-zinc-800/60 hover:text-zinc-200"
          title={collapsed ? 'Déplier le menu' : 'Réduire le menu'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 space-y-1.5 p-3">
        <div className="mb-2 px-2">
          {!collapsed && (
            <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-500">
              Espace Faction
            </span>
          )}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeCategory === item.id

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectCategory(item.id)}
              className={`relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'text-zinc-100 font-semibold'
                  : 'text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200'
              }`}
              title={collapsed ? item.label : undefined}
            >
              {isActive && (
                <motion.div
                  layoutId="activeGroupSidebarIndicator"
                  className="absolute inset-0 rounded-lg border border-zinc-700/80 bg-zinc-900 shadow-inner"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}

              <span className="relative z-10 flex items-center justify-center">
                <Icon className={`h-4 w-4 transition-colors ${isActive ? 'text-zinc-100' : 'text-zinc-400'}`} />
              </span>

              {!collapsed && (
                <span className="relative z-10 truncate text-left flex-1">{item.label}</span>
              )}

              {!collapsed && item.badge !== undefined && (
                <span className="relative z-10 rounded-full bg-zinc-800 border border-zinc-700/80 px-2 py-0.5 text-[11px] font-semibold text-zinc-300">
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      <div className="border-t border-zinc-800/80 p-3 space-y-2">
        {!collapsed && (
          <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-2.5 flex items-center justify-between text-xs">
            <span className="text-zinc-400">Votre Rang</span>
            <span className="font-semibold text-zinc-200 rounded bg-zinc-800 px-2 py-0.5 text-[11px]">
              {group.myRole.rank}
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={handleClose}
          className={`flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/80 py-2 text-xs font-medium text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-800 hover:text-white ${
            collapsed ? 'px-2' : 'px-3'
          }`}
          title="Fermer le panel"
        >
          <X className="h-4 w-4 text-zinc-400" />
          {!collapsed && <span>Fermer (ESC)</span>}
        </button>
      </div>
    </aside>
  )
}
