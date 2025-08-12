import { DndContext, type DragEndEvent } from '@dnd-kit/core'
import { useState, useEffect } from 'react'
import { useTaskStore } from '../store/tasks'
import { TaskCard } from '../components/TaskCard'
import { TaskCreationModal } from '../components/TaskCreationModal'
import type { ColumnKey, TaskItem } from '../types'

/**
 * Column definitions for the Kanban board.
 * The `key` maps to the `ColumnKey` used in the task store.
 */
const columns: { key: ColumnKey; name: string }[] = [
  { key: 'draft', name: 'Draft' },
  { key: 'refined', name: 'Refined' },
  { key: 'in_progress', name: 'In Progress' },
  { key: 'blocked', name: 'Blocked' },
  { key: 'completed', name: 'Completed' },
]

/**
 * Kanban board page.
 *
 * Displays task columns with inline editing support and a task creation modal.
 * Drag-and-drop behavior will be implemented in a later iteration.
 */
function Kanban() {
  const { tasks, columnOrder } = useTaskStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalDefaultStatus, setModalDefaultStatus] = useState<ColumnKey>('draft')

  /**
   * Handle global keyboard shortcuts.
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + N to open task creation modal
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        setModalDefaultStatus('draft')
        setIsModalOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  /**
   * Open the task creation modal with a specific column preselected.
   */
  const openCreateModal = (status: ColumnKey) => {
    setModalDefaultStatus(status)
    setIsModalOpen(true)
  }

  /**
   * Close the task creation modal.
   */
  const closeCreateModal = () => {
    setIsModalOpen(false)
  }

  /**
   * Handle task creation from the modal.
   */
  const handleTaskCreated = (task: TaskItem) => {
    // Task is automatically added to the store, so we just close the modal
    // unless it's "Create & Add Another" mode
    if (!task) {
      closeCreateModal()
    }
  }

  /**
   * Placeholder for handling drag end events.
   * Will be wired to move tasks within/between columns.
   */
  const onDragEnd = (_e: DragEndEvent) => {
    // Wire full DnD later
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Kanban</h2>
        <button
          onClick={() => openCreateModal('draft')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          + New Task
        </button>
      </div>

      <DndContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          {columns.map(({ key, name }) => (
            <div key={key} className="rounded-md border bg-gray-50 p-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-sm font-medium text-gray-700">{name}</div>
                <div className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
                  {columnOrder[key]?.length ?? 0}
                </div>
              </div>
              
              <div className="space-y-2 min-h-[100px]">
                {(columnOrder[key] ?? []).map((taskId) => {
                  const task = tasks[taskId]
                  if (!task) return null
                  
                  return <TaskCard key={taskId} task={task} />
                })}
                
                {/* Empty state */}
                {(!columnOrder[key] || columnOrder[key].length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-sm mb-2">No tasks yet</div>
                    <button
                      onClick={() => openCreateModal(key)}
                      className="text-blue-600 hover:text-blue-700 text-sm underline"
                    >
                      Add your first task
                    </button>
                  </div>
                )}
              </div>
              
              {/* Quick Add Button */}
              <div className="mt-3">
                <button
                  onClick={() => openCreateModal(key)}
                  className="w-full px-3 py-2 text-sm text-gray-600 border border-dashed border-gray-300 rounded-md hover:border-gray-400 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  + Quick Add
                </button>
              </div>
            </div>
          ))}
        </div>
      </DndContext>

      {/* Task Creation Modal */}
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

