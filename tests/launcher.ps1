[CmdletBinding()]
param([string]$TestRoot = (Join-Path ([IO.Path]::GetTempPath()) ('freebuff-zh-launcher-' + [guid]::NewGuid().ToString('N'))))
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
$utf8 = New-Object Text.UTF8Encoding($false)
$bom = New-Object Text.UTF8Encoding($true)
$script:assertions = 0
function Assert([bool]$value, [string]$message) {
    if (-not $value) { throw "FAILED: $message. Evidence: $TestRoot" }
    $script:assertions++
}
if (Test-Path -LiteralPath $TestRoot) { throw 'Use a fresh test directory.' }
New-Item -ItemType Directory -Path $TestRoot | Out-Null
$engine = [IO.File]::ReadAllText((Join-Path $repo 'FreebuffZhPatch.ps1'))
$tokens = $null; $errors = $null
$ast = [Management.Automation.Language.Parser]::ParseInput($engine, [ref]$tokens, [ref]$errors)
Assert ($errors.Count -eq 0) 'installer parses in Windows PowerShell 5.1'
# Load only functions, never the production main block or the user's app.
foreach ($name in @('Get-PropertyValue', 'Find-FreebuffDirectory', 'Assert-FreebuffStopped')) {
    $node = $ast.Find({ param($n) $n -is [Management.Automation.Language.FunctionDefinitionAst] -and $n.Name -eq $name }.GetNewClosure(), $true)
    Invoke-Expression $node.Extent.Text
}
$app = Join-Path $TestRoot '自定义 & 空格\app'
New-Item -ItemType Directory -Path $app -Force | Out-Null
[IO.File]::WriteAllText((Join-Path $app 'Freebuff.exe'), '', $utf8)
$originalLocal = $env:LOCALAPPDATA
$Interactive = $false
try {
    $env:LOCALAPPDATA = Join-Path $TestRoot 'empty-local'
    function Get-ItemProperty { param($Path, $ErrorAction) [PSCustomObject]@{ DisplayName='Freebuff'; DisplayIcon=('"' + (Join-Path $app 'Freebuff.exe') + '",0') } }
    Assert ((Find-FreebuffDirectory) -eq $app) 'quoted registry executable with icon index discovers a custom directory'
    function Get-ItemProperty { param($Path, $ErrorAction) [PSCustomObject]@{ DisplayName='Unrelated App'; InstallLocation=$app } }
    $blocked = $false
    try { Find-FreebuffDirectory | Out-Null } catch { $blocked = $_.Exception.Message.Contains('没有找到已安装的 Freebuff') }
    Assert $blocked 'unrelated registry entries and noninteractive missing install are rejected'
} finally { $env:LOCALAPPDATA = $originalLocal }
Remove-Item Function:\Get-ItemProperty

$ExePath = Join-Path $app 'Freebuff.exe'
$CloseRunningApp = $true
$script:closed = $false
$script:fakeRunning = $true
$fake = [PSCustomObject]@{ Path=$ExePath; MainWindowHandle=[IntPtr]1 }
$fake | Add-Member ScriptMethod CloseMainWindow { $script:closed=$true; $script:fakeRunning=$false; return $true }
function Get-Process { param($Name, $ErrorAction) if ($script:fakeRunning) { $fake } }
Assert-FreebuffStopped
Assert $script:closed 'one-click installation requests a normal close'
$script:fakeRunning = $true; $script:closed = $false
$fake.Path = Join-Path $TestRoot 'another\Freebuff.exe'
$blocked = $false
try { Assert-FreebuffStopped } catch { $blocked = $_.Exception.Message.Contains('另一个位置') }
Assert ($blocked -and -not $script:closed) 'another installation is neither closed nor patched'
$fake.Path = $ExePath
$CloseRunningApp = $false
$blocked = $false
try { Assert-FreebuffStopped } catch { $blocked = $_.Exception.Message.Contains('Freebuff 正在运行') }
Assert ($blocked -and -not $script:closed) 'direct PowerShell calls retain the stop guard'
Assert ($engine -notmatch '\bStop-Process\b|\.Kill\(') 'shipping installer never force-kills the app'
Remove-Item Function:\Get-Process

# Run actual CMD entry points from a Chinese path with spaces and ampersands.
# Replace the engine only in this fixture with a recorder to verify argument flow,
# UTF-8 output and propagation of success, cancellation, and failure exit codes.
$entry = Join-Path $TestRoot '中文 & launcher'
New-Item -ItemType Directory -Path $entry | Out-Null
$stub = @'
param([string]$Action, [switch]$Interactive, [string]$AppDir, [int]$Result=0)
[Console]::OutputEncoding = New-Object Text.UTF8Encoding($false)
if (-not $Interactive -or $AppDir -ne '带空格 & 路径') { exit 90 }
Write-Host "中文入口参数正确：$Action"
exit $Result
'@
[IO.File]::WriteAllText((Join-Path $entry 'FreebuffZhSetup.ps1'), $stub, $bom)
foreach ($name in @('安装.cmd', '恢复英文.cmd', 'Install-Freebuff-Zh.cmd', 'Restore-Freebuff-Zh.cmd')) {
    Copy-Item -LiteralPath (Join-Path $repo $name) -Destination $entry
    foreach ($code in @(0, 1, 3)) {
        $info = New-Object Diagnostics.ProcessStartInfo
        $info.FileName = $env:ComSpec
        $info.Arguments = '/d /c ""' + (Join-Path $entry $name) + '" -AppDir "带空格 & 路径" -Result ' + $code + '"'
        $info.UseShellExecute = $false; $info.CreateNoWindow = $true
        $info.RedirectStandardOutput = $true; $info.RedirectStandardError = $true
        $info.StandardOutputEncoding = $utf8; $info.StandardErrorEncoding = $utf8
        $info.EnvironmentVariables['FREEBUFF_ZH_NO_PAUSE'] = '1'
        $p = [Diagnostics.Process]::Start($info)
        $out = $p.StandardOutput.ReadToEndAsync(); $err = $p.StandardError.ReadToEndAsync()
        if (-not $p.WaitForExit(15000)) { $p.Kill(); throw 'Fixture CMD timed out.' }
        $output = $out.Result + $err.Result
        $exit = $p.ExitCode; $p.Dispose()
        [IO.File]::WriteAllText((Join-Path $entry ($name + '-' + $code + '.log')), $output, $utf8)
        Assert ($exit -eq $code) "$name preserves exit code $code : $output"
        Assert ($output.Contains('中文入口参数正确')) "$name forwards Unicode arguments and required switches"
        Assert ($output.Contains($(if ($code -eq 0) { '操作完成' } else { '操作未完成' }))) "$name reports result in Chinese"
    }
}
Write-Output "PASS: $script:assertions launcher and safeguard assertions. Evidence: $TestRoot"
