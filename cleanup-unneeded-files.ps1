# PowerShell script to clean up unnecessary files for deployment
Write-Host "Starting cleanup of unnecessary files..." -ForegroundColor Green

# Define the base path
$basePath = "c:\Users\TECHZON-17\Desktop\ticket system"

# List of files and directories to remove
$itemsToRemove = @(
    ".git",
    "node_modules",
    "package-lock.json",
    "UNNECESSARY_FILES.md",
    "CLEAN_DEPLOYMENT_GUIDE.md",
    "CPANEL_PHPMYADMIN_TABLE_CREATION.md"
)

# Remove each item
foreach ($item in $itemsToRemove) {
    $fullPath = Join-Path $basePath $item
    if (Test-Path $fullPath) {
        Write-Host "Removing: $item" -ForegroundColor Yellow
        try {
            Remove-Item -Path $fullPath -Recurse -Force
            Write-Host "Successfully removed: $item" -ForegroundColor Green
        } catch {
            Write-Host "Failed to remove: $item - $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "Item not found (skipping): $item" -ForegroundColor Gray
    }
}

# Also remove the root package.json if it exists
$rootPackageJson = Join-Path $basePath "package.json"
if (Test-Path $rootPackageJson) {
    Write-Host "Removing root package.json" -ForegroundColor Yellow
    try {
        Remove-Item -Path $rootPackageJson -Force
        Write-Host "Successfully removed root package.json" -ForegroundColor Green
    } catch {
        Write-Host "Failed to remove root package.json - $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "Cleanup completed!" -ForegroundColor Green