# Freebuff Desktop 简体中文补丁

这是为 Windows 桌面版 Freebuff 制作的非官方简体中文界面补丁。

## 兼容性（重要）

本补丁 **仅支持 Windows 桌面版 Freebuff 0.0.63.0**。不支持 Freebuff 网页版、macOS 版、Linux 版或其他 Freebuff 版本。安装器会检测版本；版本不匹配时默认停止，不会修改应用文件。

## 下载

请从 [GitHub Releases](https://github.com/Kfowever/freebuff-zh-patch/releases/latest) 下载版本对应的 ZIP，完整解压后再安装。仓库与发行附件只包含补丁，不包含 Freebuff 本体。

补丁主要采用运行时 DOM 翻译层：只翻译 Freebuff 自身的菜单、按钮、提示、对话框和可访问性标签，并主动跳过聊天正文、代码、差异内容、终端输出和笔记正文，避免改动用户内容。启动瞬间的提示不经过网页界面，因此安装器会在 `app.asar` 中进行一次严格校验的等字节替换。

0.3.0 补齐了预览服务器退出与重启、智能体文件更改摘要、小数/高级会话额度及完整悬浮说明，并同步覆盖预览、文件空状态、用量面板、队列、技能和暂存菜单中的同组稳定文案。本版还翻译了 AGENTS.md 项目上下文说明，以及 Freebuff 启动瞬间的编排器提示。文件更改摘要采用组件级规则，动态额度文案采用完整锚定模板，避免全局翻译 `file`、`session` 等短词。

## 使用方法

运行任何命令前，请先完全关闭 Freebuff。

最简单的方法是直接双击：

- `Install-Freebuff-Zh.cmd`：一键安装；如果已经是最新版补丁，则不修改任何文件。如果补丁版本较旧，会安全刷新翻译资源。
- `Restore-Freebuff-Zh.cmd`：一键还原；如果没有安装补丁，则不修改任何文件。

两个命令行程序都会显示检测到的 Freebuff 版本、已验证版本和补丁状态。版本不匹配、文件状态不完整、备份不匹配或 Freebuff 仍在运行时会停止操作。

也可以在终端中使用下列 PowerShell 命令。

在此文件夹中打开 PowerShell，安装或刷新补丁：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File ".\FreebuffZhPatch.ps1" -Action Install
```

查看状态：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File ".\FreebuffZhPatch.ps1" -Action Status
```

恢复官方原始界面：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File ".\FreebuffZhPatch.ps1" -Action Restore
```

## 安全与备份

- 安装器会自动识别 `%LOCALAPPDATA%\Programs\@codebufffreebuff-desktop`。
- 首次安装前会备份原始 `index.html` 和 `app.asar`，清单与备份保存在 `%LOCALAPPDATA%\FreebuffZhPatch`；一键还原会同时恢复这两项。
- 安装、刷新和还原都要求 Freebuff 已关闭。
- 脚本会记录并检查应用版本、主界面资源哈希、补丁版本、补丁文件哈希、`app.asar` 原始/补丁哈希、启动文案出现次数、注入标记和安装清单；发现版本或文件状态异常时会停止危险覆盖。
- 补丁不修改 `Freebuff.exe`、项目、会话、账号数据或网络请求。
- 补丁自身不发起网络请求、不上传文件，也不读取或保存 GitHub、Freebuff 的令牌与密码。
- 安装器不请求管理员权限；备份与状态文件仅保存在当前 Windows 用户的 `%LOCALAPPDATA%\FreebuffZhPatch`。
- 同一版本重复执行 `Install` 会安全刷新翻译资源，不会重复注入标签。

## 更新后的处理

Freebuff 自动更新可能替换 `index.html` 或 `app.asar`。如果版本仍为 0.0.63.0，可重新运行一键安装。如果版本已经变化，安装器会默认拒绝修改；只有人工确认新版本仍兼容后，才能在终端中显式追加 `-Force`。

## 已知边界

- 来自远程模型、工具、插件、服务器或第三方终端/编辑器的动态英文内容不会强制翻译。
- 品牌名、模型名、命令、文件名和路径会保留原文。
- Freebuff 后续若大幅调整界面结构，个别新文案可能需要追加翻译。

## 文件

- `FreebuffZhPatch.ps1`：版本感知的安装、状态检查与还原工具。
- `freebuff-zh-cn.js`：简体中文运行时翻译层。
- `Install-Freebuff-Zh.cmd`：一键安装命令行程序。
- `Restore-Freebuff-Zh.cmd`：一键还原命令行程序。
- `LICENSE`：MIT 开源许可证。

补丁版本：0.3.0

## 许可证

本项目采用 MIT License。Freebuff 及其商标、软件版权归其各自权利人所有；本项目是非官方补丁，不包含 Freebuff 本体。
