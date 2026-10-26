import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { plainText, renderInline } from './markdown'

describe('markdown-lite', () => {
  it('renders bold and italic without HTML injection', () => {
    const { container } = render(<div>{renderInline('A **strong** and *quiet* result')}</div>)
    expect(container.querySelector('strong')?.textContent).toBe('strong')
    expect(container.querySelector('em')?.textContent).toBe('quiet')
    expect(container.querySelector('script')).toBeNull()
  })

  it('keeps http links and rejects javascript URLs', () => {
    const safe = render(<div>{renderInline('[Site](https://example.com)')}</div>)
    expect(safe.container.querySelector('a')?.getAttribute('href')).toBe('https://example.com')

    const unsafe = render(<div>{renderInline('[Bad](javascript:alert(1))')}</div>)
    expect(unsafe.container.querySelector('a')).toBeNull()
    expect(unsafe.container.textContent).toBe('Bad')
  })

  it('strips markup for plain text export', () => {
    expect(plainText('A **strong** [link](https://example.com)')).toBe('A strong link')
  })
})
