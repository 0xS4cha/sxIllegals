import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { toneText, type Tone } from './tone'

interface RowProps {
  label: ReactNode
  value?: ReactNode
  tone?: Tone
  index?: number
  last?: boolean
  children?: ReactNode
  className?: string
}

export function Row({ label, value, tone, index = 0, last, children, className = '' }: RowProps) {
  return (
    <motion.div
      className={`flex min-h-[48px] items-center justify-between gap-4 py-2 ${last ? '' : 'border-b border-help-line'} ${className}`}
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.04 + index * 0.04, duration: 0.2 }}
    >
      <span className="min-w-0 max-w-[60%] shrink-0 truncate text-[19px] font-semibold uppercase leading-tight tracking-wide text-white">
        {label}
      </span>
      {value !== undefined && (
        <span
          className="min-w-0 truncate text-right text-[19px] font-semibold uppercase leading-tight tracking-wide tabular-nums"
          style={toneText(tone)}
        >
          {value}
        </span>
      )}
      {children}
    </motion.div>
  )
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <span className="text-[13px] font-semibold uppercase tracking-[0.18em] text-white/55">{children}</span>
  )
}
