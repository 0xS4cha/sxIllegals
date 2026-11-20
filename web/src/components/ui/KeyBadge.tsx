interface KeyBadgeProps {
  label: string
  size?: number
}

export function KeyBadge({ label, size = 24 }: KeyBadgeProps) {
  const circle = label.length <= 3
  const fontSize = label.length <= 1 ? size * 0.58 : size * 0.42

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-white font-bold uppercase leading-none text-help-panel ring-2 ring-black/35 shadow-[0_2px_5px_rgba(0,0,0,0.4)] ${circle ? '' : 'px-2'}`}
      style={{ height: size, minWidth: size, fontSize }}
    >
      {label}
    </span>
  )
}
