import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'light' | 'dark'

type UiState = {
  theme: Theme
  previewOpen: boolean
  zoom: number
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  setPreviewOpen: (open: boolean) => void
  setZoom: (zoom: number) => void
}

function initialTheme(): Theme {
  if (typeof document !== 'undefined' && document.documentElement.classList.contains('dark')) {
    return 'dark'
  }
  return 'light'
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      theme: initialTheme(),
      previewOpen: true,
      zoom: 1,
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      setPreviewOpen: (previewOpen) => set({ previewOpen }),
      setZoom: (zoom) => set({ zoom: Math.min(1.6, Math.max(0.5, zoom)) }),
    }),
    {
      name: 'cv-studio-ui',
      partialize: (state) => ({ theme: state.theme, zoom: state.zoom }),
    },
  ),
)
