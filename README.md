# Freebuff 汉化助手 · Windows 简体中文

[![最新版本](https://img.shields.io/github/v/release/Kfowever/freebuff-zh-patch)](https://github.com/Kfowever/freebuff-zh-patch/releases/latest)

为 Freebuff Windows 桌面版提供非官方中文界面。Freebuff 更新后可一键检查匹配的翻译库。

**[下载最新版本](https://github.com/Kfowever/freebuff-zh-patch/releases/latest)** · [反馈问题](https://github.com/Kfowever/freebuff-zh-patch/issues/new/choose)

## 安装要求

- Windows x64
- Freebuff 桌面版 **0.0.196.0、0.0.198.0、0.0.200.0、0.0.201.0、0.0.202.0 或 0.0.203.0**

## 三步安装

1. 先安装 [Freebuff 官方桌面版](https://freebuff.com/)，保存工作。
2. 下载 **汉化安装包**并“全部解压”。
3. 双击 **安装.cmd**。完成后重新打开 Freebuff。

无需英文命令或管理员权限。汉化助手按需运行，不会开机自启或后台驻留。保留解压目录可随时使用更新和恢复入口。

## 如何更新？

Freebuff 更新后，先退出 Freebuff，再双击 **检查更新.cmd**。助手会查询 GitHub 兼容清单，下载、校验并应用匹配的翻译库。没有适配版本时，可通过提示打开发布页或反馈 Issue。

官方下载连接超时或持续低速时，自动依次尝试两个国内可访问的加速镜像；清单验证发布签名，安装包验证 SHA-256，全部线路失败后才提示下载失败。

- **检查更新.cmd**：检查并应用匹配的翻译库。
- **查看状态.cmd**：查看状态、打开发布页或 Issue 页面。
- **恢复英文.cmd**：还原英文界面。

## 安装器和翻译库独立

| 项目 | 当前版本 |
| --- | --- |
| 安装器 / 更新助手 | **0.11.9** |
| 翻译库 | **0.10.7** |
| 当前明确支持的应用 | **Freebuff 0.0.196.0 / 0.0.198.0 / 0.0.200.0 / 0.0.201.0 / 0.0.202.0 / 0.0.203.0，Windows x64** |

发行页的汉化安装包含所需文件。检查更新时，助手会按需下载和校验新版安装器或翻译库。

## 备份与隐私

安装前备份并校验，失败时尝试回滚。文件保存在 `%LOCALAPPDATA%\FreebuffZhPatch`。更新仅应用匹配当前 Freebuff 的翻译库，并保留备份。

只有更新助手会向本项目 GitHub 获取清单与补丁；界面译文脚本不联网，不上传账号、项目或聊天数据。品牌、模型、代码、路径及用户内容保留原文。其他平台和架构未经验证。

[高级用法与发布维护](docs/installation.md) · [贡献译文](CONTRIBUTING.md) · [开发验证](tests/README.md) · [MIT 许可证](LICENSE)

Unofficial Freebuff Chinese localization / Simplified Chinese language pack for Windows. Freebuff 及其商标、软件版权归各自权利人所有。
