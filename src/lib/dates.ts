import type { DateFormat } from './constants'

const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

export type ParsedDate = { year: number; month: number | null }

export function parseDateValue(value: string | undefined | null): ParsedDate | null {
  if (!value) return null
  const match = /^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/.exec(value.trim())
  if (!match) return null
  const year = Number(match[1])
  if (!Number.isFinite(year) || year < 1900 || year > 2200) return null
  const month = match[2] ? Number(match[2]) : null
  if (month !== null && (month < 1 || month > 12)) return null
  return { year, month }
}

export function formatDateValue(
  value: string | undefined | null,
  format: DateFormat = 'MMM YYYY',
): string {
  const parsed = parseDateValue(value)
  if (!parsed) return ''
  if (format === 'YYYY' || parsed.month === null) return String(parsed.year)
  if (format === 'MM/YYYY') return `${String(parsed.month).padStart(2, '0')}/${parsed.year}`
  return `${MONTHS_SHORT[parsed.month - 1]} ${parsed.year}`
}

export function formatDateRange(options: {
  start?: string
  end?: string
  current?: boolean
  format?: DateFormat
}): string {
  const { start, end, current, format = 'MMM YYYY' } = options
  const left = formatDateValue(start, format)
  const right = current ? 'Present' : formatDateValue(end, format)
  if (left && right) return `${left} – ${right}`
  return left || right || ''
}

export function durationLabel(start?: string, end?: string, current?: boolean): string {
  const from = parseDateValue(start)
  const to = current ? { year: new Date().getFullYear(), month: new Date().getMonth() + 1 } : parseDateValue(end)
  if (!from || !to) return ''
  const fromMonth = from.month ?? 1
  const toMonth = to.month ?? 12
  let months = (to.year - from.year) * 12 + (toMonth - fromMonth) + 1
  if (months <= 0) return ''
  months = Math.min(months, 12 * 70)
  const years = Math.floor(months / 12)
  const rest = months % 12
  const parts: string[] = []
  if (years > 0) parts.push(`${years} yr${years === 1 ? '' : 's'}`)
  if (rest > 0) parts.push(`${rest} mo${rest === 1 ? '' : 's'}`)
  return parts.join(' ')
}

export function relativeTime(iso: string): string {
  const time = new Date(iso).getTime()
  if (!Number.isFinite(time)) return 'just now'
  const diff = Date.now() - time
  if (diff < 45_000) return 'just now'
  const minutes = Math.round(diff / 60_000)
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} hr${hours === 1 ? '' : 's'} ago`
  const days = Math.round(hours / 24)
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`
  return new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' }).format(
    new Date(time),
  )
}

export function todayMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}
