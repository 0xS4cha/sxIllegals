import { Search } from 'lucide-react'
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

export const fieldClass =
  'w-full border border-white/20 bg-help-panel/80 px-3 py-2 text-[17px] text-white placeholder-white/35 outline-none transition focus:border-help-accent'

export function Field({ label, hint, children }: { label?: ReactNode; hint?: ReactNode; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      {label && <span className="block text-[14px] font-semibold uppercase tracking-wider text-white/60">{label}</span>}
      {children}
      {hint && <span className="block text-[13px] text-white/45">{hint}</span>}
    </label>
  )
}

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${fieldClass} ${className}`} {...props} />
}

export function Select({ className = '', ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`${fieldClass} ${className}`} {...props} />
}

export function TextArea({ className = '', ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${fieldClass} ${className}`} {...props} />
}

export function SearchField({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={`relative min-w-[220px] flex-1 ${className}`}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" strokeWidth={2.4} />
      <input type="text" className={`${fieldClass} pl-9 uppercase tracking-wide`} {...props} />
    </div>
  )
}
