import { Eye, EyeOff, Minus, Pencil, Plus, Scan, X, type LucideIcon } from 'lucide-react'
import { Dialog } from 'radix-ui'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { CvDocument } from '@/cv/CvDocument'
import { CvEditProvider, type InlineAction, type InlineTarget } from '@/cv/editing'
import { mmToPx, paperDimensions } from '@/cv/theme'
import { createSection } from '@/data/defaults'
import { PAGE_WIDTHS, type SectionKind } from '@/lib/constants'
import { cn } from '@/lib/cn'
import type { ResumeDoc } from '@/lib/schema'
import { SECTION_META, SECTIONS_ADDABLE } from '@/lib/sectionMeta'
import { useDocStore } from '@/store/docStore'
import { useUiStore } from '@/store/uiStore'

function hasContent(doc: ResumeDoc): boolean {
  if (doc.basics.photo?.dataUrl) return true
  if (doc.basics.name.trim() || doc.basics.summary.trim()) return true
  return doc.sections.some(
    (section) =>
      section.visible &&
      section.kind !== 'summary' &&
      section.items.some(
        (entry) =>
          entry.title.trim() ||
          entry.organization.trim() ||
          entry.summary.trim() ||
          entry.bullets.some((bullet) => bullet.trim()) ||
          entry.tags.length > 0,
      ),
  )
}

function targetKey(target: InlineTarget): string {
  switch (target.kind) {
    case 'basics-name':
      return 'basics-name'
    case 'basics-headline':
      return 'basics-headline'
    case 'basics-summary':
      return 'basics-summary'
    case 'basics-location':
      return 'basics-location'
    case 'contact':
      return `contact:${target.field}`
    case 'profile':
      return `profile:${target.profileId}:${target.field}`
    case 'section-title':
      return `section-title:${target.sectionId}`
    case 'entry':
      return `entry:${target.entryId}:${target.field}`
    case 'bullet':
      return `bullet:${target.entryId}:${target.index}`
    case 'tag':
      return `tag:${target.entryId}:${target.index}`
  }
}

function writeTarget(draft: ResumeDoc, target: InlineTarget, value: string): void {
  switch (target.kind) {
    case 'basics-name':
      draft.basics.name = value
      return
    case 'basics-headline':
      draft.basics.headline = value
      return
    case 'basics-summary':
      draft.basics.summary = value
      return
    case 'basics-location': {
      const [city, ...rest] = value.split(',')
      draft.basics.city = city.trim()
      draft.basics.country = rest.join(',').trim()
      return
    }
    case 'contact':
      draft.basics[target.field] = value
      return
    case 'profile': {
      const profile = draft.basics.profiles.find((item) => item.id === target.profileId)
      if (profile) profile[target.field] = value
      return
    }
    case 'section-title': {
      const section = draft.sections.find((item) => item.id === target.sectionId)
      if (section) section.title = value
      return
    }
    case 'entry': {
      const entry = draft.sections
        .find((item) => item.id === target.sectionId)
        ?.items.find((item) => item.id === target.entryId)
      if (entry) entry[target.field] = value
      return
    }
    case 'bullet': {
      const entry = draft.sections
        .find((item) => item.id === target.sectionId)
        ?.items.find((item) => item.id === target.entryId)
      if (!entry) return
      if (!value.trim()) entry.bullets.splice(target.index, 1)
      else entry.bullets[target.index] = value
      return
    }
    case 'tag': {
      const entry = draft.sections
        .find((item) => item.id === target.sectionId)
        ?.items.find((item) => item.id === target.entryId)
      if (!entry) return
      if (!value.trim()) entry.tags.splice(target.index, 1)
      else entry.tags[target.index] = value
      return
    }
  }
}

const noop = () => undefined

export function PreviewPane({
  doc,
  className,
  onSelectSection,
}: {
  doc: ResumeDoc
  className?: string
  onSelectSection?: (sectionId: string) => void
}) {
  const stageRef = useRef<HTMLDivElement>(null)
  const pageRef = useRef<HTMLDivElement>(null)
  const [stageWidth, setStageWidth] = useState(0)
  const [contentHeight, setContentHeight] = useState(0)
  const [inlineEdit, setInlineEdit] = useState(true)
  const [sectionPicker, setSectionPicker] = useState<{ afterSectionId?: string } | null>(null)
  const zoom = useUiStore((state) => state.zoom)
  const setZoom = useUiStore((state) => state.setZoom)
  const update = useDocStore((state) => state.update)
  const updateStyle = useDocStore((state) => state.updateStyle)
  const updateSettings = useDocStore((state) => state.updateSettings)
  const addEntry = useDocStore((state) => state.addEntry)
  const removeEntry = useDocStore((state) => state.removeEntry)
  const removeSection = useDocStore((state) => state.removeSection)
  const moveSectionTo = useDocStore((state) => state.moveSectionTo)

  const dims = paperDimensions(doc.settings.paper)
  const pageWidthPx = mmToPx(dims.widthMm)
  const pageHeightPx = mmToPx(dims.heightMm)
  const fit = stageWidth > 0 ? Math.min(1, Math.max(0.18, (stageWidth - 56) / pageWidthPx)) : 0.55
  const scale = fit * zoom
  const empty = !hasContent(doc) && !inlineEdit
  const photo = doc.basics.photo
  const showPhoto = doc.style.header.showPhoto

  useEffect(() => {
    const element = stageRef.current
    if (!element) return
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0
      setStageWidth(width)
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const element = pageRef.current
    if (!element) return
    const observer = new ResizeObserver((entries) => {
      setContentHeight(entries[0]?.contentRect.height ?? 0)
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const focusOnPage = (selector: string) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const element = pageRef.current?.querySelector<HTMLElement>(selector)
        if (!element) return
        element.focus({ preventScroll: true })
        element.scrollIntoView({ block: 'center', behavior: 'smooth' })
        if (element.isContentEditable) {
          const selection = window.getSelection()
          const range = document.createRange()
          range.selectNodeContents(element)
          range.collapse(false)
          selection?.removeAllRanges()
          selection?.addRange(range)
        }
      })
    })
  }

  const commit = (target: InlineTarget, value: string) => {
    update((draft) => writeTarget(draft, target, value), `inline:${targetKey(target)}`)
  }

  const action = (next: InlineAction) => {
    switch (next.type) {
      case 'add-entry': {
        const entryId = addEntry(next.sectionId)
        if (entryId) focusOnPage(`[data-entry-id="${entryId}"] .cv-editable`)
        return
      }
      case 'add-bullet': {
        update((draft) => {
          const entry = draft.sections
            .find((section) => section.id === next.sectionId)
            ?.items.find((item) => item.id === next.entryId)
          if (entry) entry.bullets.splice(next.afterIndex + 1, 0, '')
        })
        focusOnPage(
          `[data-entry-id="${next.entryId}"] .cv-bullet-line[data-bullet-index="${next.afterIndex + 1}"] .cv-editable`,
        )
        return
      }
      case 'add-tag': {
        let lastIndex = 0
        update((draft) => {
          const entry = draft.sections
            .find((section) => section.id === next.sectionId)
            ?.items.find((item) => item.id === next.entryId)
          if (!entry) return
          entry.tags.push('')
          lastIndex = entry.tags.length - 1
        })
        focusOnPage(
          `[data-entry-id="${next.entryId}"] [data-tag-index="${lastIndex}"] .cv-editable`,
        )
        return
      }
      case 'add-section':
        setSectionPicker({ afterSectionId: next.afterSectionId })
        return
      case 'hide-section':
        update((draft) => {
          const section = draft.sections.find((item) => item.id === next.sectionId)
          if (section) section.visible = false
        })
        return
      case 'move-section-to':
        moveSectionTo(next.sectionId, next.toIndex)
        return
      case 'remove-section':
        removeSection(next.sectionId)
        return
      case 'remove-entry':
        removeEntry(next.sectionId, next.entryId)
        return
      case 'remove-bullet':
        update((draft) => {
          const entry = draft.sections
            .find((section) => section.id === next.sectionId)
            ?.items.find((item) => item.id === next.entryId)
          if (entry) entry.bullets.splice(next.index, 1)
        })
        return
      case 'remove-tag':
        update((draft) => {
          const entry = draft.sections
            .find((section) => section.id === next.sectionId)
            ?.items.find((item) => item.id === next.entryId)
          if (entry) entry.tags.splice(next.index, 1)
        })
        return
      case 'open-panel':
        onSelectSection?.(next.sectionId)
        return
    }
  }

  const addSectionNow = (kind: SectionKind) => {
    const section = createSection(kind)
    const afterSectionId = sectionPicker?.afterSectionId
    update((draft) => {
      const index = afterSectionId
        ? draft.sections.findIndex((item) => item.id === afterSectionId)
        : -1
      if (index >= 0) draft.sections.splice(index + 1, 0, section)
      else draft.sections.push(section)
    })
    setSectionPicker(null)
    focusOnPage(`[data-section-id="${section.id}"] .cv-section-title .cv-editable`)
    toast.success(`${SECTION_META[kind].label} added. Type a title on the page.`)
  }

  const filterKinds = SECTIONS_ADDABLE
  const anchorSection = sectionPicker?.afterSectionId
    ? doc.sections.find((section) => section.id === sectionPicker.afterSectionId)
    : undefined
  const hasSummary = doc.sections.some((section) => section.kind === 'summary')

  return (
    <div className={cn('flex min-h-0 flex-col bg-canvas-deep', className)}>
      <div className="flex h-11 shrink-0 items-center justify-between gap-2 border-b border-line bg-surface/80 px-3 backdrop-blur">
        <div className="flex min-w-0 items-center gap-2">
          <span className="hidden text-[11.5px] font-semibold tracking-[0.08em] text-muted uppercase sm:inline">
            Preview
          </span>
          <select
            value={doc.settings.paper.size}
            onChange={(event) => {
              const size = event.target.value as 'A4' | 'Letter'
              const next = PAGE_WIDTHS[size]
              updateSettings((draft) => {
                draft.paper = { size, widthMm: next.widthMm, heightMm: next.heightMm }
              })
            }}
            aria-label="Paper size"
            className="h-7 rounded border border-line bg-surface px-1.5 text-[11px] text-ink outline-none focus:border-accent"
          >
            {doc.settings.paper.size === 'Custom' && (
              <option value="Custom" disabled>
                Custom
              </option>
            )}
            <option value="A4">A4</option>
            <option value="Letter">US Letter</option>
          </select>
          <span className="hidden truncate text-[11px] text-faint lg:inline">
            {Math.round(dims.widthMm * 10) / 10} × {Math.round(dims.heightMm * 10) / 10} mm
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          {photo?.dataUrl && (
            <Button
              variant={showPhoto ? 'soft' : 'ghost'}
              size="icon-sm"
              onClick={() =>
                updateStyle((draft) => {
                  draft.header.showPhoto = !draft.header.showPhoto
                })
              }
              aria-pressed={showPhoto}
              aria-label={showPhoto ? 'Hide photo from CV' : 'Show photo on CV'}
              title={showPhoto ? 'Hide photo from CV' : 'Show photo on CV'}
            >
              {showPhoto ? <Eye size={14} /> : <EyeOff size={14} />}
            </Button>
          )}
          <Button
            variant={inlineEdit ? 'soft' : 'ghost'}
            size="sm"
            onClick={() => setInlineEdit((value) => !value)}
            aria-pressed={inlineEdit}
            aria-label={inlineEdit ? 'Finish editing on the page' : 'Edit on the page'}
            title={inlineEdit ? 'Finish editing on the page' : 'Edit directly on the page'}
            className="gap-1.5"
          >
            <Pencil size={13} />
            <span className="hidden md:inline">{inlineEdit ? 'Editing' : 'Edit page'}</span>
          </Button>
          <span className="mx-0.5 hidden h-4 w-px bg-line sm:block" />
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Zoom out"
            onClick={() => setZoom(zoom - 0.1)}
            disabled={zoom <= 0.5}
          >
            <Minus size={14} />
          </Button>
          <span className="hidden w-10 text-center text-[11.5px] tabular text-muted sm:block">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Zoom in"
            onClick={() => setZoom(zoom + 0.1)}
            disabled={zoom >= 1.6}
          >
            <Plus size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Fit to width"
            title="Fit to width"
            onClick={() => setZoom(1)}
          >
            <Scan size={14} />
          </Button>
        </div>
      </div>

      {inlineEdit && (
        <div className="flex shrink-0 items-center gap-1.5 border-b border-line bg-accent-soft/50 px-3 py-1.5 text-[10.5px] leading-tight text-muted">
          <Pencil size={10} className="shrink-0 text-accent" />
          <span className="truncate">
            Click any line to edit. Tap or hover a line for × to remove; use + to add a line or section.
          </span>
        </div>
      )}

      <div
        ref={stageRef}
        data-testid="editor-preview-stage"
        className="relative min-h-0 flex-1 overflow-auto"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, color-mix(in srgb, var(--muted) 22%, transparent) 1px, transparent 0)',
            backgroundSize: '18px 18px',
          }}
          aria-hidden="true"
        />
        <div className="relative px-7 py-8">
          <div
            className="mx-auto"
            style={{
              width: pageWidthPx * scale,
              height: (contentHeight || pageHeightPx) * scale,
            }}
          >
            <div
              style={{
                width: pageWidthPx,
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
              }}
            >
              <div
                ref={pageRef}
                className="bg-paper shadow-[0_2px_4px_rgb(22_24_28/0.07),0_30px_70px_-32px_rgb(22_24_28/0.4)] ring-1 ring-black/5"
              >
                <CvEditProvider
                  enabled={inlineEdit}
                  activate={noop}
                  commit={commit}
                  action={action}
                >
                  <CvDocument doc={doc} />
                </CvEditProvider>
              </div>
            </div>
          </div>
        </div>

        {empty && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-10">
            <div className="max-w-[250px] rounded-lg border border-line/80 bg-surface/92 p-4 text-center shadow-float backdrop-blur-sm">
              <div className="mx-auto mb-3 grid size-9 place-items-center rounded-full bg-accent-soft text-accent">
                <Scan size={16} />
              </div>
              <p className="font-display text-[17px] leading-tight text-ink">Your CV appears here</p>
              <p className="mt-1.5 text-[12px] leading-relaxed text-muted">
                Start with your name and a role, or load the example to see the structure.
              </p>
            </div>
          </div>
        )}
      </div>

      <Dialog.Root
        open={Boolean(sectionPicker)}
        onOpenChange={(open) => {
          if (!open) setSectionPicker(null)
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[60] bg-ink/30 backdrop-blur-[2px]" />
          <Dialog.Content className="fixed top-1/2 left-1/2 z-[60] w-[min(620px,94vw)] max-h-[86vh] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-line bg-surface p-5 shadow-float">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Dialog.Title className="font-display text-[22px] leading-tight text-ink">
                  Add a section
                </Dialog.Title>
                <Dialog.Description className="mt-1 text-[12px] leading-relaxed text-muted">
                  {anchorSection
                    ? `It will appear after “${anchorSection.title.trim() || SECTION_META[anchorSection.kind].label}”. Edit everything on the page; the side panel is optional.`
                    : 'It will appear at the end of your CV. Edit everything on the page; the side panel is optional.'}
                </Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <Button variant="ghost" size="icon-sm" aria-label="Close add section">
                  <X size={15} />
                </Button>
              </Dialog.Close>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {filterKinds.map((kind) => {
                const meta = SECTION_META[kind]
                const Icon: LucideIcon = meta.icon
                const disabled = kind === 'summary' && hasSummary
                return (
                  <button
                    key={kind}
                    type="button"
                    disabled={disabled}
                    onClick={() => addSectionNow(kind)}
                    className="flex items-start gap-2.5 rounded-lg border border-line bg-surface px-3 py-2.5 text-left transition-colors hover:border-accent/50 hover:bg-accent-soft/30 focus-visible:ring-2 focus-visible:ring-accent/25 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-md bg-surface-muted text-muted">
                      <Icon size={13} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[12px] font-medium text-ink">{meta.label}</span>
                      <span className="mt-0.5 block text-[10.5px] leading-snug text-faint">
                        {disabled ? 'Already on this CV' : meta.blurb}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}
