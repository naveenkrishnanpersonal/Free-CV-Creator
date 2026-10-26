import type { SectionKind } from '@/lib/constants'
import { newId } from '@/lib/ids'
import type { DocSettings, Entry, ResumeDoc, Section, StyleConfig } from '@/lib/schema'
import { SECTION_META } from '@/lib/sectionMeta'

export const DEFAULT_STYLE: StyleConfig = {
  version: 1,
  name: 'Ink & Paper',
  basePreset: null,
  layout: 'single',
  sidebarWidthPct: 32,
  sidebarSections: ['skills', 'languages', 'certifications', 'interests'],
  columnGapMm: 10,
  typography: {
    bodyFont: 'inter',
    headingFont: 'inter',
    nameFont: 'newsreader',
    bodySizePt: 10,
    lineHeight: 1.42,
    nameSizePt: 30,
    headingSizePt: 8.5,
    headingWeight: 600,
    headingCase: 'upper',
    headingTracking: 0.12,
    bodyTracking: 0,
  },
  colors: {
    accent: '#1F4E79',
    text: '#1C1F24',
    muted: '#5B6169',
    heading: '#16181C',
    link: '#1F4E79',
    rule: '#D8D5CE',
    pageBg: '#FFFFFF',
    sidebarBg: '#F3F5F7',
    sidebarText: '#1C1F24',
    headerBg: '#FFFFFF',
    headerText: '#16181C',
  },
  header: {
    align: 'left',
    showHeadline: true,
    showPhoto: false,
    photoSizeMm: 24,
    contactLayout: 'inline',
    showIcons: false,
  },
  section: {
    headingStyle: 'underline',
    showIcons: false,
    uppercase: true,
    spacing: 1,
    numbered: false,
  },
  entry: {
    titleDate: 'inline',
    showLocation: true,
    showSummary: true,
    bulletStyle: 'dash',
    bulletIndentMm: 3.5,
  },
  page: {
    marginTopMm: 14,
    marginRightMm: 15,
    marginBottomMm: 14,
    marginLeftMm: 15,
  },
  sectionVariants: {},
  customCss: '',
  layoutBuilder: null,
}

export const DEFAULT_SETTINGS: DocSettings = {
  paper: { size: 'A4', widthMm: 210, heightMm: 297 },
  pageCount: 1,
  pageNumbers: 'page-of-total',
  runningHeader: true,
  footerText: '',
  dateFormat: 'MMM YYYY',
}

export function createEntry(kind: SectionKind): Entry {
  const meta = SECTION_META[kind]
  return {
    id: newId(),
    title: '',
    organization: '',
    location: '',
    start: '',
    end: '',
    current: false,
    url: '',
    summary: '',
    bullets: meta.showBullets ? [''] : [],
    tags: [],
    meta: {},
    visible: true,
  }
}

export function createSection(kind: SectionKind, title?: string): Section {
  const meta = SECTION_META[kind]
  return {
    id: newId(),
    kind,
    title: title ?? (kind === 'summary' ? 'Profile' : meta.label),
    visible: true,
    layout: meta.defaultLayout,
    items: kind === 'summary' ? [] : [createEntry(kind)],
  }
}

export function createBlankDoc(title = 'Untitled CV'): ResumeDoc {
  const now = new Date().toISOString()
  return {
    schemaVersion: 1,
    id: newId(),
    title,
    createdAt: now,
    updatedAt: now,
    basics: {
      name: '',
      headline: '',
      email: '',
      phone: '',
      city: '',
      country: '',
      website: '',
      summary: '',
      profiles: [],
      photo: null,
    },
    sections: [
      createSection('summary'),
      createSection('experience'),
      createSection('education'),
      createSection('skills'),
    ],
    style: structuredClone(DEFAULT_STYLE),
    settings: structuredClone(DEFAULT_SETTINGS),
  }
}

export function duplicateDoc(doc: ResumeDoc): ResumeDoc {
  const now = new Date().toISOString()
  return {
    ...structuredClone(doc),
    id: newId(),
    title: `${doc.title} copy`,
    createdAt: now,
    updatedAt: now,
  }
}
