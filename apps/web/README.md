# Web App

Vite + React app for Kanban Personal Diary.

## Documentation & Linting

- Run `npm run lint` to lint the project. The linter warns when exported symbols miss JSDoc/TSDoc.
- Run `npm run docs` to generate API docs to `docs/api` using TypeDoc.
- Install a pre-commit hook to lint staged files:
  - `npm run prepare-hooks`

### Commenting conventions

- Use TSDoc/JSDoc block comments (`/** ... */`) for exported functions, components, types, and store actions.
- Prefer concise descriptions; avoid restating obvious type info.
- Field-level comments are encouraged for non-obvious properties.
