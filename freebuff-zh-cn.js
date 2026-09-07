/*
 * Freebuff Desktop 简体中文界面补丁
 * Runtime DOM localization layer. No network access and no user-data access.
 */
(() => {
  'use strict'

  const PATCH_ID = 'freebuff-zh-cn'
  const PATCH_VERSION = '0.5.0'
  if (globalThis.__FREEBUFF_ZH_PATCH__?.id === PATCH_ID) return

  const exact = new Map(
    Object.entries({
      // Main navigation and panels
      'Open threads': '打开的任务',
      Home: '主页',
      'New thread': '新建任务',
      'New messages': '新消息',
      Finished: '已完成',
      'Turn failed': '执行失败',
      Stopped: '已停止',
      'Auto stopped': '已自动停止',
      'Merge conflict': '合并冲突',
      'Something went wrong': '出现问题',
      'Try again': '重试',
      'Premium model': '高级模型',
      '100% free agent': '100% 免费智能体',
      Images: '图像',
      Balanced: '平衡',
      "Some models aren't available in Japan yet": '部分模型暂未在日本提供',
      "Some models aren't available on this connection": '当前网络连接暂不提供部分模型',
      "We couldn't confirm your region, so we're showing models available everywhere":
        '无法确认你所在的地区，因此目前只显示全球可用的模型',
      "We couldn't finish a network check, so we're showing models available everywhere":
        '网络检查未能完成，因此目前只显示全球可用的模型',
      Queue: '队列',
      Files: '文件',
      Changes: '更改',
      Preview: '预览',
      Terminal: '终端',
      Notes: '笔记',
      'Thread tools': '任务工具',
      SKILLS: '技能',
      QUEUE: '队列',
      Auto: '自动',
      'Nothing queued.': '队列为空。',
      'Select a thread to show tools.': '选择一个任务以显示工具。',
      'Collapse explorer': '折叠侧栏',
      'Expand explorer': '展开侧栏',
      'Resize explorer panel': '调整侧栏宽度',
      Collapsed: '已折叠',
      'Projects': '项目',
      'Open project': '打开项目',
      'Open project…': '打开项目…',
      'Start your streak': '开始连续使用',
      'Threads you close land here.': '你关闭的任务会显示在这里。',
      'Thread catalog': '任务目录',
      Active: '进行中',
      Archived: '已归档',
      Pinned: '已置顶',
      'Needs attention': '需要关注',
      Recent: '最近',
      Never: '从不',
      'No active threads': '没有进行中的任务',
      'No archived threads': '没有已归档的任务',
      'Archive inactive threads after': '自动归档不活跃任务的时间',
      'Pin thread': '置顶任务',
      'Unpin thread': '取消置顶任务',
      'Mark handled': '标记为已处理',
      'Move up': '上移',
      'Move down': '下移',
      'Archive thread': '归档任务',
      'Return to Recent': '移回“最近”',
      Rename: '重命名',
      'Show Freebuff data': '显示 Freebuff 数据',
      'Remove from projects': '从项目中移除',
      'Close its open tabs first': '请先关闭它已打开的标签页',

      // Account and appearance
      Account: '账户',
      'Your account': '你的账户',
      Appearance: '外观',
      Light: '浅色',
      Dark: '深色',
      'Match system': '跟随系统',
      'Usage dashboard': '用量面板',
      'Sign out': '退出登录',
      'Signing out...': '正在退出登录…',
      'Signed out': '已退出登录',
      'Waiting for sign-in… (retry)': '正在等待登录…（重试）',
      'Sign-in failed — retry': '登录失败 — 重试',
      'Sign in to Freebuff': '登录 Freebuff',
      'Cancel sign-in': '取消登录',
      'Could not start sign-in — Freebuff’s local service is not responding. Restart the app.':
        '无法开始登录 — Freebuff 本地服务无响应。请重启应用。',
      'Could not start sign-in.': '无法开始登录。',
      'Freebuff sign-in needed': '需要登录 Freebuff',
      'Message not sent': '消息未发送',
      'Message not queued': '消息未加入队列',
      'Could not stop the turn': '无法停止当前轮次',
      'Could not resume the queue': '无法恢复队列',
      'Could not switch agent': '无法切换智能体',
      'Could not change reasoning effort': '无法更改推理投入程度',
      'Could not switch agent mode': '无法切换智能体模式',
      'Could not change workspace mode': '无法更改工作区模式',
      'Could not rename this tab': '无法重命名此标签页',
      'Could not edit message': '无法编辑消息',
      'Administrator approval required': '需要管理员审批',
      'Freebuff needs your approval to run an administrator command':
        'Freebuff 需要你的批准才能运行管理员命令',
      'Files open as tabs in the main window': '文件将在主窗口中以标签页打开',
      'Could not open tab': '无法打开标签页',
      'Could not reopen that tab': '无法重新打开该标签页',
      'Could not load this tab': '无法加载该标签页',
      'The conversation changed underneath the edit — try again': '编辑期间会话已发生变化 — 请重试',

      // Composer and messages
      'Type a message — / for skills, @ for files': '输入消息 — / 选择技能，@ 引用文件',
      'Type a message — sending resumes the queue': '输入消息 — 发送后将恢复队列',
      'Type a message — added to the queue': '输入消息 — 将添加到队列',
      'Edit your message — Enter resends from here': '编辑消息 — 按 Enter 从此处重新发送',
      'Attach files, photos, or a folder': '附加文件、图片或文件夹',
      'Send message': '发送消息',
      'Stop the running turn': '停止当前任务',
      'Stopping the running turn': '正在停止当前任务',
      'Stopping…': '正在停止…',
      'Copy message': '复制消息',
      'Message copied': '消息已复制',
      Copied: '已复制',
      'Copy code': '复制代码',
      'Copy command': '复制命令',
      'Revert message': '还原此消息',
      'Fork from here': '从此处分支',
      'Fork chat and current workspace files into a new isolated thread':
        '将聊天和当前工作区文件复制到新的隔离任务',
      'Agent mode': '智能体模式',
      Build: '构建',
      Plan: '计划',
      'Plan mode — describe what the agent should design': '计划模式 — 描述希望智能体设计的内容',
      'Give feedback': '提供反馈',
      'Suggested next steps': '建议的后续步骤',
      Skills: '技能',
      'Edit skills': '编辑技能',
      'Add new skills': '添加新技能',
      'Run the Freebuff skill': '运行 Freebuff 技能',
      'Run skill': '运行技能',
      'Project files': '项目文件',
      '⇥ open': '⇥ 打开',
      '↵ mention · ⇥ open folder': '↵ 引用 · ⇥ 打开文件夹',
      'Pending code comments': '待发送的代码评论',
      'Remove comment': '移除评论',
      'Discard all pending comments': '放弃所有待发送评论',
      'Clear all': '全部清除',
      'Terminal context for next prompt': '下一条提示的终端上下文',
      'Terminal context — sent with your message': '终端上下文 — 将随消息发送',
      'Remove terminal context': '移除终端上下文',
      'Queue paused after an error.': '队列因错误暂停。',
      'Queue paused.': '队列已暂停。',
      'The queue is paused.': '队列已暂停。',
      'Resume it, or send a message to continue.': '恢复队列，或发送消息以继续。',
      'Resume queue': '恢复队列',
      'Send and resume queue (Enter)': '发送并恢复队列（Enter）',
      'Add to queue (Enter)': '加入队列（Enter）',
      'Send (Enter)': '发送（Enter）',
      'Send message and resume queue': '发送消息并恢复队列',
      'Add to queue': '加入队列',
      'Edit before sending': '发送前编辑',
      'Drop files, photos, or folders to attach': '拖放文件、照片或文件夹以添加附件',
      'Remove attachment': '移除附件',
      'Close image preview': '关闭图片预览',
      'Not enough room left in the message for that suggestion': '消息剩余空间不足，无法加入该建议',
      'Not enough room left in the message to quote that': '消息剩余空间不足，无法引用该内容',
      'Attaching files needs the desktop app': '添加文件需要使用桌面应用',
      'Pasting files needs the desktop app': '粘贴文件需要使用桌面应用',
      'Drag-and-drop needs the desktop app': '拖放操作需要使用桌面应用',

      // Thread and window actions
      'Move to new window': '移至新窗口',
      'Close window': '关闭窗口',
      'Minimize window': '最小化窗口',
      'Maximize window': '最大化窗口',
      'Restore window': '还原窗口',
      'Closed tabs': '已关闭的标签页',
      'Open tabs': '打开的标签页',
      'Search closed tabs': '搜索已关闭的标签页',
      'Closing this tab…': '正在关闭此标签页…',
      'Jump to new messages': '跳到新消息',
      'Jump to the latest': '跳到最新消息',
      'Scroll to new messages': '滚动到新消息',
      'Scroll to latest': '滚动到最新消息',
      'New messages': '新消息',
      'Time since the agent finished': '智能体完成后的时间',
      'Time since your latest prompt': '距你上次提问的时间',

      // Workspace and project settings
      'Project settings…': '项目设置…',
      'Project settings': '项目设置',
      'Close project settings': '关闭项目设置',
      'Startup script': '启动脚本',
      'Run this bash command once in each new Isolated workspace, after its first message and before the agent starts. Local threads do not run it.':
        '在每个新的隔离工作区中运行一次此 bash 命令：发送第一条消息后、智能体启动前执行。本地任务不会运行它。',
      'Enter a bash command or leave the field empty.': '请输入 bash 命令，或将此字段留空。',
      'Loading project settings…': '正在加载项目设置…',
      'Settings saved': '设置已保存',
      'Include AGENTS.md': '包含 AGENTS.md',
      'Include your project’s AGENTS.md (or CLAUDE.md) instructions in the agent’s context. Applies to every thread from its next message.':
        '将项目中的 AGENTS.md（或 CLAUDE.md）指令加入智能体上下文。从下一条消息开始，适用于该项目的所有任务。',
      Connectors: '连接器',
      'Connectors…': '连接器…',
      'Close connectors': '关闭连接器',
      'Search connectors': '搜索连接器',
      'No servers configured yet. Add one to': '尚未配置服务器。请添加到',
      ', then reload.': '，然后重新加载。',
      'Add connector': '添加连接器',
      'Add connector…': '添加连接器…',
      'Clear search': '清除搜索',
      'Reload from disk': '从磁盘重新加载',
      'Back to skills': '返回技能列表',
      'Search skills to add…': '搜索要添加的技能…',
      'Open a project to get started': '打开一个项目以开始',
      'Locate folder…': '定位文件夹…',
      'Finish signing in to your connector in the browser.': '请在浏览器中完成连接器登录。',
      'Nothing has started yet. Adding this connector runs a program on your computer with the same permissions as you. Its tool list cannot be read without starting it, so you are asked again afterwards about what it may do.':
        '尚未启动任何程序。添加此连接器会以与你相同的权限在电脑上运行程序；启动前无法读取工具列表，之后还会再次询问允许执行的操作。',
      'Nothing has been contacted yet. Adding this connector lets Freebuff talk to this address, and it may ask you to sign in. Its tool list cannot be read without connecting, so you are asked again afterwards about what it may do.':
        '尚未连接任何地址。添加此连接器后 Freebuff 可以与该地址通信，并可能要求你登录；连接前无法读取工具列表，之后还会再次询问允许执行的操作。',
      'Starting Freebuff orchestrator…': 'Freebuff 编排器正在启动…',
      Isolated: '隔离模式',
      Branch: '分支',
      'Started from': '起始分支',
      'Starts from': '将从此分支开始',
      'Starting branch': '起始分支',
      'Open Terminal': '打开终端',
      'Couldn’t open Terminal': '无法打开终端',
      'Couldn’t open your workspace': '无法打开工作区',
      'Opening your workspace…': '正在打开工作区…',
      'Opening your saved workspace took too long.': '打开已保存的工作区耗时过长。',
      'Open without saved tabs': '不恢复已保存的标签页',
      'Your conversations and project files stay saved.': '你的会话和项目文件仍会保留。',
      'Choosing a folder needs the desktop app.': '选择文件夹需要使用桌面应用。',
      'Use an isolated workspace': '使用隔离工作区',
      'Could not open your workspace': '无法打开工作区',
      'Could not set the starting branch': '无法设置起始分支',
      'Freebuff needs Git Bash': 'Freebuff 需要 Git Bash',
      'Agents write shell commands in bash, which Windows doesn’t ship. Git for Windows includes it and takes about a minute to install.':
        '智能体会使用 bash 编写 shell 命令，但 Windows 并未自带 bash。Git for Windows 包含它，安装大约需要一分钟。',
      'Download Git for Windows': '下载 Git for Windows',
      Premium: '高级',
      Recommended: '推荐',
      'Weekly limit': '每周限额',
      'Daily limit': '每日限额',
      '1 tab only': '仅限 1 个标签页',
      'Limited-time trial': '限时试用',
      'Limited access': '受限访问',
      'Lower limits': '额度降低',
      'Meet Freebucks': '认识 Freebucks',
      'Sessions are now bought with Freebucks — a daily allowance you spend on any model.':
        '现在使用 Freebucks 购买会话——这是可用于任意模型的每日额度。',
      'A fresh pool every day': '每天刷新额度',
      'Your daily Freebucks refill at midnight Pacific. Nothing to earn, nothing to wait for.':
        '你的 Freebucks 每天太平洋时间午夜补充，无需赚取，也无需等待。',
      'No more weekly or monthly session caps': '不再设置每周或每月会话上限',
      'The only thing that counts is what you spend. An hour of any model is one price, charged once when the session starts.':
        '只按实际支出计算。任意模型的一小时会话均按一个价格计费，并在会话开始时一次扣除。',
      'Spend it how you like': '按需使用',
      'Every model shows its price per hour. Pick the cheap one all day, or save up for the expensive one.':
        '每个模型都会显示每小时价格。可以全天使用便宜模型，也可以积攒额度使用高价模型。',
      'Got it': '知道了',
      Free: '免费',
      Freebucks: 'Freebucks',
      'Free sessions': '免费会话',
      'Premium sessions': '高级会话',
      'Premium session time remaining': '高级会话剩余时间',
      'Get more sessions': '获取更多会话',
      'Get more': '获取更多',
      'Use wallet': '使用钱包余额',
      Switch: '切换',
      Upgrade: '升级',
      'Open Earn': '打开“赚取”页面',
      'See plans': '查看方案',
      'Refer friends → earn Freebucks': '邀请好友 → 赚取 Freebucks',
      'Each qualified referral pays Freebucks, claimed on the Earn page.':
        '每位符合条件的受邀好友都会带来 Freebucks，可在“赚取”页面领取。',
      'Engage with a post, level up, and get more daily sessions':
        '参与帖子互动、提升等级并获得更多每日会话',
      'Referrals, bounties and Trust — everything that pays Freebucks':
        '邀请、悬赏和 Trust——所有可获得 Freebucks 的方式',
      'Reward session unlocked': '奖励会话已解锁',
      'Earned sessions': '已赚取会话',
      'your plan sessions': '你的方案会话',
      'daily plan sessions': '每日方案会话',
      'weekly plan sessions': '每周方案会话',
      'monthly plan sessions': '每月方案会话',
      'Free sessions are used first · today resets in': '优先使用免费会话 · 今日额度重置倒计时',
      'Unlimited messages and tool calls until it ends. Already paid for — switching models ends it and buys a new one.':
        '结束前可不限量使用消息和工具调用。费用已支付——切换模型会结束当前会话并购买新会话。',
      'Go to tab →': '前往标签页 →',
      'Deep reasoning': '深度推理',
      'Smart & fast': '智能且快速',
      'Most capable model for complex, demanding work': '能力最强，适合复杂且高要求的工作',
      'Reliable agentic workhorse for everyday tasks': '可靠的智能体主力模型，适合日常任务',
      'Balanced agentic coding model for everyday work': '均衡的智能体编程模型，适合日常工作',
      'Fast and affordable agentic coding model': '快速且经济的智能体编程模型',
      'Queues, then falls back · May use data for AI training':
        '繁忙时排队，随后切换至 DeepSeek V4 Flash · 可能将数据用于 AI 训练',
      'Queues, then falls back': '繁忙时排队，随后切换至 DeepSeek V4 Flash',
      'May use data for AI training': '可能将数据用于 AI 训练',
      'Strong all-around': '综合能力强',
      daily: '每日',
      left: '剩余',
      '/hr': '/小时',
      'Refer friends for more free sessions': '邀请好友，获得更多免费会话',
      'Copy invite link': '复制邀请链接',
      '✓ Copied!': '✓ 已复制！',
      'GLM 5.2 dashboard ↗': 'GLM 5.2 面板 ↗',
      'Claim bounties and track referrals': '领取奖励并查看邀请进度',
      'Referrals qualify once a GitHub account (4+ months old) is connected':
        '关联注册满 4 个月的 GitHub 账户后，邀请才会计入奖励',
      'Connect GitHub to qualify ↗': '关联 GitHub 以满足条件 ↗',
      'GLM 5.2 unlocked': 'GLM 5.2 已解锁',
      'Complete a bounty to unlock': '完成一个悬赏任务即可解锁',
      'earned from bounties': '通过悬赏任务获得',
      'GLM 5.2 — today’s sessions used': 'GLM 5.2 — 今日会话已用尽',
      'Refer friends to unlock GLM 5.2': '邀请好友以解锁 GLM 5.2',
      'Each qualified referral earns a daily 1-hour session of the most powerful open-source model':
        '每位符合条件的受邀好友每天可获得一个 1 小时会话，用于最强大的开源模型',

      // Queue and execution
      Resume: '继续',
      'Resume the queue': '继续队列',
      'Close tab when done': '完成后关闭标签页',
      'Close tab when queue finishes': '队列完成后关闭标签页',
      'Tab close scheduled': '已计划关闭标签页',
      'Nothing is running or queued': '没有正在运行或排队的任务',
      'Auto-run is deciding what is next': '自动运行正在决定下一步',
      Scope: '范围',
      'Deciding what is next…': '正在决定下一步…',
      'Keep working automatically when the queue empties. Anything you queue takes over.':
        '队列为空时自动继续工作；你加入队列的任务会优先执行。',
      'Let this tab keep working on its own when the queue empties': '队列为空时让此标签页自动继续工作',
      'Delete the queued close action to cancel': '删除排队的关闭操作即可取消',
      'After everything above finishes, close this tab and clean up the thread':
        '上方所有任务完成后，关闭此标签页并清理任务',
      'That turn failed, so the rest of the queue is paused.': '该轮执行失败，因此队列其余任务已暂停。',
      'This tab is stopped.': '此标签页已停止。',
      'Send now': '立即发送',
      'Sending now…': '正在发送…',
      'Edit prompt': '编辑提示',
      'Drag the row to reorder': '拖动此行以重新排序',
      'Could not delete that item': '无法删除该项目',
      'This tab will close once the queue finishes. Click to cancel.':
        '队列完成后将关闭此标签页。点击即可取消。',
      'Close this tab when the queue finishes. Adds a row to the end of the queue.':
        '队列完成后关闭此标签页。该操作会在队列末尾添加一行。',
      'Waiting for the model…': '正在等待模型…',
      'Waiting on a background command…': '正在等待后台命令…',
      'Waiting for a Freebuff session…': '正在等待 Freebuff 会话…',
      'Session ready — sending request…': '会话已就绪 — 正在发送请求…',
      'Freebuff is at capacity — retrying…': 'Freebuff 当前繁忙 — 正在重试…',
      'No internet — turns resume when you reconnect': '网络已断开 — 重新连接后将继续',
      'Picked up after a restart': '已在重启后恢复',
      'Tab closed and reopened': '标签页已关闭并重新打开',
      'Your free session ended': '你的免费会话已结束',
      Thinking: '思考中',
      'Worked ·': '已执行 ·',
      step: '步',
      'done': '已完成',
      'working…': '处理中…',
      'Thinking…': '思考中…',
      'Waiting for this thread to finish': '等待此任务完成',
      'Wait for this thread to finish': '等待此任务完成',
      'Forking…': '正在创建分支…',
      'Prompt history': '提示历史',
      'In progress': '进行中',
      'Agent to-do list': '智能体待办列表',
      'Files changed in this turn': '本轮更改的文件',
      'large diff': '差异过大',
      'Read tree': '读取目录树',
      'Find files': '查找文件',
      'Administrator request': '管理员权限请求',
      'Write doc': '写入文档',
      'Search web': '搜索网页',
      'Read URL': '读取 URL',
      'Read docs': '读取文档',
      'Edit notebook': '编辑笔记本',

      // Plan review and agent questions added in Freebuff 0.0.93
      'Plan approval': '计划审批',
      'Questions from the agent': '智能体的问题',
      'The plan is ready for your review': '计划已准备好，等待你审阅',
      'Freebuff has a question': 'Freebuff 有一个问题',
      'Copy plan': '复制计划',
      'Copy plan as Markdown': '将计划复制为 Markdown',
      'Plan copied': '计划已复制',
      'Feedback for the next plan revision': '下一次计划修订的反馈',
      'Previous question': '上一个问题',
      'Next question': '下一个问题',
      'Could not send answers': '无法发送回答',
      'Could not skip the questions': '无法跳过问题',
      'Changed during agent work': '智能体工作期间发生更改',

      // Mission controls added in Freebuff 0.0.64
      Mission: '目标',
      'Edit mission': '编辑目标',
      'Mission prompt': '目标提示',
      Effort: '投入程度',
      'Minimal — only a major concrete gain': '最小 — 仅追求重大且具体的改进',
      'Lean — buy clear improvements': '精简 — 追求明确改进',
      'Balanced — refine while gains are clear': '平衡 — 在收益明确时继续改进',
      'Thorough — pursue smaller credible gains': '详尽 — 追求较小但可信的改进',
      'Exhaustive — stop when gains are marginal': '穷尽 — 改进收益变小后停止',
      'Sprint — roughly complete beats polished': '冲刺 — 大致完成优先于精雕细琢',
      'Focused — complete and checked': '专注 — 完整并经过检查',
      'Crafted — correct, clean, and proven': '精制 — 正确、简洁且经过验证',
      'Thorough — strong on every quality dimension': '详尽 — 各项质量维度均达到高标准',
      'Exhaustive — the best version you can prove': '穷尽 — 做到能够验证的最佳版本',
      Explore: '探索',
      Commit: '提交',
      'Merge PR': '合并 PR',
      Custom: '自定义',
      'Write your own': '自行编写',
      'Investigate and report back, changing nothing': '调查并报告结果，不做任何更改',
      'Do the work and commit locally, but never push': '完成工作并在本地提交，但绝不推送',
      'Take it all the way to a merged pull request': '一直推进到拉取请求合并完成',
      "Complete the user's request fully. When the work is correct, lean, and verified, commit it, open a pull request, drive its checks to green, and merge it.":
        '完整完成用户请求。工作正确、精简且经过验证后，提交更改、创建拉取请求、确保检查通过并合并。',
      'What finishing looks like, and what happens to the finished work.':
        '完成目标的标准，以及完成后的处理方式。',
      'Set a mission to keep working toward automatically once the queue finishes':
        '队列完成后自动继续推进此目标',
      'Working toward this mission automatically once the queue finishes. Anything you queue takes over.':
        '队列完成后将自动推进此目标。你加入队列的任务会优先执行。',
      'Mission is deciding what is next': '目标正在决定下一步',
      'Could not change the mission': '无法更改目标',
      'Could not change mission effort': '无法更改目标投入程度',
      'Could not save the mission': '无法保存目标',
      'Keeps going on its own once the queue is empty.': '队列为空后自动继续执行。',
      'Saved missions': '已保存的目标',
      'Save this mission': '保存此目标',
      'Forget this mission': '忘记此目标',
      'Keep this mission for other threads and projects': '将此目标保留给其他任务和项目',
      'Pause queued work': '暂停排队中的任务',
      'Let the current turn finish, then pause queued work': '等待当前任务完成后，再暂停排队中的任务',
      'Pause the queue': '暂停队列',
      'Could not pause the queue': '无法暂停队列',

      // Welcome, loading and empty states
      'Welcome to Freebuff': '欢迎使用 Freebuff',
      'Start building with Freebuff': '开始使用 Freebuff 构建',
      'Pick a project and start a thread, or pick up where you left off.':
        '选择一个项目并新建任务，或继续上次的工作。',
      'Sign in to open a project and start your first thread.': '登录后打开项目并开始第一个任务。',
      'Sign-in opens in your browser.': '登录页面将在浏览器中打开。',
      'Waiting for your browser — this screen continues on its own.':
        '正在等待浏览器完成登录 — 此页面会自动继续。',
      'Loading thread…': '正在加载任务…',
      'Couldn’t load this thread': '无法加载此任务',
      'Connecting…': '正在连接…',
      'Reconnecting…': '正在重新连接…',

      // Feedback and dialogs
      'Report issue or feature': '报告问题或提出功能建议',
      'Share feedback': '分享反馈',
      'Help us make Freebuff better.': '帮助我们改进 Freebuff。',
      'Tell us what went wrong or what you’d like to see.': '告诉我们哪里出了问题，或你希望看到什么。',
      'Close feedback': '关闭反馈',
      'What kind of feedback is this?': '这是什么类型的反馈？',
      'Good result': '结果很好',
      'Something worked especially well': '某项功能运行得特别好',
      'Bad result': '结果不理想',
      'The agent missed or broke something': '智能体遗漏或破坏了某些内容',
      'App bug': '应用错误',
      'A crash, error, or UI problem': '崩溃、错误或界面问题',
      Other: '其他',
      'An idea, question, or anything else': '想法、问题或其他内容',
      'Describe the issue or feature you’d like to see.': '描述你遇到的问题或希望看到的功能。',
      'Sign in to send feedback': '登录后发送反馈',
      'Your draft will stay here while you finish signing in.': '完成登录前，你的草稿会保留在这里。',
      'Open sign-in again': '再次打开登录',
      'Sign in': '登录',
      'Includes your app version and operating system.': '将包含你的应用版本和操作系统信息。',
      'Sending...': '正在发送…',
      'Send feedback': '发送反馈',
      'Feedback sent. Thank you!': '反馈已发送，谢谢！',
      Cancel: '取消',
      'Cancel (Esc)': '取消（Esc）',
      Close: '关闭',
      Save: '保存',
      Delete: '删除',
      Deny: '拒绝',
      'Approve command': '批准命令',
      'Administrator access requested': '请求管理员权限',
      Command: '命令',
      'Runs from': '运行目录',
      'Waiting…': '正在等待…',
      'This command will have full administrator access. Freebuff will invoke your operating system’s native authentication prompt only after you approve it here.':
        '此命令将获得完整的管理员权限。只有在你于此处批准后，Freebuff 才会调用操作系统的原生身份验证提示。',

      // Hosted-model/session notices
      'Another tab is using the hosted model': '另一个标签页正在使用托管模型',
      'Ends the other tab’s session.': '这会结束另一个标签页的会话。',
      'Use it here': '在此处使用',
      'This tab has the slot — send your message again.': '此标签页已获得会话名额 — 请重新发送消息。',
      'Could not move the session to this tab.': '无法将会话移至此标签页。',
      'Specific to this model.': '仅适用于此模型。',
      'Shared across all premium models.': '所有高级模型共享此额度。',
      'Shared across all available free models.': '所有可用免费模型共享此额度。',
      'Switch to DeepSeek V4 Flash to keep going.': '切换到 DeepSeek V4 Flash 以继续。',
      'Usage incomplete': '用量不完整',
      'Token usage': '令牌用量',
      'Thread token usage': '任务令牌用量',
      'Compacts at': '压缩于',
      'Thread usage': '任务用量',
      'Cumulative provider-reported usage in the current thread transcript.':
        '当前任务记录中由提供商报告的累计用量。',
      'Some thread usage is missing': '部分任务用量缺失',
      'These totals include only requests reported before an interruption.':
        '这些总计仅包含中断前已报告的请求。',
      'Reasoning effort': '推理力度',
      'Extra high': '极高',
      'Bare minimum deliberation': '最低限度思考',
      'Fastest replies, least deliberation': '回复最快，思考最少',
      'More deliberation, slower': '思考更多，速度更慢',
      'Deepest available, slowest': '最深入的思考，速度最慢',
      'Maximum deliberation': '最大程度思考',
      'Everything it has': '全部能力',
      'Coding agent and model': '编码智能体和模型',
      'Your subscription': '你的订阅',
      'Signed in': '已登录',
      'Copied — run it in your terminal': '已复制 — 请在终端运行',

      // Codex/Claude integrations
      Install: '安装',
      Download: '下载',
      'Download for Freebuff': '下载供 Freebuff 使用',
      'Retry download': '重试下载',
      'Installing…': '正在安装…',
      'Starting download…': '正在开始下载…',
      'Step 2 of 2 · Sign in with a Claude Pro, Max, Team, or Enterprise plan':
        '第 2/2 步 · 使用 Claude Pro、Max、Team 或 Enterprise 方案登录',
      'Step 2 of 2 · Sign in to Codex with ChatGPT or an API key':
        '第 2/2 步 · 使用 ChatGPT 或 API 密钥登录 Codex',
      'Codex is signed out': 'Codex 已退出登录',
      'Claude Code is signed out': 'Claude Code 已退出登录',
      'Claude Code is blocked by policy': 'Claude Code 已被策略阻止',
      'Codex CLI needs updating': 'Codex CLI 需要更新',
      'Update Codex': '更新 Codex',
      'Could not run the update.': '无法执行更新。',
      'Codex updated — send your message again.': 'Codex 已更新 — 请重新发送消息。',
      'Updating…': '正在更新…',

      // Mobile mirroring
      Mobile: '移动端',
      "Mirror this computer's open threads to the Freebuff iOS app, and let the phone send messages and approve elevated commands.":
        '将此电脑中打开的任务镜像到 Freebuff iOS 应用，并允许手机发送消息及批准提权命令。',
      'Mirror to my phone': '镜像到我的手机',
      'This computer:': '此电脑：',
      'Sign in to enable.': '登录后启用。',
      Off: '关闭',
      On: '开启',

      // Files, diffs, preview, terminal and notes
      'Couldn’t list files': '无法列出文件',
      'Loading files': '正在加载文件',
      'Could not list files': '无法列出文件',
      'Filter files': '筛选文件',
      'No matches': '无匹配项',
      'No files': '无文件',
      'No file path contains that text.': '没有文件路径包含该文本。',
      'This workspace has no files to show.': '此工作区没有可显示的文件。',
      'Open workspace in File Explorer': '在文件资源管理器中打开工作区',
      'Choose application for workspace': '选择用于打开工作区的应用',
      'No changes to show.': '没有可显示的更改。',
      All: '全部',
      Uncommitted: '未提交',
      'Changes scope': '更改范围',
      'Working directory changes': '工作目录更改',
      'Resolve with agent': '让智能体解决',
      'Loading changes': '正在加载更改',
      'Couldn’t load changes': '无法加载更改',
      'No worktree yet': '尚无工作树',
      'No changes': '没有更改',
      'The working tree is clean — everything is committed.': '工作树是干净的 — 所有更改均已提交。',
      Retry: '重试',
      'Comment on this line — sent with your next message': '评论此行 — 将随下一条消息发送',
      'Click a line to comment': '点击一行以添加评论',
      'Binary file.': '二进制文件。',
      'Loading diff…': '正在加载差异…',
      'Loading diff viewer…': '正在加载差异查看器…',
      'Diff too large to display.': '差异过大，无法显示。',
      'Could not load diff.': '无法加载差异。',
      'Could not load changes.': '无法加载更改。',
      'Working-tree changes since the last commit': '自上次提交以来的工作树更改',
      'Could not apply the changes.': '无法应用更改。',
      'Couldn’t open that change in the file browser.': '无法在文件浏览器中打开该更改。',
      'That file no longer exists. Opened its nearest existing folder instead.':
        '该文件已不存在，已改为打开最近的现有文件夹。',
      'Apply changes to this folder': '将更改应用到此文件夹',
      'Reading the thread’s workspace…': '正在读取任务工作区…',
      'Follow the details in the thread transcript.': '详情请查看任务记录。',
      'An agent opens a standalone HTML page or starts this project’s dev server from the thread workspace, then shows it here.':
        '智能体会从任务工作区打开独立 HTML 页面或启动项目开发服务器，然后在此处显示。',
      'Preparing the preview': '正在准备预览',
      'Agent is preparing the preview…': '智能体正在准备预览…',
      'Preview setup is queued…': '预览设置已排队…',
      'Reload the page': '重新加载页面',
      'Preview is starting…': '预览正在启动…',
      'Preview is live': '预览已运行',
      'Preview failed — open to relaunch': '预览失败 — 打开以重新启动',
      'Launch preview': '启动预览',
      Relaunch: '重新启动',
      'The dev server process exited.': '开发服务器进程已退出。',
      'The dev server died.': '开发服务器已退出。',
      'Open in your browser': '在浏览器中打开',
      'Close the HTML preview': '关闭 HTML 预览',
      'Stop the dev server': '停止开发服务器',
      'Ended with an error': '因错误结束',
      'thread preview': '任务预览',
      'Thread shell': '任务终端',
      'Terminal input': '终端输入',
      'Couldn’t open this file': '无法打开此文件',
      'Loading file…': '正在加载文件…',
      'Could not read this file': '无法读取此文件',
      'Could not save this file': '无法保存此文件',
      'Could not open that folder.': '无法打开该文件夹。',
      'Showing the first 512 KB': '正在显示前 512 KB',
      'Showing the first 512 KB read-only': '正在以只读方式显示前 512 KB',
      'This file changed on disk. Reload it before you save again.':
        '此文件已在磁盘上发生变化，请重新加载后再保存。',
      'Jot an idea for this project…': '记下这个项目的想法…',
      'Nothing jotted yet': '还没有笔记',
      'Capture ideas as they come': '随时记录灵感',
      'Save note (Enter)': '保存笔记（Enter）',
      'Save note': '保存笔记',
      'Copy note': '复制笔记',
      'Edit note': '编辑笔记',
      'Delete note': '删除笔记',
      'Loading notes…': '正在加载笔记…',
      'Could not save your notes': '无法保存笔记',
      'Couldn’t copy to clipboard': '无法复制到剪贴板',
      'Add to Chat': '添加到聊天',
      Restart: '重启',

      // Queue, feedback, stash and skills
      'Could not reorder the queue': '无法重新排列队列',
      "Couldn't schedule tab close": '无法安排关闭标签页',
      'Could not change the auto-run scope': '无法更改自动运行范围',
      'Could not change auto-run': '无法更改自动运行',
      'Could not edit that item': '无法编辑该项目',
      "Couldn't send that item": '无法发送该项目',
      'Could not queue that suggestion': '无法将该建议加入队列',
      'Close sponsor break': '关闭赞助展示',
      Sponsored: '赞助内容',
      'Sponsored break': '赞助内容间歇',
      'Sponsored proposal': '赞助任务提案',
      'Sponsored proposal options': '赞助任务提案选项',
      'Starting sponsored thread…': '正在启动赞助任务…',
      'Sponsored thread running': '赞助任务正在运行',
      'Sponsored thread committed its work': '赞助任务已提交更改',
      'Sponsored thread landed a PR': '赞助任务已创建 PR',
      'Sponsored thread failed': '赞助任务失败',
      'Sponsored PR merged': '赞助 PR 已合并',
      'Start sponsored thread': '启动赞助任务',
      'Create pull request': '创建拉取请求',
      'View what it did': '查看执行内容',
      'Watch this run': '查看任务运行情况',
      'Review the pull request': '审阅拉取请求',
      'view on GitHub': '在 GitHub 上查看',
      'Report this proposal': '举报此提案',
      'Why this?': '为什么会显示此内容？',
      'Dismiss sponsored proposal': '忽略赞助任务提案',
      'Dismiss sponsored message': '关闭赞助消息',
      'Turn off sponsored proposals': '关闭赞助任务提案',
      'Could not open that sponsored run': '无法打开该赞助任务',
      'The sponsored thread could not finish. Nothing was changed in your project.':
        '赞助任务未能完成。你的项目未发生任何更改。',
      'Matched to what you are building in this project. Sponsored proposals never read your code without your go-ahead.':
        '根据你在此项目中构建的内容匹配。未经你允许，赞助任务提案绝不会读取代码。',
      'Sponsored tasks can’t run on Windows yet: Freebuff has no way to keep an advertiser’s commands inside the workspace on this operating system.':
        '赞助任务目前无法在 Windows 上运行：Freebuff 尚无法在此操作系统中将广告方命令限制在工作区内。',
      'Sponsored tasks need bubblewrap (`bwrap`) to stay inside the workspace. Install it and reopen this project to accept.':
        '赞助任务需要 bubblewrap（`bwrap`）才能限制在工作区内运行。请安装后重新打开此项目以接受任务。',
      'Sponsored tasks need the Freebuff desktop app, which is what asks you to approve the task before it runs. Open this project in the app to accept.':
        '赞助任务需要 Freebuff 桌面应用；任务运行前由应用请求你的批准。请在应用中打开此项目以接受任务。',
      'Sponsored tasks can’t run on this operating system: Freebuff has no way to keep an advertiser’s commands inside the workspace here.':
        '赞助任务无法在此操作系统上运行：Freebuff 无法在这里将广告方命令限制在工作区内。',
      'Sponsored tasks can’t run here yet.': '赞助任务目前无法在此处运行。',
      'That model’s tab limit is reached — this tab kept the default.':
        '该模型的标签页额度已用尽——此标签页已保留默认模型。',
      'Sign in…': '登录…',
      'Shell Session': 'Shell 会话',
      'Learn more': '了解更多',
      'Tell us more': '请详细说明',
      'What happened, and what did you expect?': '发生了什么？你的预期是什么？',
      'Saving is paused until they load': '加载完成前将暂停保存',
      'Jot an idea…': '记下一个想法…',
      'Showing Freebuff data needs the desktop app.': '显示 Freebuff 数据需要使用桌面应用。',
      'Could not open Freebuff’s data folder.': '无法打开 Freebuff 数据文件夹。',
      'Open PR': '打开 PR',
      'Drag to reorder': '拖动以重新排序',
      'Protected from automatic archive': '受保护，不会自动归档',
      'Open the stash': '打开暂存',
      'Stashed messages': '已暂存消息',
      'Stash this message': '暂存此消息',
      'Files only': '仅文件',
      'Discard this stashed message': '丢弃此暂存消息',
      'Search skills': '搜索技能',
      'Close skill search': '关闭技能搜索',
      'Create from scratch': '从头创建',
      'Start a new project skill with a guided template': '使用引导模板创建新的项目技能',
      'Popular skills': '热门技能',
      'Filter popular skills by category': '按类别筛选热门技能',
      'Inserting skill…': '正在插入技能…',
      'Use skill now': '立即使用技能',
      'Done editing skills': '完成技能编辑',
      'Queue skill': '将技能加入队列',
      'Run this thread in a separate Git worktree so its changes don’t affect your current folder.':
        '在独立 Git 工作树中运行此任务，其更改不会影响当前文件夹。',
      'This folder isn’t a git repository, so isolated workspaces aren’t available. Threads run directly in the folder.':
        '此文件夹不是 Git 仓库，无法使用隔离工作区；任务将直接在此文件夹中运行。',
      'This thread runs directly in the shared project folder.': '此任务直接在共享项目文件夹中运行。',
      'Current branch in this shared folder — pick another to switch':
        '共享文件夹中的当前分支 — 选择其他分支以切换',

      // Updater
      'Closing safely, then reopening the updated app.': '将安全关闭应用，然后重新打开更新后的版本。',
      'You can keep working while the update downloads.': '更新下载期间你可以继续工作。',
      'Cancel download': '取消下载',
      'It will restart after your active work finishes.': '当前工作完成后，应用将重启。',
      'Restart now': '立即重启',
      'Keep this version': '保留此版本',
      'Freebuff update': 'Freebuff 更新',
      'Checking for updates': '正在检查更新',
      'Keep working': '继续工作',
      'All up to date': '已是最新版本',
      'You have the latest available version. Freebuff will keep checking in the background.':
        '你已使用最新可用版本。Freebuff 会继续在后台检查更新。',
      'Development build': '开发版本',
      'Update checks are unavailable here': '此版本无法检查更新',
      'Install a packaged Freebuff build to test automatic updates.': '请安装打包版 Freebuff 以测试自动更新。',
      'Connection problem': '连接问题',
      'Could not check for updates': '无法检查更新',
      'Freebuff could not reach the update service. Try again, or download the latest installer.':
        'Freebuff 无法连接更新服务。请重试，或下载最新安装程序。',
      'Download manually': '手动下载',
      'Not now': '暂不',
      'Finish setup': '完成设置',
      'Move Freebuff to Applications': '将 Freebuff 移到“应用程序”',
      'Download installer': '下载安装程序',
      'Update interrupted': '更新已中断',
      'Your current version is untouched. Try the update again, or download the installer.':
        '当前版本未受影响。请重试更新，或下载安装程序。',
      'Install now for the quickest update, or let Freebuff wait until your active work is finished.':
        '立即安装可最快完成更新，也可以等当前工作完成后再安装。',
      'Install and restart': '安装并重启',
      'Install when idle': '空闲时安装',
      'Skip this version': '跳过此版本',
      'Close update dialog': '关闭更新对话框',
      'Updates are verified before installation.': '更新会在安装前进行验证。',

      // Startup recovery page
      'Freebuff couldn’t load': 'Freebuff 无法加载',
      'Reload Freebuff': '重新加载 Freebuff',
      'Get latest installer': '获取最新安装程序',
      'Part of the interface did not start. Reload once; if this screen returns, reinstall the latest version. Your projects and conversations are safe.':
        '部分界面未能启动。请重新加载一次；如果此页面再次出现，请重新安装最新版本。你的项目和会话数据是安全的。',
    }),
  )

  let regionNameTranslations = null

  function translateRegionName(region) {
    if (region === 'your region') return '你所在的地区'
    if (!regionNameTranslations) {
      regionNameTranslations = new Map()
      try {
        const englishNames = new Intl.DisplayNames(['en'], { type: 'region' })
        const chineseNames = new Intl.DisplayNames(['zh-CN'], { type: 'region' })
        for (let first = 65; first <= 90; first += 1) {
          for (let second = 65; second <= 90; second += 1) {
            const code = String.fromCharCode(first, second)
            const english = englishNames.of(code)
            const chinese = chineseNames.of(code)
            if (english && english !== code && chinese && chinese !== code) {
              regionNameTranslations.set(english, chinese)
            }
          }
        }
      } catch {
        // Keep the English region name when Intl.DisplayNames is unavailable.
      }
    }
    return regionNameTranslations.get(region) ?? region
  }

  function translateUnavailableRegion(_match, region) {
    return `部分模型暂未在${translateRegionName(region)}提供`
  }

  function translatePrivacyConnection(_match, signalList) {
    const labels = {
      'anonymized network': '匿名网络',
      proxy: '代理',
      relay: '中继',
      'residential proxy': '住宅代理',
      Tor: 'Tor',
      VPN: 'VPN',
      'hosting network': '托管网络',
      'privacy service': '隐私服务',
    }
    const translatedSignals = signalList
      .split(/,\s*(?:or\s+)?|\s+or\s+/)
      .filter(Boolean)
      .map((signal) => labels[signal] ?? signal)
      .join('、')
    return `检测到正在使用${translatedSignals}；使用直连网络可获得更多模型`
  }

  const patterns = [
    [/^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?) daily · resets in (.+)$/, '$1/$2 每日额度 · 将在 $3 后重置'],
    [/^resets in (.+)$/, '将在 $1 后重置'],
    [/^On · synced (.+)$/, '开启 · 已于 $1 同步'],
    [/^Error: (.+)$/, '错误：$1'],
    [
      /^(\d+(?:\.\d+)?) Freebucks · Labor Day weekend \(through (.+) PT\)$/,
      '$1 Freebucks · 劳动节周末（太平洋时间 $2 结束）',
    ],
    [
      /^Peak pricing · \+(\d+(?:\.\d+)?) Freebucks until (.+) PT · May use data for AI training$/,
      '高峰价格 · 太平洋时间 $2 前额外需要 $1 Freebucks · 可能将数据用于 AI 训练',
    ],
    [
      /^Step 1 of 2 · Download Claude Code (.+) for Freebuff \((\d+) MB; (\d+) MB installed\)\.$/,
      '第 1/2 步 · 下载供 Freebuff 使用的 Claude Code $1（下载 $2 MB；安装后 $3 MB）。',
    ],
    [/^Step 1 of 2 · Downloading Claude Code (.+) · (\d+)%$/, '第 1/2 步 · 正在下载 Claude Code $1 · $2%'],
    [
      /^Step 1 of 2 · Verifying and installing Claude Code (.+)$/,
      '第 1/2 步 · 正在验证并安装 Claude Code $1',
    ],
    [
      /^Step 1 of 2 · Install the Claude Code CLI — the Claude Desktop app does not include it$/,
      '第 1/2 步 · 安装 Claude Code CLI — Claude Desktop 应用并未包含该组件',
    ],
    [/^Step 1 of 2 · Install the (.+) CLI$/, '第 1/2 步 · 安装 $1 CLI'],
    [/^Update the (.+) CLI · (.+)$/, '更新 $1 CLI · $2'],
    [/^Freebuff has (\d+) questions$/, 'Freebuff 有 $1 个问题'],
    [/^Search (\d+) connectors…$/, '搜索 $1 个连接器…'],
    [/^No connector matches “(.+)”\.$/, '没有匹配“$1”的连接器。'],
    [
      /^(\d+(?:\.\d+)?\/\d+(?:\.\d+)?) sessions today\. Each lasts up to 1 hour\. Resets (.+)\.$/,
      '今日会话：$1。每个会话最长持续 1 小时。重置时间：$2。',
    ],
    [
      /^(\d+(?:\.\d+)?\/\d+(?:\.\d+)?) starts today\. Each start opens up to 1 hour; ending early still uses one start\. Resets (.+)\.$/,
      '今日启动次数：$1。每次启动可使用最长 1 小时；提前结束仍会消耗一次。重置时间：$2。',
    ],
    [
      /^(\d+(?:\.\d+)?) of today's (\d+(?:\.\d+)?) Freebucks left\. Spent before your wallet, and they do not carry over — refills in (.+)\.$/,
      '今日 $2 Freebucks 中剩余 $1。优先于钱包余额使用，且不会结转 — 将在 $3 后补充。',
    ],
    [
      /^(\$[\d.]+) of usage left this month, out of (\$[\d.]+)\. That is what your sessions cost to run, not what you are billed\.$/,
      '本月 $2 使用额度中剩余 $1。这是会话的运行成本，不是向你收取的费用。',
    ],
    [/^Out of Freebucks · more in (.+)$/, 'Freebucks 已用尽 · 将在 $1 后补充'],
    [/^Running low · today's refill in (.+)$/, '余额即将用尽 · 今日额度将在 $1 后补充'],
    [/^Free sessions are used first · today resets in (.+)$/, '优先使用免费会话 · 今日额度将在 $1 后重置'],
    [
      /^Today's Freebucks are spent\. This uses (\d+(?:\.\d+)?) from your wallet and ends your current session\.$/,
      '今日 Freebucks 已用尽。将从钱包余额中使用 $1，并结束当前会话。',
    ],
    [
      /^Today's Freebucks are spent\. This uses (\d+(?:\.\d+)?) from your wallet\.$/,
      '今日 Freebucks 已用尽。将从钱包余额中使用 $1。',
    ],
    [
      /^Ends your session and starts a new one for (\d+(?:\.\d+)?) Freebucks\.$/,
      '结束当前会话，并使用 $1 Freebucks 启动新会话。',
    ],
    [
      /^Premium sessions reset in (.+) · MiMo and V4 Flash stay unmetered$/,
      '高级会话将在 $1 后重置 · MiMo 和 V4 Flash 仍不计量',
    ],
    [/^Today's premium sessions are used · resets in (.+)$/, '今日高级会话已用尽 · 将在 $1 后重置'],
    [
      /^(\d+(?:\.\d+)?) Freebucks buys one hour of unlimited messages and tool calls\. Charged once, when the session starts\.$/,
      '$1 Freebucks 可购买 1 小时不限量消息和工具调用。会话开始时一次扣除。',
    ],
    [
      /^(\d+(?:\.\d+)?) Freebucks an hour, more than the (\d+(?:\.\d+)?) you have left today plus your wallet\.$/,
      '每小时需要 $1 Freebucks，超过你今日剩余额度与钱包余额之和（$2）。',
    ],
    [/^connected · (\d+) tools?$/, '已连接 · $1 个工具'],
    [/^(\d+)\/(\d+) tabs? in use$/, '已使用 $1/$2 个标签页'],
    [/^frees in (\d+)m$/, '将在 $1 分钟后释放'],
    [
      /^(\d+(?:\.\d+)?) of (\d+(?:\.\d+)?) premium sessions left today \((\d+(?:\.\d+)?) free \+ (\d+(?:\.\d+)?) from (.+)\)$/,
      '今日剩余 $1/$2 个高级会话（$3 个免费 + $4 个来自 $5）',
    ],
    [
      /^(\d+(?:\.\d+)?) of (\d+(?:\.\d+)?) free premium sessions left today$/,
      '今日剩余 $1/$2 个免费高级会话',
    ],
    [
      /^(\d+(?:\.\d+)?) of (\d+(?:\.\d+)?) plan sessions left this week$/,
      '本周剩余 $1/$2 个方案会话',
    ],
    [
      /^(\d+(?:\.\d+)?) of (\d+(?:\.\d+)?) plan sessions left this billing period$/,
      '本计费周期剩余 $1/$2 个方案会话',
    ],
    [/^(\d+(?:\.\d+)?) of (\d+(?:\.\d+)?) free sessions left this week$/, '本周剩余 $1/$2 个免费会话'],
    [/^(\d+(?:\.\d+)?) of (\d+(?:\.\d+)?) free sessions left this month$/, '本月剩余 $1/$2 个免费会话'],
    [/^(.+) plan usage$/, '$1 方案用量'],
    [
      /^That turn failed, so the rest of the queue is paused\. Start running the queued item\.$/,
      '该轮执行失败，因此队列其余任务已暂停。开始运行排队项目。',
    ],
    [
      /^That turn failed, so the rest of the queue is paused\. Start running the (\d+) queued items\.$/,
      '该轮执行失败，因此队列其余任务已暂停。开始运行 $1 个排队项目。',
    ],
    [/^This tab is stopped\. Start running the queued item\.$/, '此标签页已停止。开始运行排队项目。'],
    [
      /^This tab is stopped\. Start running the (\d+) queued items\.$/,
      '此标签页已停止。开始运行 $1 个排队项目。',
    ],
    [/^The queue is paused\. Start running the queued item\.$/, '队列已暂停。开始运行排队项目。'],
    [
      /^The queue is paused\. Start running the (\d+) queued items\.$/,
      '队列已暂停。开始运行 $1 个排队项目。',
    ],
    [
      /^DeepSeek V4 Flash (\d{2}\/\d{2}) is paused here after a steep price increase — pausing it is what keeps these sessions free for everyone\. We're working to bring it back\.$/,
      'DeepSeek V4 Flash $1 因价格大幅上涨已在此暂停；暂停该模型有助于继续为所有人提供免费会话。我们正努力恢复提供。',
    ],
    [/^Some models aren't available in (.+) yet$/, translateUnavailableRegion],
    [/^Using a (.+)\? More models are available on a direct connection$/, translatePrivacyConnection],
    [
      /^GLM 5\.2 promo — bounties pay up to (\d+) a day$/,
      'GLM 5.2 活动 — 悬赏任务每天最多奖励 $1 个会话',
    ],
    [/^(\d+) left today · ends (.+)$/, '今日剩余 $1 个会话 · 结束时间：$2'],
    [/^Complete a bounty to unlock · ends (.+)$/, '完成一个悬赏任务即可解锁 · 结束时间：$1'],
    [/^\+(\d+) sessions?\/day from referrals$/, '邀请奖励：每天 +$1 个会话'],
    [
      /^(\d+) sessions? left today · resets in (.+) · earned from bounties$/,
      '今日剩余 $1 个会话 · 将在 $2 后重置 · 通过悬赏任务获得',
    ],
    [
      /^(\d+) sessions? left today · earned from bounties$/,
      '今日剩余 $1 个会话 · 通过悬赏任务获得',
    ],
    [
      /^(\d+) sessions? left today · resets in (.+) · invite friends for \+1\/day \((\d+) earned\)$/,
      '今日剩余 $1 个会话 · 将在 $2 后重置 · 邀请好友每天增加 1 个会话（已获得 $3）',
    ],
    [
      /^(\d+) sessions? left today · invite friends for \+1\/day \((\d+) earned\)$/,
      '今日剩余 $1 个会话 · 邀请好友每天增加 1 个会话（已获得 $2）',
    ],
    [
      /^Resets in (.+) · refer more friends for \+1\/day \((\d+) earned\)$/,
      '将在 $1 后重置 · 继续邀请好友每天增加 1 个会话（已获得 $2）',
    ],
    [
      /^refer more friends for \+1\/day \((\d+) earned\)$/,
      '继续邀请好友每天增加 1 个会话（已获得 $1）',
    ],
    [
      /^Each qualified referral adds \+1 session per day \(up to \+(\d+)\)$/,
      '每位符合条件的受邀好友每天增加 1 个会话（最多 +$1）',
    ],
    [/^Max bonus earned \((\d+)\/(\d+)\)$/, '已获得最高奖励（$1/$2）'],
    [
      /^Refer more friends for \+1\/day \((\d+)\/(\d+)\)$/,
      '继续邀请好友，每天增加 1 个会话（$1/$2）',
    ],
    [/^invite friends for \+1\/day \((\d+) earned\)$/, '邀请好友，每天增加 1 个会话（已获得 $1）'],
    [/^(\d+) sessions? left today$/, '今日剩余 $1 个会话'],
    [/^Mission stopped:\s*(.+)$/, '目标已停止：$1'],
    [
      /^Used (\d+(?:\.\d+)?) (premium )?sessions? so far\.\s+Stays active between turns;\s+ends when you close the tab or its 1-hour (?:window|session) expires\.\s+(\d+(?:\.\d+)?\/\d+(?:\.\d+)?) (premium )?sessions used (today|this week)\.\s+(Specific to this model|Shared across all premium models|Shared across all available free models)\.\s+Each lasts up to 1 hour;\s+closing the tab ends it early, counts only time used \(rounded up to 0\.1\)\.\s+Resets (.+)\.$/,
      translateActiveSessionTooltip,
    ],
    [
      /^(\d+(?:\.\d+)?\/\d+(?:\.\d+)?) (premium )?sessions used (today|this week)\.\s+(Specific to this model|Shared across all premium models|Shared across all available free models)\.\s+Each lasts up to 1 hour;\s+closing the tab ends it early, counts only time used \(rounded up to 0\.1\)\.\s+Resets (.+)\.$/,
      translateSessionQuotaDetails,
    ],
    [
      /^You've used all ([\d,.]+) (premium sessions|sessions for this model|sessions) (today|this week)\.(?: (Switch to DeepSeek V4 Flash to keep going\.))? Resets (.+)\.$/,
      translateExhaustedSessionTooltip,
    ],
    [
      /^Out of (premium sessions|sessions for this model|sessions) (today|this week) · resets in (.+)$/,
      translateOutOfSessions,
    ],
    [/^(\d+(?:\.\d+)?) premium sessions? · ([\d:]+) left$/, '$1 个高级会话 · 剩余 $2'],
    [/^(\d+(?:\.\d+)?) sessions? · ([\d:]+) left$/, '$1 个会话 · 剩余 $2'],
    [/^(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?) premium sessions$/, '$1/$2 个高级会话'],
    [/^(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?) sessions$/, '$1/$2 个会话'],
    [/^(\d+(?:\.\d+)?) premium sessions?$/, '$1 个高级会话'],
    [/^(\d+(?:\.\d+)?) sessions?$/, '$1 个会话'],
    [/^The dev server (?:process )?(?:exited|died)\.$/, '开发服务器已退出。'],
    [/^(\d+) day streak$/, '$1 天连续使用'],
    [/^(\d+) days streak$/, '$1 天连续使用'],
    [/^🎁\s*(\d+) more days to unlock \+1 bonus session every day$/, '🎁 再坚持 $1 天，即可每天额外获得 1 个会话'],
    [/^(\d+) more days to unlock \+1 bonus session every day$/, '再坚持 $1 天，即可每天额外获得 1 个会话'],
    [/^Context (\d+)%\. Show token usage details$/, '上下文 $1%。显示令牌用量详情'],
    [/^Context (\d+)%$/, '上下文 $1%'],
    [/^Context ([\d.]+[kKmM]?)$/, '上下文 $1'],
    [/^Account: (.+)$/, '账户：$1'],
    [/^(.+) account$/, '$1 账户'],
    [/^Workspace and settings for (.+)$/, '$1 的工作区和设置'],
    [/^Insert (.+) skill$/, '插入 $1 技能'],
    [/^Move (.+) to a new window$/, '将“$1”移至新窗口'],
    [/^Close (.+)$/, '关闭“$1”'],
    [/^Edit "(.+)" before sending$/, '发送前编辑“$1”'],
    [/^New thread \((.+)\)$/, '新建任务（$1）'],
    [/^Close tab \((.+)\)$/, '关闭标签页（$1）'],
    [/^(\d+) queued prompts?$/, '$1 条排队中的提示'],
    [/^Auto-run stopped: (.+)$/, '自动运行已停止：$1'],
    [/^(.+) has merge conflicts$/, '$1 存在合并冲突'],
    [/^(.+) closed without merge$/, '$1 已关闭且未合并'],
    [/^(.+) — open in browser$/, '$1 — 在浏览器中打开'],
    [/^Threads in (.+)$/, '$1 中的任务'],
    [/^New thread in (.+)$/, '在 $1 中新建任务'],
    [/^Search (.+) threads$/, '搜索$1任务'],
    [/^No threads match “(.+)”$/, '没有匹配“$1”的任务'],
    [/^Preview (.+)$/, '预览 $1'],
    [/^Loading (.+)$/, '正在加载 $1'],
    [/^Remove (.+)$/, '移除 $1'],
    [/^(\d+) queued items?$/, '$1 个排队项目'],
    [/^(\d+) code comments? — sent with your message$/, '$1 条代码评论 — 将随消息发送'],
    [/^(.+) more — keep typing$/, '还有 $1 项 — 继续输入'],
    [/^…and (\d+) more — keep typing to narrow it down$/, '…还有 $1 项 — 继续输入以缩小范围'],
    [/^Open the stash \((\d+) messages?\)$/, '打开暂存（$1 条消息）'],
    [/^More actions for (.+)$/, '“$1”的更多操作'],
    [/^Reorder (.+)$/, '重新排序“$1”'],
    [/^Dismiss notification: (.+)$/, '关闭通知：$1'],
    [/^Delete “(.+)”$/, '删除“$1”'],
    [/^Installing Freebuff (.+)$/, '正在安装 Freebuff $1'],
    [/^Downloading Freebuff (.+)$/, '正在下载 Freebuff $1'],
    [/^Freebuff (.+) is ready$/, 'Freebuff $1 已就绪'],
    [/^Freebuff (.+) is current$/, 'Freebuff $1 已是最新版本'],
    [/^Freebuff (.+) could not be installed$/, '无法安装 Freebuff $1'],
    [/^Freebuff (.+) is available$/, 'Freebuff $1 可用'],
    [/^Update from (.+) to (.+)$/, '从 $1 更新到 $2'],
    [/^Looking for a newer version than Freebuff (.+)\.$/, '正在查找比 Freebuff $1 更新的版本。'],
    [/^(\d+) pixels$/, '$1 像素'],
  ]

  function sessionUnit(premium) {
    return `${premium ? '高级' : ''}会话`
  }

  function sessionPeriod(period) {
    return period === 'this week' ? '本周' : '今日'
  }

  function sessionScope(scope) {
    const translations = {
      'Specific to this model': '此额度仅适用于当前模型。',
      'Shared across all premium models': '所有高级模型共享此额度。',
      'Shared across all available free models': '所有可用免费模型共享此额度。',
    }
    return translations[scope] ?? scope
  }

  function sessionTier(tier) {
    const translations = {
      'premium sessions': '高级会话',
      'sessions for this model': '当前模型的会话',
      sessions: '会话',
    }
    return translations[tier] ?? tier
  }

  function translateActiveSessionTooltip(
    _match,
    cost,
    activePremium,
    ratio,
    quotaPremium,
    period,
    scope,
    reset,
  ) {
    return `已使用 ${cost} 个${sessionUnit(activePremium)}。会话会在多轮对话间保持有效；关闭标签页或 1 小时窗口到期时结束。${sessionPeriod(period)}已使用 ${ratio} 个${sessionUnit(quotaPremium)}。${sessionScope(scope)}每个会话最长持续 1 小时；提前关闭标签页会结束会话，仅按实际使用时长计费（向上取整到 0.1）。重置时间：${reset}。`
  }

  function translateSessionQuotaDetails(_match, ratio, premium, period, scope, reset) {
    return `${sessionPeriod(period)}已使用 ${ratio} 个${sessionUnit(premium)}。${sessionScope(scope)}每个会话最长持续 1 小时；提前关闭标签页会结束会话，仅按实际使用时长计费（向上取整到 0.1）。重置时间：${reset}。`
  }

  function translateExhaustedSessionTooltip(_match, limit, tier, period, switchHint, reset) {
    const hint = switchHint ? '切换到 DeepSeek V4 Flash 以继续。' : ''
    return `你已用尽${sessionPeriod(period)}的 ${limit} 个${sessionTier(tier)}。${hint}重置时间：${reset}。`
  }

  function translateOutOfSessions(_match, tier, period, remaining) {
    return `${sessionPeriod(period)}的${sessionTier(tier)}已用尽 · 将在 ${remaining} 后重置`
  }

  const translatedAttributes = ['aria-label', 'aria-valuetext', 'data-tooltip', 'placeholder', 'title']
  const ignoredParents = new Set(['SCRIPT', 'STYLE', 'CODE', 'PRE', 'TEXTAREA'])
  const ignoredContentSelector = [
    '.bubble',
    '.prose',
    '.fold-reasoning-text',
    '.reasoning-text',
    '.act-arg',
    '.tool-row-details',
    '.file-view-body',
    '.change-diff',
    '.diff-comment-text',
    '.xterm',
    '.terminal-context-output',
    '.note-text',
    '.qnote',
  ].join(',')
  const interactiveSelector =
    'button,a,[role="button"],[role="menuitem"],[role="menuitemradio"],[role="tab"],[role="checkbox"],[role="switch"],input,select'
  const stats = { text: 0, attributes: 0, contextual: 0, passes: 0 }

  function shouldIgnoreContent(element) {
    const ignored = element.closest?.(ignoredContentSelector)
    if (!ignored) return false
    return !element.closest?.(interactiveSelector)
  }

  function translateValue(value) {
    if (typeof value !== 'string' || value.length === 0) return value
    const leading = value.match(/^\s*/)?.[0] ?? ''
    const trailing = value.match(/\s*$/)?.[0] ?? ''
    const key = value.trim()
    if (!key) return value
    const direct = exact.get(key)
    if (direct !== undefined) return `${leading}${direct}${trailing}`
    for (const [pattern, replacement] of patterns) {
      if (pattern.test(key)) return `${leading}${key.replace(pattern, replacement)}${trailing}`
    }
    return value
  }

  function translateTextNode(node) {
    const parent = node.parentElement
    if (
      !parent ||
      ignoredParents.has(parent.tagName) ||
      parent.closest('[data-freebuff-zh-ignore]') ||
      shouldIgnoreContent(parent)
    )
      return
    const before = node.nodeValue
    const after = translateValue(before)
    if (after !== before) {
      node.nodeValue = after
      stats.text += 1
    }
  }

  function translateAttributes(element) {
    if (shouldIgnoreContent(element)) return
    for (const name of translatedAttributes) {
      if (!element.hasAttribute(name)) continue
      const before = element.getAttribute(name)
      const after = translateValue(before)
      if (after !== before) {
        element.setAttribute(name, after)
        stats.attributes += 1
      }
    }
  }

  function contextCandidates(scope, selector) {
    const candidates = []
    const closest = scope.matches?.(selector) ? scope : scope.closest?.(selector)
    if (closest) candidates.push(closest)
    for (const candidate of scope.querySelectorAll?.(selector) ?? []) candidates.push(candidate)
    return Array.from(new Set(candidates))
  }

  function applyContextRules(root) {
    const scope =
      root.nodeType === Node.ELEMENT_NODE ||
      root.nodeType === Node.DOCUMENT_NODE ||
      root.nodeType === Node.DOCUMENT_FRAGMENT_NODE
        ? root
        : root.parentElement
    if (!scope?.querySelectorAll) return
    for (const button of contextCandidates(scope, '.acts-toggle')) {
      for (const child of button.childNodes) {
        if (child.nodeType !== Node.TEXT_NODE) continue
        if (child.nodeValue.trim() === 's') {
          child.nodeValue = ''
          stats.contextual += 1
        }
      }
    }
    for (const heading of contextCandidates(scope, '.turn-changes-head')) {
      const labels = Array.from(heading.querySelectorAll('span'))
      const label = labels.find((candidate) => /^Agent changed\s+\d+\s+files?$/.test(candidate.textContent.trim()))
      if (!label) continue
      const match = label.textContent.trim().match(/^Agent changed\s+(\d+)\s+files?$/)
      if (!match) continue
      label.textContent = `智能体修改了 ${match[1]} 个文件`
      stats.contextual += 1
    }
  }

  function translateTree(root) {
    if (!root) return
    if (root.nodeType === Node.TEXT_NODE) {
      translateTextNode(root)
      applyContextRules(root)
      return
    }
    if (
      root.nodeType !== Node.ELEMENT_NODE &&
      root.nodeType !== Node.DOCUMENT_NODE &&
      root.nodeType !== Node.DOCUMENT_FRAGMENT_NODE
    )
      return
    if (root.nodeType === Node.ELEMENT_NODE) translateAttributes(root)
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT)
    let current
    while ((current = walker.nextNode())) {
      if (current.nodeType === Node.TEXT_NODE) translateTextNode(current)
      else translateAttributes(current)
    }
    applyContextRules(root)
    stats.passes += 1
  }

  function start() {
    document.documentElement.lang = 'zh-CN'
    translateTree(document.documentElement)
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'characterData') translateTextNode(mutation.target)
        else if (mutation.type === 'attributes') translateAttributes(mutation.target)
        else for (const node of mutation.addedNodes) translateTree(node)
      }
    })
    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: translatedAttributes,
    })
    globalThis.__FREEBUFF_ZH_PATCH__.observer = observer
  }

  globalThis.__FREEBUFF_ZH_PATCH__ = {
    id: PATCH_ID,
    version: PATCH_VERSION,
    stats,
    translate: translateValue,
    translateAll: () => translateTree(document.documentElement),
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true })
  else start()
})()
