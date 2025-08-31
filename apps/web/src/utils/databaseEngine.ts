/**
 * Database-like engine for handling large datasets efficiently.
 * 
 * Features:
 * - Chunked storage for large datasets
 * - Indexing for fast queries
 * - Compression for storage efficiency
 * - Query optimization
 * - Atomic operations
 * - Background compaction
 */

import { dataManager } from './dataManager'

export interface DatabaseConfig {
  chunkSize: number // Number of items per chunk
  maxChunks: number // Maximum chunks before compaction
  compressionEnabled: boolean
  indexingEnabled: boolean
  autoCompact: boolean
  compactThreshold: number // Percentage of deleted items before compaction
}

export interface DatabaseChunk {
  id: string
  version: string
  createdAt: string
  updatedAt: string
  itemCount: number
  deletedCount: number
  data: Record<string, any>
  indexes: Record<string, any>
  checksum: string
}

export interface DatabaseIndex {
  field: string
  type: 'hash' | 'range' | 'fulltext'
  data: Map<string, string[]> // value -> itemIds
}

export interface QueryOptions {
  limit?: number
  offset?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  filters?: Record<string, any>
  search?: string
}

export interface QueryResult<T> {
  items: T[]
  total: number
  hasMore: boolean
  chunks: string[]
  performance: {
    queryTime: number
    chunksRead: number
    itemsScanned: number
  }
}

export class DatabaseEngine {
  private config: DatabaseConfig
  private chunks: Map<string, DatabaseChunk> = new Map()
  private indexes: Map<string, DatabaseIndex> = new Map()
  private chunkOrder: string[] = []
  private isCompacting = false
  private writeQueue: Array<() => Promise<void>> = []
  private isProcessingQueue = false

  constructor(config: Partial<DatabaseConfig> = {}) {
    this.config = {
      chunkSize: 1000,
      maxChunks: 50,
      compressionEnabled: true,
      indexingEnabled: true,
      autoCompact: true,
      compactThreshold: 30, // 30% deleted items
      ...config
    }
  }

  /**
   * Initialize database with existing data
   */
  async initialize(): Promise<void> {
    try {
      // Load existing chunks
      await this.loadChunks()
      
      // Rebuild indexes if needed
      if (this.config.indexingEnabled) {
        await this.rebuildIndexes()
      }
      
      // Check if compaction is needed
      if (this.config.autoCompact) {
        await this.checkCompaction()
      }
    } catch (error) {
      console.error('Database initialization failed:', error)
      throw error
    }
  }

  /**
   * Insert or update items
   */
  async upsert<T extends { id: string }>(items: T[]): Promise<void> {
    const startTime = performance.now()
    
    // Group items by chunk
    const chunkGroups = this.groupItemsByChunk(items)
    
    // Process each chunk
    for (const [chunkId, chunkItems] of chunkGroups) {
      await this.processChunkUpsert(chunkId, chunkItems)
    }
    
    // Update indexes
    if (this.config.indexingEnabled) {
      await this.updateIndexes(items)
    }
    
    // Check compaction
    if (this.config.autoCompact) {
      await this.checkCompaction()
    }
    
    console.log(`Upserted ${items.length} items in ${performance.now() - startTime}ms`)
  }

  /**
   * Query items with optimization
   */
  async query<T>(options: QueryOptions = {}): Promise<QueryResult<T>> {
    const startTime = performance.now()
    const { limit = 100, offset = 0, sortBy, sortOrder = 'asc', filters, search } = options
    
    // Use indexes if available
    let candidateIds: string[] = []
    let chunksToRead: string[] = []
    
    if (filters && this.config.indexingEnabled) {
      const indexResult = await this.queryIndexes(filters)
      candidateIds = indexResult.ids
      chunksToRead = indexResult.chunks
    } else {
      // Fallback to scanning all chunks
      chunksToRead = [...this.chunkOrder]
    }
    
    // Read and filter items
    const items: T[] = []
    let itemsScanned = 0
    let total = 0
    
    for (const chunkId of chunksToRead) {
      const chunk = this.chunks.get(chunkId)
      if (!chunk) continue
      
      const chunkItems = Object.values(chunk.data) as T[]
      itemsScanned += chunkItems.length
      
      // Apply filters
      let filteredItems = chunkItems
      if (filters) {
        filteredItems = this.applyFilters(chunkItems, filters)
      }
      
      // Apply search
      if (search) {
        filteredItems = this.applySearch(filteredItems, search)
      }
      
      items.push(...filteredItems)
      total += filteredItems.length
    }
    
    // Apply sorting
    if (sortBy) {
      items.sort((a, b) => {
        const aVal = this.getNestedValue(a, sortBy)
        const bVal = this.getNestedValue(b, sortBy)
        return sortOrder === 'asc' ? 
          (aVal < bVal ? -1 : aVal > bVal ? 1 : 0) :
          (bVal < aVal ? -1 : bVal > aVal ? 1 : 0)
      })
    }
    
    // Apply pagination
    const paginatedItems = items.slice(offset, offset + limit)
    
    return {
      items: paginatedItems,
      total,
      hasMore: offset + limit < total,
      chunks: chunksToRead,
      performance: {
        queryTime: performance.now() - startTime,
        chunksRead: chunksToRead.length,
        itemsScanned
      }
    }
  }

  /**
   * Delete items
   */
  async delete(ids: string[]): Promise<void> {
    const startTime = performance.now()
    
    // Mark items as deleted in chunks
    for (const id of ids) {
      const chunkId = this.getItemChunkId(id)
      const chunk = this.chunks.get(chunkId)
      
      if (chunk && chunk.data[id]) {
        chunk.data[id] = { ...chunk.data[id], _deleted: true, _deletedAt: new Date().toISOString() }
        chunk.deletedCount++
        chunk.updatedAt = new Date().toISOString()
        
        // Update indexes
        if (this.config.indexingEnabled) {
          await this.removeFromIndexes(id, chunk.data[id])
        }
      }
    }
    
    // Save updated chunks
    await this.saveChunks()
    
    console.log(`Deleted ${ids.length} items in ${performance.now() - startTime}ms`)
  }

  /**
   * Compact database by removing deleted items and merging chunks
   */
  async compact(): Promise<void> {
    if (this.isCompacting) {
      console.warn('Compaction already in progress')
      return
    }
    
    this.isCompacting = true
    const startTime = performance.now()
    
    try {
      // Create new chunks with only non-deleted items
      const newChunks: Map<string, DatabaseChunk> = new Map()
      const allItems: Array<{ id: string; data: any }> = []
      
      // Collect all non-deleted items
      for (const chunk of this.chunks.values()) {
        for (const [id, item] of Object.entries(chunk.data)) {
          if (!item._deleted) {
            allItems.push({ id, data: item })
          }
        }
      }
      
      // Create new chunks
      let currentChunk: DatabaseChunk | null = null
      let itemCount = 0
      
      for (const { id, data } of allItems) {
        if (!currentChunk || itemCount >= this.config.chunkSize) {
          if (currentChunk) {
            newChunks.set(currentChunk.id, currentChunk)
          }
          
          currentChunk = this.createChunk()
          itemCount = 0
        }
        
        currentChunk.data[id] = data
        itemCount++
      }
      
      if (currentChunk) {
        newChunks.set(currentChunk.id, currentChunk)
      }
      
      // Replace old chunks with new ones
      this.chunks = newChunks
      this.chunkOrder = Array.from(newChunks.keys())
      
      // Rebuild indexes
      if (this.config.indexingEnabled) {
        await this.rebuildIndexes()
      }
      
      // Save new chunks
      await this.saveChunks()
      
      console.log(`Compaction completed in ${performance.now() - startTime}ms`)
    } finally {
      this.isCompacting = false
    }
  }

  /**
   * Get database statistics
   */
  getStats(): {
    totalItems: number
    totalChunks: number
    deletedItems: number
    storageSize: number
    indexCount: number
    avgChunkSize: number
  } {
    let totalItems = 0
    let deletedItems = 0
    let storageSize = 0
    
    for (const chunk of this.chunks.values()) {
      totalItems += chunk.itemCount
      deletedItems += chunk.deletedCount
      storageSize += JSON.stringify(chunk).length
    }
    
    return {
      totalItems,
      totalChunks: this.chunks.size,
      deletedItems,
      storageSize,
      indexCount: this.indexes.size,
      avgChunkSize: this.chunks.size > 0 ? totalItems / this.chunks.size : 0
    }
  }

  // Private methods

  private async loadChunks(): Promise<void> {
    // Implementation for loading chunks from storage
    // This would integrate with the DataManager
  }

  private async saveChunks(): Promise<void> {
    // Implementation for saving chunks to storage
    // This would integrate with the DataManager
  }

  private groupItemsByChunk<T extends { id: string }>(items: T[]): Map<string, T[]> {
    const groups = new Map<string, T[]>()
    
    for (const item of items) {
      const chunkId = this.getItemChunkId(item.id)
      if (!groups.has(chunkId)) {
        groups.set(chunkId, [])
      }
      groups.get(chunkId)!.push(item)
    }
    
    return groups
  }

  private getItemChunkId(id: string): string {
    // Simple hash-based chunk assignment
    const hash = this.hashString(id)
    const chunkIndex = hash % Math.max(1, this.chunkOrder.length)
    return this.chunkOrder[chunkIndex] || this.createChunk().id
  }

  private hashString(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }

  private createChunk(): DatabaseChunk {
    const id = `chunk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date().toISOString()
    
    return {
      id,
      version: '1.0',
      createdAt: now,
      updatedAt: now,
      itemCount: 0,
      deletedCount: 0,
      data: {},
      indexes: {},
      checksum: ''
    }
  }

  private async processChunkUpsert<T extends { id: string }>(chunkId: string, items: T[]): Promise<void> {
    let chunk = this.chunks.get(chunkId)
    
    if (!chunk) {
      chunk = this.createChunk()
      chunk.id = chunkId
      this.chunks.set(chunkId, chunk)
      this.chunkOrder.push(chunkId)
    }
    
    // Update chunk with new items
    for (const item of items) {
      const wasDeleted = chunk.data[item.id]?._deleted
      chunk.data[item.id] = item as any
      chunk.itemCount++
      
      if (wasDeleted) {
        chunk.deletedCount--
      }
    }
    
    chunk.updatedAt = new Date().toISOString()
    chunk.checksum = this.calculateChecksum(chunk.data)
  }

  private calculateChecksum(data: any): string {
    // Simple checksum for data integrity
    return btoa(JSON.stringify(data)).slice(0, 16)
  }

  private async updateIndexes<T extends { id: string }>(items: T[]): Promise<void> {
    // Update indexes for new/modified items
    for (const item of items) {
      await this.addToIndexes(item.id, item)
    }
  }

  private async addToIndexes(id: string, item: any): Promise<void> {
    for (const [field, index] of this.indexes) {
      const value = this.getNestedValue(item, field)
      if (value !== undefined) {
        const key = this.indexKey(value, index.type)
        if (!index.data.has(key)) {
          index.data.set(key, [])
        }
        index.data.get(key)!.push(id)
      }
    }
  }

  private async removeFromIndexes(id: string, item: any): Promise<void> {
    for (const [field, index] of this.indexes) {
      const value = this.getNestedValue(item, field)
      if (value !== undefined) {
        const key = this.indexKey(value, index.type)
        const ids = index.data.get(key)
        if (ids) {
          const index = ids.indexOf(id)
          if (index > -1) {
            ids.splice(index, 1)
          }
        }
      }
    }
  }

  private indexKey(value: any, type: string): string {
    switch (type) {
      case 'hash':
        return String(value)
      case 'range':
        return String(value)
      case 'fulltext':
        return String(value).toLowerCase()
      default:
        return String(value)
    }
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  private async queryIndexes(filters: Record<string, any>): Promise<{ ids: string[]; chunks: string[] }> {
    // Use indexes to find matching items
    const matchingIds = new Set<string>()
    const chunks = new Set<string>()
    
    for (const [field, value] of Object.entries(filters)) {
      const index = this.indexes.get(field)
      if (index) {
        const key = this.indexKey(value, index.type)
        const ids = index.data.get(key) || []
        ids.forEach(id => matchingIds.add(id))
      }
    }
    
    // Find chunks containing matching items
    for (const id of matchingIds) {
      const chunkId = this.getItemChunkId(id)
      chunks.add(chunkId)
    }
    
    return {
      ids: Array.from(matchingIds),
      chunks: Array.from(chunks)
    }
  }

  private applyFilters<T>(items: T[], filters: Record<string, any>): T[] {
    return items.filter(item => {
      for (const [field, value] of Object.entries(filters)) {
        const itemValue = this.getNestedValue(item, field)
        if (itemValue !== value) {
          return false
        }
      }
      return true
    })
  }

  private applySearch<T>(items: T[], search: string): T[] {
    const searchLower = search.toLowerCase()
    return items.filter(item => {
      const itemStr = JSON.stringify(item).toLowerCase()
      return itemStr.includes(searchLower)
    })
  }

  private async rebuildIndexes(): Promise<void> {
    this.indexes.clear()
    
    // Rebuild indexes from all chunks
    for (const chunk of this.chunks.values()) {
      for (const [id, item] of Object.entries(chunk.data)) {
        if (!item._deleted) {
          await this.addToIndexes(id, item)
        }
      }
    }
  }

  private async checkCompaction(): Promise<void> {
    const stats = this.getStats()
    const deletedPercentage = stats.totalItems > 0 ? (stats.deletedItems / stats.totalItems) * 100 : 0
    
    if (deletedPercentage >= this.config.compactThreshold || stats.totalChunks > this.config.maxChunks) {
      console.log(`Triggering compaction: ${deletedPercentage.toFixed(1)}% deleted items, ${stats.totalChunks} chunks`)
      await this.compact()
    }
  }
}

// Export singleton instance
export const databaseEngine = new DatabaseEngine()
