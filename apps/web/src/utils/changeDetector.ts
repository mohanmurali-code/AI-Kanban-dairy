/**
 * Change detection system for tracking data modifications.
 * 
 * Features:
 * - Deep change detection for complex objects
 * - Change tracking with timestamps
 * - Change summary and statistics
 * - Integration with auto-save and backup systems
 * - Memory-efficient change tracking
 */

export interface ChangeInfo {
  id: string
  type: 'create' | 'update' | 'delete' | 'move' | 'rename'
  field?: string
  oldValue?: any
  newValue?: any
  timestamp: string
  userId?: string
  sessionId: string
}

export interface ChangeSummary {
  totalChanges: number
  changesByType: Record<string, number>
  changesByField: Record<string, number>
  lastChangeAt: string | null
  sessionChanges: number
  hasUncommittedChanges: boolean
}

export interface ChangeDetectionConfig {
  enabled: boolean
  trackFieldLevel: boolean
  trackHistory: boolean
  maxHistorySize: number
  changeThreshold: number // Minimum changes before triggering save
  debounceTime: number // Debounce time for rapid changes
  compressionEnabled: boolean
}

export class ChangeDetector {
  private config: ChangeDetectionConfig
  private changes: Map<string, ChangeInfo> = new Map()
  private changeHistory: ChangeInfo[] = []
  private lastSnapshot: Map<string, any> = new Map()
  private changeCounters: Map<string, number> = new Map()
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map()
  private sessionId: string
  private isTracking = false

  constructor(config: Partial<ChangeDetectionConfig> = {}) {
    this.config = {
      enabled: true,
      trackFieldLevel: true,
      trackHistory: true,
      maxHistorySize: 1000,
      changeThreshold: 1,
      debounceTime: 1000, // 1 second
      compressionEnabled: true,
      ...config
    }
    
    this.sessionId = this.generateSessionId()
  }

  /**
   * Start tracking changes for a collection
   */
  startTracking(collectionId: string, initialData: Record<string, any>): void {
    if (!this.config.enabled) return
    
    this.isTracking = true
    this.takeSnapshot(collectionId, initialData)
    console.log(`Change detection started for collection: ${collectionId}`)
  }

  /**
   * Stop tracking changes
   */
  stopTracking(): void {
    this.isTracking = false
    this.clearDebounceTimers()
    console.log('Change detection stopped')
  }

  /**
   * Check if data has changed and track changes
   */
  detectChanges<T extends { id: string }>(
    collectionId: string,
    currentData: Record<string, T>,
    options: {
      forceCheck?: boolean
      trackFields?: string[]
      ignoreFields?: string[]
    } = {}
  ): ChangeSummary {
    if (!this.config.enabled || !this.isTracking) {
      return this.getEmptySummary()
    }

    const { forceCheck = false, trackFields, ignoreFields } = options
    const snapshot = this.lastSnapshot.get(collectionId)
    
    if (!snapshot && !forceCheck) {
      return this.getEmptySummary()
    }

    const changes: ChangeInfo[] = []
    const processedIds = new Set<string>()

    // Check for updates and deletions
    if (snapshot) {
      for (const [id, oldItem] of Object.entries(snapshot)) {
        const currentItem = currentData[id]
        processedIds.add(id)

        if (!currentItem) {
          // Item was deleted
          changes.push(this.createChangeInfo(id, 'delete', undefined, undefined, oldItem))
        } else if (this.hasItemChanged(oldItem, currentItem, trackFields, ignoreFields)) {
          // Item was updated
          const fieldChanges = this.detectFieldChanges(id, oldItem, currentItem, trackFields, ignoreFields)
          changes.push(...fieldChanges)
        }
      }
    }

    // Check for new items
    for (const [id, currentItem] of Object.entries(currentData)) {
      if (!processedIds.has(id)) {
        changes.push(this.createChangeInfo(id, 'create', undefined, undefined, currentItem))
      }
    }

    // Add changes to tracking
    this.addChanges(collectionId, changes)

    // Update snapshot
    this.takeSnapshot(collectionId, currentData)

    return this.getChangeSummary(collectionId)
  }

  /**
   * Check if specific items have changed
   */
  hasItemsChanged<T extends { id: string }>(
    collectionId: string,
    items: T[],
    options: {
      trackFields?: string[]
      ignoreFields?: string[]
    } = {}
  ): boolean {
    if (!this.config.enabled || !this.isTracking) return false

    const snapshot = this.lastSnapshot.get(collectionId)
    if (!snapshot) return true

    const { trackFields, ignoreFields } = options

    for (const item of items) {
      const oldItem = snapshot[item.id]
      if (!oldItem || this.hasItemChanged(oldItem, item, trackFields, ignoreFields)) {
        return true
      }
    }

    return false
  }

  /**
   * Get change summary for a collection
   */
  getChangeSummary(collectionId: string): ChangeSummary {
    const collectionChanges = Array.from(this.changes.values())
      .filter(change => change.id.startsWith(collectionId))

    const changesByType: Record<string, number> = {}
    const changesByField: Record<string, number> = {}
    let lastChangeAt: string | null = null

    for (const change of collectionChanges) {
      // Count by type
      changesByType[change.type] = (changesByType[change.type] || 0) + 1
      
      // Count by field
      if (change.field) {
        changesByField[change.field] = (changesByField[change.field] || 0) + 1
      }
      
      // Track last change
      if (!lastChangeAt || change.timestamp > lastChangeAt) {
        lastChangeAt = change.timestamp
      }
    }

    const sessionChanges = collectionChanges.filter(c => c.sessionId === this.sessionId).length

    return {
      totalChanges: collectionChanges.length,
      changesByType,
      changesByField,
      lastChangeAt,
      sessionChanges,
      hasUncommittedChanges: collectionChanges.length > 0
    }
  }

  /**
   * Check if changes meet the threshold for triggering operations
   */
  shouldTriggerOperation(collectionId: string, operation: 'save' | 'backup'): boolean {
    if (!this.config.enabled) return false

    const summary = this.getChangeSummary(collectionId)
    const threshold = operation === 'backup' ? this.config.changeThreshold * 2 : this.config.changeThreshold

    return summary.totalChanges >= threshold
  }

  /**
   * Get changes that should be committed
   */
  getUncommittedChanges(collectionId: string): ChangeInfo[] {
    return Array.from(this.changes.values())
      .filter(change => change.id.startsWith(collectionId))
  }

  /**
   * Mark changes as committed (clears them from tracking)
   */
  markChangesCommitted(collectionId: string): void {
    const committedChanges = Array.from(this.changes.keys())
      .filter(key => key.startsWith(collectionId))

    for (const key of committedChanges) {
      const change = this.changes.get(key)
      if (change && this.config.trackHistory) {
        this.addToHistory(change)
      }
      this.changes.delete(key)
    }

    console.log(`Marked ${committedChanges.length} changes as committed for collection: ${collectionId}`)
  }

  /**
   * Get change history
   */
  getChangeHistory(limit?: number): ChangeInfo[] {
    if (!this.config.trackHistory) return []
    
    const history = [...this.changeHistory].reverse()
    return limit ? history.slice(0, limit) : history
  }

  /**
   * Clear change history
   */
  clearChangeHistory(): void {
    this.changeHistory = []
    console.log('Change history cleared')
  }

  /**
   * Get change statistics
   */
  getChangeStats(): {
    totalChanges: number
    totalSessions: number
    averageChangesPerSession: number
    mostChangedFields: Array<{ field: string; count: number }>
    changeTimeline: Array<{ date: string; count: number }>
  } {
    const allChanges = [...this.changes.values(), ...this.changeHistory]
    const sessions = new Set(allChanges.map(c => c.sessionId))
    
    // Count changes by field
    const fieldCounts: Record<string, number> = {}
    for (const change of allChanges) {
      if (change.field) {
        fieldCounts[change.field] = (fieldCounts[change.field] || 0) + 1
      }
    }

    // Get most changed fields
    const mostChangedFields = Object.entries(fieldCounts)
      .map(([field, count]) => ({ field, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Group changes by date
    const dateCounts: Record<string, number> = {}
    for (const change of allChanges) {
      const date = change.timestamp.split('T')[0]
      dateCounts[date] = (dateCounts[date] || 0) + 1
    }

    const changeTimeline = Object.entries(dateCounts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return {
      totalChanges: allChanges.length,
      totalSessions: sessions.size,
      averageChangesPerSession: allChanges.length / Math.max(1, sessions.size),
      mostChangedFields,
      changeTimeline
    }
  }

  /**
   * Reset change tracking for a collection
   */
  resetCollection(collectionId: string): void {
    const keysToDelete = Array.from(this.changes.keys())
      .filter(key => key.startsWith(collectionId))

    for (const key of keysToDelete) {
      this.changes.delete(key)
    }

    this.lastSnapshot.delete(collectionId)
    this.changeCounters.delete(collectionId)
    
    console.log(`Reset change tracking for collection: ${collectionId}`)
  }

  // Private methods

  private takeSnapshot(collectionId: string, data: Record<string, any>): void {
    const snapshot = new Map<string, any>()
    
    for (const [id, item] of Object.entries(data)) {
      snapshot.set(id, this.deepClone(item))
    }
    
    this.lastSnapshot.set(collectionId, snapshot)
  }

  private hasItemChanged(oldItem: any, newItem: any, trackFields?: string[], ignoreFields?: string[]): boolean {
    if (!oldItem || !newItem) return true
    
    const fieldsToCheck = trackFields || Object.keys(newItem)
    const fieldsToIgnore = new Set(ignoreFields || [])

    for (const field of fieldsToCheck) {
      if (fieldsToIgnore.has(field)) continue
      
      const oldValue = this.getNestedValue(oldItem, field)
      const newValue = this.getNestedValue(newItem, field)
      
      if (!this.isEqual(oldValue, newValue)) {
        return true
      }
    }

    return false
  }

  private detectFieldChanges(
    id: string,
    oldItem: any,
    newItem: any,
    trackFields?: string[],
    ignoreFields?: string[]
  ): ChangeInfo[] {
    if (!this.config.trackFieldLevel) {
      return [this.createChangeInfo(id, 'update', undefined, oldItem, newItem)]
    }

    const changes: ChangeInfo[] = []
    const fieldsToCheck = trackFields || Object.keys(newItem)
    const fieldsToIgnore = new Set(ignoreFields || [])

    for (const field of fieldsToCheck) {
      if (fieldsToIgnore.has(field)) continue
      
      const oldValue = this.getNestedValue(oldItem, field)
      const newValue = this.getNestedValue(newItem, field)
      
      if (!this.isEqual(oldValue, newValue)) {
        changes.push(this.createChangeInfo(id, 'update', field, oldValue, newValue))
      }
    }

    return changes
  }

  private createChangeInfo(
    id: string,
    type: ChangeInfo['type'],
    field: string | undefined,
    oldValue: any,
    newValue: any
  ): ChangeInfo {
    return {
      id: `${id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      field,
      oldValue: this.config.compressionEnabled ? this.compressValue(oldValue) : oldValue,
      newValue: this.config.compressionEnabled ? this.compressValue(newValue) : newValue,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId
    }
  }

  private addChanges(collectionId: string, changes: ChangeInfo[]): void {
    for (const change of changes) {
      this.changes.set(change.id, change)
      
      // Update change counter
      const counter = this.changeCounters.get(collectionId) || 0
      this.changeCounters.set(collectionId, counter + 1)
    }

    // Add to history if tracking is enabled
    if (this.config.trackHistory) {
      for (const change of changes) {
        this.addToHistory(change)
      }
    }
  }

  private addToHistory(change: ChangeInfo): void {
    this.changeHistory.push(change)
    
    // Maintain history size limit
    if (this.changeHistory.length > this.config.maxHistorySize) {
      this.changeHistory.shift()
    }
  }

  private addDebouncedChange(collectionId: string, change: ChangeInfo): void {
    const timerKey = `${collectionId}_${change.type}`
    
    // Clear existing timer
    if (this.debounceTimers.has(timerKey)) {
      clearTimeout(this.debounceTimers.get(timerKey)!)
    }

    // Set new timer
    const timer = setTimeout(() => {
      this.addChanges(collectionId, [change])
      this.debounceTimers.delete(timerKey)
    }, this.config.debounceTime)

    this.debounceTimers.set(timerKey, timer)
  }

  private clearDebounceTimers(): void {
    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer)
    }
    this.debounceTimers.clear()
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  private isEqual(a: any, b: any): boolean {
    if (a === b) return true
    if (a == null || b == null) return false
    if (typeof a !== typeof b) return false
    
    if (typeof a === 'object') {
      if (Array.isArray(a) !== Array.isArray(b)) return false
      
      const keysA = Object.keys(a)
      const keysB = Object.keys(b)
      
      if (keysA.length !== keysB.length) return false
      
      for (const key of keysA) {
        if (!keysB.includes(key) || !this.isEqual(a[key], b[key])) {
          return false
        }
      }
      
      return true
    }
    
    return false
  }

  private deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') return obj
    if (obj instanceof Date) return new Date(obj.getTime()) as any
    if (Array.isArray(obj)) return obj.map(item => this.deepClone(item)) as any
    
    const cloned = {} as T
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = this.deepClone(obj[key])
      }
    }
    
    return cloned
  }

  private compressValue(value: any): any {
    if (this.config.compressionEnabled && typeof value === 'string' && value.length > 100) {
      // Simple compression for long strings
      return value.length > 200 ? 
        `${value.substring(0, 100)}...${value.substring(value.length - 100)}` : 
        value
    }
    return value
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private getEmptySummary(): ChangeSummary {
    return {
      totalChanges: 0,
      changesByType: {},
      changesByField: {},
      lastChangeAt: null,
      sessionChanges: 0,
      hasUncommittedChanges: false
    }
  }
}

// Export singleton instance
export const changeDetector = new ChangeDetector()
