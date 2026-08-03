import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../utils'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'icon'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

const variantClassNames: Record<ButtonVariant, string> = {
  primary: 'bg-ink text-white shadow-sm hover:bg-cocoa',
  secondary: 'bg-blush text-ink shadow-sm hover:bg-blush/80',
  ghost: 'bg-transparent text-muted hover:bg-cream hover:text-ink',
  danger: 'bg-berry text-white shadow-sm hover:bg-berry/90',
}

const sizeClassNames: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-xs',
  md: 'h-11 px-4 text-sm',
  icon: 'h-10 w-10 p-0 text-lg',
}

export const Button = ({
  className,
  variant = 'primary',
  size = 'md',
  type = 'button',
  ...props
}: ButtonProps) => (
  <button
    type={type}
    className={cn(
      'inline-flex shrink-0 items-center justify-center gap-2 rounded-admin font-bold transition disabled:pointer-events-none disabled:opacity-50',
      variantClassNames[variant],
      sizeClassNames[size],
      className,
    )}
    {...props}
  />
)
