import React, { useState, useEffect } from 'react'
import { dataManager, type DataLocation, type BackupInfo, type DataStats, type MigrationResult } from '../utils/dataManager'

interface DataManagementPanelProps {
  className?: string
}

export function DataManagementPanel({ className = '' }: DataManagementPanelProps) {
  const [currentLocation, setCurrentLocation] = useState<DataLocation | null>(null)
  const [backups, setBackups] = useState<BackupInfo[]>([])
  const [dataStats, setDataStats] = useState<DataStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCreatingBackup, setIsCreatingBackup] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const [isMigrating, setIsMigrating] = useState(false)
  const [newDataPath, setNewDataPath] = useState('')
  const [showBackupDetails, setShowBackupDetails] = useState<string | null>(null)
  const [integrityCheck, setIntegrityCheck] = useState<{ healthy: boolean; issues: string[] } | null>(null)
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false)
  const [maxBackups, setMaxBackups] = useState(10)

  useEffect(() => {
    loadDataManagementInfo()
  }, [])

  const loadDataManagementInfo = async () => {
    setIsLoading(true)
    try {
      const [location, backupList, stats] = await Promise.all([
        Promise.resolve(dataManager.getCurrentLocation()),
        dataManager.listBackups(),
        dataManager.getDataStats()
      ])
      
      setCurrentLocation(location)
      setBackups(backupList)
      setDataStats(stats)
    } catch (error) {
      console.error('Failed to load data management info:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true)
    try {
      const description = prompt('Enter backup description (optional):')
      await dataManager.createBackup('manual', description || undefined)
      await loadDataManagementInfo()
    } catch (error) {
      console.error('Failed to create backup:', error)
      alert(`Failed to create backup: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsCreatingBackup(false)
    }
  }

  const handleRestoreBackup = async (backupId: string) => {
    if (!confirm('This will restore data from the selected backup. Current data will be backed up first. Continue?')) {
      return
    }

    setIsRestoring(true)
    try {
      const result = await dataManager.restoreFromBackup(backupId)
      
      if (result.success) {
        alert(`Restoration completed successfully!\nMigrated ${result.migratedItems} items.${result.warnings.length > 0 ? `\nWarnings: ${result.warnings.join(', ')}` : ''}`)
        // Reload the page to reflect restored data
        window.location.reload()
      } else {
        alert(`Restoration failed:\n${result.errors.join('\n')}`)
      }
    } catch (error) {
      console.error('Failed to restore backup:', error)
      alert(`Failed to restore backup: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsRestoring(false)
    }
  }

  const handleDeleteBackup = async (backupId: string) => {
    if (!confirm('Are you sure you want to delete this backup? This action cannot be undone.')) {
      return
    }

    try {
      await dataManager.deleteBackup(backupId)
      await loadDataManagementInfo()
    } catch (error) {
      console.error('Failed to delete backup:', error)
      alert(`Failed to delete backup: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleChangeDataLocation = async () => {
    if (!newDataPath.trim()) {
      alert('Please enter a valid data path')
      return
    }

    setIsMigrating(true)
    try {
      const result = await dataManager.changeDataLocation(newDataPath.trim())
      
      if (result.success) {
        alert(`Data location changed successfully!\nMigrated ${result.migratedItems} items.${result.warnings.length > 0 ? `\nWarnings: ${result.warnings.join(', ')}` : ''}`)
        setNewDataPath('')
        await loadDataManagementInfo()
      } else {
        alert(`Failed to change data location:\n${result.errors.join('\n')}`)
      }
    } catch (error) {
      console.error('Failed to change data location:', error)
      alert(`Failed to change data location: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsMigrating(false)
    }
  }

  const handleIntegrityCheck = async () => {
    setIsLoading(true)
    try {
      const result = await dataManager.performIntegrityCheck()
      setIntegrityCheck(result)
    } catch (error) {
      console.error('Failed to perform integrity check:', error)
      alert(`Failed to perform integrity check: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleAutoBackup = async () => {
    try {
      if (autoBackupEnabled) {
        dataManager.stopAutomaticBackups()
        setAutoBackupEnabled(false)
      } else {
        dataManager.startAutomaticBackups()
        setAutoBackupEnabled(true)
      }
    } catch (error) {
      console.error('Failed to toggle auto backup:', error)
      alert(`Failed to toggle auto backup: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString()
  }

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <h3 className="font-medium">Data Management</h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <h3 className="font-medium text-lg">Data Management</h3>

      {/* Data Location */}
      <div className="rounded-md border p-4">
        <h4 className="font-medium mb-3">Data Location</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Current Location:</span>
            <span className="font-mono text-sm">{currentLocation?.path}</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter new data path..."
              value={newDataPath}
              onChange={(e) => setNewDataPath(e.target.value)}
              className="flex-1 rounded-md border bg-transparent p-2 text-sm"
              disabled={isMigrating}
            />
            <button
              onClick={handleChangeDataLocation}
              disabled={isMigrating || !newDataPath.trim()}
              className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isMigrating ? 'Migrating...' : 'Change Location'}
            </button>
          </div>
        </div>
      </div>

      {/* Data Statistics */}
      {dataStats && (
        <div className="rounded-md border p-4">
          <h4 className="font-medium mb-3">Data Statistics</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total Tasks:</span>
              <span className="ml-2 font-medium">{dataStats.totalTasks}</span>
            </div>
            <div>
              <span className="text-gray-600">Total Notes:</span>
              <span className="ml-2 font-medium">{dataStats.totalNotes}</span>
            </div>
            <div>
              <span className="text-gray-600">Total Size:</span>
              <span className="ml-2 font-medium">{formatFileSize(dataStats.totalSize)}</span>
            </div>
            <div>
              <span className="text-gray-600">Backups:</span>
              <span className="ml-2 font-medium">{dataStats.backupCount}</span>
            </div>
            <div>
              <span className="text-gray-600">Last Backup:</span>
              <span className="ml-2 font-medium">
                {dataStats.lastBackup ? formatDate(dataStats.lastBackup) : 'Never'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Data Integrity:</span>
              <span className={`ml-2 font-medium ${
                dataStats.dataIntegrity === 'good' ? 'text-green-600' :
                dataStats.dataIntegrity === 'warning' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {dataStats.dataIntegrity.charAt(0).toUpperCase() + dataStats.dataIntegrity.slice(1)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Backup Settings */}
      <div className="rounded-md border p-4">
        <h4 className="font-medium mb-3">Backup Settings</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Automatic Daily Backups</span>
            <input
              type="checkbox"
              checked={autoBackupEnabled}
              onChange={handleToggleAutoBackup}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Max Backups to Keep:</span>
            <input
              type="number"
              value={maxBackups}
              onChange={(e) => setMaxBackups(Number(e.target.value))}
              min="1"
              max="50"
              className="w-16 rounded-md border bg-transparent p-1 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Backup Management */}
      <div className="rounded-md border p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium">Backup Management</h4>
          <button
            onClick={handleCreateBackup}
            disabled={isCreatingBackup}
            className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isCreatingBackup ? 'Creating...' : 'Create Backup'}
          </button>
        </div>
        
        {backups.length === 0 ? (
          <p className="text-sm text-gray-500">No backups found. Create your first backup to get started.</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {backups.map((backup) => (
              <div key={backup.id} className="border rounded p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{backup.filename}</span>
                      <span className={`px-2 py-1 text-xs rounded ${
                        backup.type === 'auto' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {backup.type}
                      </span>
                      {backup.verified ? (
                        <span className="text-green-600 text-xs">✓ Verified</span>
                      ) : (
                        <span className="text-red-600 text-xs">⚠ Unverified</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {formatDate(backup.createdAt)} • {formatFileSize(backup.size)}
                      {backup.description && ` • ${backup.description}`}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setShowBackupDetails(showBackupDetails === backup.id ? null : backup.id)}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => handleRestoreBackup(backup.id)}
                      disabled={isRestoring}
                      className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Restore
                    </button>
                    <button
                      onClick={() => handleDeleteBackup(backup.id)}
                      className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {showBackupDetails === backup.id && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                    <div><strong>ID:</strong> {backup.id}</div>
                    <div><strong>Created:</strong> {backup.createdAt}</div>
                    <div><strong>Size:</strong> {formatFileSize(backup.size)}</div>
                    <div><strong>Type:</strong> {backup.type}</div>
                    <div><strong>Verified:</strong> {backup.verified ? 'Yes' : 'No'}</div>
                    {backup.description && <div><strong>Description:</strong> {backup.description}</div>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Data Integrity */}
      <div className="rounded-md border p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium">Data Integrity</h4>
          <button
            onClick={handleIntegrityCheck}
            disabled={isLoading}
            className="px-3 py-1 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Checking...' : 'Check Integrity'}
          </button>
        </div>
        
        {integrityCheck && (
          <div className={`p-3 rounded text-sm ${
            integrityCheck.healthy ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            <div className="font-medium">
              {integrityCheck.healthy ? '✓ Data integrity check passed' : '⚠ Data integrity issues found'}
            </div>
            {integrityCheck.issues.length > 0 && (
              <ul className="mt-2 list-disc list-inside">
                {integrityCheck.issues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Import/Export */}
      <div className="rounded-md border p-4">
        <h4 className="font-medium mb-3">Import/Export</h4>
        <div className="flex gap-2">
          <button
            onClick={() => {
              // This would integrate with the existing export functionality
              alert('Export functionality is available in the Tasks tab')
            }}
            className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Export Data
          </button>
          <button
            onClick={() => {
              // This would integrate with the existing import functionality
              alert('Import functionality is available in the Tasks tab')
            }}
            className="px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Import Data
          </button>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          Import and export functionality is available in the Tasks tab for better integration with task management.
        </p>
      </div>
    </div>
  )
}
