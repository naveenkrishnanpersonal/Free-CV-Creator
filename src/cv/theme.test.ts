import { describe, expect, it } from 'vitest'
import { fitScaleForPages } from './theme'

describe('fitScaleForPages', () => {
  it('keeps content at full size when it fits the selected page count', () => {
    expect(fitScaleForPages(500, 1000, 1)).toBe(1)
    expect(fitScaleForPages(2500, 1000, 3)).toBe(1)
  })

  it('scales overflowing content to fit the selected page count', () => {
    expect(fitScaleForPages(2000, 1000, 1)).toBe(0.5)
    expect(fitScaleForPages(4000, 1000, 2)).toBe(0.5)
  })

  it('falls back to full size for invalid dimensions', () => {
    expect(fitScaleForPages(1000, 0, 2)).toBe(1)
    expect(fitScaleForPages(0, 1000, 2)).toBe(1)
    expect(fitScaleForPages(Number.NaN, 1000, 2)).toBe(1)
  })
})
