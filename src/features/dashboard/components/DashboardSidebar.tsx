import {
  Download,
  FileText,
  Home,
  LayoutTemplate,
  RotateCcw,
  Settings2,
  ShieldCheck,
  Upload,
  X,
  type LucideIcon,
} from 'lucide-react'
import { Dialog } from 'radix-ui'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/ui/Logo'
import { cn } from '@/lib/cn'

export type DashboardSection = 'home' | 'recent' | 'templates' | 'settings'

type SidebarProps = {
  docsCount: number | null
  active: DashboardSection
  busy: boolean
  canExportBackup: boolean
  onNavigate: (section: DashboardSection) => void
  onImport: () => void
  onExportBackup: () => void
  onRestoreBackup: () => void
}

const NAV_ITEMS: { id: DashboardSection; label: string; icon: LucideIcon }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'recent', label: 'My CVs', icon: FileText },
  { id: 'templates', label: 'Templates', icon: LayoutTemplate },
  { id: 'settings', label: 'Settings', icon: Settings2 },
]

function NavItem({
  item,
  active,
  docsCount,
  onNavigate,
}: {
  item: (typeof NAV_ITEMS)[number]
  active: boolean
  docsCount: number | null
  onNavigate: (section: DashboardSection) => void
}) {
  const Icon = item.icon
  return (
    <button
      type="button"
      onClick={() => onNavigate(item.id)}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-lg border px-2.5 py-2.5 text-[13px] font-medium transition-[background-color,border-color,color] duration-150',
        active
          ? 'border-accent/25 bg-accent-active text-ink'
          : 'border-transparent text-muted hover:bg-surface-raised hover:text-ink',
      )}
    >
      <Icon
        size={16}
        strokeWidth={1.9}
        className={cn('shrink-0', active ? 'text-accent' : 'text-faint')}
      />
      <span className="truncate">{item.label}</span>
      {item.id === 'recent' && (
        <span
          className={cn(
            'ml-auto rounded-full border px-1.5 py-px text-[10px] tabular transition-colors',
            active
              ? 'border-accent/25 bg-surface/60 text-accent'
              : 'border-line bg-surface text-faint',
          )}
        >
          {docsCount === null ? '–' : docsCount}
        </span>
      )}
    </button>
  )
}

function ToolItem({
  icon: Icon,
  label,
  onClick,
  disabled,
  title,
}: {
  icon: LucideIcon
  label: string
  onClick: () => void
  disabled?: boolean
  title?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[12.5px] text-muted transition-colors duration-150 hover:bg-surface-raised hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-muted"
    >
      <Icon size={14} strokeWidth={1.9} className="shrink-0 text-faint" />
      <span className="truncate">{label}</span>
    </button>
  )
}

function SidebarContent({
  docsCount,
  active,
  busy,
  canExportBackup,
  onNavigate,
  onImport,
  onExportBackup,
  onRestoreBackup,
}: SidebarProps) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <nav aria-label="Workspace" className="space-y-1 pt-1">
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            active={active === item.id}
            docsCount={docsCount}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      <div className="mt-6 space-y-1">
        <p className="px-2.5 pb-2 text-[10px] font-semibold tracking-[0.14em] text-faint uppercase">
          Tools
        </p>
        <ToolItem icon={Upload} label="Import CV" onClick={onImport} disabled={busy} />
        <ToolItem
          icon={Download}
          label="Export Backup"
          onClick={onExportBackup}
          disabled={!canExportBackup || busy}
          title={canExportBackup ? 'Save every CV as one backup file' : 'Create a CV first'}
        />
        <ToolItem
          icon={RotateCcw}
          label="Restore Backup"
          onClick={onRestoreBackup}
          disabled={busy}
        />
      </div>

      <div className="mt-auto pt-6">
        <div className="rounded-xl border border-line bg-surface-raised p-3">
          <div className="flex items-center gap-2">
            <span className="grid size-6 shrink-0 place-items-center rounded-md bg-accent-soft text-accent">
              <ShieldCheck size={13} />
            </span>
            <p className="text-[11.5px] leading-tight font-medium text-ink">
              Your data stays in your browser
            </p>
          </div>
          <p className="mt-2 text-[10.5px] leading-relaxed text-muted">
            No account. No server. 100% private.
          </p>
        </div>
      </div>
    </div>
  )
}

export function DashboardSidebar(props: SidebarProps) {
  return (
    <aside className="hidden w-[264px] shrink-0 border-r border-line bg-surface lg:block">
      <div className="flex h-full flex-col overflow-y-auto p-3">
        <SidebarContent {...props} />
      </div>
    </aside>
  )
}

export function MobileSidebar({
  open,
  onOpenChange,
  ...props
}: SidebarProps & { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] data-[state=open]:animate-fade-in lg:hidden" />
        <Dialog.Content className="fixed inset-y-0 left-0 z-50 flex w-[min(300px,86vw)] flex-col border-r border-line bg-surface p-3 shadow-float lg:hidden">
          <Dialog.Title className="sr-only">Navigation</Dialog.Title>
          <Dialog.Description className="sr-only">
            Dashboard sections and local CV tools.
          </Dialog.Description>
          <div className="flex h-11 shrink-0 items-center justify-between px-1">
            <Logo />
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" aria-label="Close navigation">
                <X size={17} />
              </Button>
            </Dialog.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto pt-3">
            <SidebarContent
              {...props}
              onNavigate={(section) => {
                props.onNavigate(section)
                onOpenChange(false)
              }}
            />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
