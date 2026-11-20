import { motion } from 'motion/react'
import type { LucideIcon } from 'lucide-react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { KeyBadge } from './KeyBadge'
import { Tag } from './Tag'
import type { Tone } from './tone'

export interface SidebarItem<T extends string> {
  id: T
  label: string
  icon: LucideIcon
  badge?: number
  badgeTone?: Tone
}

interface SidebarProps<T extends string> {
  brand: ReactNode
  subtitle: ReactNode
  title: ReactNode
  watermark?: string
  section?: ReactNode
  items: SidebarItem<T>[]
  active: T
  onSelect: (id: T) => void
  collapsed: boolean
  onToggleCollapse: () => void
  collapseLabel: string
  expandLabel: string
  closeLabel: string
  onClose: () => void
  footer?: ReactNode
}

export function Sidebar<T extends string>({
  brand,
  subtitle,
  title,
  watermark,
  section,
  items,
  active,
  onSelect,
  collapsed,
  onToggleCollapse,
  collapseLabel,
  expandLabel,
  closeLabel,
  onClose,
  footer,
}: SidebarProps<T>) {
  return (
    <aside className={`relative flex shrink-0 flex-col bg-help-panel transition-all duration-300 ${collapsed ? 'w-[72px]' : 'w-[272px]'}`}>
      <div className="relative flex h-[68px] items-center gap-3 overflow-hidden px-4">
        {watermark && !collapsed && (
          <span
            className="pointer-events-none absolute -right-2 top-1/2 -translate-y-1/2 whitespace-nowrap text-[54px] font-bold uppercase leading-none text-transparent [-webkit-text-stroke:1.5px_rgba(255,255,255,0.08)]"
            aria-hidden
          >
            {watermark}
          </span>
        )}
        <div className="relative shrink-0">{brand}</div>
        {!collapsed && (
          <motion.div initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="relative min-w-0 flex-1">
            <div className="truncate text-[14px] font-semibold uppercase leading-tight tracking-wide text-white/55">{subtitle}</div>
            <div className="truncate text-[17px] font-bold uppercase leading-tight tracking-wide text-white">{title}</div>
          </motion.div>
        )}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="relative flex h-7 w-7 shrink-0 items-center justify-center text-white/50 transition hover:bg-white/10 hover:text-white"
          title={collapsed ? expandLabel : collapseLabel}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 space-y-0.5 border-t border-help-line pt-3">
        {section && !collapsed && (
          <div className="px-4 pb-2 text-[13px] font-semibold uppercase tracking-[0.18em] text-white/40">{section}</div>
        )}

        {items.map((item) => {
          const Icon = item.icon
          const isActive = active === item.id

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={`relative flex h-11 w-full items-center gap-3 px-4 text-[18px] font-semibold uppercase tracking-wide transition ${
                isActive ? 'bg-white/10 text-white' : 'text-white/55 hover:bg-white/5 hover:text-white'
              } ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              {isActive && (
                <motion.span
                  layoutId={`sidebar-indicator-${String(items[0]?.id)}`}
                  className="absolute inset-y-0 left-0 w-[4px] bg-white"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={2.4} />
              {!collapsed && <span className="min-w-0 flex-1 truncate text-left">{item.label}</span>}
              {!collapsed && item.badge !== undefined && <Tag tone={item.badgeTone ?? 'neutral'}>{item.badge}</Tag>}
            </button>
          )
        })}
      </nav>

      <div className="space-y-2 border-t border-help-line p-3">
        {!collapsed && footer}
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-full items-center justify-center gap-2 border border-help-line text-[16px] font-semibold uppercase tracking-wide text-white/80 transition hover:border-white/60 hover:text-white"
          title={closeLabel}
        >
          {collapsed ? <X className="h-4 w-4" /> : (
            <>
              <span>{closeLabel}</span>
              <KeyBadge label="ESC" size={22} />
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
