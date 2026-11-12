# 高级用法与发布维护

## 日常入口

`安装.cmd` 安装或更新助手；`检查更新.cmd` 检查匹配版本；`查看状态.cmd` 查看状态；`关闭自动更新.cmd` 关闭后台检查与登录启动；`恢复英文.cmd` 先关闭自动更新，再还原文件。源码中仍保留旧英文入口。

首次安装将程序复制到 `%LOCALAPPDATA%\FreebuffZhPatch\assistant\versions\安装器版本`，翻译库放在 `libraries\翻译库版本`。登录启动只使用当前用户 `HKCU\Software\Microsoft\Windows\CurrentVersion\Run` 中的 `FreebuffZhAssistant`，不需要管理员权限。关闭后，驻留进程在一分钟内退出。历史程序、翻译库和应用备份均保留。

后台每 60 秒检测应用版本；启动时和每 6 小时检查 GitHub，新版本或待应用更新会提前处理。联网或应用检查失败后约 10 分钟重试。应用运行中只下载、校验并显示提示，退出后再应用，不强杀进程。点击通知可查看中文说明和发布、Issue 入口；不会自动提交 Issue。

## 命令行

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\FreebuffZhSetup.ps1 -Action Install
powershell -NoProfile -ExecutionPolicy Bypass -File .\FreebuffZhSetup.ps1 -Action Check
powershell -NoProfile -ExecutionPolicy Bypass -File .\FreebuffZhSetup.ps1 -Action Status
powershell -NoProfile -ExecutionPolicy Bypass -File .\FreebuffZhSetup.ps1 -Action Disable
powershell -NoProfile -ExecutionPolicy Bypass -File .\FreebuffZhSetup.ps1 -Action Enable
powershell -NoProfile -ExecutionPolicy Bypass -File .\FreebuffZhSetup.ps1 -Action Restore
```

`-AppDir` 指定安装位置，`-StateDir` 指定独立状态与备份目录；后续调用须使用同一状态目录。`-Interactive` 启用位置选择和状态窗口，`-Offline` 只使用本地兼容清单和缓存；缺少所需包时仍需先提供包。`-CatalogPath` 可显式选择本地兼容清单，同目录的匹配 ZIP 会优先读取并校验，用于离线维护和测试。日常用户无需这些参数。

底层 `FreebuffZhPatch.ps1 -Action Install|Restore|Status -LibraryDir 路径` 只处理本机文件，不联网；默认库位于旁边的 `library` 目录。保留旧版 `-Force` 交互确认供人工排查，**更新助手从不使用此开关**。直接使用底层引擎前应关闭自动更新，以免与后台操作并发。

如需在未列入兼容清单的版本上手动尝试，先退出 Freebuff，在解压后的安装包目录打开 PowerShell 并运行：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\FreebuffZhPatch.ps1 -Action Install -Force -Interactive
```

版本不匹配时，输入 `y` 确认。文件结构、校验、备份和回滚检查照常执行。恢复英文时，在同一目录运行：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\FreebuffZhPatch.ps1 -Action Restore -Interactive
```

## 版本与校验

- `installer.json`：安装器版本及文件 SHA-256。安装器包含助手、安装引擎和中文入口，不包含翻译库。
- `library/library.json`：翻译库版本、最低安装器版本、明确兼容的四段应用版本及文件 SHA-256。
- `library/profiles/应用版本.json`：应用结构适配数据，启动和在线工作区的替换文本须保持相同 UTF-8 字节长度；界面译文位于 `library/freebuff-zh-cn.js`。
- `compatibility.json`：仓库发布清单，列出安装器及各翻译库的版本、GitHub Release URL、大小、ZIP 哈希、内部版本清单哈希和支持版本。只在明确相等的应用版本中选择最新库。

更新助手仅接受本项目 GitHub Releases 的 HTTPS 包地址，验证下载大小、SHA-256、内部版本和文件哈希；解压仅允许规定文件，拒绝目录穿越、链接和重复条目。程序与库使用独立版本目录，校验后才提升为可用版本，保留旧目录。新版安装器先运行检查流程，通过后才切换登录启动入口；未通过时保留旧安装器。库不匹配、下载中断、校验错误、应用再次更新或备份链异常时，不写入不匹配补丁。

兼容清单使用本项目的 HTTPS 主分支地址，不需要 GitHub 登录或令牌。无法联网时优先使用校验通过的缓存；未知版本与过期清单不能据此断言远端没有更新。当前版本较新时不自动降级。

## 打包与发布

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tools\package.ps1 -ReleaseVersion 新发行版号 -OutputDir 新的输出目录 -SigningKey 私钥路径
```

发行版号、安装器版本和翻译库版本独立管理。仅更新翻译或适配数据时，递增翻译库版本并更新库内文件哈希，再用新的发行版号打包。工具按已签名的清单校验并复用原安装器，兼容清单继续引用原安装器的下载地址和哈希。可用 `-InstallerDirectory` 指定保存原安装器 ZIP 的目录以离线打包。

工具始终生成一个整合安装包、翻译库、校验文件和签名清单。安装脚本或入口发生变化时，递增安装器版本再生成独立安装器 ZIP。整合包沿用原安装器里的说明文件，最新支持版本见项目 README 和发行说明。

正式发行版上传 `用户下载` 中的单个 ZIP。将 `自动更新` 中本次生成的附件上传至 `updates-v发行版号` 预发布资源页，标题注明“无需手动下载”。根目录的 `release-notes.md` 包含简短说明和下载链接。

打包必须用 `-SigningKey 私钥路径` 或环境变量 `FREEBUFF_ZH_SIGNING_KEY` 提供与助手内置公钥对应的 RSA 私钥。私钥只保留在本地安全位置，不得提交；发布清单同时提供 `compatibility.json.sig`，主分支中的清单和签名需一起更新。签名针对文件原始 UTF-8 字节，发布时不得重新排版。

清单与 ZIP 依次尝试官方线路、[ghfast](https://ghfast.top/)、[GH-Proxy](https://gh-proxy.com/docs/quick-start)。连接 8 秒无响应、读取停顿 5 秒、传输达到 8 秒后平均速度低于 16 KiB/s，或总传输超过 60 秒时，会中止该线路并尝试下一条；签名、大小或哈希不匹配也会继续尝试。清单无论来自哪条线路都必须通过内置公钥验证，ZIP 均按清单哈希验证。所有线路失败后使用已验证缓存，缓存也不足才提示失败；镜像仅收到公开文件 URL，不传递 GitHub 令牌或账号数据。

发布时先上传 ZIP 和校验文件，确认可下载，再发布对应兼容清单。不要先更新清单再上传包。安装器版本从引擎的 `InstallerVersion` 读取，库版本独立管理。未发布到 GitHub 时，只能验证本地清单和包；在线下载后续版本需等待清单与附件正式发布。

## 文件安全

底层引擎修改界面入口、独立译文资源和 ASAR 内等字节长度的已知标记，不修改 Freebuff.exe、项目或会话数据。备份仍使用原来的 `manifest.json` 与 `backups` 目录，旧版汉化可原地升级。还原核对应用版本、备份及当前文件哈希；回滚不完整时保留恢复副本。不要将旧版 ASAR 写回新版应用。
