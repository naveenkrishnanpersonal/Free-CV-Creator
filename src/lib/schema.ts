import { z } from 'zod'
import {
  BLOCK_TYPES,
  DATE_FORMATS,
  FONT_KEYS,
  HEADING_STYLES,
  SECTION_KINDS,
  SECTION_LAYOUTS,
  STYLE_LAYOUTS,
} from './constants'

const shortText = z.string().max(200)
const longText = z.string().max(6000)
const dateValue = z
  .string()
  .refine((value) => value === '' || /^\d{4}(-\d{2})?(-\d{2})?$/.test(value), {
    message: 'Use YYYY or YYYY-MM.',
  })
const hexColor = z
  .string()
  .regex(/^#[0-9a-f]{6}$/i, { message: 'Use a 6-digit hex colour, e.g. #1F4E79.' })

export const profileSchema = z.object({
  id: z.string().min(1),
  network: shortText,
  label: shortText,
  url: z.string().max(500),
})

export const photoSchema = z.object({
  dataUrl: z.string().max(3_000_000),
  zoom: z.number().min(1).max(3),
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
  shape: z.enum(['circle', 'square']),
  grayscale: z.boolean(),
})

export const basicsSchema = z.object({
  name: shortText.default(''),
  headline: shortText.default(''),
  email: shortText.default(''),
  phone: shortText.default(''),
  city: shortText.default(''),
  country: shortText.default(''),
  website: z.string().max(500).default(''),
  summary: longText.default(''),
  profiles: z.array(profileSchema).max(12).default([]),
  photo: photoSchema.nullable().optional(),
})

export const entrySchema = z.object({
  id: z.string().min(1),
  title: shortText.default(''),
  organization: shortText.default(''),
  location: shortText.default(''),
  start: dateValue.default(''),
  end: dateValue.default(''),
  current: z.boolean().default(false),
  url: z.string().max(500).default(''),
  summary: longText.default(''),
  bullets: z.array(z.string().max(1200)).max(40).default([]),
  tags: z.array(z.string().max(80)).max(40).default([]),
  meta: z.record(z.string(), z.string().max(300)).default({}),
  visible: z.boolean().default(true),
})

export const sectionSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(SECTION_KINDS),
  title: z.string().max(80),
  visible: z.boolean().default(true),
  layout: z.enum(SECTION_LAYOUTS).default('stacked'),
  items: z.array(entrySchema).max(200).default([]),
})

export const layoutBlockSchema = z.object({
  id: z.string().min(1),
  type: z.enum(BLOCK_TYPES),
  sectionId: z.string().optional(),
  text: z.string().max(2000).optional(),
  span: z.number().int().min(1).max(3).optional(),
  align: z.enum(['left', 'center', 'right']).optional(),
})

export const customLayoutSchema = z.object({
  zones: z.object({
    header: z.array(layoutBlockSchema).max(12),
    main: z.array(layoutBlockSchema).max(60),
    aside: z.array(layoutBlockSchema).max(60),
  }),
  columns: z.object({
    asideSide: z.enum(['left', 'right']),
    mainFr: z.number().min(1).max(5),
    asideFr: z.number().min(0.5).max(3),
    gapMm: z.number().min(0).max(24),
  }),
  headerOnlyOnFirstPage: z.boolean(),
})

export const styleSchema = z.object({
  version: z.literal(1),
  name: z.string().min(1).max(80),
  basePreset: z.string().nullable(),
  layout: z.enum(STYLE_LAYOUTS),
  sidebarWidthPct: z.number().min(18).max(48),
  sidebarSections: z.array(z.enum(SECTION_KINDS)).max(13).default([
    'skills',
    'languages',
    'certifications',
    'interests',
  ]),
  columnGapMm: z.number().min(0).max(24),
  typography: z.object({
    bodyFont: z.enum(FONT_KEYS),
    headingFont: z.enum(FONT_KEYS),
    nameFont: z.enum(FONT_KEYS),
    bodySizePt: z.number().min(7).max(14),
    lineHeight: z.number().min(1.05).max(2),
    nameSizePt: z.number().min(14).max(48),
    headingSizePt: z.number().min(6.5).max(16),
    headingWeight: z.number().int().min(300).max(900),
    headingCase: z.enum(['none', 'upper', 'small-caps']),
    headingTracking: z.number().min(-0.05).max(0.4),
    bodyTracking: z.number().min(-0.02).max(0.2),
  }),
  colors: z.object({
    accent: hexColor,
    text: hexColor,
    muted: hexColor,
    heading: hexColor,
    link: hexColor,
    rule: hexColor,
    pageBg: hexColor,
    sidebarBg: hexColor,
    sidebarText: hexColor,
    headerBg: hexColor,
    headerText: hexColor,
  }),
  header: z.object({
    align: z.enum(['left', 'center', 'right']),
    showHeadline: z.boolean(),
    showPhoto: z.boolean(),
    photoSizeMm: z.number().min(12).max(50),
    contactLayout: z.enum(['inline', 'stacked', 'grid']),
    showIcons: z.boolean(),
  }),
  section: z.object({
    headingStyle: z.enum(HEADING_STYLES),
    showIcons: z.boolean(),
    uppercase: z.boolean(),
    spacing: z.number().min(0.5).max(2.5),
    numbered: z.boolean(),
  }),
  entry: z.object({
    titleDate: z.enum(['inline', 'stacked', 'date-left']),
    showLocation: z.boolean(),
    showSummary: z.boolean(),
    bulletStyle: z.enum(['disc', 'dash', 'square', 'none']),
    bulletIndentMm: z.number().min(0).max(10),
  }),
  page: z.object({
    marginTopMm: z.number().min(6).max(35),
    marginRightMm: z.number().min(6).max(35),
    marginBottomMm: z.number().min(6).max(35),
    marginLeftMm: z.number().min(6).max(35),
  }),
  sectionVariants: z.record(
    z.string(),
    z.object({
      layout: z.enum(SECTION_LAYOUTS).optional(),
      showBullets: z.boolean().optional(),
    }),
  ),
  customCss: z.string().max(20_000),
  layoutBuilder: customLayoutSchema.nullable(),
})

export const paperSchema = z.object({
  size: z.enum(['A4', 'Letter', 'Custom']),
  widthMm: z.number().min(60).max(600),
  heightMm: z.number().min(60).max(900),
})

export const settingsSchema = z.object({
  paper: paperSchema,
  pageNumbers: z.enum(['none', 'page', 'page-of-total']),
  runningHeader: z.boolean(),
  footerText: z.string().max(140),
  dateFormat: z.enum(DATE_FORMATS),
})

export const docSchema = z.object({
  schemaVersion: z.literal(1),
  id: z.string().min(1),
  title: z.string().max(120),
  createdAt: z.string(),
  updatedAt: z.string(),
  basics: basicsSchema,
  sections: z.array(sectionSchema).max(60),
  style: styleSchema,
  settings: settingsSchema,
})

export type Profile = z.infer<typeof profileSchema>
export type Photo = z.infer<typeof photoSchema>
export type Basics = z.infer<typeof basicsSchema>
export type Entry = z.infer<typeof entrySchema>
export type Section = z.infer<typeof sectionSchema>
export type LayoutBlock = z.infer<typeof layoutBlockSchema>
export type CustomLayout = z.infer<typeof customLayoutSchema>
export type StyleConfig = z.infer<typeof styleSchema>
export type Paper = z.infer<typeof paperSchema>
export type DocSettings = z.infer<typeof settingsSchema>
export type ResumeDoc = z.infer<typeof docSchema>
