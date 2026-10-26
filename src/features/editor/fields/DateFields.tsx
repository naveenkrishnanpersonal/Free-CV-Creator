import { durationLabel } from '@/lib/dates'
import type { Entry, Section } from '@/lib/schema'
import { SECTION_META } from '@/lib/sectionMeta'
import { useDocStore } from '@/store/docStore'
import { Field, Input } from '@/components/ui/Field'
import { Toggle } from '@/components/ui/Toggle'

function monthValue(value: string): string {
  return /^\d{4}-\d{2}/.test(value) ? value.slice(0, 7) : ''
}

export function DateFields({ entry, section }: { entry: Entry; section: Section }) {
  const meta = SECTION_META[section.kind]
  const updateEntry = useDocStore((state) => state.updateEntry)

  if (meta.dateMode === 'none') return null

  if (meta.dateMode === 'single') {
    return (
      <Field label={meta.dateLabel} hint="Month precision is enough.">
        <Input
          type="month"
          value={monthValue(entry.start)}
          onChange={(event) =>
            updateEntry(section.id, entry.id, (draft) => {
              draft.start = event.target.value
            }, 'start')
          }
        />
      </Field>
    )
  }

  const duration = durationLabel(entry.start, entry.end, entry.current)

  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Start">
          <Input
            type="month"
            value={monthValue(entry.start)}
            onChange={(event) =>
              updateEntry(section.id, entry.id, (draft) => {
                draft.start = event.target.value
              }, 'start')
            }
          />
        </Field>
        <Field label="End">
          <Input
            type="month"
            value={monthValue(entry.end)}
            disabled={entry.current}
            onChange={(event) =>
              updateEntry(section.id, entry.id, (draft) => {
                draft.end = event.target.value
              }, 'end')
            }
          />
        </Field>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <label className="flex cursor-pointer items-center gap-2 text-[12px] text-muted">
          <Toggle
            checked={entry.current}
            onChange={(checked) =>
              updateEntry(section.id, entry.id, (draft) => {
                draft.current = checked
                if (checked) draft.end = ''
              })
            }
            label="Currently here"
          />
          Currently here
        </label>
        {duration && <span className="text-[11.5px] text-faint tabular">{duration}</span>}
      </div>
    </div>
  )
}
