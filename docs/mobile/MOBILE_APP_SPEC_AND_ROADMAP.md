## Mobile Application Specification and Roadmap

### 1) Executive summary
- **Goal**: Deliver a focused mobile experience for AI Kanban Diary that prioritizes fast task capture, day planning, calendar linkage, routines, voice diary, summaries, and AI-driven time management. Mobile intentionally removes Kanban board; desktop web retains full features.
- **Platforms**: Mobile PWA (installable) + responsive desktop web. Optional hybrid wrapper via Capacitor for app stores. Works offline; syncs to cloud (Google Drive backup/sync).

### 2) Scope and principles
- Mobile-first, quick input, minimal taps, large touch targets (≥44px), works offline, seamless background sync, privacy-first.
- Desktop web keeps Kanban and advanced features; mobile trims to essentials.
- Data model unified across platforms; presentation varies per device.

### 3) Feature matrix (mobile vs desktop web)
- Mobile (Yes):
  - Task list view (no Kanban columns)
  - Calendar-task linkup (day/week agenda)
  - Routine/repetitive tasks
  - Day-time planning (time blocks, Pomodoro optional)
  - Weekly/monthly summaries
  - Daily diary via voice notes (+ transcription)
  - AI efficiency metrics and coaching
  - Cloud sync/Google Drive backup
  - Offline-first PWA
- Mobile (No):
  - Kanban board
  - Bulk theme management UI (kept minimal)
  - Heavy layout customization tooling
- Desktop web: full feature set including Kanban board and advanced configuration.

### 4) Detailed feature specifications

4.1 Task list (mobile)
- Views: Today, Upcoming (7 days), All, Completed, Overdue.
- Quick actions: complete, snooze, set due date/time, pick calendar slot, priority, labels.
- Inline create: one-tap add; natural language parsing (e.g., “Pay bill tomorrow 5pm”).
- Filters/sort: by due date, priority, tag.

4.2 Calendar task linkup
- Bi-directional linkage between tasks and a local in-app calendar model.
- Agenda: day and week agenda views; month view compact.
- Drag/resize in calendar (desktop); on mobile, tap-and-hold to assign time blocks.
- Conflict detection and color-coded overlaps.

4.3 Routines and repetitive tasks
- Recurrence rules: daily, weekdays, custom RRULE (e.g., every 2 weeks Tue/Thu).
- Auto-generate instances for visible horizon; skip/complete propagates next occurrences.
- Streak tracking and habit chains.

4.4 Day-time management
- Time blocks with categories (Deep Work, Admin, Personal).
- Optional Pomodoro per block (25/5 defaults; configurable).
- Smart reminders: pre-block preparation and handoff notifications.

4.5 Weekly/Monthly summaries
- KPIs: tasks planned vs completed, carried-over, on-time %, focus time, interruptions, routine adherence, estimated vs actual time variance.
- Visuals: spark lines, stacked bars, donut for categories, streak meter.
- Insights feed: auto-generated highlights and improvement tips.

4.6 Voice diary (mobile-first)
- Capture: MediaRecorder API (web) or native mic (Capacitor). Store as AAC/WEBM.
- Transcription: Web Speech API where available; fallback to server/API optional. Transcript stored with audio.
- Auto-tagging: date/time, mood cue (if opted-in), topics from keywords.
- Link to tasks: “convert highlight to task”, “attach to today”.

4.7 AI time management and efficiency system
- Inputs: tasks metadata, calendar blocks, completion times, snoozes, interruptions, focus sessions, routine adherence, transcript keywords.
- Metrics:
  - Planning Accuracy Score: planned duration vs actual.
  - Execution Consistency: day-over-day completion variance and streaks.
  - Focus Quality: uninterrupted block ratio, average session length.
  - Prioritization Effectiveness: high-priority completion rate before due.
  - Schedule Adherence: tasks completed within assigned windows.
- Composite Efficiency Score: weighted blend. Baseline set after 7 days; adaptive weights.
- Coaching:
  - Predictive nudges (e.g., suggest splitting long tasks, reschedule overbooked blocks).
  - Routine reinforcement (missed streaks → gentle prompts).
  - Weekly action plan: 2–3 personalized recommendations.

4.8 Cloud sync and Google Drive backup
- Modes:
  - Backup-only: periodic JSON/zip export to Drive App Data folder.
  - Sync: primary dataset in IndexedDB; periodic bidirectional sync to Drive-backed file(s).
- Auth: Google OAuth 2.0 (PKCE). Tokens stored in IndexedDB/Storage with refresh flow.
- Storage layout:
  - appDataFolder/ai-kanban-diary/
    - state.json (primary)
    - voice-notes/<yyyy-mm>/<uuid>.webm + <uuid>.json (transcript/metadata)
    - backups/<timestamp>.json
- Conflict resolution: vector clock or last-write-wins with per-record change log; summarize conflicts to user.
- Background sync: triggered on app start, network regain, and every N minutes (respect iOS limitations). Manual “Sync now”.

### 5) Architecture and technology

5.1 Cross-platform approach
- PWA with `manifest.webmanifest` + Service Worker (Workbox via `vite-plugin-pwa`).
- Offline-first: precache app shell; runtime cache for API/media (stale-while-revalidate w/ max age).
- Optional Capacitor wrapper for native mic permissions, background tasks, notifications.

5.2 Data layer
- Client cache: IndexedDB (Dexie or idb). Objects: tasks, routines, calendarBlocks, voiceNotes, settings, analytics.
- Existing file export/import retained for desktop users.
- Change log table for conflict resolution and sync retries.

5.3 AI/analytics
- On-device calculations for metrics and scoring (privacy-first).
- Optional cloud model endpoint for NLP enhancements (topic extraction) with explicit opt-in.
- Daily job to compute KPIs and summaries; render cards in Insights.

5.4 Security and privacy
- No 3rd-party analytics by default. Local-only metrics unless user opts-in to cloud NLP.
- Drive scopes minimized (`drive.appdata` for backups; user consent explained).
- Encryption-at-rest (optional): derive key from user passphrase; encrypt IndexedDB and exported archives.

5.5 Accessibility and performance
- WCAG 2.1 AA: focus states, reduced motion, high-contrast theme.
- Mobile perf budgets: TTI < 2.5s on mid-range devices; JS < 200KB gz initial.
- Code-splitting by route; lazy-load voice and Drive modules.

### 6) Information architecture and navigation (mobile)
- Tabs: Today, Calendar, Routines, Insights, Settings.
- FAB: quick add (task/voice note).
- Today: list + mini-agenda + quick planner.
- Calendar: week/day toggle, assign tasks to slots.
- Routines: list, progress, streaks.
- Insights: metrics, weekly summary.

### 7) Data model (high level)
- Task: id, title, description, priority, labels[], dueAt, estimateMins, plannedBlockId?, completedAt, createdAt, updatedAt, routineId?, status.
- Routine: id, name, rule (RRULE), defaultEstimate, tags[], streak.
- CalendarBlock: id, startAt, endAt, taskId?, category, location?, pomodoro?
- VoiceNote: id, createdAt, duration, audioUri, transcript, tags[], linkedTaskId?
- MetricsSnapshot: id, period (day/week/month), kpis{...}, efficiencyScore.
- Settings: sync, privacy, notifications, theme.

### 8) API/SDK integrations
- Google Drive REST API v3: auth, file create/update, appDataFolder.
- Web Speech API (where available) for transcription; configurable remote provider.
- Notifications: Web Push (Android/desktop), iOS limited; Capacitor local notifications if wrapped.

### 9) Roadmap and milestones

Phase 0: Foundations (1–2 weeks)
- Add PWA scaffolding (manifest, SW via `vite-plugin-pwa`), install prompts, icons/splash.
- Create IndexedDB layer (Dexie) for tasks/settings. Migrate existing localStorage.
- Mobile navigation shell (tabs) and Today list.

Phase 1: Calendar + Routines (2–3 weeks)
- Agenda/day/week views with task assignment.
- Recurrence engine and routine UI, streak tracking.
- Time blocks and simple reminders.

Phase 2: Voice diary + Summaries (2 weeks)
- Voice capture + basic transcription; storage and playback.
- Weekly/monthly summaries with KPIs and insight cards.

Phase 3: AI Efficiency System (2–3 weeks)
- Metric collection and scoring; insights and nudges.
- Natural language task parsing; smart suggestions.

Phase 4: Cloud Sync & Drive Backup (2–3 weeks)
- OAuth (PKCE), appDataFolder backups; manual/auto backup.
- Two-way sync with conflict handling and background sync.

Phase 5: Polish, A11y, Performance (1–2 weeks)
- A11y audits, perf budgets, offline edge cases, iOS meta.
- Optional Capacitor packaging; store-readiness checklist.

### 10) Acceptance criteria (per phase highlights)
- PWA installable, offline, passes Lighthouse PWA audits.
- Today/Calendar/Routines functional on mobile; Kanban hidden on mobile.
- Voice notes record/playback; transcripts saved; link to tasks.
- Summaries show weekly/monthly KPIs and insights.
- Efficiency Score visible; actionable suggestions appear in Insights.
- Google Drive backup works; sync preserves data with conflicts surfaced.

### 11) Risks and mitigations
- iOS background sync and Web Push limitations → provide manual sync and local notifications (via Capacitor if needed).
- Speech recognition variability → allow manual correction and provider switch.
- Sync conflicts → simple resolution defaults + transparent logs.
- Privacy concerns → default local processing; clear controls for cloud features.

### 12) Implementation checklist (engineering)
- PWA: manifest, SW, install UX, offline route fallback.
- Storage: Dexie schemas; migration from localStorage; change log table.
- UI: mobile tab scaffold; Today list; Calendar; Routines; Insights.
- Voice: recording component, persistence, transcript UI.
- AI: metrics pipeline, scoring, insights generator.
- Sync: OAuth flow, Drive client, backup/sync services, conflict resolver.
- Testing: unit (stores/services), e2e (navigation, offline, sync), Lighthouse.

### 13) Out-of-scope (initial mobile release)
- Full Kanban board.
- Advanced theme/layout editors.
- Multi-account/team collaboration.

### 14) Versioning and rollout
- v0.1: Foundations (PWA, Today list, Dexie).
- v0.2: Calendar + Routines.
- v0.3: Voice diary + Summaries.
- v0.4: AI Efficiency.
- v0.5: Drive backup + Sync.
- v1.0: Polish, A11y, performance, optional store distribution.


