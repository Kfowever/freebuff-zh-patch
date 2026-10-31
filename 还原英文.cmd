@echo off
setlocal EnableExtensions
chcp 65001 >nul
title Freebuff 汉化补丁 - 还原英文界面
set "PATCH_SCRIPT=%~dp0FreebuffZhPatch.ps1"
echo Freebuff 汉化补丁 0.10.1 - 还原英文界面
echo.
echo 请先保存工作。安装器会尝试正常关闭 Freebuff。
echo.
if not exist "%PATCH_SCRIPT%" (
    echo 缺少安装脚本。请先完整解压压缩包，再双击本文件。
    set "RESULT=2"
    goto :finish
)
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%PATCH_SCRIPT%" -Action Restore -Interactive -CloseRunningApp %*
set "RESULT=%ERRORLEVEL%"
:finish
echo.
if "%RESULT%"=="0" (
    echo 操作完成。现在可以打开 Freebuff。
) else (
    echo 操作未完成，请查看上方中文提示。错误代码：%RESULT%
)
echo.
if /I not "%FREEBUFF_ZH_NO_PAUSE%"=="1" (
    echo 按任意键关闭本窗口。
    pause >nul
)
exit /b %RESULT%
