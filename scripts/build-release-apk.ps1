# Build a release APK (requires Android SDK + JDK; run setup-java.ps1 first if needed).
$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
$android = Join-Path $root "android"
$jbr = "C:\Program Files\Android\Android Studio\jbr"

if (-not $env:JAVA_HOME -and (Test-Path "$jbr\bin\java.exe")) {
  $env:JAVA_HOME = $jbr
}

if (-not $env:JAVA_HOME) {
  Write-Error "JAVA_HOME is not set. Run: .\scripts\setup-java.ps1"
}

Push-Location $android
try {
  # Release: all ABIs for broader device/emulator coverage (may need more RAM / paging file).
  .\gradlew.bat assembleRelease "-PreactNativeArchitectures=armeabi-v7a,arm64-v8a,x86,x86_64"
  $apk = Get-ChildItem -Path "app\build\outputs\apk\release" -Filter "*.apk" -Recurse -ErrorAction SilentlyContinue |
    Select-Object -First 1
  if ($apk) {
    Write-Host ""
    Write-Host "APK built:"
    Write-Host "  $($apk.FullName)"
  }
} finally {
  Pop-Location
}
