# Create Pull Request Script
# Usage: .\scripts\create-pr.ps1 -branch "feature-name" -title "PR Title" -body "PR description"

param(
    [Parameter(Mandatory=$true)]
    [string]$branch,
    
    [Parameter(Mandatory=$true)]
    [string]$title,
    
    [Parameter(Mandatory=$false)]
    [string]$body = "",
    
    [Parameter(Mandatory=$false)]
    [string]$base = "main",
    
    [Parameter(Mandatory=$false)]
    [switch]$draft
)

# Set environment variables to avoid pager issues
$env:GH_PAGER = ""
$env:PAGER = ""
$env:GH_NO_UPDATE_NOTIFIER = "1"

Write-Host "🚀 Creating Pull Request..." -ForegroundColor Green

# Check if we're in a git repository
if (-not (git rev-parse --is-inside-work-tree 2>$null)) {
    Write-Error "❌ Not in a git repository. Please run this from your project root."
    exit 1
}

# Check if GitHub CLI is installed
try {
    $ghVersion = gh --version 2>$null
    if (-not $ghVersion) {
        Write-Error "❌ GitHub CLI (gh) is not installed. Please install it first."
        exit 1
    }
} catch {
    Write-Error "❌ GitHub CLI (gh) is not installed. Please install it first."
    exit 1
}

# Check authentication status
Write-Host "🔐 Checking GitHub authentication..." -ForegroundColor Yellow
try {
    $authStatus = gh auth status 2>$null
    if (-not $authStatus -or $authStatus -match "not logged in") {
        Write-Error "❌ Not authenticated with GitHub. Please run 'gh auth login' first."
        exit 1
    }
    Write-Host "✅ GitHub authentication confirmed" -ForegroundColor Green
} catch {
    Write-Error "❌ Authentication check failed. Please run 'gh auth login' first."
    exit 1
}

# Check if branch exists locally
if (-not (git branch --list $branch)) {
    Write-Host "⚠️  Branch '$branch' doesn't exist locally. Creating it..." -ForegroundColor Yellow
    git checkout -b $branch
    if ($LASTEXITCODE -ne 0) {
        Write-Error "❌ Failed to create branch '$branch'"
        exit 1
    }
} else {
    Write-Host "✅ Branch '$branch' exists locally" -ForegroundColor Green
    git checkout $branch
}

# Check if there are uncommitted changes
$status = git status --porcelain
if ($status) {
    Write-Host "📝 Found uncommitted changes:" -ForegroundColor Yellow
    Write-Host $status -ForegroundColor Gray
    
    $commit = Read-Host "Do you want to commit these changes? (y/n)"
    if ($commit -eq "y" -or $commit -eq "Y") {
        $commitMessage = Read-Host "Enter commit message"
        git add .
        git commit -m $commitMessage
        if ($LASTEXITCODE -ne 0) {
            Write-Error "❌ Failed to commit changes"
            exit 1
        }
        Write-Host "✅ Changes committed" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Skipping commit. PR will be created with current state." -ForegroundColor Yellow
    }
}

# Push branch to remote if not already pushed
$remoteBranch = git ls-remote --heads origin $branch
if (-not $remoteBranch) {
    Write-Host "📤 Pushing branch '$branch' to remote..." -ForegroundColor Yellow
    git push -u origin $branch
    if ($LASTEXITCODE -ne 0) {
        Write-Error "❌ Failed to push branch to remote"
        exit 1
    }
    Write-Host "✅ Branch pushed to remote" -ForegroundColor Green
} else {
    Write-Host "✅ Branch '$branch' already exists on remote" -ForegroundColor Green
}

# Create PR body file if body is provided
$bodyFile = $null
if ($body) {
    $bodyFile = "pr_body_$branch.md"
    $body | Set-Content -Path $bodyFile -Encoding UTF8
    Write-Host "📄 Created PR body file: $bodyFile" -ForegroundColor Green
}

# Build gh command
$ghCommand = "gh pr create --base $base --head $branch --title `"$title`""
if ($bodyFile) {
    $ghCommand += " --body-file $bodyFile"
} elseif ($body) {
    $ghCommand += " --body `"$body`""
}
if ($draft) {
    $ghCommand += " --draft"
}

# Create the pull request
Write-Host "🔗 Creating pull request..." -ForegroundColor Yellow
Write-Host "Command: $ghCommand" -ForegroundColor Gray

try {
    $result = Invoke-Expression $ghCommand
    Write-Host "✅ Pull request created successfully!" -ForegroundColor Green
    Write-Host $result -ForegroundColor Cyan
    
    # Clean up body file if it was created
    if ($bodyFile -and (Test-Path $bodyFile)) {
        Remove-Item $bodyFile
        Write-Host "🧹 Cleaned up temporary body file" -ForegroundColor Green
    }
    
} catch {
    Write-Error "❌ Failed to create pull request: $($_.Exception.Message)"
    Write-Host "💡 You can create the PR manually at:" -ForegroundColor Yellow
    Write-Host "https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)/pull/new/$branch" -ForegroundColor Cyan
    
    # Clean up body file if it was created
    if ($bodyFile -and (Test-Path $bodyFile)) {
        Remove-Item $bodyFile
    }
    exit 1
}

Write-Host "🎉 Done! Your pull request is ready for review." -ForegroundColor Green
