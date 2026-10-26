import { cn } from '@/lib/cn'

export function Toggle({
  checked,
  onChange,
  label,
  disabled,
  className,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  disabled?: boolean
  className?: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-[18px] w-[32px] shrink-0 items-center rounded-full border transition-colors disabled:opacity-40',
        checked ? 'border-accent bg-accent' : 'border-line-strong bg-canvas-deep',
        className,
      )}
    >
      <span
        className={cn(
          'block size-3 rounded-full bg-white shadow-sm transition-transform',
          checked ? 'translate-x-[15px]' : 'translate-x-[2px]',
        )}
      />
    </button>
  )
}
