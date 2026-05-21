# Sets JAVA_HOME to Android Studio's bundled JDK (run once in PowerShell as your user).
$jbr = "C:\Program Files\Android\Android Studio\jbr"
if (-not (Test-Path "$jbr\bin\java.exe")) {
  Write-Error "JDK not found at: $jbr`nInstall Android Studio or set JAVA_HOME to another JDK 17+."
  exit 1
}

[Environment]::SetEnvironmentVariable("JAVA_HOME", $jbr, "User")
$env:JAVA_HOME = $jbr
$path = [Environment]::GetEnvironmentVariable("Path", "User")
$javaBin = "$jbr\bin"
if ($path -notlike "*$javaBin*") {
  [Environment]::SetEnvironmentVariable("Path", "$javaBin;$path", "User")
}

& "$jbr\bin\java.exe" -version
Write-Host ""
Write-Host "JAVA_HOME set for your user account to:"
Write-Host "  $jbr"
Write-Host "Restart Android Studio and any open terminals, then run:"
Write-Host "  cd D:\Project\Android\android"
Write-Host "  .\gradlew.bat assembleRelease"
