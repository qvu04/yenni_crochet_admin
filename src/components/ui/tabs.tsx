import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../utils'

interface SegmentedControlProps<TValue extends string> {
  value: TValue
  options: Array<{ label: string; value: TValue }>
  onValueChange: (value: TValue) => void
}

export const SegmentedControl = <TValue extends string>({
  value,
  options,
  onValueChange,
}: SegmentedControlProps<TValue>) => (
  <div className="inline-flex rounded-admin bg-cream p-1 ring-1 ring-berry/10">
    {options.map((option) => (
      <SegmentedButton
        key={option.value}
        aria-pressed={value === option.value}
        isActive={value === option.value}
        onClick={() => onValueChange(option.value)}
      >
        {option.label}
      </SegmentedButton>
    ))}
  </div>
)

interface SegmentedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isActive: boolean
}

const SegmentedButton = ({ className, isActive, type = 'button', ...props }: SegmentedButtonProps) => (
  <button
    type={type}
    className={cn(
      'h-9 min-w-20 rounded-admin px-3 text-sm font-bold transition',
      isActive ? 'bg-white text-ink shadow-sm' : 'text-muted hover:text-ink',
      className,
    )}
    {...props}
  />
)
