const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');const c={Node:{},NodeFilter:{},document:{readyState:'loading',addEventListener(){}}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../library/freebuff-zh-cn.js'),'utf8'),c);const cases=[
  [
    "The reply ended.",
    "回复已结束。"
  ],
  [
    "You’re in.",
    "已登录。"
  ],
  [
    "Download the app",
    "下载应用"
  ],
  [
    "Use the account you just signed in with.",
    "使用你刚刚登录的账号。"
  ],
  [
    "Starting your download…",
    "正在开始下载…"
  ],
  [
    "Download again",
    "重新下载"
  ],
  [
    "Local tools are unavailable. Reopen the panel to try again.",
    "本地工具不可用。请重新打开面板再试。"
  ],
  [
    "Link project",
    "关联项目"
  ],
  [
    "Push this project to GitHub. New chats will start from it.",
    "将此项目推送到 GitHub。新聊天将以此项目为起点。"
  ],
  [
    "Pushing this project’s files. Large projects can take a few minutes.",
    "正在推送此项目的文件。大型项目可能需要几分钟。"
  ],
  [
    "Existing repository",
    "现有仓库"
  ],
  [
    "Private repository",
    "私有仓库"
  ],
  [
    "Anyone on GitHub can see this repository.",
    "任何人都能在 GitHub 上查看此仓库。"
  ],
  [
    "No repositories Freebuff can write to.",
    "没有 Freebuff 可写入的仓库。"
  ],
  [
    "Freebuff couldn’t check your GitHub connection. Nothing about it has changed — retry in a moment.",
    "Freebuff 无法检查你的 GitHub 连接。连接状态未更改，请稍后重试。"
  ],
  [
    "Push to repository",
    "推送到仓库"
  ],
  [
    "Couldn’t load this chat.",
    "无法加载此聊天。"
  ],
  [
    "Couldn’t load this file.",
    "无法加载此文件。"
  ],
  [
    "Couldn’t remove this file.",
    "无法移除此文件。"
  ],
  [
    "Couldn’t load this project’s files.",
    "无法加载此项目的文件。"
  ],
  [
    "This image is too large. Try a smaller image.",
    "图片过大。请换一张较小的图片。"
  ],
  [
    "This model is no longer available. Choose another.",
    "此模型已不再提供。请选择其他模型。"
  ],
  [
    "The recording could not be read. Please try a shorter dictation.",
    "无法读取录音。请缩短听写内容后重试。"
  ],
  [
    "Microphone access was denied. Allow microphone access in your browser or system settings, then try again.",
    "麦克风访问被拒绝。请在浏览器或系统设置中允许访问麦克风，然后重试。"
  ],
  [
    "Dictation failed. Please try again.",
    "听写失败，请重试。"
  ],
  [
    "Stop dictation",
    "停止听写"
  ],
  [
    "Start dictation",
    "开始听写"
  ],
  [
    "Pick a skill for this message",
    "为此消息选择技能"
  ],
  [
    "Start mission",
    "开始目标"
  ],
  [
    "Couldn’t check agents. Try again.",
    "无法检查智能体，请重试。"
  ],
  [
    "No models are available for this harness yet.",
    "此运行环境暂时没有可用模型。"
  ],
  [
    "Your key",
    "你的密钥"
  ],
  [
    "This model is unavailable. Choose another.",
    "此模型不可用。请选择其他模型。"
  ],
  [
    "This model isn’t available in your region.",
    "此模型在你所在的地区不可用。"
  ],
  [
    "Your other session is still running. Wait for it to end before starting this one.",
    "你的另一个会话仍在运行。请等待其结束后再启动此会话。"
  ],
  [
    "Your cloud environment has reached its resource limit. Your files are being saved for recovery. Open this chat in the Desktop app to continue locally.",
    "云端环境已达到资源上限。正在保存文件以便恢复。请在桌面应用中打开此聊天，以在本地继续。"
  ],
  [
    "Freebuff is busy right now and could not start your session. It usually clears within a minute — try again shortly.",
    "Freebuff 当前繁忙，无法启动会话。通常一分钟内会恢复，请稍后重试。"
  ],
  [
    "You are banned from Freebuff. Contact the team via email (support@freebuff.com) or Discord.",
    "你已被 Freebuff 封禁。请通过电子邮件（support@freebuff.com）或 Discord 联系团队。"
  ],
  [
    "Verify my identity",
    "验证我的身份"
  ],
  [
    "Verification required.",
    "需要进行验证。"
  ],
  [
    "Couldn’t open Freebuff",
    "无法打开 Freebuff"
  ],
  [
    "Desktop",
    "桌面版"
  ],
  [
    "Web",
    "网页版"
  ],
  [
    "Your first message starts the session.",
    "发送第一条消息即可开始会话。"
  ],
  [
    "✦ Refer friends → earn hours:",
    "✦ 邀请好友 → 赚取小时额度："
  ],
  [
    "✕ End session",
    "✕ 结束会话"
  ],
  [
    "Your computer is offline. Open Freebuff Desktop to reconnect.",
    "电脑处于离线状态。打开 Freebuff 桌面应用以重新连接。"
  ],
  [
    "Create repository",
    "创建仓库"
  ],
  [
    "Not on GitHub",
    "不在 GitHub 上"
  ],
  [
    "Creating the repository on GitHub…",
    "正在 GitHub 上创建仓库…"
  ],
  [
    "Public repository",
    "公开仓库"
  ],
  [
    "Add a GitHub account or organization",
    "添加 GitHub 账户或组织"
  ],
  [
    "The repository must be empty, with no commits yet.",
    "仓库必须为空，且尚无任何提交。"
  ],
  [
    "Checking your GitHub connection…",
    "正在检查 GitHub 连接…"
  ],
  [
    "Create and push",
    "创建并推送"
  ],
  [
    "Earlier messages",
    "更早的消息"
  ],
  [
    "Add more sources to your project",
    "为项目添加更多来源"
  ],
  [
    "Composer disabled",
    "输入框已禁用"
  ],
  [
    "Dictation needs microphone access in a supported browser or the desktop app.",
    "语音听写需要在受支持的浏览器或桌面应用中访问麦克风。"
  ],
  [
    "No audio was recorded. Please try again.",
    "未录到音频，请重试。"
  ],
  [
    "No microphone was found. Connect a microphone and try again.",
    "未找到麦克风。请连接麦克风后重试。"
  ],
  [
    "Transcription is unavailable. Please try again.",
    "语音转写暂不可用，请重试。"
  ],
  [
    "Cancel transcription",
    "取消转写"
  ],
  [
    "Keep working toward a goal",
    "继续推进目标"
  ],
  [
    "What should this mission achieve?",
    "此目标要达成什么结果？"
  ],
  [
    "Add skills in Settings → Skills",
    "前往“设置 → 技能”添加技能"
  ],
  [
    "Sign in before saving a run",
    "请先登录，再保存运行记录"
  ],
  [
    "Custom mission",
    "自定义目标"
  ],
  [
    "Your provider",
    "你的提供方"
  ],
  [
    "Checking the agent…",
    "正在检查代理…"
  ],
  [
    "This provider changed or was removed. Choose it again, or pick another model.",
    "此提供方已更改或移除。请重新选择，或改选其他模型。"
  ],
  [
    "Changes could not be saved in this browser.",
    "无法在此浏览器中保存更改。"
  ],
  [
    "Account settings were closed",
    "账户设置已关闭"
  ],
  [
    "These settings could not be saved.",
    "无法保存这些设置。"
  ],
  [
    "Couldn’t connect. Try again.",
    "无法连接，请重试。"
  ],
  [
    "This session needs hours from your wallet.",
    "此会话需要使用钱包中的小时额度。"
  ],
  [
    "You’ve reached this model’s limit. Try another model.",
    "已达到此模型的使用上限。请尝试其他模型。"
  ],
  [
    "Another session is using this model.",
    "另一个会话正在使用此模型。"
  ],
  [
    "Couldn’t start this session. Try again or choose another model.",
    "无法启动此会话。请重试或选择其他模型。"
  ],
  [
    "That Freebuff session has ended. Start a new one to send.",
    "此 Freebuff 会话已结束。请开始新会话后再发送。"
  ],
  [
    "Phone verification required.",
    "需要验证手机号。"
  ],
  [
    "Access denied",
    "访问被拒绝"
  ],
  [
    "Already copying…",
    "正在复制…"
  ],
  [
    "Appearance has not synced yet. Your local settings are kept; retrying automatically.",
    "外观设置尚未同步。本地设置已保留，系统会自动重试。"
  ],
  [
    "Appearance is still syncing. Please wait before editing.",
    "外观设置仍在同步，请稍候再编辑。"
  ],
  [
    "Ask Freebuff… Use / for commands",
    "向 Freebuff 提问…输入 / 查看命令"
  ],
  [
    "Attach up to four images and five documents.",
    "最多可附加 4 张图片和 5 份文档。"
  ],
  [
    "Batch name",
    "批次名称"
  ],
  [
    "Batch runs",
    "批次运行"
  ],
  [
    "Cancel microphone request",
    "取消麦克风请求"
  ],
  [
    "Changes needed",
    "需要进行的更改"
  ],
  [
    "Chat upload progress",
    "聊天上传进度"
  ],
  [
    "Choose a chat first",
    "请先选择聊天"
  ],
  [
    "Choose another model or upgrade your plan.",
    "请选择其他模型或升级套餐。"
  ],
  [
    "Choose the model again, then send.",
    "请重新选择模型，然后发送。"
  ],
  [
    "Choose wallpaper image",
    "选择壁纸图片"
  ],
  [
    "Composer closed",
    "撰写框已关闭"
  ],
  [
    "Copy a legacy project",
    "复制旧版项目"
  ],
  [
    "Copy as Markdown",
    "复制为 Markdown"
  ],
  [
    "Could not add it.",
    "无法添加。"
  ],
  [
    "Could not check the welcome questions.",
    "无法检查欢迎问答。"
  ],
  [
    "Could not copy the invite link.",
    "无法复制邀请链接。"
  ],
  [
    "Could not create the project.",
    "无法创建项目。"
  ],
  [
    "Could not import image.",
    "无法导入图片。"
  ],
  [
    "Could not load account settings. Reconnect to try again.",
    "无法加载账户设置。请重新连接后重试。"
  ],
  [
    "Could not reach the server",
    "无法连接到服务器"
  ],
  [
    "Could not save settings. Please try again.",
    "无法保存设置，请重试。"
  ],
  [
    "Couldn’t add this file.",
    "无法添加此文件。"
  ],
  [
    "Couldn’t add this file. Try again.",
    "无法添加此文件，请重试。"
  ],
  [
    "Couldn’t archive this chat.",
    "无法归档此聊天。"
  ],
  [
    "Couldn’t create the project. Try again.",
    "无法创建项目，请重试。"
  ],
  [
    "Couldn’t discard this saved message. Try again.",
    "无法丢弃这条已保存的消息，请重试。"
  ],
  [
    "Couldn’t finish setup. Try again.",
    "无法完成设置，请重试。"
  ],
  [
    "Couldn’t load chats.",
    "无法加载聊天。"
  ],
  [
    "Couldn’t load this project.",
    "无法加载此项目。"
  ],
  [
    "Couldn’t open local folder.",
    "无法打开本地文件夹。"
  ],
  [
    "Couldn’t reach Sites. Check your connection and try again.",
    "无法连接到 Sites。请检查网络连接后重试。"
  ],
  [
    "Couldn’t read local branches.",
    "无法读取本地分支。"
  ],
  [
    "Couldn’t read that image.",
    "无法读取该图片。"
  ],
  [
    "Couldn’t read this image.",
    "无法读取此图片。"
  ],
  [
    "Couldn’t release the previous session. Try again.",
    "无法释放上一个会话，请重试。"
  ],
  [
    "Couldn’t remove this project.",
    "无法移除此项目。"
  ],
  [
    "Couldn’t send the queued message.",
    "无法发送排队中的消息。"
  ],
  [
    "Couldn’t send. Try again.",
    "发送失败，请重试。"
  ],
  [
    "Couldn’t send. Your message is saved.",
    "发送失败，你的消息已保存。"
  ],
  [
    "Couldn’t stop this response.",
    "无法停止此回复。"
  ],
  [
    "Couldn’t switch branches.",
    "无法切换分支。"
  ],
  [
    "Disconnect local folder",
    "断开本地文件夹连接"
  ],
  [
    "Does Freebuff collect my data?",
    "Freebuff 会收集我的数据吗？"
  ],
  [
    "Does Freebuff read files outside my project?",
    "Freebuff 会读取项目以外的文件吗？"
  ],
  [
    "End date must be on or after the start date.",
    "结束日期必须在开始日期当天或之后。"
  ],
  [
    "Files are temporarily unavailable",
    "文件暂时不可用"
  ],
  [
    "Files to add",
    "要添加的文件"
  ],
  [
    "Freebuff could not be reached just now. Please try again in a moment.",
    "暂时无法连接到 Freebuff，请稍后重试。"
  ],
  [
    "Freebuff is not available here.",
    "Freebuff 在此处不可用。"
  ],
  [
    "Get started with Desktop",
    "开始使用桌面版"
  ],
  [
    "Gradient direction",
    "渐变方向"
  ],
  [
    "Hide trace",
    "隐藏轨迹"
  ],
  [
    "I understand my plan ends immediately",
    "我明白我的套餐会立即结束"
  ],
  [
    "ID verification required.",
    "需要进行身份验证。"
  ],
  [
    "Invalid template",
    "模板无效"
  ],
  [
    "Invalid upload response. Try again.",
    "上传响应无效，请重试。"
  ],
  [
    "It stays saved to this project for its app and later chats; remove it in Settings → Projects.",
    "密钥会保存在此项目中，供其应用和后续聊天使用；如需移除，请前往“设置 → 项目”。"
  ],
  [
    "Legacy",
    "旧版"
  ],
  [
    "Main navigation",
    "主导航"
  ],
  [
    "Message Freebuff",
    "发送给 Freebuff"
  ],
  [
    "Missing models or features",
    "缺少所需的模型或功能"
  ],
  [
    "No preview for this kind of file. Download it to open it, or ask Freebuff about it in the chat.",
    "此类文件无法预览。请下载后打开，或在聊天中询问 Freebuff。"
  ],
  [
    "Not enough hours to start",
    "可用时长不足，无法启动"
  ],
  [
    "Only when a model or feature says data may be used for AI training. Freebuff or the provider may then keep submissions to develop, train, test, evaluate, fine-tune, and improve AI models or products, and Freebuff may share or sell them to third parties. Separately, Freebuff may use your data to train the models that choose and measure ads.",
    "只有在模型或功能明确说明数据可能用于 AI 训练时，才会发生这种情况。届时，Freebuff 或服务提供商可能会保留提交内容，用于开发、训练、测试、评估、微调和改进 AI 模型或产品；Freebuff 也可能与第三方共享或出售这些内容。此外，Freebuff 可能会使用你的数据训练用于选择和衡量广告效果的模型。"
  ],
  [
    "Open a folder",
    "打开文件夹"
  ],
  [
    "Open copy",
    "打开副本"
  ],
  [
    "Open local folder",
    "打开本地文件夹"
  ],
  [
    "Open this new chat in Desktop to choose its runtime.",
    "请在 Desktop 中打开此新聊天，以选择运行环境。"
  ],
  [
    "Or start a cloud project…",
    "或开始一个云端项目…"
  ],
  [
    "Preparing files…",
    "正在准备文件…"
  ],
  [
    "Procedure",
    "步骤"
  ],
  [
    "Project failed to load",
    "项目加载失败"
  ],
  [
    "Project folder",
    "项目文件夹"
  ],
  [
    "Project unavailable",
    "项目不可用"
  ],
  [
    "Questions complete",
    "问题已完成"
  ],
  [
    "Queued for cloud execution…",
    "已排队，等待云端运行…"
  ],
  [
    "Reload page",
    "重新加载页面"
  ],
  [
    "Reload to get the latest Freebuff.",
    "请重新加载以获取最新版 Freebuff。"
  ],
  [
    "Repositories that changed",
    "发生更改的代码库"
  ],
  [
    "Resolve a saved draft before starting another chat.",
    "请先处理已保存的草稿，再开始其他聊天。"
  ],
  [
    "Retry chat",
    "重试聊天"
  ],
  [
    "Retry local history",
    "重试加载本地历史记录"
  ],
  [
    "Running in background · View run",
    "正在后台运行 · 查看任务"
  ],
  [
    "Session changed while loading. Please try again.",
    "加载期间会话发生变化，请重试。"
  ],
  [
    "Show the task",
    "显示任务内容"
  ],
  [
    "Sites usage limit reached. Try again later.",
    "已达到 Sites 使用上限，请稍后重试。"
  ],
  [
    "Skip these questions",
    "跳过这些问题"
  ],
  [
    "Slide to choose how much effort Freebuff puts into each reply. Fast answers quickly; Powerful thinks longest.",
    "滑动以选择 Freebuff 为每条回复投入的思考力度。“快速”响应迅速；“强力”思考时间最长。"
  ],
  [
    "Start this free agent run?",
    "要启动此免费智能体任务吗？"
  ],
  [
    "Start your first project.",
    "开始创建你的第一个项目。"
  ],
  [
    "Stop mission",
    "停止目标"
  ],
  [
    "Stop response",
    "停止回复"
  ],
  [
    "Stored on this device",
    "已存储在此设备上"
  ],
  [
    "The desktop and workspace accounts differ. Reopen Freebuff Desktop and sign in again.",
    "桌面应用与工作区使用的账户不同。请重新打开 Freebuff 桌面版 并重新登录。"
  ],
  [
    "The local chat connection changed",
    "本地聊天连接已更改"
  ],
  [
    "The local workspace is still loading",
    "本地工作区仍在加载"
  ],
  [
    "The microphone is unavailable. Check whether another app is using it.",
    "麦克风不可用。请检查是否有其他应用正在使用。"
  ],
  [
    "The microphone stopped working. Please try dictating again.",
    "麦克风停止工作，请重新尝试语音输入。"
  ],
  [
    "The origin device is currently unavailable",
    "源设备当前不可用"
  ],
  [
    "The session response was incomplete. Try again.",
    "会话响应不完整，请重试。"
  ],
  [
    "This chat belongs to a different project. Reopen it and try again.",
    "此聊天属于其他项目。请重新打开后重试。"
  ],
  [
    "This chat is pinned to a different local folder. Reopen it and try again.",
    "此聊天固定在其他本地文件夹中。请重新打开后重试。"
  ],
  [
    "This chat keeps its existing harness.",
    "此聊天将继续使用现有运行环境。"
  ],
  [
    "This chat’s session changed. Review it and send again.",
    "此聊天的会话已更改。请检查后重新发送。"
  ],
  [
    "This message belongs to another account. Start a new chat.",
    "此消息属于其他账户。请新建聊天。"
  ],
  [
    "This model’s session is open in another tab or device. Continue there, or wait for it to end.",
    "此模型的会话已在其他标签页或设备中打开。请在那里继续，或等待会话结束。"
  ],
  [
    "This offer changed since you opened it. Nothing was started; try again.",
    "此优惠自你打开后已发生变化。尚未启动，请重试。"
  ],
  [
    "This offer was made for a different app and can’t start here.",
    "此优惠适用于其他应用，无法在此处启动。"
  ],
  [
    "This page didn't load",
    "此页面未能加载"
  ],
  [
    "This template is no longer available. Choose another below.",
    "此模板已不可用，请从下方选择其他模板。"
  ],
  [
    "Tiers",
    "等级"
  ],
  [
    "Transcription took too long. Please try again.",
    "转录耗时过长，请重试。"
  ],
  [
    "Try again to open this page.",
    "请重试以打开此页面。"
  ],
  [
    "Update Freebuff Desktop to start a worktree from the selected branch.",
    "请更新 Freebuff 桌面版，以便从所选分支创建工作树。"
  ],
  [
    "Upload cancelled",
    "已取消上传"
  ],
  [
    "Upload sources",
    "上传来源文件"
  ],
  [
    "Uploading files…",
    "正在上传文件…"
  ],
  [
    "Verify my phone number",
    "验证我的电话号码"
  ],
  [
    "Waiting for microphone permission",
    "正在等待麦克风权限"
  ],
  [
    "Wallpaper link",
    "壁纸链接"
  ],
  [
    "Welcome questions",
    "欢迎问答"
  ],
  [
    "You’ve reached your usage limit.",
    "已达到用量上限。"
  ],
  [
    "Your account cannot access Sites.",
    "你的账户无权访问 Sites。"
  ],
  [
    "Your account changed. Reopen Freebuff Desktop.",
    "你的账户已更改。请重新打开 Freebuff 桌面版。"
  ],
  [
    "Your cloud environment has reached its resource limit. Open this chat in the Desktop app to continue locally.",
    "云端环境已达到资源上限。请在 桌面应用中打开此聊天，以在本地继续。"
  ],
  [
    "Your computer is offline. You can keep chatting; open Freebuff Desktop to reconnect files and terminals.",
    "你的电脑当前处于离线状态。你可以继续聊天；打开 Freebuff 桌面版 即可重新连接文件和终端。"
  ],
  [
    "Answer all 全部回答",
    "Not answered 未回答"
  ],
  [
    "Your active session is using Model A. End it before switching to Model B.",
    "当前会话正在使用 Model A。请先结束会话，再切换到 Model B。"
  ],
  [
    "Your account has been suspended. To appeal, visit https://freebuff.com/account?tab=standing.",
    "你的账户已被停用。如需申诉，请访问 https://freebuff.com/account?tab=standing。"
  ],
  [
    "Could not load local chats in /work/app. Retry after reconnecting those folders.",
    "无法加载 /work/app 中的本地聊天。重新连接这些文件夹后重试。"
  ],
  [
    "No repository matches “demo”.",
    "没有与“demo”匹配的代码库。"
  ]
];for(const [en,zh]of cases){assert.equal(c.__FREEBUFF_ZH_PATCH__.translate(en),zh,en);assert.equal(c.__FREEBUFF_ZH_PATCH__.translate(zh),zh)};console.log('PASS: '+cases.length*2+' Freebuff 0.10.0 translation assertions')