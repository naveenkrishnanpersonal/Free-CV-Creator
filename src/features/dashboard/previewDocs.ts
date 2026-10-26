import { DEFAULT_STYLE } from '@/data/defaults'
import { EXAMPLE_DOC } from '@/data/example'
import { getPreset, STYLE_PRESETS, type StylePreset } from '@/data/stylePresets'
import type { ResumeDoc, StyleConfig } from '@/lib/schema'

const PREVIEW_SUMMARY =
  'Senior product designer with eight years of experience turning complex financial workflows into products people can use without a manual.'

const PREVIEW_SECTION_KINDS = new Set(['summary', 'experience', 'education', 'skills', 'languages'])

/** Trimmed example content for the real renderer used in dashboard previews. */
export function previewDocForStyle(style: StyleConfig): ResumeDoc {
  return {
    ...EXAMPLE_DOC,
    basics: {
      ...EXAMPLE_DOC.basics,
      summary: PREVIEW_SUMMARY,
      profiles: EXAMPLE_DOC.basics.profiles.slice(0, 2),
    },
    settings: {
      ...EXAMPLE_DOC.settings,
      paper: { size: 'A4', widthMm: 210, heightMm: 297 },
    },
    sections: EXAMPLE_DOC.sections
      .filter((section) => PREVIEW_SECTION_KINDS.has(section.kind))
      .map((section) => ({
        ...section,
        items: section.items.slice(0, 2),
      })),
    style,
  }
}

const cleanStyle = structuredClone(DEFAULT_STYLE)
cleanStyle.name = 'Ink & Paper'
cleanStyle.colors = {
  ...cleanStyle.colors,
  accent: '#0B6FD8',
  link: '#0B6FD8',
}

const darkStyle = structuredClone(DEFAULT_STYLE)
darkStyle.name = 'Midnight'
darkStyle.layout = 'sidebar-left'
darkStyle.sidebarWidthPct = 34
darkStyle.sidebarSections = ['skills', 'languages', 'certifications', 'interests']
darkStyle.typography = {
  ...darkStyle.typography,
  bodyFont: 'inter',
  headingFont: 'inter',
  nameFont: 'inter',
  bodySizePt: 9.2,
  lineHeight: 1.4,
  nameSizePt: 25,
  headingSizePt: 7.4,
  headingWeight: 600,
  headingCase: 'upper',
  headingTracking: 0.12,
}
darkStyle.colors = {
  accent: '#4DA3FF',
  text: '#DCE7F5',
  muted: '#8FA5BF',
  heading: '#FFFFFF',
  link: '#7CBCFF',
  rule: '#26364B',
  pageBg: '#0E1828',
  sidebarBg: '#0A1422',
  sidebarText: '#DCE7F5',
  headerBg: '#0E1828',
  headerText: '#FFFFFF',
}
darkStyle.header = {
  ...darkStyle.header,
  align: 'left',
  showHeadline: true,
  contactLayout: 'stacked',
}
darkStyle.section = {
  ...darkStyle.section,
  headingStyle: 'underline',
  uppercase: true,
}
darkStyle.page = {
  ...darkStyle.page,
  marginTopMm: 12,
  marginRightMm: 13,
  marginBottomMm: 12,
  marginLeftMm: 13,
}

const warmStyle = structuredClone(getPreset('warm-serif')?.style ?? DEFAULT_STYLE)
warmStyle.name = 'Warm Serif'

export const HERO_PREVIEWS = [
  { id: 'midnight', label: 'Midnight', doc: previewDocForStyle(darkStyle) },
  { id: 'clean', label: 'Clean', doc: previewDocForStyle(cleanStyle) },
  { id: 'warm', label: 'Warm', doc: previewDocForStyle(warmStyle) },
] as const

const FEATURED_IDS = [
  'ink-paper',
  'modern-sidebar',
  'bold-header',
  'executive',
  'slate-sidebar',
  'journal',
]

export const FEATURED_TEMPLATES: StylePreset[] = FEATURED_IDS.map((id) =>
  STYLE_PRESETS.find((preset) => preset.id === id),
).filter((preset): preset is StylePreset => Boolean(preset))
