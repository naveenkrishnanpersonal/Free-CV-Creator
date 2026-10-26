import { DropdownMenu } from 'radix-ui'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export function Menu({
  trigger,
  children,
  align = 'end',
  className,
}: {
  trigger: ReactNode
  children: ReactNode
  align?: 'start' | 'center' | 'end'
  className?: string
}) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align={align}
          sideOffset={6}
          className={cn(
            'z-50 min-w-48 rounded-lg border border-line bg-surface-raised p-1 shadow-float data-[state=open]:animate-fade-in',
            className,
          )}
        >
          {children}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

export function MenuItem({
  children,
  onSelect,
  icon,
  danger,
  disabled,
}: {
  children: ReactNode
  onSelect?: (event: Event) => void
  icon?: ReactNode
  danger?: boolean
  disabled?: boolean
}) {
  return (
    <DropdownMenu.Item
      disabled={disabled}
      onSelect={onSelect}
      className={cn(
        'flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-[13px] outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-40',
        danger
          ? 'text-danger data-[highlighted]:bg-danger-soft'
          : 'text-ink-soft data-[highlighted]:bg-surface-muted data-[highlighted]:text-ink',
      )}
    >
      {icon && <span className="text-muted">{icon}</span>}
      {children}
    </DropdownMenu.Item>
  )
}

export function MenuSeparator() {
  return <DropdownMenu.Separator className="my-1 h-px bg-line" />
}

export function MenuLabel({ children }: { children: ReactNode }) {
  return (
    <DropdownMenu.Label className="px-2.5 pt-2 pb-1 text-[10.5px] font-semibold tracking-[0.1em] text-faint uppercase">
      {children}
    </DropdownMenu.Label>
  )
}
