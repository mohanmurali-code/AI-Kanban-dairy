import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { NoteItem, NoteFilters, NoteStats, NoteTemplate } from '../types'
import { 
  autoSaveNotesToFile, 
  backupNotesOnExit, 
  saveNotesToFile, 
  saveNotesToSameFile,
  saveNotesToNewFile,
  loadNotesFromFile,
  hasFileHandle,
  getLastFileName,
  clearFileHandle
} from '../utils/notesStorage'
import { changeDetector } from '../utils/changeDetector'

/**
 * Zustand notes store state and actions.
 *
 * Maintains a normalized `notes` map with comprehensive note management features.
 * The store is persisted to local storage and supports auto-save functionality.
 */
interface NotesState {
  /** All notes keyed by id. */
  notes: Record<string, NoteItem>
  /** Note templates for quick creation. */
  templates: Record<string, NoteTemplate>
  /** Create a new note with comprehensive note data. */
  createNote: (partial: {
    title: string
    content?: string
    categories?: string[]
    tags?: string[]
    template?: NoteItem['template']
    linkedTasks?: string[]
    linkedNotes?: string[]
  }) => Promise<NoteItem>
  /** Update an existing note with partial data. */
  updateNote: (noteId: string, updates: Partial<NoteItem>) => Promise<void>
  /** Auto-save note content with debouncing. */
  autoSaveNote: (noteId: string, content: string) => void
  /** Delete a note (soft delete - moves to archived state). */
  deleteNote: (noteId: string) => void
  /** Hard delete a note permanently. */
  hardDeleteNote: (noteId: string) => void
  /** Restore a deleted note. */
  restoreNote: (noteId: string) => void
  /** Get all notes as an array, optionally filtered. */
  getAllNotes: (filters?: NoteFilters) => NoteItem[]
  /** Get a single note by ID. */
  getNoteById: (noteId: string) => NoteItem | null
  /** Convert a note to a task. */
  convertNoteToTask: (noteId: string, taskData: {
    title: string
    status: string
    description?: string
    priority?: string
    dueDate?: string
    tags?: string[]
  }) => Promise<string>
  /** Export all data to JSON format. */
  exportData: () => string
  /** Import data from JSON format. */
  importData: (jsonData: string) => Promise<void>
  /** Clear all data. */
  clearAllData: () => void
  /** Get note statistics. */
  getNoteStats: () => NoteStats
  /** Save notes to JSON file. */
  saveToFile: (filename?: string) => Promise<void>
  /** Save notes to the same file (overwrite). */
  saveToSameFile: () => Promise<void>
  /** Save notes to a new file. */
  saveToNewFile: (filename?: string) => Promise<void>
  /** Load notes from JSON file. */
  loadFromFile: () => Promise<void>
  /** Auto-save notes to file system. */
  autoSaveToFile: () => Promise<void>
  /** Backup notes on exit. */
  backupOnExit: () => Promise<void>
  /** Check if we have a file handle for overwriting. */
  hasFileHandle: () => boolean
  /** Get the last used filename. */
  getLastFileName: () => Promise<string | null>
  /** Clear the stored file handle. */
  clearFileHandle: () => void
  /** Get all available categories. */
  getAllCategories: () => string[]
  /** Get all available tags. */
  getAllTags: () => string[]
  /** Create a note template. */
  createTemplate: (template: Omit<NoteTemplate, 'id'>) => string
  /** Update a note template. */
  updateTemplate: (templateId: string, updates: Partial<NoteTemplate>) => void
  /** Delete a note template. */
  deleteTemplate: (templateId: string) => void
  /** Get all templates. */
  getAllTemplates: () => NoteTemplate[]
}

/**
 * Default note templates.
 */
const defaultTemplates: Record<string, NoteTemplate> = {
  daily_journal: {
    id: 'daily_journal',
    name: 'Daily Journal',
    description: 'Template for daily journal entries',
    content: `# Daily Journal - ${new Date().toLocaleDateString()}

## Today's Goals
- [ ] 

## Accomplishments
- 

## Challenges
- 

## Tomorrow's Plan
- 

## Notes
`,
    category: 'Journal',
    tags: ['daily', 'journal', 'reflection']
  },
  meeting_notes: {
    id: 'meeting_notes',
    name: 'Meeting Notes',
    description: 'Template for meeting notes and action items',
    content: `# Meeting Notes

**Date:** ${new Date().toLocaleDateString()}
**Time:** 
**Participants:** 

## Agenda
1. 

## Discussion Points
- 

## Action Items
- [ ] 

## Next Steps
- 

## Notes
`,
    category: 'Work',
    tags: ['meeting', 'work', 'action-items']
  },
  idea: {
    id: 'idea',
    name: 'Idea',
    description: 'Template for capturing ideas and concepts',
    content: `# Idea: [Title]

## Concept
Brief description of the idea...

## Why This Matters
- 

## Implementation
- 

## Resources Needed
- 

## Next Steps
- [ ] 

## Notes
`,
    category: 'Ideas',
    tags: ['idea', 'concept', 'innovation']
  },
  todo: {
    id: 'todo',
    name: 'Todo List',
    description: 'Template for todo lists and task organization',
    content: `# Todo List

## High Priority
- [ ] 

## Medium Priority
- [ ] 

## Low Priority
- [ ] 

## Completed
- [x] 

## Notes
`,
    category: 'Tasks',
    tags: ['todo', 'tasks', 'organization']
  }
}

/**
 * Global notes store, persisted under the key `kanban-diary-notes`.
 */
export const useNotesStore = create<NotesState>()(
  persist(
    (set, get) => ({
      notes: {},
      templates: defaultTemplates,
      
      /**
       * Create a new note.
       *
       * @param partial - Note data including title and optional fields.
       * @returns Promise resolving to the created note.
       */
      createNote: async ({ title, content = '', categories, tags, template, linkedTasks, linkedNotes }) => {
        const id = `note_${crypto.randomUUID()}`
        const now = new Date().toISOString()
        const newNote: NoteItem = {
          id,
          title,
          content,
          categories: categories || [],
          tags: tags || [],
          template,
          linkedTasks: linkedTasks || [],
          linkedNotes: linkedNotes || [],
          createdAt: now,
          updatedAt: now,
          archived: false,
          isSaving: false,
          lastSaved: now,
        }
        
        set((state) => ({
          notes: { ...state.notes, [id]: newNote },
        }))
        
        // Track changes for change detection
        const newState = get()
        changeDetector.detectChanges('notes', newState.notes)
        
        return newNote
      },

      /**
       * Update an existing note with partial data.
       *
       * @param noteId - ID of the note to update.
       * @param updates - Partial note data to update.
       */
      updateNote: async (noteId, updates) => {
        const state = get()
        const existingNote = state.notes[noteId]
        
        if (!existingNote) {
          throw new Error(`Note with ID ${noteId} not found`)
        }
        
        const updatedNote: NoteItem = {
          ...existingNote,
          ...updates,
          updatedAt: new Date().toISOString(),
        }
        
        set((state) => ({
          notes: {
            ...state.notes,
            [noteId]: updatedNote,
          },
        }))
        
        // Track changes for change detection
        const newState = get()
        changeDetector.detectChanges('notes', newState.notes)
      },

      /**
       * Auto-save note content with visual indicator.
       *
       * @param noteId - ID of the note to auto-save.
       * @param content - New content to save.
       */
      autoSaveNote: (noteId, content) => {
        const state = get()
        const existingNote = state.notes[noteId]
        
        if (!existingNote) {
          return
        }
        
        // Set saving indicator
        set((state) => ({
          notes: {
            ...state.notes,
            [noteId]: {
              ...existingNote,
              content,
              isSaving: true,
            },
          },
        }))
        
        // Simulate auto-save delay
        setTimeout(() => {
          const currentState = get()
          const currentNote = currentState.notes[noteId]
          
          if (currentNote) {
            set((state) => ({
              notes: {
                ...state.notes,
                [noteId]: {
                  ...currentNote,
                  content,
                  updatedAt: new Date().toISOString(),
                  isSaving: false,
                  lastSaved: new Date().toISOString(),
                },
              },
            }))
          }
        }, 500)
      },

      /**
       * Soft delete a note (mark as archived).
       *
       * @param noteId - ID of the note to delete.
       */
      deleteNote: (noteId) => {
        const state = get()
        const note = state.notes[noteId]
        
        if (!note) {
          throw new Error(`Note with ID ${noteId} not found`)
        }

        set((state) => ({
          notes: {
            ...state.notes,
            [noteId]: { ...note, archived: true, updatedAt: new Date().toISOString() },
          },
        }))
        
        // Track changes for change detection
        const newState = get()
        changeDetector.detectChanges('notes', newState.notes)
      },

      /**
       * Hard delete a note permanently.
       *
       * @param noteId - ID of the note to permanently delete.
       */
      hardDeleteNote: (noteId) => {
        const state = get()
        const note = state.notes[noteId]
        
        if (!note) {
          throw new Error(`Note with ID ${noteId} not found`)
        }

        const newNotes = { ...state.notes }
        delete newNotes[noteId]

        set(() => ({
          notes: newNotes,
        }))
        
        // Track changes for change detection
        const newState = get()
        changeDetector.detectChanges('notes', newState.notes)
      },

      /**
       * Restore a deleted note.
       *
       * @param noteId - ID of the note to restore.
       */
      restoreNote: (noteId) => {
        const state = get()
        const note = state.notes[noteId]
        
        if (!note) {
          throw new Error(`Note with ID ${noteId} not found`)
        }

        if (!note.archived) {
          throw new Error(`Note with ID ${noteId} is not archived`)
        }

        set((state) => ({
          notes: {
            ...state.notes,
            [noteId]: { ...note, archived: false, updatedAt: new Date().toISOString() },
          },
        }))
      },

      /**
       * Get all notes as an array, optionally filtered.
       *
       * @param filters - Optional filters to apply.
       * @returns Array of filtered notes.
       */
      getAllNotes: (filters?: NoteFilters) => {
        const state = get()
        let notes = Object.values(state.notes)

        // Apply filters
        if (filters) {
          if (filters.categories && filters.categories.length > 0) {
            notes = notes.filter(note => 
              note.categories && filters.categories!.some(cat => note.categories!.includes(cat))
            )
          }

          if (filters.tags && filters.tags.length > 0) {
            notes = notes.filter(note => 
              note.tags && filters.tags!.some(tag => note.tags!.includes(tag))
            )
          }

          if (filters.template) {
            notes = notes.filter(note => note.template === filters.template)
          }

          if (filters.search) {
            const searchLower = filters.search.toLowerCase()
            notes = notes.filter(note => 
              note.title.toLowerCase().includes(searchLower) ||
              note.content.toLowerCase().includes(searchLower) ||
              (note.tags && note.tags.some(tag => tag.toLowerCase().includes(searchLower))) ||
              (note.categories && note.categories.some(cat => cat.toLowerCase().includes(searchLower)))
            )
          }

          if (filters.linkedTask) {
            notes = notes.filter(note => 
              note.linkedTasks && note.linkedTasks.includes(filters.linkedTask!)
            )
          }

          if (filters.linkedNote) {
            notes = notes.filter(note => 
              note.linkedNotes && note.linkedNotes.includes(filters.linkedNote!)
            )
          }

          if (filters.dateRange) {
            if (filters.dateRange.from) {
              notes = notes.filter(note => note.createdAt >= filters.dateRange!.from!)
            }
            if (filters.dateRange.to) {
              notes = notes.filter(note => note.createdAt <= filters.dateRange!.to!)
            }
          }

          if (!filters.showArchived) {
            notes = notes.filter(note => !note.archived)
          }
        } else {
          // Default: don't show archived notes
          notes = notes.filter(note => !note.archived)
        }

        return notes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      },

      /**
       * Get a single note by ID.
       *
       * @param noteId - ID of the note to retrieve.
       * @returns Note item or null if not found.
       */
      getNoteById: (noteId) => {
        const state = get()
        return state.notes[noteId] || null
      },

      /**
       * Convert a note to a task.
       *
       * @param noteId - ID of the note to convert.
       * @param taskData - Task data for the new task.
       * @returns Promise resolving to the new task ID.
       */
      convertNoteToTask: async (noteId, taskData) => {
        const state = get()
        const note = state.notes[noteId]
        
        if (!note) {
          throw new Error(`Note with ID ${noteId} not found`)
        }

        // Import task store to create the task
        const { useTaskStore } = await import('./tasks')
        const taskStore = useTaskStore.getState()
        
        const newTask = await taskStore.createTask({
          title: taskData.title,
          status: taskData.status as any,
          description: taskData.description || note.content,
          priority: taskData.priority as any,
          dueDate: taskData.dueDate,
          tags: [...(taskData.tags || []), ...(note.tags || [])],
        })

        // Link the note to the new task
        await get().updateNote(noteId, {
          linkedTasks: [...(note.linkedTasks || []), newTask.id],
        })

        return newTask.id
      },

      /**
       * Export all data to JSON format.
       *
       * @returns JSON string containing all note data.
       */
      exportData: () => {
        const state = get()
        const exportData = {
          version: '1.0',
          exportedAt: new Date().toISOString(),
          notes: state.notes,
          templates: state.templates,
        }
        return JSON.stringify(exportData, null, 2)
      },

      /**
       * Import data from JSON format.
       *
       * @param jsonData - JSON string containing note data.
       */
      importData: async (jsonData: string) => {
        try {
          const data = JSON.parse(jsonData)
          
          // Validate data structure
          if (!data.notes) {
            throw new Error('Invalid data format: missing notes')
          }

          // Validate notes
          const notes = data.notes
          for (const [id, note] of Object.entries(notes)) {
            if (typeof note !== 'object' || !note.title || !note.content) {
              throw new Error(`Invalid note format for note ${id}`)
            }
          }

          set(() => ({
            notes,
            templates: data.templates || defaultTemplates,
          }))
        } catch (error) {
          throw new Error(`Failed to import data: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      },

      /**
       * Clear all data.
       */
      clearAllData: () => {
        set(() => ({
          notes: {},
          templates: defaultTemplates,
        }))
      },

      /**
       * Get note statistics.
       *
       * @returns Note statistics object.
       */
      getNoteStats: () => {
        const state = get()
        const notes = Object.values(state.notes).filter(note => !note.archived)
        const now = new Date()
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

        const stats: NoteStats = {
          total: notes.length,
          byCategory: {},
          byTemplate: {},
          archived: Object.values(state.notes).filter(note => note.archived).length,
          createdThisWeek: 0,
          updatedThisWeek: 0,
        }

        notes.forEach(note => {
          // Count by category
          if (note.categories) {
            note.categories.forEach(category => {
              stats.byCategory[category] = (stats.byCategory[category] || 0) + 1
            })
          }

          // Count by template
          if (note.template) {
            stats.byTemplate[note.template] = (stats.byTemplate[note.template] || 0) + 1
          }

          // Count recent activity
          const createdAt = new Date(note.createdAt)
          const updatedAt = new Date(note.updatedAt)
          
          if (createdAt >= weekAgo) {
            stats.createdThisWeek++
          }
          if (updatedAt >= weekAgo) {
            stats.updatedThisWeek++
          }
        })

        return stats
      },

      /**
       * Get all available categories.
       *
       * @returns Array of unique categories.
       */
      getAllCategories: () => {
        const state = get()
        const categories = new Set<string>()
        
        Object.values(state.notes).forEach(note => {
          if (note.categories) {
            note.categories.forEach(category => categories.add(category))
          }
        })
        
        return Array.from(categories).sort()
      },

      /**
       * Get all available tags.
       *
       * @returns Array of unique tags.
       */
      getAllTags: () => {
        const state = get()
        const tags = new Set<string>()
        
        Object.values(state.notes).forEach(note => {
          if (note.tags) {
            note.tags.forEach(tag => tags.add(tag))
          }
        })
        
        return Array.from(tags).sort()
      },

      /**
       * Create a note template.
       *
       * @param template - Template data.
       * @returns Template ID.
       */
      createTemplate: (template) => {
        const id = `template_${crypto.randomUUID()}`
        const newTemplate: NoteTemplate = {
          id,
          ...template,
        }
        
        set((state) => ({
          templates: { ...state.templates, [id]: newTemplate },
        }))
        
        return id
      },

      /**
       * Update a note template.
       *
       * @param templateId - ID of the template to update.
       * @param updates - Partial template data to update.
       */
      updateTemplate: (templateId, updates) => {
        const state = get()
        const existingTemplate = state.templates[templateId]
        
        if (!existingTemplate) {
          throw new Error(`Template with ID ${templateId} not found`)
        }
        
        set((state) => ({
          templates: {
            ...state.templates,
            [templateId]: { ...existingTemplate, ...updates },
          },
        }))
      },

      /**
       * Delete a note template.
       *
       * @param templateId - ID of the template to delete.
       */
      deleteTemplate: (templateId) => {
        const state = get()
        const template = state.templates[templateId]
        
        if (!template) {
          throw new Error(`Template with ID ${templateId} not found`)
        }

        const newTemplates = { ...state.templates }
        delete newTemplates[templateId]

        set(() => ({
          templates: newTemplates,
        }))
      },

      /**
       * Get all templates.
       *
       * @returns Array of all templates.
       */
      getAllTemplates: () => {
        const state = get()
        return Object.values(state.templates)
      },

      /**
       * Save notes to JSON file.
       *
       * @param filename - Optional filename for the saved file.
       */
      saveToFile: async (filename?: string) => {
        const state = get()
        await saveNotesToFile(state.notes, state.templates, filename)
      },

      /**
       * Save notes to the same file (overwrite).
       */
      saveToSameFile: async () => {
        const state = get()
        await saveNotesToSameFile(state.notes, state.templates)
      },

      /**
       * Save notes to a new file.
       *
       * @param filename - Optional filename for the new file.
       */
      saveToNewFile: async (filename?: string) => {
        const state = get()
        await saveNotesToNewFile(state.notes, state.templates, filename)
      },

      /**
       * Load notes from JSON file.
       */
      loadFromFile: async () => {
        try {
          const data = await loadNotesFromFile()
          set(() => ({
            notes: data.notes,
            templates: data.templates,
          }))
        } catch (error) {
          throw new Error(`Failed to load notes from file: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      },

      /**
       * Auto-save notes to file system.
       */
      autoSaveToFile: async () => {
        const state = get()
        
        // Check if there are any changes before auto-saving
        const changes = changeDetector.detectChanges('notes', state.notes)
        
        if (changes.hasUncommittedChanges) {
          console.log(`Auto-saving notes with ${changes.totalChanges} changes`)
          await autoSaveNotesToFile(state.notes, state.templates)
          
          // Mark changes as committed
          changeDetector.markChangesCommitted('notes')
        } else {
          console.log('No changes detected, skipping auto-save')
        }
      },

      /**
       * Backup notes on exit.
       */
      backupOnExit: async () => {
        const state = get()
        
        // Check if there are any changes before backing up
        const changes = changeDetector.getChangeSummary('notes')
        
        if (changes.hasUncommittedChanges) {
          console.log(`Backing up notes with ${changes.totalChanges} changes`)
          await backupNotesOnExit(state.notes, state.templates)
          
          // Mark changes as committed
          changeDetector.markChangesCommitted('notes')
        } else {
          console.log('No changes detected, skipping backup')
        }
      },

      /**
       * Check if we have a file handle for overwriting.
       */
      hasFileHandle: () => {
        return hasFileHandle()
      },

      /**
       * Get the last used filename.
       */
      getLastFileName: async () => {
        return await getLastFileName()
      },

      /**
       * Clear the stored file handle.
       */
      clearFileHandle: () => {
        clearFileHandle()
      },
    }),
    { name: 'kanban-diary-notes' },
  ),
)
