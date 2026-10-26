import type { FontKey } from './constants'

export type FontDefinition = {
  label: string
  family: string
  category: 'Sans' | 'Serif' | 'Mono'
}

export const FONTS: Record<FontKey, FontDefinition> = {
  inter: { label: 'Inter', family: "'Inter', system-ui, sans-serif", category: 'Sans' },
  newsreader: { label: 'Newsreader', family: "'Newsreader', Georgia, serif", category: 'Serif' },
  'source-serif-4': {
    label: 'Source Serif 4',
    family: "'Source Serif 4', Georgia, serif",
    category: 'Serif',
  },
  lora: { label: 'Lora', family: "'Lora', Georgia, serif", category: 'Serif' },
  'playfair-display': {
    label: 'Playfair Display',
    family: "'Playfair Display', 'Times New Roman', serif",
    category: 'Serif',
  },
  manrope: { label: 'Manrope', family: "'Manrope', system-ui, sans-serif", category: 'Sans' },
  'ibm-plex-sans': {
    label: 'IBM Plex Sans',
    family: "'IBM Plex Sans', system-ui, sans-serif",
    category: 'Sans',
  },
  'ibm-plex-serif': {
    label: 'IBM Plex Serif',
    family: "'IBM Plex Serif', Georgia, serif",
    category: 'Serif',
  },
  merriweather: {
    label: 'Merriweather',
    family: "'Merriweather', Georgia, serif",
    category: 'Serif',
  },
  'eb-garamond': {
    label: 'EB Garamond',
    family: "'EB Garamond', Garamond, serif",
    category: 'Serif',
  },
  'libre-baskerville': {
    label: 'Libre Baskerville',
    family: "'Libre Baskerville', Baskerville, serif",
    category: 'Serif',
  },
  'space-grotesk': {
    label: 'Space Grotesk',
    family: "'Space Grotesk', system-ui, sans-serif",
    category: 'Sans',
  },
  georgia: { label: 'Georgia', family: "Georgia, 'Times New Roman', serif", category: 'Serif' },
  helvetica: { label: 'Helvetica', family: 'Helvetica, Arial, sans-serif', category: 'Sans' },
}

export type FontPair = {
  id: string
  name: string
  bodyFont: FontKey
  headingFont: FontKey
  nameFont: FontKey
}

export const FONT_PAIRS: FontPair[] = [
  { id: 'ink', name: 'Ink', bodyFont: 'inter', headingFont: 'inter', nameFont: 'newsreader' },
  {
    id: 'editorial',
    name: 'Editorial',
    bodyFont: 'source-serif-4',
    headingFont: 'inter',
    nameFont: 'newsreader',
  },
  {
    id: 'classic',
    name: 'Classic',
    bodyFont: 'lora',
    headingFont: 'lora',
    nameFont: 'playfair-display',
  },
  {
    id: 'quiet',
    name: 'Quiet',
    bodyFont: 'ibm-plex-sans',
    headingFont: 'ibm-plex-sans',
    nameFont: 'ibm-plex-serif',
  },
  {
    id: 'academic',
    name: 'Academic',
    bodyFont: 'eb-garamond',
    headingFont: 'eb-garamond',
    nameFont: 'merriweather',
  },
  {
    id: 'technical',
    name: 'Technical',
    bodyFont: 'manrope',
    headingFont: 'space-grotesk',
    nameFont: 'space-grotesk',
  },
  {
    id: 'bookish',
    name: 'Bookish',
    bodyFont: 'libre-baskerville',
    headingFont: 'libre-baskerville',
    nameFont: 'libre-baskerville',
  },
  {
    id: 'crisp',
    name: 'Crisp',
    bodyFont: 'helvetica',
    headingFont: 'inter',
    nameFont: 'inter',
  },
]
