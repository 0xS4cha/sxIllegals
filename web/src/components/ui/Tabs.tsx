import type { ReactNode } from 'react'

interface TabsProps<T extends string> {
  value: T
  options: { value: T; label: ReactNode }[]
  onChange: (value: T) => void
}

export function Tabs<T extends string>({ value, options, onChange }: TabsProps<T>) {
  return (
    <div className="flex bg-help-panel/80 p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`px-3 py-1 text-[15px] font-semibold uppercase tracking-wide transition ${
            value === option.value ? 'bg-white text-help-panel' : 'text-white/60 hover:text-white'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
