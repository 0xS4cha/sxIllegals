import { motion } from 'motion/react'
import { toneBg, type Tone } from './tone'

interface SegmentBarProps {
  value: number
  max?: number
  segments?: number
  tone?: Tone
  className?: string
}

export function SegmentBar({ value, max = 1, segments = 10, tone, className = '' }: SegmentBarProps) {
  const ratio = max > 0 ? Math.min(Math.max(value / max, 0), 1) : 0
  const filled = Math.round(ratio * segments)

  return (
    <span className={`flex gap-[3px] ${className}`}>
      {Array.from({ length: segments }, (_, i) => (
        <motion.span
          key={i}
          className="h-[12px] w-[7px] -skew-x-12"
          initial={{ opacity: 0, scaleY: 0.3 }}
          animate={{ opacity: 1, scaleY: 1 }}
          transition={{ delay: 0.05 + i * 0.02, duration: 0.15 }}
          style={i < filled ? toneBg(tone) : { backgroundColor: 'rgba(255,255,255,0.2)' }}
        />
      ))}
    </span>
  )
}

export interface StackSegment {
  key: string
  value: number
  color: string
  title?: string
}

export function StackBar({ items, className = '' }: { items: StackSegment[]; className?: string }) {
  return (
    <div className={`flex h-[8px] w-full -skew-x-12 gap-[3px] bg-white/15 ${className}`}>
      {items.map((item) => (
        <div
          key={item.key}
          title={item.title}
          className="h-full transition-all duration-300"
          style={{ width: `${item.value}%`, backgroundColor: item.color }}
        />
      ))}
    </div>
  )
}
