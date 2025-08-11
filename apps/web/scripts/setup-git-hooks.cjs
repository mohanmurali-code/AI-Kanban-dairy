#!/usr/bin/env node
// Simple script to install a pre-commit hook that runs eslint on staged files
const { execSync } = require('node:child_process')
const { writeFileSync, mkdirSync, existsSync } = require('node:fs')
const { join } = require('node:path')

try {
  const gitDir = execSync('git rev-parse --git-dir', { stdio: ['ignore', 'pipe', 'ignore'] })
    .toString()
    .trim()
  const hooksDir = join(process.cwd(), gitDir, 'hooks')
  if (!existsSync(hooksDir)) mkdirSync(hooksDir, { recursive: true })

  const hookPath = join(hooksDir, 'pre-commit')
  const script = `#!/bin/sh
# Run ESLint on staged files
STAGED=$(git diff --cached --name-only --diff-filter=ACMRT | grep -E '\\.(js|jsx|ts|tsx)$')
if [ -z "$STAGED" ]; then
  exit 0
fi
echo "Running ESLint on staged files..."
npx eslint $STAGED
RESULT=$?
if [ $RESULT -ne 0 ]; then
  echo "\nESLint failed. Fix issues or commit with --no-verify if necessary."
  exit $RESULT
fi
exit 0
`
  writeFileSync(hookPath, script, { encoding: 'utf8' })
  execSync(`chmod +x "${hookPath}"`)
  console.log('pre-commit hook installed')
} catch (e) {
  console.error('Failed to install git hooks:', e.message)
  process.exit(1)
}


