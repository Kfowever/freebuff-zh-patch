# 开发验证

在仓库根目录执行：

```powershell
node tests/static-translation.cjs
node tests/freebuff-190.cjs
node tests/freebuff-081.cjs
node tests/freebuff-082.cjs
node tests/freebuff-090.cjs
node tests/freebuff-010.cjs
node tests/settings-0101.cjs
node tests/settings-balance-0101.cjs
node tests/hosted-workspace.cjs
node tests/translation-integrity.cjs
node tests/dom-protection.cjs
powershell -NoProfile -ExecutionPolicy Bypass -File tests/installer.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File tests/launcher.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File tools/package.ps1 -OutputDir D:\临时打包目录 -SigningKey 私钥路径
powershell -NoProfile -ExecutionPolicy Bypass -File tests/updater.ps1 -PackageDir D:\临时打包目录
```

测试不依赖第三方 Node 包。安装器测试需要 Windows PowerShell 5.1，使用临时目录中的合成版本文件与启动字符串载体，不修改实际安装。测试副本会模拟应用已关闭；生产安装器的进程检查保持启用。测试覆盖中文路径、刷新前的文件及备份校验、安装/刷新/还原失败，以及回滚失败时保留恢复副本。测试目录保留供排查。

安装器与库分别由 `installer.json`、`library/library.json` 管理；界面运行脚本位于 `library/freebuff-zh-cn.js`。打包输出目录必须是新的目录，避免覆盖已生成的发布附件。修改安装器源码后先重新打包，再执行更新器测试。

`updater.ps1` 覆盖精确版本匹配、独立库与安装器下载、SHA-256 校验、缓存与断网、下载中断、非法 ZIP、并发锁、应用更新期间重新匹配、运行中暂缓、退出后应用、自更新交接及失败保留、禁止降级和还原关闭自动更新。网络请求与注册表使用隔离替身，后台进程仅运行测试副本，不修改真实启动项，也不关闭本机 Freebuff。这些检查验证程序流程，不代表 GitHub 已经发布新清单或完成真实界面的端到端验证。

镜像检查覆盖官方失败后依次回退、低速判断、首个镜像内容错误继续切换、全部线路失败、清单签名被篡改与缺失签名拒绝。所有下载线路使用相同的校验逻辑，不因切换镜像放宽验证。

`dom-protection.cjs` 使用 DOM 桩，验证用户内容保护、输入框提示、嵌套执行标签及动态更新、工具标签和引用按钮，同时覆盖固定消息摘要、长消息展开控件、自定义服务商名称及 API 输入值保护。0.0.190 新增对任务和项目名称、推理摘要、问答选项、编辑器与差异视图的动态保护验证；0.9.0 补充赞助任务确认和问答输入提示。

`translation-integrity.cjs` 检查重复词条、重复正则及金额保留。`launcher.ps1` 在中文、空格和 `&` 路径中运行实际 CMD 入口，检查参数、结果及退出码；正常关闭进程和安装位置发现使用模拟对象，不会关闭本机应用。`installer.ps1` 还验证跨版本迁移、旧备份保留，以及非交互环境下包括 `-Force` 在内的版本不匹配取消。

在浏览器中打开 `dom.html`，检查结果为 `PASS`，验证真实 DOM 和 MutationObserver 行为，包括新版导航和小时额度标签。安装器测试同时验证新版根路径资源、深层页面可用的补丁 URL、旧版相对路径，以及远程或目录穿越入口的无写入拒绝。这些测试不能代替登录后的完整 Freebuff 操作检查。

0.10.0 新增在线工作区注入检查（Electron 模拟对象）：只在官方 HTTPS 来源的顶层应用窗口执行本地译文脚本，拒绝第三方地址和嵌入视图；不改变原有登录、导航或权限。安装器在 ASAR 中同时验证启动译文及工作区注入标记，任一项不匹配则停止。模拟检查不等同于登录后在线界面的端到端测试。

0.10.1 设置检查包括全部已发现的首层懒加载模块、已被宽泛规则部分翻译的文案，以及服务器返回的截图文案。`settings-0101.cjs` 验证完整句子、额度和美元金额；DOM 桩验证套餐额度的 React 分裂节点、数字更新、图标及节点身份保留，并确认同样内容位于用户消息时不会翻译。
