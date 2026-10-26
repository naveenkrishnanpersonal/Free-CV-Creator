import {
  CheckCircle2,
  Database,
  Download,
  HardDrive,
  Moon,
  RotateCcw,
  ShieldCheck,
  Sun,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { getStorageEstimate } from '@/lib/storage'
import { useUiStore } from '@/store/uiStore'

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 KB'
  const units = ['B', 'KB', 'MB', 'GB']
  const exponent = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)))
  const value = bytes / 1024 ** exponent
  return `${value >= 10 || exponent === 0 ? Math.round(value) : value.toFixed(1)} ${units[exponent]}`
}

function Panel({
  icon: Icon,
  title,
  tone,
  children,
}: {
  icon: LucideIcon
  title: string
  tone: string
  children: ReactNode
}) {
  return (
    <div className="rounded-xl border border-line bg-surface-raised p-4">
      <div className="flex items-center gap-2.5">
        <span className={cn('grid size-7 place-items-center rounded-lg', tone)}>
          <Icon size={14} />
        </span>
        <h3 className="text-[12.5px] font-semibold text-ink">{title}</h3>
      </div>
      <div className="mt-3">{children}</div>
    </div>
  )
}

export function SettingsSection({
  docsCount,
  canExportBackup,
  busy,
  onExportBackup,
  onRestoreBackup,
  showHeading = true,
}: {
  docsCount: number
  canExportBackup: boolean
  busy: boolean
  onExportBackup: () => void
  onRestoreBackup: () => void
  showHeading?: boolean
}) {
  const theme = useUiStore((state) => state.theme)
  const setTheme = useUiStore((state) => state.setTheme)
  const [estimate, setEstimate] = useState<{ usage: number; quota: number } | null | undefined>(
    undefined,
  )

  useEffect(() => {
    let active = true
    getStorageEstimate()
      .then((value) => {
        if (active) setEstimate(value)
      })
      .catch(() => {
        if (active) setEstimate(null)
      })
    return () => {
      active = false
    }
  }, [docsCount])

  const usedPercent =
    estimate && estimate.quota > 0
      ? Math.min(100, Math.max(0.5, (estimate.usage / estimate.quota) * 100))
      : 0

  return (
    <section id="settings" aria-labelledby={showHeading ? 'settings-title' : undefined}>
      {showHeading && (
        <div className="min-w-0">
          <h2
            id="settings-title"
            className="text-[17px] font-semibold tracking-[-0.025em] text-ink"
          >
            Settings
          </h2>
          <p className="mt-1 text-[12px] text-muted">
            Appearance, local storage, and the privacy details of this app.
          </p>
        </div>
      )}

      <div
        className={
          showHeading ? 'mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3' : 'grid gap-3 md:grid-cols-2 xl:grid-cols-3'
        }
      >
        <Panel icon={Sun} title="Appearance" tone="bg-accent-soft text-accent">
          <div className="grid grid-cols-2 gap-2" role="group" aria-label="Theme">
            <button
              type="button"
              onClick={() => setTheme('light')}
              aria-pressed={theme === 'light'}
              className={cn(
                'flex h-9 items-center justify-center gap-1.5 rounded-lg border text-[12px] font-medium transition-colors duration-150',
                theme === 'light'
                  ? 'border-accent/40 bg-accent-soft text-accent'
                  : 'border-line bg-surface text-muted hover:border-line-strong hover:text-ink',
              )}
            >
              <Sun size={14} />
              Light
            </button>
            <button
              type="button"
              onClick={() => setTheme('dark')}
              aria-pressed={theme === 'dark'}
              className={cn(
                'flex h-9 items-center justify-center gap-1.5 rounded-lg border text-[12px] font-medium transition-colors duration-150',
                theme === 'dark'
                  ? 'border-accent/40 bg-accent-soft text-accent'
                  : 'border-line bg-surface text-muted hover:border-line-strong hover:text-ink',
              )}
            >
              <Moon size={14} />
              Dark
            </button>
          </div>
          <p className="mt-2 text-[10.5px] leading-relaxed text-faint">
            Your theme is remembered on this device.
          </p>
        </Panel>

        <Panel icon={Database} title="Local storage" tone="bg-orange-soft text-orange">
          <dl className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="rounded-md bg-surface px-2.5 py-2">
              <dt className="text-faint">Documents</dt>
              <dd className="mt-0.5 font-semibold text-ink tabular">{docsCount}</dd>
            </div>
            <div className="rounded-md bg-surface px-2.5 py-2">
              <dt className="text-faint">Used</dt>
              <dd className="mt-0.5 font-semibold text-ink tabular">
                {estimate === undefined
                  ? 'Checking…'
                  : estimate
                    ? formatBytes(estimate.usage)
                    : 'Unavailable'}
              </dd>
            </div>
          </dl>
          {estimate && estimate.quota > 0 && (
            <div className="mt-2.5">
              <div className="h-1.5 overflow-hidden rounded-full bg-surface">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${usedPercent}%` }}
                  aria-hidden="true"
                />
              </div>
              <p className="mt-1 text-[10px] text-faint">
                Browser estimate for this site · {formatBytes(estimate.quota)} quota
              </p>
            </div>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={onExportBackup}
              disabled={!canExportBackup || busy}
              title={canExportBackup ? 'Download one backup file' : 'Create a CV first'}
            >
              <Download size={13} />
              Export backup
            </Button>
            <Button variant="ghost" size="sm" onClick={onRestoreBackup} disabled={busy}>
              <RotateCcw size={13} />
              Restore
            </Button>
          </div>
        </Panel>

        <Panel icon={ShieldCheck} title="Privacy" tone="bg-emerald-soft text-emerald">
          <ul className="space-y-2 text-[11px] leading-relaxed text-muted">
            <li className="flex gap-2">
              <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-emerald" aria-hidden="true" />
              Documents are stored in this browser with IndexedDB.
            </li>
            <li className="flex gap-2">
              <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-emerald" aria-hidden="true" />
              No account, no server upload, no analytics.
            </li>
            <li className="flex gap-2">
              <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-emerald" aria-hidden="true" />
              Backup files are created and saved by you.
            </li>
          </ul>
        </Panel>
      </div>

      <div className="mt-3 flex items-center gap-2 text-[10.5px] text-faint">
        <HardDrive size={12} className="shrink-0" />
        Clearing this browser&apos;s site data removes your CVs. Keep a backup you can restore.
      </div>
    </section>
  )
}
