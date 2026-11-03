# Run from PowerShell outside the restricted agent sandbox.
# Stages only each reviewed issue patch; existing unrelated edits stay unstaged.
$ErrorActionPreference = 'Stop'
Push-Location (Split-Path -Parent $PSScriptRoot)
try {
    $taskManifest = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'manifest.json') -Raw | ConvertFrom-Json
    $taskBranch = git branch --show-current
    if ($LASTEXITCODE -ne 0 -or $taskBranch -ne $taskManifest.branch) {
        throw 'The current branch does not match the reviewed branch.'
    }
    $taskHead = git rev-parse HEAD
    if ($LASTEXITCODE -ne 0 -or $taskHead -ne $taskManifest.base) {
        throw 'HEAD changed after patch preparation. Review the patch base before proceeding.'
    }
    git diff --cached --quiet
    if ($LASTEXITCODE -ne 0) { throw 'The index has staged changes. Preserve them before running this script.' }

    foreach ($taskIssue in $taskManifest.issues) {
        $taskPatch = Join-Path $PSScriptRoot ($taskIssue.id + '.patch')
        git apply --cached --check -- $taskPatch
        if ($LASTEXITCODE -ne 0) { throw ('Patch check failed: ' + $taskIssue.id) }
        git apply --cached -- $taskPatch
        if ($LASTEXITCODE -ne 0) { throw ('Staging failed: ' + $taskIssue.id) }
        $taskStaged = @(git diff --cached --name-only)
        if ($LASTEXITCODE -ne 0 -or @(Compare-Object ($taskStaged | Sort-Object) ($taskIssue.files | Sort-Object)).Count -ne 0) {
            throw 'The staged file list differs from the reviewed issue. Inspect it before committing.'
        }
        git commit -m $taskIssue.message
        if ($LASTEXITCODE -ne 0) { throw ('Commit failed: ' + $taskIssue.id + '. The staged patch is preserved for inspection.') }
    }
    git log -3 --oneline
    if ($LASTEXITCODE -ne 0) { throw 'Could not display commits.' }
} finally {
    Pop-Location
}
