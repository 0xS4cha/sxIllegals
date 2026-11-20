import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { toneColor, type Tone } from './tone'

interface TagProps {
  tone?: Tone
  icon?: LucideIcon
  solid?: boolean
  className?: string
  children: ReactNode
}

export function Tag({ tone = 'neutral', icon: Icon, solid = false, className = '', children }: TagProps) {
  const color = toneColor(tone)
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 px-1.5 py-0.5 text-[13px] font-bold uppercase leading-none tracking-wide ${className}`}
      style={solid ? { backgroundColor: color, color: 'var(--color-help-panel)' } : { color, boxShadow: `inset 0 0 0 1px ${color}` }}
    >
      {Icon && <Icon className="h-3 w-3" strokeWidth={2.6} />}
      {children}
    </span>
  )
}
