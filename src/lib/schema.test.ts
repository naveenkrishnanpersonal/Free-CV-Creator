import { describe, expect, it } from 'vitest'
import { createBlankDoc, createSection, duplicateDoc } from '@/data/defaults'
import { EXAMPLE_DOC } from '@/data/example'
import { docSchema, styleSchema } from './schema'

describe('document schema', () => {
  it('accepts the example document', () => {
    const result = docSchema.safeParse(EXAMPLE_DOC)
    expect(result.success).toBe(true)
  })

  it('accepts a freshly created blank document', () => {
    const result = docSchema.safeParse(createBlankDoc())
    expect(result.success).toBe(true)
  })

  it('defaults older documents to one page and allows up to three pages', () => {
    const doc = createBlankDoc()
    const { pageCount: _pageCount, ...legacySettings } = doc.settings

    expect(docSchema.parse({ ...doc, settings: legacySettings }).settings.pageCount).toBe(1)
    expect(docSchema.parse({ ...doc, settings: { ...doc.settings, pageCount: 3 } }).settings.pageCount)
      .toBe(3)
    expect(docSchema.safeParse({ ...doc, settings: { ...doc.settings, pageCount: 4 } }).success)
      .toBe(false)
  })

  it('rejects invalid date formats', () => {
    const doc = createBlankDoc()
    doc.sections[1].items[0].start = 'March 2022'
    expect(docSchema.safeParse(doc).success).toBe(false)
  })

  it('rejects an invalid accent colour', () => {
    const style = structuredClone(EXAMPLE_DOC.style)
    style.colors.accent = 'blue'
    expect(styleSchema.safeParse(style).success).toBe(false)
  })

  it('keeps section and entry ids unique when duplicating a document', () => {
    const copy = duplicateDoc(EXAMPLE_DOC)
    expect(copy.id).not.toBe(EXAMPLE_DOC.id)
    expect(copy.title).toContain('copy')
    expect(copy.sections[0].id).toBe(EXAMPLE_DOC.sections[0].id)
  })

  it('creates a summary section without placeholder entries', () => {
    const section = createSection('summary')
    expect(section.items).toHaveLength(0)
    expect(section.kind).toBe('summary')
  })

  it('creates one empty entry for list sections', () => {
    const section = createSection('experience')
    expect(section.items).toHaveLength(1)
    expect(section.items[0].bullets).toEqual([''])
  })
})
