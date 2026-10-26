import { Dialog } from 'radix-ui'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'

export function RenameDialog({
  open,
  initialTitle,
  onOpenChange,
  onSave,
}: {
  open: boolean
  initialTitle: string
  onOpenChange: (open: boolean) => void
  onSave: (title: string) => void
}) {
  const [value, setValue] = useState(initialTitle)

  useEffect(() => {
    if (open) setValue(initialTitle)
  }, [open, initialTitle])

  const trimmed = value.trim()

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] data-[state=open]:animate-fade-in" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[min(420px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-line bg-surface p-5 shadow-float data-[state=open]:animate-fade-up">
          <form
            onSubmit={(event) => {
              event.preventDefault()
              if (!trimmed) return
              onSave(trimmed)
              onOpenChange(false)
            }}
          >
            <Dialog.Title className="text-[17px] font-semibold tracking-[-0.02em] text-ink">
              Rename CV
            </Dialog.Title>
            <Dialog.Description className="mt-1.5 text-[12px] leading-relaxed text-muted">
              This changes the document name only. The CV content and design stay exactly as they
              are.
            </Dialog.Description>

            <label
              htmlFor="rename-cv-title"
              className="mt-4 block text-[11.5px] font-medium text-muted"
            >
              CV name
            </label>
            <Input
              id="rename-cv-title"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              maxLength={120}
              autoFocus
              className="mt-1.5"
            />

            <div className="mt-5 flex justify-end gap-2">
              <Dialog.Close asChild>
                <Button variant="ghost">Cancel</Button>
              </Dialog.Close>
              <Button type="submit" variant="primary" disabled={!trimmed}>
                Save name
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
