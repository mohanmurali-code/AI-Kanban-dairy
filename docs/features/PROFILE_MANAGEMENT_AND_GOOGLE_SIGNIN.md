## Profile Management and Google Sign-In

### Summary
- Introduce a Profile section that centralizes account information and data controls.
- Add optional Google Sign-In (GIS) to personalize the app and enable cloud backups.
- Relocate existing Data Management tools from `Settings` to `Profile` for clearer IA.

### Goals
- Personalize experience with a lightweight profile (name, avatar, email).
- Keep app local-first; sign-in is optional and only used for value-add features (e.g., Drive backup).
- Improve discoverability of backups/restore by placing them with account context.
- Maintain offline support and avoid introducing server dependencies.

### Non-Goals
- No multi-user/collaboration or remote database.
- No mandatory authentication to use the app.
- No PII sent to any third-party beyond Google for OAuth if user opts in.

### User Stories
- As a user, I can view and edit my profile (display name, avatar, theme preferences link).
- As a user, I can sign in with Google to enable Drive backups and restore.
- As a user, I can disconnect my Google account at any time and keep all local data.
- As a user, I can manage backups and restores from my Profile page.
- As a user, I can export/import locally without signing in.

### Information Architecture Changes
- Add new `Profile` page under main navigation.
- Move Data Management (backups, import/export, integrity checks) from `Settings → Data` into `Profile`.
- Keep `Settings` focused on preferences (appearance, behavior, notifications).

### UX/UI
- Profile header: avatar, name, email (if signed in), sign-in/out button.
- Sections on `Profile` page:
  - Account: sign-in/out, connection status, last sign-in, revoke access.
  - Data Management: existing backup list, create backup, restore, integrity check.
  - Cloud Backups (if signed in): list Drive backups, upload, restore, refresh.
  - Danger Zone: clear local data (with confirmations).

### Data Model
- `UserProfile` (local persisted):
  - `id: string` (generated locally; not Google account id)
  - `displayName: string`
  - `avatarUrl?: string`
  - `email?: string` (populated from Google if available)
  - `googleConnected: boolean`
  - `lastSigninAt?: string`
  - `driveBackupsEnabled: boolean` (true when Google connected)
  - `createdAt: string`, `updatedAt: string`

Note: Do not store refresh tokens. GIS provides short-lived access tokens; no server storage.

### Google Sign-In (GIS) Integration
- Library: Google Identity Services (script: `https://accounts.google.com/gsi/client`).
- OAuth Client ID: `VITE_GOOGLE_CLIENT_ID` (configured in `apps/web/.env.local`).
- Scopes:
  - Base sign-in: `openid email profile` (implicit from GIS; profile-only)
  - Drive backups: `https://www.googleapis.com/auth/drive.file` (only for files the app creates)
- Token handling:
  - Request on demand; store in memory only, never persisted.
  - Revoke via `google.accounts.oauth2.revoke` on disconnect.
- Security:
  - Use the minimum scope required.
  - Validate origin in Google Cloud Console; use HTTPS (or localhost) in dev.
  - Avoid exposing tokens in logs.

### Data Management Relocation
- Re-use `DataManagementPanel` component but render it under `Profile` page.
- Remove Data tab from `Settings` UI and routing.
- Ensure links/tooltips guide users who previously used Settings for backups.

### Offline-First Behavior
- All core features work offline.
- Google actions are no-ops with clear messaging when offline.
- Local import/export remain available without sign-in.

### Accessibility
- All new buttons labeled and keyboard-navigable.
- Sign-in button has descriptive ARIA labels.
- Announce success/failure of backup/restore via polite live regions.

### Telemetry/Diagnostics (optional)
- Locally log last backup timestamps and results for troubleshooting; do not transmit externally.

### Settings and Env
- `.env.local` (not committed):
  - `VITE_GOOGLE_CLIENT_ID=YOUR_OAUTH_CLIENT_ID.apps.googleusercontent.com`
- Google Console:
  - Authorized JavaScript origins: dev localhost origin and production origin.
  - Authorized redirect URIs: not needed for token flows used by GIS token client.

### Security and Privacy
- Tokens kept in memory only; cleared on disconnect/reload.
- No server backend; Drive API called directly with user consent.
- Only store minimal profile attributes locally; allow full data deletion.

### Error Handling
- Clear, actionable errors (e.g., missing client ID, denied consent, network failures).
- Retry flows for token acquisition; offer re-consent if scope changes.

### Acceptance Criteria
- Profile Page exists with sections: Account, Data Management, Cloud Backups, Danger Zone.
- Google Sign-In works; shows user name/email/avatar; can disconnect.
- Data Management fully functional from Profile; equivalent to previous Settings functionality.
- Drive backups: can upload backup JSON and list/restore backups created by the app.
- Offline use: app is fully usable; cloud actions show appropriate messaging.

### Non-Functional Requirements
- No noticeable performance degradation at startup.
- UI responsive on desktop and mobile breakpoints.
- No additional build-time dependencies beyond GIS script.

### Risks & Mitigations
- Risk: OAuth misconfiguration → Provide setup doc and runtime checks for client ID.
- Risk: Token errors/rate limits → Use minimal scopes; backoff and user prompts.
- Risk: User confusion about sign-in → Make sign-in clearly optional and value-focused.

### Rollout Plan
1. Ship Profile page alongside existing Settings Data section (hidden behind flag if desired).
2. Migrate Data Management to Profile; leave a redirect note in Settings for one release.
3. Remove Settings Data tab.

### Testing Plan
- Manual: sign-in, backup upload, list, restore, disconnect; offline behavior.
- Unit: profile store reducers; utility functions for Drive list/upload/download (mock fetch).
- E2E: backup-restore scenarios through Profile.

### Implementation Outline
- Add `pages/Profile.tsx` route and navigation entry.
- Create `store/profile.ts` for `UserProfile` (Zustand) with actions: setProfile, connectGoogle, disconnectGoogle.
- Move `DataManagementPanel` rendering from `Settings` to `Profile`.
- Add `GoogleSignInButton` component that triggers GIS and updates profile store.
- Drive backup utilities (if not present): token handling, upload, list, download via fetch.
- Env check and helpful error UI if client ID missing.

### Migration Notes
- If `Settings → Data` existed, remove that tab and import `DataManagementPanel` in `Profile`.
- Ensure deep-links or user help text directs users to `Profile`.

### Open Questions
- Should profile allow manual avatar upload when not signed in? (Default: not in v1)
- Should we surface sign-in on first backup attempt? (Default: yes, soft CTA)


### Detailed Architecture
- Client-only, local-first architecture; no server components.
- Stores:
  - `profileStore`: holds `UserProfile` (displayName, avatarUrl, email, googleConnected, lastSigninAt, driveBackupsEnabled).
  - Existing `tasks` and `notes` stores remain unchanged.
- Utilities (high-level spec):
  - `googleDrive` (utility): load GIS, request tokens (memory-only), upload/list/download Drive files in an app folder, revoke.
  - `dataManager`: generate full backup JSON (versioned, with metadata), validate and restore; rotate local backups.
- Pages/Components:
  - `Profile` page hosts Account (Google connection), Data Management, Cloud Backups, Danger Zone.
  - Reuses `DataManagementPanel` for local backups, with additional Cloud section when connected.

### Backup Schema (JSON)
```json
{
  "version": "1.0",
  "createdAt": "2025-01-01T12:34:56.000Z",
  "filename": "kanban-backup-2025-01-01-123456.json",
  "data": {
    "tasks": { "tsk_...": {"id":"tsk_...","title":"..."} },
    "columnOrder": { "draft": ["tsk_..."], "completed": [] },
    "notes": { "note_...": {"id":"note_...","title":"..."} },
    "templates": { "daily": {"id":"daily","name":"Daily Note"} },
    "settings": { "backups": {"autoBackup": {"enabled": true}} },
    "metadata": {
      "exportedAt": "2025-01-01T12:34:56.000Z",
      "dataLocation": { "path": "./kanban-data", "name": "Default" }
    }
  }
}
```
- Always include `version` and `metadata.exportedAt`.
- On restore, validate presence and types; warn but continue on non-critical fields.

### Drive Folder & Query Strategy
- Create or reuse a single folder named "Kanban Diary Backups".
- Use `appProperties` to tag files: `{ "app":"kanban-diary", "schema":"1.0" }`.
- List query: by parent folder AND matching `appProperties`; order by `createdTime desc`.
- Filenames: `kanban-backup-YYYY-MM-DD-HHMMSS.json`.

### User Flows (Sequence)
- Connect Google
  1) User clicks Connect → GIS token flow (scopes: `openid email profile` initially).
  2) Profile updated with name/email/avatar; `googleConnected = true`.
  3) Drive scope requested only when enabling cloud backups (incremental auth → `drive.file`).
- Backup to Drive
  1) Build backup JSON (`dataManager`).
  2) Ensure token valid; create folder if needed; multipart upload JSON.
  3) Show success; refresh list.
- Restore from Drive
  1) Confirm; create local safety backup.
  2) Download JSON; validate; apply restore; reload app.
- Disconnect
  1) Revoke token; clear in-memory token; set `googleConnected = false`; keep local data intact.

### Error & Retry Matrix
- Token expired → refresh silently; if fails, re-prompt consent.
- HTTP 429/5xx → exponential backoff (e.g., 500ms, 1s, 2s, 4s; jitter; max 5 tries).
- Missing env client ID → surface actionable error with setup link.
- Integrity failure on restore → abort restore; keep safety backup; display reasons.
- Offline → show non-blocking message; disable cloud buttons; keep local backup options enabled.

### Security & Privacy (Threat Model)
- Assets: user tasks/notes; profile details; tokens.
- Risks: token leakage, overscoped permissions, unintended data exposure.
- Mitigations:
  - Least privilege (`drive.file`); incremental authorization.
  - Tokens: memory-only; revoke on disconnect; never persist or log.
  - CSP & HTTPS; restrict OAuth origins; avoid embedding tokens in URLs.
  - Optional client-side encryption (future) with user-managed passphrase (AES-GCM).

### UX Copy & Accessibility
- Connect CTA: "Connect Google Drive (optional)" with scope explanation.
- Post-actions: toast/snackbar with concise success/failure; ARIA live region.
- Confirmations: pre-restore confirmation summarizing changes and safety backup.
- Empty states: explain benefits; provide local export/import link.

### QA Checklist
- Connect/Disconnect across reloads; token revoke verified.
- Backup upload: success path; 429/5xx retries; offline behavior; large file fallback.
- Restore: safety backup created; validation errors surfaced; partial restore warnings.
- Rotation: keep last N Drive backups and local backups.
- Accessibility: keyboard navigation; labels; color contrast.

### Success Metrics (local, anonymous)
- % of users enabling Drive.
- Backup success rate; median upload time.
- Restore success rate; median restore time.
- Average number of retained backups.

### Incremental Authorization Details
- Phase 1 (Profile connect): request `openid email profile` only to populate profile.
- Phase 2 (Enable Cloud Backup): request additional `drive.file` scope via incremental auth.
- On scope denial: keep local backups enabled; show non-blocking help to re-try later.
- Scope changes later (new permissions): explicitly prompt user and explain why.

### Performance & Size Limits
- JSON backup typical size: under a few MB; if > 5 MB, switch to resumable upload.
- Rate limiting: on 429/5xx, exponential backoff with jitter; cap total retry time to 30s.
- UI responsiveness: actions complete or fail fast; show progress indicators for long operations.
- Memory budget: avoid keeping multiple large JSON copies; stream when possible.

### Disaster Recovery & Rollback
- Always create a local safety backup before restore (even from cloud).
- If restore validation fails, abort and keep safety backup; present errors to user.
- If partial migration occurs, list warnings and items impacted; provide button to roll back to safety backup.
- Provide a “Download latest local backup” button for manual external recovery.

### Feature Flags & Config
- Flags:
  - `enableProfilePage` (default: true)
  - `enableCloudBackups` (default: true)
  - `enableResumableUpload` (default: true when size > 5 MB)
- Env:
  - `VITE_GOOGLE_CLIENT_ID` (required for sign-in)
  - `VITE_BACKUP_FOLDER_NAME` (optional, default: "Kanban Diary Backups")

### Dev/QA Setup for Google OAuth
- Create OAuth Client (Web) in Google Cloud Console.
- Add authorized origins: `http://localhost:5173` (vite default) and production origin.
- Use `.env.local` with `VITE_GOOGLE_CLIENT_ID` in `apps/web`.
- Test matrix: normal consent, denied consent, revoked consent, expired token, offline.

### Compliance Checklist
- Privacy Policy describes: what data is stored locally; what is sent to Google; opt-in nature.
- Tokens never persisted; no server-side collection.
- Scopes minimized; Drive access limited to app-created files via `drive.file`.
- Clearly document disconnect/revoke steps.

### Pseudocode: Drive Utilities
```ts
// Ensure access token (memory-only)
async function ensureToken(scopes: string[]): Promise<string> {
  // init GIS token client with clientId + scopes
  // if existing token valid, return; else requestAccessToken({ prompt: '' })
}

// Get or create backups folder
async function getBackupsFolderId(): Promise<string> {
  // search folder by name + appProperties; if missing, create
}

// Upload backup (multipart or resumable)
async function uploadBackup(filename: string, json: object): Promise<void> {
  const id = await getBackupsFolderId()
  // POST multipart to upload endpoint with metadata.parents=[id] and JSON body
}

// List backups
async function listBackups(): Promise<DriveFile[]> {
  const id = await getBackupsFolderId()
  // GET files with q: `'${id}' in parents and trashed=false and appProperties has { app:'kanban-diary' }`
}

// Download and restore
async function restore(fileId: string): Promise<void> {
  // GET alt=media → validate → safety backup → apply → reload
}
```

### Data Retention Policy
- Local: keep last N (default 10) rolling backups; purge oldest beyond limit.
- Drive: maintain the same policy when listing; optionally expose a “Keep latest N” control.
- Never auto-delete outside the app’s folder; only manage app-created files.

### Logging & Monitoring (Local Only)
- Store minimal local logs: last backup time, last error message, counts of retries.
- Redact PII; never store tokens; allow user to clear logs.
- Provide a “copy diagnostics” button that copies a redacted JSON summary.


