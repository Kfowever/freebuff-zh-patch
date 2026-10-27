const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm')
const assert = require('node:assert/strict')
const context = {Node:{}, NodeFilter:{}, document:{readyState:'loading',addEventListener(){}}}
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../freebuff-zh-cn.js'),'utf8'),context)
const t=context.__FREEBUFF_ZH_PATCH__.translate
const cases=[
  [
    "This model is leaving Freebuff soon. Pick another model to keep working without interruption.",
    "此模型即将从 Freebuff 下线。请选择其他模型，以便继续工作。"
  ],
  [
    "Unable to connect to the terminal",
    "无法连接到终端"
  ],
  [
    "Stop task",
    "停止任务"
  ],
  [
    "A chat’s paid hour ends too.",
    "一个聊天的付费小时也会结束。"
  ],
  [
    "Type your answer…",
    "输入你的回答…"
  ],
  [
    "Freebuff has a question — answer above to continue.",
    "Freebuff 有一个问题——请在上方回答以继续。"
  ],
  [
    "Running in this conversation. It finishes on its own; stopping ends it, and it won’t resume.",
    "正在此对话中运行。任务会自行完成；停止后将无法恢复。"
  ],
  [
    "DNS and HTTPS are ready. Press Make primary to start serving the site at this address.",
    "DNS 和 HTTPS 已就绪。点击“设为主地址”即可通过此地址提供网站。"
  ],
  [
    "Show all models",
    "显示所有模型"
  ],
  [
    "Connected.",
    "已连接。"
  ],
  [
    "A sponsor is paying for this run — stopping ends it and it won’t resume.",
    "赞助方正在为此次运行付费——停止后任务将结束且无法继续。"
  ],
  [
    "This chat did not finish moving to this computer. Choose Local to finish moving it.",
    "此聊天未能完成迁移到此电脑。选择“本地”以完成迁移。"
  ],
  [
    "Queued — starts when the Mission finishes",
    "已排队 — 当前目标结束后启动"
  ],
  [
    "Freebuff has a question — answer above to continue",
    "Freebuff 有一个问题——请在上方回答以继续"
  ],
  [
    "Find services",
    "查找服务"
  ],
  [
    "Could not close the session",
    "无法关闭会话"
  ],
  [
    "List every model in the model picker. When off, it offers one model at three thinking levels: Fast, Default and Max.",
    "在模型选择器中列出所有模型。关闭后，将提供一个模型及三个思考等级：快速、默认和最高。"
  ],
  [
    "Stop this sponsored task?",
    "要停止此赞助任务吗？"
  ],
  [
    "Keep running",
    "继续运行"
  ],
  [
    "Your other chats stop too until you reopen Freebuff.",
    "其他聊天也会停止，直到你重新打开 Freebuff。"
  ],
  [
    "Stop and close session",
    "停止并关闭会话"
  ],
  [
    "Your key stays out of chat and isn’t sent to Freebuff’s servers. Freebuff makes it available to this setup and, when working directly in your project, saves it in a git-ignored environment file for your app.",
    "你的密钥不会出现在聊天中，也不会发送到 Freebuff 服务器。Freebuff 会将密钥用于此项配置；直接在项目中工作时，会将其保存到应用的环境文件中，并让 Git 忽略该文件。"
  ],
  [
    "The sponsor pays for this run. It runs in the background and edits this project’s files without committing, so you can keep working in your own chats. You can undo its file changes.",
    "本次运行由赞助方付费。它会在后台运行并修改此项目的文件，但不会提交更改，因此你可以继续在自己的聊天中工作。你可以撤销它对文件所做的更改。"
  ],
  [
    "Wait for this chat to finish moving",
    "等待此聊天完成迁移"
  ],
  [
    "An unexpected bug occurred.",
    "发生了意外错误。"
  ],
  [
    "This project has too many files to summarize here (over 300 outside dependency and build folders). To continue, set up Git yourself: in a terminal in this folder run `git init`, add a `.gitignore` for dependencies, build output and `.env` files, then `git add -A` and `git commit -m \"Initial commit\"`. Then choose Check again.",
    "此项目文件过多，无法在此处汇总（依赖项和构建目录之外超过 300 个文件）。若要继续，请自行设置 Git：在此文件夹的终端中运行 `git init`，添加用于忽略依赖项、构建输出和 `.env` 文件的 `.gitignore`，然后运行 `git add -A` 和 `git commit -m \"Initial commit\"`。之后选择“重新检查”。"
  ],
  [
    "Leaving",
    "即将下线"
  ]
]
cases.push(
 ['Stop Settings’s sponsored task?', '停止 Settings 的赞助任务？'],
 ['Quit and stop Settings’s sponsored task?', '退出并停止 Settings 的赞助任务？'],
 ['Settings’s sponsored task is running in the background. Quitting ends it, and it won’t resume when you reopen Freebuff.', 'Settings 的赞助任务正在后台运行。退出会结束该任务，重新打开 Freebuff 后也无法恢复。'],
 ['It’s running in the background, so you can keep working in your own chats. Settings is paying for this run — stopping ends it and it won’t resume.', '它正在后台运行，因此你可以继续处理自己的聊天。Settings正在为此次运行付费 — 停止后任务将结束且无法继续。'],
 ['Offers are paused.', '赞助任务已暂停。'],
 ['Offers are paused until 2026/10/28 09:00.', '赞助任务已暂停，将于 2026/10/28 09:00 恢复。'],
 ['Could not save Show all models: denied', '无法保存“显示所有模型”设置：denied'],
 ['This removes the secret from Settings. Code that depends on it may stop working.', '这会从 Settings 中移除此密钥。依赖它的代码可能会停止工作。'],
 ['Thread references for this prompt (use the full threadId with read_thread_context):\nabc', 'Thread references for this prompt (use the full threadId with read_thread_context):\nabc'],
 ['New members earn $1.50 once. Connect a Discord account at least 7 days old and join the Freebuff server.', '新成员可一次性获得 $1.50。请关联注册至少 7 天的 Discord 账户，并加入 Freebuff 服务器。'],
 ['Waiting for Settings.', '正在等待 Settings。']
)
for (const n of ['1','2','1,000']) cases.push(
 [`Quit and stop ${n} sponsored tasks?`, `退出并停止 ${n} 个赞助任务？`],
 [`${n} sponsored tasks are running in the background. Quitting ends them, and they won’t resume when you reopen Freebuff.`, `有 ${n} 个赞助任务正在后台运行。退出会结束这些任务，重新打开 Freebuff 后也无法恢复。`],
 [`${n} paid hours end too.`, `另有 ${n} 个付费小时也会结束。`],
 [`This chat has a paid hour with ${n} ${n==='1'?'minute':'minutes'} left. Closing it ends the hour.`, `此聊天的付费小时还剩 ${n} 分钟。关闭聊天会结束这一小时。`],
 [`Available in ${n}m`, `${n} 分钟后可用`],
 [`Got it. We'll ask again in ${n} days.`, `知道了。${n} 天后会再次询问。`]
)
let assertions=0
for (const [en,zh] of cases) { assert.equal(t(en),zh,en); assertions++; assert.equal(t(zh),zh,'idempotent: '+zh); assertions++ }
console.log(`PASS: ${assertions} Freebuff 0.9.0 translation assertions`)
