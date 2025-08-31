import { useState, useMemo } from 'react'
import { useTaskStore, type TaskFilters } from '../store/tasks'
import { saveToFile, loadFromFile, isFileSystemAccessSupported } from '../utils/fileStorage'
import { TaskFilters as TaskFiltersComponent } from '../components/TaskFilters'
import { TaskCreationModal } from '../components/TaskCreationModal'
import { TaskEditModal } from '../components/TaskEditModal'
import type { TaskItem, ColumnKey } from '../types'

/**
 * Tasks page.
 *
 * Displays a comprehensive list view of all tasks with filtering, sorting, and data management.
 */
function Tasks() {
  const { 
    getAllTasks, 
    deleteTask, 
    restoreTask, 
    hardDeleteTask, 
    exportData, 
    importData, 
    clearAllData,
    getTaskStats 
  } = useTaskStore()

  const [filters, setFilters] = useState<TaskFilters>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'updatedAt' | 'createdAt' | 'dueDate' | 'priority' | 'title'>('updatedAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [showFilters, setShowFilters] = useState(false)
  const [showDataManagement, setShowDataManagement] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null)
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')

  // Get filtered and sorted tasks
  const tasks = useMemo(() => {
    let filteredTasks = getAllTasks({
      ...filters,
      search: searchTerm,
    })

    // Sort tasks
    filteredTasks.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        case 'priority':
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
          aValue = priorityOrder[a.priority || 'medium']
          bValue = priorityOrder[b.priority || 'medium']
          break
        case 'dueDate':
          aValue = a.dueDate ? new Date(a.dueDate).getTime() : 0
          bValue = b.dueDate ? new Date(b.dueDate).getTime() : 0
          break
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
          break
        case 'updatedAt':
        default:
          aValue = new Date(a.updatedAt).getTime()
          bValue = new Date(b.updatedAt).getTime()
          break
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filteredTasks
  }, [getAllTasks, filters, searchTerm, sortBy, sortOrder])

  const stats = useMemo(() => getTaskStats(), [getTaskStats])

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const data = exportData()
      const parsedData = JSON.parse(data)
      await saveToFile(parsedData)
    } catch (error) {
      alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsExporting(false)
    }
  }

  const handleImport = async () => {
    setIsImporting(true)
    try {
      const data = await loadFromFile()
      await importData(JSON.stringify(data))
      alert('Data imported successfully!')
    } catch (error) {
      alert(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsImporting(false)
    }
  }

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      clearAllData()
    }
  }

  const handleFiltersReset = () => {
    setFilters({})
    setSearchTerm('')
  }

  const openCreateModal = () => {
    setIsModalOpen(true)
  }

  const closeCreateModal = () => {
    setIsModalOpen(false)
  }

  const handleTaskCreated = () => {
    // Task created successfully, modal will close automatically
  }

  const openEditModal = (task: TaskItem) => {
    setEditingTask(task)
    setIsEditModalOpen(true)
  }

  const closeEditModal = () => {
    setIsEditModalOpen(false)
    setEditingTask(null)
  }

  const handleTaskUpdated = () => {
    // Task updated successfully, modal will close automatically
  }

  const getPriorityColor = (priority: TaskItem['priority']) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-200'
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200'
      case 'low': return 'text-green-600 bg-green-100 border-green-200'
      default: return 'text-gray-600 bg-gray-100 border-gray-200'
    }
  }

  const getStatusColor = (status: ColumnKey) => {
    switch (status) {
      case 'draft': return 'text-gray-600 bg-gray-100 border-gray-200'
      case 'refined': return 'text-blue-600 bg-blue-100 border-blue-200'
      case 'in_progress': return 'text-purple-600 bg-purple-100 border-purple-200'
      case 'blocked': return 'text-red-600 bg-red-100 border-red-200'
      case 'completed': return 'text-green-600 bg-green-100 border-green-200'
      default: return 'text-gray-600 bg-gray-100 border-gray-200'
    }
  }

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Yesterday'
    if (diffDays === 0) return 'Today'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Tasks</h2>
          <p className="text-sm text-gray-600 mt-1">
            {tasks.length} task{tasks.length !== 1 ? 's' : ''} • {stats.total} total
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-3 py-2 text-sm border rounded-md hover:bg-gray-50 transition-colors"
          >
            {showFilters ? 'Hide' : 'Show'} Filters
          </button>
          <button
            onClick={() => setShowDataManagement(!showDataManagement)}
            className="px-3 py-2 text-sm border rounded-md hover:bg-gray-50 transition-colors"
          >
            Data Management
          </button>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            + Create Task
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-blue-600">Total Tasks</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
          <div className="text-sm text-red-600">Overdue</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="text-2xl font-bold text-yellow-600">{stats.dueToday}</div>
          <div className="text-sm text-yellow-600">Due Today</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-2xl font-bold text-green-600">{stats.dueThisWeek}</div>
          <div className="text-sm text-green-600">Due This Week</div>
        </div>
      </div>

      {/* Search, Sort, and View Controls */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-4 border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium mb-1">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tasks..."
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="updatedAt">Last Updated</option>
              <option value="createdAt">Created Date</option>
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="title">Title</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-sm font-medium mb-1">Sort Order</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>

          {/* View Mode */}
          <div>
            <label className="block text-sm font-medium mb-1">View</label>
            <div className="flex border rounded-md overflow-hidden">
              <button
                onClick={() => setViewMode('table')}
                className={`flex-1 px-3 py-2 text-sm transition-colors ${
                  viewMode === 'table' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`flex-1 px-3 py-2 text-sm transition-colors ${
                  viewMode === 'cards' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                Cards
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <TaskFiltersComponent
          filters={filters}
          onFiltersChange={setFilters}
          onReset={handleFiltersReset}
        />
      )}

      {/* Data Management */}
      {showDataManagement && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-4 border">
          <h3 className="font-medium">Data Management</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isExporting ? 'Exporting...' : 'Export to JSON'}
            </button>
            <button
              onClick={handleImport}
              disabled={isImporting}
              className="px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isImporting ? 'Importing...' : 'Import from JSON'}
            </button>
            <button
              onClick={handleClearAll}
              className="px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Clear All Data
            </button>
          </div>
          {isFileSystemAccessSupported() && (
            <p className="text-xs text-gray-600">
              ✓ File System Access API supported - you can save files directly to your computer
            </p>
          )}
        </div>
      )}

      {/* Tasks Display */}
      {tasks.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border">
          <div className="text-gray-500 mb-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
          <p className="text-gray-600 mb-4">
            {!filters.showArchived ? 'Try showing archived tasks or create a new task.' : 'Create your first task to get started.'}
          </p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            + Create Your First Task
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Title & Description</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Priority</th>
                <th className="px-4 py-3 text-left font-medium">Due Date</th>
                <th className="px-4 py-3 text-left font-medium">Tags</th>
                <th className="px-4 py-3 text-left font-medium">Created</th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4">
                    <div>
                      <div className="font-medium text-gray-900 mb-1">{task.title}</div>
                      {task.description && (
                        <div className="text-gray-600 text-sm line-clamp-2 max-w-md">
                          {task.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {task.priority && (
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {task.dueDate ? (
                      <div className={isOverdue(task.dueDate) ? 'text-red-600 font-medium' : ''}>
                        <div>{new Date(task.dueDate).toLocaleDateString()}</div>
                        {isOverdue(task.dueDate) && (
                          <div className="text-xs text-red-500">Overdue</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {task.tags && task.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {task.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs border"
                          >
                            {tag}
                          </span>
                        ))}
                        {task.tags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs border">
                            +{task.tags.length - 3}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-gray-600">
                    <div className="text-sm">{formatDate(task.createdAt)}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-1">
                      {!task.archived && (
                        <button
                          onClick={() => openEditModal(task)}
                          className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          Edit
                        </button>
                      )}
                      {task.archived ? (
                        <button
                          onClick={() => restoreTask(task.id)}
                          className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                        >
                          Restore
                        </button>
                      ) : (
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                        >
                          Delete
                        </button>
                      )}
                      {task.archived && (
                        <button
                          onClick={() => hardDeleteTask(task.id)}
                          className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                        >
                          Hard Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <div key={task.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-medium text-gray-900 line-clamp-2 flex-1 mr-2">{task.title}</h3>
                <div className="flex gap-1">
                  {!task.archived && (
                    <button
                      onClick={() => openEditModal(task)}
                      className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Edit
                    </button>
                  )}
                  {task.archived ? (
                    <button
                      onClick={() => restoreTask(task.id)}
                      className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                      Restore
                    </button>
                  ) : (
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
              
              {task.description && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-3">{task.description}</p>
              )}
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                    {task.status.replace('_', ' ')}
                  </span>
                  {task.priority && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  )}
                </div>
                
                {task.dueDate && (
                  <div className={`text-sm ${isOverdue(task.dueDate) ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                    <span className="font-medium">Due:</span> {new Date(task.dueDate).toLocaleDateString()}
                    {isOverdue(task.dueDate) && <span className="ml-1 text-red-500">(Overdue)</span>}
                  </div>
                )}
                
                {task.tags && task.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {task.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs border"
                      >
                        {tag}
                      </span>
                    ))}
                    {task.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs border">
                        +{task.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
                
                <div className="text-xs text-gray-500 pt-2 border-t">
                  Created {formatDate(task.createdAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task Creation Modal */}
      <TaskCreationModal
        isOpen={isModalOpen}
        onClose={closeCreateModal}
        defaultStatus="draft"
        onTaskCreated={handleTaskCreated}
      />

      {/* Task Edit Modal */}
      <TaskEditModal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        task={editingTask}
        onTaskUpdated={handleTaskUpdated}
      />
    </div>
  )
}

export default Tasks


