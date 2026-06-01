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

echo Generating Release APK...
call gradlew.bat assembleRelease "-PreactNativeArchitectures=armeabi-v7a,arm64-v8a,x86,x86_64"

if %errorlevel% equ 0 (
    echo.
    echo ======================================================
    echo APK BUILD SUCCESSFUL!
    echo.
    echo Your APK file is located at:
    echo D:\Project\Android\android\app\build\outputs\apk\release\app-release.apk
    echo ======================================================
) else (
    echo.
    echo ERROR: Build failed. Please check the logs above.
)

pause
