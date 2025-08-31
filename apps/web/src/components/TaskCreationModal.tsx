import { useState, useEffect, useRef, useCallback } from 'react'
import type { ColumnKey, TaskItem } from '../types'
import { useTaskStore } from '../store/tasks'

interface TaskCreationModalProps {
  isOpen: boolean
  onClose: () => void
  defaultStatus?: ColumnKey
  onTaskCreated?: (task: TaskItem) => void
}

export function TaskCreationModal({ 
  isOpen, 
  onClose, 
  defaultStatus = 'draft',
  onTaskCreated 
}: TaskCreationModalProps) {
  const { createTask } = useTaskStore()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: defaultStatus,
    priority: 'medium' as TaskItem['priority'],
    dueDate: '',
    tags: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createAndAddAnother, setCreateAndAddAnother] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  
  const titleInputRef = useRef<HTMLInputElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const firstFocusableRef = useRef<HTMLInputElement>(null)
  const lastFocusableRef = useRef<HTMLButtonElement>(null)

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: '',
        description: '',
        status: defaultStatus,
        priority: 'medium',
        dueDate: '',
        tags: ''
      })
      setErrors({})
      setCreateAndAddAnother(false)
      setFocusedField(null)
      
      // Focus title input after modal is rendered
      setTimeout(() => {
        titleInputRef.current?.focus()
      }, 100)
    }
  }, [isOpen, defaultStatus])

  // Handle escape key and focus trap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      if (e.key === 'Escape') {
        onClose()
        return
      }

      // Focus trap for Tab key
      if (e.key === 'Tab') {
        const focusableElements = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as NodeListOf<HTMLElement>

        if (!focusableElements.length) return

        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault()
            lastElement.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement.focus()
          }
        }
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown)
        document.body.style.overflow = 'unset'
      }
    }
  }, [isOpen, onClose])

  // Handle click outside modal to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {}

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must be 200 characters or less'
    }

    // Description validation
    if (formData.description && formData.description.length > 2000) {
      newErrors.description = 'Description must be 2000 characters or less'
    }

    // Tags validation
    if (formData.tags) {
      const tagArray = formData.tags.split(',').map(tag => tag.trim())
      const invalidTags = tagArray.filter(tag => tag.length > 50)
      if (invalidTags.length > 0) {
        newErrors.tags = 'Tags must be 50 characters or less'
      }
      if (tagArray.length > 20) {
        newErrors.tags = 'Maximum 20 tags allowed'
      }
    }

    // Due date validation
    if (formData.dueDate) {
      const selectedDate = new Date(formData.dueDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (selectedDate < today) {
        newErrors.dueDate = 'Due date cannot be in the past'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const newTask = await createTask({
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        status: formData.status,
        priority: formData.priority,
        dueDate: formData.dueDate || undefined,
        tags: formData.tags
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0)
      })

      if (onTaskCreated) {
        onTaskCreated(newTask)
      }

      if (createAndAddAnother) {
        // Reset form for another task
        setFormData({
          title: '',
          description: '',
          status: defaultStatus,
          priority: 'medium',
          dueDate: '',
          tags: ''
        })
        setErrors({})
        setCreateAndAddAnother(false)
        
        // Focus title input for next task
        setTimeout(() => {
          titleInputRef.current?.focus()
        }, 100)
      } else {
        onClose()
      }
    } catch (error) {
      console.error('Error creating task:', error)
      setErrors({ submit: 'Failed to create task. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleFieldFocus = (fieldName: string) => {
    setFocusedField(fieldName)
  }

  const handleFieldBlur = () => {
    setFocusedField(null)
  }

  const getPriorityColor = (priority: TaskItem['priority']) => {
    switch (priority) {
      case 'low': return 'text-green-500'
      case 'medium': return 'text-yellow-500'
      case 'high': return 'text-orange-500'
      case 'critical': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusLabel = (status: ColumnKey) => {
    switch (status) {
      case 'draft': return 'Draft'
      case 'refined': return 'Refined'
      case 'in_progress': return 'In Progress'
      case 'blocked': return 'Blocked'
      case 'completed': return 'Completed'
      default: return status
    }
  }

  // Don't render if modal is not open
  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 theme-modal-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div 
        ref={modalRef}
        className="relative theme-modal-bg theme-modal-shadow w-full max-w-md max-h-[90vh] overflow-y-auto"
        role="document"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 theme-modal-header-border">
          <div>
            <h2 id="modal-title" className="text-xl font-semibold theme-modal-title">
              Create New Task
            </h2>
            <p id="modal-description" className="text-sm theme-text-secondary mt-1">
              Add a new task to your workflow
            </p>
          </div>
          <button 
            onClick={onClose}
            className="theme-modal-close"
            aria-label="Close modal"
            type="button"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium theme-label mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              ref={titleInputRef}
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={e => handleInputChange('title', e.target.value)}
              onFocus={() => handleFieldFocus('title')}
              onBlur={handleFieldBlur}
              className={`w-full px-3 py-2 theme-input-border theme-input-bg theme-input-text rounded-md transition-all duration-200 focus:outline-none focus:ring-2 theme-input-focus ${
                errors.title ? 'theme-input-error' : ''
              } ${focusedField === 'title' ? 'ring-2 ring-opacity-50' : ''}`}
              placeholder="Enter task title"
              maxLength={200}
              required
              aria-describedby={errors.title ? 'title-error' : undefined}
              aria-invalid={!!errors.title}
            />
            {errors.title && (
              <p id="title-error" className="mt-1 text-sm theme-error-text" role="alert">
                {errors.title}
              </p>
            )}
            <p className="mt-1 text-xs theme-text-secondary">
              {formData.title.length}/200 characters
            </p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium theme-label mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={e => handleInputChange('description', e.target.value)}
              onFocus={() => handleFieldFocus('description')}
              onBlur={handleFieldBlur}
              rows={3}
              className={`w-full px-3 py-2 theme-input-border theme-input-bg theme-input-text rounded-md transition-all duration-200 focus:outline-none focus:ring-2 theme-input-focus resize-none ${
                errors.description ? 'theme-input-error' : ''
              } ${focusedField === 'description' ? 'ring-2 ring-opacity-50' : ''}`}
              placeholder="Enter task description (optional)"
              maxLength={2000}
              aria-describedby={errors.description ? 'description-error' : undefined}
              aria-invalid={!!errors.description}
            />
            {errors.description && (
              <p id="description-error" className="mt-1 text-sm theme-error-text" role="alert">
                {errors.description}
              </p>
            )}
            <p className="mt-1 text-xs theme-text-secondary">
              {formData.description.length}/2000 characters
            </p>
          </div>

          {/* Status and Priority Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium theme-label mb-2">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={e => handleInputChange('status', e.target.value)}
                onFocus={() => handleFieldFocus('status')}
                onBlur={handleFieldBlur}
                className={`w-full px-3 py-2 theme-input-border theme-input-bg theme-input-text rounded-md transition-all duration-200 focus:outline-none focus:ring-2 theme-input-focus ${
                  focusedField === 'status' ? 'ring-2 ring-opacity-50' : ''
                }`}
              >
                <option value="draft">Draft</option>
                <option value="refined">Refined</option>
                <option value="in_progress">In Progress</option>
                <option value="blocked">Blocked</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label htmlFor="priority" className="block text-sm font-medium theme-label mb-2">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={e => handleInputChange('priority', e.target.value)}
                onFocus={() => handleFieldFocus('priority')}
                onBlur={handleFieldBlur}
                className={`w-full px-3 py-2 theme-input-border theme-input-bg theme-input-text rounded-md transition-all duration-200 focus:outline-none focus:ring-2 theme-input-focus ${
                  focusedField === 'priority' ? 'ring-2 ring-opacity-50' : ''
                }`}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium theme-label mb-2">
              Due Date
            </label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              value={formData.dueDate}
              onChange={e => handleInputChange('dueDate', e.target.value)}
              onFocus={() => handleFieldFocus('dueDate')}
              onBlur={handleFieldBlur}
              className={`w-full px-3 py-2 theme-input-border theme-input-bg theme-input-text rounded-md transition-all duration-200 focus:outline-none focus:ring-2 theme-input-focus ${
                errors.dueDate ? 'theme-input-error' : ''
              } ${focusedField === 'dueDate' ? 'ring-2 ring-opacity-50' : ''}`}
              aria-describedby={errors.dueDate ? 'dueDate-error' : undefined}
              aria-invalid={!!errors.dueDate}
            />
            {errors.dueDate && (
              <p id="dueDate-error" className="mt-1 text-sm theme-error-text" role="alert">
                {errors.dueDate}
              </p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium theme-label mb-2">
              Tags
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={e => handleInputChange('tags', e.target.value)}
              onFocus={() => handleFieldFocus('tags')}
              onBlur={handleFieldBlur}
              className={`w-full px-3 py-2 theme-input-border theme-input-bg theme-input-text rounded-md transition-all duration-200 focus:outline-none focus:ring-2 theme-input-focus ${
                errors.tags ? 'theme-input-error' : ''
              } ${focusedField === 'tags' ? 'ring-2 ring-opacity-50' : ''}`}
              placeholder="Enter tags separated by commas"
              aria-describedby={errors.tags ? 'tags-error' : 'tags-help'}
              aria-invalid={!!errors.tags}
            />
            {errors.tags && (
              <p id="tags-error" className="mt-1 text-sm theme-error-text" role="alert">
                {errors.tags}
              </p>
            )}
            <p id="tags-help" className="mt-1 text-xs theme-text-secondary">
              Separate tags with commas (e.g., frontend, bug, urgent)
            </p>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md" role="alert">
              <p className="text-sm theme-error-text">{errors.submit}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium theme-btn-cancel rounded-md"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting || !formData.title.trim()}
              className="flex-1 px-4 py-2 text-sm font-medium theme-btn-primary rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </span>
              ) : (
                'Create Task'
              )}
            </button>
            <button 
              type="button" 
              onClick={() => setCreateAndAddAnother(true)}
              disabled={isSubmitting || !formData.title.trim()}
              className="flex-1 px-4 py-2 text-sm font-medium theme-btn-secondary rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create & Add Another
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
