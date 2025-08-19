import { useState, useRef, useEffect, useCallback } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import type { TaskItem } from '../types'
import { useTaskStore } from '../store/tasks'

interface TaskCardProps {
  task: TaskItem
  className?: string
  compact?: boolean
  onEdit?: (task: TaskItem) => void
  onDelete?: (taskId: string) => void
  isDragging?: boolean
}

export function TaskCard({ task, className, onEdit, onDelete, isDragging = false }: TaskCardProps) {
  const { updateTask, deleteTask } = useTaskStore()
  const [editingField, setEditingField] = useState<'title' | 'priority' | 'dueDate' | 'tags' | null>(null)
  const [editValue, setEditValue] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [showActions, setShowActions] = useState(false)
  const [isOverdue, setIsOverdue] = useState(false)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const selectRef = useRef<HTMLSelectElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const saveTimeoutRef = useRef<number | undefined>(undefined)

  // Drag and drop functionality
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ 
    id: task.id,
    data: {
      type: 'task',
      task,
    }
  })

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
  }

  // Check if task is overdue
  useEffect(() => {
    if (task.dueDate) {
      const dueDate = new Date(task.dueDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      setIsOverdue(dueDate < today)
    }
  }, [task.dueDate])

  // Focus input when entering edit mode
  useEffect(() => {
    if (editingField) {
      if (editingField === 'priority' && selectRef.current) {
        selectRef.current.focus()
      } else if (inputRef.current) {
        inputRef.current.focus()
        inputRef.current.select()
      }
    }
  }, [editingField])

  // Auto-save functionality
  useEffect(() => {
    if (editingField && editValue !== getFieldValue(editingField)) {
      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      
      // Set new timeout for auto-save
      saveTimeoutRef.current = setTimeout(() => {
        saveChanges()
      }, 1000)
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [editValue, editingField])

  const getFieldValue = useCallback((field: 'title' | 'priority' | 'dueDate' | 'tags'): string => {
    switch (field) {
      case 'title':
        return task.title
      case 'priority':
        return task.priority || 'medium'
      case 'dueDate':
        return task.dueDate || ''
      case 'tags':
        return task.tags?.join(', ') || ''
      default:
        return ''
    }
  }, [task])

  const startEditing = (field: 'title' | 'priority' | 'dueDate' | 'tags') => {
    setEditingField(field)
    setEditValue(getFieldValue(field))
    setSaveError(null)
  }

  const saveChanges = async () => {
    if (!editingField) return

    try {
      setIsSaving(true)
      setSaveError(null)

      const updates: Partial<TaskItem> = {
        updatedAt: new Date().toISOString(),
      }

      switch (editingField) {
        case 'title':
          if (!editValue.trim()) {
            setSaveError('Title cannot be empty')
            return
          }
          updates.title = editValue.trim()
          break
        case 'priority':
          if (!['low', 'medium', 'high', 'critical'].includes(editValue)) {
            setSaveError('Invalid priority value')
            return
          }
          updates.priority = editValue as TaskItem['priority']
          break
        case 'dueDate':
          updates.dueDate = editValue || undefined
          break
        case 'tags':
          updates.tags = editValue
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0)
          break
      }

      await updateTask(task.id, updates)
      setEditingField(null)
      setEditValue('')
    } catch (error) {
      setSaveError('Failed to save changes')
      console.error('Error saving task:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const cancelEdit = () => {
    setEditingField(null)
    setEditValue('')
    setSaveError(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      saveChanges()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      cancelEdit()
    } else if (e.key === 'Tab') {
      // Allow normal tab navigation
      return
    }
  }

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow'
    } else if (date < today) {
      return 'Overdue'
    } else {
      return date.toLocaleDateString()
    }
  }

  const getPriorityColor = (priority: TaskItem['priority']) => {
    switch (priority) {
      case 'low': return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'medium': return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'high': return 'bg-orange-50 text-orange-700 border-orange-200'
      case 'critical': return 'bg-red-50 text-red-700 border-red-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const getPriorityIcon = (priority: TaskItem['priority']) => {
    switch (priority) {
      case 'low': return '🟢'
      case 'medium': return '🟡'
      case 'high': return '🟠'
      case 'critical': return '🔴'
      default: return '⚪'
    }
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTask(task.id)
      onDelete?.(task.id)
    }
  }

  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
        rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing
        ${isDragging || isSortableDragging ? 'shadow-lg scale-105 rotate-2 opacity-50' : ''}
        ${isOverdue ? 'border-red-300 bg-red-50 dark:bg-red-950/20' : ''}
        ${className || ''}
      `}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      role="article"
      aria-label={`Task: ${task.title}`}
    >
      {/* Drag Handle */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-6 h-6 flex items-center justify-center text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </div>
      </div>

      {/* Card Header with Priority Badge */}
      <div className="flex items-start justify-between p-4 pb-3">
        <div className="flex-1 min-w-0">
          {/* Priority Badge */}
          <div className="flex items-center gap-2 mb-2">
            {editingField === 'priority' ? (
              <div className="space-y-1">
                <select
                  ref={selectRef}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={saveChanges}
                  className="text-xs px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Edit priority"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            ) : (
              <button
                onClick={() => startEditing('priority')}
                className={`
                  inline-flex items-center gap-1 px-2 py-1 text-xs font-medium border rounded-full 
                  hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors 
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  ${getPriorityColor(task.priority || 'medium')}
                `}
                aria-label={`Edit priority: ${task.priority || 'medium'}`}
              >
                <span>{getPriorityIcon(task.priority || 'medium')}</span>
                <span className="capitalize">{task.priority || 'Medium'}</span>
              </button>
            )}
          </div>

          {/* Title Field */}
          {editingField === 'title' ? (
            <div className="space-y-2">
              <input
                ref={inputRef}
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={saveChanges}
                className="w-full text-sm font-semibold bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none px-0 py-1"
                placeholder="Enter task title"
                maxLength={200}
                aria-label="Edit task title"
              />
              {saveError && (
                <div className="text-xs text-red-600" role="alert">
                  {saveError}
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => startEditing('title')}
              className="text-left w-full font-semibold text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 rounded px-2 py-1 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={`Edit title: ${task.title}`}
            >
              {task.title}
            </button>
          )}
        </div>

        {/* Quick Actions */}
        {showActions && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit?.(task)}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-md transition-colors"
              aria-label="Edit task"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md transition-colors"
              aria-label="Delete task"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Description Preview */}
      {task.description && (
        <div className="px-4 pb-3">
          <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
            {task.description}
          </div>
        </div>
      )}

      {/* Due Date Field */}
      {task.dueDate && (
        <div className="px-4 pb-3">
          {editingField === 'dueDate' ? (
            <div className="space-y-2">
              <input
                ref={inputRef}
                type="date"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={saveChanges}
                className="text-xs px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Edit due date"
              />
              <button
                onClick={() => {
                  setEditValue('')
                  saveChanges()
                }}
                className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Clear date
              </button>
            </div>
          ) : (
            <button
              onClick={() => startEditing('dueDate')}
              className={`
                inline-flex items-center gap-1 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 
                rounded px-2 py-1 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500
                ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-600 dark:text-gray-400'}
              `}
              aria-label={`Edit due date: ${formatDueDate(task.dueDate)}`}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDueDate(task.dueDate)}
              {isOverdue && <span className="text-red-500">⚠️</span>}
            </button>
          )}
        </div>
      )}

      {/* Tags Field */}
      {task.tags && task.tags.length > 0 && (
        <div className="px-4 pb-3">
          {editingField === 'tags' ? (
            <div className="space-y-2">
              <input
                ref={inputRef}
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={saveChanges}
                className="text-xs px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                placeholder="Enter tags separated by commas"
                aria-label="Edit tags"
              />
            </div>
          ) : (
            <button
              onClick={() => startEditing('tags')}
              className="flex flex-wrap gap-1 hover:bg-gray-50 dark:hover:bg-gray-700 rounded p-1 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={`Edit tags: ${task.tags.join(', ')}`}
            >
              {task.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 rounded-full dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
                >
                  #{tag}
                </span>
              ))}
            </button>
          )}
        </div>
      )}

      {/* Save Status Indicator */}
      {isSaving && (
        <div className="px-4 pb-3">
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Saving...
          </div>
        </div>
      )}
      
      {saveError && (
        <div className="px-4 pb-3">
          <div className="text-xs text-red-600" role="alert">
            ❌ {saveError}
          </div>
        </div>
      )}

      {/* Task Metadata */}
      <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Created {new Date(task.createdAt).toLocaleDateString()}</span>
          <span className="font-mono">#{task.id.slice(0, 8)}</span>
        </div>
      </div>
    </div>
  )
}
