import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from '@hello-pangea/dnd'
import { Eye, EyeOff, GripVertical, HardDrive, Plus, UserRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Menu, MenuItem, MenuLabel } from '@/components/ui/Menu'
import { useDocStore } from '@/store/docStore'
import { SECTIONS_ADDABLE } from '@/lib/sectionMeta'
import { SECTION_META } from '@/lib/sectionMeta'

export function SectionsRail({
  selected,
  onSelect,
}: {
  selected: string
  onSelect: (id: string) => void
}) {
  const doc = useDocStore((state) => state.doc)
  const toggleSection = useDocStore((state) => state.toggleSection)
  const addSection = useDocStore((state) => state.addSection)
  const moveSectionTo = useDocStore((state) => state.moveSectionTo)
  const [axis, setAxis] = useState<'vertical' | 'horizontal'>('vertical')

  useEffect(() => {
    const query = window.matchMedia('(min-width: 768px)')
    const update = () => setAxis(query.matches ? 'vertical' : 'horizontal')
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  if (!doc) return null
  const hasSummary = doc.sections.some((section) => section.kind === 'summary')

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return
    if (result.destination.index === result.source.index) return
    moveSectionTo(result.draggableId, result.destination.index)
  }

  return (
    <aside className="hide-scrollbar flex shrink-0 gap-1 overflow-x-auto border-b border-line bg-surface p-2 md:w-[218px] md:flex-col md:overflow-x-visible md:overflow-y-auto md:border-r md:border-b-0 md:p-3">
      <div className="hidden px-2 pt-1 pb-2 md:block">
        <span className="text-[10px] font-semibold tracking-[0.12em] text-faint uppercase">
          Sections
        </span>
      </div>

      <div
        className={`group flex shrink-0 items-center rounded-md transition-colors ${
          selected === 'header' ? 'bg-accent-soft' : 'hover:bg-surface-muted'
        }`}
      >
        <button
          type="button"
          onClick={() => onSelect('header')}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-2.5 py-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-accent/25"
          aria-current={selected === 'header' ? 'true' : undefined}
        >
          <UserRound
            size={14}
            className={selected === 'header' ? 'text-accent' : 'text-muted'}
          />
          <span
            className={`truncate text-[12px] ${
              selected === 'header' ? 'font-medium text-accent' : 'text-ink-soft'
            }`}
          >
            Header
          </span>
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="editor-sections-rail" direction={axis}>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex shrink-0 gap-1 md:w-full md:flex-col"
            >
              {doc.sections.map((section, index) => {
                const meta = SECTION_META[section.kind]
                const Icon = meta.icon
                const active = selected === section.id
                const label = section.title.trim() || meta.label
                return (
                  <Draggable key={section.id} draggableId={section.id} index={index}>
                    {(dragProvided, snapshot) => (
                      <div
                        ref={dragProvided.innerRef}
                        {...dragProvided.draggableProps}
                        className={`group flex shrink-0 items-center rounded-md transition-colors ${
                          snapshot.isDragging
                            ? 'z-10 bg-surface shadow-float ring-1 ring-accent/40'
                            : active
                              ? 'bg-accent-soft'
                              : 'hover:bg-surface-muted'
                        }`}
                      >
                        <button
                          type="button"
                          {...dragProvided.dragHandleProps}
                          className="grid size-5 shrink-0 cursor-grab place-items-center rounded text-muted transition-colors hover:bg-surface hover:text-ink active:cursor-grabbing touch-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/25"
                          aria-label={`Reorder ${label}`}
                          title="Drag to reorder"
                          onClick={() => onSelect(section.id)}
                        >
                          <GripVertical size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onSelect(section.id)}
                          className="flex min-w-0 flex-1 items-center gap-2 rounded-md py-2 pr-1 pl-1.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-accent/25"
                          aria-current={active ? 'true' : undefined}
                        >
                          <Icon size={14} className={active ? 'text-accent' : 'text-muted'} />
                          <span
                            className={`min-w-0 flex-1 truncate text-[12px] ${
                              active
                                ? 'font-medium text-accent'
                                : section.visible
                                  ? 'text-ink-soft'
                                  : 'text-faint line-through'
                            }`}
                          >
                            {label}
                          </span>
                          {section.kind !== 'summary' && (
                            <span className="hidden text-[10px] text-faint tabular md:block">
                              {section.items.length}
                            </span>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleSection(section.id)}
                          className={`mr-1 grid size-6 shrink-0 place-items-center rounded text-faint transition-colors hover:bg-surface hover:text-ink ${
                            active || !section.visible
                              ? 'opacity-100'
                              : 'opacity-100 md:opacity-0 md:group-hover:opacity-100'
                          }`}
                          aria-label={section.visible ? `Hide ${label}` : `Show ${label}`}
                          title={section.visible ? 'Hide from CV' : 'Show in CV'}
                        >
                          {section.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                        </button>
                      </div>
                    )}
                  </Draggable>
                )
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <div className="shrink-0 md:mt-1">
        <Menu
          align="start"
          trigger={
            <Button
              variant="secondary"
              size="sm"
              className="w-full justify-start border-dashed text-muted"
            >
              <Plus size={13} /> Add section
            </Button>
          }
        >
          <MenuLabel>Add a section</MenuLabel>
          {SECTIONS_ADDABLE.map((kind) => {
            const meta = SECTION_META[kind]
            const Icon = meta.icon
            return (
              <MenuItem
                key={kind}
                icon={<Icon size={14} />}
                disabled={kind === 'summary' && hasSummary}
                onSelect={() => onSelect(addSection(kind))}
              >
                {meta.label}
              </MenuItem>
            )
          })}
        </Menu>
      </div>

      <div className="mt-auto hidden items-center gap-2 border-t border-line px-2 pt-3 pb-1 text-[10px] text-faint md:flex">
        <HardDrive size={12} />
        Saved on this device
      </div>
    </aside>
  )
}
