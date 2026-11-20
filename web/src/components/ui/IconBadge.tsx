import type { LucideIcon } from 'lucide-react'

interface IconBadgeProps {
  icon: LucideIcon
  size?: number
  className?: string
  inverted?: boolean
}

export function IconBadge({ icon: Icon, size = 26, className = '', inverted = false }: IconBadgeProps) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center ${inverted ? 'bg-help-panel text-white' : 'bg-white text-help-panel'} ${className}`}
      style={{ width: size, height: size }}
    >
      <Icon size={Math.round(size * 0.64)} strokeWidth={2.4} />
    </span>
  )
}
