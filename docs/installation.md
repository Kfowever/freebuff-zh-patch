# 高级安装与安全检查

日常使用只需完整解压后双击 `一键汉化.cmd`；还原时双击 `还原英文.cmd`。源码中的英文命名入口 `Install-Freebuff-Zh.cmd`、`Restore-Freebuff-Zh.cmd` 功能相同，保留供旧快捷方式使用。Release ZIP 仅保留中文入口，便于查找。

## 命令行

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File ".\FreebuffZhPatch.ps1" -Action Install
powershell -NoProfile -ExecutionPolicy Bypass -File ".\FreebuffZhPatch.ps1" -Action Status
powershell -NoProfile -ExecutionPolicy Bypass -File ".\FreebuffZhPatch.ps1" -Action Restore
```

可用 `-AppDir "D:\Apps\Freebuff"` 指定安装目录，`-StateDir` 指定备份和清单目录。指定过自定义状态目录后，后续更新与还原也必须使用同一目录。

不指定 `-AppDir` 时，安装器先检查默认目录，再检查当前用户和系统的卸载记录。双击入口带有 `-Interactive`：未找到安装位置时可选择已有的 `Freebuff.exe`，不要选择下载的安装包。

双击入口同时带有 `-CloseRunningApp`，只对目标安装目录的 Freebuff 请求正常关闭，最多等待 20 秒；若仍未退出或检测到其他位置的副本，安全停止，不强杀进程。直接调用 PowerShell 时默认要求你先手动退出应用。

## 非匹配版本

未适配版本默认不安装，必须在风险提示后输入单独的 `y` 或 `Y` 才会继续。空输入、其他输入或非交互环境均取消，退出码为 `3`；旧版 `-Force` 参数也不能跳过确认。

该确认只绕过版本号限制，不绕过资源布局、进程、文件、备份或哈希校验。不兼容版本可能出现漏翻、错位、乱码、界面异常或启动失败。

## 文件与回滚

补丁修改界面入口、独立译文资源及 `app.asar` 中等字节长度的启动提示，不修改 `Freebuff.exe`。原始文件备份位于 `%LOCALAPPDATA%\FreebuffZhPatch`，并记录 SHA-256；刷新、还原前会核对备份与当前文件。

检测到文件漂移、不完整安装或跨版本残留时会停止。自动回滚若未完成，会保留恢复副本并显示位置，避免继续覆盖。不要删除备份清单或手动将旧版 ASAR 写回新版应用。

可在 Release 下载 ZIP 对应的 `.sha256`，用 `Get-FileHash` 校验下载文件。安装器本身不联网，也不读取或保存 Freebuff、GitHub 的令牌与密码。

## 在线工作区

0.10.0 适配 0.0.196 的在线工作区：在原有备份和等字节替换范围内增加加载完成钩子，从本机读取同一译文脚本，仅允许 Freebuff 官方配置的三个 HTTPS 来源（freebuff.com、staging-auth.freebuff.com、staging-2-auth.freebuffweb.site）。第三方页面与嵌入视图不会注入，不更改应用的登录、隔离或权限策略。还原会一并移除钩子。
