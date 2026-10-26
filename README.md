# Freebuff 汉化补丁 · Windows 简体中文界面

[![Latest release](https://img.shields.io/github/v/release/Kfowever/freebuff-zh-patch)](https://github.com/Kfowever/freebuff-zh-patch/releases/latest)
[![Platform: Windows](https://img.shields.io/badge/platform-Windows-blue)](#兼容性)
[![License: MIT](https://img.shields.io/github/license/Kfowever/freebuff-zh-patch)](LICENSE)

为 **Freebuff Desktop Windows 桌面版**提供简体中文界面的非官方汉化补丁。适合需要 **Freebuff 汉化、Freebuff 中文版界面、Freebuff 中文语言包**的用户，支持一键安装、自动备份和还原英文，不包含 Freebuff 本体。

**[下载最新中文补丁](https://github.com/Kfowever/freebuff-zh-patch/releases/latest) · [安装说明](#下载与安装) · [反馈漏翻](https://github.com/Kfowever/freebuff-zh-patch/issues/new/choose)**

Unofficial **Simplified Chinese localization patch for Freebuff Desktop on Windows**. Includes one-click installation, verified backups, and restore. Also searchable as Freebuff Chinese translation, Freebuff zh-CN language pack, or Freebuff 汉化。

## 能翻译哪些界面？

- 聊天导航、输入框提示、目标模式、工具操作及常见通知。
- 账户、用量、每日小时额度、钱包、订阅和模型说明。
- 项目、技能、集成、模型服务商、外观、快捷键和更新设置。
- 文件、差异、终端等面板的界面控件；聊天正文、项目代码及输入内容保持原样。

## 兼容性

- 补丁版本：`0.8.2`
- 支持版本：**Windows 桌面版 Freebuff 0.0.190.0**
- 仅适用于 Windows 桌面版；不支持网页版、macOS 或 Linux，其他 Freebuff 版本未经验证。

## 0.8.2 更新

- 修复每日小时额度和钱包的完整悬浮说明，组合翻译额度、连续使用奖励、刷新状态及 Freebucks 换算说明。
- 覆盖单复数、千位分隔和套餐奖励组合，保留原数值及模型名称；未知的新说明格式保留原文。

## 0.8.1 更新

- 补齐聊天分组、浏览器和更新导航、Discord 订阅状态、账户连接提示及网页管理等短标签和中英混排。
- 支持新版 contenteditable 输入框的可见提示和无障碍提示，保留输入正文及输入值。
- 修复默认新聊天标题、仅聊天模式、移除项目通知，以及用量页分裂文本、小时余额和时间单位显示。

## 0.8.0 更新

- 适配 Freebuff `0.0.190.0`，保留原有译文，补充新版小时额度、模型说明、聊天和目标模式、主题、快捷键、站点管理、集成与服务商设置。
- 安装器支持新版 `/assets/...` 入口，并保持补丁资源在深层页面路径下可加载；继续支持旧版 `./assets/...` 布局。
- 补充新版任务和项目名称、推理摘要、问答选项、文件编辑器及差异视图的内容保护。
- 延续版本不一致时的二次确认、独立备份、文件哈希校验及失败回滚。批量文案由 Luna 子代理翻译，并经合并复核。

## 下载与安装

从 [GitHub Releases](https://github.com/Kfowever/freebuff-zh-patch/releases/latest) 下载 `Freebuff-Zh-Patch-0.8.2.zip`，完整解压并关闭 Freebuff，然后运行：

- `Install-Freebuff-Zh.cmd`：一键安装或刷新。
- `Restore-Freebuff-Zh.cmd`：一键还原安装前的官方文件。

也可在 PowerShell 中执行：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File ".\FreebuffZhPatch.ps1" -Action Install
powershell -NoProfile -ExecutionPolicy Bypass -File ".\FreebuffZhPatch.ps1" -Action Status
powershell -NoProfile -ExecutionPolicy Bypass -File ".\FreebuffZhPatch.ps1" -Action Restore
```

## 强制安装

Freebuff 版本与 `0.0.190.0` 不一致时，一键安装会直接显示兼容性警告。只有再次输入单独的 `y` 或 `Y` 才会继续；其他输入、空输入和非交互输入都会取消并返回退出码 `3`。

旧调用中的 `-Force` 参数仍然可用，但不能跳过上述确认。强制安装只绕过版本号限制，不能绕过文件缺失、未知 ASAR 布局、残留的跨版本补丁、进程占用、备份或哈希检查。使用不兼容版本可能造成中文缺失、错位、乱码、界面异常或启动失败。

## 安全与隐私

- 安装前自动备份 `index.html` 和 `app.asar` 到 `%LOCALAPPDATA%\FreebuffZhPatch`；还原不会把旧版 ASAR 写回新版 Freebuff。
- 补丁只修改界面入口、补丁资源和启动提示，不修改 `Freebuff.exe`、项目、会话或账号数据。
- 补丁不联网、不上传文件，也不读取或保存 GitHub、Freebuff 的令牌与密码。
- 安装器不需要管理员权限，并会校验版本、marker、资源、备份和 SHA-256 哈希。
- 翻译层跳过聊天正文、代码、差异、终端和笔记正文，避免改动用户内容。

## 已知边界

远程模型、工具、插件和第三方终端产生的动态英文不保证翻译；品牌名、模型名、命令、文件名和路径保持原文。

## 常见问题

### Freebuff 有中文版吗？

本项目为 Freebuff Windows 桌面版提供非官方简体中文汉化方案，安装后显示中文界面。请先安装 [Freebuff 官方桌面版](https://freebuff.com/)，再安装与应用版本相匹配的中文补丁。

### Freebuff 更新后汉化失效怎么办？

应用更新可能替换已汉化的资源。先在本页核对支持版本，再从 Releases 下载对应补丁重新安装；不要把旧版本备份直接写回新版本应用。版本尚未适配时可在 Issues 中反馈。

### 能在 macOS、Linux 或网页版上使用吗？

当前安装器仅支持 Windows 桌面版。其他平台请勿直接运行本安装器。

### 还有英文、漏翻或中英混排怎么办？

请通过 [漏翻反馈表](https://github.com/Kfowever/freebuff-zh-patch/issues/new/choose) 提供 Freebuff 版本、补丁版本、界面位置和英文原文。截图请遮盖邮箱、密钥、聊天内容等个人信息。欢迎按 [贡献说明](CONTRIBUTING.md) 提交翻译修正。

## 许可证

本项目采用 [MIT License](LICENSE)。Freebuff 及其商标、软件版权归其各自权利人所有。
