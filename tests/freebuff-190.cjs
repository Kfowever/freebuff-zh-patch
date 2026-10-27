const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const context = { Node: {}, NodeFilter: {}, document: { readyState: 'loading', addEventListener() {} } }
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'freebuff-zh-cn.js'), 'utf8'), context)
const { translate, version } = context.__FREEBUFF_ZH_PATCH__
assert.equal(version, '0.9.0')
const cases = [
  ['New chat', '新建聊天'],
  ['Model Providers', '模型服务商'],
  ['Keyboard shortcuts', '键盘快捷键'],
  ['Hours', '小时额度'],
  ['Daily hours', '每日小时额度'],
  ['Sites', '站点'],
  ['Import theme', '导入主题'],
  ['DNS routing', 'DNS 路由'],
  ['No cap', '无上限'],
  ['Add another GitHub account', '再添加一个 GitHub 账户'],
  ['Agent changed 2 files', '智能体修改了 2 个文件'],
  ['Peak pricing · 2.5x off-peak', '高峰价格 · 低峰时段为 2.5x'],
  ['Off-peak pricing · 2.5x at peak', '低峰价格 · 高峰时段为 2.5x'],
  ['Ends your session and starts a new one for 1,000 hours.', '结束当前会话，并以 1,000 小时开始新会话。'],
  ['Ends your current session. Your balance is unavailable. Starting a session may spend hours from your daily allowance or wallet. Continue?', '结束当前会话。余额暂不可用。启动会话可能会消耗每日额度或钱包中的小时额度。是否继续？'],
  ["Latest refund confirmed: 3 hours for GPT-6 Sol's failed start. 2 hours credited back to the Oct 26 daily pool; 1 hour returned to your wallet.", '已确认最近一笔退款：GPT-6 Sol 启动失败，退款总额为 3 小时额度；2 小时额度已退回到 Oct 26 的每日额度，1 小时额度已退回到你的钱包。'],
]
cases.push(...[
  [
    "Starter raises your daily hours from 30 to 50 and adds 60 hours a month. $8/mo.",
    "Starter 将每日小时额度从 30 提高至 50，并每月增加 60 小时额度。每月收费 $8。"
  ],
  [
    "Starter raises your daily hours from 30 to 50 and adds 60 hours a month. $5 first month, $8/mo after.",
    "Starter 将每日小时额度从 30 提高至 50，并每月增加 60 小时额度。首月收费 $5，之后每月收费 $8。"
  ],
  [
    "Plus raises your daily hours from 50 to 80 and your monthly bonus from 60 to 100 hours. $25/mo, replacing Starter from today.",
    "Plus 将每日小时额度从 50 提高至 80，并将每月奖励从 60 提高至 100 小时额度。每月收费 $25，今天起替换 Starter。"
  ],
  [
    "DeepSeek V4.1 Flash: 7 hours a day on Starter instead of 1 hour for free. $8/mo.",
    "DeepSeek V4.1 Flash: 每日可在 Starter 方案中使用 7 小时额度；免费额度为每天 1 小时。月费 $8。"
  ],
  [
    "7 hours a day on Starter instead of 1 hour for free. $8/mo.",
    "每日可在 Starter 方案中使用 7 小时额度；免费额度为每天 1 小时。月费 $8。"
  ],
  [
    "DeepSeek V4.1 Flash: 7 hours a day on Starter instead of 1 hour for free. $5 first month, $8/mo after.",
    "DeepSeek V4.1 Flash：Starter 方案每天可用 7 小时，免费额度为 1 小时。首月 $5，之后每月 $8。"
  ]
])
for (const count of ['1', '2', '1,000']) {
  const unit = count === '1' ? 'hour' : 'hours'
  cases.push(
    [`${count} ${unit}`, `${count} 小时`],
    [`Claim earned hours when starting this session, then spend ${count} ${unit}?`, `开始此会话时领取已赚取的小时额度，然后使用 ${count} 小时额度？`],
    [`Claim earned hours when starting this session, then spend ${count} ${unit} and end your current session?`, `开始此会话时领取已赚取的小时额度，然后使用 ${count} 小时额度并结束当前会话？`],
    [`Today's hours are spent. This uses ${count} ${unit} from your wallet.`, `今日小时额度已用完。将从钱包中扣除 ${count} 小时额度。`],
    [`Today's hours are spent. This uses ${count} ${unit} from your wallet and ends your current session.`, `今日小时额度已用完。将从钱包中扣除 ${count} 小时额度并结束当前会话。`],
    [`An hour of this model uses ${count} ${unit}, more than the 0 hours you have left today plus your wallet.`, `此模型每小时消耗 ${count} 小时额度，超过你今天剩余的 0 小时额度及钱包余额。`],
  )
}
for (const [input, expected] of cases) {
  assert.equal(translate(input), expected, input)
  assert.equal(translate(expected), expected, `repeat translation: ${input}`)
}
for (const value of ['Search', 'Read', 'Run', 'Quote', 'session', 'GPT-6-Luna', 'Kanagawa', 'src/Hours.ts', '$25']) {
  assert.equal(translate(value), value, `preserve: ${value}`)
}
console.log(`PASS: ${cases.length * 2 + 10} Freebuff 0.0.190 assertions`)
