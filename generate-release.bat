@echo off
SET "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
SET "PATH=%JAVA_HOME%\bin;%PATH%"

echo Checking for Java...
java -version
if %errorlevel% neq 0 (
    echo ERROR: Java not found. Please ensure Android Studio is installed.
    pause
    exit /b %errorlevel%
)

cd android

echo Cleaning project...
call gradlew.bat clean

echo Generating Release App Bundle (AAB)...
call gradlew.bat bundleRelease "-PreactNativeArchitectures=armeabi-v7a,arm64-v8a,x86,x86_64"

if %errorlevel% equ 0 (
    echo.
    echo ======================================================
    echo BUILD SUCCESSFUL!
    echo.
    echo Your AAB file is located at:
    echo D:\Project\Android\android\app\build\outputs\bundle\release\app-release.aab
    echo ======================================================
) else (
    echo.
    echo ERROR: Build failed. Please check the logs above.
)

pause
