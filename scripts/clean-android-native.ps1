# Clears Gradle and CMake caches for expo-modules-core / React Native native builds.
# Use after "paging file is too small" or odd native link errors, then rebuild.
$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
$android = Join-Path $root "android"

Write-Host "Stopping Gradle daemons..."
Push-Location $android
try {
  .\gradlew.bat --stop 2>$null
} catch { }
Pop-Location

$paths = @(
  (Join-Path $root "node_modules\expo-modules-core\android\.cxx"),
  (Join-Path $android ".gradle"),
  (Join-Path $android "app\build"),
  (Join-Path $android "build")
)

foreach ($p in $paths) {
  if (Test-Path $p) {
    Write-Host "Removing $p"
    Remove-Item -Recurse -Force $p -ErrorAction SilentlyContinue
  }
}

Write-Host ""
Write-Host "Done. Rebuild with:"
Write-Host "  cd $root"
Write-Host "  npm run android"
Write-Host ""
Write-Host "If build still fails with paging file errors, increase Windows virtual memory"
Write-Host "(System > About > Advanced system settings > Performance > Advanced > Virtual memory)."
