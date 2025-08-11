# Folder Structure

## Repository
```
/
├─ app/                 # Source code (to be created during scaffold)
│  ├─ src/
│  │  ├─ components/
│  │  ├─ features/
│  │  │  ├─ kanban/
│  │  │  ├─ notes/
│  │  │  └─ tasks/
│  │  ├─ state/
│  │  ├─ storage/
│  │  ├─ routes/
│  │  ├─ theme/
│  │  └─ utils/
│  ├─ public/
│  └─ tauri/            # If using Tauri (src-tauri/ convention)
├─ docs/                # Documentation (this folder)
├─ .github/
│  └─ PULL_REQUEST_TEMPLATE.md
├─ scripts/
├─ tests/
└─ README.md
```

## Runtime data folder (user-selected)
```
<chosen-folder>/
├─ tasks.jsonl
├─ tasks.compacted.json (generated periodically)
├─ settings.json
├─ notes.md (or notes.json)
└─ backups/
   └─ YYYY-MM-DD/
      ├─ tasks.jsonl
      ├─ settings.json
      └─ notes.md
```

## Notes
- Prefer JSONL for append-only writes; compact during idle
- Keep schemaVersion in settings.json; run migrations on change
- Atomic writes via temp file + rename to prevent corruption
