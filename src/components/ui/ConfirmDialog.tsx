import { Dialog } from 'radix-ui'
import { Button } from './Button'

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  tone = 'danger',
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  tone?: 'danger' | 'default'
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/25 backdrop-blur-[2px] data-[state=open]:animate-fade-in" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[min(430px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-line bg-surface p-5 shadow-float data-[state=open]:animate-fade-up">
          <Dialog.Title className="font-display text-[21px] leading-tight text-ink">
            {title}
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-[13px] leading-relaxed text-muted">
            {description}
          </Dialog.Description>
          <div className="mt-5 flex justify-end gap-2">
            <Dialog.Close asChild>
              <Button variant="ghost">{cancelLabel}</Button>
            </Dialog.Close>
            <Button
              variant={tone === 'danger' ? 'danger' : 'primary'}
              onClick={() => {
                onConfirm()
                onOpenChange(false)
              }}
              autoFocus
            >
              {confirmLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
