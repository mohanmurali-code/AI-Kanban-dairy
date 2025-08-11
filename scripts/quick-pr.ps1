# Quick PR Creation - No pager, no delays
param($branch, $title, $body = "", $base = "main", [switch]$draft)

# Kill any pager processes and set env vars
$env:GH_PAGER = ""; $env:PAGER = ""; $env:GH_NO_UPDATE_NOTIFIER = "1"

# Simple validation
if (-not $branch -or -not $title) {
    Write-Host "Usage: .\scripts\quick-pr.ps1 -branch 'name' -title 'title' [-body 'desc'] [-draft]" -ForegroundColor Red
    exit 1
}

# Create branch if needed, push, create PR
git checkout -b $branch 2>$null
git add . 2>$null
git commit -m "feat: $title" 2>$null
git push -u origin $branch 2>$null

# Build gh command
$cmd = "gh pr create --base $base --head $branch --title `"$title`""
if ($body) { $cmd += " --body `"$body`"" }
if ($draft) { $cmd += " --draft" }

# Execute without pager
Write-Host "Creating PR..." -ForegroundColor Green
& cmd /c "gh pr create --base $base --head $branch --title `"$title`" $(if($body){'--body `"$body`"'}) $(if($draft){'--draft'})"

Write-Host "Done! Check GitHub for your PR." -ForegroundColor Green
