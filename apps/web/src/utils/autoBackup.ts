/**
 * Auto-backup utilities for handling backup on exit and other events.
 * 
 * Provides automatic backup functionality when the application is closing
 * or when certain events occur.
 */

import { dataManager } from './dataManager'
import { changeDetector } from './changeDetector'
import { useNotesStore } from '../store/notes'
import { useTaskStore } from '../store/tasks'

/**
 * Initialize auto-backup system.
 * Sets up event listeners for page unload and other backup triggers.
 */
export function initializeAutoBackup(): void {
  // Initialize change detection for collections
  changeDetector.startTracking('notes', {})
  changeDetector.startTracking('tasks', {})
  
  // Backup on page unload (before user leaves)
  window.addEventListener('beforeunload', handleBeforeUnload)
  
  // Backup on page visibility change (when user switches tabs/apps)
  document.addEventListener('visibilitychange', handleVisibilityChange)
  
  // Backup on window focus loss (when user clicks away)
  window.addEventListener('blur', handleWindowBlur)
  
  console.log('Auto-backup system initialized with change detection')
}

/**
 * Clean up auto-backup system.
 * Removes event listeners when needed.
 */
export function cleanupAutoBackup(): void {
  window.removeEventListener('beforeunload', handleBeforeUnload)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  window.removeEventListener('blur', handleWindowBlur)
  
  console.log('Auto-backup system cleaned up')
}

/**
 * Handle beforeunload event - backup before page closes.
 */
async function handleBeforeUnload(event: BeforeUnloadEvent): Promise<void> {
  try {
    console.log('Checking for changes before page unload...')
    
    // Check if there are any uncommitted changes
    const notesChanges = changeDetector.getChangeSummary('notes')
    const tasksChanges = changeDetector.getChangeSummary('tasks')
    
    if (notesChanges.hasUncommittedChanges || tasksChanges.hasUncommittedChanges) {
      console.log('Uncommitted changes detected, creating backup...')
      
      // Create a backup using DataManager
      await dataManager.createBackup('auto', 'Auto-backup on exit with changes')
      
      // Also backup notes specifically
      const notesStore = useNotesStore.getState()
      await notesStore.backupOnExit()
      
      // Mark changes as committed
      changeDetector.markChangesCommitted('notes')
      changeDetector.markChangesCommitted('tasks')
      
      console.log('Backup completed before page unload')
    } else {
      console.log('No changes detected, skipping backup')
    }
  } catch (error) {
    console.error('Failed to create backup before unload:', error)
    // Don't prevent unload - backup failure shouldn't stop user from leaving
  }
}

/**
 * Handle visibility change - backup when user switches away.
 */
async function handleVisibilityChange(): Promise<void> {
  if (document.hidden) {
    try {
      console.log('Checking for changes on visibility change...')
      
      // Only backup if user has been active for a while
      const lastActivity = getLastActivityTime()
      const timeSinceActivity = Date.now() - lastActivity
      
      if (timeSinceActivity > 5 * 60 * 1000) { // 5 minutes
        // Check if there are any uncommitted changes
        const notesChanges = changeDetector.getChangeSummary('notes')
        const tasksChanges = changeDetector.getChangeSummary('tasks')
        
        if (notesChanges.hasUncommittedChanges || tasksChanges.hasUncommittedChanges) {
          console.log('Uncommitted changes detected, creating backup...')
          await dataManager.createBackup('auto', 'Auto-backup on visibility change with changes')
          
          // Mark changes as committed
          changeDetector.markChangesCommitted('notes')
          changeDetector.markChangesCommitted('tasks')
        } else {
          console.log('No changes detected, skipping backup')
        }
      }
    } catch (error) {
      console.error('Failed to create backup on visibility change:', error)
    }
  }
}

/**
 * Handle window blur - backup when user clicks away.
 */
async function handleWindowBlur(): Promise<void> {
  try {
    console.log('Creating backup on window blur...')
    
    // Debounce rapid blur events
    if (window.blurTimeout) {
      clearTimeout(window.blurTimeout)
    }
    
    window.blurTimeout = setTimeout(async () => {
      await dataManager.createBackup('auto', 'Auto-backup on window blur')
    }, 1000) // Wait 1 second before backing up
  } catch (error) {
    console.error('Failed to create backup on window blur:', error)
  }
}

/**
 * Get the last activity time from localStorage.
 */
function getLastActivityTime(): number {
  try {
    const lastActivity = localStorage.getItem('kanban-last-activity')
    return lastActivity ? parseInt(lastActivity, 10) : Date.now()
  } catch {
    return Date.now()
  }
}

/**
 * Update the last activity time.
 */
export function updateLastActivity(): void {
  try {
    localStorage.setItem('kanban-last-activity', Date.now().toString())
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Create a comprehensive backup of all data.
 */
export async function createComprehensiveBackup(description?: string): Promise<void> {
  try {
    console.log('Checking for changes before comprehensive backup...')
    
    // Check if there are any uncommitted changes
    const notesChanges = changeDetector.getChangeSummary('notes')
    const tasksChanges = changeDetector.getChangeSummary('tasks')
    
    if (notesChanges.hasUncommittedChanges || tasksChanges.hasUncommittedChanges) {
      console.log('Uncommitted changes detected, creating comprehensive backup...')
      
      // Create backup using DataManager
      await dataManager.createBackup('manual', description || 'Comprehensive backup with changes')
      
      // Also backup individual stores
      const notesStore = useNotesStore.getState()
      const taskStore = useTaskStore.getState()
      
      await notesStore.autoSaveToFile()
      
      // Mark changes as committed
      changeDetector.markChangesCommitted('notes')
      changeDetector.markChangesCommitted('tasks')
      
      console.log('Comprehensive backup completed')
    } else {
      console.log('No changes detected, skipping comprehensive backup')
    }
  } catch (error) {
    console.error('Failed to create comprehensive backup:', error)
    throw error
  }
}

/**
 * Check if auto-backup is enabled in settings.
 */
export function isAutoBackupEnabled(): boolean {
  try {
    const settings = JSON.parse(localStorage.getItem('kanban-settings') || '{}')
    return settings.backups?.autoBackup?.enabled !== false // Default to true
  } catch {
    return true // Default to enabled
  }
}

/**
 * Set auto-backup enabled/disabled.
 */
export function setAutoBackupEnabled(enabled: boolean): void {
  try {
    const settings = JSON.parse(localStorage.getItem('kanban-settings') || '{}')
    if (!settings.backups) {
      settings.backups = {}
    }
    if (!settings.backups.autoBackup) {
      settings.backups.autoBackup = {}
    }
    settings.backups.autoBackup.enabled = enabled
    localStorage.setItem('kanban-settings', JSON.stringify(settings))
  } catch (error) {
    console.error('Failed to update auto-backup settings:', error)
  }
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    blurTimeout?: NodeJS.Timeout
  }
}
