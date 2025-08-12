# UI Design

## Principles
- Clarity, speed, and minimal cognitive load
- Keyboard-first; accessible by default
- Local-first feedback: instant persistence and undo

## Components
- App Shell: header with search, tabs for Kanban/Notes/Tasks/Themes/Settings
- Kanban: columns, cards, quick-add, inline edit, multi-select, task creation modal
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
- Inline edit: single-click title/priority/due/tags; Enter to save, Esc to cancel, Tab to navigate; autosave indicator
- Multi-select: Shift and Ctrl/Cmd; bulk drag; bulk actions
- Feedback: toasts for saves/errors; subtle progress for compaction
- Modal: focus trap, keyboard navigation, inline validation errors

## Accessibility
- Roles: list, listitem, application for DnD with aria-dropeffect
- Focus outlines always visible; skip-to-content
- Color contrast AA; reduced motion preference respected

## Wireframe notes (textual)
- Kanban: 5 columns with headers showing count and optional WIP; each card shows Title (editable), Priority chip (editable), Due date (editable), Tag list (editable); footer quick-add; inline edit shows save/cancel buttons; task creation modal overlays with form fields
- Notes: fullscreen editor; left outline (optional); toolbar top; status (autosaved) right
- Tasks: table with sticky header, filter row, bulk select checkbox column

## Inline Editing States

### Card Edit Mode
- **Visual State:** Field becomes input with focus; save/cancel buttons appear below
- **Title Edit:** Input expands to full width; placeholder shows current value
- **Priority Edit:** Dropdown opens with current selection highlighted
- **Due Date Edit:** Date picker opens with current date selected
- **Tags Edit:** Tag input with autocomplete; existing tags shown as removable chips
- **Save Indicator:** Green checkmark appears when autosave completes; error state shows red X

### Keyboard Navigation
- **Enter Edit:** Single click or keyboard shortcut (E) enters edit mode
- **Field Navigation:** Tab/Shift+Tab moves between editable fields on card
- **Save/Cancel:** Enter saves changes; Esc cancels and restores previous values
- **Exit Edit:** Tab from last field or click outside exits edit mode

## Task Creation Modal

### Layout and Structure
- **Overlay:** Semi-transparent backdrop; modal centered with focus trap
- **Header:** "Create New Task" with close button (X) and keyboard shortcut (Esc)
- **Form Fields:** Title (required, auto-focused), Description (textarea), Status (preselected), Priority (dropdown), Due Date (date picker), Tags (input with autocomplete)
- **Actions:** Cancel button, Create button (primary), Create & Add Another button
- **Validation:** Inline error messages below invalid fields; submit disabled until valid

### Launch Points
- **Column Quick Add:** Button in each column footer opens modal with status preselected
- **Global Shortcut:** Ctrl/Cmd+N opens modal with status defaulting to "Draft"
- **Empty State:** "Add your first task" CTA in empty columns opens modal
- **Context Menu:** Right-click in column opens context menu with "New Task" option

### Accessibility Features
- **Focus Management:** Modal opens with focus on Title field; focus trap prevents escape
- **Announcements:** Screen reader announces modal opening, field validation, and submission
- **Keyboard Support:** Tab navigation, Enter to submit, Esc to close
- **Error Handling:** Validation errors announced immediately; focus moves to first error field
