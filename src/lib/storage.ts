import { createStore, del, get, keys, set } from 'idb-keyval'
import { DEFAULT_SETTINGS, DEFAULT_STYLE } from '@/data/defaults'
import type { StyleLayout } from './constants'
import { downloadJson, safeFilename } from './download'
import { newId } from './ids'
import { docSchema, type ResumeDoc } from './schema'

const store = createStore('cv-studio', 'records')
const INDEX_KEY = 'cv-studio:index'
const DOC_PREFIX = 'cv-studio:doc:'

export type DocSummary = {
  id: string
  title: string
  name: string
  headline: string
  createdAt: string
  updatedAt: string
  layout: StyleLayout
  accent: string
  templateName: string
  sectionCount: number
}

export class StorageError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'StorageError'
  }
}

let writeChain: Promise<unknown> = Promise.resolve()

function enqueue<T>(operation: () => Promise<T>): Promise<T> {
  const next = writeChain.then(operation, operation)
  writeChain = next.catch(() => undefined)
  return next
}

function docKey(id: string): string {
  return `${DOC_PREFIX}${id}`
}

export function toSummary(doc: ResumeDoc): DocSummary {
  return {
    id: doc.id,
    title: doc.title.trim() || 'Untitled CV',
    name: doc.basics.name.trim(),
    headline: doc.basics.headline.trim(),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    layout: doc.style.layout,
    accent: doc.style.colors.accent,
    templateName: doc.style.name,
    sectionCount: doc.sections.filter((section) => section.visible).length,
  }
}

async function readIndex(): Promise<DocSummary[]> {
  const stored = await get<DocSummary[]>(INDEX_KEY, store)
  if (Array.isArray(stored)) return stored

  // Index missing (first run or cleared storage): rebuild from document records.
  const allKeys = await keys(store)
  const documentKeys = allKeys.filter(
    (key): key is string => typeof key === 'string' && key.startsWith(DOC_PREFIX),
  )
  const records = await Promise.all(
    documentKeys.map((key) => get<ResumeDoc>(key, store).catch(() => undefined)),
  )
  const summaries = records
    .filter((record): record is ResumeDoc => Boolean(record))
    .map((record) => toSummary(record))
  await set(INDEX_KEY, summaries, store)
  return summaries
}

export async function listDocs(): Promise<DocSummary[]> {
  try {
    const index = await readIndex()
    return [...index].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  } catch (error) {
    throw new StorageError(
      error instanceof Error
        ? `Could not read your CV library: ${error.message}`
        : 'Could not read your CV library.',
    )
  }
}

export async function saveDoc(doc: ResumeDoc): Promise<void> {
  await enqueue(async () => {
    try {
      await set(docKey(doc.id), doc, store)
      const index = await readIndex()
      const next = [toSummary(doc), ...index.filter((item) => item.id !== doc.id)]
      await set(INDEX_KEY, next, store)
    } catch (error) {
      throw new StorageError(
        error instanceof Error
          ? `Could not save this CV: ${error.message}`
          : 'Could not save this CV.',
      )
    }
  })
}

export async function loadDoc(id: string): Promise<ResumeDoc> {
  const raw = await get<unknown>(docKey(id), store)
  if (!raw) throw new StorageError('This CV could not be found. It may have been deleted.')
  const candidate =
    raw && typeof raw === 'object'
      ? {
          ...(raw as Record<string, unknown>),
          schemaVersion: 1,
          style: (raw as Record<string, unknown>).style ?? DEFAULT_STYLE,
          settings: (raw as Record<string, unknown>).settings ?? DEFAULT_SETTINGS,
        }
      : raw
  const parsed = docSchema.safeParse(candidate)
  if (!parsed.success) {
    throw new StorageError(
      `This CV file is damaged (${parsed.error.issues[0]?.path.join('.') || 'unknown field'}). Export it and contact support before deleting it.`,
    )
  }
  return parsed.data
}

export async function deleteDoc(id: string): Promise<void> {
  await enqueue(async () => {
    await del(docKey(id), store)
    const index = await readIndex()
    await set(
      INDEX_KEY,
      index.filter((item) => item.id !== id),
      store,
    )
  })
}

export function exportDocFile(doc: ResumeDoc): void {
  const base = doc.basics.name.trim() || doc.title.trim() || 'cv'
  downloadJson(`${safeFilename(base)}.cv.json`, doc)
}

export async function renameDoc(id: string, title: string): Promise<ResumeDoc> {
  const doc = await loadDoc(id)
  const next: ResumeDoc = {
    ...doc,
    title: title.trim().slice(0, 120) || 'Untitled CV',
    updatedAt: new Date().toISOString(),
  }
  await saveDoc(next)
  return next
}

export async function exportBackup(): Promise<{ count: number; skipped: number }> {
  const summaries = await listDocs()
  const settled = await Promise.allSettled(summaries.map((summary) => loadDoc(summary.id)))
  const documents = settled
    .filter((result): result is PromiseFulfilledResult<ResumeDoc> => result.status === 'fulfilled')
    .map((result) => result.value)

  if (documents.length === 0) {
    throw new StorageError('There are no readable CVs to back up yet.')
  }

  const now = new Date()
  downloadJson(`cv-studio-backup-${now.toISOString().slice(0, 10)}.json`, {
    format: 'cv-studio-backup',
    version: 1,
    exportedAt: now.toISOString(),
    documents,
  })

  return { count: documents.length, skipped: settled.length - documents.length }
}

function zodMessage(error: { issues: { path: PropertyKey[]; message: string }[] }): string {
  const issue = error.issues[0]
  if (!issue) return 'The file does not match the CV format.'
  const path = issue.path.map(String).filter(Boolean).join(' → ')
  return path ? `${path}: ${issue.message}` : issue.message
}

function prepareRecord(record: Record<string, unknown>): Record<string, unknown> {
  return {
    ...record,
    schemaVersion: 1,
    style: record.style ?? DEFAULT_STYLE,
    settings: record.settings ?? DEFAULT_SETTINGS,
  }
}

export type ImportResult = {
  docs: ResumeDoc[]
  mode: 'single' | 'backup'
  skipped: number
}

/**
 * Accepts a single CV Studio .cv.json file or a full CV Studio backup.
 * Imported documents receive new ids so a restore cannot overwrite existing work.
 */
export async function importAnyFile(file: File): Promise<ImportResult> {
  if (file.size > 25 * 1024 * 1024) {
    throw new Error('That file is larger than 25 MB. Restore a smaller backup or remove large photos.')
  }
  const text = await file.text()
  let parsedJson: unknown
  try {
    parsedJson = JSON.parse(text)
  } catch {
    throw new Error('That file is not valid JSON. Use a CV Studio .cv.json export or a backup file.')
  }
  if (!parsedJson || typeof parsedJson !== 'object') {
    throw new Error('That file does not contain a CV.')
  }

  const record = parsedJson as Record<string, unknown>
  if (record.format === 'cv-studio-backup' || Array.isArray(record.documents)) {
    const list = record.documents
    if (!Array.isArray(list) || list.length === 0) {
      throw new Error('This backup file does not contain any CVs.')
    }
    if (list.length > 500) {
      throw new Error('This backup contains more than 500 CVs and was not imported.')
    }

    const docs: ResumeDoc[] = []
    let skipped = 0
    let firstFailure: string | null = null
    for (const item of list) {
      if (!item || typeof item !== 'object') {
        skipped += 1
        continue
      }
      const parsed = docSchema.safeParse(prepareRecord(item as Record<string, unknown>))
      if (!parsed.success) {
        skipped += 1
        firstFailure ??= zodMessage(parsed.error)
        continue
      }
      docs.push({
        ...parsed.data,
        id: newId(),
        title: parsed.data.title.trim() || 'Imported CV',
      })
    }

    if (docs.length === 0) {
      throw new Error(
        firstFailure
          ? `This backup could not be restored. ${firstFailure}`
          : 'This backup does not contain any readable CVs.',
      )
    }
    return { docs, mode: 'backup', skipped }
  }

  if (!('sections' in record) && ('work' in record || 'education' in record)) {
    throw new Error(
      'That looks like a JSON Resume file. Use a CV Studio .cv.json export or a CV Studio backup for now.',
    )
  }

  const parsed = docSchema.safeParse(prepareRecord(record))
  if (!parsed.success) {
    throw new Error(`This CV could not be imported. ${zodMessage(parsed.error)}`)
  }
  const now = new Date().toISOString()
  return {
    docs: [
      {
        ...parsed.data,
        id: newId(),
        title: parsed.data.title.trim() || 'Imported CV',
        createdAt: now,
        updatedAt: now,
      },
    ],
    mode: 'single',
    skipped: 0,
  }
}

export async function getStorageEstimate(): Promise<{ usage: number; quota: number } | null> {
  if (!navigator.storage?.estimate) return null
  const estimate = await navigator.storage.estimate()
  return { usage: estimate.usage ?? 0, quota: estimate.quota ?? 0 }
}
