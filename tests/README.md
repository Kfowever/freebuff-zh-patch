# 开发验证

在仓库根目录执行：

```powershell
node tests/static-translation.cjs
node tests/dom-protection.cjs
powershell -NoProfile -ExecutionPolicy Bypass -File tests/installer.ps1
```

测试不依赖第三方 Node 包。安装器测试需要 Windows PowerShell 5.1，使用临时目录中的合成版本文件与启动字符串载体，不修改实际安装。测试副本会模拟应用已关闭；生产安装器的进程检查保持启用。测试覆盖中文路径、刷新前的文件及备份校验、安装/刷新/还原失败，以及回滚失败时保留恢复副本。测试目录保留供排查。

`dom-protection.cjs` 使用 DOM 桩，验证用户内容保护、输入框提示、嵌套执行标签及动态更新、工具标签和引用按钮。可另在浏览器中打开 `dom.html`，检查结果为 `PASS`，验证真实 DOM 和 MutationObserver 行为。这些测试不能代替 Freebuff 启动及界面兼容性检查。
