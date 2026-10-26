import type { CSSProperties } from 'react'
import { PAGE_WIDTHS } from '@/lib/constants'
import { FONTS } from '@/lib/fonts'
import type { Paper, StyleConfig } from '@/lib/schema'

export type CvVars = CSSProperties & Record<string, string | number>

const MM_PER_INCH = 25.4
const CSS_PX_PER_INCH = 96

export function paperDimensions(paper: Paper): { widthMm: number; heightMm: number } {
  if (paper.size === 'A4') return PAGE_WIDTHS.A4
  if (paper.size === 'Letter') return PAGE_WIDTHS.Letter
  return { widthMm: paper.widthMm, heightMm: paper.heightMm }
}

export function mmToPx(mm: number): number {
  return (mm / MM_PER_INCH) * CSS_PX_PER_INCH
}

export function fitScaleForPages(
  contentHeightPx: number,
  pageHeightPx: number,
  pageCount: number,
): number {
  if (
    ![contentHeightPx, pageHeightPx, pageCount].every(Number.isFinite) ||
    contentHeightPx <= 0 ||
    pageHeightPx <= 0 ||
    pageCount <= 0
  ) {
    return 1
  }
  return Math.min(1, (pageHeightPx * pageCount) / contentHeightPx)
}

export function cvStyleVars(style: StyleConfig): CvVars {
  const { typography, colors, header, section, entry, page } = style
  return {
    '--cv-body-font': FONTS[typography.bodyFont].family,
    '--cv-heading-font': FONTS[typography.headingFont].family,
    '--cv-name-font': FONTS[typography.nameFont].family,
    '--cv-body-size': `${typography.bodySizePt}pt`,
    '--cv-line-height': String(typography.lineHeight),
    '--cv-name-size': `${typography.nameSizePt}pt`,
    '--cv-heading-size': `${typography.headingSizePt}pt`,
    '--cv-heading-weight': String(typography.headingWeight),
    '--cv-heading-tracking': `${typography.headingTracking}em`,
    '--cv-body-tracking': `${typography.bodyTracking}em`,
    '--cv-accent': colors.accent,
    '--cv-text': colors.text,
    '--cv-muted': colors.muted,
    '--cv-heading': colors.heading,
    '--cv-link': colors.link,
    '--cv-rule': colors.rule,
    '--cv-page-bg': colors.pageBg,
    '--cv-sidebar-bg': colors.sidebarBg,
    '--cv-sidebar-text': colors.sidebarText,
    '--cv-header-bg': colors.headerBg,
    '--cv-header-text': colors.headerText,
    '--cv-photo-size': `${header.photoSizeMm}mm`,
    '--cv-sidebar-width': `${style.sidebarWidthPct}%`,
    '--cv-section-spacing': String(section.spacing),
    '--cv-bullet-indent': `${entry.bulletIndentMm}mm`,
    '--cv-margin-top': `${page.marginTopMm}mm`,
    '--cv-margin-right': `${page.marginRightMm}mm`,
    '--cv-margin-bottom': `${page.marginBottomMm}mm`,
    '--cv-margin-left': `${page.marginLeftMm}mm`,
  }
}

export function sanitizeCustomCss(css: string): string {
  return css
    .replace(/<\/style/gi, '<\\/style')
    .replace(/@import[\s\S]*?;/gi, '')
    .replace(/url\(\s*(['"]?)\s*javascript:[^)]*\)/gi, 'none')
    .replace(/expression\s*\(/gi, 'none(')
    .trim()
}

export function scopedCustomCss(css: string): string {
  const clean = sanitizeCustomCss(css)
  if (!clean) return ''
  return `@scope (.cv-root) {\n${clean}\n}`
}
