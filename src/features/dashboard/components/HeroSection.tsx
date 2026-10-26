import {
  FileDown,
  FileText,
  LayoutTemplate,
  Plus,
  ShieldCheck,
  SlidersHorizontal,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ScaledCv } from '@/features/design/ScaledCv'
import { cn } from '@/lib/cn'
import { HERO_PREVIEWS } from '../previewDocs'

const FEATURES: {
  title: string
  subtitle: string
  icon: LucideIcon
}[] = [
  {
    title: 'Professional Templates',
    subtitle: 'Modern and ATS-friendly.',
    icon: FileText,
  },
  {
    title: 'Fully Customizable',
    subtitle: 'Colors, fonts, and sections.',
    icon: SlidersHorizontal,
  },
  {
    title: 'Export to PDF',
    subtitle: 'A4 and US Letter.',
    icon: FileDown,
  },
  {
    title: 'Privacy First',
    subtitle: 'Local storage, where supported.',
    icon: ShieldCheck,
  },
]

const PAGE_POSITIONS = [
  'top-[12%] left-0 z-10 w-[45%] -rotate-[7deg]',
  'top-0 left-[27%] z-20 w-[50%]',
  'top-[14%] right-0 z-10 w-[43%] rotate-[7deg]',
]

export function HeroSection({
  onCreate,
  onBrowseTemplates,
  busy,
}: {
  onCreate: () => void
  onBrowseTemplates: () => void
  busy: boolean
}) {
  return (
    <section
      id="home"
      aria-labelledby="hero-title"
      className="relative scroll-mt-20 overflow-hidden rounded-2xl border border-line"
      style={{
        background:
          'linear-gradient(118deg, var(--hero-a) 0%, var(--hero-b) 54%, var(--hero-c) 100%)',
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 70% 34%, color-mix(in srgb, var(--accent) 19%, transparent), transparent 58%)',
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -top-32 right-[18%] size-72 rounded-full bg-accent/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative p-5 short:p-4 sm:p-6">
        <div className="grid items-center gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)_200px] xl:gap-4">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.17em] text-accent uppercase">
              <span className="h-px w-5 bg-accent/70" aria-hidden="true" />
              Create. Edit. Download.
            </p>

            <h1
              id="hero-title"
              className="mt-3 text-[32px] leading-[1.05] font-semibold tracking-[-0.04em] text-ink sm:text-[38px] xl:text-[34px] 3xl:text-[40px]"
            >
              <span className="3xl:block">Your Professional CV</span>{' '}
              <span className="text-accent 3xl:block">in Minutes</span>
            </h1>

            <p className="mt-3.5 max-w-[44ch] text-[13px] leading-relaxed text-muted">
              Modern templates, easy editing, and beautiful PDF export. Everything stays in your
              browser.
            </p>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button
                variant="primary"
                size="lg"
                onClick={onCreate}
                disabled={busy}
                className="w-full sm:w-auto"
              >
                <Plus size={15} />
                Create New CV
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={onBrowseTemplates}
                className="w-full sm:w-auto"
              >
                <LayoutTemplate size={14} />
                Browse Templates
              </Button>
            </div>

            <p className="mt-3 flex items-center gap-1.5 text-[10.5px] text-faint">
              <ShieldCheck size={11} className="shrink-0 text-accent" aria-hidden="true" />
              Autosaved locally. No account required.
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-[460px] short:max-w-[360px]">
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(circle at 54% 44%, color-mix(in srgb, var(--accent) 24%, transparent), transparent 62%)',
                filter: 'blur(16px)',
              }}
              aria-hidden="true"
            />

            <div className="relative aspect-[1.42/1] w-full" aria-hidden="true">
              {HERO_PREVIEWS.map((preview, index) => (
                <div
                  key={preview.id}
                  className={cn(
                    'absolute overflow-hidden rounded-[5px] bg-paper shadow-[0_30px_60px_-24px_rgb(0_0_0/0.8)] ring-1 ring-black/25',
                    PAGE_POSITIONS[index],
                  )}
                >
                  <ScaledCv doc={preview.doc} />
                  <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/5" />
                </div>
              ))}
            </div>
          </div>

          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-1 xl:gap-2.5">
            {FEATURES.map((feature) => {
              const Icon = feature.icon
              return (
                <li
                  key={feature.title}
                  className="flex items-start gap-2.5 rounded-xl border border-accent/15 bg-accent-soft/60 p-2.5 short:p-2 xl:p-3"
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent-solid text-white shadow-sm">
                    <Icon size={15} strokeWidth={2} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[11px] leading-tight font-semibold text-ink">
                      {feature.title}
                    </span>
                    <span className="mt-1 block text-[10px] leading-snug text-muted">
                      {feature.subtitle}
                    </span>
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}
