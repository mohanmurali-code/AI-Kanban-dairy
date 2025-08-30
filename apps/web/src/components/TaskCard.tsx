import { useState, useEffect } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import type { TaskItem } from '../types'
import { useTaskStore } from '../store/tasks'
import { TaskUpdateModal } from './TaskUpdateModal'

interface TaskCardProps {
  task: TaskItem
  className?: string
  compact?: boolean
  onEdit?: (task: TaskItem) => void
  onDelete?: (taskId: string) => void
  isDragging?: boolean
}

export function TaskCard({ task, className, onEdit, onDelete, isDragging = false }: TaskCardProps) {
  const { deleteTask, ensureTaskPriorities } = useTaskStore()
  const [isOverdue, setIsOverdue] = useState(false)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  
  // Title marquee helpers
  const MAX_TITLE_CHARS = 40
  const isTitleLong = task.title.length > MAX_TITLE_CHARS
  const baseTitle = isTitleLong ? task.title.slice(0, MAX_TITLE_CHARS) : task.title

  // Ensure all tasks have priority values when component mounts
  useEffect(() => {
    ensureTaskPriorities()
  }, [ensureTaskPriorities])
  
  // Debug priority values
  useEffect(() => {
    const priorityClass = 
      (task.priority || 'medium') === 'low' ? 'border-l-4 border-l-emerald-400' :
      (task.priority || 'medium') === 'medium' ? 'border-l-4 border-l-amber-400' :
      (task.priority || 'medium') === 'high' ? 'border-l-4 border-l-orange-400' :
      (task.priority || 'medium') === 'critical' ? 'border-l-4 border-l-red-400' :
      'border-l-4 border-l-gray-400'
    
    console.log('TaskCard priority debug:', { 
      taskId: task.id, 
      priority: task.priority, 
      priorityType: typeof task.priority,
      fallbackPriority: task.priority || 'medium',
      hasPriority: !!task.priority,
      priorityClass,
      shouldBeRed: (task.priority || 'medium') === 'critical',
      shouldBeAmber: (task.priority || 'medium') === 'medium'
    })
  }, [task.id, task.priority])
  
  // No inline editors; modal-only editing

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
    zIndex: isSortableDragging ? 1000 : undefined,
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

  // Inline editing removed; modal-only editing

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

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTask(task.id)
      onDelete?.(task.id)
    }
  }

  const handleEditClick = () => {
    setIsUpdateModalOpen(true)
  }

  const handleTaskUpdated = (updatedTask: TaskItem) => {
    onEdit?.(updatedTask)
  }

  const handleUpdateModalClose = () => {
    setIsUpdateModalOpen(false)
  }

  return (
    <>
      <style>
        {`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .marquee-container {
            display: flex;
            width: max-content;
          }
          .marquee-text {
            white-space: nowrap;
          }
          .task-id {
            transition: opacity 0.2s ease-in-out;
          }
        `}
      </style>
      <div 
        ref={setNodeRef}
        style={{
          ...style,
          // Test inline style for priority color
          borderLeft: (task.priority || 'medium') === 'low' ? '4px solid #34d399' :
                     (task.priority || 'medium') === 'medium' ? '4px solid #fbbf24' :
                     (task.priority || 'medium') === 'high' ? '4px solid #fb923c' :
                     (task.priority || 'medium') === 'critical' ? '4px solid #f87171' :
                     '4px solid #9ca3af'
        }}
        className={`
          group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
          rounded-xl shadow-sm hover:shadow-md transition-all duration-200
          ${isDragging || isSortableDragging ? 'shadow-lg scale-105 rotate-2 opacity-50' : ''}
          ${isOverdue ? 'border-red-300 bg-red-50 dark:bg-red-950/20' : ''}
          ${className || ''}
          ${
            (task.priority || 'medium') === 'low' ? 'border-l-4 border-l-emerald-400' :
            (task.priority || 'medium') === 'medium' ? 'border-l-4 border-l-amber-400' :
            (task.priority || 'medium') === 'high' ? 'border-l-4 border-l-orange-400' :
            (task.priority || 'medium') === 'critical' ? 'border-l-4 border-l-red-400' :
            'border-l-4 border-l-gray-400'
          }
        `}
        
        role="article"
        aria-label={`Task: ${task.title}`}
      >
      {/* Card Header - Title and Actions */}
      <div 
        className="task-header flex items-center justify-between p-2 cursor-grab active:cursor-grabbing hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors rounded-t-xl h-12"
        {...attributes}
        {...listeners}
        title="Drag header to move task"
      >
        {/* Title Field (display only, opens modal) */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="flex items-center gap-2 h-full">
            <div className="flex-1 min-w-0 overflow-hidden group/title">
              <div
                className="text-left w-full text-lg font-semibold text-gray-900 dark:text-gray-100 rounded px-2 py-1 overflow-hidden"
                onMouseEnter={(e) => {
                  const button = e.currentTarget;
                  const inner = button.querySelector('.marquee-container') as HTMLElement | null
                  if (!inner) return
                  const containerWidth = button.clientWidth
                  const contentWidth = inner.scrollWidth
                  const shouldScroll = isTitleLong || contentWidth > containerWidth
                  if (shouldScroll) {
                    const duration = Math.max(1, Math.min(2, contentWidth / 150))
                    inner.style.animation = `marquee ${duration}s linear infinite`
                  }
                }}
                onMouseLeave={(e) => {
                  const button = e.currentTarget;
                  const inner = button.querySelector('.marquee-container') as HTMLElement | null
                  if (inner) {
                    inner.style.animation = 'none'
                    inner.style.transform = 'translateX(0)'
                  }
                }}
              >
                {isTitleLong ? (
                  <div className="marquee-container">
                    <span className="marquee-text">{baseTitle}</span>
                    <span className="marquee-text ml-20">{baseTitle}</span>
                  </div>
                ) : (
                  <div className="truncate">
                    {task.title}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Icons - Show on hover */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
          <button onPointerDown={(e) => e.stopPropagation()}
            onClick={handleEditClick}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-md transition-colors"
            aria-label="Edit task"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button onPointerDown={(e) => e.stopPropagation()}
            onClick={handleDelete}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md transition-colors"
            aria-label="Delete task"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Description Section (display only, opens modal) */}
      <div className="px-3 py-2">
        <button
          onClick={handleEditClick}
          className="text-left w-full text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded px-2 py-1 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed min-h-[2.5rem] max-h-24 overflow-hidden whitespace-pre-wrap break-words"
          aria-label={task.description ? `Open update modal to edit description: ${task.description}` : 'Open update modal to add description'}
        >
          {task.description || (
            <span className="italic text-gray-400 dark:text-gray-500">Click to add description...</span>
          )}
        </button>
      </div>

      {/* Create Date, Due Date, and Tags Section - In logical order */}
      <div className="px-3 py-2 flex flex-wrap gap-3 items-center">
        {/* Create Date */}
        <div className="flex-shrink-0 inline-flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400" aria-label={`Created ${new Date(task.createdAt).toLocaleDateString()}`}>
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="9" strokeWidth="2" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 7v5l3 3" />
          </svg>
          <span>{new Date(task.createdAt).toLocaleDateString()}</span>
        </div>

        {/* Due Date */}
        {task.dueDate && (
          <div className="flex-shrink-0">
            <button
              onClick={handleEditClick}
              className={`
                inline-flex items-center gap-1 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 
                rounded px-2 py-1 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500
                ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-600 dark:text-gray-400'}
              `}
              aria-label={`Open update modal to edit due date: ${formatDueDate(task.dueDate)}`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{formatDueDate(task.dueDate)}</span>
            </button>
          </div>
        )}

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex-shrink-0">
            <button
              onClick={handleEditClick}
              className="flex flex-wrap gap-1 hover:bg-gray-50 dark:hover:bg-gray-700 rounded p-1 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={`Open update modal to edit tags: ${task.tags.join(', ')}`}
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
          </div>
        )}
        {/* Task ID moved here */}
        <div className="flex-shrink-0">
          <span className="inline-flex items-center px-2 py-1 text-xs font-mono bg-gray-100 text-gray-600 border border-gray-200 rounded-md dark:bg-gray-900/40 dark:text-gray-300 dark:border-gray-700">
            #{task.id.slice(0, 8)}
          </span>
        </div>
      </div>

      {/* No inline save indicators; modal handles saving */}

      {/* Task Update Modal */}
      <TaskUpdateModal
        isOpen={isUpdateModalOpen}
        onClose={handleUpdateModalClose}
        task={task}
        onTaskUpdated={handleTaskUpdated}
      />
    </div>
    </>
  )
}
