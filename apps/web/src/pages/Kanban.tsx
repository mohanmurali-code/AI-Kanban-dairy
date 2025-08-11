import { DndContext, type DragEndEvent } from '@dnd-kit/core'
import { useState } from 'react'
import { useTaskStore } from '../store/tasks'
import type { ColumnKey } from '../types'

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
 * Displays task columns, quick-add inputs per column, and sets up a drag-and-drop
 * context. Drag-and-drop behavior will be implemented in a later iteration.
 */
function Kanban() {
  const { tasks, columnOrder, createTask } = useTaskStore()
  /** Local input state for quick task creation per column. */
  const [draftInput, setDraftInput] = useState<Record<ColumnKey, string>>({
    draft: '',
    refined: '',
    in_progress: '',
    blocked: '',
    completed: '',
  })

  /**
   * Create a new task in the given column if the input has a non-empty title.
   */
  const onAdd = (status: ColumnKey) => {
    const title = draftInput[status].trim()
    if (!title) return
    createTask({ title, status })
    setDraftInput((s) => ({ ...s, [status]: '' }))
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
      <h2 className="text-xl font-semibold">Kanban</h2>
      <DndContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          {columns.map(({ key, name }) => (
            <div key={key} className="rounded-md border p-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-sm font-medium opacity-80">{name}</div>
                <div className="text-xs opacity-60">{columnOrder[key]?.length ?? 0}</div>
              </div>
              <div className="space-y-2">
                {(columnOrder[key] ?? []).map((taskId) => {
                  const t = tasks[taskId]
                  return (
                    <div key={taskId} className="rounded-md border p-2 text-sm">
                      {t.title}
                    </div>
                  )
                })}
              </div>
              <div className="mt-3 flex gap-2">
                <input
                  className="w-full rounded-md border bg-transparent p-2 text-sm"
                  placeholder="Quick add"
                  value={draftInput[key]}
                  onChange={(e) => setDraftInput((s) => ({ ...s, [key]: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') onAdd(key)
                  }}
                />
                <button className="rounded-md border px-3 py-2 text-sm" onClick={() => onAdd(key)}>
                  Add
                </button>
              </div>
            </div>
          ))}
        </div>
      </DndContext>
    </div>
  )
}

export default Kanban

