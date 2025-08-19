/**
 * File storage utilities for JSON persistence.
 * 
 * Provides methods to save and load data from local JSON files.
 * Uses the File System Access API when available, falls back to download/upload.
 */

export interface FileStorageData {
  version: string
  exportedAt: string
  tasks: Record<string, any>
  columnOrder: Record<string, string[]>
}

/**
 * Save data to a JSON file using the File System Access API or download.
 */
export async function saveToFile(data: FileStorageData, filename?: string): Promise<void> {
  const defaultFilename = `kanban-tasks-${new Date().toISOString().split('T')[0]}.json`
  const finalFilename = filename || defaultFilename
  
  // Try to use File System Access API if available
  if ('showSaveFilePicker' in window) {
    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: finalFilename,
        types: [{
          description: 'JSON Files',
          accept: {
            'application/json': ['.json'],
          },
        }],
      })
      
      const writable = await handle.createWritable()
      await writable.write(JSON.stringify(data, null, 2))
      await writable.close()
      return
    } catch (error) {
      console.warn('File System Access API failed, falling back to download:', error)
    }
  }
  
  // Fallback: Create download link
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = finalFilename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Load data from a JSON file using the File System Access API or file input.
 */
export async function loadFromFile(): Promise<FileStorageData> {
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
      
      const file = await fileHandle.getFile()
      const content = await file.text()
      const data = JSON.parse(content)
      
      // Validate data structure
      validateFileData(data)
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
        validateFileData(data)
        resolve(data)
      } catch (error) {
        reject(new Error(`Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`))
      }
    }
    input.click()
  })
}

/**
 * Validate the structure of loaded file data.
 */
function validateFileData(data: any): asserts data is FileStorageData {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid file format: not an object')
  }
  
  if (!data.version || typeof data.version !== 'string') {
    throw new Error('Invalid file format: missing or invalid version')
  }
  
  if (!data.tasks || typeof data.tasks !== 'object') {
    throw new Error('Invalid file format: missing or invalid tasks')
  }
  
  if (!data.columnOrder || typeof data.columnOrder !== 'object') {
    throw new Error('Invalid file format: missing or invalid columnOrder')
  }
  
  // Validate tasks structure
  for (const [id, task] of Object.entries(data.tasks)) {
    if (typeof task !== 'object' || !task.title || !task.status) {
      throw new Error(`Invalid task format for task ${id}`)
    }
  }
  
  // Validate column order structure
  const validColumns = ['draft', 'refined', 'in_progress', 'blocked', 'completed']
  for (const column of validColumns) {
    if (!Array.isArray(data.columnOrder[column])) {
      throw new Error(`Invalid column order for column ${column}`)
    }
  }
}

/**
 * Check if File System Access API is supported.
 */
export function isFileSystemAccessSupported(): boolean {
  return 'showSaveFilePicker' in window && 'showOpenFilePicker' in window
}

/**
 * Get the default data directory path (for informational purposes).
 */
export function getDefaultDataPath(): string {
  // This is informational only - actual path depends on user's file system
  return '~/Documents/Kanban-Diary/'
}

/**
 * Create a backup of current data with timestamp.
 */
export function createBackupFilename(): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  return `kanban-backup-${timestamp}.json`
}
