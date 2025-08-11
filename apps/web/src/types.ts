/**
 * Canonical set of status column keys used across the application.
 */
export type ColumnKey = 'draft' | 'refined' | 'in_progress' | 'blocked' | 'completed'

/**
 * Normalized task entity stored in the task store.
 */
export interface TaskItem {
  /** Unique identifier (prefixed with `tsk_`). */
  id: string
  /** Short, human-readable title. */
  title: string
  /** Optional longer description or notes. */
  description?: string
  /** Current workflow status (column key). */
  status: ColumnKey
  /** Optional priority level. */
  priority?: 'low' | 'medium' | 'high' | 'critical'
  /** Optional ISO date string for due date. */
  dueDate?: string
  /** Optional tags for filtering and grouping. */
  tags?: string[]
  /** ISO timestamp when the task was created. */
  createdAt: string
  /** ISO timestamp for the last update. */
  updatedAt: string
}

/**
 * Configuration for a Kanban column.
 */
export interface ColumnConfig {
  key: ColumnKey
  /** Display name shown in the UI. */
  name: string
  /** Hex or CSS color token for column accenting. */
  color: string
  /** Work-in-progress limit for the column. */
  wipLimit: number
}


