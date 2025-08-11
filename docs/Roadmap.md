# Roadmap

## v0.1.0 Prototype
- Minimal shell with tabs (Kanban, Draft Notes, Tasks, Themes, Settings)
- In-memory state; mock data; save/load to a temp JSON file
- Exit: App starts, tabs switch, mock create task works

## v0.2.0 Kanban MVP
- Columns: Draft, Refined, In Progress, Blocked, Completed
- Drag-and-drop (mouse + keyboard) updates status
- Inline edit title and priority; create/delete tasks
- Persist to local JSONL file; autosave and debounce
- Exit: Move task -> persists within 1s; survives restart

## v0.3.0 Draft Notes
- Rich text editor (Tiptap/Slate) with minimal toolbar
- Autosave on idle; session restore; Markdown shortcuts
- Slash commands: /task to create/link task
- Exit: Notes persist and reopen correctly; /task inserts link

## v0.4.0 Task List
- Table view with sorting, filtering, bulk actions
- Inline edit of cells; quick add; CSV export
- Exit: Filters and sorts are instant; CSV matches filters

## v0.5.0 Data Location & Backups
- Folder picker; store tasks.jsonl, settings.json, notes
- Daily rolling backups and manual backup/restore
- Import/export JSON
- Exit: Change folder migrates data; backup restore verified

## v0.6.0 Accessibility & Performance
- Full keyboard DnD; ARIA roles; color contrast
- Virtualized list (if needed); <200ms board load at 2k tasks
- Exit: Keyboard-only flow validated; performance benchmarks pass

## v0.7.0 Security & Notifications (optional)
- Optional password and local encryption (AES-GCM)
- Due soon/overdue notifications
- Exit: Encrypted storage roundtrip; notifications fire correctly

## v1.0.0 Release
- Polish, docs, CI build pipeline
- App icon, installer, versioned release notes

## v1.1+ Enhancements
- Templates (daily notes), tags management, WIP limits UI
- Analytics-free metrics (optional local usage log)
