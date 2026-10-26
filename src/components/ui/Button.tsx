import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'soft'
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
}

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-accent-solid text-accent-ink shadow-sm hover:bg-accent-solid-hover active:translate-y-px disabled:hover:bg-accent-solid',
  secondary:
    'border border-line bg-surface text-ink shadow-[0_1px_1px_rgb(0_0_0_/_0.03)] hover:border-line-strong hover:bg-surface-muted',
  ghost: 'text-muted hover:bg-surface-muted hover:text-ink',
  danger: 'text-danger hover:bg-danger-soft',
  soft: 'bg-accent-soft text-accent hover:bg-accent-soft/70',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-8 rounded-md px-2.5 text-[12.5px] font-medium',
  md: 'h-9 rounded-md px-3.5 text-[13px] font-medium',
  lg: 'h-10 rounded-md px-4.5 text-[13.5px] font-medium',
  icon: 'size-9 rounded-md',
  'icon-sm': 'size-7 rounded-md',
}

export function Button({
  className,
  variant = 'secondary',
  size = 'md',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap transition-[background-color,border-color,color,opacity,transform] duration-150 select-none disabled:pointer-events-none disabled:opacity-45',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  )
}
