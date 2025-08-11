# Product Requirements Document (PRD)

## Product name
Kanban Personal Diary

## Goals
- Quick, visual personal task management with a free-form drafting space.
- 100% local-first; user controls where data lives (JSON files).
- Fast, simple, distraction-free; works offline.

## Core features
- Kanban Board (drag-and-drop, 5 statuses)
- Draft Notes (content-editable scratchpad)
- Task List view (table)
- Themes (appearance)
- Settings (data location, app preferences)

## Personas
- Individual knowledge worker/student managing personal tasks and notes.
- Works on a single device (desktop-first), no team collaboration.

## Platform options
- Desktop app via Electron or Tauri for reliable folder access, notifications, and backups.
- Web app/PWA using the File System Access API; fallback to IndexedDB if unsupported.

## Information architecture
- Tabs: Kanban | Draft Notes | Tasks | Themes | Settings
- Global search/quick switcher (Ctrl/Cmd+K) across tasks and note titles.

## Kanban board
- Columns (default, editable): Draft, Refined, In Progress, Blocked, Completed.
- Card fields (default 4, customizable): Title, Description, Due Date, Priority. Optional: Tags.
- Interactions:
  - Drag-and-drop across columns updates status and persists immediately.
  - Keyboard DnD: move card with arrow keys + modifier; Enter to open quick edit.
  - Multi-select: Shift-click for range; Ctrl/Cmd-click for toggles; drag as group.
  - Quick add in each column; inline edit for Title/Priority.
  - WIP limit per column (optional).
  - Blocked cards show reason chip; hover for details.

## Draft Notes
- Content-editable rich text with minimal toolbar (bold, italic, headings, lists, checkbox list).
- Markdown shortcuts (e.g., "- " for list, "# " for heading).
- Slash commands: /todo, /date, /task to link or create tasks.
- Autosave, word count, session restore.
- Optional templates (Daily Note, Meeting Notes).
- Link tasks with @task or #tags; click opens card.

## Task List view
- Table with columns: Title, Status, Priority, Due Date, Tags.
- Sort, filter (by status, due date, priority, tags, text), bulk actions.
- Quick add, inline edit of cells.
- Export filtered list to CSV.

## Themes
- Light, Dark, System; High-contrast variant.
- Accent color picker.
- Font size scale (S/M/L).
- Optional reduced motion.

## Settings
- Data location: Select folder to store JSON (and backups). Show path; change anytime with migration.
- Backups: Daily rolling backups (keep last N), one-click restore.
- Import/Export: JSON export/import (full or tasks-only).
- Columns: Customize order, names, colors, WIP limits; add/remove columns.
- Notifications: Due soon/overdue via OS or browser notifications.
- Security: Optional password; local encryption of on-disk files.

## Non-functional requirements
- Performance: <50ms card move; <200ms board load with 2,000 tasks.
- Reliability: Autosave within 1s; atomic writes with temp files and fs rename.
- Offline-first: All features work without internet.
- Accessibility: WCAG 2.1 AA, full keyboard support, ARIA roles, color contrast.
- Internationalization-ready; date/time locale aware.

## Data model (JSON)

Task
```json
{
  "id": "tsk_01HQX…",
  "title": "Write summary",
  "description": "One paragraph for weekly update.",
  "status": "in_progress",
  "priority": "medium",
  "dueDate": "2025-08-12",
  "tags": ["writing", "weekly"],
  "blocked": { "isBlocked": true, "reason": "Waiting on data" },
  "createdAt": "2025-08-10T12:00:00Z",
  "updatedAt": "2025-08-10T12:05:00Z"
}
```

Settings
```json
{
  "schemaVersion": 1,
  "dataPath": "C:\\Users\\mohan\\Documents\\KanbanDiary",
  "columns": [
    {"key":"draft","name":"Draft","color":"#6b7280","wipLimit":0},
    {"key":"refined","name":"Refined","color":"#6366f1","wipLimit":0},
    {"key":"in_progress","name":"In Progress","color":"#22c55e","wipLimit":3},
    {"key":"blocked","name":"Blocked","color":"#ef4444","wipLimit":0},
    {"key":"completed","name":"Completed","color":"#a3a3a3","wipLimit":0}
  ],
  "theme": {"mode": "dark", "accent": "#7c3aed"},
  "notifications": {"dueSoon": true, "overdue": true},
  "encryption": {"enabled": false}
}
```

## Storage layout (when user selects a folder)
- tasks.jsonl — newline-delimited JSON for append-only writes; periodic compaction into tasks.compacted.json
- notes.md or notes.json — current Draft Notes content
- settings.json
- backups/YYYY-MM-DD/*.json(.zip)
- log.txt (optional for diagnostics)

Local cache: IndexedDB for fast reads; background sync to disk folder.

Schema/versioning:
- settings.json includes schemaVersion.
- On version change, run migration before UI is interactive.

Encryption (optional):
- AES-GCM with key derived from user password (Argon2id or PBKDF2).
- Key kept in-memory only; no plaintext key on disk.

## Acceptance criteria (high level)
- Drag-and-drop persists within 1s; survives reload; undo works; keyboard DnD supported.
- Notes autosave within 1s idle; restore session; Markdown shortcuts.
- Data location selectable; migration supported; backups/restore verified.
- Task list filters/sorts instantly; inline edits persist and sync with board.
- Themes apply instantly; high-contrast meets contrast ratios.

## Keyboard shortcuts
- Global: Ctrl/Cmd+K (search), Ctrl/Cmd+N (new task), Ctrl/Cmd+/ (shortcuts help)
- Board: Enter (quick edit), Ctrl/Cmd+Arrow (move), Shift+Arrow (multi-select)
- Notes: Ctrl/Cmd+B/I/U, Ctrl/Cmd+Shift+L (toggle checklist)

## Technology proposal
- UI: React + TypeScript + Vite
- State: Zustand or Redux Toolkit
- Drag & Drop: dnd-kit
- Rich text: Tiptap or Slate
- Styling: Tailwind CSS + CSS variables
- Desktop: Tauri or Electron
- Storage: File system (desktop) or File System Access API + IndexedDB (web)

## Milestones
- M1: Skeleton app (tabs, routing, settings, theme, simple storage)
- M2: Kanban MVP (drag/drop, inline edit, persistence)
- M3: Draft Notes (rich editor, autosave, slash commands)
- M4: Task List (table, filters, CSV export)
- M5: Data location, backups, import/export, migration
- M6: Accessibility pass, keyboard DnD, performance tuning
- M7: Optional encryption + notifications

## Risks and mitigations
- File corruption: temp-file + atomic rename; JSON schema validation; backups.
- Browser folder access: prefer desktop; in web, fallback to IndexedDB + manual export.
- Large JSON file: JSONL with periodic compaction; chunk by month.
