import { motion } from 'motion/react'
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  FlaskConical,
  LayoutDashboard,
  MapPin,
  Shield,
  Users,
  X,
} from 'lucide-react'

import type { AdminCategory } from '../../../types/admin'
import { fetchNui } from '../../../utils/fetchNui'
import { useTranslation } from '../../../hooks/useTranslation'

interface AdminSidebarProps {
  activeCategory: AdminCategory
  onSelectCategory: (category: AdminCategory) => void
  groupsCount: number
  territoriesCount: number
  laboratoriesCount: number
  contestedCount: number
  collapsed: boolean
  onToggleCollapse: () => void
}

interface NavItem {
  id: AdminCategory
  label: string
  icon: typeof LayoutDashboard
  badge?: number
  badgeColor?: string
}

export function AdminSidebar({
  activeCategory,
  onSelectCategory,
  groupsCount,
  territoriesCount,
  laboratoriesCount,
  contestedCount,
  collapsed,
  onToggleCollapse,
}: AdminSidebarProps) {
  const { t } = useTranslation()

  const navItems: NavItem[] = [
    {
      id: 'overview',
      label: t('admin_sidebar_overview'),
      icon: LayoutDashboard,
    },
    {
      id: 'groups',
      label: t('admin_sidebar_groups'),
      icon: Users,
      badge: groupsCount,
      badgeColor: 'bg-zinc-800 text-zinc-300 border border-zinc-700',
    },
    {
      id: 'territories',
      label: t('admin_sidebar_territories'),
      icon: MapPin,
      badge: contestedCount > 0 ? contestedCount : territoriesCount,
      badgeColor:
        contestedCount > 0
          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
          : 'bg-zinc-800 text-zinc-300 border border-zinc-700',
    },
    {
      id: 'laboratories',
      label: t('admin_sidebar_laboratories'),
      icon: FlaskConical,
      badge: laboratoriesCount,
      badgeColor: 'bg-zinc-800 text-zinc-300 border border-zinc-700',
    },
    {
      id: 'statistics',
      label: t('admin_sidebar_statistics'),
      icon: BarChart3,
    },
  ]

  const handleClose = () => {
    void fetchNui('close')
  }

  return (
    <aside
      className={`relative flex flex-col border-r border-zinc-800/80 bg-zinc-950/80 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'
        }`}
    >
      <div className="flex h-16 items-center justify-between border-b border-zinc-800/80 px-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-700/60 bg-zinc-900 shadow-sm">
            <Shield className="h-5 w-5 text-zinc-200" />
          </div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col overflow-hidden"
            >
              <span className="truncate text-xs font-semibold uppercase tracking-wider text-zinc-400">
                sxIllegals
              </span>
              <span className="truncate text-sm font-bold text-zinc-100">
                {t('admin_sidebar_title')}
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
              {t('admin_sidebar_subtitle')}
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
              className={`relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${isActive
                ? 'text-zinc-100 font-semibold'
                : 'text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200'
                }`}
              title={collapsed ? item.label : undefined}
            >
              {isActive && (
                <motion.div
                  layoutId="activeSidebarIndicator"
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
                <span
                  className={`relative z-10 rounded-full px-2 py-0.5 text-[11px] font-semibold ${item.badgeColor ?? 'bg-zinc-800 text-zinc-300'
                    }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      <div className="border-t border-zinc-800/80 p-3 space-y-2">
        {!collapsed && (
          <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-2.5">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Système NUI
              </span>
              <span className="text-[11px] text-zinc-500">v1.0.0</span>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleClose}
          className={`flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/80 py-2 text-xs font-medium text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-800 hover:text-white ${collapsed ? 'px-2' : 'px-3'
            }`}
          title={t('btn_close')}
        >
          <X className="h-4 w-4 text-zinc-400" />
          {!collapsed && <span>{t('btn_close')} (ESC)</span>}
        </button>
      </div>
    </aside>
  )
}
