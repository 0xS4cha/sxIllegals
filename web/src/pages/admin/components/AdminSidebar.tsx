import { BarChart3, FlaskConical, LayoutDashboard, MapPin, Shield, Users } from 'lucide-react'

import { IconBadge, Sidebar, type SidebarItem } from '../../../components/ui'
import { useTranslation } from '../../../hooks/useTranslation'
import type { AdminCategory } from '../../../types/admin'
import { fetchNui } from '../../../utils/fetchNui'

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

  const items: SidebarItem<AdminCategory>[] = [
    { id: 'overview', label: t('admin_sidebar_overview'), icon: LayoutDashboard },
    { id: 'groups', label: t('admin_sidebar_groups'), icon: Users, badge: groupsCount },
    {
      id: 'territories',
      label: t('admin_sidebar_territories'),
      icon: MapPin,
      badge: contestedCount > 0 ? contestedCount : territoriesCount,
      badgeTone: contestedCount > 0 ? 'warning' : 'neutral',
    },
    { id: 'laboratories', label: t('admin_sidebar_laboratories'), icon: FlaskConical, badge: laboratoriesCount },
    { id: 'statistics', label: t('admin_sidebar_statistics'), icon: BarChart3 },
  ]

  return (
    <Sidebar
      brand={<IconBadge icon={Shield} size={34} />}
      subtitle="sxIllegals"
      title={t('admin_sidebar_title')}
      watermark="ADMIN"
      section={t('admin_sidebar_subtitle')}
      items={items}
      active={activeCategory}
      onSelect={onSelectCategory}
      collapsed={collapsed}
      onToggleCollapse={onToggleCollapse}
      collapseLabel={t('menu_collapse')}
      expandLabel={t('menu_expand')}
      closeLabel={t('btn_close')}
      onClose={() => void fetchNui('close')}
      footer={
        <div className="flex items-center justify-between px-1 text-[15px] font-semibold uppercase tracking-wide text-white/55">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse bg-help-safe" />
            {t('admin_system_status')}
          </span>
          <span className="text-white/35">v1.0.0</span>
        </div>
      }
    />
  )
}
