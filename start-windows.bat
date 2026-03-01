@echo off
REM Quick start for Windows users

echo ========================================
echo AI Design to Code + Penpot
echo Windows Quick Start
echo ========================================
echo.

REM Check Vagrant
where vagrant > nul 2>&1
if %errorlevel% neq 0 (
    echo [31m❌ Vagrant not found[0m
    echo Please install from: https://www.vagrantup.com/downloads
    exit /b 1
)

echo [32m✅ Vagrant found[0m

REM Check VirtualBox
where VBoxManage > nul 2>&1
if %errorlevel% neq 0 (
    echo [31m❌ VirtualBox not found[0m
    echo Please install from: https://www.virtualbox.org/wiki/Downloads
    exit /b 1
)

echo [32m✅ VirtualBox found[0m
echo.

REM Start VM
echo [36m🚀 Starting VM...[0m
vagrant up

if %errorlevel% neq 0 (
    echo [31m❌ Failed to start VM[0m
    exit /b 1
)

echo.
echo ========================================
echo [32m✅ VM Started![0m
echo ========================================
echo.
echo Next steps:
echo 1. vagrant ssh
echo 2. Edit /opt/ai-design-to-code/.env with your KIMI_API_KEY
echo 3. Run: start-ai-design
echo.
echo Access:
echo   AI Tool: http://localhost:3000
echo   Penpot:  http://localhost:9001
echo.
pause
