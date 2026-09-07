[CmdletBinding()]
param([string]$TestRoot = (Join-Path ([IO.Path]::GetTempPath()) ('freebuff-zh-tests-' + [guid]::NewGuid().ToString('N'))))

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$RepoRoot = Split-Path -Parent $PSScriptRoot
$Engine = Join-Path $RepoRoot 'FreebuffZhPatch.ps1'
$Asset = Join-Path $RepoRoot 'freebuff-zh-cn.js'
$EngineText = [IO.File]::ReadAllText($Engine)
$OriginalEngine = $Engine
# Fixtures never launch Freebuff. Stub only the process inventory in test copies
# so the user's actual app can keep running. The shipping guard stays unchanged.
$processCheck = '$processes = @(Get-Process -Name ''Freebuff'' -ErrorAction SilentlyContinue)'
if (-not $EngineText.Contains($processCheck)) { throw 'Process inventory test seam changed.' }
$EngineText = $EngineText.Replace($processCheck, '$processes = @()')
$AppVersion = [regex]::Match($EngineText, "TestedAppVersion = '([^']+)'").Groups[1].Value
$PatchVersion = [regex]::Match($EngineText, "PatchVersion = '([^']+)'").Groups[1].Value
$Utf8 = New-Object Text.UTF8Encoding($false)
$Utf8Bom = New-Object Text.UTF8Encoding($true)
$TestRoot = [IO.Path]::GetFullPath($TestRoot)
if (Test-Path -LiteralPath $TestRoot) { throw 'Use a new TestRoot so previous test evidence is not overwritten.' }
New-Item -ItemType Directory -Path $TestRoot | Out-Null
$FixtureExe = Join-Path $TestRoot 'fixture.exe'
Add-Type -OutputAssembly $FixtureExe -OutputType ConsoleApplication -TypeDefinition @"
using System.Reflection;
[assembly: AssemblyVersion("$AppVersion")]
[assembly: AssemblyFileVersion("$AppVersion")]
[assembly: AssemblyInformationalVersion("$AppVersion")]
public class Fixture { public static void Main() {} }
"@
$script:Assertions = 0

function Assert-True([bool]$Value, [string]$Message) {
    if (-not $Value) { throw "FAILED: $Message. Fixtures: $TestRoot" }
    $script:Assertions++
}

function New-Fixture([string]$Name) {
    $root = Join-Path $TestRoot $Name
    $app = Join-Path $root 'app'
    $state = Join-Path $root 'state'
    $ui = Join-Path $app 'resources\orchestrator\ui'
    New-Item -ItemType Directory -Path (Join-Path $ui 'assets') -Force | Out-Null
    Copy-Item -LiteralPath $FixtureExe -Destination (Join-Path $app 'Freebuff.exe')
    $index = Join-Path $ui 'index.html'
    $asar = Join-Path $app 'resources\app.asar'
    $main = Join-Path $ui 'assets\main.js'
    [IO.File]::WriteAllText($index, "<html lang=`"en`">`n<script type=`"module`" src=`"./assets/main.js`"></script>`n</html>", $Utf8)
    [IO.File]::WriteAllText($asar, ('fixture Starting Freebuff orchestrator' + [char]0x2026 + ' original-tail'), $Utf8)
    [IO.File]::WriteAllText($main, '// main fixture', $Utf8)
    return [PSCustomObject]@{
        Root = $root; App = $app; State = $state; Index = $index; Asar = $asar; Main = $main
        Manifest = (Join-Path $state 'manifest.json'); Asset = (Join-Path $ui 'assets\freebuff-zh-cn.js')
        OriginalIndex = (Get-FileHash $index).Hash; OriginalAsar = (Get-FileHash $asar).Hash
    }
}

function Invoke-Patch($Fixture, [string]$Action = 'Install', [string]$Script = $Engine) {
    $info = New-Object Diagnostics.ProcessStartInfo
    $info.FileName = Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0\powershell.exe'
    $arguments = @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', $Script, '-Action', $Action, '-AppDir', $Fixture.App, '-StateDir', $Fixture.State)
    $info.Arguments = ($arguments | ForEach-Object { '"' + $_ + '"' }) -join ' '
    $info.UseShellExecute = $false
    $info.CreateNoWindow = $true
    $info.RedirectStandardOutput = $true
    $info.RedirectStandardError = $true
    $info.RedirectStandardInput = $true
    $process = New-Object Diagnostics.Process
    $process.StartInfo = $info
    try {
        [void]$process.Start()
        $process.StandardInput.Close()
        $stdout = $process.StandardOutput.ReadToEndAsync()
        $stderr = $process.StandardError.ReadToEndAsync()
        if (-not $process.WaitForExit(30000)) { $process.Kill(); throw 'Patch fixture timed out.' }
        $output = $stdout.Result + $stderr.Result
        [IO.File]::WriteAllText((Join-Path $Fixture.Root ($Action + '-' + [guid]::NewGuid().ToString('N') + '.log')), $output, $Utf8)
        return [PSCustomObject]@{ ExitCode = $process.ExitCode; Output = $output }
    } finally { $process.Dispose() }
}

function Read-Manifest($Fixture) {
    return Get-Content -LiteralPath $Fixture.Manifest -Raw -Encoding UTF8 | ConvertFrom-Json
}

function Get-Snapshot($Fixture) {
    $files = foreach ($dir in @($Fixture.App, $Fixture.State)) {
        if (Test-Path -LiteralPath $dir) {
            Get-ChildItem -LiteralPath $dir -Recurse -File | Sort-Object FullName | ForEach-Object {
                $_.FullName + ':' + (Get-FileHash -LiteralPath $_.FullName).Hash
            }
        }
    }
    return $files -join "`n"
}

function New-TestEngine([switch]$Upgrade, [switch]$FailManifest, [switch]$FailRollback) {
    $dir = Join-Path $TestRoot ('engine-' + [guid]::NewGuid().ToString('N'))
    New-Item -ItemType Directory -Path $dir | Out-Null
    $code = $EngineText
    if ($Upgrade) {
        $needle = '$PatchVersion = ' + "'$PatchVersion'"
        $code = $code.Replace($needle, ('$PatchVersion = ' + "'$PatchVersion-test'"))
    }
    if ($FailManifest) {
        $needle = 'Write-JsonFile -Value $manifest -Path $ManifestPath'
        Assert-True ($code.Contains($needle)) 'manifest fault injection point exists'
        $code = $code.Replace($needle, "throw 'INJECTED manifest write failure'")
    }
    if ($FailRollback) {
        $needle = 'Copy-Item -LiteralPath $Source -Destination $Destination -Force -ErrorAction Stop'
        Assert-True ($code.Contains($needle)) 'rollback fault injection point exists'
        $code = $code.Replace($needle, ('if ($Destination -eq $IndexPath) { throw ''INJECTED rollback write failure'' }; ' + $needle))
    }
    $path = Join-Path $dir 'FreebuffZhPatch.ps1'
    [IO.File]::WriteAllText($path, $code, $Utf8Bom)
    Copy-Item -LiteralPath $Asset -Destination $dir
    return $path
}

# Version values come from the engine. No installed Freebuff or old archive is needed.
$Engine = New-TestEngine
$clean = New-Fixture ('unicode-' + [char]0x4e2d + [char]0x6587)
if (@(Get-Process -Name Freebuff -ErrorAction SilentlyContinue).Count -gt 0) {
    $before = Get-Snapshot $clean
    $result = Invoke-Patch $clean -Script $OriginalEngine
    Assert-True ($result.ExitCode -ne 0 -and $result.Output.Contains('Freebuff is running')) 'shipping process guard blocks a running app'
    Assert-True ((Get-Snapshot $clean) -eq $before) 'shipping process guard makes no fixture changes'
}
$result = Invoke-Patch $clean
Assert-True ($result.ExitCode -eq 0) "Unicode path install: $($result.Output)"
$before = Get-Snapshot $clean
$result = Invoke-Patch $clean
Assert-True ($result.ExitCode -eq 0) 'idempotent install succeeds'
Assert-True ((Get-Snapshot $clean) -eq $before) 'idempotent install makes no file changes'
$upgrade = New-TestEngine -Upgrade
$result = Invoke-Patch $clean -Script $upgrade
Assert-True ($result.ExitCode -eq 0) "Unicode path refresh: $($result.Output)"
Assert-True ((Read-Manifest $clean).PatchVersion -eq "$PatchVersion-test") 'refresh records new patch version'
$result = Invoke-Patch $clean -Action Restore -Script $upgrade
Assert-True ($result.ExitCode -eq 0) "Unicode path restore: $($result.Output)"
Assert-True ((Get-FileHash $clean.Index).Hash -eq $clean.OriginalIndex) 'restore recovers original index'
Assert-True ((Get-FileHash $clean.Asar).Hash -eq $clean.OriginalAsar) 'restore recovers original archive'
Assert-True (-not (Test-Path $clean.Asset)) 'restore removes translation asset'

# Every drift case must stop without replacing the trust hashes or changing files.
foreach ($kind in @('index', 'asar', 'main', 'asset', 'backup-index', 'backup-asar', 'missing-index-backup')) {
    $fixture = New-Fixture ('drift-' + $kind)
    $result = Invoke-Patch $fixture
    Assert-True ($result.ExitCode -eq 0) "$kind fixture install"
    $manifest = Read-Manifest $fixture
    $target = switch ($kind) {
        'index' { $fixture.Index }
        'asar' { $fixture.Asar }
        'main' { $fixture.Main }
        'asset' { $fixture.Asset }
        'backup-index' { $manifest.BackupIndexPath }
        'backup-asar' { $manifest.BackupAppAsarPath }
        'missing-index-backup' { $manifest.BackupIndexPath }
    }
    if ($kind -eq 'missing-index-backup') { Remove-Item -LiteralPath $target }
    else { [IO.File]::AppendAllText($target, ' external edit', $Utf8) }
    $before = Get-Snapshot $fixture
    $result = Invoke-Patch $fixture -Script $upgrade
    Assert-True ($result.ExitCode -ne 0) "$kind drift blocks refresh"
    Assert-True ((Get-Snapshot $fixture) -eq $before) "$kind drift preserves all files and manifest"
}

# Simulate a manifest write failure after app writes, with and without a second
# failure writing the index during rollback. Faults are only in copied engines.
foreach ($action in @('Install', 'Refresh', 'Restore')) {
    foreach ($failRollback in @($false, $true)) {
        $fixture = New-Fixture ("failure-$action-$failRollback")
        if ($action -ne 'Install') {
            $result = Invoke-Patch $fixture
            Assert-True ($result.ExitCode -eq 0) "$action fixture install"
        }
        $beforeIndex = (Get-FileHash $fixture.Index).Hash
        $beforeAsar = (Get-FileHash $fixture.Asar).Hash
        $beforeAsset = if (Test-Path $fixture.Asset) { (Get-FileHash $fixture.Asset).Hash } else { $null }
        $beforeManifest = if (Test-Path $fixture.Manifest) { (Get-FileHash $fixture.Manifest).Hash } else { $null }
        $faultEngine = New-TestEngine -Upgrade:($action -eq 'Refresh') -FailManifest -FailRollback:$failRollback
        $requestedAction = if ($action -eq 'Refresh') { 'Install' } else { $action }
        $result = Invoke-Patch $fixture -Action $requestedAction -Script $faultEngine
        Assert-True ($result.ExitCode -ne 0) "$action injected failure is reported"
        Assert-True ($result.Output.Contains('INJECTED manifest write failure')) "$action reached intended failure"
        $afterManifest = if (Test-Path $fixture.Manifest) { (Get-FileHash $fixture.Manifest).Hash } else { $null }
        Assert-True ($afterManifest -eq $beforeManifest) "$action failure keeps prior manifest"
        Assert-True ((Get-FileHash $fixture.Asar).Hash -eq $beforeAsar) "$action restores archive despite index failure"
        $afterAsset = if (Test-Path $fixture.Asset) { (Get-FileHash $fixture.Asset).Hash } else { $null }
        Assert-True ($afterAsset -eq $beforeAsset) "$action restores prior asset state"
        if ($failRollback) {
            Assert-True ($result.Output.Contains('Rollback verified: False')) "$action reports incomplete recovery"
            if ($action -eq 'Install') {
                $copies = @(Get-ChildItem -LiteralPath (Join-Path $fixture.State 'backups') -Recurse -File)
                Assert-True (@($copies | Where-Object { (Get-FileHash $_.FullName).Hash -eq $beforeIndex }).Count -gt 0) 'failed install retains original index backup'
                Assert-True (@($copies | Where-Object { (Get-FileHash $_.FullName).Hash -eq $beforeAsar }).Count -gt 0) 'failed install retains original archive backup'
            } else {
                $copies = @(Get-ChildItem -LiteralPath $fixture.App -Recurse -File -Filter '*rollback*.tmp')
                Assert-True (@($copies | Where-Object { (Get-FileHash $_.FullName).Hash -eq $beforeIndex }).Count -gt 0) "$action retains previous index recovery copy"
            }
        } else {
            Assert-True ($result.Output.Contains('Rollback verified: True')) "$action verifies successful recovery"
            Assert-True ((Get-FileHash $fixture.Index).Hash -eq $beforeIndex) "$action recovers index"
            Assert-True (@(Get-ChildItem -LiteralPath $fixture.App -Recurse -File -Filter '*.tmp').Count -eq 0) "$action removes temporary files after verified recovery"
            if ($action -eq 'Install') {
                Assert-True (@(Get-ChildItem -LiteralPath (Join-Path $fixture.State 'backups') -Recurse -File).Count -eq 0) 'successful failed-install rollback cleans new backups'
            }
        }
    }
}

Write-Output "PASS: $script:Assertions installer assertions. Fixtures retained at $TestRoot"
