import { useState, useMemo } from 'react'
import type { TaskFilters } from '../store/tasks'
import type { ColumnKey } from '../types'

interface TaskFiltersProps {
  filters: TaskFilters
  onFiltersChange: (filters: TaskFilters) => void
  onReset: () => void
  availableTags?: string[]
}

/**
 * Advanced task filtering component with improved styling and UX.
 */
export function TaskFilters({ filters, onFiltersChange, onReset, availableTags = [] }: TaskFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const statusOptions: { value: ColumnKey; label: string; color: string }[] = [
    { value: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    { value: 'refined', label: 'Refined', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    { value: 'in_progress', label: 'In Progress', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    { value: 'blocked', label: 'Blocked', color: 'bg-red-100 text-red-800 border-red-200' },
    { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800 border-green-200' },
  ]

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800 border-green-200' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800 border-red-200' },
  ]

  // Quick filter presets
  const quickFilters = [
    { label: 'Today', filter: { dueDate: { from: new Date().toISOString().split('T')[0], to: new Date().toISOString().split('T')[0] } } },
    { label: 'This Week', filter: { dueDate: { from: new Date().toISOString().split('T')[0], to: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] } } },
    { label: 'Overdue', filter: { dueDate: { to: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0] } } },
    { label: 'High Priority', filter: { priority: ['high', 'critical'] as const } },
  ]

  const handleStatusChange = (status: ColumnKey, checked: boolean) => {
    const currentStatuses = filters.status || []
    const newStatuses = checked
      ? [...currentStatuses, status]
      : currentStatuses.filter(s => s !== status)
    
    onFiltersChange({
      ...filters,
      status: newStatuses.length > 0 ? newStatuses : undefined
    })
  }

  const handlePriorityChange = (priority: string, checked: boolean) => {
    const currentPriorities = filters.priority || []
    const newPriorities = checked
      ? [...currentPriorities, priority as any]
      : currentPriorities.filter(p => p !== priority)
    
    onFiltersChange({
      ...filters,
      priority: newPriorities.length > 0 ? newPriorities : undefined
    })
  }

  const handleTagChange = (tag: string) => {
    if (!tag) return
    const currentTags = filters.tags || []
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag]
    
    onFiltersChange({
      ...filters,
      tags: newTags.length > 0 ? newTags : undefined
    })
  }

  const handleDateRangeChange = (field: 'from' | 'to', value: string) => {
    onFiltersChange({
      ...filters,
      dueDate: {
        ...filters.dueDate,
        [field]: value || undefined
      }
    })
  }

  const handleShowArchivedChange = (checked: boolean) => {
    onFiltersChange({
      ...filters,
      showArchived: checked
    })
  }

  const applyQuickFilter = (quickFilter: typeof quickFilters[0]) => {
    onFiltersChange({
      ...filters,
      ...quickFilter.filter
    } as TaskFilters)
  }

  const hasActiveFilters = useMemo(() => {
    return !!(
      filters.status?.length ||
      filters.priority?.length ||
      filters.tags?.length ||
      filters.dueDate?.from ||
      filters.dueDate?.to ||
      filters.showArchived
    )
  }, [filters])

  const clearAllFilters = () => {
    onReset()
  }

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.status?.length) count += filters.status.length
    if (filters.priority?.length) count += filters.priority.length
    if (filters.tags?.length) count += filters.tags.length
    if (filters.dueDate?.from || filters.dueDate?.to) count += 1
    if (filters.showArchived) count += 1
    return count
  }, [filters])

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-gray-900">Advanced Filters</h3>
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
              aria-label="Clear all filters"
            >
              Clear All
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
            aria-label={isExpanded ? 'Collapse filters' : 'Expand filters'}
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2">
        {quickFilters.map((quickFilter) => (
          <button
            key={quickFilter.label}
            onClick={() => applyQuickFilter(quickFilter)}
            className="px-3 py-1.5 text-sm font-medium bg-gray-100 text-gray-700 border border-gray-300 rounded-full hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={`Apply ${quickFilter.label} filter`}
          >
            {quickFilter.label}
          </button>
        ))}
      </div>

      {/* Expanded Filters */}
      <div className={`space-y-6 transition-all duration-200 ${isExpanded ? 'block opacity-100' : 'hidden opacity-0'}`}>
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">Status</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {statusOptions.map(({ value, label, color }) => (
              <label key={value} className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.status?.includes(value) || false}
                  onChange={(e) => handleStatusChange(value, e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  aria-label={`Filter by ${label} status`}
                />
                <span className={`text-sm px-3 py-1.5 rounded-full border ${color} group-hover:opacity-80 transition-opacity`}>
                  {label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Priority Filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">Priority</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {priorityOptions.map(({ value, label, color }) => (
              <label key={value} className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.priority?.includes(value as any) || false}
                  onChange={(e) => handlePriorityChange(value, e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  aria-label={`Filter by ${label} priority`}
                />
                <span className={`text-sm px-3 py-1.5 rounded-full border ${color} group-hover:opacity-80 transition-opacity`}>
                  {label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Due Date Range */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">Due Date Range</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-2">From</label>
              <input
                type="date"
                value={filters.dueDate?.from || ''}
                onChange={(e) => handleDateRangeChange('from', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                aria-label="Filter from date"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-2">To</label>
              <input
                type="date"
                value={filters.dueDate?.to || ''}
                onChange={(e) => handleDateRangeChange('to', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                aria-label="Filter to date"
              />
            </div>
          </div>
        </div>

        {/* Tags Filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">Tags</label>
          <div className="space-y-4">
            {/* Common Tags */}
            <div>
              <label className="block text-xs text-gray-600 mb-2">Common Tags</label>
              <div className="flex flex-wrap gap-2">
                {['urgent', 'bug', 'feature', 'documentation', 'meeting', 'review'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagChange(tag)}
                    className={`px-3 py-1.5 text-sm rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      filters.tags?.includes(tag)
                        ? 'bg-blue-100 text-blue-700 border-blue-300'
                        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                    }`}
                    aria-label={`Filter by ${tag} tag`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Available Tags from Tasks */}
            {availableTags.length > 0 && (
              <div>
                <label className="block text-xs text-gray-600 mb-2">Available Tags</label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.slice(0, 10).map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleTagChange(tag)}
                      className={`px-3 py-1.5 text-sm rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        filters.tags?.includes(tag)
                          ? 'bg-purple-100 text-purple-700 border-purple-300'
                          : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                      }`}
                      aria-label={`Filter by ${tag} tag`}
                    >
                      #{tag}
                    </button>
                  ))}
                  {availableTags.length > 10 && (
                    <span className="px-3 py-1.5 text-sm text-gray-500">
                      +{(availableTags.length - 10).toString()} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Show Archived */}
        <div>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.showArchived || false}
              onChange={(e) => handleShowArchivedChange(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              aria-label="Show archived tasks"
            />
            <span className="text-sm font-medium text-gray-900">Show Archived Tasks</span>
          </label>
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="pt-4 border-t border-gray-200">
          <div className="text-xs font-medium text-gray-600 mb-3">Active Filters:</div>
          <div className="flex flex-wrap gap-2">
            {filters.status?.map(status => (
              <span key={status} className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm border border-blue-200">
                Status: {status.replace('_', ' ')}
                <button
                  onClick={() => handleStatusChange(status, false)}
                  className="ml-2 text-blue-500 hover:text-blue-700 font-bold"
                  aria-label={`Remove ${status} filter`}
                >
                  ×
                </button>
              </span>
            ))}
            {filters.priority?.map(priority => (
              <span key={priority} className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm border border-green-200">
                Priority: {priority}
                <button
                  onClick={() => handlePriorityChange(priority, false)}
                  className="ml-2 text-green-500 hover:text-green-700 font-bold"
                  aria-label={`Remove ${priority} priority filter`}
                >
                  ×
                </button>
              </span>
            ))}
            {filters.tags?.map(tag => tag && (
              <span key={tag} className="inline-flex items-center px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm border border-purple-200">
                Tag: {tag}
                <button
                  onClick={() => handleTagChange(tag)}
                  className="ml-2 text-purple-500 hover:text-purple-700 font-bold"
                  aria-label={`Remove ${tag} tag filter`}
                >
                  ×
                </button>
              </span>
            ))}
            {(filters.dueDate?.from || filters.dueDate?.to) && (
              <span className="inline-flex items-center px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-full text-sm border border-yellow-200">
                Due: {filters.dueDate?.from || 'any'} - {filters.dueDate?.to || 'any'}
                <button
                  onClick={() => onFiltersChange({ ...filters, dueDate: undefined })}
                  className="ml-2 text-yellow-500 hover:text-yellow-700 font-bold"
                  aria-label="Remove due date filter"
                >
                  ×
                </button>
              </span>
            )}
            {filters.showArchived && (
              <span className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm border border-gray-200">
                Including Archived
                <button
                  onClick={() => handleShowArchivedChange(false)}
                  className="ml-2 text-gray-500 hover:text-gray-700 font-bold"
                  aria-label="Remove archived filter"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
