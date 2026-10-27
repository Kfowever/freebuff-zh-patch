[CmdletBinding()]
param(
    [ValidateSet('Install', 'Restore', 'Status')]
    [string]$Action = 'Install',

    [string]$AppDir = '',

    [string]$StateDir = '',

    [switch]$Force,

    [switch]$Interactive,

    [switch]$CloseRunningApp
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)

$PatchVersion = '0.9.0'
$TestedAppVersion = '0.0.192.0'
$PatchMarkerStart = '<!-- FREEBUFF_ZH_PATCH_START -->'
$PatchMarkerEnd = '<!-- FREEBUFF_ZH_PATCH_END -->'
$PatchAssetName = 'freebuff-zh-cn.js'
$StartupOriginalText = 'Starting Freebuff orchestrator…'
$StartupLocalizedText = 'Freebuff 编排器正在启动…'
$Utf8NoBom = New-Object System.Text.UTF8Encoding($false)

function Get-Sha256 {
    param([Parameter(Mandatory = $true)][string]$Path)
    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) { return $null }
    $stream = [IO.File]::OpenRead($Path)
    $algorithm = [Security.Cryptography.SHA256]::Create()
    try {
        $hash = $algorithm.ComputeHash($stream)
        return (($hash | ForEach-Object { $_.ToString('x2') }) -join '')
    } finally {
        $algorithm.Dispose()
        $stream.Dispose()
    }
}

function Get-AppVersion {
    param([Parameter(Mandatory = $true)][string]$ExePath)
    return [Diagnostics.FileVersionInfo]::GetVersionInfo($ExePath).ProductVersion
}

function Assert-FileHash {
    param([string]$Path, [string]$ExpectedHash, [string]$Description)
    if ([string]::IsNullOrWhiteSpace($Path) -or [string]::IsNullOrWhiteSpace($ExpectedHash) -or
        -not (Test-Path -LiteralPath $Path -PathType Leaf) -or
        (Get-Sha256 -Path $Path) -ne $ExpectedHash) {
        throw "$Description 缺失或已更改。未执行刷新；现有文件和备份均已保留。"
    }
}

function Restore-VerifiedFile {
    param(
        [string]$Source,
        [Parameter(Mandatory = $true)][string]$Destination,
        [string]$ExpectedHash,
        [bool]$OriginallyExisted = $true
    )
    try {
        if ($OriginallyExisted) {
            if ([string]::IsNullOrWhiteSpace($ExpectedHash)) { throw '缺少恢复副本的哈希值。' }
            if ((Get-Sha256 -Path $Destination) -ne $ExpectedHash) {
                if ([string]::IsNullOrWhiteSpace($Source) -or (Get-Sha256 -Path $Source) -ne $ExpectedHash) {
                    throw '恢复副本不存在或哈希值不符合预期。已停止操作以确保安全。'
                }
                Copy-Item -LiteralPath $Source -Destination $Destination -Force -ErrorAction Stop
            }
            if ((Get-Sha256 -Path $Destination) -ne $ExpectedHash) { throw '恢复副本哈希校验失败。已停止操作以确保安全。' }
        } else {
            if (Test-Path -LiteralPath $Destination -PathType Leaf) {
                Remove-Item -LiteralPath $Destination -Force -ErrorAction Stop
            }
            if (Test-Path -LiteralPath $Destination) { throw '无法移除刚安装的文件。请检查文件状态；恢复副本仍会保留。' }
        }
        return $true
    } catch {
        Write-Warning "恢复 $Destination 失败。恢复副本：$Source。原因：$($_.Exception.Message)"
        return $false
    }
}

function Get-MainAssetInfo {
    param(
        [Parameter(Mandatory = $true)][string]$IndexText,
        [Parameter(Mandatory = $true)][string]$UiDir
    )
    $match = [regex]::Match(
        $IndexText,
        '<script\b(?=[^>]*\btype="module")(?=[^>]*\bsrc="(?<prefix>\./|/)assets/(?<name>[A-Za-z0-9][A-Za-z0-9._-]*\.js)(?:\?[^"<>]*)?")[^>]*>'
    )
    if (-not $match.Success) {
        throw '在 index.html 中找不到 Freebuff 主界面脚本。应用结构可能已更改；已停止操作以避免修改错误文件。'
    }
    $name = $match.Groups['name'].Value
    $path = Join-Path (Join-Path $UiDir 'assets') $name
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) {
        throw "index.html 引用的主界面资源不存在：$path。已停止操作以确保安全。"
    }
    return [PSCustomObject]@{
        Name = $name
        PatchUrl = $match.Groups['prefix'].Value + 'assets/' + $PatchAssetName
        Path = $path
        Hash = Get-Sha256 -Path $path
    }
}

function Assert-FreebuffStopped {
    $processes = @(Get-Process -Name 'Freebuff' -ErrorAction SilentlyContinue)
    if ($CloseRunningApp -and $processes.Count -gt 0) {
        # Only request a normal close for the exact installation being patched.
        # Never kill a process, discard an app confirmation, or close another copy.
        foreach ($process in $processes) {
            if ([string]::IsNullOrWhiteSpace($process.Path) -or
                -not $process.Path.Equals($ExePath, [StringComparison]::OrdinalIgnoreCase)) {
                throw '另一个位置的 Freebuff 正在运行。请先手动退出，再重新双击安装。'
            }
        }
        Write-Host '正在请求 Freebuff 正常退出；如果应用弹出确认窗口，请先处理。'
        foreach ($process in $processes) {
            if ($process.MainWindowHandle -ne [IntPtr]::Zero) { [void]$process.CloseMainWindow() }
        }
        $deadline = [DateTime]::UtcNow.AddSeconds(20)
        do {
            $remaining = @(Get-Process -Name 'Freebuff' -ErrorAction SilentlyContinue)
            if ($remaining.Count -eq 0) { return }
            Start-Sleep -Milliseconds 250
        } while ([DateTime]::UtcNow -lt $deadline)
    }
    if ($processes.Count -gt 0) {
        throw 'Freebuff 正在运行。请完全退出 Freebuff 后重试补丁命令。'
    }
}

function Confirm-IncompatibleInstall {
    param(
        [Parameter(Mandatory = $true)][string]$DetectedVersion,
        [Parameter(Mandatory = $true)][string]$SupportedVersion
    )

    Write-Warning "当前 Freebuff 版本为 $DetectedVersion，与此补丁测试版本 $SupportedVersion 不同。"
    Write-Warning '强制安装可能造成兼容性问题、中文缺失/错位/乱码、界面行为异常，甚至启动失败。'
    Write-Warning '该确认只会跳过版本号限制，不会跳过文件、备份、哈希或回滚安全检查。'

    if ((-not [Environment]::UserInteractive) -or [Console]::IsInputRedirected) {
        Write-Warning '当前环境无法进行交互确认。未修改任何文件。'
        exit 3
    }

    try {
        $answer = Read-Host '如果理解风险并仍要安装，请仅输入 y'
    } catch {
        Write-Warning '无法读取交互确认。未修改任何文件。'
        exit 3
    }
    if (($null -eq $answer) -or ($answer.Trim() -notmatch '^[yY]$')) {
        Write-Warning '已取消强制安装。未修改任何文件。'
        exit 3
    }
}

function Remove-NewInstallArtifacts {
    param(
        [string]$BackupDir,
        [string]$BackupRoot,
        [string[]]$BackupFiles,
        [string]$HistoryPath,
        [string]$HistoryRoot
    )

    foreach ($file in @($BackupFiles)) {
        if (-not [string]::IsNullOrWhiteSpace($file)) {
            try {
                if (Test-Path -LiteralPath $file -PathType Leaf) {
                    Remove-Item -LiteralPath $file -Force -ErrorAction Stop
                }
            } catch {}
        }
    }

    if (-not [string]::IsNullOrWhiteSpace($BackupDir) -and -not [string]::IsNullOrWhiteSpace($BackupRoot)) {
        try {
            $resolvedBackupDir = [IO.Path]::GetFullPath($BackupDir)
            $resolvedBackupRoot = [IO.Path]::GetFullPath($BackupRoot)
            $backupParent = [IO.Path]::GetFullPath((Split-Path -Parent $resolvedBackupDir))
            if ($backupParent.Equals($resolvedBackupRoot, [StringComparison]::OrdinalIgnoreCase) -and (Test-Path -LiteralPath $resolvedBackupDir -PathType Container)) {
                Remove-Item -LiteralPath $resolvedBackupDir -Force -ErrorAction Stop
            }
        } catch {}
    }

    if (-not [string]::IsNullOrWhiteSpace($HistoryPath) -and -not [string]::IsNullOrWhiteSpace($HistoryRoot)) {
        try {
            $resolvedHistoryPath = [IO.Path]::GetFullPath($HistoryPath)
            $resolvedHistoryRoot = [IO.Path]::GetFullPath($HistoryRoot)
            $historyParent = [IO.Path]::GetFullPath((Split-Path -Parent $resolvedHistoryPath))
            if ($historyParent.Equals($resolvedHistoryRoot, [StringComparison]::OrdinalIgnoreCase) -and (Test-Path -LiteralPath $resolvedHistoryPath -PathType Leaf)) {
                Remove-Item -LiteralPath $resolvedHistoryPath -Force -ErrorAction Stop
            }
        } catch {}
    }
}

function Write-JsonFile {
    param(
        [Parameter(Mandatory = $true)]$Value,
        [Parameter(Mandatory = $true)][string]$Path
    )
    $json = $Value | ConvertTo-Json -Depth 8
    $parent = Split-Path -Parent $Path
    $temp = Join-Path $parent ('.freebuff-zh-manifest-' + [guid]::NewGuid().ToString('N') + '.tmp')
    try {
        [IO.File]::WriteAllText($temp, $json, $Utf8NoBom)
        Move-Item -LiteralPath $temp -Destination $Path -Force
    } finally {
        if (Test-Path -LiteralPath $temp -PathType Leaf) {
            Remove-Item -LiteralPath $temp -Force -ErrorAction SilentlyContinue
        }
    }
}

function Get-PropertyValue {
    param(
        $InputObject,
        [Parameter(Mandatory = $true)][string]$Name
    )
    if ($null -eq $InputObject) { return $null }
    $property = $InputObject.PSObject.Properties[$Name]
    if ($null -eq $property) { return $null }
    return $property.Value
}

function Find-BytePatternOffsets {
    param(
        [Parameter(Mandatory = $true)][byte[]]$Data,
        [Parameter(Mandatory = $true)][byte[]]$Pattern
    )
    if ($Pattern.Length -eq 0) { throw '字节匹配模式不能为空。' }
    $offsets = [Collections.Generic.List[int]]::new()
    $searchFrom = 0
    $lastStart = $Data.Length - $Pattern.Length
    while ($searchFrom -le $lastStart) {
        $candidate = [Array]::IndexOf($Data, [byte]$Pattern[0], $searchFrom)
        if (($candidate -lt 0) -or ($candidate -gt $lastStart)) { break }
        $matches = $true
        for ($i = 1; $i -lt $Pattern.Length; $i += 1) {
            if ($Data[$candidate + $i] -ne $Pattern[$i]) {
                $matches = $false
                break
            }
        }
        if ($matches) { $offsets.Add($candidate) }
        $searchFrom = $candidate + 1
    }
    return @($offsets)
}

function Get-StartupPatchInfo {
    param([Parameter(Mandatory = $true)][string]$Path)
    $sourceBytes = [Text.Encoding]::UTF8.GetBytes($StartupOriginalText)
    $targetBytes = [Text.Encoding]::UTF8.GetBytes($StartupLocalizedText)
    if ($sourceBytes.Length -ne $targetBytes.Length) {
        throw '启动界面译文的 UTF-8 字节长度必须与原文相同。已停止操作以避免损坏 app.asar。'
    }
    $data = [IO.File]::ReadAllBytes($Path)
    $sourceOffsets = @(Find-BytePatternOffsets -Data $data -Pattern $sourceBytes)
    $targetOffsets = @(Find-BytePatternOffsets -Data $data -Pattern $targetBytes)
    $state = if (($sourceOffsets.Count -eq 1) -and ($targetOffsets.Count -eq 0)) {
        'Unpatched'
    } elseif (($sourceOffsets.Count -eq 0) -and ($targetOffsets.Count -eq 1)) {
        'Patched'
    } else {
        'Unknown'
    }
    return [PSCustomObject]@{
        State = $state
        OriginalCount = $sourceOffsets.Count
        LocalizedCount = $targetOffsets.Count
    }
}

function New-PatchedStartupAsar {
    param(
        [Parameter(Mandatory = $true)][string]$Source,
        [Parameter(Mandatory = $true)][string]$Destination
    )
    $sourceBytes = [Text.Encoding]::UTF8.GetBytes($StartupOriginalText)
    $targetBytes = [Text.Encoding]::UTF8.GetBytes($StartupLocalizedText)
    if ($sourceBytes.Length -ne $targetBytes.Length) {
        throw '启动界面译文的 UTF-8 字节长度必须与原文相同。已停止操作以避免损坏 app.asar。'
    }
    $data = [IO.File]::ReadAllBytes($Source)
    $sourceOffsets = @(Find-BytePatternOffsets -Data $data -Pattern $sourceBytes)
    $targetOffsets = @(Find-BytePatternOffsets -Data $data -Pattern $targetBytes)
    if (($sourceOffsets.Count -ne 1) -or ($targetOffsets.Count -ne 0)) {
        throw "启动文本布局与预期不符（原文=$($sourceOffsets.Count)，译文=$($targetOffsets.Count)）。未修改 app.asar；请确认应用版本及译文后重试。"
    }
    [Array]::Copy($targetBytes, 0, $data, $sourceOffsets[0], $targetBytes.Length)
    [IO.File]::WriteAllBytes($Destination, $data)
    $verification = Get-StartupPatchInfo -Path $Destination
    if ($verification.State -ne 'Patched') {
        throw '临时 app.asar 的启动译文校验失败。原文件未替换；请检查补丁文件后重试。'
    }
}

function Find-FreebuffDirectory {
    $candidates = @()
    if (-not [string]::IsNullOrWhiteSpace($env:LOCALAPPDATA)) {
        $candidates += Join-Path $env:LOCALAPPDATA 'Programs\@codebufffreebuff-desktop'
    }
    foreach ($root in @('HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*',
                         'HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*',
                         'HKLM:\Software\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*')) {
        foreach ($entry in @(Get-ItemProperty -Path $root -ErrorAction SilentlyContinue)) {
            $name = [string](Get-PropertyValue -InputObject $entry -Name 'DisplayName')
            if ($name -notmatch '^Freebuff(?:\s|$)') { continue }
            $location = [string](Get-PropertyValue -InputObject $entry -Name 'InstallLocation')
            if (-not [string]::IsNullOrWhiteSpace($location)) { $candidates += $location }
            $icon = [string](Get-PropertyValue -InputObject $entry -Name 'DisplayIcon')
            if ($icon -match '^"?(?<exe>.+\\Freebuff\.exe)"?(?:,\d+)?$') {
                $candidates += Split-Path -Parent $Matches.exe
            }
        }
    }
    foreach ($candidate in ($candidates | Select-Object -Unique)) {
        if (Test-Path -LiteralPath (Join-Path $candidate 'Freebuff.exe') -PathType Leaf) { return $candidate }
    }
    if ($Interactive -and [Environment]::UserInteractive -and -not [Console]::IsInputRedirected) {
        Write-Host '未自动找到 Freebuff，请在弹出的窗口中选择安装目录里的 Freebuff.exe。'
        Add-Type -AssemblyName System.Windows.Forms
        $picker = New-Object Windows.Forms.OpenFileDialog
        try {
            $picker.Title = '选择已安装的 Freebuff.exe（请勿选择下载的安装包）'
            $picker.Filter = 'Freebuff 主程序 (Freebuff.exe)|Freebuff.exe'
            $picker.CheckFileExists = $true
            if ($picker.ShowDialog() -eq [Windows.Forms.DialogResult]::OK) {
                return Split-Path -Parent $picker.FileName
            }
        } finally { $picker.Dispose() }
    }
    throw '没有找到已安装的 Freebuff。请先安装 Freebuff 桌面版，再双击“一键汉化.cmd”；自定义位置可在弹出的窗口中选择。'
}

try {
if ([string]::IsNullOrWhiteSpace($AppDir)) { $AppDir = Find-FreebuffDirectory }

$AppDir = [IO.Path]::GetFullPath($AppDir)
$ExePath = Join-Path $AppDir 'Freebuff.exe'
$AppAsarPath = Join-Path $AppDir 'resources\app.asar'
$UiDir = Join-Path $AppDir 'resources\orchestrator\ui'
$IndexPath = Join-Path $UiDir 'index.html'
$AssetsDir = Join-Path $UiDir 'assets'
$InstalledPatchAsset = Join-Path $AssetsDir $PatchAssetName
$SourcePatchAsset = Join-Path $PSScriptRoot $PatchAssetName
if ([string]::IsNullOrWhiteSpace($StateDir)) {
    $StateRoot = Join-Path $env:LOCALAPPDATA 'FreebuffZhPatch'
} else {
    $StateRoot = [IO.Path]::GetFullPath($StateDir)
}
$ManifestPath = Join-Path $StateRoot 'manifest.json'

if (Test-Path -LiteralPath $ManifestPath -PathType Container) {
    throw "补丁清单路径指向目录而非文件：$ManifestPath。请检查路径后重试。"
}

if (-not (Test-Path -LiteralPath $ExePath -PathType Leaf)) {
    throw "找不到 Freebuff.exe：$ExePath。请检查安装目录后重试。"
}
if (-not (Test-Path -LiteralPath $IndexPath -PathType Leaf)) {
    throw "找不到 Freebuff 界面入口文件：$IndexPath。应用结构可能已更改，已停止操作以确保安全。"
}
if (-not (Test-Path -LiteralPath $AppAsarPath -PathType Leaf)) {
    throw "找不到 Freebuff Electron 归档文件：$AppAsarPath。请检查安装目录后重试。"
}

$CurrentVersion = Get-AppVersion -ExePath $ExePath
if ([string]::IsNullOrWhiteSpace([string]$CurrentVersion)) {
    throw '无法读取 Freebuff.exe 的 ProductVersion。由于无法确认兼容性，已阻止安装和还原；请检查应用文件后重试。'
}
$CurrentIndexText = [IO.File]::ReadAllText($IndexPath)
$HasMarker = $CurrentIndexText.Contains($PatchMarkerStart)
$MainAsset = Get-MainAssetInfo -IndexText $CurrentIndexText -UiDir $UiDir

$manifest = $null
if (Test-Path -LiteralPath $ManifestPath -PathType Leaf) {
    try {
        $manifest = Get-Content -LiteralPath $ManifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
    } catch {
        throw "补丁清单不是有效的 JSON 文件：$ManifestPath。请检查清单或从备份恢复后重试。"
    }
}

$PatchAssetPresent = Test-Path -LiteralPath $InstalledPatchAsset -PathType Leaf
$InstalledPatchHash = Get-Sha256 -Path $InstalledPatchAsset
$SourcePatchHash = Get-Sha256 -Path $SourcePatchAsset
$InjectedPatchVersionMatch = [regex]::Match($CurrentIndexText, 'data-freebuff-zh-patch="([^"]+)"')
$InjectedPatchVersion = if ($InjectedPatchVersionMatch.Success) { $InjectedPatchVersionMatch.Groups[1].Value } else { $null }
$ManifestInstalled = [bool](Get-PropertyValue -InputObject $manifest -Name 'Installed')
$ManifestAppVersion = Get-PropertyValue -InputObject $manifest -Name 'AppVersion'
$ManifestPatchVersion = Get-PropertyValue -InputObject $manifest -Name 'PatchVersion'
$ManifestBackupDir = Get-PropertyValue -InputObject $manifest -Name 'BackupDir'
$ManifestStartupPatchEnabled = [bool](Get-PropertyValue -InputObject $manifest -Name 'StartupPatchEnabled')
$ManifestMainAssetName = Get-PropertyValue -InputObject $manifest -Name 'MainAssetName'
$ManifestMainAssetHash = Get-PropertyValue -InputObject $manifest -Name 'MainAssetHash'
$ManifestPatchedIndexHash = Get-PropertyValue -InputObject $manifest -Name 'PatchedIndexHash'
$ManifestPatchedAssetHash = Get-PropertyValue -InputObject $manifest -Name 'PatchedAssetHash'
$ManifestPatchedAppAsarHash = Get-PropertyValue -InputObject $manifest -Name 'PatchedAppAsarHash'
$CurrentIndexHash = Get-Sha256 -Path $IndexPath
$CurrentAppAsarHash = Get-Sha256 -Path $AppAsarPath
$StartupPatchInfo = Get-StartupPatchInfo -Path $AppAsarPath
$VersionCompatible = $CurrentVersion -eq $TestedAppVersion

if ($HasMarker -and $PatchAssetPresent) {
    if ($null -eq $manifest -or -not $ManifestInstalled) {
        $PatchState = 'UnmanagedInstallation'
    } elseif ($ManifestAppVersion -ne $CurrentVersion) {
        $PatchState = 'InstalledForOtherVersion'
    } elseif (
        ($ManifestPatchVersion -eq $PatchVersion) -and
        ($InjectedPatchVersion -eq $PatchVersion) -and
        ($InstalledPatchHash -eq $SourcePatchHash) -and
        ($InstalledPatchHash -eq $ManifestPatchedAssetHash) -and
        ($CurrentIndexHash -eq $ManifestPatchedIndexHash) -and
        ($MainAsset.Name -eq $ManifestMainAssetName) -and
        ($MainAsset.Hash -eq $ManifestMainAssetHash) -and
        $ManifestStartupPatchEnabled -and
        ($StartupPatchInfo.State -eq 'Patched') -and
        ($CurrentAppAsarHash -eq $ManifestPatchedAppAsarHash)
    ) {
        $PatchState = 'InstalledCurrent'
    } else {
        $PatchState = 'InstalledNeedsRefresh'
    }
} elseif ($HasMarker -or $PatchAssetPresent) {
    $PatchState = 'PartialInstallation'
} elseif ($ManifestInstalled) {
    if (
        (-not [string]::IsNullOrWhiteSpace([string]$ManifestAppVersion)) -and
        ($ManifestAppVersion -ne $CurrentVersion) -and
        (-not [string]::IsNullOrWhiteSpace([string]$ManifestBackupDir)) -and
        (Test-Path -LiteralPath $ManifestBackupDir -PathType Container) -and
        ($StartupPatchInfo.State -eq 'Unpatched')
    ) {
        $PatchState = 'UpdatedAppNeedsInstall'
    } else {
        $PatchState = 'StaleManifest'
    }
} else {
    $PatchState = 'NotInstalled'
}

if ($Action -eq 'Status') {
    [PSCustomObject]@{
        AppDir = $AppDir
        AppVersion = $CurrentVersion
        TestedAppVersion = $TestedAppVersion
        VersionCompatible = $VersionCompatible
        PatchVersion = $PatchVersion
        PatchState = $PatchState
        MainAsset = $MainAsset.Name
        MainAssetHash = $MainAsset.Hash
        CurrentIndexHash = $CurrentIndexHash
        ManifestPatchedIndexHash = $ManifestPatchedIndexHash
        PatchInstalled = ($HasMarker -and $PatchAssetPresent -and $ManifestInstalled)
        PatchMarkerPresent = $HasMarker
        PatchAssetPresent = $PatchAssetPresent
        InjectedPatchVersion = $InjectedPatchVersion
        InstalledPatchHash = $InstalledPatchHash
        SourcePatchHash = $SourcePatchHash
        ManifestPatchedAssetHash = $ManifestPatchedAssetHash
        StartupPatchState = $StartupPatchInfo.State
        StartupOriginalCount = $StartupPatchInfo.OriginalCount
        StartupLocalizedCount = $StartupPatchInfo.LocalizedCount
        CurrentAppAsarHash = $CurrentAppAsarHash
        ManifestPatchedAppAsarHash = $ManifestPatchedAppAsarHash
        ManifestPath = $ManifestPath
        Manifest = $manifest
    } | Format-List
    exit 0
}

Write-Host "检测到的 Freebuff 版本：$CurrentVersion"
Write-Host "补丁支持的 Freebuff 版本：$TestedAppVersion"
$stateNames = @{
    NotInstalled = '尚未安装'; InstalledCurrent = '已是最新版'; InstalledNeedsRefresh = '需要更新译文'
    UpdatedAppNeedsInstall = 'Freebuff 已更新，需要重新汉化'; StaleManifest = '安装记录与文件不一致'
    PartialInstallation = '补丁文件不完整'; UnmanagedInstallation = '缺少可信安装记录'
    InstalledForOtherVersion = '检测到其他版本的旧补丁'
}
Write-Host "汉化状态：$($stateNames[$PatchState])"

if (($Action -eq 'Install') -and ($PatchState -eq 'InstalledCurrent')) {
    Write-Host "Freebuff 中文补丁 $PatchVersion 已安装。未进行任何更改。"
    exit 0
}

if (($Action -eq 'Install') -and ($PatchState -eq 'StaleManifest')) {
    throw '清单显示补丁已安装，但当前文件不符合可识别的更新后状态。已停止安装以保留备份链；请检查应用文件和备份后重试。'
}

if (($Action -eq 'Install') -and (($PatchState -eq 'PartialInstallation') -or ($PatchState -eq 'UnmanagedInstallation') -or ($PatchState -eq 'InstalledForOtherVersion'))) {
    throw "检测到补丁状态不完整、未经管理或跨版本：$PatchState。已停止安装以保护现有文件和备份；请先检查或还原后重试。"
}

Assert-FreebuffStopped

if ($Action -eq 'Restore') {
    if ($PatchState -eq 'NotInstalled') {
        Write-Host 'Freebuff 中文补丁尚未安装。未进行任何更改。'
        exit 0
    }
    if (-not (Test-Path -LiteralPath $ManifestPath -PathType Leaf)) {
        throw "找不到补丁清单，无法安全还原：$ManifestPath。请先检查安装目录和备份。"
    }
    if (-not $manifest.Installed) {
        throw '检测到补丁文件，但清单显示补丁未安装。已停止还原，避免删除未受管理的文件；请检查文件和备份后重试。'
    }
    if ($CurrentVersion -ne $manifest.AppVersion) {
        throw "Freebuff 已从版本 $($manifest.AppVersion) 更新为 $CurrentVersion。已停止还原，避免覆盖较新的应用文件；请使用对应版本的还原方式。"
    }
    $currentIndexHash = Get-Sha256 -Path $IndexPath
    if ($currentIndexHash -ne $manifest.PatchedIndexHash) {
        throw '补丁安装后 index.html 已更改。已停止还原以保护当前文件；请检查文件或从备份恢复后重试。'
    }
    if (-not (Test-Path -LiteralPath $manifest.BackupIndexPath -PathType Leaf)) {
        throw "找不到原始 index.html 备份：$($manifest.BackupIndexPath)。已停止还原；请检查备份目录后重试。"
    }
    if ((Get-Sha256 -Path $manifest.BackupIndexPath) -ne $manifest.OriginalIndexHash) {
        throw 'index.html 备份的哈希值与安装清单不符。已停止还原以避免使用错误备份；请检查备份后重试。'
    }

    $restoreStartupPatch = [bool](Get-PropertyValue -InputObject $manifest -Name 'StartupPatchEnabled')
    $backupAppAsarPath = Get-PropertyValue -InputObject $manifest -Name 'BackupAppAsarPath'
    $originalAppAsarHash = Get-PropertyValue -InputObject $manifest -Name 'OriginalAppAsarHash'
    $patchedAppAsarHash = Get-PropertyValue -InputObject $manifest -Name 'PatchedAppAsarHash'
    if ($restoreStartupPatch) {
        if ($CurrentAppAsarHash -ne $patchedAppAsarHash) {
            throw '安装启动译文后 app.asar 已更改。已停止还原以保护当前文件；请检查文件或备份后重试。'
        }
        if ([string]::IsNullOrWhiteSpace([string]$backupAppAsarPath) -or -not (Test-Path -LiteralPath $backupAppAsarPath -PathType Leaf)) {
            throw "找不到原始 app.asar 备份：$backupAppAsarPath。已停止还原；请检查备份目录后重试。"
        }
        if ((Get-Sha256 -Path $backupAppAsarPath) -ne $originalAppAsarHash) {
            throw 'app.asar 备份的哈希值与安装清单不符。已停止还原以避免使用错误备份；请检查备份后重试。'
        }
    }

    $restoreOriginalAsset = [bool](Get-PropertyValue -InputObject $manifest -Name 'OriginalPatchAssetExisted')
    $restoreAssetBackup = Get-PropertyValue -InputObject $manifest -Name 'BackupPatchAssetPath'
    if ($restoreOriginalAsset -and ([string]::IsNullOrWhiteSpace([string]$restoreAssetBackup) -or -not (Test-Path -LiteralPath $restoreAssetBackup -PathType Leaf))) {
        throw "找不到同名资源的原始备份：$restoreAssetBackup。已停止还原；请检查备份目录后重试。"
    }

    $restoreTemp = Join-Path $UiDir ('.freebuff-zh-restore-' + [guid]::NewGuid().ToString('N') + '.tmp')
    $restoreAsarTemp = Join-Path (Split-Path -Parent $AppAsarPath) ('.freebuff-zh-asar-restore-' + [guid]::NewGuid().ToString('N') + '.tmp')
    $restoreRollbackIndex = Join-Path $UiDir ('.freebuff-zh-index-rollback-' + [guid]::NewGuid().ToString('N') + '.tmp')
    $restoreRollbackAsar = Join-Path (Split-Path -Parent $AppAsarPath) ('.freebuff-zh-asar-rollback-' + [guid]::NewGuid().ToString('N') + '.tmp')
    $restoreRollbackAsset = Join-Path $AssetsDir ('.freebuff-zh-asset-rollback-' + [guid]::NewGuid().ToString('N') + '.tmp')
    $restorePatchedAssetExisted = Test-Path -LiteralPath $InstalledPatchAsset -PathType Leaf
    $restoreRollbackSucceeded = $true
    try {
        Copy-Item -LiteralPath $IndexPath -Destination $restoreRollbackIndex -Force
        if ($restoreStartupPatch) {
            Copy-Item -LiteralPath $AppAsarPath -Destination $restoreRollbackAsar -Force
        }
        if ($restorePatchedAssetExisted) {
            Copy-Item -LiteralPath $InstalledPatchAsset -Destination $restoreRollbackAsset -Force
        }
        Copy-Item -LiteralPath $manifest.BackupIndexPath -Destination $restoreTemp -Force
        Move-Item -LiteralPath $restoreTemp -Destination $IndexPath -Force
        if ($restoreStartupPatch) {
            Copy-Item -LiteralPath $backupAppAsarPath -Destination $restoreAsarTemp -Force
            Move-Item -LiteralPath $restoreAsarTemp -Destination $AppAsarPath -Force
        }
        if ($restoreOriginalAsset) {
            Copy-Item -LiteralPath $restoreAssetBackup -Destination $InstalledPatchAsset -Force
        } elseif (Test-Path -LiteralPath $InstalledPatchAsset -PathType Leaf) {
            Remove-Item -LiteralPath $InstalledPatchAsset -Force
        }

        $manifest.Installed = $false
        $manifest | Add-Member -NotePropertyName 'RestoredAt' -NotePropertyValue ((Get-Date).ToString('o')) -Force
        $manifest | Add-Member -NotePropertyName 'RestoredIndexHash' -NotePropertyValue (Get-Sha256 -Path $IndexPath) -Force
        if ($restoreStartupPatch) {
            $manifest | Add-Member -NotePropertyName 'RestoredAppAsarHash' -NotePropertyValue (Get-Sha256 -Path $AppAsarPath) -Force
        }
        Write-JsonFile -Value $manifest -Path $ManifestPath
        Write-Host "Freebuff 中文补丁已还原。原始备份仍保存在：$($manifest.BackupDir)"
    } catch {
        $failureMessage = $_.Exception.Message
        if (-not (Restore-VerifiedFile -Source $restoreRollbackIndex -Destination $IndexPath -ExpectedHash $CurrentIndexHash)) {
            $restoreRollbackSucceeded = $false
        }
        if ($restoreStartupPatch) {
            if (-not (Restore-VerifiedFile -Source $restoreRollbackAsar -Destination $AppAsarPath -ExpectedHash $CurrentAppAsarHash)) {
                $restoreRollbackSucceeded = $false
            }
        }
        if (-not (Restore-VerifiedFile -Source $restoreRollbackAsset -Destination $InstalledPatchAsset -ExpectedHash $InstalledPatchHash -OriginallyExisted $restorePatchedAssetExisted)) {
            $restoreRollbackSucceeded = $false
        }
        throw "中文补丁还原失败。回滚校验结果：$restoreRollbackSucceeded。如回滚未完成，恢复副本仍保留在应用文件旁。原因：$failureMessage。请检查恢复副本后重试。"
    } finally {
        $restoreCleanupPaths = @($restoreTemp, $restoreAsarTemp)
        if ($restoreRollbackSucceeded) { $restoreCleanupPaths += @($restoreRollbackIndex, $restoreRollbackAsar, $restoreRollbackAsset) }
        foreach ($temporaryPath in $restoreCleanupPaths) {
            if (Test-Path -LiteralPath $temporaryPath -PathType Leaf) {
                Remove-Item -LiteralPath $temporaryPath -Force -ErrorAction SilentlyContinue
            }
        }
    }
    exit 0
}

if (-not (Test-Path -LiteralPath $SourcePatchAsset -PathType Leaf)) {
    throw "找不到中文本地化资源：$SourcePatchAsset。请确认补丁文件完整后重试。"
}

$moduleMatch = $null
if (-not $HasMarker) {
    if ($StartupPatchInfo.State -ne 'Unpatched') {
        throw "app.asar 文本状态为 $($StartupPatchInfo.State)，无法安全安装启动译文。已停止操作以保护原文件；请确认应用版本和文件状态后重试。"
    }
    $moduleMatch = [regex]::Match($CurrentIndexText, '(?m)^\s*<script type="module"')
    if (-not $moduleMatch.Success) {
        throw '找不到 Freebuff 主模块的 script 标签。安装目录未修改；应用结构可能已更改，请确认兼容版本后重试。'
    }
}

if (-not $VersionCompatible) {
    if ($Force) {
        Write-Host '检测到旧版 -Force 参数；仍需在交互提示中输入 y/Y 确认。'
    }
    Confirm-IncompatibleInstall -DetectedVersion $CurrentVersion -SupportedVersion $TestedAppVersion
    Assert-FreebuffStopped
    Write-Warning "已确认，将继续在 Freebuff $CurrentVersion 上安装。"
}

if ($HasMarker) {
    if (-not (Test-Path -LiteralPath $ManifestPath -PathType Leaf)) {
        throw '检测到本地化标记，但缺少补丁清单。请先检查安装目录或从备份还原，再重试。'
    }
    $manifest = Get-Content -LiteralPath $ManifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
    if ($manifest.AppVersion -ne $CurrentVersion) {
        throw '本地化标记属于其他 Freebuff 版本。已停止刷新以保护现有备份链；请安装匹配版本的补丁后重试。'
    }
    if ($null -eq $InjectedPatchVersion) {
        throw '检测到本地化标记，但找不到其中记录的补丁版本。已停止安装；请检查文件和备份后重试。'
    }
    # A new patch asset is allowed; drift in already installed files is not.
    Assert-FileHash -Path $IndexPath -ExpectedHash $manifest.PatchedIndexHash -Description '已安装的 index.html'
    Assert-FileHash -Path $InstalledPatchAsset -ExpectedHash $manifest.PatchedAssetHash -Description '已安装的译文资源'
    if ($MainAsset.Name -ne $manifest.MainAssetName) { throw '主界面资源文件名已更改。已停止刷新以避免修改错误文件；请检查应用版本后重试。' }
    Assert-FileHash -Path $MainAsset.Path -ExpectedHash $manifest.MainAssetHash -Description '主界面资源文件'
    Assert-FileHash -Path $manifest.BackupIndexPath -ExpectedHash $manifest.OriginalIndexHash -Description '原始 index.html 备份'
    if ($ManifestStartupPatchEnabled) {
        Assert-FileHash -Path $AppAsarPath -ExpectedHash $ManifestPatchedAppAsarHash -Description '已安装的 app.asar'
    } elseif (-not [string]::IsNullOrWhiteSpace([string](Get-PropertyValue -InputObject $manifest -Name 'OriginalAppAsarHash'))) {
        Assert-FileHash -Path $AppAsarPath -ExpectedHash $manifest.OriginalAppAsarHash -Description '未打补丁的 app.asar'
    }
    $manifestBackupDir = Get-PropertyValue -InputObject $manifest -Name 'BackupDir'
    if ([string]::IsNullOrWhiteSpace([string]$manifestBackupDir) -or -not (Test-Path -LiteralPath $manifestBackupDir -PathType Container)) {
        throw "现有备份目录不存在：$manifestBackupDir。已停止刷新以保护备份链；请检查目录后重试。"
    }
    $backupAppAsarPath = Get-PropertyValue -InputObject $manifest -Name 'BackupAppAsarPath'
    $originalAppAsarHash = Get-PropertyValue -InputObject $manifest -Name 'OriginalAppAsarHash'
    if ([string]::IsNullOrWhiteSpace([string]$backupAppAsarPath)) {
        if ($StartupPatchInfo.State -ne 'Unpatched') {
            throw "启动文本状态为 $($StartupPatchInfo.State)，无法安全创建原始 app.asar 备份。已停止操作以保护文件；请确认版本并重试。"
        }
        $backupAppAsarPath = Join-Path $manifestBackupDir 'app.asar'
        Copy-Item -LiteralPath $AppAsarPath -Destination $backupAppAsarPath -Force
        $originalAppAsarHash = Get-Sha256 -Path $backupAppAsarPath
    } else {
        if (-not (Test-Path -LiteralPath $backupAppAsarPath -PathType Leaf)) {
            throw "找不到原始 app.asar 备份：$backupAppAsarPath。已停止还原；请检查备份目录后重试。"
        }
        if ((Get-Sha256 -Path $backupAppAsarPath) -ne $originalAppAsarHash) {
            throw 'app.asar 备份的哈希值与安装清单不符。已停止刷新以保护备份；请检查备份后重试。'
        }
    }
    if (($StartupPatchInfo.State -ne 'Unpatched') -and ($StartupPatchInfo.State -ne 'Patched')) {
        throw "无法识别启动文本布局（原文=$($StartupPatchInfo.OriginalCount)，译文=$($StartupPatchInfo.LocalizedCount)）。已停止安装；请确认应用版本和译文后重试。"
    }
    $assetTemp = Join-Path $AssetsDir ('.freebuff-zh-asset-' + [guid]::NewGuid().ToString('N') + '.tmp')
    $indexTemp = Join-Path $UiDir ('.freebuff-zh-index-' + [guid]::NewGuid().ToString('N') + '.tmp')
    $asarTemp = Join-Path (Split-Path -Parent $AppAsarPath) ('.freebuff-zh-asar-' + [guid]::NewGuid().ToString('N') + '.tmp')
    $rollbackIndex = Join-Path $UiDir ('.freebuff-zh-index-rollback-' + [guid]::NewGuid().ToString('N') + '.tmp')
    $rollbackAsset = Join-Path $AssetsDir ('.freebuff-zh-asset-rollback-' + [guid]::NewGuid().ToString('N') + '.tmp')
    $rollbackAsar = Join-Path (Split-Path -Parent $AppAsarPath) ('.freebuff-zh-asar-rollback-' + [guid]::NewGuid().ToString('N') + '.tmp')
    $refreshRollbackSucceeded = $true
    try {
        Copy-Item -LiteralPath $IndexPath -Destination $rollbackIndex -Force
        Copy-Item -LiteralPath $InstalledPatchAsset -Destination $rollbackAsset -Force
        Copy-Item -LiteralPath $AppAsarPath -Destination $rollbackAsar -Force
        $versionRegex = [regex]'data-freebuff-zh-patch="[^"]+"'
        $refreshedIndexText = $versionRegex.Replace($CurrentIndexText, "data-freebuff-zh-patch=`"$PatchVersion`"", 1)
        Copy-Item -LiteralPath $SourcePatchAsset -Destination $assetTemp -Force
        [IO.File]::WriteAllText($indexTemp, $refreshedIndexText, $Utf8NoBom)
        if ($StartupPatchInfo.State -eq 'Unpatched') {
            New-PatchedStartupAsar -Source $AppAsarPath -Destination $asarTemp
        }
        Move-Item -LiteralPath $assetTemp -Destination $InstalledPatchAsset -Force
        Move-Item -LiteralPath $indexTemp -Destination $IndexPath -Force
        if (Test-Path -LiteralPath $asarTemp -PathType Leaf) {
            Move-Item -LiteralPath $asarTemp -Destination $AppAsarPath -Force
        }
        $installedStartupInfo = Get-StartupPatchInfo -Path $AppAsarPath
        if ($installedStartupInfo.State -ne 'Patched') {
            throw '刷新后未检测到启动译文。已停止操作；请检查安装结果或从备份还原后重试。'
        }
        $manifest.PatchVersion = $PatchVersion
        $manifest.MainAssetName = $MainAsset.Name
        $manifest.MainAssetHash = $MainAsset.Hash
        $manifest.PatchedIndexHash = Get-Sha256 -Path $IndexPath
        $manifest.PatchedAssetHash = Get-Sha256 -Path $InstalledPatchAsset
        $manifest | Add-Member -NotePropertyName 'PatchAssetName' -NotePropertyValue $PatchAssetName -Force
        $manifest | Add-Member -NotePropertyName 'StartupPatchEnabled' -NotePropertyValue $true -Force
        $manifest | Add-Member -NotePropertyName 'BackupAppAsarPath' -NotePropertyValue $backupAppAsarPath -Force
        $manifest | Add-Member -NotePropertyName 'OriginalAppAsarHash' -NotePropertyValue $originalAppAsarHash -Force
        $manifest | Add-Member -NotePropertyName 'PatchedAppAsarHash' -NotePropertyValue (Get-Sha256 -Path $AppAsarPath) -Force
        $manifest | Add-Member -NotePropertyName 'RefreshedAt' -NotePropertyValue ((Get-Date).ToString('o')) -Force
        $manifest.Installed = $true
        Write-JsonFile -Value $manifest -Path $ManifestPath
        Write-Host "Freebuff 中文本地化已刷新至补丁版本 $PatchVersion。"
    } catch {
        $failureMessage = $_.Exception.Message
        if (-not (Restore-VerifiedFile -Source $rollbackIndex -Destination $IndexPath -ExpectedHash $CurrentIndexHash)) { $refreshRollbackSucceeded = $false }
        if (-not (Restore-VerifiedFile -Source $rollbackAsset -Destination $InstalledPatchAsset -ExpectedHash $InstalledPatchHash)) { $refreshRollbackSucceeded = $false }
        if (-not (Restore-VerifiedFile -Source $rollbackAsar -Destination $AppAsarPath -ExpectedHash $CurrentAppAsarHash)) { $refreshRollbackSucceeded = $false }
        throw "中文补丁刷新失败。回滚校验结果：$refreshRollbackSucceeded。如回滚未完成，恢复副本仍保留在应用文件旁。原因：$failureMessage。请检查恢复副本后重试。"
    } finally {
        if (Test-Path -LiteralPath $assetTemp -PathType Leaf) {
            Remove-Item -LiteralPath $assetTemp -Force -ErrorAction SilentlyContinue
        }
        if (Test-Path -LiteralPath $indexTemp -PathType Leaf) {
            Remove-Item -LiteralPath $indexTemp -Force -ErrorAction SilentlyContinue
        }
        $refreshCleanupPaths = @($asarTemp)
        if ($refreshRollbackSucceeded) { $refreshCleanupPaths += @($rollbackIndex, $rollbackAsset, $rollbackAsar) }
        foreach ($temporaryPath in $refreshCleanupPaths) {
            if (Test-Path -LiteralPath $temporaryPath -PathType Leaf) {
                Remove-Item -LiteralPath $temporaryPath -Force -ErrorAction SilentlyContinue
            }
        }
    }
    exit 0
}

$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$PreviousManifestPath = $null
$PreviousBackupDir = $null
$PreviousAppVersion = $null
$PreviousPatchVersion = $null
$historyDir = $null

if ($PatchState -eq 'UpdatedAppNeedsInstall') {
    $PreviousBackupDir = $ManifestBackupDir
    if ([string]::IsNullOrWhiteSpace([string]$PreviousBackupDir) -or -not (Test-Path -LiteralPath $PreviousBackupDir -PathType Container)) {
        throw "找不到旧补丁备份目录，无法在迁移时安全保留备份记录：$PreviousBackupDir。已停止迁移；请检查备份目录后重试。"
    }
    $PreviousAppVersion = $ManifestAppVersion
    $PreviousPatchVersion = $ManifestPatchVersion
    $historyDir = Join-Path $StateRoot 'history'
    New-Item -ItemType Directory -Force -Path $historyDir | Out-Null
    $historyId = [guid]::NewGuid().ToString('N').Substring(0, 8)
    $historyVersion = ([string]$PreviousAppVersion) -replace '[^0-9A-Za-z._-]', '_'
    $PreviousManifestPath = Join-Path $historyDir "manifest-$historyVersion-$timestamp-$historyId.json"
    try {
        Copy-Item -LiteralPath $ManifestPath -Destination $PreviousManifestPath -ErrorAction Stop
    } catch {
        try {
            if (Test-Path -LiteralPath $PreviousManifestPath -PathType Leaf) {
                Remove-Item -LiteralPath $PreviousManifestPath -Force -ErrorAction Stop
            }
        } catch {}
        throw
    }
} else {
    New-Item -ItemType Directory -Force -Path $StateRoot | Out-Null
}

$safeVersion = $CurrentVersion -replace '[^0-9A-Za-z._-]', '_'
$BackupRoot = Join-Path $StateRoot 'backups'
$BackupDir = Join-Path $BackupRoot "$safeVersion-$timestamp"
$BackupIndexPath = Join-Path $BackupDir 'index.html'
$BackupPatchAssetPath = Join-Path $BackupDir $PatchAssetName
$BackupAppAsarPath = Join-Path $BackupDir 'app.asar'
$OriginalPatchAssetExisted = Test-Path -LiteralPath $InstalledPatchAsset -PathType Leaf
$OriginalIndexHash = Get-Sha256 -Path $IndexPath
$OriginalAppAsarHash = Get-Sha256 -Path $AppAsarPath
$OriginalPatchAssetHash = Get-Sha256 -Path $InstalledPatchAsset

try {
    New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null
    Copy-Item -LiteralPath $IndexPath -Destination $BackupIndexPath -Force
    Copy-Item -LiteralPath $AppAsarPath -Destination $BackupAppAsarPath -Force
    if ($OriginalPatchAssetExisted) {
        Copy-Item -LiteralPath $InstalledPatchAsset -Destination $BackupPatchAssetPath -Force
    }
    if ((Get-Sha256 -Path $BackupIndexPath) -ne $OriginalIndexHash) {
        throw 'index.html 备份哈希校验失败。已停止安装以确保安全，请检查磁盘或备份后重试。'
    }
    if ((Get-Sha256 -Path $BackupAppAsarPath) -ne $OriginalAppAsarHash) {
        throw 'app.asar 备份哈希校验失败。已停止安装以确保安全，请检查磁盘或备份后重试。'
    }
    if ($OriginalPatchAssetExisted -and ((Get-Sha256 -Path $BackupPatchAssetPath) -ne (Get-Sha256 -Path $InstalledPatchAsset))) {
        throw '同名补丁资源备份哈希校验失败。已停止安装以确保安全，请检查磁盘或备份后重试。'
    }
} catch {
    $failureMessage = $_.Exception.Message
    Remove-NewInstallArtifacts -BackupDir $BackupDir -BackupRoot $BackupRoot -BackupFiles @($BackupIndexPath, $BackupPatchAssetPath, $BackupAppAsarPath) -HistoryPath $PreviousManifestPath -HistoryRoot $historyDir
    throw "备份准备失败，应用尚未修改。原因：$failureMessage。请检查磁盘空间、权限和备份路径后重试。"
}

$injection = @"
    $PatchMarkerStart
    <script src="$($MainAsset.PatchUrl)" data-freebuff-zh-patch="$PatchVersion"></script>
    $PatchMarkerEnd
"@

$patchedIndexText = $CurrentIndexText.Insert($moduleMatch.Index, $injection + [Environment]::NewLine)
$patchedIndexText = [regex]::Replace($patchedIndexText, '<html\s+lang="en">', '<html lang="zh-CN">', 1)
$tempIndex = Join-Path $UiDir ('.freebuff-zh-index-' + [guid]::NewGuid().ToString('N') + '.tmp')
$tempAsset = Join-Path $AssetsDir ('.freebuff-zh-asset-' + [guid]::NewGuid().ToString('N') + '.tmp')
$tempAsar = Join-Path (Split-Path -Parent $AppAsarPath) ('.freebuff-zh-asar-' + [guid]::NewGuid().ToString('N') + '.tmp')

try {
    [IO.File]::WriteAllText($tempIndex, $patchedIndexText, $Utf8NoBom)
    Copy-Item -LiteralPath $SourcePatchAsset -Destination $tempAsset -Force
    New-PatchedStartupAsar -Source $AppAsarPath -Destination $tempAsar
    Move-Item -LiteralPath $tempAsset -Destination $InstalledPatchAsset -Force
    Move-Item -LiteralPath $tempIndex -Destination $IndexPath -Force
    Move-Item -LiteralPath $tempAsar -Destination $AppAsarPath -Force

    $installedIndexText = [IO.File]::ReadAllText($IndexPath)
    if (-not $installedIndexText.Contains($PatchMarkerStart)) {
        throw '安装后未检测到补丁标记。已停止操作；请检查安装结果或从备份还原后重试。'
    }
    if (-not (Test-Path -LiteralPath $InstalledPatchAsset -PathType Leaf)) {
        throw '安装后未检测到中文本地化资源。请检查补丁文件或从备份还原后重试。'
    }
    $installedStartupPatchInfo = Get-StartupPatchInfo -Path $AppAsarPath
    if ($installedStartupPatchInfo.State -ne 'Patched') {
        throw '安装后未检测到启动译文。请检查安装结果或从备份还原后重试。'
    }

    $manifest = [ordered]@{
        Installed = $true
        PatchVersion = $PatchVersion
        InstalledAt = (Get-Date).ToString('o')
        RefreshedAt = $null
        RestoredAt = $null
        RestoredIndexHash = $null
        AppDir = $AppDir
        AppVersion = $CurrentVersion
        TestedAppVersion = $TestedAppVersion
        MainAssetName = $MainAsset.Name
        MainAssetHash = $MainAsset.Hash
        PatchAssetName = $PatchAssetName
        BackupDir = $BackupDir
        BackupIndexPath = $BackupIndexPath
        BackupPatchAssetPath = if ($OriginalPatchAssetExisted) { $BackupPatchAssetPath } else { $null }
        BackupAppAsarPath = $BackupAppAsarPath
        OriginalPatchAssetExisted = $OriginalPatchAssetExisted
        OriginalIndexHash = $OriginalIndexHash
        OriginalAppAsarHash = $OriginalAppAsarHash
        PatchedIndexHash = Get-Sha256 -Path $IndexPath
        PatchedAssetHash = Get-Sha256 -Path $InstalledPatchAsset
        StartupPatchEnabled = $true
        PatchedAppAsarHash = Get-Sha256 -Path $AppAsarPath
        PreviousManifestPath = $PreviousManifestPath
        PreviousBackupDir = $PreviousBackupDir
        PreviousAppVersion = $PreviousAppVersion
        PreviousPatchVersion = $PreviousPatchVersion
    }
    Write-JsonFile -Value $manifest -Path $ManifestPath
    Write-Host "Freebuff $CurrentVersion 中文补丁 $PatchVersion 已安装。"
    Write-Host "原始文件备份位置：$BackupDir"
    Write-Host '现在可以打开 Freebuff 使用中文界面。需要还原时，双击“还原英文.cmd”。'

} catch {
    $failureMessage = $_.Exception.Message
    $installRollbackSucceeded = $true
    if (-not (Restore-VerifiedFile -Source $BackupIndexPath -Destination $IndexPath -ExpectedHash $OriginalIndexHash)) { $installRollbackSucceeded = $false }
    if (-not (Restore-VerifiedFile -Source $BackupAppAsarPath -Destination $AppAsarPath -ExpectedHash $OriginalAppAsarHash)) { $installRollbackSucceeded = $false }
    if (-not (Restore-VerifiedFile -Source $BackupPatchAssetPath -Destination $InstalledPatchAsset -ExpectedHash $OriginalPatchAssetHash -OriginallyExisted $OriginalPatchAssetExisted)) { $installRollbackSucceeded = $false }
    if ($installRollbackSucceeded) {
        Remove-NewInstallArtifacts -BackupDir $BackupDir -BackupRoot $BackupRoot -BackupFiles @($BackupIndexPath, $BackupPatchAssetPath, $BackupAppAsarPath) -HistoryPath $PreviousManifestPath -HistoryRoot $historyDir
    }
    throw "中文补丁安装失败。回滚校验结果：$installRollbackSucceeded。如回滚未完成，原始备份仍保存在：$BackupDir。原因：$failureMessage。请检查备份后重试。"
} finally {
    if (Test-Path -LiteralPath $tempIndex -PathType Leaf) {
        Remove-Item -LiteralPath $tempIndex -Force -ErrorAction SilentlyContinue
    }
    if (Test-Path -LiteralPath $tempAsset -PathType Leaf) {
        Remove-Item -LiteralPath $tempAsset -Force -ErrorAction SilentlyContinue
    }
    if (Test-Path -LiteralPath $tempAsar -PathType Leaf) {
        Remove-Item -LiteralPath $tempAsar -Force -ErrorAction SilentlyContinue
    }
}

} catch {
    Write-Host "操作未完成：$($_.Exception.Message)" -ForegroundColor Red
    Write-Host '请根据上方提示处理后重试；如需反馈，请复制本窗口内容。'
    exit 1
}
