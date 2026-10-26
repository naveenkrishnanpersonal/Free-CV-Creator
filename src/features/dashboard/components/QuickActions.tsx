import {
  Download,
  LayoutTemplate,
  Plus,
  SlidersHorizontal,
  Upload,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/cn'

type Tone = 'blue' | 'violet' | 'emerald' | 'orange' | 'magenta'

const TONES: Record<Tone, { card: string; icon: string }> = {
  blue: {
    card: 'border-accent/25 bg-accent-soft/80 hover:border-accent/50',
    icon: 'bg-accent-solid text-white',
  },
  violet: {
    card: 'border-violet/25 bg-violet-soft/80 hover:border-violet/50',
    icon: 'bg-violet-solid text-white',
  },
  emerald: {
    card: 'border-emerald/25 bg-emerald-soft/80 hover:border-emerald/50',
    icon: 'bg-emerald-solid text-white',
  },
  orange: {
    card: 'border-orange/25 bg-orange-soft/80 hover:border-orange/50',
    icon: 'bg-orange-solid text-white',
  },
  magenta: {
    card: 'border-magenta/25 bg-magenta-soft/80 hover:border-magenta/50',
    icon: 'bg-magenta-solid text-white',
  },
}

type Action = {
  title: string
  subtitle: string
  icon: LucideIcon
  tone: Tone
  onClick: () => void
  disabled?: boolean
  disabledTitle?: string
}

export function QuickActions({
  busy,
  canExportBackup,
  onCreate,
  onBrowseTemplates,
  onImport,
  onExportBackup,
  onCustomize,
}: {
  busy: boolean
  canExportBackup: boolean
  onCreate: () => void
  onBrowseTemplates: () => void
  onImport: () => void
  onExportBackup: () => void
  onCustomize: () => void
}) {
  const actions: Action[] = [
    {
      title: 'Create New CV',
      subtitle: 'Start from scratch.',
      icon: Plus,
      tone: 'blue',
      onClick: onCreate,
      disabled: busy,
    },
    {
      title: 'Browse Templates',
      subtitle: 'Choose a professional template.',
      icon: LayoutTemplate,
      tone: 'violet',
      onClick: onBrowseTemplates,
    },
    {
      title: 'Import Existing CV',
      subtitle: 'Restore a CV Studio JSON file.',
      icon: Upload,
      tone: 'emerald',
      onClick: onImport,
      disabled: busy,
    },
    {
      title: 'Export Backup',
      subtitle: 'Save your documents locally.',
      icon: Download,
      tone: 'orange',
      onClick: onExportBackup,
      disabled: !canExportBackup || busy,
      disabledTitle: 'Create a CV first',
    },
    {
      title: 'Customize',
      subtitle: 'Configure fonts, colors, and page size.',
      icon: SlidersHorizontal,
      tone: 'magenta',
      onClick: onCustomize,
      disabled: busy,
    },
  ]

  return (
    <section
      aria-label="Quick actions"
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
    >
      {actions.map((action) => {
        const Icon = action.icon
        const tone = TONES[action.tone]
        return (
          <button
            key={action.title}
            type="button"
            onClick={action.onClick}
            disabled={action.disabled}
            title={action.disabled ? action.disabledTitle : undefined}
            className={cn(
              'group flex items-start gap-3 rounded-xl border p-3 text-left transition-[border-color,box-shadow,transform,filter] duration-150 short:p-2.5 hover:-translate-y-0.5 hover:shadow-card focus-visible:ring-2 focus-visible:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0 disabled:hover:shadow-none',
              tone.card,
            )}
          >
            <span
              className={cn(
                'grid size-9 shrink-0 place-items-center rounded-lg shadow-sm transition-transform duration-150 group-hover:scale-[1.04]',
                tone.icon,
              )}
            >
              <Icon size={16} strokeWidth={2} />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[12.5px] leading-tight font-semibold text-ink">
                {action.title}
              </span>
              <span className="mt-1.5 block text-[10.5px] leading-snug text-muted">
                {action.subtitle}
              </span>
            </span>
          </button>
        )
      })}
    </section>
  )
}
