import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TaskItem, ColumnKey } from '../types'

/**
 * Zustand task store state and actions.
 *
 * Maintains a normalized `tasks` map and a `columnOrder` index that lists task ids per status column.
 * The store is persisted to local storage for a lightweight, offline-friendly experience.
 */
interface TaskState {
  /** All tasks keyed by id. */
  tasks: Record<string, TaskItem>
  /** Ordered list of task ids per column. */
  columnOrder: Record<ColumnKey, string[]>
  /** Create a task with a title and initial status. */
  createTask: (partial: { title: string; status: ColumnKey }) => void
  /** Move a task within a column or to another column at an optional index. */
  moveTask: (taskId: string, toStatus: ColumnKey, toIndex?: number) => void
}

/** Default empty columns keyed by status. */
const defaultColumns: Record<ColumnKey, string[]> = {
  draft: [],
  refined: [],
  in_progress: [],
  blocked: [],
  completed: [],
}

/**
 * Global task store, persisted under the key `kanban-diary-tasks`.
 */
export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: {},
      columnOrder: defaultColumns,
      /**
       * Create a new task and prepend it to the target column.
       *
       * @param partial - `{ title, status }` for the new task.
       */
      createTask: ({ title, status }) => {
        const id = `tsk_${crypto.randomUUID()}`
        const now = new Date().toISOString()
        const newTask: TaskItem = {
          id,
          title,
          status,
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({
          tasks: { ...state.tasks, [id]: newTask },
          columnOrder: {
            ...state.columnOrder,
            [status]: [id, ...state.columnOrder[status]],
          },
        }))
      },
      /**
       * Move a task within the same column or across columns.
       *
       * @param taskId - Id of the task to move
       * @param toStatus - Target column key
       * @param toIndex - Optional insertion index in the target column (defaults to 0, i.e., prepend)
       */
      moveTask: (taskId, toStatus, toIndex) => {
        const state = get()
        const fromStatus = state.tasks[taskId].status
        // Remove the task from its current column list
        const fromList = state.columnOrder[fromStatus].filter((id) => id !== taskId)
        // If moving within the same column, base on the updated `fromList`, otherwise base on the target column
        const toListBase = fromStatus === toStatus ? fromList : state.columnOrder[toStatus]
        const insertAt = toIndex ?? 0
        const toList = [...toListBase.slice(0, insertAt), taskId, ...toListBase.slice(insertAt)]

        set(() => ({
          tasks: {
            ...state.tasks,
            [taskId]: { ...state.tasks[taskId], status: toStatus, updatedAt: new Date().toISOString() },
          },
          columnOrder: {
            ...state.columnOrder,
            [fromStatus]: fromList,
            [toStatus]: toList,
          },
        }))
      },
    }),
    { name: 'kanban-diary-tasks' },
  ),
)

