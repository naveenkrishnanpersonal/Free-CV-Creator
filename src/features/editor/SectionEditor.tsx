import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Toggle } from '@/components/ui/Toggle'
import type { SectionLayout } from '@/lib/constants'
import type { Section } from '@/lib/schema'
import { SECTION_META } from '@/lib/sectionMeta'
import { useDocStore } from '@/store/docStore'
import { EntryCard } from './EntryCard'

const LAYOUT_OPTIONS: { value: SectionLayout; label: string }[] = [
  { value: 'timeline', label: 'Timeline' },
  { value: 'stacked', label: 'Stacked' },
  { value: 'grid-2', label: 'Two columns' },
  { value: 'tags', label: 'Tag groups' },
  { value: 'inline', label: 'Inline list' },
]

export function SectionEditor({
  section,
  onDeleted,
}: {
  section: Section
  onDeleted: () => void
}) {
  const meta = SECTION_META[section.kind]
  const Icon = meta.icon
  const sections = useDocStore((state) => state.doc?.sections ?? [])
  const renameSection = useDocStore((state) => state.renameSection)
  const toggleSection = useDocStore((state) => state.toggleSection)
  const setSectionLayout = useDocStore((state) => state.setSectionLayout)
  const moveSection = useDocStore((state) => state.moveSection)
  const removeSection = useDocStore((state) => state.removeSection)
  const addEntry = useDocStore((state) => state.addEntry)
  const [confirming, setConfirming] = useState(false)

  const index = sections.findIndex((item) => item.id === section.id)
  const total = sections.length

  return (
    <div className="animate-fade-up">
      <div className="flex items-start gap-3 border-b border-line pb-5">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent">
          <Icon size={17} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[10.5px] font-semibold tracking-[0.11em] text-faint uppercase">
              {meta.label}
            </span>
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => moveSection(section.id, -1)}
                disabled={index <= 0}
                aria-label="Move section up"
                title="Move section up"
              >
                <ArrowUp size={13} />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => moveSection(section.id, 1)}
                disabled={index < 0 || index >= total - 1}
                aria-label="Move section down"
                title="Move section down"
              >
                <ArrowDown size={13} />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setConfirming(true)}
                aria-label="Delete section"
                title="Delete section"
              >
                <Trash2 size={13} />
              </Button>
            </div>
          </div>
          <input
            value={section.title}
            onChange={(event) => renameSection(section.id, event.target.value)}
            placeholder={meta.label}
            className="mt-0.5 w-full bg-transparent font-display text-[26px] leading-tight text-ink outline-none placeholder:text-faint"
            aria-label="Section title"
          />
          <p className="mt-1 text-[12.5px] leading-relaxed text-muted">{meta.blurb}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-surface px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-[11.5px] text-muted">Layout</span>
          <select
            value={section.layout}
            onChange={(event) => setSectionLayout(section.id, event.target.value as SectionLayout)}
            className="h-8 rounded-md border border-line bg-surface px-2 text-[12px] text-ink outline-none focus:border-accent"
            aria-label="Section layout"
          >
            {LAYOUT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-[11.5px] text-muted">
          <Toggle
            checked={section.visible}
            onChange={() => toggleSection(section.id)}
            label="Show section"
          />
          {section.visible ? 'Visible' : 'Hidden'}
        </label>
      </div>

      <div className="mt-5">
        <div className="mb-2.5 flex items-baseline justify-between">
          <h2 className="text-[12px] font-semibold text-ink">
            {section.items.length === 1 ? `1 ${meta.singular.toLowerCase()}` : `${section.items.length} entries`}
          </h2>
          <span className="text-[10.5px] text-faint">Newest first</span>
        </div>
        <div className="space-y-2">
          {section.items.map((entry, entryIndex) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              section={section}
              index={entryIndex}
              total={section.items.length}
            />
          ))}
        </div>
        <Button
          variant="secondary"
          size="md"
          className="mt-2 w-full border-dashed"
          onClick={() => addEntry(section.id)}
        >
          <Plus size={14} /> Add {meta.singular.toLowerCase()}
        </Button>
      </div>

      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title={`Delete “${section.title || meta.label}”?`}
        description="This removes the section and its entries from this CV. You can undo immediately afterwards."
        confirmLabel="Delete section"
        onConfirm={() => {
          removeSection(section.id)
          onDeleted()
        }}
      />
    </div>
  )
}
