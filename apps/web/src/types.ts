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
  /** Whether the task is archived (soft deleted). */
  archived?: boolean
}

/**
 * Normalized note entity stored in the notes store.
 */
export interface NoteItem {
  /** Unique identifier (prefixed with `note_`). */
  id: string
  /** Note title. */
  title: string
  /** Rich text content with markdown support. */
  content: string
  /** Optional categories for organization. */
  categories?: string[]
  /** Optional tags for filtering and grouping. */
  tags?: string[]
  /** Optional template type used for this note. */
  template?: 'daily_journal' | 'meeting_notes' | 'idea' | 'todo' | 'custom'
  /** Optional linked task IDs. */
  linkedTasks?: string[]
  /** Optional linked note IDs. */
  linkedNotes?: string[]
  /** ISO timestamp when the note was created. */
  createdAt: string
  /** ISO timestamp for the last update. */
  updatedAt: string
  /** Whether the note is archived (soft deleted). */
  archived?: boolean
  /** Auto-save status indicator. */
  isSaving?: boolean
  /** Last auto-save timestamp. */
  lastSaved?: string
}

/**
 * Note filtering options.
 */
export interface NoteFilters {
  categories?: string[]
  tags?: string[]
  template?: NoteItem['template']
  search?: string
  linkedTask?: string
  linkedNote?: string
  showArchived?: boolean
  dateRange?: {
    from?: string
    to?: string
  }
}

/**
 * Note statistics.
 */
export interface NoteStats {
  total: number
  byCategory: Record<string, number>
  byTemplate: Record<string, number>
  archived: number
  createdThisWeek: number
  updatedThisWeek: number
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

/**
 * Note template configuration.
 */
export interface NoteTemplate {
  id: string
  name: string
  description: string
  content: string
  category?: string
  tags?: string[]
}


