import { ImagePlus, Loader2, RotateCcw, Trash2 } from 'lucide-react'
import { useId, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Toggle } from '@/components/ui/Toggle'
import { photoFromFile } from '@/lib/image'
import { cn } from '@/lib/cn'
import type { Photo } from '@/lib/schema'
import { useDocStore } from '@/store/docStore'

function RangeControl({
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  display: string
  onChange: (value: number) => void
}) {
  const id = useId()
  return (
    <div className="min-w-0">
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-[11px] text-muted">
          {label}
        </label>
        <span className="text-[10.5px] text-faint tabular">{display}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-6 w-full cursor-pointer accent-[var(--accent)]"
      />
    </div>
  )
}

export function PhotoField() {
  const photo = useDocStore((state) => state.doc?.basics.photo)
  const showPhoto = useDocStore((state) => state.doc?.style.header.showPhoto ?? false)
  const setPhoto = useDocStore((state) => state.setPhoto)
  const updateStyle = useDocStore((state) => state.updateStyle)
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    setBusy(true)
    try {
      const nextPhoto: Photo = await photoFromFile(file)
      setPhoto(nextPhoto)
      updateStyle((draft) => {
        draft.header.showPhoto = true
      })
      toast.success('Photo added to your CV.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not use that image.')
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="rounded-lg border border-line bg-surface p-3">
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'grid size-[68px] shrink-0 place-items-center overflow-hidden border border-line bg-surface-muted',
            photo?.shape === 'circle' ? 'rounded-full' : 'rounded-lg',
          )}
        >
          {photo?.dataUrl ? (
            <img
              src={photo.dataUrl}
              alt="Profile photo"
              className="h-full w-full object-cover"
              style={{
                objectPosition: `${photo.x}% ${photo.y}%`,
                transform: `scale(${photo.zoom})`,
                filter: photo.grayscale ? 'grayscale(1)' : undefined,
              }}
            />
          ) : (
            <ImagePlus size={19} className="text-faint" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
            >
              {busy ? <Loader2 size={13} className="animate-spin" /> : <ImagePlus size={13} />}
              {photo?.dataUrl ? 'Change photo' : 'Add photo'}
            </Button>
            {photo?.dataUrl && (
              <Button variant="ghost" size="sm" onClick={() => setPhoto(null)}>
                <Trash2 size={13} /> Remove
              </Button>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(event) => void handleFile(event.target.files?.[0])}
            />
          </div>
          <p className="mt-1.5 text-[11px] leading-snug text-faint">
            Optional. Some markets and applicant systems prefer no photo.
          </p>
        </div>
      </div>

      {photo?.dataUrl && (
        <div className="mt-3 flex flex-wrap items-center gap-4 border-t border-line pt-3">
          <div className="flex items-center gap-1.5">
            <span className="mr-1 text-[11px] text-muted">Shape</span>
            <Button
              variant={photo.shape === 'circle' ? 'soft' : 'ghost'}
              size="sm"
              onClick={() => setPhoto({ ...photo, shape: 'circle' })}
              aria-pressed={photo.shape === 'circle'}
            >
              Circle
            </Button>
            <Button
              variant={photo.shape === 'square' ? 'soft' : 'ghost'}
              size="sm"
              onClick={() => setPhoto({ ...photo, shape: 'square' })}
              aria-pressed={photo.shape === 'square'}
            >
              Square
            </Button>
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-[11.5px] text-muted">
            <Toggle
              checked={photo.grayscale}
              onChange={(checked) => setPhoto({ ...photo, grayscale: checked })}
              label="Grayscale photo"
            />
            Grayscale
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-[11.5px] text-muted">
            <Toggle
              checked={showPhoto}
              onChange={(checked) =>
                updateStyle((draft) => {
                  draft.header.showPhoto = checked
                })
              }
              label="Show photo on CV"
            />
            {showPhoto ? 'Shown on CV' : 'Hidden on CV'}
          </label>
        </div>
      )}

      {photo?.dataUrl && (
        <div className="mt-3 border-t border-line pt-3">
          <div className="mb-2 flex items-baseline justify-between gap-2">
            <span className="text-[11px] font-medium text-ink">Crop and position</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPhoto({ ...photo, zoom: 1, x: 50, y: 50 })}
              aria-label="Reset photo crop"
            >
              <RotateCcw size={12} /> Reset
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <RangeControl
              label="Zoom"
              value={photo.zoom}
              min={1}
              max={3}
              step={0.05}
              display={`${Math.round(photo.zoom * 100)}%`}
              onChange={(zoom) => setPhoto({ ...photo, zoom }, 'zoom')}
            />
            <RangeControl
              label="Horizontal"
              value={photo.x}
              min={0}
              max={100}
              step={1}
              display={`${Math.round(photo.x)}%`}
              onChange={(x) => setPhoto({ ...photo, x }, 'x')}
            />
            <RangeControl
              label="Vertical"
              value={photo.y}
              min={0}
              max={100}
              step={1}
              display={`${Math.round(photo.y)}%`}
              onChange={(y) => setPhoto({ ...photo, y }, 'y')}
            />
          </div>
          <p className="mt-1.5 text-[11px] leading-snug text-faint">
            Zoom in, then slide horizontally and vertically to frame your face inside the crop.
          </p>
        </div>
      )}
    </div>
  )
}
