import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { STYLE_PRESETS, type StylePreset } from '@/data/stylePresets'
import { ScaledCv } from '@/features/design/ScaledCv'
import { FEATURED_TEMPLATES, previewDocForStyle } from '../previewDocs'

const PREVIEW_DOCS = new Map(
  FEATURED_TEMPLATES.map((preset) => [preset.id, previewDocForStyle(preset.style)]),
)

function TemplateCard({
  preset,
  busy,
  onUse,
}: {
  preset: StylePreset
  busy: boolean
  onUse: (preset: StylePreset) => void
}) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-line bg-surface-raised p-2.5 transition-[border-color,box-shadow] duration-150 hover:border-line-strong hover:shadow-card">
      <div className="relative h-[190px] overflow-hidden rounded-lg border border-line bg-paper sm:h-[210px]">
        <ScaledCv doc={PREVIEW_DOCS.get(preset.id) ?? previewDocForStyle(preset.style)} />
        {preset.atsSafe && (
          <span className="absolute top-2 right-2 rounded-md bg-success-soft px-1.5 py-0.5 text-[8.5px] font-semibold tracking-[0.05em] text-success uppercase shadow-sm">
            ATS
          </span>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col px-1 pt-3">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="truncate text-[12.5px] font-semibold text-ink">{preset.name}</h3>
          <span className="shrink-0 text-[9px] tracking-[0.06em] text-faint uppercase">
            {preset.category}
          </span>
        </div>
        <p className="mt-1 line-clamp-2 text-[10.5px] leading-snug text-muted">{preset.tagline}</p>
        <Button
          variant="soft"
          size="sm"
          className="mt-3 w-full"
          onClick={() => onUse(preset)}
          disabled={busy}
          aria-label={`Use ${preset.name} template`}
        >
          Use template
        </Button>
      </div>
    </article>
  )
}

export function TemplatesSection({
  busy,
  onUseTemplate,
  onBrowseAll,
  showHeading = true,
}: {
  busy: boolean
  onUseTemplate: (preset: StylePreset) => void
  onBrowseAll: () => void
  showHeading?: boolean
}) {
  return (
    <section id="templates" aria-labelledby={showHeading ? 'templates-title' : undefined}>
      {showHeading && (
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <h2
              id="templates-title"
              className="text-[17px] font-semibold tracking-[-0.025em] text-ink"
            >
              Templates
            </h2>
            <p className="mt-1 text-[12px] text-muted">
              Professionally typeset starting points. Change the design without touching your
              words.
            </p>
          </div>
          <span className="rounded-full border border-line bg-surface-raised px-2.5 py-1 text-[10.5px] text-muted">
            {STYLE_PRESETS.length} designs
          </span>
        </div>
      )}

      <div
        className={
          showHeading
            ? 'mt-4 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3'
            : 'grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3'
        }
      >
        {FEATURED_TEMPLATES.map((preset) => (
          <TemplateCard key={preset.id} preset={preset} busy={busy} onUse={onUseTemplate} />
        ))}
      </div>

      <div className="mt-4 flex flex-col items-start justify-between gap-3 rounded-xl border border-line bg-surface/60 px-4 py-3 sm:flex-row sm:items-center">
        <p className="text-[11px] leading-relaxed text-muted">
          Every design works with A4 and US Letter. Switching templates never changes your content.
        </p>
        <Button variant="ghost" size="sm" onClick={onBrowseAll} disabled={busy}>
          Open all {STYLE_PRESETS.length} designs
          <ArrowRight size={13} />
        </Button>
      </div>
    </section>
  )
}
