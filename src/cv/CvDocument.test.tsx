import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EXAMPLE_DOC } from '@/data/example'
import { renderInline } from '@/lib/markdown'
import { CvDocument } from './CvDocument'

describe('CvDocument', () => {
  it('renders the example identity, summary, roles and skills', () => {
    render(<CvDocument doc={EXAMPLE_DOC} />)
    expect(screen.getByText('Amara Okafor')).toBeInTheDocument()
    expect(screen.getAllByText('Senior Product Designer').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Northwind Payments').length).toBeGreaterThan(0)
    expect(screen.getByText(/led the end-to-end redesign/i)).toBeInTheDocument()
    expect(screen.getAllByText('Figma').length).toBeGreaterThan(0)
    expect(screen.getByRole('heading', { name: /experience/i })).toBeInTheDocument()
  })

  it('omits hidden sections', () => {
    const doc = structuredClone(EXAMPLE_DOC)
    const awards = doc.sections.find((section) => section.kind === 'awards')
    if (awards) awards.visible = false
    render(<CvDocument doc={doc} />)
    expect(screen.queryByRole('heading', { name: /awards/i })).not.toBeInTheDocument()
    expect(screen.queryByText('D&AD Wood Pencil')).not.toBeInTheDocument()
  })

  it('renders the name and headline only when present', () => {
    const doc = structuredClone(EXAMPLE_DOC)
    doc.basics.name = ''
    doc.basics.headline = ''
    doc.basics.summary = ''
    render(<CvDocument doc={doc} />)
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument()
    expect(screen.queryByText('Profile')).not.toBeInTheDocument()
  })

  it('keeps links in content safe', () => {
    const { container } = render(<div>{renderInline('[safe](https://example.com) [bad](javascript:alert(1))')}</div>)
    const links = container.querySelectorAll('a')
    expect(links).toHaveLength(1)
    expect(links[0].getAttribute('href')).toBe('https://example.com')
  })
})
