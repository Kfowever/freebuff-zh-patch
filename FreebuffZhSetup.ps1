[CmdletBinding()]
param(
    [ValidateSet('Install','Check','Watch','Status','Enable','Disable','Restore')]
    [string]$Action = 'Install',
    [string]$AppDir = '',
    [string]$StateDir = '',
    [string]$CatalogPath = '',
    [switch]$Interactive,
    [switch]$Offline,
    [switch]$Once
)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = New-Object Text.UTF8Encoding($false)
Import-Module (Join-Path $PSScriptRoot 'FreebuffZhAssistant.psm1') -Force -DisableNameChecking

$icon = $null; $watchMutex = $null; $owned = $false; $handoffRoot = ''; $exitCode = 0
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
    if ($Action -eq 'Disable') {
        if ($null -eq $config) { Write-Host '自动更新尚未启用。'; exit 0 }
        Set-ZhStartup $config.installerRoot $config.appDir $StateDir $false
        Write-Host '自动更新已关闭，后台助手会在一分钟内退出。已安装的汉化和备份均保留。'
        exit 0
    }
    if ($Action -eq 'Status') {
        $status = if (Test-Path -LiteralPath $statusPath) { Read-ZhJson $statusPath } else { [PSCustomObject]@{ state='NotInstalled'; message='尚未安装汉化更新助手，请双击“一键汉化.cmd”。'; appVersion='' } }
        Write-Host $status.message
        $installerVersion = [string](Get-ZhValue $config 'installerVersion' '未安装')
        $libraryVersion = [string](Get-ZhValue $status 'libraryVersion' '未知')
        Write-Host "安装器：$installerVersion；翻译库：$libraryVersion"
        Write-Host ('自动更新：' + $(if (Get-ZhValue $config 'enabled' $false) { '已开启' } else { '已关闭' }))
        Write-Host "状态记录：$statusPath"
        if ($Interactive) {
            $status.message += "`r`n安装器：$installerVersion；翻译库：$libraryVersion"
            Show-ZhNotice $status
        }
        exit 0
    }
    $AppDir = Resolve-ZhApp $AppDir -Interactive:$Interactive
    $sourceRoot = $PSScriptRoot
    if ($Action -in @('Install','Enable')) {
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
        Set-ZhStartup $sourceRoot $AppDir $StateDir $true
    }
    if ($Action -eq 'Restore') {
        if ($null -ne $config) { Set-ZhStartup $config.installerRoot $AppDir $StateDir $false }
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
            [void](Set-ZhStatus $StateDir 'Restored' '已还原英文界面，并关闭自动更新。' (Get-ZhAppVersion $AppDir))
        } finally { if ($null -ne $lock) { $lock.Dispose() } }
        exit 0
    }
    if ($Action -eq 'Watch') {
        $digest = [Security.Cryptography.SHA256]::Create()
        try { $id = ([BitConverter]::ToString($digest.ComputeHash([Text.Encoding]::UTF8.GetBytes($StateDir.ToLowerInvariant())))).Replace('-','') }
        finally { $digest.Dispose() }
        $watchMutex = New-Object Threading.Mutex($false, ('Local\FreebuffZhAssistant-' + $id))
        try { $owned = $watchMutex.WaitOne(0) } catch [Threading.AbandonedMutexException] { $owned = $true }
        if (-not $owned) { exit 0 }
        $lastNotice = ''; $initial = $true
        while ($true) {
            if (-not (Test-Path -LiteralPath $configPath)) { break }
            $config = Read-ZhJson $configPath
            if (-not $config.enabled) { break }
            if ([IO.Path]::GetFullPath($config.installerRoot) -ine [IO.Path]::GetFullPath($sourceRoot)) { $handoffRoot = $config.installerRoot; break }
            $previous = if (Test-Path -LiteralPath $statusPath) { Read-ZhJson $statusPath } else { $null }
            $version = try { Get-ZhAppVersion $AppDir } catch { '' }
            $changed = $version -cne [string](Get-ZhValue $previous 'appVersion' '')
            $hours = if ((Get-ZhValue $previous 'state') -in @('NetworkError','Failed')) { 1.0 / 6 } else { 6 }
            $expired = $initial -or $null -eq $previous -or ([DateTime]::UtcNow - [DateTime]::Parse([string]$previous.checkedAt).ToUniversalTime()).TotalHours -ge $hours
            $retry = (Get-ZhValue $previous 'state') -eq 'AppChanged'
            $pending = (Get-ZhValue $previous 'state') -eq 'Pending' -and @(Get-Process -Name Freebuff -ErrorAction SilentlyContinue).Count -eq 0
            if ($changed -or $expired -or $pending -or $retry) {
                $initial = $false
                if (-not $version) { $status = Set-ZhStatus $StateDir 'AppMissing' '暂未找到 Freebuff；重新安装桌面版后会再次检查。' }
                else { $status = Invoke-ZhCheck $sourceRoot $AppDir $StateDir $CatalogPath -Offline:$Offline -PreferCache:($pending -and -not $changed -and -not $expired) }
                if ($status.state -eq 'InstallerUpdate') {
                    $probe = Test-StagedInstaller $status.InstallerRoot
                    if ($probe.Code -in @(0,3)) {
                        Set-ZhStartup $status.InstallerRoot $AppDir $StateDir $true
                        $handoffRoot = $status.InstallerRoot; break
                    }
                    $status = Set-ZhStatus $StateDir 'Failed' ('新版安装器检查未完成，保留原安装器和现有汉化。' + $probe.Output) $version
                }
                $notice = $status.state + '|' + $version + '|' + [string](Get-ZhValue $status 'libraryVersion' '')
                if ($notice -ne $lastNotice -and $status.state -in @('Pending','Applied','Unsupported','NetworkError','Failed')) {
                    try {
                        Add-Type -AssemblyName System.Windows.Forms
                        Add-Type -AssemblyName System.Drawing
                        if ($null -eq $icon) {
                            $icon = New-Object Windows.Forms.NotifyIcon
                            $icon.Icon = [Drawing.SystemIcons]::Information; $icon.Text = 'Freebuff 汉化更新助手'; $icon.Visible = $true
                            $icon.Add_BalloonTipClicked({ if (Test-Path -LiteralPath $statusPath) { Show-ZhNotice (Read-ZhJson $statusPath) } }.GetNewClosure())
                        }
                        $icon.ShowBalloonTip(8000, 'Freebuff 汉化更新', $status.message, [Windows.Forms.ToolTipIcon]::Info)
                        $lastNotice = $notice
                    } catch { } # Headless sessions retain the same status in the management entry.
                }
            }
            if ($Once) { break }
            for ($tick = 0; $tick -lt 120; $tick++) {
                if ($null -ne $icon) { [Windows.Forms.Application]::DoEvents() }
                Start-Sleep -Milliseconds 500
            }
        }
    } else {
        $status = Invoke-ZhCheck $sourceRoot $AppDir $StateDir $CatalogPath -Offline:$Offline -CloseRunningApp:($Action -eq 'Install')
        Write-Host $status.message
        if (-not (Get-ZhValue $status 'catalogFresh' $false) -and $status.state -in @('Applied','Current','Pending')) { Write-Host '此次使用已校验的本地兼容库；GitHub 联网检查将在后台重试。' }
        if ($status.state -eq 'InstallerUpdate') {
            $enabled = Get-ZhValue $config 'enabled' ($Action -in @('Install','Enable'))
            $probe = Test-StagedInstaller $status.InstallerRoot
            Write-Host $probe.Output
            $exitCode = $probe.Code
            if ($probe.Code -in @(0,3)) {
                if ($enabled) { Set-ZhStartup $status.InstallerRoot $AppDir $StateDir $true }
            } else {
                Write-Host '新版安装器检查未完成，已保留原安装器和现有汉化。'
            }
        } elseif ($status.state -in @('Failed','NetworkError','Unsupported','Busy')) {
            $exitCode = if ($status.state -eq 'Unsupported') { 3 } elseif ($status.state -eq 'Busy') { 2 } else { 1 }
            if ($Interactive -and $status.state -ne 'Busy') { Show-ZhNotice $status }
        }
        if ($Action -in @('Install','Enable') -and -not $Once) { Start-ZhWatcher $sourceRoot $StateDir $AppDir }
    }
} catch {
    Write-Host ("操作未完成：" + $_.Exception.Message) -ForegroundColor Red
    $exitCode = 1
} finally {
    if ($null -ne $icon) { $icon.Visible = $false; $icon.Dispose() }
    if ($owned) { $watchMutex.ReleaseMutex() }
    if ($null -ne $watchMutex) { $watchMutex.Dispose() }
}
if ($handoffRoot) { Start-ZhWatcher $handoffRoot $StateDir $AppDir }
exit $exitCode
