import { FileText } from 'lucide-react'
import { plainText } from '@/lib/markdown'
import type { Section } from '@/lib/schema'
import { useDocStore } from '@/store/docStore'
import { Textarea } from '@/components/ui/Field'
import { Toggle } from '@/components/ui/Toggle'

function countWords(text: string): number {
  const clean = plainText(text)
  return clean ? clean.split(/\s+/).filter(Boolean).length : 0
}

export function SummaryForm({ section }: { section: Section }) {
  const summary = useDocStore((state) => state.doc?.basics.summary ?? '')
  const updateBasics = useDocStore((state) => state.updateBasics)
  const renameSection = useDocStore((state) => state.renameSection)
  const toggleSection = useDocStore((state) => state.toggleSection)

  const words = countWords(summary)
  const tone = words === 0 ? 'text-faint' : words < 32 ? 'text-warning' : words > 110 ? 'text-warning' : 'text-success'

  return (
    <div className="animate-fade-up">
      <div className="flex items-start gap-3 border-b border-line pb-5">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent">
          <FileText size={17} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[10.5px] font-semibold tracking-[0.11em] text-faint uppercase">
              Summary
            </span>
            <label className="flex cursor-pointer items-center gap-2 text-[11px] text-muted">
              <Toggle
                checked={section.visible}
                onChange={() => toggleSection(section.id)}
                label="Show summary"
              />
              {section.visible ? 'Shown' : 'Hidden'}
            </label>
          </div>
          <input
            value={section.title}
            onChange={(event) => renameSection(section.id, event.target.value)}
            placeholder="Profile"
            className="mt-0.5 w-full bg-transparent font-display text-[26px] leading-tight text-ink outline-none placeholder:text-faint"
            aria-label="Summary section title"
          />
          <p className="mt-1 text-[12.5px] leading-relaxed text-muted">
            Three sentences: your level and domain, one proof point, and what you do next.
          </p>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-1.5 flex items-baseline justify-between gap-2">
          <label htmlFor="cv-summary" className="text-[11.5px] font-medium text-muted">
            Opening paragraph
          </label>
          <span className={`text-[11px] tabular ${tone}`}>
            {words} words {words > 0 && words <= 110 ? '· good length' : ''}
          </span>
        </div>
        <Textarea
          id="cv-summary"
          rows={7}
          value={summary}
          placeholder="Senior product designer with eight years of experience…"
          onChange={(event) =>
            updateBasics((draft) => {
              draft.summary = event.target.value
            }, 'summary')
          }
          className="min-h-[160px] text-[13px] leading-relaxed"
        />
        <div className="mt-2 flex items-start gap-2 rounded-md bg-surface-muted px-3 py-2.5">
          <span className="mt-0.5 text-[11px] font-semibold text-accent">Tip</span>
          <p className="text-[11.5px] leading-relaxed text-muted">
            Name the kind of product you work on and the scale you operate at. Skip adjectives like
            “passionate” and “results-driven”; the evidence should carry it.
          </p>
        </div>
      </div>
    </div>
  )
}
