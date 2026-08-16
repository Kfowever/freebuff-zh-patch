@echo off
setlocal EnableExtensions
title Freebuff Chinese Patch - One-click Restore
chcp 65001 >nul

set "PATCH_SCRIPT=%~dp0FreebuffZhPatch.ps1"

echo Freebuff Chinese Patch - One-click Restore
echo ===========================================
echo.

if not exist "%PATCH_SCRIPT%" (
    echo ERROR: Missing patch engine: %PATCH_SCRIPT%
    set "RESULT=2"
    goto :finish
)

powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%PATCH_SCRIPT%" -Action Restore %*
set "RESULT=%ERRORLEVEL%"

:finish
echo.
if "%RESULT%"=="0" (
    echo Restore check completed successfully.
) else (
    echo Restore failed or was stopped for safety. Exit code: %RESULT%
)
echo.
if /I not "%FREEBUFF_ZH_NO_PAUSE%"=="1" pause
exit /b %RESULT%
