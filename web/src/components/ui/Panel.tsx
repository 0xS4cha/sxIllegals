import { motion } from 'motion/react'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { IconBadge } from './IconBadge'
import { toneText, type Tone } from './tone'

interface PanelHeaderProps {
  subtitle?: ReactNode
  title?: ReactNode
  watermark?: string
  icon?: LucideIcon
  actions?: ReactNode
  className?: string
}

export function PanelHeader({ subtitle, title, watermark, icon, actions, className = '' }: PanelHeaderProps) {
  return (
    <div className={`relative flex items-center gap-3 overflow-hidden bg-help-panel/95 px-4 py-2.5 ${className}`}>
      {watermark && (
        <span
          className="pointer-events-none absolute -right-1 top-1/2 -translate-y-1/2 whitespace-nowrap text-[54px] font-bold uppercase leading-none tracking-wide text-transparent [-webkit-text-stroke:1.5px_rgba(255,255,255,0.1)]"
          aria-hidden
        >
          {watermark}
        </span>
      )}
      {icon && <IconBadge icon={icon} size={30} className="relative" />}
      <div className="relative min-w-0 flex-1">
        {subtitle && (
          <div className="truncate text-[15px] font-semibold uppercase leading-tight tracking-wide text-white/55">
            {subtitle}
          </div>
        )}
        {title && (
          <div className="truncate text-[21px] font-bold uppercase leading-tight tracking-wide text-white">{title}</div>
        )}
      </div>
      {actions && <div className="relative flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}

export interface FooterItem {
  value: ReactNode
  icon?: LucideIcon
  tone?: Tone
}

export function PanelFooter({ label, items = [], children }: { label?: ReactNode; items?: FooterItem[]; children?: ReactNode }) {
  return (
    <div className="flex min-h-[44px] items-center justify-between gap-4 bg-help-panel/95 px-4 py-1.5">
      {label && (
        <span className="line-clamp-2 min-w-0 text-[19px] font-semibold uppercase leading-tight tracking-wide text-white">
          {label}
        </span>
      )}
      <span className="ml-auto flex shrink-0 items-center gap-3.5">
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-2">
            <span
              className="whitespace-nowrap text-[19px] font-semibold uppercase leading-none tracking-wide tabular-nums"
              style={toneText(item.tone)}
            >
              {item.value}
            </span>
            {item.icon && <IconBadge icon={item.icon} size={24} />}
          </span>
        ))}
        {children}
      </span>
    </div>
  )
}

interface PanelProps {
  header?: PanelHeaderProps
  footer?: { label?: ReactNode; items?: FooterItem[]; children?: ReactNode }
  children?: ReactNode
  className?: string
  bodyClassName?: string
  delay?: number
  onClick?: () => void
}

export function Panel({ header, footer, children, className = '', bodyClassName = 'px-4 py-1', delay = 0, onClick }: PanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.22 }}
      onClick={onClick}
      className={`flex flex-col overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.35)] ${onClick ? 'cursor-pointer transition hover:brightness-110' : ''} ${className}`}
    >
      {header && <PanelHeader {...header} />}
      {children !== undefined && <div className={`flex-1 bg-help-glass ${bodyClassName}`}>{children}</div>}
      {footer && <PanelFooter {...footer} />}
    </motion.div>
  )
}
