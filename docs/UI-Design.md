# UI Design

## Principles
- Clarity, speed, and minimal cognitive load
- Keyboard-first; accessible by default
- Local-first feedback: instant persistence and undo

## Components
- App Shell: header with search, tabs for Kanban/Notes/Tasks/Themes/Settings
- Kanban: columns, cards, quick-add, inline edit, multi-select
- Notes: rich editor toolbar, slash command menu, link picker
- Task Table: toolbar (filters/sort/export), virtualized rows
- Settings: sections for Data, Backups, Columns, Notifications, Theme

## Tokens and theming
- Color roles: background, surface, border, text, muted, accent, success, warning, danger
- Modes: light, dark, high-contrast
- Typography: system font stack; sizes 12/14/16 base with scale; monospace for code
- Spacing: 4px grid; radius 6–10px

## Interactions
- DnD: visual lift, drop targets highlight, keyboard alternative
- Inline edit: single-click title; Enter to save, Esc to cancel
- Multi-select: Shift and Ctrl/Cmd; bulk drag; bulk actions
- Feedback: toasts for saves/errors; subtle progress for compaction

## Accessibility
- Roles: list, listitem, application for DnD with aria-dropeffect
- Focus outlines always visible; skip-to-content
- Color contrast AA; reduced motion preference respected

## Wireframe notes (textual)
- Kanban: 5 columns with headers showing count and optional WIP; each card shows Title, Priority chip, Due date, Tag list; footer quick-add
- Notes: fullscreen editor; left outline (optional); toolbar top; status (autosaved) right
- Tasks: table with sticky header, filter row, bulk select checkbox column
