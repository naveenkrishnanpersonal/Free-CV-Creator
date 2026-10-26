import { Loader2, Menu as MenuIcon, Plus, Settings2, Sparkles, Upload } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/ui/Logo'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export function DashboardHeader({
  busy,
  onOpenNav,
  onNew,
  onExample,
  onImport,
  onSettings,
}: {
  busy: boolean
  onOpenNav: () => void
  onNew: () => void
  onExample: () => void
  onImport: () => void
  onSettings: () => void
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur-md">
      <div className="flex h-14 w-full items-center gap-2 px-3 sm:px-5 lg:px-6">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onOpenNav}
          aria-label="Open navigation"
          title="Open navigation"
        >
          <MenuIcon size={17} />
        </Button>

        <Logo large showName={false} />

        <span className="ml-1 hidden items-center gap-2 text-[11px] text-faint md:inline-flex">
          <span className="h-3 w-px bg-line" aria-hidden="true" />
          Local-first CV builder
        </span>

        <div className="ml-auto flex items-center gap-1.5">
          <ThemeToggle />

          <Button
            variant="ghost"
            size="icon"
            onClick={onSettings}
            aria-label="Settings"
            title="Settings"
            className="hidden lg:inline-flex"
          >
            <Settings2 size={16} />
          </Button>

          <Button
            variant="ghost"
            size="md"
            onClick={onImport}
            disabled={busy}
            className="hidden md:inline-flex"
            title="Import a CV Studio JSON file"
          >
            <Upload size={14} />
            Import
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={onExample}
            disabled={busy}
            aria-label="Example"
            className="px-2.5 sm:px-3.5"
            title="Open a fully written example CV"
          >
            <Sparkles size={14} />
            <span className="hidden sm:inline">Example</span>
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={onNew}
            disabled={busy}
            aria-label="New CV"
            title="Create a new CV"
          >
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Plus size={15} />}
            <span>New CV</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
