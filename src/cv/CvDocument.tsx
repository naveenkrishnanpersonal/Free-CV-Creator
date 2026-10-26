import { ArrowDown, ArrowUp, Globe, Mail, MapPin, Pencil, Phone, Plus, X, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import type { SectionKind } from '@/lib/constants'
import { formatDateRange, formatDateValue } from '@/lib/dates'
import { displayUrl, emailHref, locationLine, normalizeHref, phoneHref } from '@/lib/format'
import { renderInline } from '@/lib/markdown'
import type { Basics, Entry, ResumeDoc, Section } from '@/lib/schema'
import { SECTION_META } from '@/lib/sectionMeta'
import { cn } from '@/lib/cn'
import '@/cv/cv.css'
import { EditableText, useCvEdit, type InlineTarget } from './editing'
import { cvStyleVars, paperDimensions, scopedCustomCss, type CvVars } from './theme'

type ContactItem = {
  key: string
  icon: LucideIcon
  text: string
  href?: string
  target?: InlineTarget
  editValue?: string
  placeholder?: string
}

function entryHasContent(entry: Entry): boolean {
  if (entry.visible === false) return false
  return Boolean(
    entry.title.trim() ||
      entry.organization.trim() ||
      entry.location.trim() ||
      entry.start ||
      entry.end ||
      entry.current ||
      entry.summary.trim() ||
      entry.url.trim() ||
      entry.bullets.some((bullet) => bullet.trim()) ||
      entry.tags.length,
  )
}

function sectionHasContent(section: Section, basics: Basics): boolean {
  if (!section.visible) return false
  if (section.kind === 'summary') return basics.summary.trim().length > 0
  return section.items.some(entryHasContent)
}

function contactItems(basics: Basics, includeEmpty = false): ContactItem[] {
  const items: ContactItem[] = []
  if (basics.email.trim() || includeEmpty) {
    items.push({
      key: 'email',
      icon: Mail,
      text: basics.email.trim(),
      href: basics.email.trim() ? emailHref(basics.email) : undefined,
      target: { kind: 'contact', field: 'email' },
      editValue: basics.email,
      placeholder: 'you@example.com',
    })
  }
  if (basics.phone.trim() || includeEmpty) {
    items.push({
      key: 'phone',
      icon: Phone,
      text: basics.phone.trim(),
      href: basics.phone.trim() ? phoneHref(basics.phone) : undefined,
      target: { kind: 'contact', field: 'phone' },
      editValue: basics.phone,
      placeholder: '+44 20 7946 0821',
    })
  }
  const location = locationLine(basics.city, basics.country)
  if (location || includeEmpty) {
    items.push({
      key: 'location',
      icon: MapPin,
      text: location,
      target: { kind: 'basics-location' },
      editValue: location,
      placeholder: 'City, Country',
    })
  }
  if (basics.website.trim() || includeEmpty) {
    items.push({
      key: 'website',
      icon: Globe,
      text: displayUrl(basics.website),
      href: basics.website.trim() ? normalizeHref(basics.website) : undefined,
      target: { kind: 'contact', field: 'website' },
      editValue: basics.website,
      placeholder: 'yourname.com',
    })
  }
  for (const profile of basics.profiles) {
    const text = profile.label.trim() || displayUrl(profile.url)
    if (!text) continue
    items.push({
      key: profile.id,
      icon: Globe,
      text,
      href: profile.url.trim() ? normalizeHref(profile.url) : undefined,
      target: { kind: 'profile', profileId: profile.id, field: 'label' },
      editValue: profile.label,
      placeholder: displayUrl(profile.url) || 'Profile label',
    })
  }
  return items
}

function CvHeader({ doc, variant = 'default' }: { doc: ResumeDoc; variant?: 'default' | 'sidebar' }) {
  const { basics, style } = doc
  const edit = useCvEdit()
  const items = contactItems(basics, edit.enabled)
  const photo = basics.photo
  const showPhoto = style.header.showPhoto && photo?.dataUrl
  const sidebar = variant === 'sidebar'

  return (
    <header className={cn('cv-header', sidebar && 'cv-header-sidebar')} data-align={style.header.align}>
      <div className="cv-header-row">
        <div className="cv-header-main">
          {edit.enabled || basics.name.trim() ? (
            <EditableText
              as="h1"
              className="cv-name"
              value={basics.name}
              target={{ kind: 'basics-name' }}
              placeholder="Your name"
              singleLine
              ariaLabel="Full name"
            />
          ) : null}
          {style.header.showHeadline && (edit.enabled || basics.headline.trim()) ? (
            <EditableText
              as="p"
              className="cv-headline"
              value={basics.headline}
              target={{ kind: 'basics-headline' }}
              placeholder="Your role"
              singleLine
              ariaLabel="Headline"
            />
          ) : null}
          {items.length > 0 && (
            <div className="cv-contact" data-layout={style.header.contactLayout}>
              {items.map((item) => {
                const Icon = item.icon
                const display = item.href ? <a href={item.href}>{item.text}</a> : <span>{item.text}</span>
                return (
                  <span className="cv-contact-item" key={item.key}>
                    {style.header.showIcons && <Icon className="cv-contact-icon" aria-hidden="true" />}
                    {edit.enabled && item.target ? (
                      <EditableText
                        value={item.editValue ?? item.text}
                        target={item.target}
                        display={display}
                        placeholder={item.placeholder}
                        singleLine
                        className="cv-contact-text"
                        ariaLabel={`Edit ${item.text || item.placeholder || 'contact detail'}`}
                      />
                    ) : (
                      display
                    )}
                  </span>
                )
              })}
            </div>
          )}
        </div>
        {showPhoto && photo && (
          <div className="cv-photo" data-shape={photo.shape}>
            <img
              src={photo.dataUrl}
              alt={basics.name.trim() ? `${basics.name} portrait` : 'Portrait'}
              style={{
                objectPosition: `${photo.x}% ${photo.y}%`,
                transform: `scale(${photo.zoom})`,
                filter: photo.grayscale ? 'grayscale(1)' : undefined,
              }}
            />
          </div>
        )}
      </div>
    </header>
  )
}

function EntryMeta({
  entry,
  sectionId,
  showLocation,
  showUrl,
}: {
  entry: Entry
  sectionId: string
  showLocation: boolean
  showUrl: boolean
}) {
  const edit = useCvEdit()
  if (!(showLocation && entry.location.trim()) && !(showUrl && entry.url.trim())) return null
  return (
    <div className="cv-entry-meta">
      {showLocation && (edit.enabled || entry.location.trim()) && (
        <EditableText
          value={entry.location}
          target={{
            kind: 'entry',
            sectionId,
            entryId: entry.id,
            field: 'location',
          }}
          placeholder="Location"
          singleLine
          className="cv-entry-location"
          ariaLabel="Edit location"
        />
      )}
      {showLocation && entry.location.trim() && showUrl && entry.url.trim() && (
        <span className="cv-entry-meta-separator">·</span>
      )}
      {showUrl && entry.url.trim() && (
        <a href={normalizeHref(entry.url)} target="_blank" rel="noopener noreferrer">
          {displayUrl(entry.url)}
        </a>
      )}
    </div>
  )
}

function EntryBody({ entry, section, doc }: { entry: Entry; section: Section; doc: ResumeDoc }) {
  const meta = SECTION_META[section.kind]
  const edit = useCvEdit()
  const variant = doc.style.sectionVariants[section.kind]
  const allowBullets = variant?.showBullets !== false
  const bullets = edit.enabled
    ? entry.bullets
    : entry.bullets.filter((bullet) => bullet.trim())
  const summary = meta.showSummary && doc.style.entry.showSummary ? entry.summary.trim() : ''

  return (
    <>
      {meta.showSummary && doc.style.entry.showSummary && (edit.enabled || summary) && (
        edit.enabled ? (
          <EditableText
            as="div"
            className="cv-entry-summary cv-entry-summary-editing"
            value={entry.summary}
            target={{
              kind: 'entry',
              sectionId: section.id,
              entryId: entry.id,
              field: 'summary',
            }}
            placeholder={meta.summaryPlaceholder}
            multiline
            ariaLabel="Edit summary"
          />
        ) : (
          <div className="cv-entry-summary">
            {summary.split(/\n{2,}/).map((paragraph, index) => (
              <p key={index}>{renderInline(paragraph)}</p>
            ))}
          </div>
        )
      )}
      {meta.showBullets && allowBullets && bullets.length > 0 && (
        <ul className="cv-bullets" data-bullet={doc.style.entry.bulletStyle}>
          {bullets.map((bullet, index) => (
            <li key={index} className="cv-bullet-line" data-bullet-index={index}>
              <EditableText
                value={bullet}
                target={{
                  kind: 'bullet',
                  sectionId: section.id,
                  entryId: entry.id,
                  index,
                }}
                placeholder="Describe an outcome…"
                singleLine={false}
                ariaLabel={`Edit highlight ${index + 1}`}
              />
              {edit.enabled && (
                <>
                  <button
                    type="button"
                    className="cv-line-add"
                    title="Add a line below"
                    aria-label={`Add a line after highlight ${index + 1}`}
                    onClick={() =>
                      edit.action({
                        type: 'add-bullet',
                        sectionId: section.id,
                        entryId: entry.id,
                        afterIndex: index,
                      })
                    }
                  >
                    <Plus size={9} />
                  </button>
                  <button
                    type="button"
                    className="cv-line-remove"
                    title="Remove this line"
                    aria-label={`Remove highlight ${index + 1}`}
                    onClick={() =>
                      edit.action({
                        type: 'remove-bullet',
                        sectionId: section.id,
                        entryId: entry.id,
                        index,
                      })
                    }
                  >
                    <X size={9} />
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
      {edit.enabled && meta.showBullets && allowBullets && (
        <div className="cv-inline-add-row">
          <button
            type="button"
            className="cv-inline-add"
            onClick={() =>
              edit.action({
                type: 'add-bullet',
                sectionId: section.id,
                entryId: entry.id,
                afterIndex: entry.bullets.length - 1,
              })
            }
          >
            + Add highlight
          </button>
        </div>
      )}
      {meta.showTags && (entry.tags.length > 0 || edit.enabled) && (
        <>
          {entry.tags.length > 0 && (
            <ul className="cv-tags" aria-label={meta.tagsLabel || 'Tags'}>
              {entry.tags.map((tag, index) => (
                <li className="cv-tag" key={`${tag}-${index}`} data-tag-index={index}>
                  <EditableText
                    value={tag}
                    target={{
                      kind: 'tag',
                      sectionId: section.id,
                      entryId: entry.id,
                      index,
                    }}
                    placeholder="Skill"
                    singleLine
                    ariaLabel={`Edit ${tag}`}
                  />
                  {edit.enabled && (
                    <button
                      type="button"
                      className="cv-tag-remove"
                      title="Remove this tag"
                      aria-label={`Remove tag ${tag || index + 1}`}
                      onClick={() =>
                        edit.action({
                          type: 'remove-tag',
                          sectionId: section.id,
                          entryId: entry.id,
                          index,
                        })
                      }
                    >
                      <X size={8} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
          {edit.enabled && (
            <div className="cv-inline-add-row">
              <button
                type="button"
                className="cv-inline-add"
                onClick={() => edit.action({ type: 'add-tag', sectionId: section.id, entryId: entry.id })}
              >
                + Add tag
              </button>
            </div>
          )}
        </>
      )}
    </>
  )
}

function CvEntry({ entry, section, doc }: { entry: Entry; section: Section; doc: ResumeDoc }) {
  const meta = SECTION_META[section.kind]
  const style = doc.style
  const edit = useCvEdit()
  const range =
    meta.dateMode === 'range'
      ? formatDateRange({
          start: entry.start,
          end: entry.end,
          current: entry.current,
          format: doc.settings.dateFormat,
        })
      : meta.dateMode === 'single'
        ? formatDateValue(entry.start, doc.settings.dateFormat)
        : ''

  return (
    <article className="cv-entry" data-title-date={style.entry.titleDate} data-entry-id={entry.id}>
      {edit.enabled && (
        <div className="cv-entry-tools">
          <button
            type="button"
            className="cv-tool"
            title="Remove this entry"
            aria-label={`Remove ${entry.title.trim() || 'entry'}`}
            onClick={() =>
              edit.action({ type: 'remove-entry', sectionId: section.id, entryId: entry.id })
            }
          >
            <X size={9} />
          </button>
        </div>
      )}
      <div className="cv-entry-head">
        <div className="cv-entry-heading">
          {(edit.enabled || entry.title.trim()) && (
            <EditableText
              className="cv-entry-title"
              value={entry.title}
              target={{
                kind: 'entry',
                sectionId: section.id,
                entryId: entry.id,
                field: 'title',
              }}
              placeholder={meta.titlePlaceholder}
              singleLine
              ariaLabel={`Edit ${meta.titleLabel.toLowerCase()}`}
            />
          )}
          {meta.organizationLabel && (edit.enabled || entry.organization.trim()) && (
            <EditableText
              className="cv-entry-org"
              value={entry.organization}
              target={{
                kind: 'entry',
                sectionId: section.id,
                entryId: entry.id,
                field: 'organization',
              }}
              placeholder={meta.organizationPlaceholder}
              singleLine
              ariaLabel={`Edit ${meta.organizationLabel.toLowerCase()}`}
            />
          )}
        </div>
        {range && <div className="cv-entry-dates">{range}</div>}
      </div>
      <EntryMeta
        entry={entry}
        sectionId={section.id}
        showLocation={meta.showLocation && style.entry.showLocation}
        showUrl={meta.showUrl}
      />
      <EntryBody entry={entry} section={section} doc={doc} />
    </article>
  )
}

function AddRow({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <div className="cv-inline-add-row">
      <button type="button" className="cv-inline-add" onClick={onClick}>
        + {label}
      </button>
    </div>
  )
}

function AddSectionRow() {
  const edit = useCvEdit()
  if (!edit.enabled) return null
  return (
    <div className="cv-add-section-row">
      <button
        type="button"
        className="cv-add-section"
        onClick={() => edit.action({ type: 'add-section' })}
      >
        <Plus size={10} /> Add section
      </button>
    </div>
  )
}

function SkillGroups({ section }: { section: Section }) {
  const meta = SECTION_META[section.kind]
  const edit = useCvEdit()
  const items = edit.enabled ? section.items : section.items.filter(entryHasContent)

  return (
    <div>
      {items.map((entry) => (
        <div className="cv-skill-group" key={entry.id} data-entry-id={entry.id}>
          {edit.enabled && (
            <div className="cv-entry-tools">
              <button
                type="button"
                className="cv-tool"
                title="Remove this group"
                aria-label={`Remove ${entry.title.trim() || 'skill group'}`}
                onClick={() =>
                  edit.action({ type: 'remove-entry', sectionId: section.id, entryId: entry.id })
                }
              >
                <X size={9} />
              </button>
            </div>
          )}
          <EditableText
            className="cv-skill-label"
            value={entry.title}
            target={{
              kind: 'entry',
              sectionId: section.id,
              entryId: entry.id,
              field: 'title',
            }}
            placeholder={meta.titlePlaceholder}
            singleLine
            ariaLabel="Edit group name"
          />
          <span className="cv-skill-list">
            {entry.tags.map((tag, index) => (
              <span className="cv-skill-token" key={`${tag}-${index}`} data-tag-index={index}>
                {index > 0 && ' · '}
                <EditableText
                  value={tag}
                  target={{
                    kind: 'tag',
                    sectionId: section.id,
                    entryId: entry.id,
                    index,
                  }}
                  placeholder="Skill"
                  singleLine
                  ariaLabel={`Edit ${tag}`}
                />
                {edit.enabled && (
                  <button
                    type="button"
                    className="cv-inline-remove"
                    title="Remove this skill"
                    aria-label={`Remove ${tag || 'skill'}`}
                    onClick={() =>
                      edit.action({
                        type: 'remove-tag',
                        sectionId: section.id,
                        entryId: entry.id,
                        index,
                      })
                    }
                  >
                    <X size={8} />
                  </button>
                )}
              </span>
            ))}
            {entry.tags.length === 0 && edit.enabled && <span className="cv-muted-text">Add a skill</span>}
            {edit.enabled && (
              <>
                {entry.tags.length > 0 && ' · '}
                <button
                  type="button"
                  className="cv-inline-add cv-inline-add-inline"
                  onClick={() => edit.action({ type: 'add-tag', sectionId: section.id, entryId: entry.id })}
                >
                  + skill
                </button>
              </>
            )}
          </span>
        </div>
      ))}
      {edit.enabled && (
        <AddRow
          label={`Add ${meta.singular.toLowerCase()}`}
          onClick={() => edit.action({ type: 'add-entry', sectionId: section.id })}
        />
      )}
    </div>
  )
}

function InlineEntries({ section }: { section: Section }) {
  const meta = SECTION_META[section.kind]
  const edit = useCvEdit()
  const items = edit.enabled ? section.items : section.items.filter(entryHasContent)
  return (
    <div>
      <div className="cv-inline-list">
        {items.map((entry) => (
          <span className="cv-inline-item" key={entry.id} data-entry-id={entry.id}>
            {edit.enabled && (
              <button
                type="button"
                className="cv-inline-remove"
                title="Remove this line"
                aria-label={`Remove ${entry.title.trim() || 'entry'}`}
                onClick={() =>
                  edit.action({ type: 'remove-entry', sectionId: section.id, entryId: entry.id })
                }
              >
                <X size={8} />
              </button>
            )}
            <EditableText
              as="span"
              value={entry.title}
              target={{
                kind: 'entry',
                sectionId: section.id,
                entryId: entry.id,
                field: 'title',
              }}
              placeholder={meta.titlePlaceholder}
              singleLine
              ariaLabel="Edit entry"
            />
            {(edit.enabled || entry.summary.trim()) && (
              <span>
                {' — '}
                <EditableText
                  value={entry.summary}
                  target={{
                    kind: 'entry',
                    sectionId: section.id,
                    entryId: entry.id,
                    field: 'summary',
                  }}
                  placeholder={meta.summaryPlaceholder}
                  singleLine
                  ariaLabel="Edit detail"
                />
              </span>
            )}
          </span>
        ))}
      </div>
      {edit.enabled && (
        <AddRow
          label={`Add ${meta.singular.toLowerCase()}`}
          onClick={() => edit.action({ type: 'add-entry', sectionId: section.id })}
        />
      )}
    </div>
  )
}

function CvSection({
  section,
  doc,
  index,
  siblings,
}: {
  section: Section
  doc: ResumeDoc
  index: number
  siblings: Section[]
}) {
  const meta = SECTION_META[section.kind]
  const style = doc.style
  const edit = useCvEdit()
  const Icon = meta.icon
  const title = section.title.trim() || meta.label
  const variant = style.sectionVariants[section.kind]
  const layout = variant?.layout ?? section.layout

  const siblingIndex = siblings.findIndex((item) => item.id === section.id)
  const prev = siblingIndex > 0 ? siblings[siblingIndex - 1] : undefined
  const next =
    siblingIndex >= 0 && siblingIndex < siblings.length - 1
      ? siblings[siblingIndex + 1]
      : undefined
  const prevIndex = prev ? doc.sections.findIndex((item) => item.id === prev.id) : -1
  const nextIndex = next ? doc.sections.findIndex((item) => item.id === next.id) : -1

  let body: ReactNode = null
  if (section.kind === 'summary') {
    body = edit.enabled ? (
      <EditableText
        as="div"
        className="cv-summary cv-summary-editing"
        value={doc.basics.summary}
        target={{ kind: 'basics-summary' }}
        placeholder="Write a short profile: your level, a proof point, and what you do next."
        multiline
        ariaLabel="Edit profile summary"
      />
    ) : (
      <div className="cv-summary">
        {doc.basics.summary
          .trim()
          .split(/\n{2,}/)
          .map((paragraph, paragraphIndex) => (
            <p key={paragraphIndex}>{renderInline(paragraph)}</p>
          ))}
      </div>
    )
  } else if (layout === 'tags' && (section.kind === 'skills' || section.kind === 'interests')) {
    body = <SkillGroups section={section} />
  } else if (layout === 'inline') {
    body = <InlineEntries section={section} />
  } else {
    const items = edit.enabled ? section.items : section.items.filter(entryHasContent)
    body = (
      <div className="cv-entries" data-layout={layout}>
        {items.map((entry) => (
          <CvEntry entry={entry} section={section} doc={doc} key={entry.id} />
        ))}
        {edit.enabled && (
          <AddRow
            label={`Add ${meta.singular.toLowerCase()}`}
            onClick={() => edit.action({ type: 'add-entry', sectionId: section.id })}
          />
        )}
      </div>
    )
  }

  return (
    <section
      className="cv-section"
      data-kind={section.kind as SectionKind}
      data-uppercase={style.section.uppercase}
      data-heading-case={style.typography.headingCase}
      data-section-id={section.id}
      data-section-index={index}
    >
      {edit.enabled && (
        <div className="cv-section-tools">
          <button
            type="button"
            className="cv-tool"
            title="Move section up"
            aria-label={`Move ${title} section up`}
            disabled={!prev}
            onClick={() => {
              if (prev) {
                edit.action({ type: 'move-section-to', sectionId: section.id, toIndex: prevIndex })
              }
            }}
          >
            <ArrowUp size={9} />
          </button>
          <button
            type="button"
            className="cv-tool"
            title="Move section down"
            aria-label={`Move ${title} section down`}
            disabled={!next}
            onClick={() => {
              if (next) {
                edit.action({ type: 'move-section-to', sectionId: section.id, toIndex: nextIndex })
              }
            }}
          >
            <ArrowDown size={9} />
          </button>
          <button
            type="button"
            className="cv-tool"
            title="Edit this section in the side panel"
            aria-label={`Open ${title} in the side panel`}
            onClick={() => edit.action({ type: 'open-panel', sectionId: section.id })}
          >
            <Pencil size={9} />
          </button>
          <button
            type="button"
            className="cv-tool"
            title="Remove this section"
            aria-label={`Remove ${title} section`}
            onClick={() => edit.action({ type: 'remove-section', sectionId: section.id })}
          >
            <X size={9} />
          </button>
        </div>
      )}
      <h2 className="cv-section-title" data-style={style.section.headingStyle}>
        {style.section.showIcons && <Icon className="cv-section-title-icon" aria-hidden="true" />}
        <EditableText
          as="span"
          value={section.title}
          target={{ kind: 'section-title', sectionId: section.id }}
          placeholder={meta.label}
          singleLine
          display={<span>{title}</span>}
          ariaLabel="Edit section title"
        />
      </h2>
      {body}
      {edit.enabled && (
        <div className="cv-section-tail">
          <button
            type="button"
            className="cv-section-tail-btn"
            title={`Add a section after ${title}`}
            onClick={() => edit.action({ type: 'add-section', afterSectionId: section.id })}
          >
            <Plus size={8} /> Section here
          </button>
        </div>
      )}
    </section>
  )
}

export function CvDocument({
  doc,
  className,
  fitScale = 1,
}: {
  doc: ResumeDoc
  className?: string
  fitScale?: number
}) {
  const dims = paperDimensions(doc.settings.paper)
  const edit = useCvEdit()
  const editing = edit.enabled
  const vars: CvVars = {
    ...cvStyleVars(doc.style),
    '--cv-page-width': `${dims.widthMm / fitScale}mm`,
    '--cv-page-height': `${dims.heightMm}mm`,
    '--cv-page-min-height': fitScale >= 0.999 ? `${dims.heightMm}mm` : '0mm',
    '--cv-fit-scale': fitScale,
  }

  const sections = doc.sections.filter(
    (section) => section.visible && (editing || sectionHasContent(section, doc.basics)),
  )
  const layout = doc.style.layout
  const sidebar = layout === 'sidebar-left' || layout === 'sidebar-right'
  const sidebarKinds = new Set<SectionKind>(doc.style.sidebarSections)
  const asideSections = sidebar ? sections.filter((section) => sidebarKinds.has(section.kind)) : []
  const mainSections = sidebar ? sections.filter((section) => !sidebarKinds.has(section.kind)) : sections

  return (
    <div
      className={cn('cv cv-root', className)}
      style={vars}
      data-numbered={doc.style.section.numbered}
      data-layout={layout}
      data-editing={editing}
    >
      {doc.style.customCss.trim() && <style>{scopedCustomCss(doc.style.customCss)}</style>}

      {sidebar ? (
        <div className="cv-page" data-layout={layout}>
          <aside className="cv-aside">
            <CvHeader doc={doc} variant="sidebar" />
            <div className="cv-body cv-sidebar-body">
              {asideSections.map((section, index) => (
                <CvSection
                  section={section}
                  doc={doc}
                  index={index}
                  siblings={asideSections}
                  key={section.id}
                />
              ))}
            </div>
          </aside>
          <main className="cv-main">
            <div className="cv-body cv-main-body">
              {mainSections.map((section, index) => (
                <CvSection
                  section={section}
                  doc={doc}
                  index={index}
                  siblings={mainSections}
                  key={section.id}
                />
              ))}
              <AddSectionRow />
            </div>
          </main>
        </div>
      ) : layout === 'header-band' ? (
        <div className="cv-page" data-layout="header-band">
          <div className="cv-band">
            <CvHeader doc={doc} />
          </div>
          <div className="cv-body cv-main-body">
            {mainSections.map((section, index) => (
              <CvSection
                section={section}
                doc={doc}
                index={index}
                siblings={mainSections}
                key={section.id}
              />
            ))}
            <AddSectionRow />
          </div>
        </div>
      ) : (
        <div className="cv-page" data-layout="single">
          <CvHeader doc={doc} />
          <div className="cv-body">
            {mainSections.map((section, index) => (
              <CvSection
                section={section}
                doc={doc}
                index={index}
                siblings={mainSections}
                key={section.id}
              />
            ))}
            <AddSectionRow />
          </div>
        </div>
      )}
    </div>
  )
}
