# 参与 Freebuff 中文汉化

欢迎反馈 Freebuff Windows 桌面版的漏翻、中英混排、错误译文或安装兼容性问题。

## 反馈漏翻

在 [Issues](https://github.com/Kfowever/freebuff-zh-patch/issues/new/choose) 使用“漏翻或译文问题”表单，提供应用版本、补丁版本、界面位置、英文原文和期望译文。截图请先遮盖个人信息；不需要上传整个应用、聊天记录、配置文件或访问令牌。

## 提交翻译修正

- 固定文案放在 `library/freebuff-zh-cn.js` 的精确词表中；动态文案应覆盖完整句子及实际使用的组合。
- 金额、数字、模型名、路径和用户定义名称必须保留。检查单复数、零值、千位分隔、刷新状态和可选提示。
- 不要移除聊天正文、草稿、代码、文件名、终端输出等内容保护规则。界面文案位于受保护区域时，应使用有明确范围的例外。
- 修改后运行 [开发验证](https://github.com/Kfowever/freebuff-zh-patch/blob/main/tests/README.md) 中与变更相关的检查，并说明适配的 Freebuff 版本。
- 请勿提交 Freebuff 本体、ASAR、安装目录、备份、账号数据或密钥。发布 ZIP 由维护者单独附在 Releases 中。

翻译和文档贡献可直接提交 Pull Request；涉及安装器或资源布局时，请附上安装、刷新与还原的验证结果。
