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

$PatchVersion = '0.3.0'
$TestedAppVersion = '0.0.63.0'
$PatchMarkerStart = '<!-- FREEBUFF_ZH_PATCH_START -->'
$PatchMarkerEnd = '<!-- FREEBUFF_ZH_PATCH_END -->'
$PatchAssetName = 'freebuff-zh-cn.js'
$StartupOriginalText = 'Starting Freebuff orchestrator…'
$StartupLocalizedText = 'Freebuff 编排器正在启动…'
$Utf8NoBom = New-Object System.Text.UTF8Encoding($false)

function Get-Sha256 {
    param([Parameter(Mandatory = $true)][string]$Path)
    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) { return $null }
    return (Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash.ToLowerInvariant()
}

function Get-AppVersion {
    param([Parameter(Mandatory = $true)][string]$ExePath)
    return [Diagnostics.FileVersionInfo]::GetVersionInfo($ExePath).ProductVersion
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

function Write-JsonFile {
    param(
        [Parameter(Mandatory = $true)]$Value,
        [Parameter(Mandatory = $true)][string]$Path
    )
    $json = $Value | ConvertTo-Json -Depth 8
    [IO.File]::WriteAllText($Path, $json, $Utf8NoBom)
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
$CurrentIndexText = [IO.File]::ReadAllText($IndexPath)
$HasMarker = $CurrentIndexText.Contains($PatchMarkerStart)
$MainAsset = Get-MainAssetInfo -IndexText $CurrentIndexText -UiDir $UiDir

$manifest = $null
if (Test-Path -LiteralPath $ManifestPath -PathType Leaf) {
    try {
        $manifest = Get-Content -LiteralPath $ManifestPath -Raw | ConvertFrom-Json
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
$ManifestStartupPatchEnabled = [bool](Get-PropertyValue -InputObject $manifest -Name 'StartupPatchEnabled')
$ManifestPatchedAppAsarHash = Get-PropertyValue -InputObject $manifest -Name 'PatchedAppAsarHash'
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
    $PatchState = 'StaleManifest'
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
        PatchInstalled = ($HasMarker -and $PatchAssetPresent -and $ManifestInstalled)
        PatchMarkerPresent = $HasMarker
        PatchAssetPresent = $PatchAssetPresent
        InjectedPatchVersion = $InjectedPatchVersion
        InstalledPatchHash = $InstalledPatchHash
        SourcePatchHash = $SourcePatchHash
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

if (($Action -eq 'Install') -and -not $VersionCompatible -and -not $Force) {
    throw "Freebuff version $CurrentVersion is not supported by this patch. Tested version: $TestedAppVersion. Installation stopped. Use -Force only after verifying compatibility."
}

if (($Action -eq 'Install') -and ($PatchState -eq 'StaleManifest') -and -not $Force) {
    throw 'The manifest says the patch is installed, but the marker and asset are missing. Installation stopped to preserve the previous backup chain. Inspect the files or use -Force.'
}

if (($Action -eq 'Install') -and (($PatchState -eq 'PartialInstallation') -or ($PatchState -eq 'UnmanagedInstallation')) -and -not $Force) {
    throw "Detected an incomplete or unmanaged patch state: $PatchState. Installation stopped to protect existing files. Inspect the installation or use -Force."
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
    if (($CurrentVersion -ne $manifest.AppVersion) -and -not $Force) {
        throw "Freebuff changed from version $($manifest.AppVersion) to $CurrentVersion. Restore stopped to avoid overwriting a newer app file. Use -Force only after checking the files."
    }
    $currentIndexHash = Get-Sha256 -Path $IndexPath
    if (($currentIndexHash -ne $manifest.PatchedIndexHash) -and -not $Force) {
        throw 'index.html changed after the patch was installed. Restore stopped to protect the current file; use -Force only after checking it.'
    }
    if (-not (Test-Path -LiteralPath $manifest.BackupIndexPath -PathType Leaf)) {
        throw "The original index.html backup is missing: $($manifest.BackupIndexPath)"
    }

    $restoreStartupPatch = [bool](Get-PropertyValue -InputObject $manifest -Name 'StartupPatchEnabled')
    $backupAppAsarPath = Get-PropertyValue -InputObject $manifest -Name 'BackupAppAsarPath'
    $originalAppAsarHash = Get-PropertyValue -InputObject $manifest -Name 'OriginalAppAsarHash'
    $patchedAppAsarHash = Get-PropertyValue -InputObject $manifest -Name 'PatchedAppAsarHash'
    if ($restoreStartupPatch) {
        if (($CurrentAppAsarHash -ne $patchedAppAsarHash) -and -not $Force) {
            throw 'app.asar changed after the startup translation was installed. Restore stopped to protect the current file; use -Force only after checking it.'
        }
        if ([string]::IsNullOrWhiteSpace([string]$backupAppAsarPath) -or -not (Test-Path -LiteralPath $backupAppAsarPath -PathType Leaf)) {
            throw "The original app.asar backup is missing: $backupAppAsarPath"
        }
        if (((Get-Sha256 -Path $backupAppAsarPath) -ne $originalAppAsarHash) -and -not $Force) {
            throw 'The app.asar backup hash does not match the installation manifest. Restore stopped.'
        }
    }

    $restoreTemp = Join-Path $UiDir ('.freebuff-zh-restore-' + [guid]::NewGuid().ToString('N') + '.tmp')
    $restoreAsarTemp = Join-Path (Split-Path -Parent $AppAsarPath) ('.freebuff-zh-asar-restore-' + [guid]::NewGuid().ToString('N') + '.tmp')
    try {
        Copy-Item -LiteralPath $manifest.BackupIndexPath -Destination $restoreTemp -Force
        Move-Item -LiteralPath $restoreTemp -Destination $IndexPath -Force
        if ($restoreStartupPatch) {
            Copy-Item -LiteralPath $backupAppAsarPath -Destination $restoreAsarTemp -Force
            Move-Item -LiteralPath $restoreAsarTemp -Destination $AppAsarPath -Force
        }
        if ($manifest.OriginalPatchAssetExisted) {
            if (-not (Test-Path -LiteralPath $manifest.BackupPatchAssetPath -PathType Leaf)) {
                throw "The original same-name asset backup is missing: $($manifest.BackupPatchAssetPath)"
            }
            Copy-Item -LiteralPath $manifest.BackupPatchAssetPath -Destination $InstalledPatchAsset -Force
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
    } finally {
        if (Test-Path -LiteralPath $restoreTemp -PathType Leaf) {
            Remove-Item -LiteralPath $restoreTemp -Force -ErrorAction SilentlyContinue
        }
        if (Test-Path -LiteralPath $restoreAsarTemp -PathType Leaf) {
            Remove-Item -LiteralPath $restoreAsarTemp -Force -ErrorAction SilentlyContinue
        }
    }
    exit 0
}

if (-not (Test-Path -LiteralPath $SourcePatchAsset -PathType Leaf)) {
    throw "The Chinese localization asset is missing: $SourcePatchAsset"
}

if (-not $VersionCompatible) {
    Write-Warning "Forced installation on Freebuff $CurrentVersion. Tested patch version: $TestedAppVersion. Verify the UI after installation."
}

New-Item -ItemType Directory -Force -Path $StateRoot | Out-Null

if ($HasMarker) {
    if (-not (Test-Path -LiteralPath $ManifestPath -PathType Leaf)) {
        throw 'A localization marker exists, but the patch manifest is missing. Inspect the installation directory or restore from a backup first.'
    }
    $manifest = Get-Content -LiteralPath $ManifestPath -Raw | ConvertFrom-Json
    if (($manifest.AppVersion -ne $CurrentVersion) -and -not $Force) {
        throw 'The localization marker belongs to another Freebuff version. Check the update state; use -Force only if a refresh is appropriate.'
    }
    if ($null -eq $InjectedPatchVersion) {
        throw 'The localization marker exists, but its injected patch version is missing. Installation stopped.'
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
        if (((Get-Sha256 -Path $backupAppAsarPath) -ne $originalAppAsarHash) -and -not $Force) {
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
    Copy-Item -LiteralPath $IndexPath -Destination $rollbackIndex -Force
    Copy-Item -LiteralPath $InstalledPatchAsset -Destination $rollbackAsset -Force
    Copy-Item -LiteralPath $AppAsarPath -Destination $rollbackAsar -Force
    try {
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
        $manifest.PatchedIndexHash = Get-Sha256 -Path $IndexPath
        $manifest.PatchedAssetHash = Get-Sha256 -Path $InstalledPatchAsset
        $manifest | Add-Member -NotePropertyName 'StartupPatchEnabled' -NotePropertyValue $true -Force
        $manifest | Add-Member -NotePropertyName 'BackupAppAsarPath' -NotePropertyValue $backupAppAsarPath -Force
        $manifest | Add-Member -NotePropertyName 'OriginalAppAsarHash' -NotePropertyValue $originalAppAsarHash -Force
        $manifest | Add-Member -NotePropertyName 'PatchedAppAsarHash' -NotePropertyValue (Get-Sha256 -Path $AppAsarPath) -Force
        $manifest | Add-Member -NotePropertyName 'RefreshedAt' -NotePropertyValue ((Get-Date).ToString('o')) -Force
        $manifest.Installed = $true
        Write-JsonFile -Value $manifest -Path $ManifestPath
        Write-Host "Freebuff Chinese localization refreshed to patch version $PatchVersion."
    } catch {
        Copy-Item -LiteralPath $rollbackIndex -Destination $IndexPath -Force -ErrorAction SilentlyContinue
        Copy-Item -LiteralPath $rollbackAsset -Destination $InstalledPatchAsset -Force -ErrorAction SilentlyContinue
        Copy-Item -LiteralPath $rollbackAsar -Destination $AppAsarPath -Force -ErrorAction SilentlyContinue
        throw "Chinese patch refresh failed and the previous files were restored when possible. Reason: $($_.Exception.Message)"
    } finally {
        if (Test-Path -LiteralPath $assetTemp -PathType Leaf) {
            Remove-Item -LiteralPath $assetTemp -Force -ErrorAction SilentlyContinue
        }
        if (Test-Path -LiteralPath $indexTemp -PathType Leaf) {
            Remove-Item -LiteralPath $indexTemp -Force -ErrorAction SilentlyContinue
        }
        foreach ($temporaryPath in @($asarTemp, $rollbackIndex, $rollbackAsset, $rollbackAsar)) {
            if (Test-Path -LiteralPath $temporaryPath -PathType Leaf) {
                Remove-Item -LiteralPath $temporaryPath -Force -ErrorAction SilentlyContinue
            }
        }
    }
    exit 0
}

if ($StartupPatchInfo.State -ne 'Unpatched') {
    throw "A safe startup translation cannot be installed because the app.asar text state is $($StartupPatchInfo.State)."
}

$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$safeVersion = $CurrentVersion -replace '[^0-9A-Za-z._-]', '_'
$BackupDir = Join-Path (Join-Path $StateRoot 'backups') "$safeVersion-$timestamp"
New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null
$BackupIndexPath = Join-Path $BackupDir 'index.html'
$BackupPatchAssetPath = Join-Path $BackupDir $PatchAssetName
$BackupAppAsarPath = Join-Path $BackupDir 'app.asar'
$OriginalPatchAssetExisted = Test-Path -LiteralPath $InstalledPatchAsset -PathType Leaf

Copy-Item -LiteralPath $IndexPath -Destination $BackupIndexPath -Force
Copy-Item -LiteralPath $AppAsarPath -Destination $BackupAppAsarPath -Force
if ($OriginalPatchAssetExisted) {
    Copy-Item -LiteralPath $InstalledPatchAsset -Destination $BackupPatchAssetPath -Force
}

$injection = @"
    $PatchMarkerStart
    <script src="./assets/$PatchAssetName" data-freebuff-zh-patch="$PatchVersion"></script>
    $PatchMarkerEnd
"@

$moduleMatch = [regex]::Match($CurrentIndexText, '(?m)^\s*<script type="module"')
if (-not $moduleMatch.Success) {
    throw 'Could not locate the Freebuff main module script tag. The installation directory was not modified.'
}

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
        BackupDir = $BackupDir
        BackupIndexPath = $BackupIndexPath
        BackupPatchAssetPath = if ($OriginalPatchAssetExisted) { $BackupPatchAssetPath } else { $null }
        BackupAppAsarPath = $BackupAppAsarPath
        OriginalPatchAssetExisted = $OriginalPatchAssetExisted
        OriginalIndexHash = Get-Sha256 -Path $BackupIndexPath
        OriginalAppAsarHash = Get-Sha256 -Path $BackupAppAsarPath
        PatchedIndexHash = Get-Sha256 -Path $IndexPath
        PatchedAssetHash = Get-Sha256 -Path $InstalledPatchAsset
        StartupPatchEnabled = $true
        PatchedAppAsarHash = Get-Sha256 -Path $AppAsarPath
    }
    Write-JsonFile -Value $manifest -Path $ManifestPath
    Write-Host "Freebuff $CurrentVersion Chinese patch $PatchVersion installed."
    Write-Host "Original file backup: $BackupDir"
    Write-Host 'Start Freebuff to verify the UI. To restore:'
    Write-Host "  powershell -ExecutionPolicy Bypass -File `"$PSCommandPath`" -Action Restore"
} catch {
    Copy-Item -LiteralPath $BackupIndexPath -Destination $IndexPath -Force -ErrorAction SilentlyContinue
    Copy-Item -LiteralPath $BackupAppAsarPath -Destination $AppAsarPath -Force -ErrorAction SilentlyContinue
    if ($OriginalPatchAssetExisted) {
        Copy-Item -LiteralPath $BackupPatchAssetPath -Destination $InstalledPatchAsset -Force -ErrorAction SilentlyContinue
    } elseif (Test-Path -LiteralPath $InstalledPatchAsset -PathType Leaf) {
        Remove-Item -LiteralPath $InstalledPatchAsset -Force -ErrorAction SilentlyContinue
    }
    throw "Chinese patch installation failed and the original files were restored when possible. Reason: $($_.Exception.Message)"
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
