import { usePreferencesStore } from '../store/theme'
import React, { useState } from 'react'
import { DataManagementPanel } from '../components/DataManagementPanel'

/**
 * Settings page.
 *
 * Comprehensive application preferences including data management.
 */
function Settings() {
  const {
    notifications,
    behavior,
    toggleDueReminders,
    setDueReminderLead,
    toggleCompletionNotifications,
    toggleQuietHours,
    setQuietHours,
    setUndoWindowSec,
    setAnimations,
  } = usePreferencesStore()

  const [activeTab, setActiveTab] = useState<'preferences' | 'data'>('preferences')

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Settings</h2>

      {/* Tab Navigation */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('preferences')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'preferences'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Preferences
        </button>
        <button
          onClick={() => setActiveTab('data')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'data'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Data Management
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'preferences' && (
        <div className="space-y-4">
          <div className="rounded-md border p-3">
            <div className="text-sm opacity-80 mb-2">Notification Preferences</div>

            <div className="flex items-center justify-between mb-2">
              <span>Due Date Reminders</span>
              <input
                type="checkbox"
                checked={notifications.dueReminders.enabled}
                onChange={(e) => toggleDueReminders(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            {notifications.dueReminders.enabled && (
              <div className="ml-4 mb-2">
                <label className="block text-xs opacity-70 mb-1">Remind me</label>
                <div className="flex gap-2">
                  {[ '5m', '15m', '1h', '1d' ].map((lead) => (
                    <button
                      key={lead}
                      className={`ui-btn ${notifications.dueReminders.lead === lead ? 'bg-primary text-white' : ''}`}
                      onClick={() => setDueReminderLead(lead as '5m' | '15m' | '1h' | '1d')}
                    >
                      {lead}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mb-2">
              <span>Completion Notifications</span>
              <input
                type="checkbox"
                checked={notifications.completion.enabled}
                onChange={(e) => toggleCompletionNotifications(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div className="flex items-center justify-between mb-2">
              <span>Quiet Hours</span>
              <input
                type="checkbox"
                checked={notifications.quietHours.enabled}
                onChange={(e) => toggleQuietHours(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            {notifications.quietHours.enabled && (
              <div className="ml-4 flex gap-2 items-center">
                <label className="text-xs opacity-70">From:</label>
                <input
                  type="time"
                  className="ui-input w-fit"
                  value={notifications.quietHours.from}
                  onChange={(e) => setQuietHours(e.target.value, notifications.quietHours.to)}
                />
                <label className="text-xs opacity-70">To:</label>
                <input
                  type="time"
                  className="ui-input w-fit"
                  value={notifications.quietHours.to}
                  onChange={(e) => setQuietHours(notifications.quietHours.from, e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="rounded-md border p-3">
            <div className="text-sm opacity-80 mb-2">Behavior Settings</div>
            <div className="mb-2">
              <label className="block text-xs opacity-70 mb-1">Undo Window (seconds)</label>
              <input
                type="number"
                className="ui-input"
                value={behavior.undoWindowSec}
                onChange={(e) => setUndoWindowSec(Number(e.target.value))}
                min="5"
                max="30"
                step="1"
              />
            </div>

            <div>
              <label className="block text-xs opacity-70 mb-1">Animations</label>
              <div className="flex gap-2">
                {[ 'system', 'on', 'off' ].map((option) => (
                  <button
                    key={option}
                    className={`ui-btn ${behavior.animations === option ? 'bg-primary text-white' : ''}`}
                    onClick={() => setAnimations(option as 'system' | 'on' | 'off')}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'data' && (
        <DataManagementPanel />
      )}
    </div>
  )
}

export default Settings


