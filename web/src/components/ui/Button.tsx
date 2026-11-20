import type { LucideIcon } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'ghost' | 'danger' | 'safe' | 'subtle'

const variants: Record<Variant, string> = {
  primary: 'bg-white text-help-panel hover:bg-white/85',
  ghost: 'border border-help-line bg-help-panel/60 text-white hover:border-white/60 hover:bg-help-panel',
  danger: 'bg-help-danger text-help-panel hover:brightness-110',
  safe: 'bg-help-safe text-help-panel hover:brightness-110',
  subtle: 'text-white/70 hover:bg-white/10 hover:text-white',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  icon?: LucideIcon
  iconClassName?: string
  size?: 'sm' | 'md'
  children?: ReactNode
}

export function Button({
  variant = 'ghost',
  icon: Icon,
  iconClassName = '',
  size = 'md',
  className = '',
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  const sizing = size === 'sm' ? 'h-8 px-2.5 text-[15px] gap-1.5' : 'h-10 px-3.5 text-[17px] gap-2'
  return (
    <button
      type={type}
      className={`inline-flex shrink-0 items-center justify-center font-semibold uppercase leading-none tracking-wide transition disabled:cursor-not-allowed disabled:opacity-45 ${sizing} ${variants[variant]} ${className}`}
      {...props}
    >
      {Icon && <Icon className={`${size === 'sm' ? 'h-4 w-4' : 'h-[18px] w-[18px]'} ${iconClassName}`} strokeWidth={2.4} />}
      {children}
    </button>
  )
}
