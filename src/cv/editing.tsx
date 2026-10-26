import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useRef,
  type FormEvent,
  type ReactNode,
} from 'react'
import { cn } from '@/lib/cn'
import { renderInline } from '@/lib/markdown'

export type InlineTarget =
  | { kind: 'basics-name' }
  | { kind: 'basics-headline' }
  | { kind: 'basics-summary' }
  | { kind: 'basics-location' }
  | { kind: 'contact'; field: 'email' | 'phone' | 'city' | 'country' | 'website' }
  | { kind: 'profile'; profileId: string; field: 'label' | 'url' }
  | { kind: 'section-title'; sectionId: string }
  | {
      kind: 'entry'
      sectionId: string
      entryId: string
      field: 'title' | 'organization' | 'location' | 'summary'
    }
  | { kind: 'bullet'; sectionId: string; entryId: string; index: number }
  | { kind: 'tag'; sectionId: string; entryId: string; index: number }

export type InlineAction =
  | { type: 'add-entry'; sectionId: string }
  | { type: 'add-bullet'; sectionId: string; entryId: string; afterIndex: number }
  | { type: 'add-tag'; sectionId: string; entryId: string }
  | { type: 'add-section'; afterSectionId?: string }
  | { type: 'hide-section'; sectionId: string }
  | { type: 'move-section-to'; sectionId: string; toIndex: number }
  | { type: 'remove-section'; sectionId: string }
  | { type: 'remove-entry'; sectionId: string; entryId: string }
  | { type: 'remove-bullet'; sectionId: string; entryId: string; index: number }
  | { type: 'remove-tag'; sectionId: string; entryId: string; index: number }
  | { type: 'open-panel'; sectionId: string }

export type CvEditContextValue = {
  enabled: boolean
  activate: (target: InlineTarget, element: HTMLElement) => void
  commit: (target: InlineTarget, value: string) => void
  action: (action: InlineAction) => void
}

const noop = () => undefined

const CvEditContext = createContext<CvEditContextValue>({
  enabled: false,
  activate: noop,
  commit: noop,
  action: noop,
})

export function CvEditProvider({
  enabled,
  activate,
  commit,
  action,
  children,
}: CvEditContextValue & { children: ReactNode }) {
  return (
    <CvEditContext.Provider value={{ enabled, activate, commit, action }}>
      {children}
    </CvEditContext.Provider>
  )
}

export function useCvEdit(): CvEditContextValue {
  return useContext(CvEditContext)
}

function readEditable(element: HTMLElement, multiline: boolean): string {
  const raw = element.innerText.replace(/\u00a0/g, ' ').replace(/\r/g, '')
  return multiline
    ? raw.replace(/\n{3,}/g, '\n\n').trim()
    : raw.replace(/\s*\n\s*/g, ' ').trim()
}

export type EditableTextProps = {
  value: string
  target: InlineTarget
  as?: 'span' | 'div' | 'p' | 'h1' | 'h2'
  className?: string
  placeholder?: string
  singleLine?: boolean
  multiline?: boolean
  display?: ReactNode
  ariaLabel?: string
}

export function EditableText({
  value,
  target,
  as = 'span',
  className,
  placeholder = 'Click to edit',
  singleLine = true,
  multiline = false,
  display,
  ariaLabel,
}: EditableTextProps) {
  const edit = useCvEdit()
  const ref = useRef<HTMLElement | null>(null)
  const timerRef = useRef<number | null>(null)
  const editing = edit.enabled
  const oneLine = singleLine && !multiline

  const clearTimer = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current)
    timerRef.current = null
  }

  useEffect(() => {
    const element = ref.current
    if (!element || !editing) return
    if (document.activeElement === element) return
    const next = value ?? ''
    if (element.innerText !== next) element.textContent = next
  }, [value, editing])

  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    },
    [],
  )

  if (!editing) {
    return createElement(as, { className }, display ?? renderInline(value))
  }

  return createElement(as, {
    ref,
    className: cn('cv-editable', multiline && 'cv-editable-multiline', className),
    contentEditable: true,
    suppressContentEditableWarning: true,
    spellCheck: true,
    role: 'textbox',
    'aria-label': ariaLabel ?? placeholder,
    'aria-multiline': multiline,
    'data-placeholder': placeholder,
    onFocus: (event: FocusEvent) => {
      edit.activate(target, event.currentTarget as HTMLElement)
    },
    onInput: (event: FormEvent<HTMLElement>) => {
      const element = event.currentTarget
      clearTimer()
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null
        const next = readEditable(element, multiline)
        if (next !== value) edit.commit(target, next)
      }, 700)
    },
    onBlur: (event: FocusEvent) => {
      clearTimer()
      const element = event.currentTarget as HTMLElement
      const next = readEditable(element, multiline)
      if (next !== value) edit.commit(target, next)
      if (!next) element.textContent = ''
    },
    onKeyDown: (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        clearTimer()
        const element = event.currentTarget as HTMLElement
        element.textContent = value
        element.blur()
      } else if (event.key === 'Enter' && oneLine) {
        event.preventDefault()
        ;(event.currentTarget as HTMLElement).blur()
      }
    },
    onPaste: (event: ClipboardEvent) => {
      event.preventDefault()
      let text = event.clipboardData?.getData('text/plain') ?? ''
      if (oneLine) text = text.replace(/\s*\n\s*/g, ' ')
      if (text) document.execCommand('insertText', false, text)
    },
  } as never)
}
