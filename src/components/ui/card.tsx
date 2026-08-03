import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils'

export const Card = ({ className, ...props }: HTMLAttributes<HTMLElement>) => (
  <section
    className={cn('rounded-admin bg-white shadow-soft ring-1 ring-berry/10', className)}
    {...props}
  />
)

export const CardHeader = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex items-start justify-between gap-4 p-5 pb-0', className)} {...props} />
)

export const CardTitle = ({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn('text-lg font-black text-ink', className)} {...props} />
)

export const CardDescription = ({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn('mt-1 text-sm leading-6 text-muted', className)} {...props} />
)

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export const CardContent = ({ className, ...props }: CardContentProps) => (
  <div className={cn('p-5', className)} {...props} />
)
