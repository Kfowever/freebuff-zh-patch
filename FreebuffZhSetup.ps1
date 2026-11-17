[CmdletBinding()]
param(
    [ValidateSet('Install','Check','Watch','Status','Disable','Restore')]
    [string]$Action = 'Install',
    [string]$AppDir = '',
    [string]$StateDir = '',
    [string]$CatalogPath = '',
    [switch]$Interactive,
    [switch]$Offline
)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = New-Object Text.UTF8Encoding($false)
Import-Module (Join-Path $PSScriptRoot 'FreebuffZhAssistant.psm1') -Force -DisableNameChecking

$exitCode = 0
function Test-StagedInstaller([string]$Root) {
    $arguments = @('-NoLogo','-NoProfile','-ExecutionPolicy','Bypass','-File',(Join-Path $Root 'FreebuffZhSetup.ps1'),'-Action','Check','-AppDir',$AppDir,'-StateDir',$StateDir)
    if ($CatalogPath) { $arguments += @('-CatalogPath',$CatalogPath) }
    if ($Offline) { $arguments += '-Offline' }
    $output = & powershell.exe @arguments 2>&1
    return [PSCustomObject]@{ Code=$LASTEXITCODE; Output=($output -join "`n") }
}
try {
    if (-not $StateDir) { $StateDir = Join-Path $env:LOCALAPPDATA 'FreebuffZhPatch' }
    $StateDir = [IO.Path]::GetFullPath($StateDir)
    [IO.Directory]::CreateDirectory($StateDir) | Out-Null
    $configPath = Join-Path $StateDir 'assistant-config.json'
    $statusPath = Join-Path $StateDir 'assistant-status.json'
    $config = if (Test-Path -LiteralPath $configPath) { Read-ZhJson $configPath } else { $null }
    if (-not $AppDir -and $null -ne $config) { $AppDir = [string](Get-ZhValue $config 'appDir' '') }
    Disable-ZhLegacyStartup $StateDir $config
    # Earlier installers can hand off using Watch. Only clean up their entry and exit.
    if ($Action -in @('Watch','Disable')) {
        Write-Host '登录自启已关闭。请通过“检查更新.cmd”手动更新。'
        exit 0
    }
    if ($Action -eq 'Status') {
        $status = if (Test-Path -LiteralPath $statusPath) { Read-ZhJson $statusPath } else { [PSCustomObject]@{ state='NotInstalled'; message='尚未安装汉化更新助手，请双击“安装.cmd”。'; appVersion='' } }
        Write-Host $status.message
        $installerVersion = [string](Get-ZhValue $config 'installerVersion' '未安装')
        $libraryVersion = [string](Get-ZhValue $status 'libraryVersion' '未知')
        Write-Host "安装器：$installerVersion；翻译库：$libraryVersion"
        Write-Host '更新方式：手动检查'
        Write-Host "状态记录：$statusPath"
        if ($Interactive) {
            $status.message += "`r`n安装器：$installerVersion；翻译库：$libraryVersion"
            Show-ZhNotice $status
        }
        exit 0
    }
    $AppDir = Resolve-ZhApp $AppDir -Interactive:$Interactive
    $sourceRoot = $PSScriptRoot
    if ($Action -eq 'Install') {
        $metadata = Test-ZhInstaller $sourceRoot
        $sourceRoot = Install-ZhCache $sourceRoot $StateDir 'installer' $metadata.version
        $bundledLibrary = Join-Path $PSScriptRoot 'library'
        if (Test-Path -LiteralPath (Join-Path $bundledLibrary 'library.json')) {
            $library = Test-ZhLibrary $bundledLibrary
            [void](Install-ZhCache $bundledLibrary $StateDir 'library' $library.version)
        }
        $bundledCatalog = Join-Path $PSScriptRoot 'compatibility.json'
        if (Test-Path -LiteralPath $bundledCatalog) {
            $catalog = Read-ZhJson $bundledCatalog; Test-ZhCatalog $catalog
            Write-ZhJson $catalog (Join-Path $StateDir 'catalog.bundled.json')
        }
        Save-ZhInstaller $sourceRoot $AppDir $StateDir
    }
    if ($Action -eq 'Restore') {
        $manifestPath = Join-Path $StateDir 'manifest.json'
        if (-not (Test-Path -LiteralPath $manifestPath)) { Write-Host '尚未安装汉化，无需还原。'; exit 0 }
        $manifest = Read-ZhJson $manifestPath
        if (-not (Get-ZhValue $manifest 'Installed' $false)) { Write-Host '已是英文界面，无需还原。'; exit 0 }
        $libraryRoot = Join-Path (Join-Path $StateDir 'libraries') $manifest.PatchVersion
        [void](Test-ZhLibrary $libraryRoot $manifest.PatchVersion)
        $lock = $null
        try {
            $lock = [IO.File]::Open((Join-Path $StateDir 'assistant-update.lock'), [IO.FileMode]::OpenOrCreate, [IO.FileAccess]::ReadWrite, [IO.FileShare]::None)
            Write-Host (Invoke-ZhEngine $sourceRoot $libraryRoot $AppDir $StateDir 'Restore' -CloseRunningApp)
            [void](Set-ZhStatus $StateDir 'Restored' '已还原英文界面。' (Get-ZhAppVersion $AppDir))
        } finally { if ($null -ne $lock) { $lock.Dispose() } }
        exit 0
    }
    $status = Invoke-ZhCheck $sourceRoot $AppDir $StateDir $CatalogPath -Offline:$Offline -CloseRunningApp:($Action -eq 'Install')
    Write-Host $status.message
    if (-not (Get-ZhValue $status 'catalogFresh' $false) -and $status.state -in @('Applied','Current','Pending')) {
        Write-Host '此次使用已校验的本地翻译库。可手动再次检查 GitHub 更新。'
    }
    if ($status.state -eq 'InstallerUpdate') {
        $probe = Test-StagedInstaller $status.InstallerRoot
        Write-Host $probe.Output
        $exitCode = $probe.Code
        if ($probe.Code -in @(0,3)) {
            Save-ZhInstaller $status.InstallerRoot $AppDir $StateDir
        } else {
            Write-Host '新版安装器检查未完成，已保留原安装器和现有汉化。'
        }
    } elseif ($status.state -in @('Failed','NetworkError','Unsupported','Busy')) {
        $exitCode = if ($status.state -eq 'Unsupported') { 3 } elseif ($status.state -eq 'Busy') { 2 } else { 1 }
        if ($Interactive -and $status.state -ne 'Busy') { Show-ZhNotice $status }
    }
} catch {
    Write-Host ("操作未完成：" + $_.Exception.Message) -ForegroundColor Red
    $exitCode = 1
}
exit $exitCode
