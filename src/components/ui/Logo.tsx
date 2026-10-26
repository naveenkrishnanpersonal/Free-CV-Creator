import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'

export function Logo({
  className,
  compact = false,
  large = false,
  showName = !compact,
}: {
  className?: string
  compact?: boolean
  large?: boolean
  showName?: boolean
}) {
  return (
    <Link
      to="/"
      aria-label="CV Studio home"
      className={cn(
        'inline-flex min-w-0 items-center gap-2.5 rounded-lg text-ink transition-opacity hover:opacity-85',
        className,
      )}
    >
      <img
        src={`${import.meta.env.BASE_URL}logo.png`}
        alt=""
        className={cn(
          'h-8 w-24 shrink-0 object-contain object-left',
          compact && 'size-7',
          large && 'h-auto w-40',
        )}
      />
      {showName && (
        <span className="truncate whitespace-nowrap text-[14.5px] font-semibold tracking-[-0.015em]">
          CV Studio
        </span>
      )}
    </Link>
  )
}
