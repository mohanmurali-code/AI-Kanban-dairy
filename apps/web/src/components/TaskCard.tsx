import { useState, useRef, useEffect } from 'react'
import type { TaskItem } from '../types'
import { useTaskStore } from '../store/tasks'

interface TaskCardProps {
  task: TaskItem
}

export function TaskCard({ task }: TaskCardProps) {
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-blue-100 text-blue-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'critical':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="rounded-md border bg-white p-3 shadow-sm hover:shadow-md transition-shadow">
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
              className="w-full rounded border px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter task title"
            />
            {saveError && <div className="text-xs text-red-600">{saveError}</div>}
            <div className="flex gap-2">
              <button
                onClick={saveChanges}
                disabled={isSaving}
                className="rounded px-2 py-1 text-xs bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={cancelEdit}
                className="rounded px-2 py-1 text-xs bg-gray-300 text-gray-700 hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => startEditing('title')}
            className="cursor-pointer font-medium text-gray-900 hover:bg-gray-50 rounded px-1 py-0.5 -ml-1"
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
              className="w-full rounded border px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="rounded px-2 py-1 text-xs bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={cancelEdit}
                className="rounded px-2 py-1 text-xs bg-gray-300 text-gray-700 hover:bg-gray-400"
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
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority || 'medium')}`}>
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
                className="w-full rounded border px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={saveChanges}
                  disabled={isSaving}
                  className="rounded px-2 py-1 text-xs bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={cancelEdit}
                  className="rounded px-2 py-1 text-xs bg-gray-300 text-gray-700 hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setEditValue('')
                    saveChanges()
                  }}
                  className="rounded px-2 py-1 text-xs bg-gray-500 text-white hover:bg-gray-600"
                >
                  Clear
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => startEditing('dueDate')}
              className="cursor-pointer text-xs text-gray-600 hover:bg-gray-50 rounded px-1 py-0.5 -ml-1"
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
                className="w-full rounded border px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter tags separated by commas"
              />
              <div className="flex gap-2">
                <button
                  onClick={saveChanges}
                  disabled={isSaving}
                  className="rounded px-2 py-1 text-xs bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={cancelEdit}
                  className="rounded px-2 py-1 text-xs bg-gray-300 text-gray-700 hover:bg-gray-400"
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
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
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
        <div className="text-xs text-blue-600">💾 Saving...</div>
      )}
      {saveError && (
        <div className="text-xs text-red-600">❌ {saveError}</div>
      )}
    </div>
  )
}
