import { describe, expect, it } from 'vitest'
import { styleSchema } from '@/lib/schema'
import { getPreset, STYLE_PRESETS } from './stylePresets'

describe('style presets', () => {
  it('ships a broad, valid gallery', () => {
    expect(STYLE_PRESETS.length).toBeGreaterThanOrEqual(20)
    for (const preset of STYLE_PRESETS) {
      expect(styleSchema.safeParse(preset.style).success, preset.id).toBe(true)
      expect(preset.style.basePreset).toBe(preset.id)
      expect(preset.name.trim()).not.toBe('')
      expect(preset.tagline.trim()).not.toBe('')
    }
  })

  it('has unique ids, names and visual recipes', () => {
    expect(new Set(STYLE_PRESETS.map((preset) => preset.id)).size).toBe(STYLE_PRESETS.length)
    expect(new Set(STYLE_PRESETS.map((preset) => preset.name)).size).toBe(STYLE_PRESETS.length)

    const recipes = STYLE_PRESETS.map((preset) =>
      JSON.stringify({
        layout: preset.style.layout,
        fonts: [preset.style.typography.bodyFont, preset.style.typography.headingFont],
        accent: preset.style.colors.accent,
        header: preset.style.header,
        heading: preset.style.section.headingStyle,
      }),
    )
    expect(new Set(recipes).size).toBe(STYLE_PRESETS.length)
  })

  it('covers single, sidebar and header-band layouts plus ATS-safe options', () => {
    expect(new Set(STYLE_PRESETS.map((preset) => preset.category))).toEqual(
      new Set(['Single column', 'Sidebar', 'Header band']),
    )
    expect(STYLE_PRESETS.filter((preset) => preset.atsSafe).length).toBeGreaterThanOrEqual(2)
    expect(getPreset('slate-sidebar')?.style.layout).toBe('sidebar-right')
    expect(getPreset('missing')).toBeUndefined()
  })
})
