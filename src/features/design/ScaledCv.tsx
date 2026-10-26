import { useEffect, useRef, useState } from 'react'
import { CvDocument } from '@/cv/CvDocument'
import { mmToPx, paperDimensions } from '@/cv/theme'
import type { ResumeDoc } from '@/lib/schema'

/**
 * A real CV renderer scaled down to whatever width its container has.
 * Used by the style gallery cards and the Style Lab preview.
 */
export function ScaledCv({ doc, inert = true }: { doc: ResumeDoc; inert?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    const observer = new ResizeObserver((entries) => {
      setWidth(entries[0]?.contentRect.width ?? 0)
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const pageWidth = mmToPx(paperDimensions(doc.settings.paper).widthMm)
  const scale = width > 0 ? width / pageWidth : 0

  return (
    <div
      ref={ref}
      className="relative aspect-[210/297] overflow-hidden bg-paper ring-1 ring-inset ring-black/[0.04]"
    >
      {scale > 0 && (
        <div
          className="pointer-events-none origin-top-left"
          style={{ width: pageWidth, transform: `scale(${scale})` }}
          aria-hidden={inert ? 'true' : undefined}
          inert={inert}
        >
          <CvDocument doc={doc} />
        </div>
      )}
    </div>
  )
}
