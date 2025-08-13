import { useState, useRef, useEffect } from 'react'
import type { TaskItem } from '../types'
import { useTaskStore } from '../store/tasks'

interface TaskCardProps {
  task: TaskItem
  className?: string // Optional for theme overrides or extra styling
}

export function TaskCard({ task, className }: TaskCardProps) {
  const { updateTask } = useTaskStore()
  const [editingField, setEditingField] = useState<'title' | 'priority' | 'dueDate' | 'tags' | null>(null)
  const [editValue, setEditValue] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when entering edit mode
  useEffect(() => {
    if (editingField && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editingField])

  const startEditing = (field: 'title' | 'priority' | 'dueDate' | 'tags') => {
    setEditingField(field)
    setEditValue(getFieldValue(field))
    setSaveError(null)
  }

  const getFieldValue = (field: 'title' | 'priority' | 'dueDate' | 'tags'): string => {
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

  // Priority badge can use .badge and a data-priority attribute for future theme extensions

  return (
    <div className={`card${className ? ` ${className}` : ''}`}>
      {/* Title Field */}
  <div className="mb-2">
        {editingField === 'title' ? (
          <div className="space-y-2">
            <input
              ref={inputRef}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="ui-input"
              placeholder="Enter task title"
            />
            {saveError && <div className="muted text-xs" style={{ color: 'var(--danger, #e11d48)' }}>{saveError}</div>}
            <div className="flex gap-2">
              <button
                onClick={saveChanges}
                disabled={isSaving}
                className="button"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={cancelEdit}
                className="button secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => startEditing('title')}
            className="cursor-pointer font-medium"
          >
            {task.title}
          </div>
        )}
      </div>

      {/* Priority Field */}
  <div className="mb-2">
        {editingField === 'priority' ? (
          <div className="space-y-2">
            <select
              ref={inputRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="ui-input"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={saveChanges}
                disabled={isSaving}
                className="button"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={cancelEdit}
                className="button secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => startEditing('priority')}
            className="cursor-pointer inline-block"
          >
            <span className="badge" data-priority={task.priority || 'medium'}>
              {task.priority || 'Medium'}
            </span>
          </div>
        )}
      </div>

      {/* Due Date Field */}
      {task.dueDate && (
        <div className="mb-2">
          {editingField === 'dueDate' ? (
            <div className="space-y-2">
              <input
                ref={inputRef}
                type="date"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="ui-input"
              />
              <div className="flex gap-2">
                <button
                  onClick={saveChanges}
                  disabled={isSaving}
                  className="button"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={cancelEdit}
                  className="button secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setEditValue('')
                    saveChanges()
                  }}
                  className="button secondary"
                >
                  Clear
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => startEditing('dueDate')}
              className="cursor-pointer text-xs muted"
            >
              📅 {formatDueDate(task.dueDate)}
            </div>
          )}
        </div>
      )}

      {/* Tags Field */}
      {task.tags && task.tags.length > 0 && (
        <div className="mb-2">
          {editingField === 'tags' ? (
            <div className="space-y-2">
              <input
                ref={inputRef}
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="ui-input"
                placeholder="Enter tags separated by commas"
              />
              <div className="flex gap-2">
                <button
                  onClick={saveChanges}
                  disabled={isSaving}
                  className="button"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={cancelEdit}
                  className="button secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => startEditing('tags')}
              className="cursor-pointer"
            >
              <div className="flex flex-wrap gap-1">
                {task.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="badge"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Save Status Indicator */}
      {isSaving && (
        <div className="text-xs muted">💾 Saving...</div>
      )}
      {saveError && (
        <div className="text-xs muted" style={{ color: 'var(--danger, #e11d48)' }}>❌ {saveError}</div>
      )}
    </div>
  )
}
