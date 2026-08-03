import type { ReactNode } from 'react'
import {
  AiOutlineCheckCircle,
  AiOutlineClose,
  AiOutlineExclamationCircle,
  AiOutlineInfoCircle,
} from 'react-icons/ai'
import { cn } from '../../utils'
import { Button } from './button'

type ActionNoticeTone = 'success' | 'info' | 'warning' | 'danger'

interface ActionNoticeAction {
  label: string
  onClick: () => void
}

interface ActionNoticeProps {
  title: ReactNode
  description?: ReactNode
  tone?: ActionNoticeTone
  primaryAction?: ActionNoticeAction
  secondaryAction?: ActionNoticeAction
  onDismiss?: () => void
}

const toneClassNames: Record<ActionNoticeTone, string> = {
  success: 'border-mint bg-mint/70 text-cocoa',
  info: 'border-blush bg-blush/45 text-cocoa',
  warning: 'border-[#E6BD63] bg-[#F7D58A]/55 text-cocoa',
  danger: 'border-berry/25 bg-berry/10 text-berry',
}

const iconClassNames: Record<ActionNoticeTone, string> = {
  success: 'text-ink',
  info: 'text-ink',
  warning: 'text-ink',
  danger: 'text-berry',
}

const toneIcons: Record<ActionNoticeTone, ReactNode> = {
  success: <AiOutlineCheckCircle />,
  info: <AiOutlineInfoCircle />,
  warning: <AiOutlineExclamationCircle />,
  danger: <AiOutlineExclamationCircle />,
}

export const ActionNotice = ({
  title,
  description,
  tone = 'success',
  primaryAction,
  secondaryAction,
  onDismiss,
}: ActionNoticeProps) => (
  <div className={cn('rounded-admin border p-4 shadow-sm', toneClassNames[tone])}>
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex gap-3">
        <span className={cn('mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-xl', iconClassNames[tone])}>
          {toneIcons[tone]}
        </span>
        <div>
          <p className="font-black text-ink">{title}</p>
          {description ? <p className="mt-1 text-sm font-bold text-cocoa">{description}</p> : null}
        </div>
      </div>
      {(primaryAction || secondaryAction || onDismiss) ? (
        <div className="flex shrink-0 gap-2">
          {secondaryAction ? (
            <Button variant="ghost" size="sm" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          ) : null}
          {primaryAction ? (
            <Button variant="ghost" size="sm" onClick={primaryAction.onClick}>
              {primaryAction.label}
            </Button>
          ) : null}
          {onDismiss ? (
            <button
              type="button"
              onClick={onDismiss}
              className="flex h-9 w-9 items-center justify-center rounded-full text-lg text-cocoa transition hover:bg-white/70 hover:text-ink"
              aria-label="Đóng thông báo"
            >
              <AiOutlineClose />
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  </div>
)
