import { beforeEach, describe, expect, it } from 'vitest'
import { createBlankDoc } from '@/data/defaults'
import { useDocStore } from './docStore'

function reset() {
  useDocStore.getState().setDoc(createBlankDoc())
}

describe('document store', () => {
  beforeEach(reset)

  it('coalesces rapid edits to one field into a single undo step', () => {
    const original = useDocStore.getState().doc?.basics.name
    const store = useDocStore.getState()
    store.updateBasics((draft) => {
      draft.name = 'A'
    }, 'name')
    store.updateBasics((draft) => {
      draft.name = 'Am'
    }, 'name')
    store.updateBasics((draft) => {
      draft.name = 'Amara'
    }, 'name')

    expect(useDocStore.getState().doc?.basics.name).toBe('Amara')
    useDocStore.getState().undo()
    expect(useDocStore.getState().doc?.basics.name).toBe(original)
    useDocStore.getState().redo()
    expect(useDocStore.getState().doc?.basics.name).toBe('Amara')
  })

  it('adds, moves and removes sections', () => {
    const id = useDocStore.getState().addSection('projects')
    const sections = useDocStore.getState().doc?.sections ?? []
    expect(sections.at(-1)?.id).toBe(id)

    useDocStore.getState().moveSection(id, -1)
    const moved = useDocStore.getState().doc?.sections ?? []
    expect(moved.at(-2)?.id).toBe(id)

    useDocStore.getState().removeSection(id)
    expect(useDocStore.getState().doc?.sections.some((section) => section.id === id)).toBe(false)
  })

  it('moves a section to an arbitrary position', () => {
    const ids = (useDocStore.getState().doc?.sections ?? []).map((section) => section.id)
    expect(ids.length).toBeGreaterThanOrEqual(3)

    // Move the first section to the end.
    useDocStore.getState().moveSectionTo(ids[0], ids.length - 1)
    const after = (useDocStore.getState().doc?.sections ?? []).map((section) => section.id)
    expect(after).toEqual([...ids.slice(1), ids[0]])

    // Move it back to the front.
    useDocStore.getState().moveSectionTo(ids[0], 0)
    expect((useDocStore.getState().doc?.sections ?? []).map((section) => section.id)).toEqual(ids)

    // Out-of-range indices clamp to the end; unknown ids are no-ops.
    useDocStore.getState().moveSectionTo(ids[0], 999)
    const clamped = (useDocStore.getState().doc?.sections ?? []).map((section) => section.id)
    expect(clamped).toEqual([...ids.slice(1), ids[0]])
    useDocStore.getState().moveSectionTo(ids[0], 0)
    useDocStore.getState().moveSectionTo('missing-id', 2)
    expect((useDocStore.getState().doc?.sections ?? []).map((section) => section.id)).toEqual(ids)
  })

  it('prevents a duplicate summary section', () => {
    const existing = useDocStore.getState().doc?.sections.find((section) => section.kind === 'summary')
    const id = useDocStore.getState().addSection('summary')
    expect(id).toBe(existing?.id)
    expect(
      useDocStore.getState().doc?.sections.filter((section) => section.kind === 'summary'),
    ).toHaveLength(1)
  })

  it('adds and updates entries with stable ids', () => {
    const section = useDocStore.getState().doc?.sections.find((item) => item.kind === 'experience')
    expect(section).toBeTruthy()
    if (!section) return

    const entryId = useDocStore.getState().addEntry(section.id)
    useDocStore.getState().updateEntry(section.id, entryId, (draft) => {
      draft.title = 'Staff Engineer'
      draft.organization = 'Example Co'
      draft.bullets = ['Shipped a design system.']
    }, 'title')

    const updated = useDocStore
      .getState()
      .doc?.sections.find((item) => item.id === section.id)
      ?.items.find((item) => item.id === entryId)
    expect(updated?.title).toBe('Staff Engineer')
    expect(updated?.bullets).toEqual(['Shipped a design system.'])
  })

  it('duplicates an entry with a new id immediately after the source', () => {
    const section = useDocStore.getState().doc?.sections.find((item) => item.kind === 'experience')
    if (!section) throw new Error('missing experience section')
    const sourceId = section.items[0].id
    const copyId = useDocStore.getState().duplicateEntry(section.id, sourceId)
    const items =
      useDocStore.getState().doc?.sections.find((item) => item.id === section.id)?.items ?? []
    expect(copyId).not.toBe(sourceId)
    expect(items[1].id).toBe(copyId)
  })

  it('clears redo history after a new edit', () => {
    useDocStore.getState().updateBasics((draft) => {
      draft.headline = 'Designer'
    })
    useDocStore.getState().undo()
    expect(useDocStore.getState().future.length).toBe(1)
    useDocStore.getState().updateBasics((draft) => {
      draft.headline = 'Design lead'
    })
    expect(useDocStore.getState().future.length).toBe(0)
  })
})
