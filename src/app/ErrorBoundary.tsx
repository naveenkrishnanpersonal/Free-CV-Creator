import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

type Props = { children: ReactNode }
type State = { hasError: boolean; message: string }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' }

  static getDerivedStateFromError(error: unknown): State {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : 'An unexpected error occurred.',
    }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('CV Studio render error', error, info)
  }

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children
    return (
      <div className="grid min-h-dvh place-items-center bg-canvas px-5">
        <div className="w-full max-w-[440px] rounded-xl border border-line bg-surface p-6 shadow-card">
          <div className="grid size-10 place-items-center rounded-full bg-danger-soft text-danger">
            <AlertTriangle size={18} />
          </div>
          <h1 className="mt-4 font-display text-[24px] text-ink">Something broke on screen</h1>
          <p className="mt-2 text-[13px] leading-relaxed text-muted">
            Your saved CVs are still in this browser. Reload to continue. If the problem repeats,
            export your CVs from the library first.
          </p>
          <p className="mt-3 rounded-md bg-surface-muted px-3 py-2 font-mono text-[11px] break-words text-faint">
            {this.state.message}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 inline-flex h-9 items-center rounded-md bg-accent px-4 text-[13px] font-medium text-accent-ink hover:bg-accent-hover"
          >
            Reload
          </button>
        </div>
      </div>
    )
  }
}
