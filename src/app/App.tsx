import { Suspense, lazy, useEffect } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useUiStore } from '@/store/uiStore'
import { ErrorBoundary } from './ErrorBoundary'
import { NotFoundPage } from './NotFoundPage'

const DashboardPage = lazy(() =>
  import('@/features/dashboard/DashboardPage').then((module) => ({
    default: module.DashboardPage,
  })),
)
const EditorPage = lazy(() =>
  import('@/features/editor/EditorPage').then((module) => ({
    default: module.EditorPage,
  })),
)

function ThemeSync() {
  const theme = useUiStore((state) => state.theme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    const meta = document.querySelector('meta[name="theme-color"]')
    meta?.setAttribute('content', theme === 'dark' ? '#080d15' : '#f3f6fb')
  }, [theme])

  return null
}

export function App() {
  const theme = useUiStore((state) => state.theme)

  return (
    <ErrorBoundary>
      <ThemeSync />
      <HashRouter>
        <Suspense
          fallback={
            <main className="grid min-h-dvh place-items-center" aria-busy="true">
              <span className="sr-only">Loading CV Studio</span>
            </main>
          }
        >
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/cv/:id" element={<EditorPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </HashRouter>
      <Toaster
        theme={theme}
        position="bottom-right"
        closeButton
        offset={16}
        toastOptions={{ duration: 3500 }}
      />
    </ErrorBoundary>
  )
}
