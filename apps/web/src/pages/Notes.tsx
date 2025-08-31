import { useState, useEffect, useCallback } from 'react'
import { useNotesStore } from '../store/notes'
import { useTaskStore } from '../store/tasks'
import type { NoteItem, NoteFilters, ColumnKey } from '../types'

/**
 * Notes page with comprehensive note management features.
 */
function Notes() {
  const {
    notes,
    getAllNotes,
    createNote,
    updateNote,
    autoSaveNote,
    deleteNote,
    convertNoteToTask,
    getAllCategories,
    getAllTags,
    getAllTemplates,
    saveToFile,
    saveToSameFile,
    saveToNewFile,
    loadFromFile,
    autoSaveToFile,
    backupOnExit,
    hasFileHandle,
    getLastFileName,
    clearFileHandle,
  } = useNotesStore()

  const { getAllTasks } = useTaskStore()

  // State management
  const [selectedNote, setSelectedNote] = useState<NoteItem | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [showConvertModal, setShowConvertModal] = useState(false)
  const [showDataManagement, setShowDataManagement] = useState(false)
  const [isSavingToFile, setIsSavingToFile] = useState(false)
  const [isLoadingFromFile, setIsLoadingFromFile] = useState(false)
  const [lastFileName, setLastFileName] = useState<string | null>(null)
  const [convertData, setConvertData] = useState({
    title: '',
    status: 'draft' as ColumnKey,
    description: '',
    priority: 'medium' as const,
    dueDate: '',
    tags: [] as string[],
  })

  // Form state
  const [noteForm, setNoteForm] = useState({
    title: '',
    content: '',
    categories: [] as string[],
    tags: [] as string[],
    template: undefined as NoteItem['template'],
  })

  // Filter state
  const [filters, setFilters] = useState<NoteFilters>({
    search: '',
    categories: [],
    tags: [],
    showArchived: false,
  })

  // Get filtered notes
  const filteredNotes = getAllNotes(filters)
  const categories = getAllCategories()
  const tags = getAllTags()
  const templates = getAllTemplates()
  const tasks = getAllTasks()

  // Auto-save effect
  useEffect(() => {
    if (selectedNote && isEditing) {
      const timeoutId = setTimeout(() => {
        autoSaveNote(selectedNote.id, noteForm.content)
      }, 500)

      return () => clearTimeout(timeoutId)
    }
  }, [noteForm.content, selectedNote, isEditing, autoSaveNote])

  // Handle note selection
  const handleNoteSelect = useCallback((note: NoteItem) => {
    setSelectedNote(note)
    setNoteForm({
      title: note.title,
      content: note.content,
      categories: note.categories || [],
      tags: note.tags || [],
      template: note.template || undefined,
    })
    setIsEditing(false)
  }, [])

  // Handle new note creation
  const handleCreateNote = useCallback(async () => {
    try {
      const newNote = await createNote({
        title: noteForm.title || 'Untitled Note',
        content: noteForm.content,
        categories: noteForm.categories,
        tags: noteForm.tags,
        template: noteForm.template as any,
      })
      
      setSelectedNote(newNote)
      setIsCreating(false)
    } catch (error) {
      console.error('Failed to create note:', error)
      alert(`Failed to create note: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }, [createNote, noteForm])

  // Handle saving notes to file
  const handleSaveToFile = useCallback(async () => {
    setIsSavingToFile(true)
    try {
      await saveToFile()
      alert('Notes saved to file successfully!')
    } catch (error) {
      console.error('Failed to save notes to file:', error)
      alert(`Failed to save notes to file: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSavingToFile(false)
    }
  }, [saveToFile])

  // Handle saving to same file (overwrite)
  const handleSaveToSameFile = useCallback(async () => {
    setIsSavingToFile(true)
    try {
      await saveToSameFile()
      alert('Notes saved to same file successfully!')
    } catch (error) {
      console.error('Failed to save notes to same file:', error)
      alert(`Failed to save notes to same file: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSavingToFile(false)
    }
  }, [saveToSameFile])

  // Handle saving to new file
  const handleSaveToNewFile = useCallback(async () => {
    setIsSavingToFile(true)
    try {
      await saveToNewFile()
      alert('Notes saved to new file successfully!')
    } catch (error) {
      console.error('Failed to save notes to new file:', error)
      alert(`Failed to save notes to new file: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSavingToFile(false)
    }
  }, [saveToNewFile])

  // Handle loading notes from file
  const handleLoadFromFile = useCallback(async () => {
    if (!confirm('This will replace all current notes. Are you sure you want to continue?')) {
      return
    }
    
    setIsLoadingFromFile(true)
    try {
      await loadFromFile()
      alert('Notes loaded from file successfully!')
    } catch (error) {
      console.error('Failed to load notes from file:', error)
      alert(`Failed to load notes from file: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoadingFromFile(false)
    }
  }, [loadFromFile])

  // Handle auto-save to file
  const handleAutoSaveToFile = useCallback(async () => {
    try {
      await autoSaveToFile()
      console.log('Notes auto-saved to file')
    } catch (error) {
      console.error('Failed to auto-save notes to file:', error)
    }
  }, [autoSaveToFile])

  // Handle backup on exit
  const handleBackupOnExit = useCallback(async () => {
    try {
      await backupOnExit()
      alert('Notes backed up successfully!')
    } catch (error) {
      console.error('Failed to backup notes:', error)
      alert(`Failed to backup notes: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }, [backupOnExit])

  // Load last filename on mount
  useEffect(() => {
    const loadLastFileName = async () => {
      try {
        const fileName = await getLastFileName()
        setLastFileName(fileName)
      } catch (error) {
        console.warn('Failed to get last filename:', error)
      }
    }
    loadLastFileName()
  }, [getLastFileName])

  // Handle note update
  const handleUpdateNote = useCallback(async () => {
    if (!selectedNote) return

    try {
      await updateNote(selectedNote.id, {
        title: noteForm.title,
        content: noteForm.content,
        categories: noteForm.categories,
        tags: noteForm.tags,
        template: noteForm.template as any,
      })
      
      setSelectedNote({ ...selectedNote, ...noteForm })
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update note:', error)
    }
  }, [selectedNote, noteForm, updateNote])

  // Handle note deletion
  const handleDeleteNote = useCallback(async (noteId: string) => {
    try {
      deleteNote(noteId)
      if (selectedNote?.id === noteId) {
        setSelectedNote(null)
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Failed to delete note:', error)
    }
  }, [deleteNote, selectedNote])

  // Handle note to task conversion
  const handleConvertToTask = useCallback(async () => {
    if (!selectedNote) return

    try {
      const taskId = await convertNoteToTask(selectedNote.id, convertData)
      setShowConvertModal(false)
      setConvertData({
        title: '',
        status: 'draft',
        description: '',
        priority: 'medium',
        dueDate: '',
        tags: [],
      })
      // Optionally navigate to tasks or show success message
    } catch (error) {
      console.error('Failed to convert note to task:', error)
    }
  }, [selectedNote, convertData, convertNoteToTask])

  // Handle template selection
  const handleTemplateSelect = useCallback((templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (template) {
      setNoteForm(prev => ({
        ...prev,
        content: template.content,
        categories: template.category ? [template.category] : prev.categories,
        tags: template.tags || prev.tags,
        template: templateId as NoteItem['template'],
      }))
    }
  }, [templates])

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  // Truncate text for preview
  const truncateText = (text: string, maxLength: number = 100) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  return (
    <div className="flex h-full gap-4">
      {/* Notes List Panel */}
      <div className="w-80 flex flex-col border-r border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Notes</h2>
            <button
              onClick={() => {
                setIsCreating(true)
                setSelectedNote(null)
                setNoteForm({
                  title: '',
                  content: '',
                  categories: [],
                  tags: [],
                  template: undefined,
                })
              }}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              New Note
            </button>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search notes..."
            value={filters.search || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent"
          />

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="mt-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            {showFilters ? 'Hide' : 'Show'} Filters
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-3">
            {/* Categories */}
            <div>
              <label className="block text-sm font-medium mb-1">Categories</label>
              <select
                multiple
                value={filters.categories || []}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value)
                  setFilters(prev => ({ ...prev, categories: selected }))
                }}
                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium mb-1">Tags</label>
              <select
                multiple
                value={filters.tags || []}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value)
                  setFilters(prev => ({ ...prev, tags: selected }))
                }}
                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-transparent"
              >
                {tags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>

            {/* Show Archived */}
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.showArchived || false}
                onChange={(e) => setFilters(prev => ({ ...prev, showArchived: e.target.checked }))}
                className="mr-2"
              />
              Show Archived
            </label>

            {/* Data Management Toggle */}
            <button
              onClick={() => setShowDataManagement(!showDataManagement)}
              className="w-full mt-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              {showDataManagement ? 'Hide' : 'Show'} Data Management
            </button>
          </div>
        )}

                 {/* Data Management */}
         {showDataManagement && (
           <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-3">
             <h4 className="font-medium text-sm">File Storage</h4>
             
             {/* File Status */}
             {lastFileName && (
               <div className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-2 rounded">
                 <p><strong>Current file:</strong> {lastFileName}</p>
                 <p><strong>Can overwrite:</strong> {hasFileHandle() ? 'Yes' : 'No'}</p>
               </div>
             )}
             
             <div className="space-y-2">
               {/* Save Options */}
               <div className="grid grid-cols-2 gap-2">
                 <button
                   onClick={handleSaveToFile}
                   disabled={isSavingToFile}
                   className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                   title="Save to file (choose location)"
                 >
                   {isSavingToFile ? 'Saving...' : 'Save As...'}
                 </button>
                 
                 <button
                   onClick={handleSaveToSameFile}
                   disabled={isSavingToFile || !hasFileHandle()}
                   className="px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                   title="Save to same file (overwrite)"
                 >
                   {isSavingToFile ? 'Saving...' : 'Save'}
                 </button>
               </div>
               
               <button
                 onClick={handleSaveToNewFile}
                 disabled={isSavingToFile}
                 className="w-full px-3 py-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                 title="Create new file"
               >
                 {isSavingToFile ? 'Saving...' : 'Save to New File'}
               </button>
               
               <button
                 onClick={handleLoadFromFile}
                 disabled={isLoadingFromFile}
                 className="w-full px-3 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
               >
                 {isLoadingFromFile ? 'Loading...' : 'Load from File'}
               </button>
               
               {/* Auto-save and Backup */}
               <div className="grid grid-cols-2 gap-2">
                 <button
                   onClick={handleAutoSaveToFile}
                   className="px-3 py-2 text-sm bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
                   title="Auto-save to file system"
                 >
                   Auto-save
                 </button>
                 
                 <button
                   onClick={handleBackupOnExit}
                   className="px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                   title="Create backup now"
                 >
                   Backup Now
                 </button>
               </div>
               
               {/* File Management */}
               <div className="flex gap-2">
                 <button
                   onClick={() => {
                     clearFileHandle()
                     setLastFileName(null)
                     alert('File handle cleared. Next save will create a new file.')
                   }}
                   className="flex-1 px-3 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                   title="Clear current file association"
                 >
                   Clear File
                 </button>
               </div>
             </div>
             
             <div className="text-xs text-gray-500 dark:text-gray-400">
               <p>• <strong>Save:</strong> Overwrites current file</p>
               <p>• <strong>Save As:</strong> Choose new location</p>
               <p>• <strong>Auto-backup:</strong> Enabled on exit</p>
               <p>• <strong>File System Access API:</strong> Supported</p>
             </div>
           </div>
         )}

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto">
          {filteredNotes.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {filters.search || filters.categories?.length || filters.tags?.length ? 'No notes match your filters' : 'No notes yet'}
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredNotes.map(note => (
                <div
                  key={note.id}
                  onClick={() => handleNoteSelect(note)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    selectedNote?.id === note.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {note.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {truncateText(note.content)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-500">
                          {formatDate(note.updatedAt)}
                        </span>
                        {note.isSaving && (
                          <span className="text-xs text-blue-500">Saving...</span>
                        )}
                      </div>
                      {/* Tags */}
                      {note.tags && note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {note.tags.slice(0, 3).map(tag => (
                            <span
                              key={tag}
                              className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                          {note.tags.length > 3 && (
                            <span className="text-xs text-gray-500">+{note.tags.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteNote(note.id)
                      }}
                      className="text-gray-400 hover:text-red-500 ml-2"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Note Editor Panel */}
      <div className="flex-1 flex flex-col">
        {selectedNote && !isCreating ? (
          <>
            {/* Note Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <input
                      type="text"
                      value={noteForm.title}
                      onChange={(e) => setNoteForm(prev => ({ ...prev, title: e.target.value }))}
                      className="text-xl font-semibold bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500"
                    />
                  ) : (
                    <h1 className="text-xl font-semibold">{selectedNote.title}</h1>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {!isEditing && (
                    <>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setShowConvertModal(true)}
                        className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        Convert to Task
                      </button>
                      <button
                        onClick={() => {
                          setIsCreating(true)
                          setSelectedNote(null)
                          setNoteForm({
                            title: '',
                            content: '',
                            categories: [],
                            tags: [],
                            template: undefined,
                          })
                        }}
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        New Note
                      </button>
                    </>
                  )}
                  {isEditing && (
                    <>
                      <button
                        onClick={handleUpdateNote}
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false)
                                                  setNoteForm({
                          title: selectedNote.title,
                          content: selectedNote.content,
                          categories: selectedNote.categories || [],
                          tags: selectedNote.tags || [],
                          template: selectedNote.template || undefined,
                        })
                        }}
                        className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Note Metadata */}
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span>Created: {formatDate(selectedNote.createdAt)}</span>
                <span>Updated: {formatDate(selectedNote.updatedAt)}</span>
                {selectedNote.lastSaved && (
                  <span>Last saved: {formatDate(selectedNote.lastSaved)}</span>
                )}
              </div>

              {/* Categories and Tags */}
              {(selectedNote.categories?.length || selectedNote.tags?.length) && (
                <div className="flex items-center gap-4 mt-2">
                  {selectedNote.categories?.length && (
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium">Categories:</span>
                      {selectedNote.categories.map(category => (
                        <span
                          key={category}
                          className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  )}
                  {selectedNote.tags?.length && (
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium">Tags:</span>
                      {selectedNote.tags.map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Note Content */}
            <div className="flex-1 p-4">
              {isEditing ? (
                <div className="space-y-4">
                  {/* Template Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Template</label>
                    <select
                      value={noteForm.template || ''}
                      onChange={(e) => handleTemplateSelect(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent"
                    >
                      <option value="">No template</option>
                      {templates.map(template => (
                        <option key={template.id} value={template.id}>
                          {template.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Categories */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Categories</label>
                    <input
                      type="text"
                      value={noteForm.categories.join(', ')}
                      onChange={(e) => setNoteForm(prev => ({
                        ...prev,
                        categories: e.target.value.split(',').map(cat => cat.trim()).filter(Boolean)
                      }))}
                      placeholder="Enter categories separated by commas"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent"
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Tags</label>
                    <input
                      type="text"
                      value={noteForm.tags.join(', ')}
                      onChange={(e) => setNoteForm(prev => ({
                        ...prev,
                        tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                      }))}
                      placeholder="Enter tags separated by commas"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent"
                    />
                  </div>

                  {/* Content */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Content</label>
                    <textarea
                      value={noteForm.content}
                      onChange={(e) => setNoteForm(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Write your note content here... (Markdown supported)"
                      className="w-full h-96 resize-none border border-gray-300 dark:border-gray-600 rounded-md bg-transparent p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="prose dark:prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap font-sans">{selectedNote.content}</pre>
                </div>
              )}
            </div>
          </>
        ) : isCreating ? (
          <div className="flex-1 p-4">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Create New Note</h2>
              
              {/* Template Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Template</label>
                <select
                  value={noteForm.template || ''}
                  onChange={(e) => handleTemplateSelect(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent"
                >
                  <option value="">No template</option>
                  {templates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={noteForm.title}
                  onChange={(e) => setNoteForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Note title"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent"
                />
              </div>

              {/* Categories */}
              <div>
                <label className="block text-sm font-medium mb-2">Categories</label>
                <input
                  type="text"
                  value={noteForm.categories.join(', ')}
                  onChange={(e) => setNoteForm(prev => ({
                    ...prev,
                    categories: e.target.value.split(',').map(cat => cat.trim()).filter(Boolean)
                  }))}
                  placeholder="Enter categories separated by commas"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium mb-2">Tags</label>
                <input
                  type="text"
                  value={noteForm.tags.join(', ')}
                  onChange={(e) => setNoteForm(prev => ({
                    ...prev,
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                  }))}
                  placeholder="Enter tags separated by commas"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium mb-2">Content</label>
                <textarea
                  value={noteForm.content}
                  onChange={(e) => setNoteForm(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Write your note content here... (Markdown supported)"
                  className="w-full h-96 resize-none border border-gray-300 dark:border-gray-600 rounded-md bg-transparent p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={handleCreateNote}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Create Note
                </button>
                <button
                  onClick={() => {
                    setIsCreating(false)
                    setSelectedNote(null)
                    setNoteForm({
                      title: '',
                      content: '',
                      categories: [],
                      tags: [],
                      template: undefined,
                    })
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p className="text-lg mb-2">No note selected</p>
              <p className="text-sm">Select a note from the list or create a new one</p>
            </div>
          </div>
        )}
      </div>

      {/* Convert to Task Modal */}
      {showConvertModal && selectedNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-full">
            <h3 className="text-lg font-semibold mb-4">Convert Note to Task</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Task Title</label>
                <input
                  type="text"
                  value={convertData.title}
                  onChange={(e) => setConvertData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter task title"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={convertData.status}
                  onChange={(e) => setConvertData(prev => ({ ...prev, status: e.target.value as ColumnKey }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent"
                >
                  <option value="draft">Draft</option>
                  <option value="refined">Refined</option>
                  <option value="in_progress">In Progress</option>
                  <option value="blocked">Blocked</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select
                  value={convertData.priority}
                  onChange={(e) => setConvertData(prev => ({ ...prev, priority: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Due Date</label>
                <input
                  type="date"
                  value={convertData.dueDate}
                  onChange={(e) => setConvertData(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Additional Tags</label>
                <input
                  type="text"
                  value={convertData.tags.join(', ')}
                  onChange={(e) => setConvertData(prev => ({
                    ...prev,
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                  }))}
                  placeholder="Enter additional tags separated by commas"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={handleConvertToTask}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Convert
              </button>
              <button
                onClick={() => setShowConvertModal(false)}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Notes


