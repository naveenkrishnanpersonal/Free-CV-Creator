import {
  AlertTriangle,
  ArrowLeft,
  CircleCheck,
  Copy,
  Ellipsis,
  FileDown,
  FileJson,
  Loader2,
  Palette,
  PanelRight,
  Redo2,
  SlidersHorizontal,
  Trash2,
  Undo2,
  X,
} from 'lucide-react'
import { Dialog } from 'radix-ui'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Logo } from '@/components/ui/Logo'
import { Menu, MenuItem, MenuSeparator } from '@/components/ui/Menu'
import { duplicateDoc } from '@/data/defaults'
import { StyleGallery } from '@/features/design/StyleGallery'
import { StyleLab } from '@/features/design/StyleLab'
import { ExportDialog } from '@/features/export/ExportDialog'
import { PrintLayer } from '@/features/export/PrintLayer'
import { PreviewPane } from '@/features/preview/PreviewPane'
import { deleteDoc, exportDocFile, loadDoc, saveDoc } from '@/lib/storage'
import { useDocStore } from '@/store/docStore'
import { BasicsForm } from './BasicsForm'
import { SectionEditor } from './SectionEditor'
import { SectionsRail } from './SectionsRail'
import { SummaryForm } from './SummaryForm'
import { useAutosave, type SaveStatus } from './useAutosave'

function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === 'saving') {
    return (
      <span
        className="flex items-center gap-1.5 text-[11px] text-muted"
        title="Saving changes"
        aria-live="polite"
      >
        <Loader2 size={13} className="animate-spin" />
        <span className="hidden sm:inline">Saving</span>
      </span>
    )
  }
  if (status === 'saved') {
    return (
      <span
        className="flex items-center gap-1.5 text-[11px] text-success"
        title="All changes saved on this device"
        aria-live="polite"
      >
        <CircleCheck size={13} />
        <span className="hidden sm:inline">Saved</span>
      </span>
    )
  }
  if (status === 'error') {
    return (
      <span className="flex items-center gap-1.5 text-[11px] text-danger" title="Could not save">
        <AlertTriangle size={13} />
        <span className="hidden sm:inline">Not saved</span>
      </span>
    )
  }
  return null
}

type EditorIntent = {
  openDesign?: boolean
  openStyles?: boolean
  openExport?: boolean
}

export function EditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const intent = (location.state ?? null) as EditorIntent | null
  const doc = useDocStore((state) => state.doc)
  const setDoc = useDocStore((state) => state.setDoc)
  const update = useDocStore((state) => state.update)
  const undo = useDocStore((state) => state.undo)
  const redo = useDocStore((state) => state.redo)
  const canUndo = useDocStore((state) => state.past.length > 0)
  const canRedo = useDocStore((state) => state.future.length > 0)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [error, setError] = useState('')
  const [selected, setSelected] = useState('header')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [mobilePreview, setMobilePreview] = useState(false)
  const [styleGallery, setStyleGallery] = useState(Boolean(intent?.openStyles))
  const [styleLab, setStyleLab] = useState(Boolean(intent?.openDesign))
  const [exportOpen, setExportOpen] = useState(Boolean(intent?.openExport))
  const [deleting, setDeleting] = useState(false)
  const autosave = useAutosave(doc, !deleting)

  // The intent only applies to the navigation that opened the editor. Clear it
  // so a later refresh does not reopen a dialog the user already closed.
  useEffect(() => {
    if (!intent) return
    navigate(location.pathname, { replace: true, state: null })
  }, [intent, location.pathname, navigate])

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setStatus('loading')
    setDoc(null)
    loadDoc(id)
      .then((loaded) => {
        if (cancelled) return
        setDoc(loaded)
        setSelected('header')
        setStatus('ready')
      })
      .catch((loadError: unknown) => {
        if (cancelled) return
        setDoc(null)
        setError(loadError instanceof Error ? loadError.message : 'Could not open this CV.')
        setStatus('error')
      })
    return () => {
      cancelled = true
      setDoc(null)
    }
  }, [id, setDoc])

  useEffect(() => {
    if (!doc) return
    if (selected !== 'header' && !doc.sections.some((section) => section.id === selected)) {
      setSelected('header')
    }
  }, [doc, selected])

  const titleKey = doc ? `${doc.basics.name}|${doc.title}` : ''
  useEffect(() => {
    if (!doc) return
    document.title = `${doc.basics.name.trim() || doc.title.trim() || 'Untitled CV'} — CV Studio`
    return () => {
      document.title = 'CV Studio'
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [titleKey])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const mod = event.metaKey || event.ctrlKey
      if (!mod) return
      const key = event.key.toLowerCase()
      const target = event.target
      const editingText =
        target instanceof HTMLElement &&
        Boolean(target.closest('input, textarea, select, [contenteditable="true"]'))
      if ((key === 'z' || key === 'y') && editingText) return
      if (key === 'z') {
        event.preventDefault()
        if (event.shiftKey) redo()
        else undo()
      } else if (key === 'y') {
        event.preventDefault()
        redo()
      } else if (key === 's') {
        event.preventDefault()
        if (!doc) return
        void saveDoc(doc)
          .then(() => toast.success('Saved to this device.'))
          .catch((saveError: unknown) =>
            toast.error(saveError instanceof Error ? saveError.message : 'Could not save.'),
          )
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [doc, redo, undo])

  const section = doc?.sections.find((item) => item.id === selected)

  if (deleting) {
    return (
      <div className="grid h-dvh place-items-center bg-canvas">
        <span className="flex items-center gap-2 text-[12px] text-muted">
          <Loader2 size={14} className="animate-spin" /> Deleting CV…
        </span>
      </div>
    )
  }

  if (status === 'loading') {
    return (
      <div className="grid h-dvh place-items-center bg-canvas">
        <div className="flex flex-col items-center gap-4">
          <Logo />
          <span className="flex items-center gap-2 text-[12px] text-muted">
            <Loader2 size={14} className="animate-spin" /> Opening your CV…
          </span>
        </div>
      </div>
    )
  }

  if (status === 'error' || !doc) {
    return (
      <div className="grid h-dvh place-items-center bg-canvas px-5">
        <div className="w-full max-w-[420px] rounded-xl border border-line bg-surface p-6 shadow-card">
          <div className="grid size-10 place-items-center rounded-full bg-danger-soft text-danger">
            <AlertTriangle size={18} />
          </div>
          <h1 className="mt-4 font-display text-[24px] text-ink">This CV could not be opened</h1>
          <p className="mt-2 text-[13px] leading-relaxed text-muted">
            {error || 'The document is missing or damaged.'}
          </p>
          <Button variant="primary" className="mt-5" onClick={() => navigate('/')}>
            Back to library
          </Button>
        </div>
      </div>
    )
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteDoc(doc.id)
      toast.success('CV deleted.')
      navigate('/')
    } catch (deleteError) {
      setDeleting(false)
      toast.error(deleteError instanceof Error ? deleteError.message : 'Could not delete this CV.')
    }
  }

  const handleBack = async () => {
    try {
      await saveDoc(doc)
    } catch (saveError) {
      toast.error(saveError instanceof Error ? saveError.message : 'Could not save before leaving.')
    }
    navigate('/')
  }

  const handleDuplicate = async () => {
    const copy = duplicateDoc(doc)
    try {
      await saveDoc(copy)
      toast.success('CV duplicated.')
      navigate(`/cv/${copy.id}`)
    } catch (duplicateError) {
      toast.error(
        duplicateError instanceof Error ? duplicateError.message : 'Could not duplicate this CV.',
      )
    }
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-canvas">
      <header className="flex h-14 shrink-0 items-center gap-1.5 border-b border-line bg-surface px-2 md:gap-2 md:px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => void handleBack()}
          aria-label="Back to library"
          title="Back to library"
        >
          <ArrowLeft size={16} />
        </Button>

        <div className="min-w-0 flex-1">
          <input
            value={doc.title}
            onChange={(event) =>
              update((draft) => {
                draft.title = event.target.value
              }, 'doc-title')
            }
            onBlur={() => {
              if (!doc.title.trim()) {
                update((draft) => {
                  draft.title = 'Untitled CV'
                })
              }
            }}
            placeholder="Untitled CV"
            aria-label="CV name"
            className="w-full max-w-[340px] truncate rounded-sm bg-transparent py-1 text-[13px] font-medium text-ink outline-none placeholder:text-faint focus:bg-surface-muted focus:px-1.5"
          />
        </div>

        <div className="flex items-center gap-2 pr-1">
          <SaveIndicator status={autosave.status} />
          <span className="hidden h-4 w-px bg-line sm:block" />
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={undo}
            disabled={!canUndo}
            aria-label="Undo"
            title="Undo (Ctrl/Cmd+Z)"
          >
            <Undo2 size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={redo}
            disabled={!canRedo}
            aria-label="Redo"
            title="Redo (Ctrl/Cmd+Shift+Z)"
          >
            <Redo2 size={14} />
          </Button>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => setExportOpen(true)}
          aria-label="Export PDF"
          title="Print or save as PDF"
          className="gap-1.5"
        >
          <FileDown size={14} />
          <span className="hidden sm:inline">PDF</span>
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => setStyleGallery(true)}
          aria-label="Change style"
          title="Browse styles"
          className="gap-1.5"
        >
          <Palette size={14} />
          <span className="hidden sm:inline">Styles</span>
        </Button>

        <Button
          variant="secondary"
          size="icon"
          onClick={() => setStyleLab(true)}
          aria-label="Customise design"
          title="Customise fonts, colours and spacing"
        >
          <SlidersHorizontal size={15} />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="xl:hidden"
          onClick={() => setMobilePreview(true)}
          aria-label="Open preview"
          title="Preview"
        >
          <PanelRight size={16} />
        </Button>

        <Menu
          trigger={
            <Button variant="secondary" size="icon" aria-label="CV actions">
              <Ellipsis size={16} />
            </Button>
          }
        >
          <MenuItem icon={<Palette size={14} />} onSelect={() => setStyleGallery(true)}>
            Change style
          </MenuItem>
          <MenuItem icon={<SlidersHorizontal size={14} />} onSelect={() => setStyleLab(true)}>
            Customise design
          </MenuItem>
          <MenuItem icon={<Copy size={14} />} onSelect={() => void handleDuplicate()}>
            Duplicate CV
          </MenuItem>
          <MenuItem icon={<FileDown size={14} />} onSelect={() => setExportOpen(true)}>
            Export PDF
          </MenuItem>
          <MenuItem
            icon={<FileJson size={14} />}
            onSelect={() => {
              exportDocFile(doc)
              toast.success('CV exported.')
            }}
          >
            Export JSON
          </MenuItem>
          <MenuSeparator />
          <MenuItem danger icon={<Trash2 size={14} />} onSelect={() => setConfirmDelete(true)}>
            Delete CV
          </MenuItem>
        </Menu>
      </header>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <SectionsRail selected={selected} onSelect={setSelected} />

        <main className="min-h-0 flex-1 overflow-y-auto bg-canvas">
          <div className="mx-auto w-full max-w-[620px] px-4 py-6 md:px-7 md:py-8">
            {selected === 'header' && <BasicsForm />}
            {section?.kind === 'summary' && <SummaryForm section={section} />}
            {section && section.kind !== 'summary' && (
              <SectionEditor section={section} onDeleted={() => setSelected('header')} />
            )}
          </div>
        </main>

        <PreviewPane
          doc={doc}
          onSelectSection={setSelected}
          className="hidden xl:flex xl:w-[45%] xl:min-w-[360px]"
        />
      </div>

      <StyleGallery open={styleGallery} onOpenChange={setStyleGallery} doc={doc} />

      <StyleLab open={styleLab} onOpenChange={setStyleLab} doc={doc} />

      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} doc={doc} />

      {exportOpen && <PrintLayer doc={doc} />}

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={`Delete “${doc.title || 'Untitled CV'}”?`}
        description="This removes the CV from this browser, including its content and style. Export a backup first if you might need it."
        confirmLabel="Delete CV"
        onConfirm={() => void handleDelete()}
      />

      <Dialog.Root open={mobilePreview} onOpenChange={setMobilePreview}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/30 backdrop-blur-[2px] xl:hidden" />
          <Dialog.Content className="fixed inset-0 z-50 flex flex-col bg-canvas xl:hidden">
            <div className="flex h-12 shrink-0 items-center justify-between border-b border-line bg-surface px-3">
              <Dialog.Title className="text-[12px] font-semibold tracking-[0.06em] text-muted uppercase">
                Preview
              </Dialog.Title>
              <Dialog.Description className="sr-only">
                A scaled preview of your CV.
              </Dialog.Description>
              <Dialog.Close asChild>
                <Button variant="ghost" size="icon-sm" aria-label="Close preview">
                  <X size={15} />
                </Button>
              </Dialog.Close>
            </div>
            <PreviewPane
              doc={doc}
              onSelectSection={(sectionId) => {
                setSelected(sectionId)
                setMobilePreview(false)
              }}
              className="flex-1"
            />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

    </div>
  )
}
