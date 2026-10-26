export const SECTION_KINDS = [
  'summary',
  'experience',
  'education',
  'skills',
  'projects',
  'certifications',
  'awards',
  'publications',
  'languages',
  'interests',
  'volunteer',
  'references',
  'custom',
] as const

export type SectionKind = (typeof SECTION_KINDS)[number]

export const SECTION_LAYOUTS = ['timeline', 'stacked', 'grid-2', 'tags', 'inline'] as const
export type SectionLayout = (typeof SECTION_LAYOUTS)[number]

export const FONT_KEYS = [
  'inter',
  'newsreader',
  'source-serif-4',
  'lora',
  'playfair-display',
  'manrope',
  'ibm-plex-sans',
  'ibm-plex-serif',
  'merriweather',
  'eb-garamond',
  'libre-baskerville',
  'space-grotesk',
  'georgia',
  'helvetica',
] as const

export type FontKey = (typeof FONT_KEYS)[number]

export const DATE_FORMATS = ['MMM YYYY', 'MM/YYYY', 'YYYY'] as const
export type DateFormat = (typeof DATE_FORMATS)[number]

export const STYLE_LAYOUTS = ['single', 'sidebar-left', 'sidebar-right', 'header-band'] as const
export type StyleLayout = (typeof STYLE_LAYOUTS)[number]

export const HEADING_STYLES = ['plain', 'underline', 'rule-over', 'bar-left', 'pill', 'boxed'] as const
export type HeadingStyle = (typeof HEADING_STYLES)[number]

export const BLOCK_TYPES = [
  'basics-header',
  'photo',
  'contact',
  'summary',
  'section',
  'text',
  'divider',
  'spacer',
  'skill-cloud',
] as const
export type BlockType = (typeof BLOCK_TYPES)[number]

export const PROFILE_NETWORKS = [
  'LinkedIn',
  'GitHub',
  'Dribbble',
  'Behance',
  'X',
  'Website',
  'Other',
] as const

export const PAGE_WIDTHS = {
  A4: { widthMm: 210, heightMm: 297 },
  Letter: { widthMm: 215.9, heightMm: 279.4 },
} as const
