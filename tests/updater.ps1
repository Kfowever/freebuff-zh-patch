[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)][string]$PackageDir,
    [string]$TestRoot = (Join-Path ([IO.Path]::GetTempPath()) ('freebuff-zh-updater-' + [guid]::NewGuid().ToString('N')))
)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
Import-Module (Join-Path $repo 'FreebuffZhAssistant.psm1') -Force -DisableNameChecking
$module = Get-Module FreebuffZhAssistant
$utf8 = New-Object Text.UTF8Encoding($false)
$bom = New-Object Text.UTF8Encoding($true)
Add-Type -AssemblyName System.IO.Compression.FileSystem
Add-Type -AssemblyName System.IO.Compression
if (Test-Path -LiteralPath $TestRoot) { throw 'Use a new test directory.' }
[IO.Directory]::CreateDirectory($TestRoot) | Out-Null
$TestRoot = [IO.Path]::GetFullPath($TestRoot)
$PackageDir = [IO.Path]::GetFullPath($PackageDir)
$script:assertions = 0
function Assert([bool]$Value, [string]$Message) { if (-not $Value) { throw "FAILED: $Message. Evidence: $TestRoot" }; $script:assertions++ }
function Reject([scriptblock]$Operation, [string]$Message) { $caught=$false; try { & $Operation | Out-Null } catch { $caught=$true }; Assert $caught $Message }
function Clone($Object) { return ($Object | ConvertTo-Json -Depth 20 | ConvertFrom-Json) }
function Snapshot([string]$App) { return @(Get-ChildItem -LiteralPath $App -File -Recurse | Sort-Object FullName | ForEach-Object { $_.FullName + ':' + (Get-ZhHash $_.FullName) }) -join "`n" }
function Zip-Directory([string]$Directory, [string]$Archive) {
    $zip=[IO.Compression.ZipFile]::Open($Archive,[IO.Compression.ZipArchiveMode]::Create,[Text.Encoding]::UTF8)
    try { foreach($file in Get-ChildItem -LiteralPath $Directory -Recurse -File) { $name=$file.FullName.Substring($Directory.Length+1).Replace('\','/');[IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip,$file.FullName,$name,[IO.Compression.CompressionLevel]::Optimal)|Out-Null } }
    finally { $zip.Dispose() }
}
$catalog = Read-ZhJson (Join-Path $PackageDir 'compatibility.json')
Test-ZhCatalog $catalog
Assert ((Select-ZhLibrary $catalog '0.0.196.0').version -eq '0.10.1') 'exact compatible library selected'
Assert (@(Select-ZhLibrary $catalog '0.0.197.0').Count -eq 0) 'nearby app version is not treated as compatible'
$two=Clone $catalog; $next=Clone $two.libraries[0];$next.version='0.10.2';$two.libraries=@($two.libraries)+@($next)
Assert ((Select-ZhLibrary $two '0.0.196.0').version -eq '0.10.2') 'newest library wins within exact compatible versions'
$duplicate=Clone $catalog;$duplicate.libraries=@($duplicate.libraries)+@($duplicate.libraries[0]);Reject {Test-ZhCatalog $duplicate} 'duplicate versions rejected'
foreach($url in @('http://github.com/Kfowever/freebuff-zh-patch/releases/download/v1/a.zip','https://github.com/Other/repo/releases/download/v1/a.zip','https://github.com.evil.test/Kfowever/freebuff-zh-patch/releases/download/v1/a.zip','https://user@github.com/Kfowever/freebuff-zh-patch/releases/download/v1/a.zip')) {
    $bad=Clone $catalog.installer;$bad.url=$url;Reject {Assert-ZhAsset $bad} "untrusted asset rejected: $url"
}
$bad=Clone $catalog.libraries[0];$bad.fileName='../a.zip';Reject {Assert-ZhAsset $bad} 'traversal filename rejected'
$bad=Clone $catalog.libraries[0];$bad.sha256='bad';Reject {Assert-ZhAsset $bad} 'invalid checksum rejected'
$json=Join-Path $TestRoot 'atomic.json';Write-ZhJson @{value=1} $json;Write-ZhJson @{value=2} $json
Assert ((Read-ZhJson $json).value -eq 2) 'repeated atomic JSON updates work in Windows PowerShell 5.1'
Assert (@(Get-ChildItem $TestRoot -Filter '*.tmp').Count -eq 0) 'atomic JSON leaves no temporary files'

$source=Join-Path $TestRoot 'installer source & 中文'
[IO.Directory]::CreateDirectory($source)|Out-Null
$metadata=Test-ZhInstaller $repo
foreach($name in @($metadata.files.PSObject.Properties|ForEach-Object{$_.Name})+'installer.json') { Copy-Item -LiteralPath (Join-Path $repo $name) -Destination (Join-Path $source $name) }
# Only this test copy receives an empty process inventory. Never stop the user's app.
$enginePath=Join-Path $source 'FreebuffZhPatch.ps1'
$text=[IO.File]::ReadAllText($enginePath)
$needle='$processes = @(Get-Process -Name ''Freebuff'' -ErrorAction SilentlyContinue)'
Assert ($text.Contains($needle)) 'shipping process guard seam exists'
[IO.File]::WriteAllText($enginePath,$text.Replace($needle,'$processes = @()'),$bom)
$metadata.files.'FreebuffZhPatch.ps1'=Get-ZhHash $enginePath
$isolatedStartup=@'
function Set-ZhStartup([string]$SourceRoot,[string]$AppDir,[string]$StateRoot,[bool]$Enabled) {
    Write-ZhJson @{enabled=$Enabled;appDir=$AppDir;installerRoot=$SourceRoot;installerVersion='0.11.0'} (Join-Path $StateRoot 'assistant-config.json')
}
Export-ModuleMember -Function *-Zh*
'@
# Integration child processes must not access the real user's registry.
$isolatedCore=Join-Path $source 'FreebuffZhAssistant.psm1'
[IO.File]::AppendAllText($isolatedCore,("`r`n"+$isolatedStartup),$utf8)
$metadata.files.'FreebuffZhAssistant.psm1'=Get-ZhHash $isolatedCore
Write-ZhJson $metadata (Join-Path $source 'installer.json')
[void](Test-ZhInstaller $source)
$fixtureExe=Join-Path $TestRoot 'fixture.exe'
Add-Type -OutputAssembly $fixtureExe -OutputType ConsoleApplication -TypeDefinition @'
using System.Reflection;
[assembly: AssemblyVersion("0.0.196.0")]
[assembly: AssemblyFileVersion("0.0.196.0")]
[assembly: AssemblyInformationalVersion("0.0.196.0")]
public class UpdaterFixture { public static void Main() {} }
'@
$profile=Read-ZhJson (Join-Path $repo 'library\profiles\0.0.196.0.json')
function New-App([string]$Name) {
    $app=Join-Path $TestRoot ($Name+'\app');$ui=Join-Path $app 'resources\orchestrator\ui'
    [IO.Directory]::CreateDirectory((Join-Path $ui 'assets'))|Out-Null
    Copy-Item -LiteralPath $fixtureExe -Destination (Join-Path $app 'Freebuff.exe')
    [IO.File]::WriteAllText((Join-Path $ui 'index.html'),('<html lang="en">' + [Environment]::NewLine + '<script type="module" src="/assets/main.js"></script>' + [Environment]::NewLine + '</html>'),$utf8)
    [IO.File]::WriteAllText((Join-Path $ui 'assets\main.js'),'// synthetic UI', $utf8)
    [IO.File]::WriteAllText((Join-Path $app 'resources\app.asar'),($profile.hostedOriginalText+' '+$profile.startupOriginalText+' tail'),$utf8)
    return $app
}
function Check([string]$App,[string]$State,[string]$Index=(Join-Path $PackageDir 'compatibility.json')) { return Invoke-ZhCheck $source $App $State $Index }
& $module {
    $script:OriginalVersion=(Get-Command Get-ZhAppVersion).ScriptBlock
    $script:TestRunning=$false
    function script:Get-Process { param($Name,$ErrorAction) if($script:TestRunning){[PSCustomObject]@{Id=123}} }
}
$app=New-App 'compatible & 中文';$state=Join-Path $TestRoot 'state-compatible';$before=Snapshot $app
& $module {$script:TestRunning=$true}
$result=Check $app $state
Assert ($result.state -eq 'Pending') "download while running is pending: $($result.message)"
Assert ((Snapshot $app) -eq $before) 'pending update does not modify the app'
Assert (Test-Path -LiteralPath (Join-Path $state 'libraries\0.10.1\library.json')) 'library downloaded and verified before pending status'
& $module {$script:TestRunning=$false}
$result=Check $app $state
Assert ($result.state -eq 'Applied') "exit then apply: $($result.message)"
$installed=Read-ZhJson (Join-Path $state 'manifest.json')
Assert ($installed.InstallerVersion -eq '0.11.0' -and $installed.PatchVersion -eq '0.10.1') 'installer and library versions are independent'
$after=Snapshot $app;$result=Check $app $state
Assert ($result.state -eq 'Current') "idempotent current status: $($result.message)"
Assert ((Snapshot $app) -eq $after) 'current check leaves installed files unchanged'
$held=[IO.File]::Open((Join-Path $state 'assistant-update.lock'),[IO.FileMode]::OpenOrCreate,[IO.FileAccess]::ReadWrite,[IO.FileShare]::None)
try{$result=Check $app $state;Assert ($result.state -eq 'Busy') 'concurrent check is rejected'}finally{$held.Dispose()}

# App updates while a download is being matched must not apply the wrong library.
& $module {$script:VersionCalls=0;function script:Get-ZhAppVersion {param($AppDir)$script:VersionCalls++;if($script:VersionCalls -eq 1){'0.0.196.0'}else{'0.0.197.0'}}}
$changing=New-App 'changing';$changingBefore=Snapshot $changing
$result=Check $changing (Join-Path $TestRoot 'state-changing')
Assert ($result.state -eq 'AppChanged') 'app change during download is deferred'
Assert ((Snapshot $changing) -eq $changingBefore) 'app change never writes the old compatibility patch'
& $module {Set-Item Function:script:Get-ZhAppVersion $script:OriginalVersion}

# Fresh no-match is different from a network failure plus an old local catalog.
& $module {function script:Get-ZhAppVersion {param($AppDir)'0.0.999.0'}}
$result=Check $app $state
Assert ($result.state -eq 'Unsupported' -and $result.message.Contains('尚未更新')) 'fresh no-match shows wait/Issue message'
Write-ZhJson $catalog (Join-Path $state 'catalog.bundled.json')
$result=Invoke-ZhCheck $source $app $state -Offline
Assert ($result.state -eq 'NetworkError') 'offline cache cannot claim that GitHub has no update'
Assert ((Snapshot $app) -eq $after) 'unsupported and network failure preserve the app'
& $module {Set-Item Function:script:Get-ZhAppVersion $script:OriginalVersion}

# Wrong artifact bytes and malicious ZIP paths must fail before an app write.
$badDir=Join-Path $TestRoot 'bad-download';[IO.Directory]::CreateDirectory($badDir)|Out-Null
$badFile=Join-Path $badDir $catalog.libraries[0].fileName;Copy-Item -LiteralPath (Join-Path $PackageDir $catalog.libraries[0].fileName) -Destination $badFile
[IO.File]::AppendAllText($badFile,'corruption',$utf8)
Reject {Get-ZhArchive $catalog.libraries[0] (Join-Path $TestRoot 'bad-state') $badDir} 'corrupt downloaded archive rejected'
Assert (@(Get-ChildItem (Join-Path $TestRoot 'bad-state') -Recurse -Filter '*.tmp').Count -eq 0) 'corrupt download temporary file removed'
foreach($entryName in @('../outside.ps1','C:/outside.ps1','/outside.ps1','profiles/../../outside.json')) {
    $zipFile=Join-Path $TestRoot ([guid]::NewGuid().ToString('N')+'.zip')
    $zip=[IO.Compression.ZipFile]::Open($zipFile,[IO.Compression.ZipArchiveMode]::Create)
    try{[void]$zip.CreateEntry('library.json');[void]$zip.CreateEntry($entryName)}finally{$zip.Dispose()}
    $dest=Join-Path $TestRoot ('unsafe-'+[guid]::NewGuid().ToString('N'))
    Reject {Expand-ZhArchive $zipFile $dest 'library'} 'unsafe ZIP entry rejected'
    Assert (-not(Test-Path -LiteralPath $dest)) 'ZIP validation happens before extraction'
}
Assert (-not(Test-Path -LiteralPath (Join-Path $TestRoot 'outside.ps1'))) 'no ZIP escape written'
$asset=Clone $catalog.libraries[0];$asset.manifestSha256='0'*64
Reject {Get-ZhPackage $asset $state 'library' $PackageDir} 'catalog content pin rejects a same-version cache mismatch'

# A higher local compatible library must never be downgraded by an older catalog.
$newLibrary=Join-Path $state 'libraries\0.10.2'
Copy-Item -LiteralPath (Join-Path $state 'libraries\0.10.1') -Destination $newLibrary -Recurse
$newMetadata=Read-ZhJson (Join-Path $newLibrary 'library.json');$newMetadata.version='0.10.2'
$runtime=Join-Path $newLibrary 'freebuff-zh-cn.js'
[IO.File]::WriteAllText($runtime,[IO.File]::ReadAllText($runtime).Replace("PATCH_VERSION = '0.10.1'","PATCH_VERSION = '0.10.2'"),$utf8)
$newMetadata.files.'freebuff-zh-cn.js'=Get-ZhHash $runtime;Write-ZhJson $newMetadata (Join-Path $newLibrary 'library.json')
Copy-Item -LiteralPath $runtime -Destination (Join-Path $app 'resources\orchestrator\ui\assets\freebuff-zh-cn.js') -Force
$index=Join-Path $app 'resources\orchestrator\ui\index.html';[IO.File]::WriteAllText($index,[IO.File]::ReadAllText($index).Replace('0.10.1','0.10.2'),$utf8)
$installed.PatchVersion='0.10.2';$installed.PatchedAssetHash=Get-ZhHash $runtime;$installed.PatchedIndexHash=Get-ZhHash $index
Write-ZhJson $installed (Join-Path $state 'manifest.json')
$newSnapshot=Snapshot $app;$result=Check $app $state
Assert ($result.state -eq 'Current' -and $result.libraryVersion -eq '0.10.2') 'older catalog does not downgrade a newer local library'
Assert ((Snapshot $app) -eq $newSnapshot) 'no downgrade file writes'

# Exercise real main-script self-update handoff with a harmless staged child.
$nextRoot=Join-Path $TestRoot 'next-installer';Copy-Item -LiteralPath $source -Destination $nextRoot -Recurse
$nextScript=@'
param([string]$Action,[string]$AppDir,[string]$StateDir,[string]$CatalogPath)
[IO.File]::WriteAllText((Join-Path $StateDir 'handoff-observed.txt'),($Action+'|'+$AppDir))
exit 0
'@
[IO.File]::WriteAllText((Join-Path $nextRoot 'FreebuffZhSetup.ps1'),$nextScript,$bom)
$nextMetadata=Read-ZhJson (Join-Path $nextRoot 'installer.json');$nextMetadata.version='0.12.0'
$nextMetadata.files.'FreebuffZhSetup.ps1'=Get-ZhHash (Join-Path $nextRoot 'FreebuffZhSetup.ps1')
Write-ZhJson $nextMetadata (Join-Path $nextRoot 'installer.json')
$nextPackageDir=Join-Path $TestRoot 'next-packages'
[IO.Directory]::CreateDirectory($nextPackageDir)|Out-Null
Copy-Item -LiteralPath (Join-Path $PackageDir $catalog.libraries[0].fileName) -Destination $nextPackageDir
$nextZip=Join-Path $nextPackageDir 'Freebuff-Zh-Installer-0.12.0-test.zip'
Zip-Directory $nextRoot $nextZip
$newCatalog=Clone $catalog;$newCatalog.installer.version='0.12.0';$newCatalog.installer.fileName=[IO.Path]::GetFileName($nextZip)
$newCatalog.installer.url='https://github.com/Kfowever/freebuff-zh-patch/releases/download/v0.12.0/'+[IO.Path]::GetFileName($nextZip)
$newCatalog.installer.sha256=Get-ZhHash $nextZip;$newCatalog.installer.size=(Get-Item $nextZip).Length
$newCatalog.installer.manifestSha256=Get-ZhHash (Join-Path $nextRoot 'installer.json')
$newIndex=Join-Path $nextPackageDir 'next-catalog-test.json';Write-ZhJson $newCatalog $newIndex
$handoffState=Join-Path $TestRoot 'state-handoff';$result=Check $app $handoffState $newIndex
Assert ($result.state -eq 'InstallerUpdate') "new installer staged: $($result.message)"
Assert ($result.InstallerRoot -eq (Join-Path $handoffState 'assistant\versions\0.12.0')) 'installer promotion uses an immutable version directory'
$output=& powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $source 'FreebuffZhSetup.ps1') -Action Check -AppDir $app -StateDir $handoffState -CatalogPath $newIndex 2>&1
Assert ($LASTEXITCODE -eq 0) "main script handoff exits successfully: $output"
Assert ([IO.File]::ReadAllText((Join-Path $handoffState 'handoff-observed.txt')).StartsWith('Check|')) 'verified staged installer receives the check'

# A staged installer which cannot run must not replace the active installer.
$failedRoot=Join-Path $TestRoot 'failing-installer';Copy-Item -LiteralPath $nextRoot -Destination $failedRoot -Recurse
[IO.File]::WriteAllText((Join-Path $failedRoot 'FreebuffZhSetup.ps1'),'exit 1',$utf8)
$failedMetadata=Read-ZhJson (Join-Path $failedRoot 'installer.json');$failedMetadata.version='0.13.0'
$failedMetadata.files.'FreebuffZhSetup.ps1'=Get-ZhHash (Join-Path $failedRoot 'FreebuffZhSetup.ps1')
Write-ZhJson $failedMetadata (Join-Path $failedRoot 'installer.json')
$failedZip=Join-Path $nextPackageDir 'Freebuff-Zh-Installer-0.13.0-test.zip';Zip-Directory $failedRoot $failedZip
$failedCatalog=Clone $catalog;$failedCatalog.installer.version='0.13.0';$failedCatalog.installer.fileName=[IO.Path]::GetFileName($failedZip)
$failedCatalog.installer.url='https://github.com/Kfowever/freebuff-zh-patch/releases/download/v0.13.0/'+[IO.Path]::GetFileName($failedZip)
$failedCatalog.installer.sha256=Get-ZhHash $failedZip;$failedCatalog.installer.size=(Get-Item $failedZip).Length
$failedCatalog.installer.manifestSha256=Get-ZhHash (Join-Path $failedRoot 'installer.json')
$failedIndex=Join-Path $nextPackageDir 'failed-catalog.json';Write-ZhJson $failedCatalog $failedIndex
$failedState=Join-Path $TestRoot 'state-failed-handoff'
Write-ZhJson @{enabled=$true;installerRoot=$source;appDir=$app;installerVersion='0.11.0'} (Join-Path $failedState 'assistant-config.json')
$output=& powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $source 'FreebuffZhSetup.ps1') -Action Check -AppDir $app -StateDir $failedState -CatalogPath $failedIndex 2>&1
Assert ($LASTEXITCODE -eq 1) 'failed staged installer returns a failure'
Assert ((Read-ZhJson (Join-Path $failedState 'assistant-config.json')).installerRoot -eq $source) 'failed installer handoff preserves active startup version'
Assert ((Snapshot $app) -eq $newSnapshot) 'failed installer handoff preserves the app'

# Exercise the real network path with a transport double (no production test
# switches and no local-HTTP exception to the HTTPS allowlist).
& $module {
    param($PackageDir,$Catalog)
    $script:Transport='ok';$script:PackageDir=$PackageDir;$script:TransportCatalog=$Catalog;$script:Requests=New-Object Collections.Generic.List[string]
    function script:Invoke-ZhTransfer {
        param($Url,$OutFile='',$MaxBytes=1048576)
        $script:Requests.Add([string]$Url)
        if($script:Transport -eq 'offline') {throw 'Synthetic unavailable GitHub'}
        if($script:Transport -in @('official-down','slow','first-bad') -and ([uri]$Url).Host -in @('github.com','raw.githubusercontent.com')) {throw 'Synthetic timeout or slow transfer'}
        if($OutFile){
            if($script:Transport -eq 'interrupt') {[IO.File]::WriteAllText($OutFile,'partial');throw 'Synthetic interrupted download'}
            if($script:Transport -eq 'first-bad' -and ([uri]$Url).Host -eq 'ghfast.top') {[IO.File]::WriteAllText($OutFile,'corrupt mirror file');return}
            [IO.File]::Copy((Join-Path $script:PackageDir ([uri]$Url).Segments[-1]),$OutFile,$true)
        }else{
            $content=[IO.File]::ReadAllText((Join-Path $script:PackageDir ([uri]$Url).Segments[-1]))
            if($script:Transport -eq 'tamper' -and -not $Url.EndsWith('.sig')) {$content=$content.Replace('0.0.196.0','0.0.197.0')}
            return $content
        }
    }
} $PackageDir $catalog
$networkApp=New-App 'network';$networkBefore=Snapshot $networkApp;$networkState=Join-Path $TestRoot 'state-network'
$result=Invoke-ZhCheck $source $networkApp $networkState
Assert ($result.state -eq 'Applied' -and $result.catalogFresh) "online catalog and ZIP path applies: $($result.message)"
$requests=@(& $module {$script:Requests.ToArray()})
Assert (@($requests|Where-Object {$_ -like 'https://raw.githubusercontent.com/*'}).Count -eq 2) 'public catalog and signature requested'
Assert (@($requests|Where-Object {$_ -like 'https://github.com/*/releases/download/*'}).Count -eq 1) 'one pinned release asset request'
$networkAfter=Snapshot $networkApp
& $module {$script:Transport='offline'}
$result=Invoke-ZhCheck $source $networkApp $networkState
Assert ($result.state -eq 'Current' -and -not $result.catalogFresh) 'network failure uses verified matching cache'
Assert ((Snapshot $networkApp) -eq $networkAfter) 'offline current check makes no app writes'
$beforeRequests=(& $module {$script:Requests.Count})
Reject {Get-ZhArchive $catalog.libraries[0] (Join-Path $TestRoot 'strict-offline') -Offline} 'offline mode requires preloaded packages'
Assert ((& $module {$script:Requests.Count}) -eq $beforeRequests) 'offline mode makes zero transport calls'
& $module {$script:Transport='interrupt'}
$interrupted=New-App 'interrupted';$interruptedBefore=Snapshot $interrupted;$interruptedState=Join-Path $TestRoot 'state-interrupted'
$result=Invoke-ZhCheck $source $interrupted $interruptedState
Assert ($result.state -eq 'Failed') 'interrupted release download is reported'
Assert ((Snapshot $interrupted) -eq $interruptedBefore) 'interrupted download preserves app'
Assert (@(Get-ChildItem $interruptedState -Recurse -Filter '*.tmp').Count -eq 0) 'interrupted download cleans temporary files'

# Every route must pass the same signature/hash checks; neither the canonical
# catalog's release URL nor its pinned content changes when using a mirror.
$routes=@(Get-ZhRoutes $catalog.libraries[0].url)
Assert ($routes.Count -eq 3 -and $routes[0] -ceq $catalog.libraries[0].url -and $routes[1].StartsWith('https://ghfast.top/https://github.com/')) 'official address precedes two fixed mirrors'
Reject {Get-ZhRoutes 'https://example.com/file.zip'} 'no arbitrary mirror URL rewriting'
Assert (-not(Test-ZhSlowTransfer 1 7.9)) 'short connections get a grace period'
Assert (Test-ZhSlowTransfer 8192 8) 'persistent low throughput triggers fallback'
Assert (-not(Test-ZhSlowTransfer 262144 8)) 'normal throughput stays on original route'
$content=[IO.File]::ReadAllText((Join-Path $PackageDir 'compatibility.json'))
$signature=[IO.File]::ReadAllText((Join-Path $PackageDir 'compatibility.json.sig'))
Test-ZhCatalogSignature $content $signature
Reject {Test-ZhCatalogSignature ($content+' ') $signature} 'modified catalog rejected by release signature'
Reject {Test-ZhCatalogSignature $content 'invalid signature'} 'invalid signature rejected'
& $module {$script:Transport='official-down';$script:Requests.Clear()}
$mirrorApp=New-App 'mirror';$mirrorState=Join-Path $TestRoot 'state-mirror'
$result=Invoke-ZhCheck $source $mirrorApp $mirrorState
Assert ($result.state -eq 'Applied' -and $result.catalogFresh) 'official outage falls back to signed mirror catalog and verified ZIP'
$mirrorRequests=@(& $module {$script:Requests.ToArray()})
Assert (@($mirrorRequests|Where-Object {$_ -like 'https://ghfast.top/*'}).Count -eq 3) 'first mirror supplies catalog signature and package'
& $module {$script:Transport='first-bad';$script:Requests.Clear()}
$secondState=Join-Path $TestRoot 'state-second-mirror'
$archive=Get-ZhArchive $catalog.libraries[0] $secondState
Assert ((Get-ZhHash $archive) -eq $catalog.libraries[0].sha256) 'corrupt first mirror falls back to the second mirror'
Assert (@(& $module {$script:Requests.ToArray()})[-1].StartsWith('https://gh-proxy.com/')) 'second mirror tried after first fails verification'
& $module {$script:Transport='tamper'}
Reject {Get-ZhCatalog (Join-Path $TestRoot 'state-tamper') $source} 'unsigned or modified mirror catalog never becomes trusted'
& $module {$script:Transport='slow'}
$slowArchive=Get-ZhArchive $catalog.libraries[0] (Join-Path $TestRoot 'state-slow')
Assert ((Get-ZhHash $slowArchive) -eq $catalog.libraries[0].sha256) 'slow direct transport falls back to verified mirror'
& $module {$script:Transport='offline';$script:Requests.Clear()}
Reject {Get-ZhArchive $catalog.libraries[0] (Join-Path $TestRoot 'state-all-down')} 'only report download failure after all routes fail'
Assert ((& $module {$script:Requests.Count}) -eq 3) 'all three routes attempted before download failure'

# Run one real watcher pass without GUI/registry side effects, then verify the
# per-state mutex excludes a second watcher before any check.
Write-ZhJson @{enabled=$true;installerRoot=$source;appDir=$networkApp;installerVersion='0.11.0'} (Join-Path $networkState 'assistant-config.json')
$output=& powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $source 'FreebuffZhSetup.ps1') -Action Watch -Once -Offline -AppDir $networkApp -StateDir $networkState 2>&1
Assert ($LASTEXITCODE -eq 0) "single offline watcher pass: $output"
Assert ((Snapshot $networkApp) -eq $networkAfter) 'watcher does not rewrite an unchanged current app'
$watchHash=Get-ZhHash (Join-Path $networkState 'assistant-status.json')
$sha=[Security.Cryptography.SHA256]::Create();try{$id=([BitConverter]::ToString($sha.ComputeHash([Text.Encoding]::UTF8.GetBytes($networkState.ToLowerInvariant())))).Replace('-','')}finally{$sha.Dispose()}
$mutex=New-Object Threading.Mutex($true,('Local\FreebuffZhAssistant-'+$id))
try{
    $output=& powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $source 'FreebuffZhSetup.ps1') -Action Watch -Once -Offline -AppDir $networkApp -StateDir $networkState 2>&1
    Assert ($LASTEXITCODE -eq 0) 'duplicate watcher exits cleanly'
    Assert ((Get-ZhHash (Join-Path $networkState 'assistant-status.json')) -eq $watchHash) 'duplicate watcher performs no check'
}finally{$mutex.ReleaseMutex();$mutex.Dispose()}

# Restore also disables future automatic reapplication; no registry value in the
# real user state can match this isolated test directory.
Write-ZhJson @{enabled=$true;appDir=$app;installerRoot=$source;installerVersion='0.11.0'} (Join-Path $state 'assistant-config.json')
$output=& powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $source 'FreebuffZhSetup.ps1') -Action Restore -AppDir $app -StateDir $state 2>&1
Assert ($LASTEXITCODE -eq 0) "restore succeeds: $output"
Assert ((Snapshot $app) -eq $before) 'restore recovers original app bytes'
Assert (-not(Read-ZhJson (Join-Path $state 'assistant-config.json')).enabled) 'restore disables auto update'

# Validate quoting of the persistent command, including Chinese/ampersand paths.
$command=Get-ZhCommand (Join-Path $source 'FreebuffZhSetup.ps1') $state $app
Assert ($command.Contains('-WindowStyle Hidden') -and $command.Contains('-Action Watch') -and $command.Contains('"'+$state+'"')) 'startup command is hidden and correctly quoted'
Reject {Get-ZhCommand 'bad"path' $state $app} 'invalid startup argument rejected'

# The real startup function is exercised with a registry provider double.
& $module {
    $script:RunValue='';$script:Removed=0
    function script:Test-Path { param($LiteralPath,$Path) if($LiteralPath -like 'HKCU:*' -or $Path -like 'HKCU:*'){$true}else{Microsoft.PowerShell.Management\Test-Path @PSBoundParameters} }
    function script:New-Item { param($Path,[switch]$Force) if($Path -notlike 'HKCU:*'){throw 'Unexpected registry-test write'} }
    function script:New-ItemProperty { param($Path,$Name,$Value,$PropertyType,[switch]$Force) $script:RunValue=$Value }
    function script:Get-ItemProperty { param($Path) [PSCustomObject]@{FreebuffZhAssistant=$script:RunValue} }
    function script:Remove-ItemProperty { param($Path,$Name) $script:RunValue='';$script:Removed++ }
}
$startupState=Join-Path $TestRoot 'startup-state'
$deployed=Install-ZhCache $source $startupState 'installer' '0.11.0'
Set-ZhStartup $deployed $app $startupState $true
$registered=& $module {$script:RunValue}
Assert ($registered.Contains('-WindowStyle Hidden') -and $registered.Contains($deployed)) 'enable registers the deployed hidden watcher'
Assert ((Read-ZhJson (Join-Path $startupState 'assistant-config.json')).enabled) 'enable persists its preference'
Set-ZhStartup $deployed $app $startupState $false
Assert ((& $module {$script:RunValue}) -eq '') 'disable removes its own startup entry'
Assert (-not(Read-ZhJson (Join-Path $startupState 'assistant-config.json')).enabled) 'disable persists its preference'
& $module {$script:RunValue='foreign program';$script:Removed=0}
Set-ZhStartup $deployed $app $startupState $false
Assert ((& $module {$script:RunValue}) -eq 'foreign program' -and (& $module {$script:Removed}) -eq 0) 'disable preserves an unrelated startup value'

# Persisting the preference is part of the startup transaction.
$savedWriter=& $module {${function:Write-ZhJson}}
& $module {function script:Write-ZhJson {param($Object,$Path) throw 'Synthetic configuration write failure'}}
try {
    Reject {Set-ZhStartup $deployed $app $startupState $true} 'preference write failure is reported'
    Assert ((& $module {$script:RunValue}) -eq 'foreign program') 'startup value rolled back when preference cannot be written'
    Assert (-not(Read-ZhJson (Join-Path $startupState 'assistant-config.json')).enabled) 'failed enable preserves previous preference'
} finally { & $module {param($Writer) Set-Item Function:script:Write-ZhJson $Writer} $savedWriter }

Write-Output "PASS: $script:assertions updater assertions. Evidence: $TestRoot"
