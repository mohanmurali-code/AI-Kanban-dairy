import { 
  DndContext, 
  type DragEndEvent, 
  type DragStartEvent,
  type DragOverEvent,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core'
import { 
  SortableContext, 
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { 
  useDroppable,
} from '@dnd-kit/core'
import { useState, useEffect, useMemo } from 'react'
import { useTaskStore } from '../store/tasks'
import { TaskCard } from '../components/TaskCard'
import { TaskCreationModal } from '../components/TaskCreationModal'
import { DragTest } from '../components/DragTest'
import type { ColumnKey, TaskItem } from '../types'

// Column Drop Zone Component
function ColumnDropZone({ columnKey, children }: { columnKey: ColumnKey; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${columnKey}`,
    data: {
      type: 'column',
      columnKey,
    }
  })

  return (
    <div 
      ref={setNodeRef}
      className={`min-h-[400px] transition-colors duration-200 ${
        isOver ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600' : ''
      }`}
    >
      {children}
    </div>
  )
}

/**
 * Column definitions for the Kanban board.
 * The `key` maps to the `ColumnKey` used in the task store.
 */
const columns: { key: ColumnKey; name: string; color: string; bgColor: string; borderColor: string }[] = [
  { 
    key: 'draft', 
    name: 'Draft', 
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-50 dark:bg-gray-800/50',
    borderColor: 'border-gray-200 dark:border-gray-700'
  },
  { 
    key: 'refined', 
    name: 'Refined', 
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800'
  },
  { 
    key: 'in_progress', 
    name: 'In Progress', 
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    borderColor: 'border-purple-200 dark:border-purple-800'
  },
  { 
    key: 'blocked', 
    name: 'Blocked', 
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800'
  },
  { 
    key: 'completed', 
    name: 'Completed', 
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-800'
  },
]

/**
 * Kanban board page.
 *
 * Displays task columns with inline editing support and a task creation modal.
 * Enhanced with statistics, better task management, and improved visual feedback.
 */
function Kanban() {
  const { tasks, columnOrder, getTaskStats, moveTask } = useTaskStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalDefaultStatus, setModalDefaultStatus] = useState<ColumnKey>('draft')
  const [showStats, setShowStats] = useState(true)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [showTest, setShowTest] = useState(true) // Changed from false to true for debugging

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // Very small distance for easier activation
        delay: 100, // Small delay to prevent accidental drags
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Get task statistics
  const stats = useMemo(() => getTaskStats(), [getTaskStats])

  // Global shortcut: Ctrl/Cmd+N opens creation modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault()
        setModalDefaultStatus('draft')
        setIsModalOpen(true)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const openCreateModal = (status: ColumnKey) => {
    setModalDefaultStatus(status)
    setIsModalOpen(true)
  }

  const closeCreateModal = () => {
    setIsModalOpen(false)
  }

  const handleTaskCreated = (_task: TaskItem) => {
    // Store already updated by create; modal close handled by modal unless add-another
  }

  // Drag and drop handlers
  const handleDragStart = (event: DragStartEvent) => {
    console.log('Drag start:', event.active.id)
    setActiveId(event.active.id as string)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    console.log('Drag over:', { activeId, overId })

    // Check if dropping on a column
    if (overId.startsWith('column-')) {
      const targetColumn = overId.replace('column-', '') as ColumnKey
      const activeColumn = Object.entries(columnOrder).find(([_, taskIds]) => 
        taskIds.includes(activeId)
      )?.[0] as ColumnKey

      if (activeColumn && targetColumn && activeColumn !== targetColumn) {
        console.log('Moving task to column:', { activeColumn, targetColumn })
        // Move task to the end of the target column
        const targetTaskIds = columnOrder[targetColumn] || []
        moveTask(activeId, targetColumn, targetTaskIds.length)
      }
      return
    }

    // Check if dropping on a task
    const activeColumn = Object.entries(columnOrder).find(([_, taskIds]) => 
      taskIds.includes(activeId)
    )?.[0] as ColumnKey

    const overColumn = Object.entries(columnOrder).find(([_, taskIds]) => 
      taskIds.includes(overId)
    )?.[0] as ColumnKey

    if (activeColumn && overColumn && activeColumn !== overColumn) {
      console.log('Moving task between columns:', { activeColumn, overColumn })
      // Move task to different column
      const overTaskIds = columnOrder[overColumn] || []
      const overIndex = overTaskIds.indexOf(overId)
      
      // Use the store's moveTask function
      moveTask(activeId, overColumn, overIndex !== -1 ? overIndex : 0)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    console.log('Drag end:', { activeId: active.id, overId: over?.id })
    
    setActiveId(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    if (activeId === overId) return

    // Check if dropping on a column
    if (overId.startsWith('column-')) {
      const targetColumn = overId.replace('column-', '') as ColumnKey
      const activeColumn = Object.entries(columnOrder).find(([_, taskIds]) => 
        taskIds.includes(activeId)
      )?.[0] as ColumnKey

      if (activeColumn && targetColumn && activeColumn !== targetColumn) {
        console.log('Moving task to column:', { activeColumn, targetColumn })
        // Move task to the end of the target column
        const targetTaskIds = columnOrder[targetColumn] || []
        moveTask(activeId, targetColumn, targetTaskIds.length)
      }
      return
    }

    // Check if dropping on a task
    const activeColumn = Object.entries(columnOrder).find(([_, taskIds]) => 
      taskIds.includes(activeId)
    )?.[0] as ColumnKey

    const overColumn = Object.entries(columnOrder).find(([_, taskIds]) => 
      taskIds.includes(overId)
    )?.[0] as ColumnKey

    if (activeColumn && overColumn) {
      if (activeColumn === overColumn) {
        // Reordering within the same column
        const taskIds = columnOrder[activeColumn] || []
        const oldIndex = taskIds.indexOf(activeId)
        const newIndex = taskIds.indexOf(overId)

        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
          console.log('Reordering within column:', { activeColumn, oldIndex, newIndex })
          moveTask(activeId, activeColumn, newIndex)
        }
      } else {
        // Moving between columns
        console.log('Moving task between columns:', { activeColumn, overColumn })
        const overTaskIds = columnOrder[overColumn] || []
        const overIndex = overTaskIds.indexOf(overId)
        moveTask(activeId, overColumn, overIndex !== -1 ? overIndex : 0)
      }
    }
  }

  const getColumnStats = (columnKey: ColumnKey) => {
    const columnTasks = columnOrder[columnKey] || []
    const activeTasks = columnTasks.filter(taskId => {
      const task = tasks[taskId]
      return task && !task.archived
    })
    
    return {
      total: activeTasks.length,
      overdue: activeTasks.filter(taskId => {
        const task = tasks[taskId]
        return task?.dueDate && new Date(task.dueDate) < new Date()
      }).length,
      highPriority: activeTasks.filter(taskId => {
        const task = tasks[taskId]
        return task?.priority === 'high' || task?.priority === 'critical'
      }).length,
    }
  }

  const activeTask = activeId ? tasks[activeId] : null

  // Show test component if flag is set
  if (showTest) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Debug: Drag and Drop Test</h2>
          <button
            onClick={() => setShowTest(false)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Kanban
          </button>
        </div>
        <DragTest />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Kanban Board</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Organize and track your tasks with drag and drop</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowTest(true)}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Test DnD
          </button>
          <button
            onClick={() => setShowStats(!showStats)}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {showStats ? 'Hide' : 'Show'} Stats
          </button>
          <button
            onClick={() => openCreateModal('draft')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
          >
            + New Task
          </button>
        </div>
      </div>

      {/* Statistics Overview */}
      {showStats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {columns.map(({ key, name, color, bgColor }) => {
            const columnStats = getColumnStats(key)
            return (
              <div key={key} className={`${bgColor} p-4 rounded-xl border border-gray-200 dark:border-gray-700`}>
                <div className={`text-sm font-medium ${color} mb-1`}>{name}</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{columnStats.total}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {columnStats.overdue > 0 && (
                    <span className="text-red-600 mr-2">{columnStats.overdue} overdue</span>
                  )}
                  {columnStats.highPriority > 0 && (
                    <span className="text-orange-600">{columnStats.highPriority} high priority</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Overall Statistics */}
      {showStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</div>
            <div className="text-sm text-blue-600 dark:text-blue-400">Total Tasks</div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-4 rounded-xl border border-red-200 dark:border-red-800">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.overdue}</div>
            <div className="text-sm text-red-600 dark:text-red-400">Overdue</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 p-4 rounded-xl border border-yellow-200 dark:border-yellow-800">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.dueToday}</div>
            <div className="text-sm text-yellow-600 dark:text-yellow-400">Due Today</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.byStatus.completed}</div>
            <div className="text-sm text-green-600 dark:text-green-400">Completed</div>
          </div>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
          {columns.map(({ key, name, color, bgColor, borderColor }) => {
            const columnStats = getColumnStats(key)
            const columnTasks = (columnOrder[key] ?? []).filter(taskId => {
              const task = tasks[taskId]
              return task && !task.archived
            })

            return (
              <div key={key} className={`rounded-xl border-2 ${borderColor} ${bgColor} p-4 min-h-[600px]`}>
                {/* Column Header */}
                <div className="mb-4 flex items-center justify-between">
                  <div className={`text-lg font-semibold ${color}`}>{name}</div>
                  <div className="flex items-center gap-2">
                    {columnStats.overdue > 0 && (
                      <div className="text-xs text-red-600 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded-full font-medium">
                        {columnStats.overdue} overdue
                      </div>
                    )}
                    <div className="text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded-full font-medium">
                      {columnTasks.length}
                    </div>
                  </div>
                </div>

                {/* Tasks Container */}
                <SortableContext 
                  items={columnTasks}
                  strategy={verticalListSortingStrategy}
                >
                  <ColumnDropZone columnKey={key}>
                    <div className="space-y-3 min-h-[400px]">
                      {columnTasks.map((taskId) => {
                        const task = tasks[taskId]
                        if (!task) return null
                        return (
                          <TaskCard 
                            key={taskId} 
                            task={task}
                            isDragging={activeId === taskId}
                          />
                        )
                      })}

                      {/* Empty state */}
                      {columnTasks.length === 0 && (
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                          <div className="text-4xl mb-3">📝</div>
                          <div className="text-sm mb-2">No tasks yet</div>
                          <button
                            onClick={() => openCreateModal(key)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm underline font-medium"
                          >
                            Add your first task
                          </button>
                        </div>
                      )}
                    </div>
                  </ColumnDropZone>
                </SortableContext>

                {/* Quick Add Button */}
                <div className="mt-4">
                  <button
                    onClick={() => openCreateModal(key)}
                    className="w-full px-4 py-3 text-sm text-gray-600 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors font-medium"
                  >
                    + Quick Add Task
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Drag Overlay */}
        <DragOverlay
          dropAnimation={{
            sideEffects: defaultDropAnimationSideEffects({
              styles: {
                active: {
                  opacity: '0.5',
                },
              },
            }),
          }}
        >
          {activeTask ? (
            <TaskCard 
              task={activeTask}
              isDragging={true}
              className="w-80"
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      <TaskCreationModal
        isOpen={isModalOpen}
        onClose={closeCreateModal}
        defaultStatus={modalDefaultStatus}
        onTaskCreated={handleTaskCreated}
      />
    </div>
  )
}

export default Kanban

