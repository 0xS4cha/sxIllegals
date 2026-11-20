import { BarChart3, Crown, LayoutDashboard, ShieldCheck, ShieldHalf, Users } from 'lucide-react'

import { Sidebar, Tag, type SidebarItem } from '../../../components/ui'
import { useTranslation } from '../../../hooks/useTranslation'
import type { GroupCategory, GroupDetail } from '../../../types/group'
import { fetchNui } from '../../../utils/fetchNui'

interface GroupSidebarProps {
  group: GroupDetail
  activeCategory: GroupCategory
  onSelectCategory: (category: GroupCategory) => void
  collapsed: boolean
  onToggleCollapse: () => void
}

export function GroupSidebar({ group, activeCategory, onSelectCategory, collapsed, onToggleCollapse }: GroupSidebarProps) {
  const { t } = useTranslation()

  const items: SidebarItem<GroupCategory>[] = [
    { id: 'overview', label: t('group_sidebar_overview'), icon: LayoutDashboard },
    { id: 'members', label: t('group_sidebar_members'), icon: Users, badge: group.members.length },
    { id: 'ranks', label: t('group_sidebar_ranks'), icon: ShieldHalf },
    { id: 'stats', label: t('group_sidebar_statistics'), icon: BarChart3 },
  ]

  return (
    <Sidebar
      brand={
        <span
          className="flex h-[34px] w-[34px] items-center justify-center"
          style={{ backgroundColor: `rgb(${group.rgb.r}, ${group.rgb.g}, ${group.rgb.b})` }}
        >
          <Crown className="h-5 w-5 text-white drop-shadow" strokeWidth={2.4} />
        </span>
      }
      subtitle={
        <span className="flex items-center gap-1.5">
          <span className="truncate">{group.devise || t('group_no_devise')}</span>
        </span>
      }
      title={
        <span className="flex items-center gap-1.5">
          <span className="truncate">{group.name}</span>
          {group.is_official && (
            <span title={t('group_official_badge')}>
              <ShieldCheck className="h-4 w-4 shrink-0 text-help-safe" />
            </span>
          )}
        </span>
      }
      watermark={group.name}
      section={t('group_space')}
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
          <span>{t('group_your_rank')}</span>
          <Tag solid>{group.myRole.rank}</Tag>
        </div>
      }
    />
  )
}
