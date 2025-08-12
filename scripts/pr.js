#!/usr/bin/env node
/*
 Cross-platform PR helper
 - Caches last-used args in .prconfig.json (repo root)
 - Steps: ensure gh auth, ensure git repo, create/switch branch, stage/commit, push, gh pr create
*/
const { execSync } = require('node:child_process')
const { existsSync, readFileSync, writeFileSync } = require('node:fs')
const { join } = require('node:path')

function run(cmd, opts = {}) {
  return execSync(cmd, { stdio: 'pipe', encoding: 'utf8', ...opts }).trim()
}

function parseArgs() {
  const args = process.argv.slice(2)
  const res = { branch: '', title: '', body: '', base: 'main', draft: false }
  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    const val = args[i + 1]
    if (a === '--branch') { res.branch = val; i++ }
    else if (a === '--title') { res.title = val; i++ }
    else if (a === '--body') { res.body = val; i++ }
    else if (a === '--base') { res.base = val; i++ }
    else if (a === '--draft') { res.draft = true }
  }
  return res
}

function loadConfig(repoRoot) {
  const p = join(repoRoot, '.prconfig.json')
  if (existsSync(p)) {
    try { return JSON.parse(readFileSync(p, 'utf8')) } catch { return {} }
  }
  return {}
}

function saveConfig(repoRoot, cfg) {
  const p = join(repoRoot, '.prconfig.json')
  writeFileSync(p, JSON.stringify(cfg, null, 2))
}

function main() {
  process.env.GH_PAGER = ''
  process.env.PAGER = ''
  process.env.GH_NO_UPDATE_NOTIFIER = '1'

  // Verify git repo
  try { run('git rev-parse --is-inside-work-tree') } catch {
    console.error('Not in a git repository. Run from project root.')
    process.exit(1)
  }

  const repoRoot = run('git rev-parse --show-toplevel')
  const cfg = loadConfig(repoRoot)
  const args = parseArgs()
  const branch = args.branch || cfg.branch || ''
  const base = args.base || cfg.base || 'main'
  const title = args.title || cfg.title || ''
  const body = args.body || ''
  const draft = !!args.draft

  if (!branch || !title) {
    console.error('Usage: node scripts/pr.js --branch <name> --title <title> [--body <text>] [--base <branch>] [--draft]')
    process.exit(1)
  }

  // Save latest args
  saveConfig(repoRoot, { ...cfg, branch, base, title })

  // Ensure gh
  try { run('gh --version') } catch {
    console.error('GitHub CLI (gh) not installed. Install from https://cli.github.com/')
    process.exit(1)
  }

  // Ensure auth
  try {
    const s = run('gh auth status')
    if (!s || /not logged in/i.test(s)) {
      console.error('Not authenticated. Run: gh auth login')
      process.exit(1)
    }
  } catch {
    console.error('Auth check failed. Run: gh auth login')
    process.exit(1)
  }

  // Create/switch branch
  try {
    const existing = run(`git branch --list ${branch}`)
    if (!existing) run(`git checkout -b ${branch}`)
    else run(`git checkout ${branch}`)
  } catch (e) {
    console.error('Failed to switch/create branch:', e.message)
    process.exit(1)
  }

  // Stage and commit all changes under apps/web by default; fall back to full repo if desired
  try {
    run('git add -A apps/web')
    const status = run('git status --porcelain')
    if (status) {
      run(`git commit -m "${title}"`)
    }
  } catch (e) {
    console.error('Git commit failed:', e.message)
    process.exit(1)
  }

  // Push
  try {
    run(`git push -u origin ${branch}`)
  } catch (e) {
    console.error('Git push failed:', e.message)
    process.exit(1)
  }

  // Create PR
  try {
    const draftFlag = draft ? '--draft' : ''
    const bodyFlag = body ? `--body "${body.replace(/"/g, '\\"')}"` : ''
    const out = run(`gh pr create --base ${base} --head ${branch} --title "${title}" ${bodyFlag} ${draftFlag}`)
    console.log(out)
  } catch (e) {
    console.error('Failed to create PR:', e.message)
    console.error('If no commits between base and branch, ensure you committed changes.')
    process.exit(1)
  }
}

main()


