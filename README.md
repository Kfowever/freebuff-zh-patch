# Freebuff Desktop 简体中文汉化补丁 / Simplified Chinese Localization Patch

适用于 Freebuff Windows 桌面版的非官方简体中文汉化补丁（中文语言包 / Simplified Chinese localization patch），提供 Freebuff Desktop 中文界面，不包含 Freebuff 本体。

如果你正在寻找 **Freebuff 中文版、Freebuff 汉化、Freebuff Windows 中文补丁、Freebuff Chinese localization**，本项目提供一键安装、自动备份与一键恢复英文的 Windows 汉化方案。

## 兼容性

- 补丁版本：`0.6.1`
- 支持版本：**Windows 桌面版 Freebuff 0.0.109.0**
- 仅适用于 Windows 桌面版；不支持网页版、macOS 或 Linux，其他 Freebuff 版本未经验证。

## 0.5.0 更新

- 适配 Freebuff `0.0.93.0`，保留 0.4.1 既有译文。
- 新增 Freebucks、构建/计划模式、计划审批、连接器和新版目标投入档位翻译。
- 延续版本不一致时的二次确认强制安装、独立备份和哈希回滚保护。

## 下载与安装

从 [GitHub Releases](https://github.com/Kfowever/freebuff-zh-patch/releases/latest) 下载 `Freebuff-Zh-Patch-0.6.1.zip`，完整解压并关闭 Freebuff，然后运行：

- `Install-Freebuff-Zh.cmd`：一键安装或刷新。
- `Restore-Freebuff-Zh.cmd`：一键还原安装前的官方文件。

也可在 PowerShell 中执行：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File ".\FreebuffZhPatch.ps1" -Action Install
powershell -NoProfile -ExecutionPolicy Bypass -File ".\FreebuffZhPatch.ps1" -Action Status
powershell -NoProfile -ExecutionPolicy Bypass -File ".\FreebuffZhPatch.ps1" -Action Restore
```

## 强制安装

Freebuff 版本与 `0.0.109.0` 不一致时，一键安装会直接显示兼容性警告。只有再次输入单独的 `y` 或 `Y` 才会继续；其他输入、空输入和非交互输入都会取消并返回退出码 `3`。

旧调用中的 `-Force` 参数仍然可用，但不能跳过上述确认。强制安装只绕过版本号限制，不能绕过文件缺失、未知 ASAR 布局、残留的跨版本补丁、进程占用、备份或哈希检查。使用不兼容版本可能造成中文缺失、错位、乱码、界面异常或启动失败。

## 安全与隐私

- 安装前自动备份 `index.html` 和 `app.asar` 到 `%LOCALAPPDATA%\FreebuffZhPatch`；还原不会把旧版 ASAR 写回新版 Freebuff。
- 补丁只修改界面入口、补丁资源和启动提示，不修改 `Freebuff.exe`、项目、会话或账号数据。
- 补丁不联网、不上传文件，也不读取或保存 GitHub、Freebuff 的令牌与密码。
- 安装器不需要管理员权限，并会校验版本、marker、资源、备份和 SHA-256 哈希。
- 翻译层跳过聊天正文、代码、差异、终端和笔记正文，避免改动用户内容。

## 已知边界

远程模型、工具、插件和第三方终端产生的动态英文不保证翻译；品牌名、模型名、命令、文件名和路径保持原文。

## 许可证

本项目采用 [MIT License](LICENSE)。Freebuff 及其商标、软件版权归其各自权利人所有。