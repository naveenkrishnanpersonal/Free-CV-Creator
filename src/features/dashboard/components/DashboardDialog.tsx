import { X } from 'lucide-react'
import { Dialog } from 'radix-ui'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/Button'

export function DashboardDialog({
  open,
  onOpenChange,
  title,
  description,
  width = '1100px',
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  width?: string
  children: ReactNode
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/65 backdrop-blur-[2px] data-[state=open]:animate-fade-in" />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 z-50 flex max-h-[min(880px,90vh)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-float data-[state=open]:animate-fade-up"
          style={{ width: `min(${width}, calc(100vw - 32px))` }}
        >
          <div className="flex shrink-0 items-start justify-between gap-4 border-b border-line px-5 py-4">
            <div className="min-w-0">
              <Dialog.Title className="text-[17px] font-semibold tracking-[-0.02em] text-ink">
                {title}
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-[12px] leading-relaxed text-muted">
                {description}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" aria-label={`Close ${title.toLowerCase()}`}>
                <X size={16} />
              </Button>
            </Dialog.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
