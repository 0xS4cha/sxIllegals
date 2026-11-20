import type { CSSProperties } from 'react'

export type Tone = 'neutral' | 'danger' | 'safe' | 'warning' | 'accent' | (string & {})

const named: Record<string, string> = {
  neutral: '#ffffff',
  danger: 'var(--color-help-danger)',
  safe: 'var(--color-help-safe)',
  warning: 'var(--color-help-warning)',
  accent: 'var(--color-help-accent)',
}

export function toneColor(tone?: Tone): string {
  if (!tone) return named.neutral
  return named[tone] ?? tone
}

export function toneText(tone?: Tone): CSSProperties {
  return { color: toneColor(tone) }
}

export function toneBg(tone?: Tone): CSSProperties {
  return { backgroundColor: toneColor(tone) }
}

export function rgbTone(rgb?: { r: number; g: number; b: number }): Tone {
  if (!rgb) return 'neutral'
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
}
