@echo off
setlocal EnableExtensions
title Freebuff Chinese Patch - One-click Install
chcp 65001 >nul

set "PATCH_SCRIPT=%~dp0FreebuffZhPatch.ps1"
set "PATCH_ASSET=%~dp0freebuff-zh-cn.js"

echo Freebuff Chinese Patch - One-click Install
echo ===========================================
echo.

if not exist "%PATCH_SCRIPT%" (
    echo ERROR: Missing patch engine: %PATCH_SCRIPT%
    set "RESULT=2"
    goto :finish
)

if not exist "%PATCH_ASSET%" (
    echo ERROR: Missing localization asset: %PATCH_ASSET%
    set "RESULT=2"
    goto :finish
)

powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%PATCH_SCRIPT%" -Action Install %*
set "RESULT=%ERRORLEVEL%"

:finish
echo.
if "%RESULT%"=="0" (
    echo Install check completed successfully.
) else (
    echo Install failed or was stopped for safety. Exit code: %RESULT%
)
echo.
if /I not "%FREEBUFF_ZH_NO_PAUSE%"=="1" pause
exit /b %RESULT%
