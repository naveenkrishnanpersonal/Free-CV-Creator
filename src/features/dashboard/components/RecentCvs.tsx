import {
  Copy,
  Ellipsis,
  FileDown,
  FolderOpen,
  LayoutGrid,
  List,
  Pencil,
  Plus,
  Search,
  SearchX,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Menu, MenuItem, MenuSeparator } from '@/components/ui/Menu'
import { ScaledCv } from '@/features/design/ScaledCv'
import { relativeTime } from '@/lib/dates'
import type { ResumeDoc } from '@/lib/schema'
import { loadDoc, type DocSummary } from '@/lib/storage'
import { cn } from '@/lib/cn'

type SortKey = 'edited' | 'name' | 'created'
type ViewMode = 'grid' | 'list'

type CardHandlers = {
  onOpen: () => void
  onRename: () => void
  onDuplicate: () => void
  onExportPdf: () => void
  onDelete: () => void
}

function populatedSections(doc: ResumeDoc): number {
  return doc.sections.filter((section) => {
    if (!section.visible) return false
    if (section.kind === 'summary') return doc.basics.summary.trim().length > 0
    return section.items.some(
      (entry) =>
        entry.title.trim() ||
        entry.organization.trim() ||
        entry.summary.trim() ||
        entry.bullets.some((bullet) => bullet.trim()) ||
        entry.tags.length > 0,
    )
  }).length
}

function previewLabel(count: number): string {
  if (count === 0) return 'No content yet'
  return `${count} populated section${count === 1 ? '' : 's'}`
}

function DocPreview({
  doc,
  failed,
  className,
}: {
  doc: ResumeDoc | null
  failed: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md border border-line bg-paper',
        className,
      )}
      aria-hidden="true"
    >
      {doc ? (
        <ScaledCv doc={doc} />
      ) : (
        <div className="aspect-[210/297] w-full animate-pulse space-y-2 p-2.5">
          <div className="h-1.5 w-8 rounded bg-line" />
          <div className="h-2.5 w-3/5 rounded bg-line" />
          <div className="h-1 w-2/5 rounded bg-line/70" />
          <div className="mt-3 space-y-1.5">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="h-1 rounded bg-line/60"
                style={{ width: `${90 - index * 6}%` }}
              />
            ))}
          </div>
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/5" />
      {failed && (
        <div className="absolute inset-0 grid place-items-center bg-surface/90 p-2 text-center text-[8.5px] leading-tight text-muted">
          Preview unavailable
        </div>
      )}
    </div>
  )
}

function DocMenu({ title, handlers }: { title: string; handlers: CardHandlers }) {
  return (
    <Menu
      trigger={
        <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${title}`}>
          <Ellipsis size={14} />
        </Button>
      }
    >
      <MenuItem icon={<FolderOpen size={14} />} onSelect={handlers.onOpen}>
        Open
      </MenuItem>
      <MenuItem icon={<Pencil size={14} />} onSelect={handlers.onRename}>
        Rename
      </MenuItem>
      <MenuItem icon={<Copy size={14} />} onSelect={handlers.onDuplicate}>
        Duplicate
      </MenuItem>
      <MenuItem icon={<FileDown size={14} />} onSelect={handlers.onExportPdf}>
        Export PDF
      </MenuItem>
      <MenuSeparator />
      <MenuItem danger icon={<Trash2 size={14} />} onSelect={handlers.onDelete}>
        Delete
      </MenuItem>
    </Menu>
  )
}

function DocCard({
  summary,
  view,
  handlers,
}: {
  summary: DocSummary
  view: ViewMode
  handlers: CardHandlers
}) {
  const [doc, setDoc] = useState<ResumeDoc | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let active = true
    setDoc(null)
    setFailed(false)
    loadDoc(summary.id)
      .then((loaded) => {
        if (active) setDoc(loaded)
      })
      .catch(() => {
        if (active) setFailed(true)
      })
    return () => {
      active = false
    }
  }, [summary.id, summary.updatedAt])

  const template = doc?.style.name || summary.templateName || 'Custom style'
  const descriptor = [template, summary.headline || summary.name].filter(Boolean).join(' · ')
  const count = doc ? populatedSections(doc) : null

  if (view === 'list') {
    return (
      <article className="group flex items-center gap-2 rounded-xl border border-line bg-surface-raised p-2.5 transition-[border-color,box-shadow] duration-150 hover:border-line-strong hover:shadow-card">
        <button
          type="button"
          onClick={handlers.onOpen}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-lg text-left focus-visible:ring-2 focus-visible:ring-accent/30"
          aria-label={`Open ${summary.title}`}
        >
          <DocPreview doc={doc} failed={failed} className="w-[58px] shrink-0" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-semibold text-ink" title={summary.title}>
              {summary.title}
            </span>
            <span className="mt-0.5 block truncate text-[10.5px] text-muted">
              {descriptor || 'No content yet'}
            </span>
            <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-faint">
              <span>{count === null ? 'Loading…' : previewLabel(count)}</span>
              <span aria-hidden="true">·</span>
              <span>{relativeTime(summary.updatedAt)}</span>
            </span>
          </span>
        </button>
        <DocMenu title={summary.title} handlers={handlers} />
      </article>
    )
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-line bg-surface-raised transition-[border-color,box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-float">
      <button
        type="button"
        onClick={handlers.onOpen}
        className="flex flex-1 flex-col p-2.5 pb-2 text-left focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/30"
        aria-label={`Open ${summary.title}`}
      >
        <DocPreview doc={doc} failed={failed} className="aspect-[2/1] short:aspect-[2.3/1]" />
        <span className="min-w-0 px-1 pt-2.5">
          <span className="block truncate text-[13px] font-semibold text-ink" title={summary.title}>
            {summary.title}
          </span>
          <span className="mt-1 block truncate text-[10.5px] text-muted">
            {descriptor || 'No content yet'}
          </span>
        </span>
      </button>
      <div className="mt-auto flex items-center gap-2 border-t border-line/70 px-3.5 py-1.5">
        <span className="min-w-0 truncate text-[10px] text-faint">
          {count === null ? 'Loading…' : previewLabel(count)}
        </span>
        <span className="ml-auto shrink-0 text-[10px] text-faint">
          {relativeTime(summary.updatedAt)}
        </span>
        <DocMenu title={summary.title} handlers={handlers} />
      </div>
    </article>
  )
}

function NewDocCard({
  view,
  busy,
  onClick,
}: {
  view: ViewMode
  busy: boolean
  onClick: () => void
}) {
  if (view === 'list') {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        className="flex w-full items-center gap-3 rounded-xl border border-dashed border-line-strong bg-surface/50 px-3 py-3 text-left transition-colors duration-150 hover:border-accent hover:bg-accent-soft/40 disabled:cursor-not-allowed disabled:opacity-45"
      >
        <span className="grid size-8 shrink-0 place-items-center rounded-full border border-line bg-surface text-muted">
          <Plus size={15} />
        </span>
        <span className="min-w-0">
          <span className="block text-[12.5px] font-semibold text-ink">Create New CV</span>
          <span className="mt-0.5 block text-[10.5px] text-muted">
            Start from a blank page or use a template.
          </span>
        </span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="group flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-line-strong bg-surface/50 p-6 text-center transition-colors duration-150 short:min-h-[180px] hover:border-accent hover:bg-accent-soft/40 disabled:cursor-not-allowed disabled:opacity-45"
    >
      <span className="grid size-10 place-items-center rounded-full border border-line bg-surface text-muted transition-colors duration-150 group-hover:border-accent/40 group-hover:text-accent">
        <Plus size={18} />
      </span>
      <span>
        <span className="block text-[12.5px] font-semibold text-ink">Create New CV</span>
        <span className="mt-1 block text-[10.5px] text-muted">
          Start from a blank page or use a template.
        </span>
      </span>
    </button>
  )
}

function EmptyLibrary({
  busy,
  onCreate,
  onExample,
  onImport,
}: {
  busy: boolean
  onCreate: () => void
  onExample: () => void
  onImport: () => void
}) {
  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-line bg-surface-raised">
      <div className="grid items-center gap-6 p-5 sm:grid-cols-[minmax(0,1fr)_170px] sm:p-7">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 text-[10px] font-semibold tracking-[0.03em] text-accent">
            <Sparkles size={11} />
            Start here
          </span>
          <h3 className="mt-3 text-[20px] leading-tight font-semibold tracking-[-0.025em] text-ink sm:text-[22px]">
            Your first CV starts here.
          </h3>
          <p className="mt-2 max-w-[52ch] text-[12px] leading-relaxed text-muted">
            Begin with a blank page, or open a fully written example to see how a strong CV is
            structured. You can restyle either one completely.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="primary" size="md" onClick={onCreate} disabled={busy}>
              <Plus size={14} />
              Create a CV
            </Button>
            <Button variant="secondary" size="md" onClick={onExample} disabled={busy}>
              <Sparkles size={13} />
              Open the example
            </Button>
            <Button variant="ghost" size="md" onClick={onImport} disabled={busy}>
              Import a backup
            </Button>
          </div>
        </div>

        <div className="relative hidden items-center justify-center sm:flex" aria-hidden="true">
          <div className="absolute size-32 rounded-full bg-accent/10 blur-2xl" />
          <div className="relative w-[128px] rotate-[-3deg] rounded-md border border-line bg-paper p-3 shadow-float">
            <div className="h-1.5 w-8 rounded-full bg-accent" />
            <div className="mt-3 h-2.5 w-4/5 rounded bg-[#d8dee8]" />
            <div className="mt-1.5 h-1 w-2/5 rounded bg-[#e7ecf3]" />
            <div className="mt-4 space-y-3">
              {[0, 1, 2].map((group) => (
                <div key={group}>
                  <div className="h-1 w-1/3 rounded bg-[#c9d3e2]" />
                  <div className="mt-1 h-px w-full bg-[#e7ecf3]" />
                  <div className="mt-1.5 space-y-1">
                    <div className="h-[2px] w-full rounded bg-[#e7ecf3]" />
                    <div className="h-[2px] w-5/6 rounded bg-[#e7ecf3]" />
                    <div className="h-[2px] w-3/5 rounded bg-[#e7ecf3]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function RecentCvs({
  docs,
  error,
  busy,
  onRetry,
  onOpen,
  onRename,
  onDuplicate,
  onExportPdf,
  onDelete,
  onCreate,
  onExample,
  onImport,
}: {
  docs: DocSummary[] | null
  error: string
  busy: boolean
  onRetry: () => void
  onOpen: (summary: DocSummary) => void
  onRename: (summary: DocSummary) => void
  onDuplicate: (summary: DocSummary) => void
  onExportPdf: (summary: DocSummary) => void
  onDelete: (summary: DocSummary) => void
  onCreate: () => void
  onExample: () => void
  onImport: () => void
}) {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('edited')
  const [view, setView] = useState<ViewMode>('grid')
  const loading = docs === null && !error

  const filtered = useMemo(() => {
    const items = docs ?? []
    const needle = query.trim().toLowerCase()
    const matched = needle
      ? items.filter((item) =>
          [item.title, item.name, item.headline, item.templateName]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(needle)),
        )
      : items

    return [...matched].sort((a, b) => {
      if (sort === 'name') return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' })
      if (sort === 'created') return b.createdAt.localeCompare(a.createdAt)
      return b.updatedAt.localeCompare(a.updatedAt)
    })
  }, [docs, query, sort])

  const hasDocs = Boolean(docs && docs.length > 0)
  const isEmpty = docs !== null && docs.length === 0 && !error

  return (
    <section id="recent" aria-labelledby="recent-title" className="scroll-mt-20">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <h2
              id="recent-title"
              className="text-[17px] font-semibold tracking-[-0.025em] text-ink"
            >
              Recent CVs
            </h2>
            {hasDocs && (
              <span
                role="status"
                aria-live="polite"
                className="text-[10.5px] text-faint tabular"
              >
                {filtered.length} of {docs?.length}
              </span>
            )}
          </div>
          <p className="mt-1 text-[12px] text-muted">Your saved CV documents</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center xl:shrink-0">
          <div className="relative min-w-0 flex-1 sm:w-[230px] sm:flex-none xl:w-[250px]">
          <Search
            size={14}
            className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-faint"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            disabled={!hasDocs && !loading}
            placeholder="Search CVs…"
            aria-label="Search CVs"
            className="h-9 w-full rounded-lg border border-line bg-surface pr-8 pl-8 text-[12px] text-ink placeholder:text-faint transition-[border-color,box-shadow] duration-150 hover:border-line-strong focus:border-accent focus:ring-2 focus:ring-accent/15 focus:outline-none disabled:cursor-not-allowed disabled:opacity-45"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute top-1/2 right-1 grid size-7 -translate-y-1/2 place-items-center rounded-md text-faint transition-colors hover:bg-surface-muted hover:text-ink"
            >
              <X size={13} />
            </button>
          )}
        </div>

          <div className="flex items-center gap-2">
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortKey)}
              aria-label="Sort CVs"
              disabled={!hasDocs}
              className="h-9 min-w-0 flex-1 rounded-lg border border-line bg-surface px-2 text-[11.5px] text-ink transition-colors hover:border-line-strong focus:border-accent focus:outline-none disabled:cursor-not-allowed disabled:opacity-45 sm:w-[145px] sm:flex-none"
            >
              <option value="edited">Last edited</option>
              <option value="name">Name</option>
              <option value="created">Date created</option>
            </select>

            <div
              className="flex shrink-0 rounded-lg border border-line bg-surface p-0.5"
              role="group"
              aria-label="CV view"
            >
              <button
                type="button"
                onClick={() => setView('grid')}
                aria-pressed={view === 'grid'}
                aria-label="Grid view"
                title="Grid view"
                className={cn(
                  'grid size-7 place-items-center rounded-md transition-colors duration-150',
                  view === 'grid'
                    ? 'bg-accent-soft text-accent'
                    : 'text-faint hover:bg-surface-muted hover:text-ink',
                )}
              >
                <LayoutGrid size={14} />
              </button>
              <button
                type="button"
                onClick={() => setView('list')}
                aria-pressed={view === 'list'}
                aria-label="List view"
                title="List view"
                className={cn(
                  'grid size-7 place-items-center rounded-md transition-colors duration-150',
                  view === 'list'
                    ? 'bg-accent-soft text-accent'
                    : 'text-faint hover:bg-surface-muted hover:text-ink',
                )}
              >
                <List size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-danger/25 bg-danger-soft p-4"
        >
          <h3 className="text-[13px] font-semibold text-danger">
            Your CV library could not be read
          </h3>
          <p className="mt-1 text-[11.5px] leading-relaxed text-danger/90">{error}</p>
          <p className="mt-1.5 text-[11px] leading-relaxed text-muted">
            Try again. If this keeps happening, your browser storage may be blocked or full.
            Existing backup files on your computer are not affected.
          </p>
          <Button variant="secondary" size="sm" onClick={onRetry} className="mt-3">
            Try again
          </Button>
        </div>
      )}

      {loading && (
        <div
          className={cn(
            'mt-3 short:mt-2',
            view === 'grid'
              ? 'grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4'
              : 'space-y-2',
          )}
          role="status"
          aria-label="Loading your CVs"
        >
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse rounded-xl border border-line bg-surface-raised p-2.5"
            >
              <div className={view === 'grid' ? 'aspect-[2/1] rounded-md bg-surface-muted short:aspect-[2.3/1]' : 'h-20 rounded-md bg-surface-muted'} />
              <div className="mt-3 h-2.5 w-3/5 rounded bg-line" />
              <div className="mt-2 h-2 w-2/5 rounded bg-line/60" />
            </div>
          ))}
        </div>
      )}

      {isEmpty && (
        <EmptyLibrary busy={busy} onCreate={onCreate} onExample={onExample} onImport={onImport} />
      )}

      {hasDocs && !error && filtered.length === 0 && (
        <div className="mt-4 flex flex-col items-center rounded-xl border border-dashed border-line-strong bg-surface-raised px-5 py-10 text-center">
          <span className="grid size-9 place-items-center rounded-full bg-surface-muted text-faint">
            <SearchX size={16} />
          </span>
          <h3 className="mt-3 text-[14px] font-semibold text-ink">
            No CVs match “{query.trim()}”
          </h3>
          <p className="mt-1 max-w-[40ch] text-[11.5px] leading-relaxed text-muted">
            Try a different title, name, or template.
          </p>
          <Button variant="secondary" size="sm" onClick={() => setQuery('')} className="mt-3">
            Reset search
          </Button>
        </div>
      )}

      {hasDocs && !error && filtered.length > 0 && (
        <div
          className={cn(
            'mt-3 short:mt-2',
            view === 'grid'
              ? 'grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4'
              : 'space-y-2',
          )}
        >
          {filtered.map((summary) => (
            <DocCard
              key={summary.id}
              summary={summary}
              view={view}
              handlers={{
                onOpen: () => onOpen(summary),
                onRename: () => onRename(summary),
                onDuplicate: () => onDuplicate(summary),
                onExportPdf: () => onExportPdf(summary),
                onDelete: () => onDelete(summary),
              }}
            />
          ))}
          <NewDocCard view={view} busy={busy} onClick={onCreate} />
        </div>
      )}
    </section>
  )
}
