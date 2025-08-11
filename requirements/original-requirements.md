# Requirements

## Functional
- Kanban Board
  - Columns: Draft, Refined, In Progress, Blocked, Completed (editable labels/order)
  - Create, read, update, delete tasks
  - Drag-and-drop with keyboard and mouse; multi-select move
  - Inline edit title, priority; quick add per column
  - Optional WIP limits; blocked reason capture
- Draft Notes
  - Rich text; headings, lists, checkboxes, bold/italic/underline
  - Markdown shortcuts; slash commands (/task, /date)
  - Autosave; session restore
- Task List
  - Sort and filter by text, status, priority, due date, tags
  - Inline edits; bulk actions; CSV export
- Themes
  - Light/Dark/System; high-contrast; accent color; font scale
- Settings
  - Data folder selection and migration
  - Backups (rolling + manual); import/export JSON
  - Notifications on due/overdue
  - Optional password and encryption

## Non-functional
- Performance: <50ms drag, <200ms initial board load at 2k tasks
- Reliability: Autosave <=1s; atomic writes; schema validation
- Offline-first: No network required
- Accessibility: WCAG 2.1 AA; full keyboard support; ARIA roles
- Internationalization-ready dates; locale-aware formatting

## Data
- Storage layout in user-selected folder:
  - tasks.jsonl (append-only) with periodic compaction
  - notes.md or notes.json
  - settings.json (includes schemaVersion)
  - backups/YYYY-MM-DD/*
- JSON schema: see PRD for Task and Settings examples

## Acceptance
- DnD moves persist within 1s; survive reload; undo supported
- Notes autosave/restore; Markdown shortcuts apply
- Changing data folder migrates data; backups restore successfully
- Task table filters/sorts instantly; CSV matches current view
- Theme persists and applies; high-contrast meets contrast
