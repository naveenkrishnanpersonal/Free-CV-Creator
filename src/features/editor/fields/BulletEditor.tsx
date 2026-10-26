import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Field'
import type { Entry, Section } from '@/lib/schema'
import { useDocStore } from '@/store/docStore'

export function BulletEditor({ entry, section }: { entry: Entry; section: Section }) {
  const updateEntry = useDocStore((state) => state.updateEntry)

  const updateBullet = (index: number, value: string) => {
    updateEntry(
      section.id,
      entry.id,
      (draft) => {
        draft.bullets[index] = value
      },
      `bullet-${index}`,
    )
  }

  const addBullet = () => {
    updateEntry(section.id, entry.id, (draft) => {
      draft.bullets.push('')
    })
  }

  const removeBullet = (index: number) => {
    updateEntry(section.id, entry.id, (draft) => {
      draft.bullets.splice(index, 1)
    })
  }

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="text-[11.5px] font-medium text-muted">Highlights</span>
        <span className="text-[10.5px] text-faint">**bold** and *italic* supported</span>
      </div>
      <div className="space-y-1.5">
        {entry.bullets.map((bullet, index) => (
          <div className="flex items-start gap-1.5" key={index}>
            <span className="mt-2.5 w-2 shrink-0 text-center text-[12px] text-faint">—</span>
            <Textarea
              rows={2}
              value={bullet}
              onChange={(event) => updateBullet(index, event.target.value)}
              placeholder="Start with a verb, end with the result…"
              className="min-h-9 resize-y py-1.5 text-[12.5px]"
              aria-label={`Highlight ${index + 1}`}
            />
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => removeBullet(index)}
              aria-label={`Remove highlight ${index + 1}`}
              className="mt-1"
            >
              <X size={13} />
            </Button>
          </div>
        ))}
      </div>
      <Button variant="ghost" size="sm" onClick={addBullet} className="mt-1.5 -ml-1.5 text-muted">
        <Plus size={13} /> Add highlight
      </Button>
    </div>
  )
}
