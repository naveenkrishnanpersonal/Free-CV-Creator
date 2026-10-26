import { ArrowLeft } from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/ui/Logo'

export function NotFoundPage() {
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'Page not found — CV Studio'
  }, [])

  return (
    <div className="grid min-h-dvh place-items-center bg-canvas px-5">
      <div className="w-full max-w-[430px] rounded-xl border border-line bg-surface p-7 shadow-card">
        <Logo />
        <div className="mt-7 text-[10.5px] font-semibold tracking-[0.14em] text-faint uppercase">
          404
        </div>
        <h1 className="mt-1 font-display text-[30px] leading-tight text-ink">
          That page is not in the library.
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-muted">
          The CV may have been deleted, or the link is incomplete.
        </p>
        <Button variant="primary" className="mt-5" onClick={() => navigate('/')}>
          <ArrowLeft size={14} /> Back to your CVs
        </Button>
      </div>
    </div>
  )
}
