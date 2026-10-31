# Freebuff 汉化助手 · Windows 简体中文

[![最新版本](https://img.shields.io/github/v/release/Kfowever/freebuff-zh-patch)](https://github.com/Kfowever/freebuff-zh-patch/releases/latest)

为 Freebuff Windows 桌面版提供非官方中文界面。**安装一次，以后随 Freebuff 版本自动检查匹配的翻译库。**

**[下载最新版本](https://github.com/Kfowever/freebuff-zh-patch/releases/latest)** · [反馈问题](https://github.com/Kfowever/freebuff-zh-patch/issues/new/choose)

## 三步安装

1. 先安装 [Freebuff 官方桌面版](https://freebuff.com/)，保存工作。
2. 下载 **Offline 离线整合包**并“全部解压”；也可下载体积更小的 **Installer 安装器**，由它联网下载翻译库。
3. 双击 **一键汉化.cmd**。完成后重新打开 Freebuff。

无需英文命令或管理员权限。助手会复制到用户目录，默认启用登录启动和自动检查；安装后可以删除解压目录。

## 自动更新怎么用？

Freebuff 更新后，助手会查询本项目 GitHub 兼容清单，下载明确匹配版本的翻译库并校验。应用正在运行时先准备好，**正常退出后自动应用，不强制关闭**。没有适配时显示中文提示，可点击查看发布或反馈 Issue；联网失败时会提示检查失败，不会误报“尚未适配”。

官方下载连接超时或持续低速时，自动依次尝试两个国内可访问的加速镜像；清单验证发布签名，安装包验证 SHA-256，全部线路失败后才提示下载失败。

- **检查更新.cmd**：立即检查并准备更新。
- **汉化管理.cmd**：查看状态、打开发布页或 Issue 页面。
- **关闭自动更新.cmd**：关闭后台检查和登录启动，保留已有汉化。
- **还原英文.cmd**：还原应用，同时关闭自动更新。

## 安装器和翻译库独立

| 项目 | 当前版本 |
| --- | --- |
| 安装器 / 更新助手 | **0.11.0** |
| 翻译库 | **0.10.1** |
| 当前明确支持的应用 | **Freebuff 0.0.196.0，Windows x64** |

Installer 包只带安装和更新程序；Library 包只带译文与版本适配数据。普通用户使用 Offline 包最方便，后续只需自动下载有变化的部分；需要新版安装器时，助手也会单独校验并切换。

## 备份与隐私

安装前备份并校验，失败时尝试回滚。文件保存在 `%LOCALAPPDATA%\FreebuffZhPatch`，保留历史版本和备份，不把旧版应用文件恢复到新版。自动更新不强装不匹配版本，也不自动降级。

只有更新助手会向本项目 GitHub 获取清单与补丁；界面译文脚本不联网，不上传账号、项目或聊天数据。品牌、模型、代码、路径及用户内容保留原文。其他平台和架构未经验证。

[高级用法与发布维护](docs/installation.md) · [贡献译文](CONTRIBUTING.md) · [开发验证](tests/README.md) · [MIT 许可证](LICENSE)

Unofficial Freebuff Chinese localization / Simplified Chinese language pack for Windows. Freebuff 及其商标、软件版权归各自权利人所有。
