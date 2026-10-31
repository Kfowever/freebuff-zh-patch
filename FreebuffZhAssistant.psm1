Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$script:Repository = 'Kfowever/freebuff-zh-patch'
$script:CatalogUrl = 'https://raw.githubusercontent.com/Kfowever/freebuff-zh-patch/main/compatibility.json'
$script:CatalogPublicKey = '<RSAKeyValue><Modulus>xe+2SzBZkrrLBq/aNwV/IDanp+iI97TE0qvUbUfF51zjt0hkIJImZMkMnLHHH5U1HgktznUchG/s7OtHdsiQkYUHMU92xtcCu1GQ46zzPWIw0mext2h+J7qTct7ilyNK8zW303QXMKOd2i0ESTBN/GoFKc3gF89buc1hhrS1hq2PK9I9hAqxwIeGVdBVUZt9HPtDAiyx4E5GZTlHkch3U/cushPxbFsK1tAyDdZgRz0Q0AKsKiHk+rhU3a6dw4sKc5CVxgBNaDQZS0V1x6BZ8TmSN8DftXCrJ+0WDFv8CHJVM0NaLS+vNxQ3H84NYIxtIsFzB4Kguxo4AEyKZpBD1/Di3e1sIPI4WeKCxtpgalxk0qfgnArE1GpP9EpsgBo8/FpgjVMjFyTHHj8Fuom3qLnjiSRPw4p+oLS0Wa5fnKoymYdLdj6EZ16wUqLxOihHwXU/VAGl+he7H0kXUygowm/Bry/H/4hZgDS5fgb3cza5HtFWDspoZjVrSxpuhvk1</Modulus><Exponent>AQAB</Exponent></RSAKeyValue>'
$script:MirrorPrefixes = @('https://ghfast.top/','https://gh-proxy.com/')
$script:Utf8 = New-Object Text.UTF8Encoding($false)

function Get-ZhValue($Object, [string]$Name, $Default = $null) {
    if ($null -eq $Object) { return $Default }
    $property = $Object.PSObject.Properties[$Name]
    if ($null -eq $property) { return $Default }
    return $property.Value
}
function Read-ZhJson([string]$Path) {
    if ((Get-Item -LiteralPath $Path).Length -gt 1048576) { throw '配置文件过大。' }
    return [IO.File]::ReadAllText($Path) | ConvertFrom-Json
}
function Write-ZhJson($Object, [string]$Path) {
    [IO.Directory]::CreateDirectory((Split-Path -Parent $Path)) | Out-Null
    $temporary = $Path + '.' + [guid]::NewGuid().ToString('N') + '.tmp'
    try {
        [IO.File]::WriteAllText($temporary, (($Object | ConvertTo-Json -Depth 20).Replace("`r`n","`n")), $script:Utf8)
        if (Test-Path -LiteralPath $Path) { [IO.File]::Replace($temporary, $Path, [NullString]::Value) }
        else { [IO.File]::Move($temporary, $Path) }
    } finally { if (Test-Path -LiteralPath $temporary) { Remove-Item -LiteralPath $temporary -Force } }
}
function Get-ZhHash([string]$Path) { return (Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash.ToLowerInvariant() }
function Assert-ZhVersion([string]$Version, [switch]$App) {
    $pattern = if ($App) { '^\d+\.\d+\.\d+\.\d+$' } else { '^\d+\.\d+\.\d+(?:\.\d+)?$' }
    if ($Version -notmatch $pattern) { throw "版本号格式无效：$Version" }
    return [version]$Version
}
function Assert-ZhAsset($Asset) {
    [void](Assert-ZhVersion ([string]$Asset.version))
    if ([string]$Asset.fileName -notmatch '^[A-Za-z0-9][A-Za-z0-9._-]*\.zip$' -or
        [string]$Asset.sha256 -notmatch '^[a-fA-F0-9]{64}$' -or
        [string]$Asset.manifestSha256 -notmatch '^[a-fA-F0-9]{64}$' -or
        [long]$Asset.size -le 0 -or [long]$Asset.size -gt 20971520) { throw '下载清单的文件名、大小或哈希无效。' }
    $uri = [uri]$Asset.url
    $prefix = '/' + $script:Repository + '/releases/download/'
    if ($uri.Scheme -cne 'https' -or $uri.Host -ine 'github.com' -or $uri.UserInfo -or $uri.Query -or $uri.Fragment -or
        -not $uri.AbsolutePath.StartsWith($prefix, [StringComparison]::Ordinal) -or
        $uri.AbsolutePath.Substring($prefix.Length) -notmatch '^[A-Za-z0-9._-]+/[A-Za-z0-9._-]+\.zip$' -or
        [uri]::UnescapeDataString($uri.Segments[-1]) -cne [string]$Asset.fileName) { throw '只接受本项目 GitHub Releases 中的 HTTPS 安装包。' }
}
function Test-ZhCatalog($Catalog) {
    if ($Catalog.schemaVersion -ne 1 -or $Catalog.repository -cne $script:Repository) { throw '兼容清单格式或仓库不匹配。' }
    Assert-ZhAsset $Catalog.installer
    $seen = @{}
    foreach ($item in @($Catalog.libraries)) {
        Assert-ZhAsset $item
        [void](Assert-ZhVersion ([string]$item.minInstallerVersion))
        if ($seen.ContainsKey([string]$item.version)) { throw '兼容清单包含重复的翻译库版本。' }
        $seen[[string]$item.version] = $true
        if (@($item.appVersions).Count -eq 0) { throw '翻译库未声明兼容版本。' }
        foreach ($version in @($item.appVersions)) { [void](Assert-ZhVersion ([string]$version) -App) }
    }
}
function Select-ZhLibrary($Catalog, [string]$AppVersion) {
    [void](Assert-ZhVersion $AppVersion -App)
    return @($Catalog.libraries | Where-Object { @($_.appVersions) -ccontains $AppVersion } |
        Sort-Object { [version]$_.version } -Descending | Select-Object -First 1)
}
function Resolve-ZhApp([string]$AppDir, [switch]$Interactive) {
    if ($AppDir) {
        $resolved = [IO.Path]::GetFullPath($AppDir)
        if (-not (Test-Path -LiteralPath (Join-Path $resolved 'Freebuff.exe') -PathType Leaf)) { throw '指定的位置没有 Freebuff.exe。' }
        return $resolved
    }
    $candidates = @()
    if ($env:LOCALAPPDATA) { $candidates += Join-Path $env:LOCALAPPDATA 'Programs\@codebufffreebuff-desktop' }
    foreach ($root in @('HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*', 'HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*', 'HKLM:\Software\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*')) {
        foreach ($entry in @(Get-ItemProperty -Path $root -ErrorAction SilentlyContinue)) {
            if ([string](Get-ZhValue $entry 'DisplayName' '') -notmatch '^Freebuff(?:\s|$)') { continue }
            $location = [string](Get-ZhValue $entry 'InstallLocation' '')
            if ($location) { $candidates += $location }
            $icon = [string](Get-ZhValue $entry 'DisplayIcon' '')
            if ($icon -match '^"?(?<exe>.+\\Freebuff\.exe)"?(?:,\d+)?$') { $candidates += Split-Path -Parent $Matches.exe }
        }
    }
    foreach ($candidate in ($candidates | Select-Object -Unique)) {
        if (Test-Path -LiteralPath (Join-Path $candidate 'Freebuff.exe') -PathType Leaf) { return [IO.Path]::GetFullPath($candidate) }
    }
    if ($Interactive -and [Environment]::UserInteractive -and -not [Console]::IsInputRedirected) {
        Add-Type -AssemblyName System.Windows.Forms
        $picker = New-Object Windows.Forms.OpenFileDialog
        try {
            $picker.Title = '选择已安装的 Freebuff.exe'; $picker.Filter = 'Freebuff 主程序|Freebuff.exe'
            if ($picker.ShowDialog() -eq [Windows.Forms.DialogResult]::OK) { return Split-Path -Parent $picker.FileName }
        } finally { $picker.Dispose() }
    }
    throw '没有找到 Freebuff，请先安装官方桌面版。'
}
function Get-ZhAppVersion([string]$AppDir) {
    $version = [Diagnostics.FileVersionInfo]::GetVersionInfo((Join-Path $AppDir 'Freebuff.exe')).ProductVersion
    [void](Assert-ZhVersion $version -App)
    return $version
}
function Test-ZhLibrary([string]$Root, [string]$ExpectedVersion = '') {
    $library = Read-ZhJson (Join-Path $Root 'library.json')
    if ($library.schemaVersion -ne 1 -or ($ExpectedVersion -and $library.version -cne $ExpectedVersion)) { throw '翻译库版本或格式不匹配。' }
    [void](Assert-ZhVersion ([string]$library.version))
    [void](Assert-ZhVersion ([string]$library.minInstallerVersion))
    $files = @('freebuff-zh-cn.js')
    if (@($library.appVersions).Count -eq 0) { throw '翻译库未声明支持版本。' }
    foreach ($version in @($library.appVersions)) {
        [void](Assert-ZhVersion ([string]$version) -App)
        $name = "profiles/$version.json"
        $profile = Read-ZhJson (Join-Path $Root $name)
        if ($profile.schemaVersion -ne 1 -or $profile.appVersion -cne $version -or $profile.mode -notin @('hosted', 'local')) { throw '翻译库适配信息不匹配。' }
        foreach ($prefix in @('startup') + $(if ($profile.mode -eq 'hosted') { @('hosted') } else { @() })) {
            $original = [string](Get-ZhValue $profile ($prefix + 'OriginalText') '')
            $localized = [string](Get-ZhValue $profile ($prefix + 'LocalizedText') '')
            if (-not $original -or -not $localized -or [Text.Encoding]::UTF8.GetByteCount($original) -ne [Text.Encoding]::UTF8.GetByteCount($localized)) { throw '适配数据的字节长度无效。' }
        }
        $files += $name
    }
    if (@($library.files.PSObject.Properties).Count -ne $files.Count) { throw '翻译库文件清单不完整。' }
    foreach ($name in $files) {
        $hash = [string](Get-ZhValue $library.files $name '')
        if ($hash -notmatch '^[a-fA-F0-9]{64}$' -or (Get-ZhHash (Join-Path $Root $name)) -ine $hash) { throw "翻译库校验失败：$name" }
    }
    $runtime = [IO.File]::ReadAllText((Join-Path $Root 'freebuff-zh-cn.js'))
    if ([regex]::Match($runtime, "const PATCH_VERSION = '([^']+)'").Groups[1].Value -cne $library.version) { throw '翻译库与界面脚本的版本不一致。' }
    return $library
}
function Test-ZhInstaller([string]$Root, [string]$ExpectedVersion = '') {
    $metadata = Read-ZhJson (Join-Path $Root 'installer.json')
    [void](Assert-ZhVersion ([string]$metadata.version))
    if ($metadata.schemaVersion -ne 1 -or ($ExpectedVersion -and $metadata.version -cne $ExpectedVersion)) { throw '安装器版本或格式不匹配。' }
    $required = @('FreebuffZhSetup.ps1', 'FreebuffZhAssistant.psm1', 'FreebuffZhPatch.ps1')
    $allowed = $required + @('安装.cmd', '恢复英文.cmd', '检查更新.cmd', '查看状态.cmd', '关闭自动更新.cmd', 'Install-Freebuff-Zh.cmd', 'Restore-Freebuff-Zh.cmd', 'README.md', 'LICENSE')
    foreach ($name in $required) { if (-not (Get-ZhValue $metadata.files $name)) { throw '安装器缺少必要文件。' } }
    foreach ($property in $metadata.files.PSObject.Properties) {
        if ($allowed -cnotcontains $property.Name -or [string]$property.Value -notmatch '^[a-fA-F0-9]{64}$' -or
            (Get-ZhHash (Join-Path $Root $property.Name)) -ine $property.Value) { throw "安装器文件校验失败：$($property.Name)" }
    }
    return $metadata
}
function Expand-ZhArchive([string]$Archive, [string]$Destination, [ValidateSet('library','installer')][string]$Kind) {
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    if (Test-Path -LiteralPath $Destination) { throw '解压目标已经存在，拒绝覆盖。' }
    $zip = [IO.Compression.ZipFile]::OpenRead($Archive)
    try {
        if ($zip.Entries.Count -lt 2 -or $zip.Entries.Count -gt 40) { throw '安装包的文件数量异常。' }
        $seen = @{}; $total = [long]0
        $installerFiles = @('installer.json','FreebuffZhSetup.ps1','FreebuffZhAssistant.psm1','FreebuffZhPatch.ps1','安装.cmd','恢复英文.cmd','检查更新.cmd','查看状态.cmd','关闭自动更新.cmd','Install-Freebuff-Zh.cmd','Restore-Freebuff-Zh.cmd','README.md','LICENSE')
        foreach ($entry in $zip.Entries) {
            $name = $entry.FullName
            $permitted = if ($Kind -eq 'library') { $name -cin @('library.json','freebuff-zh-cn.js') -or $name -cmatch '^profiles/\d+\.\d+\.\d+\.\d+\.json$' } else { $installerFiles -ccontains $name }
            if (-not $permitted -or $seen.ContainsKey($name) -or (($entry.ExternalAttributes -shr 16) -band 61440) -eq 40960 -or ($entry.ExternalAttributes -band 1024)) { throw '安装包包含非法、重复或链接文件。' }
            $seen[$name] = $true; $total += $entry.Length
            if ($total -gt 20971520 -or $entry.Length -gt 8388608) { throw '安装包解压大小超出限制。' }
        }
        # Every entry is an allowlisted relative filename; no generic extraction.
        foreach ($entry in $zip.Entries) {
            $target = Join-Path $Destination $entry.FullName
            [IO.Directory]::CreateDirectory((Split-Path -Parent $target)) | Out-Null
            [IO.Compression.ZipFileExtensions]::ExtractToFile($entry, $target, $false)
        }
    } finally { $zip.Dispose() }
}
function Get-ZhRoutes([string]$Url) {
    $uri = [uri]$Url
    if ($uri.Scheme -cne 'https' -or $uri.UserInfo -or $uri.Query -or $uri.Fragment -or
        ($Url -cne $script:CatalogUrl -and $Url -cne ($script:CatalogUrl + '.sig') -and
         -not $Url.StartsWith(('https://github.com/' + $script:Repository + '/releases/download/'), [StringComparison]::Ordinal))) {
        throw '拒绝为非本项目下载地址生成镜像链接。'
    }
    return @($Url) + @($script:MirrorPrefixes | ForEach-Object { $_ + $Url })
}
function Test-ZhSlowTransfer([long]$Bytes, [double]$Seconds) {
    return $Seconds -ge 8 -and ($Bytes / $Seconds) -lt 16384
}
function Invoke-ZhTransfer([string]$Url, [string]$OutFile = '', [long]$MaxBytes = 1048576) {
    [Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12
    $request = [Net.HttpWebRequest]::Create([uri]$Url)
    $request.UserAgent = 'FreebuffZhAssistant'; $request.Headers['Cache-Control'] = 'no-cache'
    $request.Timeout = 8000; $request.ReadWriteTimeout = 5000; $request.MaximumAutomaticRedirections = 5
    $request.AutomaticDecompression = [Net.DecompressionMethods]::GZip -bor [Net.DecompressionMethods]::Deflate
    $response = $null; $inputStream = $null; $outputStream = $null; $async = $null
    $timer = [Diagnostics.Stopwatch]::StartNew()
    try {
        $async = $request.BeginGetResponse($null, $null)
        if (-not $async.AsyncWaitHandle.WaitOne(8000)) { throw '连接超过 8 秒，尝试下一个下载线路。' }
        $response = $request.EndGetResponse($async)
        if ($response.ResponseUri.Scheme -cne 'https') { throw '下载重定向到非 HTTPS 地址，已拒绝。' }
        if ($response.ContentLength -gt $MaxBytes) { throw '下载内容超过大小限制。' }
        $inputStream = $response.GetResponseStream()
        $outputStream = if ($OutFile) { [IO.File]::Open($OutFile,[IO.FileMode]::Create,[IO.FileAccess]::Write,[IO.FileShare]::None) } else { New-Object IO.MemoryStream }
        $buffer = New-Object byte[] 16384; $total = [long]0
        while (($read = $inputStream.Read($buffer,0,$buffer.Length)) -gt 0) {
            $total += $read
            if ($total -gt $MaxBytes) { throw '下载内容超过大小限制。' }
            if ($timer.Elapsed.TotalSeconds -ge 60 -or (Test-ZhSlowTransfer $total $timer.Elapsed.TotalSeconds)) { throw '下载持续过慢，尝试下一个下载线路。' }
            $outputStream.Write($buffer,0,$read)
        }
        if (-not $OutFile) { return $script:Utf8.GetString($outputStream.ToArray()) }
    } finally {
        $request.Abort()
        if ($null -ne $async) { $async.AsyncWaitHandle.Close() }
        if ($null -ne $inputStream) { $inputStream.Dispose() }
        if ($null -ne $outputStream) { $outputStream.Dispose() }
        if ($null -ne $response) { $response.Dispose() }
        $timer.Stop()
    }
}
function Test-ZhCatalogSignature([string]$Content, [string]$Signature) {
    $rsa = New-Object Security.Cryptography.RSACryptoServiceProvider
    $rsa.PersistKeyInCsp = $false
    try {
        $rsa.FromXmlString($script:CatalogPublicKey)
        if (-not $rsa.VerifyData($script:Utf8.GetBytes($Content), 'SHA256', [Convert]::FromBase64String($Signature.Trim()))) { throw '兼容清单签名校验失败。' }
    } finally { $rsa.Dispose() }
}
function Get-ZhArchive($Asset, [string]$StateRoot, [string]$LocalDirectory = '', [switch]$Offline) {
    Assert-ZhAsset $Asset
    $root = Join-Path $StateRoot 'downloads'; [IO.Directory]::CreateDirectory($root) | Out-Null
    $path = Join-Path $root ($Asset.sha256 + '.zip')
    if ((Test-Path -LiteralPath $path) -and (Get-ZhHash $path) -ieq $Asset.sha256 -and (Get-Item $path).Length -eq [long]$Asset.size) { return $path }
    $temp = $path + '.' + [guid]::NewGuid().ToString('N') + '.tmp'
    try {
        $local = if ($LocalDirectory) { Join-Path $LocalDirectory $Asset.fileName } else { '' }
        if ($local -and (Test-Path -LiteralPath $local -PathType Leaf)) { Copy-Item -LiteralPath $local -Destination $temp }
        else {
            if ($Offline) { throw '离线缓存中没有所需安装包，请先提供匹配的包或恢复联网后检查。' }
            $downloaded = $false; $failures = @(); $routeIndex = 0
            foreach ($route in @(Get-ZhRoutes $Asset.url)) {
                if ($routeIndex++ -gt 0) { Write-Host '官方线路或上一镜像不可用、过慢或校验未通过，正在尝试备用镜像……' }
                try {
                    Invoke-ZhTransfer $route $temp ([long]$Asset.size)
                    if ((Get-Item -LiteralPath $temp).Length -ne [long]$Asset.size -or (Get-ZhHash $temp) -ine $Asset.sha256) { throw '文件大小或 SHA-256 校验失败。' }
                    $downloaded = $true; break
                } catch { $failures += ([uri]$route).Host + '：' + $_.Exception.Message }
            }
            if (-not $downloaded) { throw ('官方下载和备用镜像均未成功，未应用。' + ($failures -join '；')) }
        }
        if ((Get-Item -LiteralPath $temp).Length -ne [long]$Asset.size -or (Get-ZhHash $temp) -ine $Asset.sha256) { throw '下载文件的大小或 SHA-256 校验失败，未应用。' }
        if (Test-Path -LiteralPath $path) { [IO.File]::Replace($temp, $path, [NullString]::Value) } else { [IO.File]::Move($temp, $path) }
        return $path
    } finally { if (Test-Path -LiteralPath $temp) { Remove-Item -LiteralPath $temp -Force } }
}
function Get-ZhCatalog([string]$StateRoot, [string]$SourceRoot, [string]$CatalogPath = '', [switch]$Offline, [switch]$PreferCache) {
    if ($CatalogPath) {
        $data = Read-ZhJson $CatalogPath; Test-ZhCatalog $data
        Write-ZhJson $data (Join-Path $StateRoot 'catalog.json')
        return [PSCustomObject]@{ Data=$data; Fresh=$true; LocalDirectory=(Split-Path -Parent ([IO.Path]::GetFullPath($CatalogPath))); Error='' }
    }
    $cache = Join-Path $StateRoot 'catalog.json'; $errorMessage = ''
    if (-not $Offline -and -not $PreferCache) {
        try {
            $failures = @(); $routeIndex = 0
            foreach ($route in @(Get-ZhRoutes $script:CatalogUrl)) {
                if ($routeIndex++ -gt 0) { Write-Host '兼容清单官方线路或上一镜像未成功，正在尝试备用镜像……' }
                try {
                    $content = Invoke-ZhTransfer $route
                    $signature = Invoke-ZhTransfer ($route + '.sig') '' 4096
                    Test-ZhCatalogSignature $content $signature
                    $data = $content | ConvertFrom-Json; Test-ZhCatalog $data
                    Write-ZhJson $data $cache
                    return [PSCustomObject]@{ Data=$data; Fresh=$true; LocalDirectory=''; Error='' }
                } catch { $failures += ([uri]$route).Host + '：' + $_.Exception.Message }
            }
            throw ('官方清单和备用镜像均未成功。' + ($failures -join '；'))
        } catch { $errorMessage = $_.Exception.Message }
    }
    foreach ($candidate in @($cache, (Join-Path $StateRoot 'catalog.bundled.json'), (Join-Path $SourceRoot 'compatibility.json'))) {
        if (-not (Test-Path -LiteralPath $candidate -PathType Leaf)) { continue }
        try {
            $data = Read-ZhJson $candidate; Test-ZhCatalog $data
            return [PSCustomObject]@{ Data=$data; Fresh=$false; LocalDirectory=''; Error=$errorMessage }
        } catch { $errorMessage = $_.Exception.Message }
    }
    throw "无法取得有效兼容清单，请稍后检查。$errorMessage"
}
function Install-ZhCache([string]$SourceRoot, [string]$StateRoot, [ValidateSet('library','installer')][string]$Kind, [string]$Version) {
    $base = if ($Kind -eq 'library') { Join-Path $StateRoot 'libraries' } else { Join-Path $StateRoot 'assistant\versions' }
    $target = Join-Path $base $Version
    if ($Kind -eq 'library') { [void](Test-ZhLibrary $SourceRoot $Version) } else { [void](Test-ZhInstaller $SourceRoot $Version) }
    if (Test-Path -LiteralPath $target) {
        if ($Kind -eq 'library') { [void](Test-ZhLibrary $target $Version) } else { [void](Test-ZhInstaller $target $Version) }
        $metadataName = if ($Kind -eq 'library') { 'library.json' } else { 'installer.json' }
        if ((Get-ZhHash (Join-Path $SourceRoot $metadataName)) -ne (Get-ZhHash (Join-Path $target $metadataName))) { throw '同版本安装包内容发生变化，拒绝覆盖已验证的缓存。' }
        return $target
    }
    [IO.Directory]::CreateDirectory($base) | Out-Null
    $stage = Join-Path $base ('.stage-' + [guid]::NewGuid().ToString('N'))
    $metadata = Read-ZhJson (Join-Path $SourceRoot $(if ($Kind -eq 'library') { 'library.json' } else { 'installer.json' }))
    $names = @($metadata.files.PSObject.Properties | ForEach-Object { $_.Name }) + $(if ($Kind -eq 'library') { 'library.json' } else { 'installer.json' })
    foreach ($name in $names) {
        $destination = Join-Path $stage $name
        [IO.Directory]::CreateDirectory((Split-Path -Parent $destination)) | Out-Null
        Copy-Item -LiteralPath (Join-Path $SourceRoot $name) -Destination $destination
    }
    if ($Kind -eq 'library') { [void](Test-ZhLibrary $stage $Version) } else { [void](Test-ZhInstaller $stage $Version) }
    # Atomic promotion. Existing version directories and the backup chain stay intact.
    [IO.Directory]::Move($stage, $target)
    return $target
}
function Get-ZhPackage($Asset, [string]$StateRoot, [string]$Kind, [string]$LocalDirectory = '', [switch]$Offline) {
    $base = if ($Kind -eq 'library') { Join-Path $StateRoot 'libraries' } else { Join-Path $StateRoot 'assistant\versions' }
    $target = Join-Path $base ([string]$Asset.version)
    if (Test-Path -LiteralPath $target) {
        if ($Kind -eq 'library') { [void](Test-ZhLibrary $target $Asset.version) } else { [void](Test-ZhInstaller $target $Asset.version) }
        $metadataName = if ($Kind -eq 'library') { 'library.json' } else { 'installer.json' }
        if ((Get-ZhHash (Join-Path $target $metadataName)) -ine $Asset.manifestSha256) { throw '缓存版本与兼容清单中的内容不一致。' }
        return $target
    }
    $archive = Get-ZhArchive $Asset $StateRoot $LocalDirectory -Offline:$Offline
    $stage = Join-Path $StateRoot ('staging\' + [guid]::NewGuid().ToString('N'))
    Expand-ZhArchive $archive $stage $Kind
    $metadataName = if ($Kind -eq 'library') { 'library.json' } else { 'installer.json' }
    if ((Get-ZhHash (Join-Path $stage $metadataName)) -ine $Asset.manifestSha256) { throw '安装包内的版本清单哈希不一致。' }
    return Install-ZhCache $stage $StateRoot $Kind $Asset.version
}
function Set-ZhStatus([string]$StateRoot, [string]$State, [string]$Message, [string]$AppVersion = '', [string]$LibraryVersion = '', [bool]$CatalogFresh = $false) {
    $status = [PSCustomObject][ordered]@{ state=$State; message=$Message; appVersion=$AppVersion; libraryVersion=$LibraryVersion; catalogFresh=$CatalogFresh; checkedAt=[DateTime]::UtcNow.ToString('o') }
    Write-ZhJson $status (Join-Path $StateRoot 'assistant-status.json')
    return $status
}
function Invoke-ZhEngine([string]$SourceRoot, [string]$LibraryRoot, [string]$AppDir, [string]$StateRoot, [string]$Action, [switch]$CloseRunningApp) {
    $arguments = @('-NoLogo','-NoProfile','-ExecutionPolicy','Bypass','-File',(Join-Path $SourceRoot 'FreebuffZhPatch.ps1'),'-Action',$Action,'-AppDir',$AppDir,'-StateDir',$StateRoot,'-LibraryDir',$LibraryRoot)
    if ($CloseRunningApp) { $arguments += '-CloseRunningApp' }
    $result = & powershell.exe @arguments 2>&1
    $code = $LASTEXITCODE
    if ($code -ne 0) { throw ($result -join "`n") }
    return $result -join "`n"
}
function Invoke-ZhCheck([string]$SourceRoot, [string]$AppDir, [string]$StateRoot, [string]$CatalogPath = '', [switch]$Offline, [switch]$PreferCache, [switch]$CloseRunningApp) {
    [IO.Directory]::CreateDirectory($StateRoot) | Out-Null
    $lock = $null
    try {
        try { $lock = [IO.File]::Open((Join-Path $StateRoot 'assistant-update.lock'), [IO.FileMode]::OpenOrCreate, [IO.FileAccess]::ReadWrite, [IO.FileShare]::None) }
        catch { return [PSCustomObject]@{ state='Busy'; message='另一项汉化检查正在进行，请稍后再试。'; appVersion=''; libraryVersion='' } }
        $appVersion = Get-ZhAppVersion $AppDir
        $current = Test-ZhInstaller $SourceRoot
        $catalog = Get-ZhCatalog $StateRoot $SourceRoot $CatalogPath -Offline:$Offline -PreferCache:$PreferCache
        $selected = @(Select-ZhLibrary $catalog.Data $appVersion)
        # Installer code is a separately versioned, hash-checked package. A staged
        # installer takes over only after this operation releases its file lock.
        if ([version]$catalog.Data.installer.version -gt [version]$current.version) {
            $newRoot = Get-ZhPackage $catalog.Data.installer $StateRoot 'installer' $catalog.LocalDirectory -Offline:$Offline
            $handoff = Set-ZhStatus $StateRoot 'InstallerUpdate' '安装器更新已校验，正在切换到新版本。' $appVersion
            $handoff | Add-Member NoteProperty InstallerRoot $newRoot
            return $handoff
        }
        if ($selected.Count -eq 0) {
            if ($catalog.Fresh) { return Set-ZhStatus $StateRoot 'Unsupported' "Freebuff $appVersion 的汉化尚未更新，请等待更新，或通过 Issue 反馈。" $appVersion '' $true }
            return Set-ZhStatus $StateRoot 'NetworkError' "本地没有适配 Freebuff $appVersion 的翻译库，且未能确认 GitHub 最新清单。请稍后重试，或查看发布页面。" $appVersion
        }
        $item = $selected[0]
        if ([version]$item.minInstallerVersion -gt [version]$current.version) { throw '此翻译库需要新版安装器，但兼容清单没有提供可用安装器。' }
        $manifestPath = Join-Path $StateRoot 'manifest.json'
        if (Test-Path -LiteralPath $manifestPath) {
            $previous = Read-ZhJson $manifestPath
            if ((Get-ZhValue $previous 'Installed' $false) -and $previous.AppVersion -ceq $appVersion -and [version]$previous.PatchVersion -gt [version]$item.version) {
                $previousRoot = Join-Path (Join-Path $StateRoot 'libraries') $previous.PatchVersion
                $previousLibrary = Test-ZhLibrary $previousRoot $previous.PatchVersion
                if (@($previousLibrary.appVersions) -cnotcontains $appVersion -or
                    (Get-ZhHash (Join-Path $AppDir 'resources\orchestrator\ui\assets\freebuff-zh-cn.js')) -cne $previousLibrary.files.'freebuff-zh-cn.js' -or
                    (Get-ZhHash (Join-Path $AppDir 'resources\orchestrator\ui\index.html')) -cne $previous.PatchedIndexHash -or
                    (Get-ZhHash (Join-Path $AppDir 'resources\app.asar')) -cne $previous.PatchedAppAsarHash) { throw '本机较新的翻译库状态不完整，已停止自动更新以保留现有文件。' }
                return Set-ZhStatus $StateRoot 'Current' "本机已有较新的匹配翻译库 $($previous.PatchVersion)，保留当前版本，不自动降级。" $appVersion $previous.PatchVersion $catalog.Fresh
            }
        }
        $libraryRoot = Get-ZhPackage $item $StateRoot 'library' $catalog.LocalDirectory -Offline:$Offline
        $library = Test-ZhLibrary $libraryRoot $item.version
        if (@($library.appVersions) -cnotcontains $appVersion -or [version]$library.minInstallerVersion -gt [version]$current.version) { throw '翻译库实际内容与版本选择结果不匹配。' }
        # Confirm the executable did not update during download.
        if ((Get-ZhAppVersion $AppDir) -cne $appVersion) { return Set-ZhStatus $StateRoot 'AppChanged' 'Freebuff 在检查期间又更新了，下一次检查将重新匹配。' (Get-ZhAppVersion $AppDir) }
        $installedPath = Join-Path $AppDir 'resources\orchestrator\ui\assets\freebuff-zh-cn.js'
        if (Test-Path -LiteralPath $manifestPath) {
            $manifest = Read-ZhJson $manifestPath
            if ((Get-ZhValue $manifest 'Installed' $false) -and (Get-ZhValue $manifest 'AppVersion') -ceq $appVersion -and
                (Get-ZhValue $manifest 'PatchVersion') -ceq $item.version -and
                (Get-ZhValue $manifest 'InstallerVersion') -ceq $current.version -and
                (Test-Path -LiteralPath $installedPath) -and (Get-ZhHash $installedPath) -ceq $library.files.'freebuff-zh-cn.js' -and
                [string]$manifest.MainAssetName -cmatch '^[A-Za-z0-9][A-Za-z0-9._-]*\.js$' -and
                (Get-ZhHash (Join-Path (Join-Path $AppDir 'resources\orchestrator\ui\assets') $manifest.MainAssetName)) -ceq $manifest.MainAssetHash -and
                (Get-ZhHash (Join-Path $AppDir 'resources\orchestrator\ui\index.html')) -ceq $manifest.PatchedIndexHash -and
                (Get-ZhHash (Join-Path $AppDir 'resources\app.asar')) -ceq $manifest.PatchedAppAsarHash) {
                return Set-ZhStatus $StateRoot 'Current' "已安装匹配的翻译库 $($item.version)，Freebuff $appVersion 可正常使用汉化。" $appVersion $item.version $catalog.Fresh
            }
        }
        if (-not $CloseRunningApp -and @(Get-Process -Name Freebuff -ErrorAction SilentlyContinue).Count -gt 0) {
            return Set-ZhStatus $StateRoot 'Pending' "适配 Freebuff $appVersion 的翻译库 $($item.version) 已下载并校验。请退出 Freebuff，助手会自动应用。" $appVersion $item.version $catalog.Fresh
        }
        try { [void](Invoke-ZhEngine $SourceRoot $libraryRoot $AppDir $StateRoot 'Install' -CloseRunningApp:$CloseRunningApp) }
        catch {
            if ($_.Exception.Message.Contains('Freebuff 正在运行')) {
                return Set-ZhStatus $StateRoot 'Pending' '翻译库已准备好。Freebuff 尚未退出，退出后会自动应用。' $appVersion $item.version $catalog.Fresh
            }
            throw
        }
        return Set-ZhStatus $StateRoot 'Applied' "已为 Freebuff $appVersion 应用翻译库 $($item.version)，重新打开应用即可。" $appVersion $item.version $catalog.Fresh
    } catch {
        return Set-ZhStatus $StateRoot 'Failed' ("检查或应用未完成：" + $_.Exception.Message) $(if ($AppDir) { try { Get-ZhAppVersion $AppDir } catch { '' } } else { '' })
    } finally { if ($null -ne $lock) { $lock.Dispose() } }
}
function Get-ZhCommand([string]$Script, [string]$StateRoot, [string]$AppDir, [string]$Action = 'Watch') {
    foreach ($value in @($Script,$StateRoot,$AppDir)) { if ($value.Contains('"') -or $value.Contains("`n") -or $value.Contains("`r")) { throw '启动参数包含无效字符。' } }
    return '-NoLogo -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "' + $Script.TrimEnd('\') + '" -Action ' + $Action + ' -StateDir "' + $StateRoot.TrimEnd('\') + '" -AppDir "' + $AppDir.TrimEnd('\') + '"'
}
function Set-ZhStartup([string]$SourceRoot, [string]$AppDir, [string]$StateRoot, [bool]$Enabled) {
    $metadata = Test-ZhInstaller $SourceRoot
    $config = [ordered]@{ enabled=$Enabled; appDir=$AppDir; installerVersion=$metadata.version; installerRoot=$SourceRoot; pollSeconds=60; checkHours=6 }
    $key = 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Run'
    $previous = if (Test-Path -LiteralPath $key) { [string](Get-ZhValue (Get-ItemProperty -Path $key) 'FreebuffZhAssistant' '') } else { '' }
    try {
        if ($Enabled) {
            if (-not (Test-Path -LiteralPath $key)) { New-Item -Path $key -Force | Out-Null }
            $powershell = Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0\powershell.exe'
            $command = '"' + $powershell + '" ' + (Get-ZhCommand (Join-Path $SourceRoot 'FreebuffZhSetup.ps1') $StateRoot $AppDir)
            New-ItemProperty -Path $key -Name 'FreebuffZhAssistant' -Value $command -PropertyType String -Force | Out-Null
        } elseif ($previous -and $previous.Contains((Join-Path $StateRoot 'assistant\versions'))) {
            Remove-ItemProperty -Path $key -Name 'FreebuffZhAssistant'
        }
        Write-ZhJson $config (Join-Path $StateRoot 'assistant-config.json')
    } catch {
        try {
            if ($previous) { New-ItemProperty -Path $key -Name 'FreebuffZhAssistant' -Value $previous -PropertyType String -Force | Out-Null }
            elseif (Test-Path -LiteralPath $key) { Remove-ItemProperty -Path $key -Name 'FreebuffZhAssistant' -ErrorAction SilentlyContinue }
        } catch { }
        throw
    }
}
function Start-ZhWatcher([string]$SourceRoot, [string]$StateRoot, [string]$AppDir) {
    $arguments = Get-ZhCommand (Join-Path $SourceRoot 'FreebuffZhSetup.ps1') $StateRoot $AppDir
    Start-Process -FilePath (Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0\powershell.exe') -ArgumentList $arguments -WindowStyle Hidden | Out-Null
}
function Show-ZhNotice($Status) {
    Add-Type -AssemblyName System.Windows.Forms
    Add-Type -AssemblyName System.Drawing
    $form = New-Object Windows.Forms.Form
    $form.Text = 'Freebuff 汉化更新助手'; $form.Size = New-Object Drawing.Size(520,225); $form.StartPosition = 'CenterScreen'
    $label = New-Object Windows.Forms.Label; $label.Text = [string]$Status.message; $label.Location = New-Object Drawing.Point(20,20); $label.Size = New-Object Drawing.Size(465,90)
    $release = New-Object Windows.Forms.Button; $release.Text = '查看发布'; $release.Location = New-Object Drawing.Point(20,125); $release.Width = 130
    $release.Add_Click({ Start-Process 'https://github.com/Kfowever/freebuff-zh-patch/releases/latest' })
    $issue = New-Object Windows.Forms.Button; $issue.Text = '反馈 Issue'; $issue.Location = New-Object Drawing.Point(170,125); $issue.Width = 130
    $version = [uri]::EscapeDataString([string](Get-ZhValue $Status 'appVersion' ''))
    $url = 'https://github.com/Kfowever/freebuff-zh-patch/issues/new?title=' + [uri]::EscapeDataString('[适配] Freebuff ') + $version
    $issue.Add_Click({ Start-Process $url }.GetNewClosure())
    $close = New-Object Windows.Forms.Button; $close.Text = '关闭'; $close.Location = New-Object Drawing.Point(320,125); $close.Width = 130; $close.Add_Click({ $form.Close() }.GetNewClosure())
    $form.Controls.AddRange(@($label,$release,$issue,$close))
    try { [void]$form.ShowDialog() } finally { $form.Dispose() }
}

Export-ModuleMember -Function *-Zh*
