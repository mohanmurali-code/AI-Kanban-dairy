import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TaskItem, ColumnKey } from '../types'

interface TaskState {
  tasks: Record<string, TaskItem>
  columnOrder: Record<ColumnKey, string[]>
  createTask: (partial: { title: string; status: ColumnKey }) => void
  moveTask: (taskId: string, toStatus: ColumnKey, toIndex?: number) => void
}

const defaultColumns: Record<ColumnKey, string[]> = {
  draft: [],
  refined: [],
  in_progress: [],
  blocked: [],
  completed: [],
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: {},
      columnOrder: defaultColumns,
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
      moveTask: (taskId, toStatus, toIndex) => {
        const state = get()
        const fromStatus = state.tasks[taskId].status
        const fromList = state.columnOrder[fromStatus].filter((id) => id !== taskId)
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

