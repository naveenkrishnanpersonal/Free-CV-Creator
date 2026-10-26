import { Brush, Palette, Type, LayoutTemplate, SlidersHorizontal, X } from 'lucide-react'
import { Dialog } from 'radix-ui'
import { useEffect, useId, useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Field'
import { Toggle } from '@/components/ui/Toggle'
import { EXAMPLE_DOC } from '@/data/example'
import {
  FONT_KEYS,
  HEADING_STYLES,
  PAGE_WIDTHS,
  SECTION_KINDS,
  STYLE_LAYOUTS,
  type FontKey,
  type HeadingStyle,
  type SectionKind,
  type StyleLayout,
} from '@/lib/constants'
import { cn } from '@/lib/cn'
import { FONTS } from '@/lib/fonts'
import type { ResumeDoc, StyleConfig } from '@/lib/schema'
import { SECTION_META } from '@/lib/sectionMeta'
import { useDocStore } from '@/store/docStore'
import { ScaledCv } from './ScaledCv'

type Tab = 'layout' | 'type' | 'colour' | 'details' | 'css'

const TABS: { id: Tab; label: string; icon: typeof Palette }[] = [
  { id: 'layout', label: 'Layout', icon: LayoutTemplate },
  { id: 'type', label: 'Type', icon: Type },
  { id: 'colour', label: 'Colour', icon: Palette },
  { id: 'details', label: 'Details', icon: SlidersHorizontal },
  { id: 'css', label: 'Custom CSS', icon: Brush },
]

const LAYOUT_LABELS: Record<StyleLayout, string> = {
  single: 'Single column',
  'sidebar-left': 'Sidebar left',
  'sidebar-right': 'Sidebar right',
  'header-band': 'Header band',
}

const HEADING_LABELS: Record<HeadingStyle, string> = {
  plain: 'Plain',
  underline: 'Underline',
  'rule-over': 'Rule above',
  'bar-left': 'Bar on the left',
  pill: 'Pill',
  boxed: 'Boxed',
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  suffix = '',
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  suffix?: string
  onChange: (value: number) => void
}) {
  const id = useId()
  return (
    <div className="min-w-0">
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-[11.5px] font-medium text-muted">
          {label}
        </label>
        <span className="text-[11px] text-faint tabular">
          {Math.round(value * 100) / 100}
          {suffix}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-6 w-full cursor-pointer accent-[var(--accent)]"
      />
    </div>
  )
}

function SelectRow<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
}) {
  const id = useId()
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-1.5 block text-[11.5px] font-medium text-muted">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="h-8 w-full rounded-md border border-line bg-surface px-2 text-[12.5px] text-ink outline-none focus:border-accent"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

function SwitchRow({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 py-1 text-[11.5px] text-muted">
      {label}
      <Toggle checked={checked} onChange={onChange} label={label} />
    </label>
  )
}

function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  const id = useId()
  const [draft, setDraft] = useState(value)
  useEffect(() => setDraft(value), [value])

  return (
    <div className="flex min-w-0 items-center justify-between gap-2">
      <label htmlFor={id} className="min-w-0 truncate text-[11.5px] text-muted">
        {label}
      </label>
      <div className="flex shrink-0 items-center gap-1.5">
        <input
          id={id}
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-label={`${label} colour picker`}
          className="h-7 w-8 cursor-pointer rounded border border-line bg-transparent p-0.5"
        />
        <input
          value={draft}
          onChange={(event) => {
            const next = event.target.value
            setDraft(next)
            if (/^#[0-9a-f]{6}$/i.test(next)) onChange(next)
          }}
          onBlur={() => setDraft(value)}
          aria-label={`${label} hex value`}
          spellCheck={false}
          className="h-7 w-[74px] rounded border border-line bg-surface px-1.5 font-mono text-[11px] text-ink uppercase outline-none focus:border-accent"
        />
      </div>
    </div>
  )
}

function hasContent(doc: ResumeDoc): boolean {
  return Boolean(
    doc.basics.name.trim() ||
      doc.basics.summary.trim() ||
      doc.sections.some((section) => section.items.some((entry) => entry.title.trim())),
  )
}

const FONT_OPTIONS = FONT_KEYS.map((key) => ({ value: key, label: FONTS[key].label }))

export function StyleLab({
  open,
  onOpenChange,
  doc,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  doc: ResumeDoc
}) {
  const updateStyle = useDocStore((state) => state.updateStyle)
  const updateSettings = useDocStore((state) => state.updateSettings)
  const [tab, setTab] = useState<Tab>('layout')
  const style = doc.style

  const set = (key: string, recipe: (draft: StyleConfig) => void) =>
    updateStyle(recipe, `lab:${key}`)

  const previewDoc = useMemo<ResumeDoc>(
    () => (hasContent(doc) ? doc : { ...EXAMPLE_DOC, style: doc.style }),
    [doc],
  )

  const sidebar = style.layout === 'sidebar-left' || style.layout === 'sidebar-right'
  const toggleSidebarKind = (kind: SectionKind) => {
    set(`sidebar:${kind}`, (draft) => {
      const current = new Set(draft.sidebarSections)
      if (current.has(kind)) current.delete(kind)
      else current.add(kind)
      draft.sidebarSections = SECTION_KINDS.filter((item) => current.has(item))
    })
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/30 backdrop-blur-[2px] data-[state=open]:animate-fade-in" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 flex h-[min(880px,94vh)] w-[min(1180px,96vw)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-float data-[state=open]:animate-fade-up">
          <div className="flex shrink-0 items-start justify-between gap-4 border-b border-line px-5 py-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="grid size-7 place-items-center rounded-md bg-accent-soft text-accent">
                  <SlidersHorizontal size={14} />
                </span>
                <Dialog.Title className="font-display text-[24px] leading-none text-ink">
                  Design
                </Dialog.Title>
              </div>
              <Dialog.Description className="mt-1.5 text-[12px] text-muted">
                Adjust the design tokens. Your content is never touched, and every change is
                undoable.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" aria-label="Close design">
                <X size={16} />
              </Button>
            </Dialog.Close>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-1 border-b border-line px-4 py-2 sm:px-5">
            {TABS.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  aria-pressed={tab === item.id}
                  className={cn(
                    'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] transition-colors',
                    tab === item.id
                      ? 'bg-ink text-canvas'
                      : 'text-muted hover:bg-surface-muted hover:text-ink',
                  )}
                >
                  <Icon size={12} /> {item.label}
                </button>
              )
            })}
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)]">
            <div className="min-h-0 overflow-y-auto border-line px-5 py-4 lg:border-r">
              {tab === 'layout' && (
                <div className="space-y-4">
                  <SelectRow<StyleLayout>
                    label="Page layout"
                    value={style.layout}
                    onChange={(layout) => set('layout', (draft) => void (draft.layout = layout))}
                    options={STYLE_LAYOUTS.map((layout) => ({
                      value: layout,
                      label: LAYOUT_LABELS[layout],
                    }))}
                  />
                  {sidebar && (
                    <>
                      <SliderRow
                        label="Sidebar width"
                        value={style.sidebarWidthPct}
                        min={18}
                        max={48}
                        step={1}
                        suffix="%"
                        onChange={(value) =>
                          set('sidebar-width', (draft) => void (draft.sidebarWidthPct = value))
                        }
                      />
                      <div>
                        <p className="mb-1.5 text-[11.5px] font-medium text-muted">
                          Sections in the sidebar
                        </p>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                          {SECTION_KINDS.map((kind) => (
                            <label
                              key={kind}
                              className="flex cursor-pointer items-center gap-1.5 text-[11px] text-muted"
                            >
                              <input
                                type="checkbox"
                                checked={style.sidebarSections.includes(kind)}
                                onChange={() => toggleSidebarKind(kind)}
                                className="size-3.5 accent-[var(--accent)]"
                              />
                              {SECTION_META[kind].label}
                            </label>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                  <div className="border-t border-line pt-3">
                    <p className="mb-2 text-[11.5px] font-medium text-ink">Page margins</p>
                    <div className="space-y-2">
                      {(
                        [
                          ['marginTopMm', 'Top'],
                          ['marginRightMm', 'Right'],
                          ['marginBottomMm', 'Bottom'],
                          ['marginLeftMm', 'Left'],
                        ] as const
                      ).map(([key, label]) => (
                        <SliderRow
                          key={key}
                          label={label}
                          value={style.page[key]}
                          min={6}
                          max={35}
                          step={0.5}
                          suffix="mm"
                          onChange={(value) =>
                            set(key, (draft) => void (draft.page[key] = value))
                          }
                        />
                      ))}
                    </div>
                  </div>
                  <div className="border-t border-line pt-3">
                    <SelectRow
                      label="Paper"
                      value={doc.settings.paper.size}
                      onChange={(size) => {
                        if (size === 'Custom') {
                          updateSettings((draft) => {
                            draft.paper = {
                              size,
                              widthMm: draft.paper.widthMm,
                              heightMm: draft.paper.heightMm,
                            }
                          })
                          return
                        }
                        const next = PAGE_WIDTHS[size]
                        updateSettings((draft) => {
                          draft.paper = { size, widthMm: next.widthMm, heightMm: next.heightMm }
                        })
                      }}
                      options={[
                        { value: 'A4', label: 'A4 (210 × 297 mm)' },
                        { value: 'Letter', label: 'US Letter (216 × 279 mm)' },
                        { value: 'Custom', label: 'Custom size' },
                      ]}
                    />
                    {doc.settings.paper.size === 'Custom' && (
                      <div className="mt-3 space-y-2">
                        <SliderRow
                          label="Width"
                          value={doc.settings.paper.widthMm}
                          min={60}
                          max={600}
                          step={1}
                          suffix="mm"
                          onChange={(value) =>
                            updateSettings((draft) => void (draft.paper.widthMm = value))
                          }
                        />
                        <SliderRow
                          label="Height"
                          value={doc.settings.paper.heightMm}
                          min={60}
                          max={900}
                          step={1}
                          suffix="mm"
                          onChange={(value) =>
                            updateSettings((draft) => void (draft.paper.heightMm = value))
                          }
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {tab === 'type' && (
                <div className="space-y-4">
                  <SelectRow<FontKey>
                    label="Body font"
                    value={style.typography.bodyFont}
                    options={FONT_OPTIONS}
                    onChange={(font) =>
                      set('body-font', (draft) => void (draft.typography.bodyFont = font))
                    }
                  />
                  <SelectRow<FontKey>
                    label="Heading font"
                    value={style.typography.headingFont}
                    options={FONT_OPTIONS}
                    onChange={(font) =>
                      set('heading-font', (draft) => void (draft.typography.headingFont = font))
                    }
                  />
                  <SelectRow<FontKey>
                    label="Name font"
                    value={style.typography.nameFont}
                    options={FONT_OPTIONS}
                    onChange={(font) =>
                      set('name-font', (draft) => void (draft.typography.nameFont = font))
                    }
                  />
                  <div className="border-t border-line pt-3 space-y-2">
                    <SliderRow
                      label="Body size"
                      value={style.typography.bodySizePt}
                      min={7}
                      max={14}
                      step={0.25}
                      suffix="pt"
                      onChange={(value) =>
                        set('body-size', (draft) => void (draft.typography.bodySizePt = value))
                      }
                    />
                    <SliderRow
                      label="Line height"
                      value={style.typography.lineHeight}
                      min={1.05}
                      max={2}
                      step={0.01}
                      onChange={(value) =>
                        set('line-height', (draft) => void (draft.typography.lineHeight = value))
                      }
                    />
                    <SliderRow
                      label="Name size"
                      value={style.typography.nameSizePt}
                      min={14}
                      max={48}
                      step={0.5}
                      suffix="pt"
                      onChange={(value) =>
                        set('name-size', (draft) => void (draft.typography.nameSizePt = value))
                      }
                    />
                    <SliderRow
                      label="Heading size"
                      value={style.typography.headingSizePt}
                      min={6.5}
                      max={16}
                      step={0.25}
                      suffix="pt"
                      onChange={(value) =>
                        set('heading-size', (draft) => void (draft.typography.headingSizePt = value))
                      }
                    />
                    <SliderRow
                      label="Heading weight"
                      value={style.typography.headingWeight}
                      min={300}
                      max={900}
                      step={100}
                      onChange={(value) =>
                        set('heading-weight', (draft) => void (draft.typography.headingWeight = value))
                      }
                    />
                    <SelectRow
                      label="Heading case"
                      value={style.typography.headingCase}
                      options={[
                        { value: 'none', label: 'As typed' },
                        { value: 'upper', label: 'UPPERCASE' },
                        { value: 'small-caps', label: 'Small caps' },
                      ]}
                      onChange={(value) =>
                        set('heading-case', (draft) => void (draft.typography.headingCase = value))
                      }
                    />
                    <SliderRow
                      label="Heading tracking"
                      value={style.typography.headingTracking}
                      min={-0.05}
                      max={0.4}
                      step={0.01}
                      suffix="em"
                      onChange={(value) =>
                        set(
                          'heading-tracking',
                          (draft) => void (draft.typography.headingTracking = value),
                        )
                      }
                    />
                    <SliderRow
                      label="Body tracking"
                      value={style.typography.bodyTracking}
                      min={-0.02}
                      max={0.2}
                      step={0.005}
                      suffix="em"
                      onChange={(value) =>
                        set('body-tracking', (draft) => void (draft.typography.bodyTracking = value))
                      }
                    />
                  </div>
                </div>
              )}

              {tab === 'colour' && (
                <div className="space-y-2">
                  {(
                    [
                      ['accent', 'Accent'],
                      ['heading', 'Headings'],
                      ['text', 'Body text'],
                      ['muted', 'Muted text'],
                      ['link', 'Links'],
                      ['rule', 'Rules and borders'],
                      ['pageBg', 'Page background'],
                      ['sidebarBg', 'Sidebar background'],
                      ['sidebarText', 'Sidebar text'],
                      ['headerBg', 'Header band background'],
                      ['headerText', 'Header band text'],
                    ] as const
                  ).map(([key, label]) => (
                    <ColorRow
                      key={key}
                      label={label}
                      value={style.colors[key]}
                      onChange={(value) =>
                        set(key, (draft) => void (draft.colors[key] = value))
                      }
                    />
                  ))}
                </div>
              )}

              {tab === 'details' && (
                <div className="space-y-4">
                  <div>
                    <p className="mb-2 text-[11.5px] font-medium text-ink">Header</p>
                    <div className="space-y-3">
                      <SelectRow
                        label="Alignment"
                        value={style.header.align}
                        options={[
                          { value: 'left', label: 'Left' },
                          { value: 'center', label: 'Centre' },
                          { value: 'right', label: 'Right' },
                        ]}
                        onChange={(value) =>
                          set('align', (draft) => void (draft.header.align = value))
                        }
                      />
                      <SelectRow
                        label="Contact layout"
                        value={style.header.contactLayout}
                        options={[
                          { value: 'inline', label: 'One line' },
                          { value: 'stacked', label: 'Stacked' },
                          { value: 'grid', label: 'Grid' },
                        ]}
                        onChange={(value) =>
                          set('contact-layout', (draft) => void (draft.header.contactLayout = value))
                        }
                      />
                      <SwitchRow
                        label="Show headline"
                        checked={style.header.showHeadline}
                        onChange={(checked) =>
                          set('show-headline', (draft) => void (draft.header.showHeadline = checked))
                        }
                      />
                      <SwitchRow
                        label="Show photo"
                        checked={style.header.showPhoto}
                        onChange={(checked) =>
                          set('show-photo', (draft) => void (draft.header.showPhoto = checked))
                        }
                      />
                      <SliderRow
                        label="Photo size"
                        value={style.header.photoSizeMm}
                        min={12}
                        max={50}
                        step={1}
                        suffix="mm"
                        onChange={(value) =>
                          set('photo-size', (draft) => void (draft.header.photoSizeMm = value))
                        }
                      />
                      <SwitchRow
                        label="Icons by contact details"
                        checked={style.header.showIcons}
                        onChange={(checked) =>
                          set('contact-icons', (draft) => void (draft.header.showIcons = checked))
                        }
                      />
                    </div>
                  </div>

                  <div className="border-t border-line pt-3">
                    <p className="mb-2 text-[11.5px] font-medium text-ink">Sections</p>
                    <div className="space-y-3">
                      <SelectRow<HeadingStyle>
                        label="Heading style"
                        value={style.section.headingStyle}
                        options={HEADING_STYLES.map((value) => ({
                          value,
                          label: HEADING_LABELS[value],
                        }))}
                        onChange={(value) =>
                          set('heading-style', (draft) => void (draft.section.headingStyle = value))
                        }
                      />
                      <SwitchRow
                        label="Icons in headings"
                        checked={style.section.showIcons}
                        onChange={(checked) =>
                          set('section-icons', (draft) => void (draft.section.showIcons = checked))
                        }
                      />
                      <SwitchRow
                        label="Uppercase headings"
                        checked={style.section.uppercase}
                        onChange={(checked) =>
                          set('uppercase', (draft) => void (draft.section.uppercase = checked))
                        }
                      />
                      <SwitchRow
                        label="Number sections"
                        checked={style.section.numbered}
                        onChange={(checked) =>
                          set('numbered', (draft) => void (draft.section.numbered = checked))
                        }
                      />
                      <SliderRow
                        label="Section spacing"
                        value={style.section.spacing}
                        min={0.5}
                        max={2.5}
                        step={0.05}
                        suffix="×"
                        onChange={(value) =>
                          set('section-spacing', (draft) => void (draft.section.spacing = value))
                        }
                      />
                    </div>
                  </div>

                  <div className="border-t border-line pt-3">
                    <p className="mb-2 text-[11.5px] font-medium text-ink">Entries</p>
                    <div className="space-y-3">
                      <SelectRow
                        label="Title and dates"
                        value={style.entry.titleDate}
                        options={[
                          { value: 'inline', label: 'Dates on the same line' },
                          { value: 'stacked', label: 'Dates below the title' },
                          { value: 'date-left', label: 'Dates in a left column' },
                        ]}
                        onChange={(value) =>
                          set('title-date', (draft) => void (draft.entry.titleDate = value))
                        }
                      />
                      <SwitchRow
                        label="Show location"
                        checked={style.entry.showLocation}
                        onChange={(checked) =>
                          set('show-location', (draft) => void (draft.entry.showLocation = checked))
                        }
                      />
                      <SwitchRow
                        label="Show summaries"
                        checked={style.entry.showSummary}
                        onChange={(checked) =>
                          set('show-summary', (draft) => void (draft.entry.showSummary = checked))
                        }
                      />
                      <SelectRow
                        label="Bullet style"
                        value={style.entry.bulletStyle}
                        options={[
                          { value: 'disc', label: 'Disc' },
                          { value: 'dash', label: 'Dash' },
                          { value: 'square', label: 'Square' },
                          { value: 'none', label: 'None' },
                        ]}
                        onChange={(value) =>
                          set('bullet-style', (draft) => void (draft.entry.bulletStyle = value))
                        }
                      />
                      <SliderRow
                        label="Bullet indent"
                        value={style.entry.bulletIndentMm}
                        min={0}
                        max={10}
                        step={0.5}
                        suffix="mm"
                        onChange={(value) =>
                          set('bullet-indent', (draft) => void (draft.entry.bulletIndentMm = value))
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {tab === 'css' && (
                <div className="space-y-2">
                  <label htmlFor="custom-css" className="block text-[11.5px] font-medium text-muted">
                    Custom CSS
                  </label>
                  <Textarea
                    id="custom-css"
                    value={style.customCss}
                    onChange={(event) =>
                      set('custom-css', (draft) => void (draft.customCss = event.target.value))
                    }
                    spellCheck={false}
                    placeholder={'.cv-name { letter-spacing: 0.02em; }'}
                    className="min-h-[320px] font-mono text-[11.5px]"
                  />
                  <p className="text-[11px] leading-snug text-faint">
                    Scoped to the CV page only, so it can never affect the editor. Imports are
                    stripped. Use it for small finishing touches; presets cover most needs.
                  </p>
                </div>
              )}
            </div>

            <div className="hidden min-h-0 flex-col bg-canvas-deep p-5 lg:flex">
              <div className="mx-auto w-full max-w-[520px] overflow-hidden rounded-lg border border-line shadow-card">
                <ScaledCv doc={previewDoc} />
              </div>
              <p className="mx-auto mt-3 max-w-[520px] text-center text-[11px] text-faint">
                Live preview. Content and layout stay exactly as they are on the page.
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center justify-end gap-2 border-t border-line bg-surface-muted/60 px-4 py-3 sm:px-5">
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
