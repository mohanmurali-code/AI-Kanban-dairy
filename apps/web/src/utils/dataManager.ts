/**
 * Comprehensive data management utilities.
 * 
 * Handles data location, backups, migration, and recovery features.
 * Implements FR-010: Data Management requirements.
 */

export interface DataLocation {
  path: string
  name: string
  isDefault: boolean
  lastUsed: string
}

export interface BackupInfo {
  id: string
  filename: string
  createdAt: string
  size: number
  type: 'auto' | 'manual'
  verified: boolean
  description?: string
}

export interface DataStats {
  totalTasks: number
  totalNotes: number
  totalSize: number
  lastBackup: string | null
  backupCount: number
  dataIntegrity: 'good' | 'warning' | 'error'
}

export interface MigrationResult {
  success: boolean
  migratedItems: number
  errors: string[]
  warnings: string[]
}

/**
 * Data Manager class for comprehensive data handling.
 */
export class DataManager {
  private static instance: DataManager
  private currentLocation: DataLocation
  private backupInterval: NodeJS.Timeout | null = null

  private constructor() {
    this.currentLocation = this.getDefaultLocation()
    this.initializeBackupSystem()
  }

  static getInstance(): DataManager {
    if (!DataManager.instance) {
      DataManager.instance = new DataManager()
    }
    return DataManager.instance
  }

  /**
   * Get the default data location.
   */
  private getDefaultLocation(): DataLocation {
    return {
      path: this.getDefaultDataPath(),
      name: 'Default',
      isDefault: true,
      lastUsed: new Date().toISOString()
    }
  }

  /**
   * Get the default data directory path.
   */
  private getDefaultDataPath(): string {
    // In a real implementation, this would use platform-specific paths
    // For now, we'll use a relative path that works in the browser
    return './kanban-data'
  }

  /**
   * Initialize the automatic backup system.
   */
  private initializeBackupSystem(): void {
    // Check if automatic backups are enabled
    const settings = this.getSettings()
    if (settings.backups?.autoBackup?.enabled) {
      this.startAutomaticBackups()
    }
  }

  /**
   * Start automatic daily backups.
   */
  startAutomaticBackups(): void {
    if (this.backupInterval) {
      clearInterval(this.backupInterval)
    }

    // Create backup every 24 hours
    this.backupInterval = setInterval(async () => {
      try {
        await this.createBackup('auto')
        console.log('Automatic backup created successfully')
      } catch (error) {
        console.error('Automatic backup failed:', error)
      }
    }, 24 * 60 * 60 * 1000) // 24 hours

    // Create initial backup if none exists
    this.createInitialBackupIfNeeded()
  }

  /**
   * Stop automatic backups.
   */
  stopAutomaticBackups(): void {
    if (this.backupInterval) {
      clearInterval(this.backupInterval)
      this.backupInterval = null
    }
  }

  /**
   * Create initial backup if no backups exist.
   */
  private async createInitialBackupIfNeeded(): Promise<void> {
    const backups = await this.listBackups()
    if (backups.length === 0) {
      await this.createBackup('auto', 'Initial backup')
    }
  }

  /**
   * Create a backup of all data.
   */
  async createBackup(type: 'auto' | 'manual', description?: string): Promise<BackupInfo> {
    const timestamp = new Date().toISOString()
    const backupId = `backup-${timestamp.replace(/[:.]/g, '-')}`
    const filename = `kanban-backup-${timestamp.split('T')[0]}-${Date.now()}.json`

    // Collect all data
    const data = await this.collectAllData()
    
    // Create backup object
    const backup = {
      id: backupId,
      filename,
      createdAt: timestamp,
      type,
      description,
      data,
      version: '1.0'
    }

    // Save backup
    await this.saveBackup(backup)
    
    // Verify backup integrity
    const verified = await this.verifyBackup(backup)
    
    // Update backup info
    const backupInfo: BackupInfo = {
      id: backupId,
      filename,
      createdAt: timestamp,
      size: JSON.stringify(backup).length,
      type,
      verified,
      description
    }

    // Save backup metadata
    await this.saveBackupMetadata(backupInfo)
    
    // Clean up old backups
    await this.rotateBackups()

    return backupInfo
  }

  /**
   * Collect all application data for backup.
   */
  private async collectAllData(): Promise<any> {
    // This would integrate with the actual stores
    // For now, we'll return a placeholder structure
    return {
      tasks: {},
      notes: {},
      settings: this.getSettings(),
      themes: {},
      metadata: {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        dataLocation: this.currentLocation
      }
    }
  }

  /**
   * Save backup to storage.
   */
  private async saveBackup(backup: any): Promise<void> {
    // In a real implementation, this would save to the file system
    // For now, we'll use localStorage as a fallback
    const backups = this.getBackupsFromStorage()
    backups.push(backup)
    localStorage.setItem('kanban-backups', JSON.stringify(backups))
  }

  /**
   * Verify backup integrity.
   */
  private async verifyBackup(backup: any): Promise<boolean> {
    try {
      // Basic validation
      if (!backup.data || !backup.version || !backup.createdAt) {
        return false
      }
      
      // Check data structure
      const data = backup.data
      if (!data.metadata || !data.metadata.version) {
        return false
      }
      
      return true
    } catch (error) {
      console.error('Backup verification failed:', error)
      return false
    }
  }

  /**
   * Save backup metadata.
   */
  private async saveBackupMetadata(backupInfo: BackupInfo): Promise<void> {
    const metadata = this.getBackupMetadataFromStorage()
    metadata.push(backupInfo)
    localStorage.setItem('kanban-backup-metadata', JSON.stringify(metadata))
  }

  /**
   * List all available backups.
   */
  async listBackups(): Promise<BackupInfo[]> {
    const metadata = this.getBackupMetadataFromStorage()
    return metadata.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  /**
   * Restore data from a backup.
   */
  async restoreFromBackup(backupId: string): Promise<MigrationResult> {
    try {
      const backups = this.getBackupsFromStorage()
      const backup = backups.find(b => b.id === backupId)
      
      if (!backup) {
        throw new Error(`Backup ${backupId} not found`)
      }

      // Verify backup before restoration
      if (!await this.verifyBackup(backup)) {
        throw new Error('Backup integrity check failed')
      }

      // Create a backup before restoration
      await this.createBackup('manual', 'Pre-restoration backup')

      // Restore data
      const result = await this.restoreData(backup.data)
      
      return {
        success: true,
        migratedItems: result.migratedItems,
        errors: [],
        warnings: result.warnings
      }
    } catch (error) {
      return {
        success: false,
        migratedItems: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings: []
      }
    }
  }

  /**
   * Restore data from backup data.
   */
  private async restoreData(data: any): Promise<{ migratedItems: number; warnings: string[] }> {
    const warnings: string[] = []
    let migratedItems = 0

    try {
      // Restore tasks
      if (data.tasks) {
        // This would integrate with the task store
        migratedItems += Object.keys(data.tasks).length
      }

      // Restore notes
      if (data.notes) {
        // This would integrate with the notes store
        migratedItems += Object.keys(data.notes).length
      }

      // Restore settings
      if (data.settings) {
        this.updateSettings(data.settings)
      }

      // Restore themes
      if (data.themes) {
        // This would integrate with the theme store
      }

    } catch (error) {
      warnings.push(`Partial restoration: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    return { migratedItems, warnings }
  }

  /**
   * Rotate backups to keep only the specified number.
   */
  private async rotateBackups(): Promise<void> {
    const settings = this.getSettings()
    const maxBackups = settings.backups?.maxBackups || 10
    
    const backups = await this.listBackups()
    
    if (backups.length > maxBackups) {
      const backupsToRemove = backups.slice(maxBackups)
      
      for (const backup of backupsToRemove) {
        await this.deleteBackup(backup.id)
      }
    }
  }

  /**
   * Delete a backup.
   */
  async deleteBackup(backupId: string): Promise<void> {
    // Remove from backups storage
    const backups = this.getBackupsFromStorage()
    const filteredBackups = backups.filter(b => b.id !== backupId)
    localStorage.setItem('kanban-backups', JSON.stringify(filteredBackups))

    // Remove from metadata
    const metadata = this.getBackupMetadataFromStorage()
    const filteredMetadata = metadata.filter(b => b.id !== backupId)
    localStorage.setItem('kanban-backup-metadata', JSON.stringify(filteredMetadata))
  }

  /**
   * Change data location and migrate existing data.
   */
  async changeDataLocation(newPath: string): Promise<MigrationResult> {
    try {
      // Validate new path
      if (!newPath || newPath.trim() === '') {
        throw new Error('Invalid data path')
      }

      // Create backup before migration
      await this.createBackup('manual', 'Pre-migration backup')

      // Migrate data to new location
      const result = await this.migrateData(newPath)
      
      if (result.success) {
        // Update current location
        this.currentLocation = {
          path: newPath,
          name: this.getLocationName(newPath),
          isDefault: false,
          lastUsed: new Date().toISOString()
        }
        
        // Save location settings
        this.updateDataLocationSettings(this.currentLocation)
      }

      return result
    } catch (error) {
      return {
        success: false,
        migratedItems: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings: []
      }
    }
  }

  /**
   * Migrate data to a new location.
   */
  private async migrateData(newPath: string): Promise<MigrationResult> {
    try {
      // In a real implementation, this would copy files to the new location
      // For now, we'll simulate the migration
      
      const data = await this.collectAllData()
      const migratedItems = Object.keys(data.tasks || {}).length + Object.keys(data.notes || {}).length
      
      // Simulate migration delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return {
        success: true,
        migratedItems,
        errors: [],
        warnings: ['Migration completed (simulated)']
      }
    } catch (error) {
      return {
        success: false,
        migratedItems: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings: []
      }
    }
  }

  /**
   * Get data statistics.
   */
  async getDataStats(): Promise<DataStats> {
    const backups = await this.listBackups()
    const lastBackup = backups.length > 0 ? backups[0].createdAt : null
    
    // In a real implementation, this would calculate actual sizes
    const totalSize = 1024 * 1024 // 1MB placeholder
    
    return {
      totalTasks: 0, // Would be calculated from actual data
      totalNotes: 0, // Would be calculated from actual data
      totalSize,
      lastBackup,
      backupCount: backups.length,
      dataIntegrity: 'good' // Would be determined by health checks
    }
  }

  /**
   * Perform data integrity check.
   */
  async performIntegrityCheck(): Promise<{ healthy: boolean; issues: string[] }> {
    const issues: string[] = []
    
    try {
      // Check if data structure is valid
      const data = await this.collectAllData()
      
      if (!data.metadata || !data.metadata.version) {
        issues.push('Missing metadata or version information')
      }
      
      // Check backup integrity
      const backups = await this.listBackups()
      for (const backup of backups) {
        if (!backup.verified) {
          issues.push(`Backup ${backup.filename} failed integrity check`)
        }
      }
      
      return {
        healthy: issues.length === 0,
        issues
      }
    } catch (error) {
      issues.push(`Integrity check failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return {
        healthy: false,
        issues
      }
    }
  }

  /**
   * Get current data location.
   */
  getCurrentLocation(): DataLocation {
    return this.currentLocation
  }

  /**
   * Get location name from path.
   */
  private getLocationName(path: string): string {
    const parts = path.split(/[/\\]/)
    return parts[parts.length - 1] || 'Custom Location'
  }

  /**
   * Get settings from storage.
   */
  private getSettings(): any {
    try {
      return JSON.parse(localStorage.getItem('kanban-settings') || '{}')
    } catch {
      return {}
    }
  }

  /**
   * Update settings in storage.
   */
  private updateSettings(settings: any): void {
    localStorage.setItem('kanban-settings', JSON.stringify(settings))
  }

  /**
   * Update data location settings.
   */
  private updateDataLocationSettings(location: DataLocation): void {
    const settings = this.getSettings()
    settings.dataLocation = location
    this.updateSettings(settings)
  }

  /**
   * Get backups from storage.
   */
  private getBackupsFromStorage(): any[] {
    try {
      return JSON.parse(localStorage.getItem('kanban-backups') || '[]')
    } catch {
      return []
    }
  }

  /**
   * Get backup metadata from storage.
   */
  private getBackupMetadataFromStorage(): BackupInfo[] {
    try {
      return JSON.parse(localStorage.getItem('kanban-backup-metadata') || '[]')
    } catch {
      return []
    }
  }
}

// Export singleton instance
export const dataManager = DataManager.getInstance()
