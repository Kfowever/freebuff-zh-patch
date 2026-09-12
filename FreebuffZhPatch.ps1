[CmdletBinding()]
param(
    [ValidateSet('Install', 'Restore', 'Status')]
    [string]$Action = 'Install',

    [string]$AppDir = '',

    [string]$StateDir = '',

    [switch]$Force
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$PatchVersion = '0.6.1'
$TestedAppVersion = '0.0.109.0'
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
        throw "$Description is missing or changed. No refresh was performed; existing files and backups were preserved."
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
            if ([string]::IsNullOrWhiteSpace($ExpectedHash)) { throw 'The recovery hash is missing.' }
            if ((Get-Sha256 -Path $Destination) -ne $ExpectedHash) {
                if ([string]::IsNullOrWhiteSpace($Source) -or (Get-Sha256 -Path $Source) -ne $ExpectedHash) {
                    throw 'The recovery copy is missing or has an unexpected hash.'
                }
                Copy-Item -LiteralPath $Source -Destination $Destination -Force -ErrorAction Stop
            }
            if ((Get-Sha256 -Path $Destination) -ne $ExpectedHash) { throw 'Recovery hash verification failed.' }
        } else {
            if (Test-Path -LiteralPath $Destination -PathType Leaf) {
                Remove-Item -LiteralPath $Destination -Force -ErrorAction Stop
            }
            if (Test-Path -LiteralPath $Destination) { throw 'The newly installed file could not be removed.' }
        }
        return $true
    } catch {
        Write-Warning "Recovery failed for $Destination. Recovery copy: $Source. Reason: $($_.Exception.Message)"
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
        '<script\b(?=[^>]*\btype="module")(?=[^>]*\bsrc="\./assets/([^"?]+\.js)(?:\?[^\"]*)?")[^>]*>'
    )
    if (-not $match.Success) {
        throw 'Could not find the Freebuff main UI JavaScript in index.html. The app structure may have changed.'
    }
    $name = $match.Groups[1].Value
    $path = Join-Path (Join-Path $UiDir 'assets') $name
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) {
        throw "The main UI asset referenced by index.html does not exist: $path"
    }
    return [PSCustomObject]@{
        Name = $name
        Path = $path
        Hash = Get-Sha256 -Path $path
    }
}

function Assert-FreebuffStopped {
    $processes = @(Get-Process -Name 'Freebuff' -ErrorAction SilentlyContinue)
    if ($processes.Count -gt 0) {
        throw 'Freebuff is running. Close it completely, then run the patch command again.'
    }
}

function Confirm-IncompatibleInstall {
    param(
        [Parameter(Mandatory = $true)][string]$DetectedVersion,
        [Parameter(Mandatory = $true)][string]$SupportedVersion
    )

    Write-Warning "Freebuff $DetectedVersion is not the version tested with this patch ($SupportedVersion)."
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
    if ($Pattern.Length -eq 0) { throw 'The byte pattern must not be empty.' }
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
        throw 'The startup translation must have the same UTF-8 byte length as the original text.'
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
        throw 'The startup translation must have the same UTF-8 byte length as the original text.'
    }
    $data = [IO.File]::ReadAllBytes($Source)
    $sourceOffsets = @(Find-BytePatternOffsets -Data $data -Pattern $sourceBytes)
    $targetOffsets = @(Find-BytePatternOffsets -Data $data -Pattern $targetBytes)
    if (($sourceOffsets.Count -ne 1) -or ($targetOffsets.Count -ne 0)) {
        throw "The startup text has an unexpected layout (original=$($sourceOffsets.Count), localized=$($targetOffsets.Count)). The app.asar file was not modified."
    }
    [Array]::Copy($targetBytes, 0, $data, $sourceOffsets[0], $targetBytes.Length)
    [IO.File]::WriteAllBytes($Destination, $data)
    $verification = Get-StartupPatchInfo -Path $Destination
    if ($verification.State -ne 'Patched') {
        throw 'The temporary app.asar failed startup translation verification.'
    }
}

if ([string]::IsNullOrWhiteSpace($AppDir)) {
    if ([string]::IsNullOrWhiteSpace($env:LOCALAPPDATA)) {
        throw 'LOCALAPPDATA is unavailable. Specify the Freebuff installation directory with -AppDir.'
    }
    $AppDir = Join-Path $env:LOCALAPPDATA 'Programs\@codebufffreebuff-desktop'
}

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
    throw "The patch manifest path is a directory, not a file: $ManifestPath"
}

if (-not (Test-Path -LiteralPath $ExePath -PathType Leaf)) {
    throw "Freebuff.exe was not found: $ExePath"
}
if (-not (Test-Path -LiteralPath $IndexPath -PathType Leaf)) {
    throw "The Freebuff UI entry point was not found: $IndexPath"
}
if (-not (Test-Path -LiteralPath $AppAsarPath -PathType Leaf)) {
    throw "The Freebuff Electron archive was not found: $AppAsarPath"
}

$CurrentVersion = Get-AppVersion -ExePath $ExePath
if ([string]::IsNullOrWhiteSpace([string]$CurrentVersion)) {
    throw 'Freebuff.exe does not expose a readable ProductVersion. Installation and restore are blocked because compatibility cannot be determined.'
}
$CurrentIndexText = [IO.File]::ReadAllText($IndexPath)
$HasMarker = $CurrentIndexText.Contains($PatchMarkerStart)
$MainAsset = Get-MainAssetInfo -IndexText $CurrentIndexText -UiDir $UiDir

$manifest = $null
if (Test-Path -LiteralPath $ManifestPath -PathType Leaf) {
    try {
        $manifest = Get-Content -LiteralPath $ManifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
    } catch {
        throw "The patch manifest is not valid JSON: $ManifestPath"
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

Write-Host "Detected Freebuff version: $CurrentVersion"
Write-Host "Supported Freebuff version: $TestedAppVersion"
Write-Host "Detected patch state: $PatchState"

if (($Action -eq 'Install') -and ($PatchState -eq 'InstalledCurrent')) {
    Write-Host "Freebuff Chinese patch $PatchVersion is already installed. No changes were made."
    exit 0
}

if (($Action -eq 'Install') -and ($PatchState -eq 'StaleManifest')) {
    throw 'The manifest says the patch is installed, but the current files do not form a recognized clean post-update state. Installation stopped to preserve the backup chain.'
}

if (($Action -eq 'Install') -and (($PatchState -eq 'PartialInstallation') -or ($PatchState -eq 'UnmanagedInstallation') -or ($PatchState -eq 'InstalledForOtherVersion'))) {
    throw "Detected an incomplete, unmanaged, or cross-version patch state: $PatchState. Installation stopped to protect existing files and backups."
}

Assert-FreebuffStopped

if ($Action -eq 'Restore') {
    if ($PatchState -eq 'NotInstalled') {
        Write-Host 'The Freebuff Chinese patch is not installed. No changes were made.'
        exit 0
    }
    if (-not (Test-Path -LiteralPath $ManifestPath -PathType Leaf)) {
        throw "The patch manifest was not found, so a safe restore is not possible: $ManifestPath"
    }
    if (-not $manifest.Installed) {
        throw 'Patch files are present, but the manifest says the patch is not installed. Restore stopped to avoid deleting unmanaged files.'
    }
    if ($CurrentVersion -ne $manifest.AppVersion) {
        throw "Freebuff changed from version $($manifest.AppVersion) to $CurrentVersion. Restore stopped to avoid overwriting a newer app file."
    }
    $currentIndexHash = Get-Sha256 -Path $IndexPath
    if ($currentIndexHash -ne $manifest.PatchedIndexHash) {
        throw 'index.html changed after the patch was installed. Restore stopped to protect the current file.'
    }
    if (-not (Test-Path -LiteralPath $manifest.BackupIndexPath -PathType Leaf)) {
        throw "The original index.html backup is missing: $($manifest.BackupIndexPath)"
    }
    if ((Get-Sha256 -Path $manifest.BackupIndexPath) -ne $manifest.OriginalIndexHash) {
        throw 'The index.html backup hash does not match the installation manifest. Restore stopped.'
    }

    $restoreStartupPatch = [bool](Get-PropertyValue -InputObject $manifest -Name 'StartupPatchEnabled')
    $backupAppAsarPath = Get-PropertyValue -InputObject $manifest -Name 'BackupAppAsarPath'
    $originalAppAsarHash = Get-PropertyValue -InputObject $manifest -Name 'OriginalAppAsarHash'
    $patchedAppAsarHash = Get-PropertyValue -InputObject $manifest -Name 'PatchedAppAsarHash'
    if ($restoreStartupPatch) {
        if ($CurrentAppAsarHash -ne $patchedAppAsarHash) {
            throw 'app.asar changed after the startup translation was installed. Restore stopped to protect the current file.'
        }
        if ([string]::IsNullOrWhiteSpace([string]$backupAppAsarPath) -or -not (Test-Path -LiteralPath $backupAppAsarPath -PathType Leaf)) {
            throw "The original app.asar backup is missing: $backupAppAsarPath"
        }
        if ((Get-Sha256 -Path $backupAppAsarPath) -ne $originalAppAsarHash) {
            throw 'The app.asar backup hash does not match the installation manifest. Restore stopped.'
        }
    }

    $restoreOriginalAsset = [bool](Get-PropertyValue -InputObject $manifest -Name 'OriginalPatchAssetExisted')
    $restoreAssetBackup = Get-PropertyValue -InputObject $manifest -Name 'BackupPatchAssetPath'
    if ($restoreOriginalAsset -and ([string]::IsNullOrWhiteSpace([string]$restoreAssetBackup) -or -not (Test-Path -LiteralPath $restoreAssetBackup -PathType Leaf))) {
        throw "The original same-name asset backup is missing: $restoreAssetBackup"
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
        Write-Host "The Freebuff Chinese patch was restored. The original backup remains at: $($manifest.BackupDir)"
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
        throw "Chinese patch restore failed. Rollback verified: $restoreRollbackSucceeded. If incomplete, recovery copies remain beside the app files. Reason: $failureMessage"
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
    throw "The Chinese localization asset is missing: $SourcePatchAsset"
}

$moduleMatch = $null
if (-not $HasMarker) {
    if ($StartupPatchInfo.State -ne 'Unpatched') {
        throw "A safe startup translation cannot be installed because the app.asar text state is $($StartupPatchInfo.State)."
    }
    $moduleMatch = [regex]::Match($CurrentIndexText, '(?m)^\s*<script type="module"')
    if (-not $moduleMatch.Success) {
        throw 'Could not locate the Freebuff main module script tag. The installation directory was not modified.'
    }
}

if (-not $VersionCompatible) {
    if ($Force) {
        Write-Host 'The legacy -Force switch was supplied; interactive y/Y confirmation is still required.'
    }
    Confirm-IncompatibleInstall -DetectedVersion $CurrentVersion -SupportedVersion $TestedAppVersion
    Assert-FreebuffStopped
    Write-Warning "Proceeding with explicitly confirmed installation on Freebuff $CurrentVersion."
}

if ($HasMarker) {
    if (-not (Test-Path -LiteralPath $ManifestPath -PathType Leaf)) {
        throw 'A localization marker exists, but the patch manifest is missing. Inspect the installation directory or restore from a backup first.'
    }
    $manifest = Get-Content -LiteralPath $ManifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
    if ($manifest.AppVersion -ne $CurrentVersion) {
        throw 'The localization marker belongs to another Freebuff version. Refresh stopped to protect the existing backup chain.'
    }
    if ($null -eq $InjectedPatchVersion) {
        throw 'The localization marker exists, but its injected patch version is missing. Installation stopped.'
    }
    # A new patch asset is allowed; drift in already installed files is not.
    Assert-FileHash -Path $IndexPath -ExpectedHash $manifest.PatchedIndexHash -Description 'Installed index.html'
    Assert-FileHash -Path $InstalledPatchAsset -ExpectedHash $manifest.PatchedAssetHash -Description 'Installed translation asset'
    if ($MainAsset.Name -ne $manifest.MainAssetName) { throw 'The main UI asset name changed. Refresh stopped.' }
    Assert-FileHash -Path $MainAsset.Path -ExpectedHash $manifest.MainAssetHash -Description 'Main UI asset'
    Assert-FileHash -Path $manifest.BackupIndexPath -ExpectedHash $manifest.OriginalIndexHash -Description 'Original index.html backup'
    if ($ManifestStartupPatchEnabled) {
        Assert-FileHash -Path $AppAsarPath -ExpectedHash $ManifestPatchedAppAsarHash -Description 'Installed app.asar'
    } elseif (-not [string]::IsNullOrWhiteSpace([string](Get-PropertyValue -InputObject $manifest -Name 'OriginalAppAsarHash'))) {
        Assert-FileHash -Path $AppAsarPath -ExpectedHash $manifest.OriginalAppAsarHash -Description 'Unpatched app.asar'
    }
    $manifestBackupDir = Get-PropertyValue -InputObject $manifest -Name 'BackupDir'
    if ([string]::IsNullOrWhiteSpace([string]$manifestBackupDir) -or -not (Test-Path -LiteralPath $manifestBackupDir -PathType Container)) {
        throw "The existing backup directory is missing: $manifestBackupDir"
    }
    $backupAppAsarPath = Get-PropertyValue -InputObject $manifest -Name 'BackupAppAsarPath'
    $originalAppAsarHash = Get-PropertyValue -InputObject $manifest -Name 'OriginalAppAsarHash'
    if ([string]::IsNullOrWhiteSpace([string]$backupAppAsarPath)) {
        if ($StartupPatchInfo.State -ne 'Unpatched') {
            throw "A safe original app.asar backup cannot be created because the startup text state is $($StartupPatchInfo.State)."
        }
        $backupAppAsarPath = Join-Path $manifestBackupDir 'app.asar'
        Copy-Item -LiteralPath $AppAsarPath -Destination $backupAppAsarPath -Force
        $originalAppAsarHash = Get-Sha256 -Path $backupAppAsarPath
    } else {
        if (-not (Test-Path -LiteralPath $backupAppAsarPath -PathType Leaf)) {
            throw "The original app.asar backup is missing: $backupAppAsarPath"
        }
        if ((Get-Sha256 -Path $backupAppAsarPath) -ne $originalAppAsarHash) {
            throw 'The app.asar backup hash does not match the installation manifest. Refresh stopped.'
        }
    }
    if (($StartupPatchInfo.State -ne 'Unpatched') -and ($StartupPatchInfo.State -ne 'Patched')) {
        throw "The startup text layout is not recognized (original=$($StartupPatchInfo.OriginalCount), localized=$($StartupPatchInfo.LocalizedCount)). Installation stopped."
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
            throw 'The startup translation was not detected after refresh.'
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
        Write-Host "Freebuff Chinese localization refreshed to patch version $PatchVersion."
    } catch {
        $failureMessage = $_.Exception.Message
        if (-not (Restore-VerifiedFile -Source $rollbackIndex -Destination $IndexPath -ExpectedHash $CurrentIndexHash)) { $refreshRollbackSucceeded = $false }
        if (-not (Restore-VerifiedFile -Source $rollbackAsset -Destination $InstalledPatchAsset -ExpectedHash $InstalledPatchHash)) { $refreshRollbackSucceeded = $false }
        if (-not (Restore-VerifiedFile -Source $rollbackAsar -Destination $AppAsarPath -ExpectedHash $CurrentAppAsarHash)) { $refreshRollbackSucceeded = $false }
        throw "Chinese patch refresh failed. Rollback verified: $refreshRollbackSucceeded. If incomplete, recovery copies remain beside the app files. Reason: $failureMessage"
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
        throw "The previous patch backup directory is missing, so migration cannot safely preserve its history: $PreviousBackupDir"
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
        throw 'The index.html backup failed hash verification.'
    }
    if ((Get-Sha256 -Path $BackupAppAsarPath) -ne $OriginalAppAsarHash) {
        throw 'The app.asar backup failed hash verification.'
    }
    if ($OriginalPatchAssetExisted -and ((Get-Sha256 -Path $BackupPatchAssetPath) -ne (Get-Sha256 -Path $InstalledPatchAsset))) {
        throw 'The same-name patch asset backup failed hash verification.'
    }
} catch {
    $failureMessage = $_.Exception.Message
    Remove-NewInstallArtifacts -BackupDir $BackupDir -BackupRoot $BackupRoot -BackupFiles @($BackupIndexPath, $BackupPatchAssetPath, $BackupAppAsarPath) -HistoryPath $PreviousManifestPath -HistoryRoot $historyDir
    throw "Backup preparation failed before modifying the app. Reason: $failureMessage"
}

$injection = @"
    $PatchMarkerStart
    <script src="./assets/$PatchAssetName" data-freebuff-zh-patch="$PatchVersion"></script>
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
        throw 'The patch marker was not detected after installation.'
    }
    if (-not (Test-Path -LiteralPath $InstalledPatchAsset -PathType Leaf)) {
        throw 'The Chinese localization asset was not detected after installation.'
    }
    $installedStartupPatchInfo = Get-StartupPatchInfo -Path $AppAsarPath
    if ($installedStartupPatchInfo.State -ne 'Patched') {
        throw 'The startup translation was not detected after installation.'
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
    Write-Host "Freebuff $CurrentVersion Chinese patch $PatchVersion installed."
    Write-Host "Original file backup: $BackupDir"
    Write-Host 'Start Freebuff to verify the UI. To restore:'
    Write-Host "  powershell -ExecutionPolicy Bypass -File `"$PSCommandPath`" -Action Restore"
} catch {
    $failureMessage = $_.Exception.Message
    $installRollbackSucceeded = $true
    if (-not (Restore-VerifiedFile -Source $BackupIndexPath -Destination $IndexPath -ExpectedHash $OriginalIndexHash)) { $installRollbackSucceeded = $false }
    if (-not (Restore-VerifiedFile -Source $BackupAppAsarPath -Destination $AppAsarPath -ExpectedHash $OriginalAppAsarHash)) { $installRollbackSucceeded = $false }
    if (-not (Restore-VerifiedFile -Source $BackupPatchAssetPath -Destination $InstalledPatchAsset -ExpectedHash $OriginalPatchAssetHash -OriginallyExisted $OriginalPatchAssetExisted)) { $installRollbackSucceeded = $false }
    if ($installRollbackSucceeded) {
        Remove-NewInstallArtifacts -BackupDir $BackupDir -BackupRoot $BackupRoot -BackupFiles @($BackupIndexPath, $BackupPatchAssetPath, $BackupAppAsarPath) -HistoryPath $PreviousManifestPath -HistoryRoot $historyDir
    }
    throw "Chinese patch installation failed. Rollback verified: $installRollbackSucceeded. If incomplete, original backups remain at: $BackupDir. Reason: $failureMessage"
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
