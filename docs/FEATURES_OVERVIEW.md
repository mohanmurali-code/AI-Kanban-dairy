# Unified Features Overview

This document consolidates the application’s functional surface into a single, navigable overview. It summarizes capabilities described across the docs and serves as a top‑level map for stakeholders and developers.

## Kanban Board
- Columns: Draft, Refined, In Progress, Blocked, Completed (customizable)
- Create, update, move, archive/restore, and (optionally) hard‑delete tasks
- Inline editing for key fields (title, priority, due date, tags)
- WIP limits (soft/hard), per‑column sorting (manual/priority/due date)
- Statistics per column and overall board

## Task Management (List View)
- Table and Card (dual) views with responsive layouts
- Advanced filtering: text, status, priority, due date, tags (AND/OR combos)
- Sorting options and real‑time updates
- Bulk operations and archived visibility toggles
- Export/import via JSON; CSV export for table data

## Drag & Drop
- Mouse and keyboard DnD across/within columns with visual feedback
- Sensors tuned for responsiveness (distance/delay); accessibility support
- Undo for move operations

## Notes & Templates
- Rich text notes with autosave and markdown/shortcuts support (concept)
- JSON file storage for notes with validation and metadata
- Template support (daily journal, meeting notes) and linking to tasks/notes

## Data Management
- Central `DataManager` for backups, restores, and integrity checks
- User‑selectable data folder with guided migration
- Backup rotation, verification, and metadata tracking

## File Management
- File System Access API with fallback mechanisms
- File handle persistence (overwrite same file) and flexible save modes:
  - Save (overwrite), Save As, Save to New, Auto‑save to fixed file
- Smart naming (date/timestamp) and clear UI status

## Change Detection
- Deep, field‑level diffing; session tracking; thresholds/debounce
- Smart autosave/backup only when changes detected
- Change history, summaries, and performance metrics

## Robust Storage (Database‑like)
- Chunked storage (configurable chunk size), indexes (hash/range/fulltext)
- Compression, compaction, and query optimization
- Import/export, stats, health checks, and migration from flat JSON

## Theming
- 10 professionally designed themes across light/dark/special/accessibility
- CSS custom properties, dynamic CSS loading, accent color integration
- `ThemeProvider` architecture with error boundary, loading, and status tools
- Theme utilities, validation, and developer guides

## Landing Dashboard & Calendar
- Dashboard with quick stats, recent items, and upcoming deadlines
- Calendar (monthly view, framework for week/day) with color‑coded tasks

## Accessibility & UX
- WCAG AA contrast, reduced motion, keyboard‑first interactions
- Clear focus states, ARIA labeling, and responsive layouts

## Persistence, Import/Export, Offline
- Local‑first storage (JSON/JSONL), backups and restore
- JSON/CSV export; planned cloud sync options
- PWA/Electron targets for offline and desktop experiences

## Performance Targets (Highlights)
- <50ms drag/drop; <200ms board load at ~2k tasks; autosave ≤1s

---

References: See detailed specs in `docs/features/`, `docs/requirements/`, sessions in `docs/sessions/`, and theming under `docs/themes/`.



