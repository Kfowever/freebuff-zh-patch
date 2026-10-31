[CmdletBinding()]
param([string]$OutputDir = '', [string]$SigningKey = $env:FREEBUFF_ZH_SIGNING_KEY)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
Import-Module (Join-Path $repo 'FreebuffZhAssistant.psm1') -Force -DisableNameChecking
Add-Type -AssemblyName System.IO.Compression.FileSystem
Add-Type -AssemblyName System.IO.Compression
if (-not $SigningKey -or -not (Test-Path -LiteralPath $SigningKey)) { throw '请通过 -SigningKey 或 FREEBUFF_ZH_SIGNING_KEY 指定本项目的私钥文件；私钥不得上传到 GitHub。' }
$signer = New-Object Security.Cryptography.RSACryptoServiceProvider
$signer.PersistKeyInCsp = $false
try {
    $signer.FromXmlString([IO.File]::ReadAllText($SigningKey))
    $probe = 'FreebuffZhCatalogSigningKey'
    Test-ZhCatalogSignature $probe ([Convert]::ToBase64String($signer.SignData([Text.Encoding]::UTF8.GetBytes($probe),'SHA256')))
} catch { $signer.Dispose(); throw }
$engine = [IO.File]::ReadAllText((Join-Path $repo 'FreebuffZhPatch.ps1'))
$installerVersion = [regex]::Match($engine, "InstallerVersion = '([^']+)'").Groups[1].Value
[void](Assert-ZhVersion $installerVersion)
$library = Test-ZhLibrary (Join-Path $repo 'library')
if (-not $OutputDir) { $OutputDir = [IO.Path]::GetFullPath((Join-Path $repo ("..\release-" + $installerVersion))) }
[IO.Directory]::CreateDirectory($OutputDir) | Out-Null
$updatesTag = "updates-v$installerVersion"
$updatesDir = Join-Path $OutputDir '自动更新'
$publicDir = Join-Path $OutputDir '用户下载'
[IO.Directory]::CreateDirectory($updatesDir) | Out-Null
[IO.Directory]::CreateDirectory($publicDir) | Out-Null
$installerFiles = @('FreebuffZhSetup.ps1','FreebuffZhAssistant.psm1','FreebuffZhPatch.ps1','安装.cmd','恢复英文.cmd','检查更新.cmd','查看状态.cmd','关闭自动更新.cmd','README.md','LICENSE')
$hashes = [ordered]@{}
foreach ($name in $installerFiles) { $hashes[$name] = Get-ZhHash (Join-Path $repo $name) }
Write-ZhJson ([ordered]@{schemaVersion=1;version=$installerVersion;files=$hashes}) (Join-Path $repo 'installer.json')
[void](Test-ZhInstaller $repo)
function Make-Zip([string]$Name, $Files, [string]$Directory = $updatesDir, [string]$Tag = $updatesTag) {
    $archive = Join-Path $Directory $Name
    if (Test-Path -LiteralPath $archive) { throw "请使用新的输出目录，避免覆盖已有安装包：$archive" }
    $zip = [IO.Compression.ZipFile]::Open($archive, [IO.Compression.ZipArchiveMode]::Create, [Text.Encoding]::UTF8)
    try {
        foreach ($file in $Files) { [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $file.Source, $file.Name, [IO.Compression.CompressionLevel]::Optimal) | Out-Null }
    } finally { $zip.Dispose() }
    $hash = Get-ZhHash $archive
    if ($Directory -eq $updatesDir) { [IO.File]::WriteAllText(($archive + '.sha256'), ($hash + '  ' + $Name + "`n"), (New-Object Text.UTF8Encoding($false))) }
    return [PSCustomObject]@{fileName=$Name;url="https://github.com/Kfowever/freebuff-zh-patch/releases/download/$Tag/$([uri]::EscapeDataString($Name))";sha256=$hash;size=(Get-Item -LiteralPath $archive).Length}
}
$installerEntries = @($installerFiles + 'installer.json' | ForEach-Object { [PSCustomObject]@{Name=$_;Source=(Join-Path $repo $_)} })
$installerAsset = Make-Zip "Freebuff-Zh-Installer-$installerVersion.zip" $installerEntries
$installerAsset | Add-Member NoteProperty version $installerVersion
$installerAsset | Add-Member NoteProperty manifestSha256 (Get-ZhHash (Join-Path $repo 'installer.json'))
$libraryNames = @($library.files.PSObject.Properties | ForEach-Object { $_.Name }) + 'library.json'
$libraryEntries = @($libraryNames | ForEach-Object { [PSCustomObject]@{Name=$_;Source=(Join-Path (Join-Path $repo 'library') $_)} })
$libraryAsset = Make-Zip "Freebuff-Zh-Library-$($library.version).zip" $libraryEntries
$libraryAsset | Add-Member NoteProperty version $library.version
$libraryAsset | Add-Member NoteProperty manifestSha256 (Get-ZhHash (Join-Path $repo 'library\library.json'))
$libraryAsset | Add-Member NoteProperty minInstallerVersion $library.minInstallerVersion
$libraryAsset | Add-Member NoteProperty appVersions @($library.appVersions)
$historical = @()
if (Test-Path -LiteralPath (Join-Path $repo 'compatibility.json')) {
    $previous = Read-ZhJson (Join-Path $repo 'compatibility.json'); Test-ZhCatalog $previous
    $historical = @($previous.libraries | Where-Object { $_.version -cne $library.version })
}
$catalog = [ordered]@{schemaVersion=1;repository='Kfowever/freebuff-zh-patch';installer=$installerAsset;libraries=(@($libraryAsset) + $historical)}
Test-ZhCatalog ([PSCustomObject]$catalog)
Write-ZhJson $catalog (Join-Path $repo 'compatibility.json')
Write-ZhJson $catalog (Join-Path $updatesDir 'compatibility.json')
$signature = [Convert]::ToBase64String($signer.SignData([IO.File]::ReadAllBytes((Join-Path $repo 'compatibility.json')),'SHA256'))
$signer.Dispose()
foreach ($directory in @($repo,$updatesDir)) { [IO.File]::WriteAllText((Join-Path $directory 'compatibility.json.sig'),$signature,[Text.Encoding]::ASCII) }
$offlineEntries = @($installerEntries) + @('compatibility.json','compatibility.json.sig' | ForEach-Object { [PSCustomObject]@{Name=$_;Source=(Join-Path $repo $_)} }) + @($libraryEntries | ForEach-Object { [PSCustomObject]@{Name=('library/' + $_.Name);Source=$_.Source} })
$offlineAsset = Make-Zip "Freebuff-Setup-$installerVersion.zip" $offlineEntries $publicDir "v$installerVersion"
$notes = "适用于 **Freebuff $($library.appVersions -join ' / ') / Windows x64**。`n`n**[点击下载汉化安装包]($($offlineAsset.url))** → 全部解压 → 双击 **安装.cmd**。`n`n下方 Source code 是源码，无需下载。`n`nSHA-256：``$($offlineAsset.sha256)```n"
[IO.File]::WriteAllText((Join-Path $OutputDir 'release-notes.md'),$notes,(New-Object Text.UTF8Encoding($false)))
Write-Output "PASS: 独立安装器 $installerVersion、翻译库 $($library.version)、兼容清单和离线整合包已生成。"
Write-Output "输出：$OutputDir"
Write-Output ('正式发行版只上传“用户下载”中的 ZIP；“自动更新”中的文件发布到 {0}，并标记为预发布，不设为最新版本。' -f $updatesTag)
Write-Output "离线包 SHA-256：$($offlineAsset.sha256)"
