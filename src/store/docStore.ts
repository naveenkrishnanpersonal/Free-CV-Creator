import { produce } from 'immer'
import { create } from 'zustand'
import { createEntry, createSection } from '@/data/defaults'
import type { SectionKind, SectionLayout } from '@/lib/constants'
import { newId } from '@/lib/ids'
import type { Entry, Photo, Profile, ResumeDoc, StyleConfig } from '@/lib/schema'

const HISTORY_LIMIT = 100
const COALESCE_MS = 900

type Recipe<T> = (draft: T) => void

export type DocState = {
  doc: ResumeDoc | null
  past: ResumeDoc[]
  future: ResumeDoc[]
  lastHistoryAt: number
  lastHistoryKey: string | null

  setDoc: (doc: ResumeDoc | null) => void
  clearHistory: () => void
  undo: () => void
  redo: () => void
  update: (recipe: Recipe<ResumeDoc>, coalesceKey?: string) => void

  updateBasics: (recipe: Recipe<ResumeDoc['basics']>, coalesceKey?: string) => void
  addProfile: () => string
  updateProfile: (id: string, recipe: Recipe<Profile>, coalesceKey?: string) => void
  removeProfile: (id: string) => void
  setPhoto: (photo: Photo | null, coalesceKey?: string) => void

  addSection: (kind: SectionKind) => string
  removeSection: (id: string) => void
  renameSection: (id: string, title: string) => void
  toggleSection: (id: string) => void
  setSectionLayout: (id: string, layout: SectionLayout) => void
  moveSection: (id: string, direction: -1 | 1) => void
  moveSectionTo: (id: string, index: number) => void

  addEntry: (sectionId: string) => string
  updateEntry: (
    sectionId: string,
    entryId: string,
    recipe: Recipe<Entry>,
    coalesceKey?: string,
  ) => void
  removeEntry: (sectionId: string, entryId: string) => void
  duplicateEntry: (sectionId: string, entryId: string) => string
  moveEntry: (sectionId: string, entryId: string, direction: -1 | 1) => void

  updateStyle: (recipe: Recipe<ResumeDoc['style']>, coalesceKey?: string) => void
  applyStyle: (style: StyleConfig) => void
  updateSettings: (recipe: Recipe<ResumeDoc['settings']>) => void
}

export const useDocStore = create<DocState>()((set, get) => ({
  doc: null,
  past: [],
  future: [],
  lastHistoryAt: 0,
  lastHistoryKey: null,

  setDoc: (doc) =>
    set({
      doc,
      past: [],
      future: [],
      lastHistoryAt: 0,
      lastHistoryKey: null,
    }),

  clearHistory: () => set({ past: [], future: [], lastHistoryAt: 0, lastHistoryKey: null }),

  undo: () => {
    const { doc, past, future } = get()
    if (!doc || past.length === 0) return
    const previous = past[past.length - 1]
    set({
      doc: { ...previous, updatedAt: new Date().toISOString() },
      past: past.slice(0, -1),
      future: [doc, ...future].slice(0, HISTORY_LIMIT),
      lastHistoryKey: null,
      lastHistoryAt: 0,
    })
  },

  redo: () => {
    const { doc, past, future } = get()
    if (!doc || future.length === 0) return
    const next = future[0]
    set({
      doc: { ...next, updatedAt: new Date().toISOString() },
      past: [...past, doc].slice(-HISTORY_LIMIT),
      future: future.slice(1),
      lastHistoryKey: null,
      lastHistoryAt: 0,
    })
  },

  update: (recipe, coalesceKey) =>
    set((state) => {
      if (!state.doc) return state
      const now = Date.now()
      const shouldSnapshot =
        !coalesceKey ||
        coalesceKey !== state.lastHistoryKey ||
        now - state.lastHistoryAt > COALESCE_MS
      const past = shouldSnapshot
        ? [...state.past, state.doc].slice(-HISTORY_LIMIT)
        : state.past
      const nextDoc = produce(state.doc, (draft) => {
        recipe(draft)
        draft.updatedAt = new Date().toISOString()
      })
      return {
        doc: nextDoc,
        past,
        future: shouldSnapshot ? [] : state.future,
        lastHistoryAt: now,
        lastHistoryKey: coalesceKey ?? null,
      }
    }),

  updateBasics: (recipe, coalesceKey) =>
    get().update((draft) => recipe(draft.basics), coalesceKey ? `basics:${coalesceKey}` : undefined),

  addProfile: () => {
    const id = newId()
    get().update((draft) => {
      draft.basics.profiles.push({ id, network: 'LinkedIn', label: '', url: '' })
    })
    return id
  },

  updateProfile: (id, recipe, coalesceKey) =>
    get().update((draft) => {
      const profile = draft.basics.profiles.find((item) => item.id === id)
      if (profile) recipe(profile)
    }, coalesceKey ? `profile:${id}:${coalesceKey}` : undefined),

  removeProfile: (id) =>
    get().update((draft) => {
      draft.basics.profiles = draft.basics.profiles.filter((profile) => profile.id !== id)
    }),

  setPhoto: (photo, coalesceKey) =>
    get().update(
      (draft) => {
        draft.basics.photo = photo
      },
      coalesceKey ? `photo:${coalesceKey}` : undefined,
    ),

  addSection: (kind) => {
    const existing = get().doc?.sections.find((section) => section.kind === kind)
    if (kind === 'summary' && existing) return existing.id
    const section = createSection(kind)
    get().update((draft) => {
      draft.sections.push(section)
    })
    return section.id
  },

  removeSection: (id) =>
    get().update((draft) => {
      draft.sections = draft.sections.filter((section) => section.id !== id)
    }),

  renameSection: (id, title) =>
    get().update(
      (draft) => {
        const section = draft.sections.find((item) => item.id === id)
        if (section) section.title = title
      },
      `section-title:${id}`,
    ),

  toggleSection: (id) =>
    get().update((draft) => {
      const section = draft.sections.find((item) => item.id === id)
      if (section) section.visible = !section.visible
    }),

  setSectionLayout: (id, layout) =>
    get().update((draft) => {
      const section = draft.sections.find((item) => item.id === id)
      if (section) section.layout = layout
    }),

  moveSection: (id, direction) =>
    get().update((draft) => {
      const index = draft.sections.findIndex((section) => section.id === id)
      const target = index + direction
      if (index < 0 || target < 0 || target >= draft.sections.length) return
      const [section] = draft.sections.splice(index, 1)
      draft.sections.splice(target, 0, section)
    }),

  moveSectionTo: (id, index) =>
    get().update((draft) => {
      const from = draft.sections.findIndex((section) => section.id === id)
      if (from < 0) return
      const to = Math.max(0, Math.min(index, draft.sections.length - 1))
      if (from === to) return
      const [section] = draft.sections.splice(from, 1)
      draft.sections.splice(to, 0, section)
    }),

  addEntry: (sectionId) => {
    const section = get().doc?.sections.find((item) => item.id === sectionId)
    if (!section) return ''
    const entry = createEntry(section.kind)
    get().update((draft) => {
      const target = draft.sections.find((item) => item.id === sectionId)
      if (target) target.items.push(entry)
    })
    return entry.id
  },

  updateEntry: (sectionId, entryId, recipe, coalesceKey) =>
    get().update(
      (draft) => {
        const section = draft.sections.find((item) => item.id === sectionId)
        const entry = section?.items.find((item) => item.id === entryId)
        if (entry) recipe(entry)
      },
      coalesceKey ? `entry:${entryId}:${coalesceKey}` : undefined,
    ),

  removeEntry: (sectionId, entryId) =>
    get().update((draft) => {
      const section = draft.sections.find((item) => item.id === sectionId)
      if (section) section.items = section.items.filter((item) => item.id !== entryId)
    }),

  duplicateEntry: (sectionId, entryId) => {
    const id = newId()
    get().update((draft) => {
      const section = draft.sections.find((item) => item.id === sectionId)
      if (!section) return
      const index = section.items.findIndex((item) => item.id === entryId)
      if (index < 0) return
      const source = section.items[index]
      const copy = {
        ...source,
        id,
        bullets: [...source.bullets],
        tags: [...source.tags],
        meta: { ...source.meta },
      }
      section.items.splice(index + 1, 0, copy)
    })
    return id
  },

  moveEntry: (sectionId, entryId, direction) =>
    get().update((draft) => {
      const section = draft.sections.find((item) => item.id === sectionId)
      if (!section) return
      const index = section.items.findIndex((item) => item.id === entryId)
      const target = index + direction
      if (index < 0 || target < 0 || target >= section.items.length) return
      const [entry] = section.items.splice(index, 1)
      section.items.splice(target, 0, entry)
    }),

  updateStyle: (recipe, coalesceKey) =>
    get().update((draft) => recipe(draft.style), coalesceKey ? `style:${coalesceKey}` : undefined),

  applyStyle: (style) =>
    get().update((draft) => {
      draft.style = structuredClone(style)
      if (draft.basics.photo) draft.style.header.showPhoto = true
    }),

  updateSettings: (recipe) => get().update((draft) => recipe(draft.settings)),
}))
