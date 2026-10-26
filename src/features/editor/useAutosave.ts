import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import type { ResumeDoc } from '@/lib/schema'
import { saveDoc } from '@/lib/storage'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function useAutosave(
  doc: ResumeDoc | null,
  enabled = true,
): {
  status: SaveStatus
  savedAt: string | null
} {
  const [status, setStatus] = useState<SaveStatus>('idle')
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const baselineRef = useRef<{ id: string; updatedAt: string } | null>(null)
  const latestDocRef = useRef<ResumeDoc | null>(doc)
  const dirtyRef = useRef(false)
  const errorShownRef = useRef(false)
  const enabledRef = useRef(enabled)

  latestDocRef.current = doc
  enabledRef.current = enabled

  useEffect(() => {
    if (!doc || !enabled) {
      if (!doc) baselineRef.current = null
      return
    }
    if (baselineRef.current?.id !== doc.id) {
      baselineRef.current = { id: doc.id, updatedAt: doc.updatedAt }
      dirtyRef.current = false
      setStatus('saved')
      setSavedAt(doc.updatedAt)
      return
    }
    if (baselineRef.current.updatedAt === doc.updatedAt) {
      return
    }

    dirtyRef.current = true
    setStatus('saving')
    const timer = window.setTimeout(async () => {
      if (!enabledRef.current) return
      try {
        await saveDoc(doc)
        baselineRef.current = { id: doc.id, updatedAt: doc.updatedAt }
        dirtyRef.current = false
        errorShownRef.current = false
        setSavedAt(new Date().toISOString())
        setStatus('saved')
      } catch (error) {
        setStatus('error')
        if (!errorShownRef.current) {
          errorShownRef.current = true
          toast.error(error instanceof Error ? error.message : 'Could not save this CV.')
        }
      }
    }, 650)

    return () => window.clearTimeout(timer)
  }, [doc, enabled])

  useEffect(() => {
    const flush = () => {
      if (enabledRef.current && latestDocRef.current && dirtyRef.current) {
        void saveDoc(latestDocRef.current)
      }
    }
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirtyRef.current) return
      event.preventDefault()
      event.returnValue = ''
    }
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') flush()
    }

    window.addEventListener('pagehide', flush)
    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      window.removeEventListener('pagehide', flush)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibility)
      flush()
    }
  }, [])

  return { status, savedAt }
}
