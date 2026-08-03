import type { HTMLAttributes } from 'react'
import { cn } from '../../utils'

type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone
}

const toneClassNames: Record<BadgeTone, string> = {
  neutral: 'bg-cream text-cocoa ring-berry/10',
  success: 'bg-mint text-ink ring-mint',
  warning: 'bg-[#F7D58A] text-ink ring-[#E6BD63]',
  danger: 'bg-berry/10 text-berry ring-berry/20',
  info: 'bg-blush/70 text-ink ring-blush',
}

export const Badge = ({ className, tone = 'neutral', ...props }: BadgeProps) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1',
      toneClassNames[tone],
      className,
    )}
    {...props}
  />
)
