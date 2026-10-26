import { CheckCircle2, FileDown, Printer, X } from 'lucide-react'
import { Dialog } from 'radix-ui'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { paperDimensions } from '@/cv/theme'
import type { ResumeDoc } from '@/lib/schema'
import { useDocStore } from '@/store/docStore'

const STEPS = [
  'Destination: Save as PDF',
  'Margins: None',
  'Scale: 100% (default)',
  'Background graphics: ON',
  'Headers and footers: OFF',
]

export function ExportDialog({
  open,
  onOpenChange,
  doc,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  doc: ResumeDoc
}) {
  const [printing, setPrinting] = useState(false)
  const updateSettings = useDocStore((state) => state.updateSettings)
  const dims = paperDimensions(doc.settings.paper)
  const paperLabel =
    doc.settings.paper.size === 'Letter'
      ? 'US Letter'
      : doc.settings.paper.size === 'A4'
        ? 'A4'
        : `${dims.widthMm} × ${dims.heightMm} mm`

  const handlePrint = async () => {
    setPrinting(true)
    try {
      // Commit any on-page text before the print snapshot is taken.
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
      await document.fonts.ready.catch(() => undefined)
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      )
      window.print()
    } finally {
      setPrinting(false)
      onOpenChange(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-ink/30 backdrop-blur-[2px] data-[state=open]:animate-fade-in" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-[60] w-[min(520px,94vw)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl border border-line bg-surface shadow-float data-[state=open]:animate-fade-up">
          <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="grid size-7 place-items-center rounded-md bg-accent-soft text-accent">
                  <FileDown size={14} />
                </span>
                <Dialog.Title className="font-display text-[24px] leading-none text-ink">
                  Export a PDF
                </Dialog.Title>
              </div>
              <Dialog.Description className="mt-1.5 text-[12px] leading-relaxed text-muted">
                Your browser prints selectable, ATS-readable text on {paperLabel}, fitted to{' '}
                {doc.settings.pageCount} {doc.settings.pageCount === 1 ? 'page' : 'pages'}.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Close export">
                <X size={15} />
              </Button>
            </Dialog.Close>
          </div>

          <div className="px-5 py-4">
            <label className="flex items-center justify-between gap-3 text-[12px] font-semibold text-ink">
              <span>Fit CV to pages</span>
              <select
                value={doc.settings.pageCount}
                onChange={(event) => {
                  const pageCount = Number(event.target.value)
                  if (pageCount !== 1 && pageCount !== 2 && pageCount !== 3) return
                  updateSettings((draft) => {
                    draft.pageCount = pageCount
                  })
                }}
                aria-label="Fit CV to pages"
                className="h-8 rounded border border-line bg-surface px-2 text-[12px] font-normal text-ink outline-none focus:border-accent"
              >
                <option value={1}>1 page</option>
                <option value={2}>2 pages</option>
                <option value={3}>3 pages</option>
              </select>
            </label>
            <p className="mt-4 text-[12px] font-semibold text-ink">In the print dialog</p>
            <ul className="mt-2 space-y-1.5">
              {STEPS.map((step) => (
                <li key={step} className="flex items-start gap-2 text-[12px] leading-snug text-muted">
                  <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-success" aria-hidden="true" />
                  {step}
                </li>
              ))}
            </ul>
            <p className="mt-3 rounded-md bg-surface-muted px-3 py-2 text-[11.5px] leading-relaxed text-faint">
              Content is scaled to fit the selected page count. Background graphics keeps coloured
              sidebars and header bands.
            </p>
          </div>

          <div className="flex shrink-0 items-center justify-end gap-2 border-t border-line bg-surface-muted/60 px-5 py-3">
            <Dialog.Close asChild>
              <Button variant="ghost" size="sm">
                Cancel
              </Button>
            </Dialog.Close>
            <Button variant="primary" size="sm" onClick={() => void handlePrint()} disabled={printing}>
              <Printer size={13} />
              {printing ? 'Preparing…' : 'Print or save as PDF'}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
