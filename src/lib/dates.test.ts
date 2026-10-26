import { describe, expect, it } from 'vitest'
import { durationLabel, formatDateRange, formatDateValue, parseDateValue } from './dates'

describe('date helpers', () => {
  it('parses month and year values without timezone drift', () => {
    expect(parseDateValue('2022-03')).toEqual({ year: 2022, month: 3 })
    expect(parseDateValue('2022')).toEqual({ year: 2022, month: null })
    expect(parseDateValue('2022-13')).toBeNull()
    expect(parseDateValue('not-a-date')).toBeNull()
  })

  it('formats dates in the three supported formats', () => {
    expect(formatDateValue('2022-03', 'MMM YYYY')).toBe('Mar 2022')
    expect(formatDateValue('2022-03', 'MM/YYYY')).toBe('03/2022')
    expect(formatDateValue('2022-03', 'YYYY')).toBe('2022')
    expect(formatDateValue('2022', 'MMM YYYY')).toBe('2022')
  })

  it('formats open-ended ranges as Present', () => {
    expect(formatDateRange({ start: '2022-03', current: true })).toBe('Mar 2022 – Present')
    expect(formatDateRange({ start: '2019-06', end: '2022-02' })).toBe('Jun 2019 – Feb 2022')
    expect(formatDateRange({ start: '2022-03' })).toBe('Mar 2022')
  })

  it('calculates a human duration', () => {
    expect(durationLabel('2022-03', '2026-10')).toBe('4 yrs 8 mos')
    expect(durationLabel('2022-03', undefined, true)).toMatch(/yrs|yr|mo/)
    expect(durationLabel('', '2022-01')).toBe('')
  })
})
