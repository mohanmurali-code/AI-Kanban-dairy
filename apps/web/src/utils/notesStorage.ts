/**
 * Notes storage utilities for JSON file persistence.
 * 
 * Handles saving and loading notes from JSON files with integration
 * to the DataManager backup system.
 */

import { dataManager } from './dataManager'
import type { NoteItem, NoteTemplate } from '../types'

export interface NotesFileData {
  version: string
  exportedAt: string
  notes: Record<string, NoteItem>
  templates: Record<string, NoteTemplate>
  metadata: {
    totalNotes: number
    lastModified: string
    categories: string[]
    tags: string[]
  }
}

// Store the last used file handle for overwriting
let lastFileHandle: FileSystemFileHandle | null = null

/**
 * Save notes to a JSON file using the File System Access API or fallback.
 * 
 * @param notes - Notes data to save
 * @param templates - Templates data to save
 * @param filename - Optional filename (if not provided, uses last file or creates new)
 * @param overwrite - Whether to overwrite existing file or create new one
 */
export async function saveNotesToFile(
  notes: Record<string, NoteItem>,
  templates: Record<string, NoteTemplate>,
  filename?: string,
  overwrite: boolean = false
): Promise<void> {
  const notesData: NotesFileData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    notes,
    templates,
    metadata: {
      totalNotes: Object.keys(notes).length,
      lastModified: new Date().toISOString(),
      categories: [...new Set(Object.values(notes).flatMap(note => note.categories || []))],
      tags: [...new Set(Object.values(notes).flatMap(note => note.tags || []))]
    }
  }
  
  // Try to use File System Access API if available
  if ('showSaveFilePicker' in window) {
    try {
      let handle: FileSystemFileHandle
      
      if (overwrite && lastFileHandle) {
        // Overwrite the last used file
        handle = lastFileHandle
      } else {
        // Create new file or let user choose
        const defaultFilename = filename || `kanban-notes-${new Date().toISOString().split('T')[0]}.json`
        handle = await (window as any).showSaveFilePicker({
          suggestedName: defaultFilename,
          types: [{
            description: 'JSON Files',
            accept: {
              'application/json': ['.json'],
            },
          }],
        })
        // Store the handle for future overwrites
        lastFileHandle = handle
      }
      
      const writable = await handle.createWritable()
      await writable.write(JSON.stringify(notesData, null, 2))
      await writable.close()
      return
    } catch (error) {
      console.warn('File System Access API failed, falling back to download:', error)
    }
  }
  
  // Fallback: Create download link
  const defaultFilename = filename || `kanban-notes-${new Date().toISOString().split('T')[0]}.json`
  const blob = new Blob([JSON.stringify(notesData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = defaultFilename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Save notes to the same file (overwrite mode).
 * Uses the last file handle if available, otherwise prompts for file selection.
 */
export async function saveNotesToSameFile(
  notes: Record<string, NoteItem>,
  templates: Record<string, NoteTemplate>
): Promise<void> {
  return saveNotesToFile(notes, templates, undefined, true)
}

/**
 * Save notes to a new file (always create new).
 */
export async function saveNotesToNewFile(
  notes: Record<string, NoteItem>,
  templates: Record<string, NoteTemplate>,
  filename?: string
): Promise<void> {
  return saveNotesToFile(notes, templates, filename, false)
}

/**
 * Load notes from a JSON file using the File System Access API or file input.
 */
export async function loadNotesFromFile(): Promise<NotesFileData> {
  // Try to use File System Access API if available
  if ('showOpenFilePicker' in window) {
    try {
      const [fileHandle] = await (window as any).showOpenFilePicker({
        types: [{
          description: 'JSON Files',
          accept: {
            'application/json': ['.json'],
          },
        }],
        multiple: false,
      })
      
      // Store the handle for future overwrites
      lastFileHandle = fileHandle
      
      const file = await fileHandle.getFile()
      const content = await file.text()
      const data = JSON.parse(content)
      
      // Validate data structure
      validateNotesFileData(data)
      return data
    } catch (error) {
      console.warn('File System Access API failed, falling back to file input:', error)
    }
  }
  
  // Fallback: Use file input
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0]
      if (!file) {
        reject(new Error('No file selected'))
        return
      }
      
      try {
        const content = await file.text()
        const data = JSON.parse(content)
        validateNotesFileData(data)
        resolve(data)
      } catch (error) {
        reject(new Error(`Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`))
      }
    }
    input.click()
  })
}

/**
 * Validate the structure of loaded notes file data.
 */
function validateNotesFileData(data: any): asserts data is NotesFileData {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid file format: not an object')
  }
  
  if (!data.version || typeof data.version !== 'string') {
    throw new Error('Invalid file format: missing or invalid version')
  }
  
  if (!data.notes || typeof data.notes !== 'object') {
    throw new Error('Invalid file format: missing or invalid notes')
  }
  
  if (!data.templates || typeof data.templates !== 'object') {
    throw new Error('Invalid file format: missing or invalid templates')
  }
  
  // Validate notes structure
  for (const [id, note] of Object.entries(data.notes)) {
    if (typeof note !== 'object' || note === null || !('title' in note) || !('content' in note)) {
      throw new Error(`Invalid note format for note ${id}`)
    }
  }
  
  // Validate templates structure
  for (const [id, template] of Object.entries(data.templates)) {
    if (typeof template !== 'object' || template === null || !('name' in template) || !('content' in template)) {
      throw new Error(`Invalid template format for template ${id}`)
    }
  }
}

/**
 * Auto-save notes to file system when supported.
 * Uses a fixed filename and overwrites the same file.
 */
export async function autoSaveNotesToFile(
  notes: Record<string, NoteItem>,
  templates: Record<string, NoteTemplate>
): Promise<void> {
  try {
    // Only auto-save if we have a data location configured
    const currentLocation = dataManager.getCurrentLocation()
    if (currentLocation && !currentLocation.isDefault) {
      await saveNotesToFile(notes, templates, 'notes-auto-save.json', true)
    }
  } catch (error) {
    console.warn('Auto-save to file failed:', error)
    // Don't throw - auto-save failures shouldn't break the app
  }
}

/**
 * Create a backup of notes before exiting.
 * Always creates a new backup file with timestamp.
 */
export async function backupNotesOnExit(
  notes: Record<string, NoteItem>,
  templates: Record<string, NoteTemplate>
): Promise<void> {
  try {
    // Create a backup using the DataManager
    await dataManager.createBackup('auto', 'Notes backup on exit')
    
    // Also save to a dedicated notes file if file system is available
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    await saveNotesToFile(notes, templates, `notes-backup-${timestamp}.json`, false)
  } catch (error) {
    console.error('Failed to backup notes on exit:', error)
    // Don't throw - backup failures shouldn't prevent exit
  }
}

/**
 * Check if File System Access API is supported for notes.
 */
export function isNotesFileSystemSupported(): boolean {
  return 'showSaveFilePicker' in window && 'showOpenFilePicker' in window
}

/**
 * Get the default notes file path.
 */
export function getDefaultNotesPath(): string {
  return './kanban-notes.json'
}

/**
 * Create a backup filename for notes with timestamp.
 */
export function createNotesBackupFilename(): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  return `kanban-notes-backup-${timestamp}.json`
}

/**
 * Check if we have a file handle for overwriting.
 */
export function hasFileHandle(): boolean {
  return lastFileHandle !== null
}

/**
 * Clear the stored file handle.
 */
export function clearFileHandle(): void {
  lastFileHandle = null
}

/**
 * Get the filename of the last used file (if available).
 */
export async function getLastFileName(): Promise<string | null> {
  if (lastFileHandle) {
    try {
      return lastFileHandle.name
    } catch {
      return null
    }
  }
  return null
}
