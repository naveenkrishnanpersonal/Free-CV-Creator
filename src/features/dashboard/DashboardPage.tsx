import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { createBlankDoc, duplicateDoc } from '@/data/defaults'
import { createExampleDoc } from '@/data/example'
import type { StylePreset } from '@/data/stylePresets'
import {
  deleteDoc,
  exportBackup,
  importAnyFile,
  listDocs,
  loadDoc,
  renameDoc,
  saveDoc,
  type DocSummary,
} from '@/lib/storage'
import { DashboardDialog } from './components/DashboardDialog'
import { DashboardHeader } from './components/DashboardHeader'
import {
  DashboardSidebar,
  MobileSidebar,
  type DashboardSection,
} from './components/DashboardSidebar'
import { HeroSection } from './components/HeroSection'
import { QuickActions } from './components/QuickActions'
import { RecentCvs } from './components/RecentCvs'
import { RenameDialog } from './components/RenameDialog'
import { SettingsSection } from './components/SettingsSection'
import { TemplatesSection } from './components/TemplatesSection'

const SECTION_IDS: DashboardSection[] = ['home', 'recent']

type EditorIntent = { openDesign?: boolean; openStyles?: boolean; openExport?: boolean }

export function DashboardPage() {
  const navigate = useNavigate()
  const [docs, setDocs] = useState<DocSummary[] | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [navOpen, setNavOpen] = useState(false)
  const [templatesOpen, setTemplatesOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<DashboardSection>('home')
  const [deleteTarget, setDeleteTarget] = useState<DocSummary | null>(null)
  const [renameTarget, setRenameTarget] = useState<DocSummary | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const importModeRef = useRef<'import' | 'restore'>('import')

  const refresh = useCallback(async () => {
    try {
      const items = await listDocs()
      setDocs(items)
      setError('')
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not read your library.')
      setDocs([])
    }
  }, [])

  useEffect(() => {
    document.title = 'CV Studio — Free local-first CV builder'
    void refresh()
  }, [refresh])

  useEffect(() => {
    let frame = 0
    const scroller = document.getElementById('dashboard-main')
    const update = () => {
      frame = 0
      const scrollTop = scroller?.scrollTop ?? window.scrollY
      const scrollerTop = scroller?.getBoundingClientRect().top ?? 0
      const probe = scrollTop + 96
      let current: DashboardSection = 'home'
      for (const section of SECTION_IDS) {
        const element = document.getElementById(section)
        if (!element) continue
        const top = element.getBoundingClientRect().top - scrollerTop + scrollTop
        if (top <= probe) current = section
      }
      setActiveSection(current)
    }
    const onScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(update)
    }
    update()
    const target: HTMLElement | Window = scroller ?? window
    target.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      target.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  const goTo = (section: DashboardSection) => {
    if (section === 'templates') {
      setTemplatesOpen(true)
      return
    }
    if (section === 'settings') {
      setSettingsOpen(true)
      return
    }
    setActiveSection(section)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    document.getElementById(section)?.scrollIntoView({
      behavior: reduced ? 'auto' : 'smooth',
      block: 'start',
    })
  }

  const openNew = async (kind: 'blank' | 'example') => {
    if (busy) return
    setBusy(true)
    try {
      const doc = kind === 'blank' ? createBlankDoc() : createExampleDoc()
      await saveDoc(doc)
      navigate(`/cv/${doc.id}`)
    } catch (createError) {
      toast.error(createError instanceof Error ? createError.message : 'Could not create a CV.', {
        description: 'Your browser storage may be full. Export a backup before freeing space.',
      })
      setBusy(false)
    }
  }

  const createFromTemplate = async (preset: StylePreset) => {
    if (busy) return
    setBusy(true)
    try {
      const doc = createBlankDoc()
      doc.style = structuredClone(preset.style)
      await saveDoc(doc)
      navigate(`/cv/${doc.id}`)
    } catch (createError) {
      toast.error(createError instanceof Error ? createError.message : 'Could not create a CV.', {
        description: 'Your browser storage may be full. Export a backup before freeing space.',
      })
      setBusy(false)
    }
  }

  const openEditorIntent = async (intent: EditorIntent) => {
    if (busy) return
    const recent = docs?.[0]
    if (recent) {
      navigate(`/cv/${recent.id}`, { state: intent })
      return
    }
    setBusy(true)
    try {
      const doc = createBlankDoc()
      await saveDoc(doc)
      navigate(`/cv/${doc.id}`, { state: intent })
    } catch (createError) {
      toast.error(createError instanceof Error ? createError.message : 'Could not open the editor.', {
        description: 'Your browser storage may be full. Export a backup before freeing space.',
      })
      setBusy(false)
    }
  }

  const pickFile = (mode: 'import' | 'restore') => {
    importModeRef.current = mode
    fileRef.current?.click()
  }

  const handleFile = async (file: File | undefined, mode: 'import' | 'restore') => {
    if (!file) return
    setBusy(true)
    let targetId: string | null = null
    try {
      const result = await importAnyFile(file)
      for (const doc of result.docs) {
        await saveDoc(doc)
      }
      await refresh()

      if (mode === 'import' && result.mode === 'single') {
        targetId = result.docs[0]?.id ?? null
        toast.success('CV imported.')
      } else {
        const count = result.docs.length
        const noun = count === 1 ? 'CV' : 'CVs'
        toast.success(
          mode === 'restore' ? `${count} ${noun} restored.` : `${count} ${noun} imported.`,
          result.skipped > 0
            ? { description: `${result.skipped} unreadable item${result.skipped === 1 ? '' : 's'} were skipped.` }
            : undefined,
        )
      }
    } catch (importError) {
      toast.error(
        importError instanceof Error ? importError.message : 'Could not import that file.',
        {
          description:
            'Supported: CV Studio .cv.json exports and CV Studio backup files up to 25 MB.',
        },
      )
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ''
    }
    if (targetId) navigate(`/cv/${targetId}`)
  }

  const handleDuplicate = async (summary: DocSummary) => {
    try {
      const source = await loadDoc(summary.id)
      const copy = duplicateDoc(source)
      await saveDoc(copy)
      await refresh()
      toast.success('CV duplicated.')
    } catch (duplicateError) {
      toast.error(
        duplicateError instanceof Error ? duplicateError.message : 'Could not duplicate this CV.',
      )
    }
  }

  const handleRename = async (title: string) => {
    if (!renameTarget) return
    try {
      await renameDoc(renameTarget.id, title)
      await refresh()
      toast.success('CV renamed.')
    } catch (renameError) {
      toast.error(renameError instanceof Error ? renameError.message : 'Could not rename this CV.')
    }
  }

  const handleExportPdf = (summary: DocSummary) => {
    navigate(`/cv/${summary.id}`, { state: { openExport: true } satisfies EditorIntent })
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteDoc(deleteTarget.id)
      await refresh()
      toast.success('CV deleted.')
    } catch (deleteError) {
      toast.error(deleteError instanceof Error ? deleteError.message : 'Could not delete this CV.')
    }
  }

  const handleExportBackup = async () => {
    if (!docs || docs.length === 0) {
      toast.info('Create a CV first, then you can export a backup.')
      return
    }
    if (busy) return
    setBusy(true)
    try {
      const { count, skipped } = await exportBackup()
      toast.success(`Backup saved with ${count} CV${count === 1 ? '' : 's'}.`, {
        description:
          skipped > 0
            ? `${skipped} unreadable CV${skipped === 1 ? '' : 's'} could not be included.`
            : 'Keep the file somewhere safe. You can restore it from this dashboard.',
      })
    } catch (backupError) {
      toast.error(
        backupError instanceof Error ? backupError.message : 'Could not export a backup.',
      )
    } finally {
      setBusy(false)
    }
  }

  const canExportBackup = Boolean(docs && docs.length > 0)

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-canvas">
      <button
        type="button"
        onClick={() => document.getElementById('dashboard-main')?.focus()}
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[70] focus:rounded-lg focus:bg-accent-solid focus:px-3 focus:py-2 focus:text-[12px] focus:font-medium focus:text-accent-ink focus:shadow-float"
      >
        Skip to content
      </button>

      <DashboardHeader
        busy={busy}
        onOpenNav={() => setNavOpen(true)}
        onNew={() => void openNew('blank')}
        onExample={() => void openNew('example')}
        onImport={() => pickFile('import')}
        onSettings={() => goTo('settings')}
      />

      <div className="flex min-h-0 w-full flex-1">
        <DashboardSidebar
          docsCount={docs?.length ?? null}
          active={activeSection}
          busy={busy}
          canExportBackup={canExportBackup}
          onNavigate={goTo}
          onImport={() => pickFile('import')}
          onExportBackup={() => void handleExportBackup()}
          onRestoreBackup={() => pickFile('restore')}
        />

        <main
          id="dashboard-main"
          tabIndex={-1}
          aria-label="CV workspace"
          className="min-w-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 pb-6 short:py-3 sm:px-6 lg:px-8 lg:py-6"
        >
          <div className="flex w-full max-w-[1600px] flex-col gap-5 short:gap-4 sm:gap-6">
            <HeroSection
              busy={busy}
              onCreate={() => void openNew('blank')}
              onBrowseTemplates={() => goTo('templates')}
            />

            <QuickActions
              busy={busy}
              canExportBackup={canExportBackup}
              onCreate={() => void openNew('blank')}
              onBrowseTemplates={() => goTo('templates')}
              onImport={() => pickFile('import')}
              onExportBackup={() => void handleExportBackup()}
              onCustomize={() => void openEditorIntent({ openDesign: true })}
            />

            <RecentCvs
              docs={docs}
              error={error}
              busy={busy}
              onRetry={() => void refresh()}
              onOpen={(summary) => navigate(`/cv/${summary.id}`)}
              onRename={setRenameTarget}
              onDuplicate={(summary) => void handleDuplicate(summary)}
              onExportPdf={handleExportPdf}
              onDelete={setDeleteTarget}
              onCreate={() => void openNew('blank')}
              onExample={() => void openNew('example')}
              onImport={() => pickFile('import')}
            />

          </div>
        </main>
      </div>

      <MobileSidebar
        open={navOpen}
        onOpenChange={setNavOpen}
        docsCount={docs?.length ?? null}
        active={activeSection}
        busy={busy}
        canExportBackup={canExportBackup}
        onNavigate={goTo}
        onImport={() => pickFile('import')}
        onExportBackup={() => void handleExportBackup()}
        onRestoreBackup={() => pickFile('restore')}
      />

      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="sr-only"
        onChange={(event) => void handleFile(event.target.files?.[0], importModeRef.current)}
      />

      <DashboardDialog
        open={templatesOpen}
        onOpenChange={setTemplatesOpen}
        title="Templates"
        description="Pick a design, then fill in your own content. Switching templates never changes your words."
      >
        <TemplatesSection
          busy={busy}
          showHeading={false}
          onUseTemplate={(preset) => {
            setTemplatesOpen(false)
            void createFromTemplate(preset)
          }}
          onBrowseAll={() => {
            setTemplatesOpen(false)
            void openEditorIntent({ openStyles: true })
          }}
        />
      </DashboardDialog>

      <DashboardDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        title="Settings"
        description="Appearance, local storage, and the privacy details of this app."
        width="980px"
      >
        <SettingsSection
          docsCount={docs?.length ?? 0}
          canExportBackup={canExportBackup}
          busy={busy}
          showHeading={false}
          onExportBackup={() => void handleExportBackup()}
          onRestoreBackup={() => pickFile('restore')}
        />
      </DashboardDialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title={`Delete “${deleteTarget?.title ?? 'this CV'}”?`}
        description="This removes the CV from this browser. Export a backup first if you might need it."
        confirmLabel="Delete CV"
        onConfirm={() => void handleDelete()}
      />

      <RenameDialog
        open={Boolean(renameTarget)}
        initialTitle={renameTarget?.title ?? ''}
        onOpenChange={(open) => {
          if (!open) setRenameTarget(null)
        }}
        onSave={(title) => void handleRename(title)}
      />
    </div>
  )
}
