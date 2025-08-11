# Versioning and Release

## Versioning
- Semantic Versioning: MAJOR.MINOR.PATCH
- BREAKING changes bump MAJOR; new features bump MINOR; fixes bump PATCH
- Changelog follows Keep a Changelog format; categories: Added/Changed/Fixed/Deprecated/Removed/Security

## Branching model
- main: stable, release-only
- feature/*: short-lived branches for changes
- release/* (optional): prep releases if needed
- hotfix/*: urgent fixes branched from latest tag

## Releases
- Tag as vX.Y.Z
- Generate release notes from conventional commits
- Build installers/bundles via CI for Windows (and others if applicable)
- Attach artifacts to GitHub Releases

## Commit messages
- Conventional Commits: feat:, fix:, docs:, refactor:, perf:, test:, chore:, build:, ci:
- Scope recommended: feat(kanban): add multi-select move

## Migrations
- settings.json contains schemaVersion
- On upgrade, run migrations before UI renders
- Ensure backup before applying migration; atomic rename on write

## Feature flags
- Use environment-driven flags or settings toggles for risky features

## QA and sign-off
- Checklist per PR; smoke test on Windows; acceptance criteria verified
