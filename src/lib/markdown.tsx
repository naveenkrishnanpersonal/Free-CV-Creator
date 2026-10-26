import type { ReactNode } from 'react'

const TOKEN = /(\*\*[^*\n]+\*\*|\*[^*\n]+\*|\[[^\]\n]+\]\((?:[^()\s]|\([^()\s]*\))*\))/g

function safeHref(raw: string): string | null {
  const value = raw.trim()
  if (/^(https?:\/\/|mailto:|tel:)/i.test(value)) return value
  return null
}

export function renderInline(text: string): ReactNode[] {
  if (!text) return []
  const parts = text.split(TOKEN)
  return parts.map((part, index) => {
    if (!part) return null
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={index}>{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <em key={index}>{part.slice(1, -1)}</em>
    }
    const linkMatch = /^\[([^\]]+)\]\((.+)\)$/.exec(part)
    if (linkMatch) {
      const href = safeHref(linkMatch[2])
      if (href) {
        return (
          <a key={index} href={href} target="_blank" rel="noopener noreferrer">
            {linkMatch[1]}
          </a>
        )
      }
      return linkMatch[1]
    }
    return <span key={index}>{part}</span>
  })
}

export function plainText(markdown: string): string {
  return markdown
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    .trim()
}
