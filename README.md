# Freebuff Desktop 简体中文补丁

适用于 Freebuff Windows 桌面版的非官方简体中文界面补丁，不包含 Freebuff 本体。

## 兼容性

- 补丁版本：`0.4.0`
- 支持版本：**Windows 桌面版 Freebuff 0.0.64.0**
- 不支持网页版、macOS、Linux 或其他 Freebuff 版本。

## 0.4.0 更新

- 支持版本由 Freebuff `0.0.63.0` 更新为 `0.0.64.0`，保留 0.3.0 的既有译文。
- 新增“目标”（Mission）、投入程度、自动推进、队列暂停、标签页及新版错误提示。
- 补齐模型选择弹窗、国家/网络限制、模型暂停原因和邀请奖励的多状态文案。
- 一键安装现可在版本不一致时进入强制安装确认，并支持从旧清单安全迁移到新的备份链。

## 下载与安装

从 [GitHub Releases](https://github.com/Kfowever/freebuff-zh-patch/releases/latest) 下载 `Freebuff-Zh-Patch-0.4.0.zip`，完整解压并关闭 Freebuff，然后运行：

- `Install-Freebuff-Zh.cmd`：一键安装或刷新。
- `Restore-Freebuff-Zh.cmd`：一键还原安装前的官方文件。

也可在 PowerShell 中执行：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File ".\FreebuffZhPatch.ps1" -Action Install
powershell -NoProfile -ExecutionPolicy Bypass -File ".\FreebuffZhPatch.ps1" -Action Status
powershell -NoProfile -ExecutionPolicy Bypass -File ".\FreebuffZhPatch.ps1" -Action Restore
```

## 强制安装

Freebuff 版本与 `0.0.64.0` 不一致时，一键安装会直接显示兼容性警告。只有再次输入单独的 `y` 或 `Y` 才会继续；其他输入、空输入和非交互输入都会取消并返回退出码 `3`。

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

> 小提醒：Freebuff 目前暂时不支持 DeepSeek V4 Flash 07/31 模型。
