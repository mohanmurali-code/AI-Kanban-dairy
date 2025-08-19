import { useState, useMemo } from 'react'
import { useTaskStore } from '../store/tasks'
import { ThemeAwareCard } from '../components/ThemeAwareCard'
import { TaskCard } from '../components/TaskCard'
import { TaskCreationModal } from '../components/TaskCreationModal'
import type { TaskItem, ColumnKey } from '../types'

/**
 * Calendar page component with task integration.
 * 
 * Features:
 * - Monthly calendar view
 * - Task display on due dates
 * - Quick task creation
 * - Task filtering and navigation
 * - Overdue task highlighting
 */
export default function Calendar() {
  const { getAllTasks, updateTask } = useTaskStore()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null)
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month')

  // Get all tasks with due dates
  const tasksWithDueDates = useMemo(() => {
    return getAllTasks().filter(task => task.dueDate)
  }, [getAllTasks])

  // Generate calendar data for current month
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days = []
    const current = new Date(startDate)
    
    while (current <= lastDay || current.getDay() !== 0) {
      const date = new Date(current)
      const dayTasks = tasksWithDueDates.filter(task => {
        const taskDate = new Date(task.dueDate!)
        return taskDate.toDateString() === date.toDateString()
      })
      
      days.push({
        date,
        isCurrentMonth: date.getMonth() === month,
        isToday: date.toDateString() === new Date().toDateString(),
        tasks: dayTasks,
        isOverdue: dayTasks.some(task => {
          const taskDate = new Date(task.dueDate!)
          return taskDate < new Date() && task.status !== 'completed'
        })
      })
      
      current.setDate(current.getDate() + 1)
    }
    
    return days
  }, [currentDate, tasksWithDueDates])

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Handle date selection
  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setShowTaskModal(true)
  }

  // Handle task creation
  const handleTaskCreated = async (_task: TaskItem) => {
    setShowTaskModal(false)
    setSelectedDate(null)
  }

  // Handle task status update
  const handleTaskStatusChange = async (taskId: string, newStatus: ColumnKey) => {
    await updateTask(taskId, { status: newStatus })
  }

  // Get month name
  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  // Get day names for header
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[rgb(var(--fg))]">Calendar</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'month'
                  ? 'bg-cyan-500 text-white'
                  : 'bg-[rgb(var(--surface-hover))] text-[rgb(var(--fg))] hover:bg-[rgb(var(--surface-hover))]'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'week'
                  ? 'bg-cyan-500 text-white'
                  : 'bg-[rgb(var(--surface-hover))] text-[rgb(var(--fg))] hover:bg-[rgb(var(--surface-hover))]'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'day'
                  ? 'bg-cyan-500 text-white'
                  : 'bg-[rgb(var(--surface-hover))] text-[rgb(var(--fg))] hover:bg-[rgb(var(--surface-hover))]'
              }`}
            >
              Day
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Navigation */}
      <ThemeAwareCard className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={goToPreviousMonth}
              className="p-2 rounded-md hover:bg-[rgb(var(--surface-hover))] transition-colors"
            >
              ←
            </button>
            <h2 className="text-xl font-semibold text-[rgb(var(--fg))]">
              {getMonthName(currentDate)}
            </h2>
            <button
              onClick={goToNextMonth}
              className="p-2 rounded-md hover:bg-[rgb(var(--surface-hover))] transition-colors"
            >
              →
            </button>
          </div>
          <button
            onClick={goToToday}
            className="px-4 py-2 bg-cyan-500 text-white rounded-md hover:bg-cyan-600 transition-colors"
          >
            Today
          </button>
        </div>
      </ThemeAwareCard>

      {/* Calendar Grid */}
      <ThemeAwareCard className="p-6">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {dayNames.map(day => (
            <div key={day} className="text-center font-medium text-[rgb(var(--fg-muted))] py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarData.map((day, index) => (
            <div
              key={index}
              className={`min-h-[120px] p-2 border border-[rgb(var(--border))] rounded-lg cursor-pointer transition-colors ${
                day.isCurrentMonth
                  ? 'bg-[rgb(var(--surface))] hover:bg-[rgb(var(--surface-hover))]'
                  : 'bg-[rgb(var(--surface-muted))] text-[rgb(var(--fg-muted))]'
              } ${
                day.isToday ? 'ring-2 ring-cyan-500' : ''
              } ${
                day.isOverdue ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : ''
              }`}
              onClick={() => handleDateClick(day.date)}
            >
              {/* Date Number */}
              <div className={`text-sm font-medium mb-2 ${
                day.isToday ? 'text-cyan-500' : ''
              }`}>
                {day.date.getDate()}
              </div>

              {/* Tasks */}
              <div className="space-y-1">
                {day.tasks.slice(0, 3).map(task => (
                  <div
                    key={task.id}
                    className={`text-xs p-1 rounded truncate cursor-pointer ${
                      task.status === 'completed'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        : task.priority === 'high' || task.priority === 'critical'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        : task.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedTask(task)
                    }}
                  >
                    {task.title}
                  </div>
                ))}
                {day.tasks.length > 3 && (
                  <div className="text-xs text-[rgb(var(--fg-muted))] text-center">
                    +{day.tasks.length - 3} more
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </ThemeAwareCard>

      {/* Selected Date Tasks */}
      {selectedDate && (
        <ThemeAwareCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[rgb(var(--fg))]">
              Tasks for {selectedDate.toLocaleDateString()}
            </h3>
            <button
              onClick={() => setShowTaskModal(true)}
              className="px-4 py-2 bg-cyan-500 text-white rounded-md hover:bg-cyan-600 transition-colors"
            >
              Add Task
            </button>
          </div>
          
          {calendarData.find(day => day.date.toDateString() === selectedDate.toDateString())?.tasks.length ? (
            <div className="space-y-3">
              {calendarData
                .find(day => day.date.toDateString() === selectedDate.toDateString())
                ?.tasks.map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
            </div>
          ) : (
            <div className="text-center py-8 text-[rgb(var(--fg-muted))]">
              <div className="text-4xl mb-2">📅</div>
              <p>No tasks scheduled for this date.</p>
              <button
                onClick={() => setShowTaskModal(true)}
                className="mt-4 px-4 py-2 bg-cyan-500 text-white rounded-md hover:bg-cyan-600 transition-colors"
              >
                Add Task
              </button>
            </div>
          )}
        </ThemeAwareCard>
      )}

      {/* Task Creation Modal */}
      {showTaskModal && (
        <TaskCreationModal
          isOpen={showTaskModal}
          onClose={() => {
            setShowTaskModal(false)
            setSelectedDate(null)
          }}
          onTaskCreated={handleTaskCreated}
          defaultStatus="draft"
        />
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[rgb(var(--surface))] rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[rgb(var(--fg))]">Task Details</h3>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-[rgb(var(--fg-muted))] hover:text-[rgb(var(--fg))]"
              >
                ✕
              </button>
            </div>
            
            <TaskCard task={selectedTask} />
            
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  handleTaskStatusChange(selectedTask.id, 'completed')
                  setSelectedTask(null)
                }}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
              >
                Mark Complete
              </button>
              <button
                onClick={() => setSelectedTask(null)}
                className="px-4 py-2 bg-[rgb(var(--surface-hover))] text-[rgb(var(--fg))] rounded-md hover:bg-[rgb(var(--surface-hover))] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
