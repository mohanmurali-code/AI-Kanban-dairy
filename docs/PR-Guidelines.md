# Pull Request Guidelines

## Expectations
- Small, focused PRs (<400 lines changed when possible)
- Include description, motivation, screenshots/gifs for UI
- Link to issue or roadmap item; note acceptance criteria
- Update docs/tests as needed

## Process
1. Create feature/* branch from main
2. Commit with Conventional Commits
3. Open PR with template; request review
4. Address feedback; keep commits clean (squash if needed)
5. Ensure CI green and checklist complete before merge

## Review checklist
- Correctness: meets requirements and acceptance criteria
- UX: accessible, keyboard-friendly, responsive
- Code quality: readable, typed, tested; no dead code
- Performance: avoids unnecessary re-renders; uses memoization when needed
- Security: no secrets; safe file handling; input validated
- Docs: updated PRD/Requirements if impacted

## Definition of Done
- Tests and lints pass
- Docs updated
- Release notes entry added (if user-visible change)
- No console errors/warnings
