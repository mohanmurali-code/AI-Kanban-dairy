# Scripts

## create-pr.ps1

PowerShell script for creating GitHub pull requests efficiently.

### Features
- ✅ Automatic environment setup (no pager issues)
- ✅ Git repository validation
- ✅ GitHub CLI authentication check
- ✅ Branch creation and management
- ✅ Uncommitted changes handling
- ✅ Remote branch synchronization
- ✅ PR body file management
- ✅ Error handling and fallbacks

### Usage

#### Basic PR creation
```powershell
.\scripts\create-pr.ps1 -branch "feature-name" -title "Add new feature" -body "This PR adds..."
```

#### Create draft PR
```powershell
.\scripts\create-pr.ps1 -branch "feature-name" -title "WIP: Add new feature" -draft
```

#### PR against different base branch
```powershell
.\scripts\create-pr.ps1 -branch "hotfix" -title "Fix critical bug" -base "develop"
```

### Prerequisites
- Git repository
- GitHub CLI (`gh`) installed and authenticated
- PowerShell 5.1+ (Windows 10+)

### What it does
1. Sets environment variables to avoid pager issues
2. Validates git repository and GitHub CLI setup
3. Checks authentication status
4. Creates local branch if it doesn't exist
5. Handles uncommitted changes (asks user)
6. Pushes branch to remote if needed
7. Creates PR body file if description provided
8. Executes `gh pr create` with proper parameters
9. Cleans up temporary files
10. Provides fallback manual PR link if needed

### Example workflow
```powershell
# Make changes to your code
git add .
git commit -m "feat: add new component"

# Create PR in one command
.\scripts\create-pr.ps1 -branch "add-component" -title "feat: add new component" -body "Adds a new reusable component for the dashboard."
```

### Troubleshooting
- **"Not authenticated"**: Run `gh auth login` first
- **"GitHub CLI not installed"**: Install from https://cli.github.com/
- **"Not in git repository"**: Run from project root directory

## Dev server helper scripts (Windows)

These `.bat` helpers manage the Vite dev server for the web app without spawning new ports.

All scripts assume default port 5173 and the app at `apps/web`.

### web-dev-start.bat
Starts the Vite dev server on the default port and opens the browser. It kills any existing process on port 5173 first.

Usage (double-click or from terminal):
```bat
scripts\web-dev-start.bat
```

### web-dev-restart.bat
Stops the server on port 5173 and starts it again, reopening the browser.
```bat
scripts\web-dev-restart.bat
```

### web-dev-stop.bat
Stops any process listening on port 5173 (the Vite dev server by default).
```bat
scripts\web-dev-stop.bat
```