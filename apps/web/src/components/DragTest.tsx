import { 
  DndContext, 
  type DragEndEvent, 
  type DragStartEvent,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core'
import { 
  SortableContext, 
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'

interface TestItem {
  id: string
  title: string
}

const TestCard = ({ item }: { item: TestItem }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
  }

  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        p-4 bg-white border border-gray-200 rounded-lg shadow-sm cursor-grab active:cursor-grabbing
        ${isDragging ? 'opacity-50' : ''}
      `}
    >
      {item.title}
    </div>
  )
}

export function DragTest() {
  const [items, setItems] = useState<TestItem[]>([
    { id: '1', title: 'Task 1' },
    { id: '2', title: 'Task 2' },
    { id: '3', title: 'Task 3' },
  ])
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    console.log('Test drag start:', event.active.id)
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    console.log('Test drag end:', { activeId: active.id, overId: over?.id })
    setActiveId(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    if (activeId === overId) return

    const oldIndex = items.findIndex(item => item.id === activeId)
    const newIndex = items.findIndex(item => item.id === overId)

    if (oldIndex !== -1 && newIndex !== -1) {
      const newItems = [...items]
      const [movedItem] = newItems.splice(oldIndex, 1)
      newItems.splice(newIndex, 0, movedItem)
      setItems(newItems)
    }
  }

  const activeItem = activeId ? items.find(item => item.id === activeId) : null

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Drag and Drop Test</h2>
      <p className="mb-4 text-gray-600">Try dragging the cards below to test if drag and drop is working:</p>
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={items.map(item => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2 max-w-md">
            {items.map((item) => (
              <TestCard key={item.id} item={item} />
            ))}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeItem ? (
            <div className="p-4 bg-blue-100 border border-blue-300 rounded-lg shadow-lg">
              {activeItem.title}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
