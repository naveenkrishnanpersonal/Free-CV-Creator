import { X } from 'lucide-react'
import { useState } from 'react'
import type { Entry, Section } from '@/lib/schema'
import { useDocStore } from '@/store/docStore'

export function TagInput({
  entry,
  section,
  label,
  placeholder,
}: {
  entry: Entry
  section: Section
  label: string
  placeholder: string
}) {
  const updateEntry = useDocStore((state) => state.updateEntry)
  const [draft, setDraft] = useState('')

  const commit = (raw: string) => {
    const tokens = raw
      .split(',')
      .map((token) => token.trim())
      .filter(Boolean)
    if (tokens.length === 0) {
      setDraft('')
      return
    }
    updateEntry(section.id, entry.id, (draftEntry) => {
      for (const token of tokens) {
        if (!draftEntry.tags.includes(token)) draftEntry.tags.push(token)
      }
    })
    setDraft('')
  }

  const remove = (tag: string) => {
    updateEntry(section.id, entry.id, (draftEntry) => {
      draftEntry.tags = draftEntry.tags.filter((item) => item !== tag)
    })
  }

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="text-[11.5px] font-medium text-muted">{label}</span>
        <span className="text-[10.5px] text-faint">Enter or comma to add</span>
      </div>
      <div className="flex min-h-9 flex-wrap items-center gap-1.5 rounded-md border border-line bg-surface px-2 py-1.5 transition-[border-color,box-shadow] focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/15">
        {entry.tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-[4px] border border-line bg-surface-muted px-1.5 py-0.5 text-[11.5px] text-ink-soft"
          >
            {tag}
            <button
              type="button"
              onClick={() => remove(tag)}
              className="text-faint transition-colors hover:text-danger"
              aria-label={`Remove ${tag}`}
            >
              <X size={11} />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(event) => {
            const value = event.target.value
            if (value.includes(',')) {
              commit(value)
            } else {
              setDraft(value)
            }
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              commit(draft)
            } else if (event.key === 'Backspace' && !draft && entry.tags.length > 0) {
              remove(entry.tags[entry.tags.length - 1])
            }
          }}
          onBlur={() => commit(draft)}
          placeholder={entry.tags.length === 0 ? placeholder : ''}
          className="min-w-[110px] flex-1 bg-transparent px-1 py-0.5 text-[12.5px] outline-none placeholder:text-faint"
          aria-label={label}
        />
      </div>
    </div>
  )
}
