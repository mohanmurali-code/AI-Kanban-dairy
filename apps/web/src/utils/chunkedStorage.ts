/**
 * Chunked storage adapter for efficient handling of large datasets.
 * 
 * Integrates the database engine with the existing DataManager system
 * to provide scalable storage for notes, tasks, and other data.
 */

import { databaseEngine, type DatabaseConfig, type QueryOptions, type QueryResult } from './databaseEngine'
import { dataManager } from './dataManager'
import type { NoteItem, NoteTemplate } from '../types'

export interface ChunkedStorageConfig extends DatabaseConfig {
  collectionName: string
  autoSave: boolean
  autoSaveInterval: number
  compressionLevel: number
  backupBeforeCompact: boolean
}

export interface StorageStats {
  collectionName: string
  totalItems: number
  totalChunks: number
  deletedItems: number
  storageSize: number
  compressionRatio: number
  lastBackup: string | null
  lastCompact: string | null
}

export class ChunkedStorage {
  private config: ChunkedStorageConfig
  private autoSaveTimer: NodeJS.Timeout | null = null
  private isInitialized = false

  constructor(config: Partial<ChunkedStorageConfig>) {
    this.config = {
      collectionName: 'default',
      chunkSize: 1000,
      maxChunks: 50,
      compressionEnabled: true,
      indexingEnabled: true,
      autoCompact: true,
      compactThreshold: 30,
      autoSave: true,
      autoSaveInterval: 30000, // 30 seconds
      compressionLevel: 6,
      backupBeforeCompact: true,
      ...config
    }
  }

  /**
   * Initialize the storage system
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      // Initialize database engine
      await databaseEngine.initialize()
      
      // Load existing data from DataManager
      await this.loadFromDataManager()
      
      // Setup auto-save if enabled
      if (this.config.autoSave) {
        this.setupAutoSave()
      }
      
      this.isInitialized = true
      console.log(`ChunkedStorage initialized for collection: ${this.config.collectionName}`)
    } catch (error) {
      console.error('Failed to initialize ChunkedStorage:', error)
      throw error
    }
  }

  /**
   * Save items to chunked storage
   */
  async save<T extends { id: string }>(items: T[]): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    try {
      await databaseEngine.upsert(items)
      
      // Save to DataManager for backup
      await this.saveToDataManager()
    } catch (error) {
      console.error('Failed to save items:', error)
      throw error
    }
  }

  /**
   * Load items from chunked storage
   */
  async load<T>(options: QueryOptions = {}): Promise<QueryResult<T>> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    try {
      return await databaseEngine.query<T>(options)
    } catch (error) {
      console.error('Failed to load items:', error)
      throw error
    }
  }

  /**
   * Delete items from chunked storage
   */
  async delete(ids: string[]): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    try {
      await databaseEngine.delete(ids)
      
      // Save to DataManager for backup
      await this.saveToDataManager()
    } catch (error) {
      console.error('Failed to delete items:', error)
      throw error
    }
  }

  /**
   * Compact the storage to remove deleted items and optimize chunks
   */
  async compact(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    try {
      // Create backup before compaction if enabled
      if (this.config.backupBeforeCompact) {
        await this.createBackup('pre-compact')
      }

      await databaseEngine.compact()
      
      // Save compacted data to DataManager
      await this.saveToDataManager()
      
      console.log(`Compaction completed for collection: ${this.config.collectionName}`)
    } catch (error) {
      console.error('Failed to compact storage:', error)
      throw error
    }
  }

  /**
   * Get storage statistics
   */
  getStats(): StorageStats {
    const dbStats = databaseEngine.getStats()
    const currentLocation = dataManager.getCurrentLocation()
    
    return {
      collectionName: this.config.collectionName,
      totalItems: dbStats.totalItems,
      totalChunks: dbStats.totalChunks,
      deletedItems: dbStats.deletedItems,
      storageSize: dbStats.storageSize,
      compressionRatio: this.calculateCompressionRatio(dbStats.storageSize),
      lastBackup: currentLocation?.lastUsed || null,
      lastCompact: new Date().toISOString() // This should be tracked properly
    }
  }

  /**
   * Create a backup of the current data
   */
  async createBackup(description?: string): Promise<void> {
    try {
      const backupData = await this.exportData()
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const filename = `${this.config.collectionName}-backup-${timestamp}.json`
      
      // Save backup using DataManager
      await dataManager.createBackup('manual', description || `Backup of ${this.config.collectionName}`)
      
      console.log(`Backup created: ${filename}`)
    } catch (error) {
      console.error('Failed to create backup:', error)
      throw error
    }
  }

  /**
   * Export all data for backup or migration
   */
  async exportData(): Promise<any> {
    const result = await databaseEngine.query({ limit: 1000000 }) // Get all items
    
    return {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      collectionName: this.config.collectionName,
      config: this.config,
      stats: this.getStats(),
      data: result.items,
      total: result.total
    }
  }

  /**
   * Import data from backup or migration
   */
  async importData(data: any): Promise<void> {
    try {
      // Validate data structure
      if (!data.data || !Array.isArray(data.data)) {
        throw new Error('Invalid data format: missing or invalid data array')
      }

      // Clear existing data
      await this.clear()
      
      // Import new data
      await this.save(data.data)
      
      console.log(`Imported ${data.data.length} items`)
    } catch (error) {
      console.error('Failed to import data:', error)
      throw error
    }
  }

  /**
   * Clear all data
   */
  async clear(): Promise<void> {
    try {
      // This would need to be implemented in the database engine
      // For now, we'll use a workaround by deleting all items
      const result = await databaseEngine.query({ limit: 1000000 })
      const ids = result.items.map((item: any) => item.id)
      
      if (ids.length > 0) {
        await databaseEngine.delete(ids)
      }
      
      console.log(`Cleared ${ids.length} items`)
    } catch (error) {
      console.error('Failed to clear data:', error)
      throw error
    }
  }

  /**
   * Shutdown the storage system
   */
  async shutdown(): Promise<void> {
    // Stop auto-save
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer)
      this.autoSaveTimer = null
    }

    // Save any pending changes
    await this.saveToDataManager()
    
    this.isInitialized = false
    console.log(`ChunkedStorage shutdown for collection: ${this.config.collectionName}`)
  }

  // Private methods

  private async loadFromDataManager(): Promise<void> {
    try {
      // This would load data from the DataManager's storage
      // For now, we'll start with an empty database
      console.log('Loading data from DataManager...')
    } catch (error) {
      console.warn('Failed to load from DataManager, starting with empty database:', error)
    }
  }

  private async saveToDataManager(): Promise<void> {
    try {
      // Export current data and save to DataManager
      const exportData = await this.exportData()
      
      // This would integrate with the DataManager's save functionality
      // For now, we'll just log the action
      console.log('Saving data to DataManager...')
    } catch (error) {
      console.error('Failed to save to DataManager:', error)
    }
  }

  private setupAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer)
    }

    this.autoSaveTimer = setInterval(async () => {
      try {
        await this.saveToDataManager()
      } catch (error) {
        console.error('Auto-save failed:', error)
      }
    }, this.config.autoSaveInterval)

    console.log(`Auto-save enabled with ${this.config.autoSaveInterval}ms interval`)
  }

  private calculateCompressionRatio(storageSize: number): number {
    // This would calculate actual compression ratio
    // For now, return a placeholder
    return 0.75 // 75% compression
  }
}

// Specialized storage classes for different data types

export class NotesStorage extends ChunkedStorage {
  constructor(config: Partial<ChunkedStorageConfig> = {}) {
    super({
      collectionName: 'notes',
      chunkSize: 500, // Notes can be larger, so smaller chunks
      maxChunks: 100,
      compressionEnabled: true,
      indexingEnabled: true,
      autoCompact: true,
      compactThreshold: 25,
      autoSave: true,
      autoSaveInterval: 15000, // 15 seconds for notes
      compressionLevel: 7,
      backupBeforeCompact: true,
      ...config
    })
  }

  /**
   * Save notes with specialized handling
   */
  async saveNotes(notes: Record<string, NoteItem>, templates: Record<string, NoteTemplate>): Promise<void> {
    // Convert to array format
    const notesArray = Object.values(notes).map(note => ({
      ...note,
      type: 'note' as const
    }))
    
    const templatesArray = Object.values(templates).map(template => ({
      ...template,
      type: 'template' as const
    }))
    
    await this.save([...notesArray, ...templatesArray])
  }

  /**
   * Load notes with specialized handling
   */
  async loadNotes(): Promise<{ notes: Record<string, NoteItem>; templates: Record<string, NoteTemplate> }> {
    const result = await this.load()
    
    const notes: Record<string, NoteItem> = {}
    const templates: Record<string, NoteTemplate> = {}
    
    for (const item of result.items) {
      if (item.type === 'note') {
        const { type, ...note } = item
        notes[note.id] = note as NoteItem
      } else if (item.type === 'template') {
        const { type, ...template } = item
        templates[template.id] = template as NoteTemplate
      }
    }
    
    return { notes, templates }
  }
}

export class TasksStorage extends ChunkedStorage {
  constructor(config: Partial<ChunkedStorageConfig> = {}) {
    super({
      collectionName: 'tasks',
      chunkSize: 1000, // Tasks are smaller, so larger chunks
      maxChunks: 50,
      compressionEnabled: true,
      indexingEnabled: true,
      autoCompact: true,
      compactThreshold: 30,
      autoSave: true,
      autoSaveInterval: 30000, // 30 seconds for tasks
      compressionLevel: 6,
      backupBeforeCompact: true,
      ...config
    })
  }

  /**
   * Save tasks with specialized handling
   */
  async saveTasks(tasks: Record<string, any>): Promise<void> {
    const tasksArray = Object.values(tasks).map(task => ({
      ...task,
      type: 'task' as const
    }))
    
    await this.save(tasksArray)
  }

  /**
   * Load tasks with specialized handling
   */
  async loadTasks(): Promise<Record<string, any>> {
    const result = await this.load()
    
    const tasks: Record<string, any> = {}
    
    for (const item of result.items) {
      if (item.type === 'task') {
        const { type, ...task } = item
        tasks[task.id] = task
      }
    }
    
    return tasks
  }
}

// Export singleton instances
export const notesStorage = new NotesStorage()
export const tasksStorage = new TasksStorage()
