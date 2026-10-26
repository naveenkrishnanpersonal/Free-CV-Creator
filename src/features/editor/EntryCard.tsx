import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  Copy,
  Ellipsis,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Field, Input, Textarea } from '@/components/ui/Field'
import { Menu, MenuItem, MenuSeparator } from '@/components/ui/Menu'
import { formatDateRange, formatDateValue } from '@/lib/dates'
import type { Entry, Section } from '@/lib/schema'
import { SECTION_META } from '@/lib/sectionMeta'
import { useDocStore } from '@/store/docStore'
import { BulletEditor } from './fields/BulletEditor'
import { DateFields } from './fields/DateFields'
import { TagInput } from './fields/TagInput'

export function EntryCard({
  entry,
  section,
  index,
  total,
}: {
  entry: Entry
  section: Section
  index: number
  total: number
}) {
  const meta = SECTION_META[section.kind]
  const updateEntry = useDocStore((state) => state.updateEntry)
  const removeEntry = useDocStore((state) => state.removeEntry)
  const duplicateEntry = useDocStore((state) => state.duplicateEntry)
  const moveEntry = useDocStore((state) => state.moveEntry)
  const [open, setOpen] = useState(() => entry.title.trim().length === 0)

  const dates =
    meta.dateMode === 'range'
      ? formatDateRange({
          start: entry.start,
          end: entry.end,
          current: entry.current,
          format: 'MMM YYYY',
        })
      : meta.dateMode === 'single'
        ? formatDateValue(entry.start)
        : ''
  const subtitle = [entry.organization, entry.location, dates].filter(Boolean).join(' · ')
  const heading = entry.title.trim() || `New ${meta.singular.toLowerCase()}`

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface shadow-[0_1px_1px_rgb(0_0_0_/_0.02)]">
      <div className="flex items-center gap-1 px-2.5 py-2">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-1 py-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-accent/25"
          aria-expanded={open}
        >
          <ChevronDown
            size={14}
            className={`shrink-0 text-faint transition-transform ${open ? '' : '-rotate-90'}`}
          />
          <span className="min-w-0">
            <span className="block truncate text-[12.5px] font-medium text-ink">{heading}</span>
            {subtitle && (
              <span className="mt-0.5 block truncate text-[11px] text-muted">{subtitle}</span>
            )}
          </span>
        </button>
        <div className="flex shrink-0 items-center">
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={index === 0}
            onClick={() => moveEntry(section.id, entry.id, -1)}
            aria-label="Move entry up"
            title="Move up"
          >
            <ArrowUp size={13} />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={index === total - 1}
            onClick={() => moveEntry(section.id, entry.id, 1)}
            aria-label="Move entry down"
            title="Move down"
          >
            <ArrowDown size={13} />
          </Button>
          <Menu
            trigger={
              <Button variant="ghost" size="icon-sm" aria-label={`More actions for ${heading}`}>
                <Ellipsis size={15} />
              </Button>
            }
          >
            <MenuItem icon={<Copy size={14} />} onSelect={() => duplicateEntry(section.id, entry.id)}>
              Duplicate entry
            </MenuItem>
            <MenuSeparator />
            <MenuItem
              danger
              icon={<Trash2 size={14} />}
              onSelect={() => removeEntry(section.id, entry.id)}
            >
              Delete entry
            </MenuItem>
          </Menu>
        </div>
      </div>

      {open && (
        <div className="space-y-3.5 border-t border-line px-3.5 py-3.5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label={meta.titleLabel}>
              <Input
                value={entry.title}
                placeholder={meta.titlePlaceholder}
                onChange={(event) =>
                  updateEntry(section.id, entry.id, (draft) => {
                    draft.title = event.target.value
                  }, 'title')
                }
              />
            </Field>
            {meta.organizationLabel && (
              <Field label={meta.organizationLabel}>
                <Input
                  value={entry.organization}
                  placeholder={meta.organizationPlaceholder}
                  onChange={(event) =>
                    updateEntry(section.id, entry.id, (draft) => {
                      draft.organization = event.target.value
                    }, 'organization')
                  }
                />
              </Field>
            )}
          </div>

          {(meta.showLocation || meta.showUrl) && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {meta.showLocation && (
                <Field label="Location">
                  <Input
                    value={entry.location}
                    placeholder="London, UK"
                    onChange={(event) =>
                      updateEntry(section.id, entry.id, (draft) => {
                        draft.location = event.target.value
                      }, 'location')
                    }
                  />
                </Field>
              )}
              {meta.showUrl && (
                <Field label={meta.urlLabel}>
                  <Input
                    value={entry.url}
                    placeholder="https://…"
                    inputMode="url"
                    onChange={(event) =>
                      updateEntry(section.id, entry.id, (draft) => {
                        draft.url = event.target.value
                      }, 'url')
                    }
                  />
                </Field>
              )}
            </div>
          )}

          <DateFields entry={entry} section={section} />

          {meta.showSummary && (
            <Field
              label={meta.summaryLabel}
              hint="Plain text. Blank lines create paragraphs."
            >
              <Textarea
                rows={3}
                value={entry.summary}
                placeholder={meta.summaryPlaceholder}
                onChange={(event) =>
                  updateEntry(section.id, entry.id, (draft) => {
                    draft.summary = event.target.value
                  }, 'summary')
                }
                className="min-h-[72px] text-[12.5px]"
              />
            </Field>
          )}

          {meta.showBullets && <BulletEditor entry={entry} section={section} />}

          {meta.showTags && (
            <TagInput
              entry={entry}
              section={section}
              label={meta.tagsLabel}
              placeholder={meta.tagsPlaceholder}
            />
          )}
        </div>
      )}
    </div>
  )
}
