import { Check, Palette, X } from 'lucide-react'
import { Dialog } from 'radix-ui'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { EXAMPLE_DOC } from '@/data/example'
import { ScaledCv } from './ScaledCv'
import { STYLE_PRESETS, type StylePreset } from '@/data/stylePresets'
import { cn } from '@/lib/cn'
import type { ResumeDoc, StyleConfig } from '@/lib/schema'
import { useDocStore } from '@/store/docStore'

const CATEGORIES = ['All', 'Single column', 'Sidebar', 'Header band'] as const
type Category = (typeof CATEGORIES)[number]

function hasEnoughContent(doc: ResumeDoc): boolean {
  if (!doc.basics.name.trim()) return false
  const filledSections = doc.sections.filter(
    (section) =>
      section.visible &&
      (section.kind === 'summary'
        ? doc.basics.summary.trim().length > 0
        : section.items.some(
            (entry) =>
              entry.title.trim() ||
              entry.organization.trim() ||
              entry.summary.trim() ||
              entry.bullets.some((bullet) => bullet.trim()) ||
              entry.tags.length > 0,
          )),
  ).length
  return filledSections >= 2
}

function sampleDocument(doc: ResumeDoc, style: StyleConfig): ResumeDoc {
  const base = hasEnoughContent(doc) ? doc : EXAMPLE_DOC
  const sidebarKinds = new Set(style.sidebarSections)
  const sidebar = style.layout === 'sidebar-left' || style.layout === 'sidebar-right'
  const sections = base.sections.filter((section) => section.visible)
  const selected = sidebar
    ? sections
        .filter((section) => !sidebarKinds.has(section.kind))
        .slice(0, 3)
        .concat(sections.filter((section) => sidebarKinds.has(section.kind)).slice(0, 3))
        .sort((a, b) => base.sections.indexOf(a) - base.sections.indexOf(b))
    : sections.slice(0, 4)

  return {
    ...base,
    style,
    settings: {
      ...base.settings,
      paper: { size: 'A4', widthMm: 210, heightMm: 297 },
    },
    sections: selected.map((section) => ({
      ...section,
      items: section.items.slice(0, 2),
    })),
  }
}

function StyleCard({
  preset,
  active,
  doc,
  onApply,
}: {
  preset: StylePreset
  active: boolean
  doc: ResumeDoc
  onApply: () => void
}) {
  const previewDoc = useMemo(() => sampleDocument(doc, preset.style), [doc, preset.style])

  return (
    <button
      type="button"
      onClick={onApply}
      aria-pressed={active}
      aria-label={`Apply ${preset.name} style`}
      className={cn(
        'group rounded-xl border bg-surface p-2 text-left transition-[border-color,box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:shadow-card focus-visible:ring-2 focus-visible:ring-accent/30',
        active ? 'border-accent shadow-card' : 'border-line hover:border-line-strong',
      )}
    >
      <div className="relative overflow-hidden rounded-[7px] border border-line">
        <ScaledCv doc={previewDoc} />
        {active && (
          <span className="absolute top-1.5 right-1.5 grid size-5 place-items-center rounded-full bg-accent text-accent-ink shadow-sm">
            <Check size={11} strokeWidth={3} />
          </span>
        )}
      </div>
      <div className="px-1 pt-2.5 pb-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-[12px] font-semibold text-ink">{preset.name}</span>
          {preset.atsSafe && (
            <span className="shrink-0 rounded bg-success-soft px-1.5 py-0.5 text-[8.5px] font-semibold tracking-[0.04em] text-success uppercase">
              ATS
            </span>
          )}
        </div>
        <p className="mt-0.5 line-clamp-2 text-[10.5px] leading-snug text-muted">{preset.tagline}</p>
        <span className="mt-1 block text-[9.5px] tracking-[0.04em] text-faint uppercase">
          {preset.category}
        </span>
      </div>
    </button>
  )
}

export function StyleGallery({
  open,
  onOpenChange,
  doc,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  doc: ResumeDoc
}) {
  const applyStyle = useDocStore((state) => state.applyStyle)
  const [category, setCategory] = useState<Category>('All')
  const currentPreset =
    doc.style.basePreset ?? (doc.style.name === 'Ink & Paper' ? 'ink-paper' : null)

  const filtered = useMemo(
    () => STYLE_PRESETS.filter((preset) => category === 'All' || preset.category === category),
    [category],
  )

  const apply = (preset: StylePreset) => {
    applyStyle(preset.style)
    toast.success(`${preset.name} applied. Your content is unchanged.`)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/30 backdrop-blur-[2px] data-[state=open]:animate-fade-in" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 flex h-[min(880px,92vh)] w-[min(1160px,96vw)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-float data-[state=open]:animate-fade-up">
          <div className="flex shrink-0 items-start justify-between gap-4 border-b border-line px-5 py-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="grid size-7 place-items-center rounded-md bg-accent-soft text-accent">
                  <Palette size={14} />
                </span>
                <Dialog.Title className="font-display text-[24px] leading-none text-ink">
                  Choose a style
                </Dialog.Title>
              </div>
              <Dialog.Description className="mt-1.5 text-[12px] text-muted">
                {STYLE_PRESETS.length} complete designs. Apply one, then keep editing your content;
                the style never touches the words.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" aria-label="Close styles">
                <X size={16} />
              </Button>
            </Dialog.Close>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-1 border-b border-line px-5 py-2.5">
            {CATEGORIES.map((item) => {
              const count =
                item === 'All'
                  ? STYLE_PRESETS.length
                  : STYLE_PRESETS.filter((preset) => preset.category === item).length
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={cn(
                    'rounded-full px-2.5 py-1 text-[11px] transition-colors',
                    category === item
                      ? 'bg-ink text-canvas'
                      : 'text-muted hover:bg-surface-muted hover:text-ink',
                  )}
                >
                  {item} <span className="opacity-55">{count}</span>
                </button>
              )
            })}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
              {filtered.map((preset) => (
                <StyleCard
                  key={preset.id}
                  preset={preset}
                  active={currentPreset === preset.id}
                  doc={doc}
                  onApply={() => apply(preset)}
                />
              ))}
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-line bg-surface-muted/60 px-5 py-3">
            <p className="text-[11px] text-muted">
              Your photo stays visible. Toggle it any time under Header → Photo.
            </p>
            <Dialog.Close asChild>
              <Button variant="primary" size="sm">
                Done
              </Button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
