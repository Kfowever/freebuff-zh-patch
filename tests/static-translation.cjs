const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')

global.Node = {
  ELEMENT_NODE: 1,
  TEXT_NODE: 3,
  DOCUMENT_NODE: 9,
  DOCUMENT_FRAGMENT_NODE: 11,
}
global.NodeFilter = { SHOW_ELEMENT: 1, SHOW_TEXT: 4 }
global.document = {
  readyState: 'loading',
  addEventListener() {},
}

const patchPath = process.argv[2] ?? require('node:path').join(__dirname, '..', 'freebuff-zh-cn.js')
vm.runInThisContext(fs.readFileSync(patchPath, 'utf8'), { filename: patchPath })
const translate = global.__FREEBUFF_ZH_PATCH__.translate

const cases = [
  ['Freebucks balance temporarily unavailable.', '暂时无法获取 Freebucks 余额。'],
  ['Smart & Fast · May use data for AI training', '智能且快速 · 可能将数据用于 AI 训练'],
  ['Queue · May use data for AI training', '需要排队 · 可能将数据用于 AI 训练'],
  ['Your API providers', '你的 API 服务商'],
  ['YOUR API PROVIDERS', '你的 API 服务商'],
  ['Your keys · Your provider’s billing', '使用你的密钥 · 由你的服务商计费'],
  ['Connect a provider…', '连接服务商…'],
  ['Connect a provider...', '连接服务商…'],
  ['Connect your first provider', '连接你的第一个服务商'],
  ['Manage providers ', '管理服务商 '],
  ['Connect a provider to use your own API key. Available across projects on this computer.', '连接服务商以使用你自己的 API 密钥。此电脑上的各项目均可使用。'],
  ['Your models. Your provider account.', '使用你的模型和服务商账户。'],
  ['Model requests go directly to your provider and use its billing. BYOK tasks are ad-free.', '模型请求直接发送到你的服务商，并由其计费。使用自有 API 密钥的任务不含广告。'],
  ['Bring an OpenRouter key, or connect another OpenAI-compatible service.', '使用 OpenRouter 密钥，或连接其他兼容 OpenAI 接口的服务。'],
  ['You can switch this task to your API provider. After switching, start a new task to use Freebuff models again.', '你可以将此任务切换到自己的 API 服务商。切换后，如需再次使用 Freebuff 模型，请新建任务。'],
  ['About privacy and supported features', '隐私与支持的功能'],
  ['Changes are saved immediately.', '更改会立即保存。'],
  ['Done', '完成'],
  ['Provider API key', '服务商 API 密钥'],
  ['Paste your API key', '粘贴你的 API 密钥'],
  ['New API key for Personal', 'Personal 的新 API 密钥'],
  ['Saved in your OS credential store. Never in project files.', '保存在操作系统凭据存储中，不会写入项目文件。'],
  ['Credential verified. Coding support is still untested.', '凭据已验证。编程支持仍未测试。'],
  ['Context window tokens', '上下文窗口令牌数'],
  ['Use limits supported by your model. These are budgets, not detected capabilities.', '请填写模型支持的限制值。这些是用量上限，并非自动检测到的模型能力。'],
  ['https://provider.example/v1', 'https://provider.example/v1'],
  ['provider/model-name', 'provider/model-name'],
  ['All connectors (100)', '全部连接器（100）'],
  ['Details for Linear', 'Linear 的详细信息'],
  ['Reasoning effort for GLM 5.3 Flash', 'GLM 5.3 Flash 的推理力度'],
  ['Commit · Effort 3', '提交 · 投入程度 3'],
  ['Claim earned Freebucks when starting this session, then spend 12 Freebucks and end your current session?', '启动此会话时领取已赚取的 Freebucks，然后花费 12 Freebucks并结束当前会话？'],
  ['Claim earned Freebucks when starting this session, then spend 3 Freebucks?', '启动此会话时领取已赚取的 Freebucks，然后花费 3 Freebucks？'],
  ['Part of the interface did not start. Reload once; if this screen returns, reinstall the\n            latest version. Your projects and conversations are safe.', '部分界面未能启动。请重新加载一次；若再次出现此页面，请重新安装最新版本。你的项目和对话不会丢失。'],
  ['Type a message — / for skills, @ for threads or files', '输入消息 — / 选择技能，@ 引用任务或文件'],
  ['Project threads and files', '项目中的任务和文件'],
  ['Thread mentions', '任务引用'],
  ['New space', '新建空间'],
  ['Return to latest', '返回最新消息'],
  ['Older messages', '更早的消息'],
  ['Saved thread snapshot · read-only', '已保存的任务快照 · 只读'],
  ['Refund processing', '退款处理中'],
  ['0.5 Freebucks refunded', '已退还 0.5 Freebucks'],
  ['Retrying 2 session ends', '正在重试结束 2 个会话'],
  ['3 refunds processing', '3 笔退款处理中'],
  ['Session started 9月12日 19:30', '会话开始于 9月12日 19:30'],
  ['Choose tools for GitHub', '为 GitHub 选择工具'],
  ['Connected · Manage GitHub', '已连接 · 管理 GitHub'],
  ['No connector matches “example”.', '没有匹配“example”的连接器。'],
  ['Connect to my-server?', '连接到 my-server？'],
  ['Run my-server?', '运行 my-server？'],
  ['Enable my-server', '启用 my-server'],
  ['Disable my-server', '禁用 my-server'],
  ['Safe only', '仅选择标记为安全的工具'],
  ['Your connectors', '你的连接器'],
  ['Find, create, and update issues, projects, and comments.', '查找、创建和更新问题、项目及评论。'],
  ['Couldn’t refresh your connectors.', '无法刷新你的连接器。'],
  ['Freebuff couldn’t load', 'Freebuff 无法加载'],
  ['GLM 5.3 Flash', 'GLM 5.3 Flash'],
  ['DeepSeek V4.1 Flash', 'DeepSeek V4.1 Flash'],
  ['@Auth redesign', '@Auth redesign'],
  ['~/.agents/mcp.json', '~/.agents/mcp.json'],
  ['Relaunch', '重新启动'],
  ['The dev server process exited.', '开发服务器进程已退出。'],
  ['The dev server died.', '开发服务器已退出。'],
  ['0.5 sessions · 31:01 left', '0.5 个会话 · 剩余 31:01'],
  ['1 premium session · 1:00:00 left', '1 个高级会话 · 剩余 1:00:00'],
  ['1/6 sessions', '1/6 个会话'],
  ['2.5/8 premium sessions', '2.5/8 个高级会话'],
  [
    'Used 0.5 sessions so far. Stays active between turns; ends when you close the tab or its 1-hour window expires. 1/6 sessions used today. Shared across all available free models. Each lasts up to 1 hour; closing the tab ends it early, counts only time used (rounded up to 0.1). Resets 周一15:00.',
    '已使用 0.5 个会话。会话会在多轮对话间保持有效；关闭标签页或 1 小时窗口到期时结束。今日已使用 1/6 个会话。所有可用免费模型共享此额度。每个会话最长持续 1 小时；提前关闭标签页会结束会话，仅按实际使用时长计费（向上取整到 0.1）。重置时间：周一15:00。',
  ],
  [
    'Used 1 premium session so far. Stays active between turns; ends when you close the tab or its 1-hour session expires. 2/4 premium sessions used this week. Specific to this model. Each lasts up to 1 hour; closing the tab ends it early, counts only time used (rounded up to 0.1). Resets 周日09:00.',
    '已使用 1 个高级会话。会话会在多轮对话间保持有效；关闭标签页或 1 小时窗口到期时结束。本周已使用 2/4 个高级会话。此额度仅适用于当前模型。每个会话最长持续 1 小时；提前关闭标签页会结束会话，仅按实际使用时长计费（向上取整到 0.1）。重置时间：周日09:00。',
  ],
  [
    '1/6 sessions used today. Shared across all premium models. Each lasts up to 1 hour; closing the tab ends it early, counts only time used (rounded up to 0.1). Resets 周一15:00.',
    '今日已使用 1/6 个会话。所有高级模型共享此额度。每个会话最长持续 1 小时；提前关闭标签页会结束会话，仅按实际使用时长计费（向上取整到 0.1）。重置时间：周一15:00。',
  ],
  [
    "You've used all 6 sessions today. Switch to DeepSeek V4 Flash to keep going. Resets 周一15:00.",
    '你已用尽今日的 6 个会话。切换到 DeepSeek V4 Flash 以继续。重置时间：周一15:00。',
  ],
  [
    "You've used all 3 premium sessions this week. Resets 周日09:00.",
    '你已用尽本周的 3 个高级会话。重置时间：周日09:00。',
  ],
  ['Out of sessions today · resets in 2h 10m', '今日的会话已用尽 · 将在 2h 10m 后重置'],
  ['Out of sessions for this model this week · resets in 3d', '本周的当前模型的会话已用尽 · 将在 3d 后重置'],
  ['…and 12 more — keep typing to narrow it down', '…还有 12 项 — 继续输入以缩小范围'],
  ['Open the stash (2 messages)', '打开暂存（2 条消息）'],
  [
    'Include your project’s AGENTS.md (or CLAUDE.md) instructions in the agent’s context. Applies to every thread from its next message.',
    '将项目中的 AGENTS.md（或 CLAUDE.md）指令加入智能体上下文。从下一条消息开始，适用于该项目的所有任务。',
  ],
  ['Starting Freebuff orchestrator…', 'Freebuff 编排器正在启动…'],
  ['Mission', '目标'],
  ['Edit mission', '编辑目标'],
  ['Mission prompt', '目标提示'],
  ['Effort', '投入程度'],
  ['Minimal — only a major concrete gain', '最小 — 仅追求重大且具体的改进'],
  ['Lean — buy clear improvements', '精简 — 追求明确改进'],
  ['Balanced — refine while gains are clear', '平衡 — 在收益明确时继续改进'],
  ['Thorough — pursue smaller credible gains', '详尽 — 追求较小但可信的改进'],
  ['Exhaustive — stop when gains are marginal', '穷尽 — 改进收益变小后停止'],
  ['Explore', '探索'],
  ['Commit', '提交'],
  ['Merge PR', '合并 PR'],
  ['Custom', '自定义'],
  ['Take it all the way to a merged pull request', '一直推进到拉取请求合并完成'],
  ['Pause queued work', '暂停排队中的任务'],
  ['Let the current turn finish, then pause queued work', '等待当前任务完成后，再暂停排队中的任务'],
  ['Mission stopped: the queue was paused', '目标已停止：the queue was paused'],
  ['Close tab when queue finishes', '队列完成后关闭标签页'],
  ['Wait for this thread to finish', '等待此任务完成'],
  ['Could not open tab', '无法打开标签页'],
  ['Turn failed', '执行失败'],
  ['Merge conflict', '合并冲突'],
  ['Freebuff couldn’t load', 'Freebuff 无法加载'],
  ['Reload Freebuff', '重新加载 Freebuff'],
  ['100% free agent', '100% 免费智能体'],
  ['Images', '图像'],
  ['Balanced', '平衡'],
  ["Some models aren't available in Japan yet", '部分模型暂未在日本提供'],
  [
    "DeepSeek V4 Flash 07/31 is paused here after a steep price increase — pausing it is what keeps these sessions free for everyone. We're working to bring it back.",
    'DeepSeek V4 Flash 07/31 因价格大幅上涨已在此暂停；暂停该模型有助于继续为所有人提供免费会话。我们正努力恢复提供。',
  ],
  ['Refer friends for more free sessions', '邀请好友，获得更多免费会话'],
  ['Each qualified referral adds +1 session per day (up to +3)', '每位符合条件的受邀好友每天增加 1 个会话（最多 +3）'],
  ['Copy invite link', '复制邀请链接'],
  ['✓ Copied!', '✓ 已复制！'],
  ['GLM 5.2 dashboard ↗', 'GLM 5.2 面板 ↗'],
  ['Claim bounties and track referrals', '领取奖励并查看邀请进度'],
  [
    'Referrals qualify once a GitHub account (4+ months old) is connected',
    '关联注册满 4 个月的 GitHub 账户后，邀请才会计入奖励',
  ],
  ['Connect GitHub to qualify ↗', '关联 GitHub 以满足条件 ↗'],
  ['Max bonus earned (3/3)', '已获得最高奖励（3/3）'],
  ['Refer more friends for +1/day (1/3)', '继续邀请好友，每天增加 1 个会话（1/3）'],
  ['invite friends for +1/day (2 earned)', '邀请好友，每天增加 1 个会话（已获得 2）'],
  ['3 sessions left today', '今日剩余 3 个会话'],
  ["Some models aren't available on this connection", '当前网络连接暂不提供部分模型'],
  ["Some models aren't available in Germany yet", '部分模型暂未在德国提供'],
  ["Some models aren't available in your region yet", '部分模型暂未在你所在的地区提供'],
  ['Using a VPN? More models are available on a direct connection', '检测到正在使用VPN；使用直连网络可获得更多模型'],
  [
    'Using a VPN, Tor, or residential proxy? More models are available on a direct connection',
    '检测到正在使用VPN、Tor、住宅代理；使用直连网络可获得更多模型',
  ],
  [
    "We couldn't confirm your region, so we're showing models available everywhere",
    '无法确认你所在的地区，因此目前只显示全球可用的模型',
  ],
  [
    "We couldn't finish a network check, so we're showing models available everywhere",
    '网络检查未能完成，因此目前只显示全球可用的模型',
  ],
  ['GLM 5.2 promo — bounties pay up to 3 a day', 'GLM 5.2 活动 — 悬赏任务每天最多奖励 3 个会话'],
  ['2 left today · ends Aug 31', '今日剩余 2 个会话 · 结束时间：Aug 31'],
  ['Complete a bounty to unlock · ends Aug 31', '完成一个悬赏任务即可解锁 · 结束时间：Aug 31'],
  ['+2 sessions/day from referrals', '邀请奖励：每天 +2 个会话'],
  ['GLM 5.2 unlocked', 'GLM 5.2 已解锁'],
  [
    '2 sessions left today · resets in 3h · earned from bounties',
    '今日剩余 2 个会话 · 将在 3h 后重置 · 通过悬赏任务获得',
  ],
  ['2 sessions left today · earned from bounties', '今日剩余 2 个会话 · 通过悬赏任务获得'],
  [
    '2 sessions left today · resets in 3h · invite friends for +1/day (1 earned)',
    '今日剩余 2 个会话 · 将在 3h 后重置 · 邀请好友每天增加 1 个会话（已获得 1）',
  ],
  ['GLM 5.2 — today’s sessions used', 'GLM 5.2 — 今日会话已用尽'],
  [
    'Resets in 3h · refer more friends for +1/day (2 earned)',
    '将在 3h 后重置 · 继续邀请好友每天增加 1 个会话（已获得 2）',
  ],
  ['Refer friends to unlock GLM 5.2', '邀请好友以解锁 GLM 5.2'],
  [
    'Each qualified referral earns a daily 1-hour session of the most powerful open-source model',
    '每位符合条件的受邀好友每天可获得一个 1 小时会话，用于最强大的开源模型',
  ],
  ['Meet Freebucks', '认识 Freebucks'],
  ['A fresh pool every day', '每天刷新额度'],
  ['Agent mode', '智能体模式'],
  ['Build', '构建'],
  ['Plan', '计划'],
  ['Plan approval', '计划审批'],
  ['The plan is ready for your review', '计划已准备好，等待你审阅'],
  ['Freebuff has 3 questions', 'Freebuff 有 3 个问题'],
  ['Connectors', '连接器'],
  ['No servers configured yet. Add one to ', '尚未配置服务器。请添加到 '],
  [', then reload.', '，然后重新加载。'],
  ['Open without saved tabs', '不恢复已保存的标签页'],
  ['Start your streak', '开始连续使用'],
  ['Open project…', '打开项目…'],
  ['Threads you close land here.', '你关闭的任务会显示在这里。'],
  ['Your account', '你的账户'],
  ['100 / 100 daily · resets in 4h 7m', '100/100 每日额度 · 将在 4h 7m 后重置'],
  ['0 Freebucks · Labor Day weekend (through Sep 7 PT)', '0 Freebucks · 劳动节周末（太平洋时间 Sep 7 结束）'],
  [
    'Queues, then falls back · May use data for AI training',
    '繁忙时排队，随后切换至 DeepSeek V4 Flash · 可能将数据用于 AI 训练',
  ],
  ['Strong all-around', '综合能力强'],
  [
    'Peak pricing · +10 Freebucks until 3 AM PT · May use data for AI training',
    '高峰价格 · 太平洋时间 3 AM 前额外需要 10 Freebucks · 可能将数据用于 AI 训练',
  ],
  [
    'Step 1 of 2 · Download Claude Code 2.1.257 for Freebuff (74 MB; 208 MB installed).',
    '第 1/2 步 · 下载供 Freebuff 使用的 Claude Code 2.1.257（下载 74 MB；安装后 208 MB）。',
  ],
  ['Step 1 of 2 · Install the Codex CLI', '第 1/2 步 · 安装 Codex CLI'],
  ['Download for Freebuff', '下载供 Freebuff 使用'],
  ['Mobile', '移动端'],
  [
    "Mirror this computer's open threads to the Freebuff iOS app, and let the phone send messages and approve elevated commands.",
    '将此电脑中打开的任务镜像到 Freebuff iOS 应用，并允许手机发送消息及批准提权命令。',
  ],
  ['Mirror to my phone', '镜像到我的手机'],
  ['This computer: ', '此电脑： '],
  ['Off', '关闭'],
  ['Search 12 connectors…', '搜索 12 个连接器…'],
  ['No connector matches “github”.', '没有匹配“github”的连接器。'],
  ['Saved missions', '已保存的目标'],
  ['Sprint — roughly complete beats polished', '冲刺 — 大致完成优先于精雕细琢'],
  ['Opening your saved workspace took too long.', '打开已保存的工作区耗时过长。'],
  ['This file changed on disk. Reload it before you save again.', '此文件已在磁盘上发生变化，请重新加载后再保存。'],
  ['Showing the first 512 KB read-only', '正在以只读方式显示前 512 KB'],
  [
    '3/10 sessions today. Each lasts up to 1 hour. Resets Mon 15:00.',
    '今日会话：3/10。每个会话最长持续 1 小时。重置时间：Mon 15:00。',
  ],
  [
    '2/4 starts today. Each start opens up to 1 hour; ending early still uses one start. Resets Tue 09:00.',
    '今日启动次数：2/4。每次启动可使用最长 1 小时；提前结束仍会消耗一次。重置时间：Tue 09:00。',
  ],
  ['Out of Freebucks · more in 2h', 'Freebucks 已用尽 · 将在 2h 后补充'],
  ['Free sessions are used first · today resets in 3h', '优先使用免费会话 · 今日额度将在 3h 后重置'],
  [
    "Today's Freebucks are spent. This uses 4 from your wallet and ends your current session.",
    '今日 Freebucks 已用尽。将从钱包余额中使用 4，并结束当前会话。',
  ],
  [
    'Ends your session and starts a new one for 15 Freebucks.',
    '结束当前会话，并使用 15 Freebucks 启动新会话。',
  ],
  [
    '6 of 10 premium sessions left today (3 free + 7 from Plus)',
    '今日剩余 6/10 个高级会话（3 个免费 + 7 个来自 Plus）',
  ],
  [
    'The queue is paused. Start running the 2 queued items.',
    '队列已暂停。开始运行 2 个排队项目。',
  ],
  [
    'That turn failed, so the rest of the queue is paused. Start running the queued item.',
    '该轮执行失败，因此队列其余任务已暂停。开始运行排队项目。',
  ],
  [
    '5 Freebucks buys one hour of unlimited messages and tool calls. Charged once, when the session starts.',
    '5 Freebucks 可购买 1 小时不限量消息和工具调用。会话开始时一次扣除。',
  ],
  ['Mission stopped: user-authored text', '目标已停止：user-authored text'],
]

for (const [input, expected] of cases) assert.equal(translate(input), expected, input)

for (const untouched of [
  'physics-lab\\src\\engine\\PhysicsEngine.js',
  'DeepSeek V4 Flash',
  'syncMeshes',
  'file',
  'open',
  'session',
  'Please review the Mission implementation and open the file.',
]) {
  assert.equal(translate(untouched), untouched)
}

const bubbleParent = {
  tagName: 'DIV',
  closest(selector) {
    if (selector.includes('.bubble')) return this
    return null
  },
}
const bubbleText = { nodeType: Node.TEXT_NODE, nodeValue: 'Mission', parentElement: bubbleParent }
const fakeRoot = {
  nodeType: Node.ELEMENT_NODE,
  tagName: 'MAIN',
  matches() {
    return false
  },
  closest() {
    return null
  },
  hasAttribute() {
    return false
  },
  querySelectorAll() {
    return []
  },
}
document.documentElement = fakeRoot
document.createTreeWalker = () => {
  let emitted = false
  return {
    nextNode() {
      if (emitted) return null
      emitted = true
      return bubbleText
    },
  }
}
global.__FREEBUFF_ZH_PATCH__.translateAll()
assert.equal(bubbleText.nodeValue, 'Mission', 'chat-body text must remain untouched')

for (const protectedSelector of ['.prose', '.change-diff', '.xterm', '.note-text']) {
  const parent = {
    tagName: 'DIV',
    closest(selector) {
      return selector.includes(protectedSelector) ? this : null
    },
  }
  const text = { nodeType: Node.TEXT_NODE, nodeValue: 'Plan', parentElement: parent }
  document.createTreeWalker = () => {
    let emitted = false
    return {
      nextNode() {
        if (emitted) return null
        emitted = true
        return text
      },
    }
  }
  global.__FREEBUFF_ZH_PATCH__.translateAll()
  assert.equal(text.nodeValue, 'Plan', `${protectedSelector} text must remain untouched`)
}

console.log(`Static translation assertions passed: ${cases.length + 12}`)
