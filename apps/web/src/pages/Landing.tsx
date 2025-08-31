import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTaskStore, type TaskStats } from '../store/tasks'
import { useNotesStore } from '../store/notes'
import type { NoteStats } from '../types'
import { usePreferencesStore } from '../store/theme'
import { TaskCard } from '../components/TaskCard'
import { ThemeAwareCard } from '../components/ThemeAwareCard'

/**
 * Landing page component with dashboard overview.
 * 
 * Features:
 * - Quick stats and productivity metrics
 * - Recent tasks and notes
 * - Quick actions for common tasks
 * - Progress overview with visual indicators
 * - Upcoming deadlines
 */
export default function Landing() {
  const { getAllTasks, getTaskStats } = useTaskStore()
  const { getAllNotes, getNoteStats } = useNotesStore()
  const { appearance } = usePreferencesStore()

  // Get recent data
  const recentTasks = useMemo(() => {
    return getAllTasks().slice(0, 5)
  }, [getAllTasks])

  const recentNotes = useMemo(() => {
    return getAllNotes().slice(0, 3)
  }, [getAllNotes])

  const taskStats = useMemo(() => getTaskStats(), [getTaskStats])
  const noteStats = useMemo(() => getNoteStats(), [getNoteStats])

  // Calculate productivity metrics
  const productivityMetrics = useMemo(() => {
    const totalTasks = taskStats.total
    const completedTasks = taskStats.byStatus.completed
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
    
    return {
      completionRate: Math.round(completionRate),
      overdueTasks: taskStats.overdue,
      dueToday: taskStats.dueToday,
      dueThisWeek: taskStats.dueThisWeek,
    }
  }, [taskStats])

  // Get upcoming deadlines (next 7 days)
  const upcomingDeadlines = useMemo(() => {
    const now = new Date()
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    
    return getAllTasks().filter(task => {
      if (!task.dueDate) return false
      const dueDate = new Date(task.dueDate)
      return dueDate >= now && dueDate <= weekFromNow && task.status !== 'completed'
    }).sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
  }, [getAllTasks])

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
          Welcome to Your Kanban Diary
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Organize your tasks, capture your thoughts, and track your progress all in one place.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800 text-center">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{taskStats.total}</div>
          <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Tasks</div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-xl border border-green-200 dark:border-green-800 text-center">
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">{productivityMetrics.completionRate}%</div>
          <div className="text-sm text-green-600 dark:text-green-400 font-medium">Completion Rate</div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-6 rounded-xl border border-orange-200 dark:border-orange-800 text-center">
          <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{productivityMetrics.overdueTasks}</div>
          <div className="text-sm text-orange-600 dark:text-orange-400 font-medium">Overdue Tasks</div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-xl border border-purple-200 dark:border-purple-800 text-center">
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{noteStats.total}</div>
          <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">Total Notes</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            to="/tasks" 
            className="group flex items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-950/20 transition-all duration-200"
          >
            <div className="text-center">
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">📝</div>
              <div className="font-medium text-gray-900 dark:text-gray-100">Create Task</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Add a new task to your board</div>
            </div>
          </Link>
          
          <Link 
            to="/notes" 
            className="group flex items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-950/20 transition-all duration-200"
          >
            <div className="text-center">
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">📔</div>
              <div className="font-medium text-gray-900 dark:text-gray-100">Write Note</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Capture your thoughts</div>
            </div>
          </Link>
          
          <Link 
            to="/calendar" 
            className="group flex items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all duration-200"
          >
            <div className="text-center">
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">📅</div>
              <div className="font-medium text-gray-900 dark:text-gray-100">View Calendar</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">See your schedule</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Tasks */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Recent Tasks</h2>
            <Link to="/tasks" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
              View All →
            </Link>
          </div>
          
          {recentTasks.length > 0 ? (
            <div className="space-y-4">
              {recentTasks.map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <div className="text-5xl mb-4">📝</div>
              <p className="text-lg font-medium mb-2">No tasks yet</p>
              <p className="text-sm">Create your first task to get started!</p>
              <Link 
                to="/tasks" 
                className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Create Task
              </Link>
            </div>
          )}
        </div>

        {/* Recent Notes */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Recent Notes</h2>
            <Link to="/notes" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
              View All →
            </Link>
          </div>
          
          {recentNotes.length > 0 ? (
            <div className="space-y-4">
              {recentNotes.map(note => (
                <div key={note.id} className="group p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 hover:shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {note.title}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </div>
                      {note.content && (
                        <div className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                          {note.content}
                        </div>
                      )}
                    </div>
                    <div className="ml-3 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <div className="text-5xl mb-4">📔</div>
              <p className="text-lg font-medium mb-2">No notes yet</p>
              <p className="text-sm">Start writing to capture your thoughts!</p>
              <Link 
                to="/notes" 
                className="inline-block mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Write Note
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Deadlines */}
      {upcomingDeadlines.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Upcoming Deadlines</h2>
            <Link to="/calendar" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
              View Calendar →
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingDeadlines.slice(0, 6).map(task => (
              <div key={task.id} className="group p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 hover:shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div className="font-semibold text-gray-900 dark:text-gray-100 truncate flex-1">
                    {task.title}
                  </div>
                  <div className="ml-2 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  Due: {new Date(task.dueDate!).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    task.priority === 'high' || task.priority === 'critical' 
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                      : task.priority === 'medium'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                      : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  }`}>
                    {task.priority}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    task.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    : task.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                    : task.status === 'blocked' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                  }`}>
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100">Progress Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {Object.entries(taskStats.byStatus).map(([status, count]) => (
            <div key={status} className="text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{count}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 font-medium capitalize mb-3">
                {status.replace('_', ' ')}
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500 ease-out"
                  style={{ 
                    width: `${taskStats.total > 0 ? (count / taskStats.total) * 100 : 0}%` 
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
