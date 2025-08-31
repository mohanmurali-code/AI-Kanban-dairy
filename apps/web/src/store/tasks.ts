import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TaskItem, ColumnKey } from '../types'

/**
 * Zustand task store state and actions.
 *
 * Maintains a normalized `tasks` map and a `columnOrder` index that lists task ids per status column.
 * The store is persisted to local storage and can export/import to JSON files.
 */
interface TaskState {
  /** All tasks keyed by id. */
  tasks: Record<string, TaskItem>
  /** Ordered list of task ids per column. */
  columnOrder: Record<ColumnKey, string[]>
  /** Create a task with comprehensive task data. */
  createTask: (partial: {
    title: string
    status: ColumnKey
    description?: string
    priority?: TaskItem['priority']
    dueDate?: string
    tags?: string[]
  }) => Promise<TaskItem>
  /** Update an existing task with partial data. */
  updateTask: (taskId: string, updates: Partial<TaskItem>) => Promise<void>
  /** Move a task within a column or to another column at an optional index. */
  moveTask: (taskId: string, toStatus: ColumnKey, toIndex?: number) => void
  /** Delete a task (soft delete - moves to archived state). */
  deleteTask: (taskId: string) => void
  /** Hard delete a task permanently. */
  hardDeleteTask: (taskId: string) => void
  /** Restore a deleted task. */
  restoreTask: (taskId: string) => void
  /** Get all tasks as an array, optionally filtered. */
  getAllTasks: (filters?: TaskFilters) => TaskItem[]
  /** Export all data to JSON format. */
  exportData: () => string
  /** Import data from JSON format. */
  importData: (jsonData: string) => Promise<void>
  /** Clear all data. */
  clearAllData: () => void
  /** Ensure all tasks have priority values set. */
  ensureTaskPriorities: () => void
  /** Get task statistics. */
  getTaskStats: () => TaskStats
}

/** Task filtering options. */
export interface TaskFilters {
  status?: ColumnKey[]
  priority?: TaskItem['priority'][]
  tags?: string[]
  search?: string
  dueDate?: {
    from?: string
    to?: string
  }
  showArchived?: boolean
}

/** Task statistics. */
export interface TaskStats {
  total: number
  byStatus: Record<ColumnKey, number>
  byPriority: Record<NonNullable<TaskItem['priority']>, number>
  overdue: number
  dueToday: number
  dueThisWeek: number
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

// Function to ensure all tasks have priority values set
const ensureTaskPriorities = (tasks: Record<string, TaskItem>) => {
  let hasChanges = false
  const updatedTasks = { ...tasks }
  
  // Ensure all existing tasks have priority values set
  // This fixes the issue where tasks created before priority was required
  // would show as gray instead of their intended priority color
  Object.values(updatedTasks).forEach((task) => {
    if (!task.priority) {
      updatedTasks[task.id] = {
        ...task,
        priority: 'medium',
        updatedAt: new Date().toISOString()
      }
      hasChanges = true
    }
  })
  
  return hasChanges ? updatedTasks : null
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => {
      return {
        tasks: {},
        columnOrder: defaultColumns,
        
        /**
         * Create a new task and prepend it to the target column.
         *
         * @param partial - Task data including title, status, and optional fields.
         * @returns Promise resolving to the created task.
         */
        createTask: async ({ title, status, description, priority, dueDate, tags }) => {
          const id = `tsk_${crypto.randomUUID()}`
          const now = new Date().toISOString()
          const newTask: TaskItem = {
            id,
            title,
            description,
            status,
            priority: priority || 'medium',
            dueDate,
            tags: tags || [],
            createdAt: now,
            updatedAt: now,
            archived: false,
          }
          
          set((state) => ({
            tasks: { ...state.tasks, [id]: newTask },
            columnOrder: {
              ...state.columnOrder,
              [status]: [id, ...state.columnOrder[status]],
            },
          }))
          
          return newTask
        },

        /**
         * Update an existing task with partial data.
         *
         * @param taskId - ID of the task to update.
         * @param updates - Partial task data to update.
         */
        updateTask: async (taskId, updates) => {
          const state = get()
          const existingTask = state.tasks[taskId]
          
          if (!existingTask) {
            throw new Error(`Task with ID ${taskId} not found`)
          }
          
          const updatedTask: TaskItem = {
            ...existingTask,
            ...updates,
            updatedAt: new Date().toISOString(),
          }
          
          set((state) => ({
            tasks: {
              ...state.tasks,
              [taskId]: updatedTask,
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

        /**
         * Soft delete a task (mark as archived).
         *
         * @param taskId - ID of the task to delete.
         */
        deleteTask: (taskId) => {
          const state = get()
          const task = state.tasks[taskId]
          
          if (!task) {
            throw new Error(`Task with ID ${taskId} not found`)
          }

          // Remove from column order
          const fromList = state.columnOrder[task.status].filter((id) => id !== taskId)
          
          set((state) => ({
            tasks: {
              ...state.tasks,
              [taskId]: { ...task, archived: true, updatedAt: new Date().toISOString() },
            },
            columnOrder: {
              ...state.columnOrder,
              [task.status]: fromList,
            },
          }))
        },

        /**
         * Hard delete a task permanently.
         *
         * @param taskId - ID of the task to permanently delete.
         */
        hardDeleteTask: (taskId) => {
          const state = get()
          const task = state.tasks[taskId]
          
          if (!task) {
            throw new Error(`Task with ID ${taskId} not found`)
          }

          // Remove from column order if not already archived
          const newColumnOrder = { ...state.columnOrder }
          if (!task.archived) {
            newColumnOrder[task.status] = newColumnOrder[task.status].filter((id) => id !== taskId)
          }

          // Remove from tasks
          const newTasks = { ...state.tasks }
          delete newTasks[taskId]

          set(() => ({
            tasks: newTasks,
            columnOrder: newColumnOrder,
          }))
        },

        /**
         * Restore a deleted task.
         *
         * @param taskId - ID of the task to restore.
         */
        restoreTask: (taskId) => {
          const state = get()
          const task = state.tasks[taskId]
          
          if (!task) {
            throw new Error(`Task with ID ${taskId} not found`)
          }

          if (!task.archived) {
            throw new Error(`Task with ID ${taskId} is not archived`)
          }

          // Add back to column order
          set((state) => ({
            tasks: {
              ...state.tasks,
              [taskId]: { ...task, archived: false, updatedAt: new Date().toISOString() },
            },
            columnOrder: {
              ...state.columnOrder,
              [task.status]: [taskId, ...state.columnOrder[task.status]],
            },
          }))
        },

        /**
         * Get all tasks as an array, optionally filtered.
         *
         * @param filters - Optional filters to apply.
         * @returns Array of filtered tasks.
         */
        getAllTasks: (filters?: TaskFilters) => {
          const state = get()
          
          // Ensure all tasks have priority values before returning
          const updatedTasks = ensureTaskPriorities(state.tasks)
          if (updatedTasks) {
            set(() => ({ tasks: updatedTasks }))
            // Use updated tasks for filtering
            state.tasks = updatedTasks
          }
          
          let tasks = Object.values(state.tasks)

          // Apply filters
          if (filters) {
            if (filters.status && filters.status.length > 0) {
              tasks = tasks.filter(task => filters.status!.includes(task.status))
            }

            if (filters.priority && filters.priority.length > 0) {
              tasks = tasks.filter(task => task.priority && filters.priority!.includes(task.priority))
            }

            if (filters.tags && filters.tags.length > 0) {
              tasks = tasks.filter(task => 
                task.tags && filters.tags!.some(tag => task.tags!.includes(tag))
              )
            }

            if (filters.search) {
              const searchLower = filters.search.toLowerCase()
              tasks = tasks.filter(task => 
                task.title.toLowerCase().includes(searchLower) ||
                (task.description && task.description.toLowerCase().includes(searchLower)) ||
                (task.tags && task.tags.some(tag => tag.toLowerCase().includes(searchLower)))
              )
            }

            if (filters.dueDate) {
              if (filters.dueDate.from) {
                tasks = tasks.filter(task => task.dueDate && task.dueDate >= filters.dueDate!.from!)
              }
              if (filters.dueDate.to) {
                tasks = tasks.filter(task => task.dueDate && task.dueDate <= filters.dueDate!.to!)
              }
            }

            if (!filters.showArchived) {
              tasks = tasks.filter(task => !task.archived)
            }
          } else {
            // Default: don't show archived tasks
            tasks = tasks.filter(task => !task.archived)
          }

          return tasks.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        },

        /**
         * Export all data to JSON format.
         *
         * @returns JSON string containing all task data.
         */
        exportData: () => {
          const state = get()
          const exportData = {
            version: '1.0',
            exportedAt: new Date().toISOString(),
            tasks: state.tasks,
            columnOrder: state.columnOrder,
          }
          return JSON.stringify(exportData, null, 2)
        },

        /**
         * Import data from JSON format.
         *
         * @param jsonData - JSON string containing task data.
         */
        importData: async (jsonData: string) => {
          try {
            const data = JSON.parse(jsonData)
            
            // Validate data structure
            if (!data.tasks || !data.columnOrder) {
              throw new Error('Invalid data format: missing tasks or columnOrder')
            }

            // Validate tasks
            const tasks = data.tasks
            for (const [id, task] of Object.entries(tasks)) {
              if (typeof task === 'object' && task !== null && 'title' in task && 'status' in task) {
                // Task is valid
              } else {
                throw new Error(`Invalid task format for task ${id}`)
              }
            }

            // Validate column order
            const columnOrder = data.columnOrder
            const validColumns: ColumnKey[] = ['draft', 'refined', 'in_progress', 'blocked', 'completed']
            for (const column of validColumns) {
              if (!Array.isArray(columnOrder[column])) {
                throw new Error(`Invalid column order for column ${column}`)
              }
            }

            set(() => ({
              tasks,
              columnOrder,
            }))
          } catch (error) {
            throw new Error(`Failed to import data: ${error instanceof Error ? error.message : 'Unknown error'}`)
          }
        },

        /**
         * Clear all data.
         */
        clearAllData: () => {
          set(() => ({
            tasks: {},
            columnOrder: defaultColumns,
          }))
        },

        /**
         * Ensure all tasks have priority values set.
         */
        ensureTaskPriorities: () => {
          const state = get()
          let hasChanges = false
          const updatedTasks = { ...state.tasks }
          
          Object.values(updatedTasks).forEach((task) => {
            if (!task.priority) {
              updatedTasks[task.id] = {
                ...task,
                priority: 'medium',
                updatedAt: new Date().toISOString()
              }
              hasChanges = true
            }
          })
          
          if (hasChanges) {
            set(() => ({ tasks: updatedTasks }))
          }
        },

        /**
         * Get task statistics.
         *
         * @returns Task statistics object.
         */
        getTaskStats: () => {
          const state = get()
          const tasks = Object.values(state.tasks).filter(task => !task.archived)
          const now = new Date()
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)

          const stats: TaskStats = {
            total: tasks.length,
            byStatus: {
              draft: 0,
              refined: 0,
              in_progress: 0,
              blocked: 0,
              completed: 0,
            },
            byPriority: {
              low: 0,
              medium: 0,
              high: 0,
              critical: 0,
            },
            overdue: 0,
            dueToday: 0,
            dueThisWeek: 0,
          }

          tasks.forEach(task => {
            // Count by status
            stats.byStatus[task.status]++

            // Count by priority
            if (task.priority) {
              stats.byPriority[task.priority]++
            }

            // Count due dates
            if (task.dueDate) {
              const dueDate = new Date(task.dueDate)
              const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate())
              
              if (dueDateOnly < today) {
                stats.overdue++
              } else if (dueDateOnly.getTime() === today.getTime()) {
                stats.dueToday++
              } else if (dueDateOnly <= weekFromNow) {
                stats.dueThisWeek++
              }
            }
          })

          return stats
        },
      }
    },
    { 
      name: 'kanban-diary-tasks',
      onRehydrateStorage: () => (state) => {
        if (state) {
          const updatedTasks = ensureTaskPriorities(state.tasks)
          if (updatedTasks) {
            state.tasks = updatedTasks
          }
        }
      }
    },
  ),
)

