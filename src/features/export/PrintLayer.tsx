import { createPortal } from 'react-dom'
import { CvDocument } from '@/cv/CvDocument'
import { paperDimensions } from '@/cv/theme'
import type { ResumeDoc } from '@/lib/schema'

/**
 * A second, unscaled render of the CV that only exists for printing.
 * It lives outside #root so the print stylesheet can hide the whole editor
 * and print exactly one clean document.
 */
export function PrintLayer({ doc }: { doc: ResumeDoc }) {
  const dims = paperDimensions(doc.settings.paper)
  if (typeof document === 'undefined') return null

  return createPortal(
    <div className="print-layer">
      <style>{`@page { size: ${dims.widthMm}mm ${dims.heightMm}mm; margin: 0; }`}</style>
      <CvDocument doc={doc} />
    </div>,
    document.body,
  )
}
