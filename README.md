# Freebuff 汉化补丁 · Windows 简体中文

[![最新版本](https://img.shields.io/github/v/release/Kfowever/freebuff-zh-patch)](https://github.com/Kfowever/freebuff-zh-patch/releases/latest)
[![平台](https://img.shields.io/badge/Windows-简体中文-blue)](#支持版本)
[![许可证](https://img.shields.io/github/license/Kfowever/freebuff-zh-patch)](LICENSE)

为 **Freebuff Windows 桌面版**提供中文界面的非官方汉化补丁。支持一键安装、自动备份和还原英文，不包含 Freebuff 本体。

**[下载 0.10.0 汉化补丁 ZIP](https://github.com/Kfowever/freebuff-zh-patch/releases/download/v0.10.0/Freebuff-Zh-Patch-0.10.0.zip)** · [查看最新版本](https://github.com/Kfowever/freebuff-zh-patch/releases/latest) · [反馈问题](https://github.com/Kfowever/freebuff-zh-patch/issues/new/choose)

## 三步安装

1. 先安装 [Freebuff 官方桌面版](https://freebuff.com/)，保存工作。
2. 下载上方补丁 ZIP，右键选择“全部解压”。**请勿在压缩包中直接运行。**
3. 双击 **`一键汉化.cmd`**，看到“操作完成”后重新打开 Freebuff。

安装器会自动查找 Freebuff，并尝试正常关闭应用。如应用弹出退出确认，请先处理；自定义安装位置未找到时，会弹窗让你选择 `Freebuff.exe`。正常安装不需要英文命令或管理员权限。

需要恢复英文时，双击 **`还原英文.cmd`**。旧英文命名入口仍在源码中保留。

## 支持版本

- 补丁：**0.10.0**；已验证 **Freebuff 0.0.196.0，Windows x64**。
- 其他 Freebuff 版本和 Windows 架构未经验证；不支持网页版、macOS、Linux。
- 版本不匹配时会显示中文风险提示，默认取消；只有主动输入 `y` 才会尝试安装。

## 0.10.0 更新

- 适配新版在线工作区，同时保留本地登录页汉化；无需额外安装浏览器脚本。
- 补齐项目、聊天、语音输入、账号与会话提示。
- 保留中文一键安装、自动备份和还原。在线界面可独立更新，后续少量漏翻可反馈。

## 常见问题

**更新 Freebuff 后又变成英文？** 下载匹配新版的补丁，再双击“一键汉化.cmd”。不要将旧版应用备份覆盖到新版上。

**安装未完成？** 查看窗口中的中文原因。提示仍在运行时，完全退出 Freebuff 后重试；提示文件缺失时，重新下载并完整解压。仍有问题请[提交反馈](https://github.com/Kfowever/freebuff-zh-patch/issues/new/choose)，附上版本和提示内容。

**还有少量英文？** 品牌、模型、命令、路径及用户内容保留原文，远程工具输出不保证翻译。界面漏翻可[反馈原文和位置](https://github.com/Kfowever/freebuff-zh-patch/issues/new/choose)，截图请遮盖个人信息。

## 备份与隐私

安装前自动备份并校验文件，失败时尝试回滚。备份保存在 `%LOCALAPPDATA%\FreebuffZhPatch`，还原时会检查应用版本，避免覆盖新版文件。补丁不联网、不上传文件，不修改账号、会话或项目数据。

[高级用法](docs/installation.md) · [贡献译文](CONTRIBUTING.md) · [开发验证](https://github.com/Kfowever/freebuff-zh-patch/blob/main/tests/README.md) · [MIT 许可证](LICENSE)

Unofficial **Freebuff Chinese localization / Simplified Chinese language pack for Windows**. Freebuff 及其商标、软件版权归各自权利人所有。
