import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CvDocument } from '@/cv/CvDocument'
import { fitScaleForPages, mmToPx, paperDimensions } from '@/cv/theme'
import type { ResumeDoc } from '@/lib/schema'

/**
 * A second render of the CV that only exists for printing.
 * It lives outside #root so the print stylesheet can hide the whole editor
 * and print exactly one clean document.
 */
export function PrintLayer({ doc }: { doc: ResumeDoc }) {
  const dims = paperDimensions(doc.settings.paper)
  const layerRef = useRef<HTMLDivElement>(null)
  const [fitScale, setFitScale] = useState(1)
  const pageHeightPx = mmToPx(dims.heightMm)

  useEffect(() => {
    const root = layerRef.current?.querySelector<HTMLElement>('.cv-root')
    if (!root) return
    let active = true

    const measure = () => {
      if (!active) return
      const height = root.getBoundingClientRect().height / fitScale
      const nextFitScale = fitScaleForPages(height, pageHeightPx, doc.settings.pageCount)
      if (Math.abs(nextFitScale - fitScale) > 0.001) setFitScale(nextFitScale)
    }

    const observer = new ResizeObserver(measure)
    observer.observe(root)
    measure()
    void document.fonts.ready.then(measure)
    return () => {
      active = false
      observer.disconnect()
    }
  }, [doc, doc.settings.pageCount, fitScale, pageHeightPx])

  if (typeof document === 'undefined') return null

  return createPortal(
    <div className="print-layer" ref={layerRef}>
      <style>{`@page { size: ${dims.widthMm}mm ${dims.heightMm}mm; margin: 0; }`}</style>
      <CvDocument doc={doc} fitScale={fitScale} />
    </div>,
    document.body,
  )
}
