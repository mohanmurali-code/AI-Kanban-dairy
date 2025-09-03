# Unified Requirements Summary

This document unifies the Functional, Non‑Functional, Data, User, and Technical requirements, with pointers to acceptance criteria. Use this as a high‑level checklist and entry point to the detailed specs.

## Functional Requirements (FR)
- Kanban Board: configurable columns; CRUD with inline editing; WIP limits; per‑column sorting; statistics
- Task Management: list/table and cards; advanced filters/search; bulk actions; CSV export; import/export JSON
- Drag & Drop: mouse and keyboard DnD; visual feedback; multi‑select; undo
- Notes: rich editor (formatting, markdown, shortcuts); autosave; templates; linking to tasks/notes
- Preferences: theme modes (light/dark/system/high‑contrast), accent color, typography, layout density
- Data Management (FR‑010): data folder selection/migration; automatic + manual backups; validation; recovery
- Calendar & Dashboard: calendar view with color coding; landing page metrics and quick actions

## Non‑Functional Requirements (NFR)
- Performance: <50ms DnD; <200ms board load (~2k tasks); search/filter ≤100–150ms; autosave ≤1s
- Reliability: autosave, atomic writes, integrity checks, graceful recovery; 99.5% availability targets
- Security: local‑first; optional encryption/password; input validation and sanitization
- Accessibility: WCAG 2.1 AA; keyboard navigation; high‑contrast; reduced motion
- Compatibility: modern browsers; desktop (Electron/PWA); offline‑first
- Maintainability: documentation, tests (≥80% where applicable), modular architecture, logging/metrics

## Data Requirements (DR)
- Storage Layout: tasks (JSONL), notes (Markdown/JSON), settings (JSON), backups with rotation
- Schemas: tasks, checklist items, notes metadata, settings, columns, board presets
- Migration: versioned schemas; automatic migrations; validation and rollback
- Portability: export/import JSON/CSV/Markdown; compressed backups; conflict handling
- Performance: chunked/compacted storage; indexing; caching; cleanup; health checks

## User Requirements (UR)
- Personas: knowledge workers, students, creatives
- UX: intuitive, consistent, progressive disclosure, clear feedback, error prevention
- Responsiveness: desktop/tablet/mobile with touch; orientation handling
- Visual design: accessible palette, typography, iconography, spacing; subtle animations
- Internationalization: language/locale readiness; RTL support (planned)

## Technical Requirements (TR)
- Stack: React 18+ TypeScript, Vite, Zustand/Redux, Tailwind CSS
- Platform: PWA + Electron (desktop); service worker for offline
- Data: local filesystem (or File System Access API) + IndexedDB caching
- Sync (optional): cloud providers; conflict resolution; offline queue
- Validation & Testing: JSON schema/Zod, Jest/RTL, E2E (Playwright/Cypress), accessibility and performance tests
- Deployment: CI builds, code splitting, asset optimization, versioned releases

## Acceptance Criteria (AC)
- Detailed, testable ACs for board structure, tasks, DnD, inline editing, filters, preferences, data, accessibility, performance, and testing are defined in `docs/requirements/acceptance-criteria.md`.

## Current Status & Next Steps
- Implemented: theming overhaul; DnD; data management core (backups/migration); enhanced tasks UI/UX; notes storage & auto‑backup; change detection; robust storage design
- Pending (priority): file system + store integrations, broader automated tests, security hardening, optional cloud sync, performance polish

---

References: See `docs/requirements/*.md`, `docs/features/*.md`, `docs/themes/*.md`, and session logs in `docs/sessions/*.md` for the full details.


