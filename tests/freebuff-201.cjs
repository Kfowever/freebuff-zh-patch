const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')

const context = { Node: {}, NodeFilter: {}, document: { readyState: 'loading', addEventListener() {} } }
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../library/freebuff-zh-cn.js'), 'utf8'), context)
const { translate } = context.__FREEBUFF_ZH_PATCH__
const cases = [
  ['Downloading Freebuff 0.0.201', '正在下载 Freebuff 0.0.201'],
  ['Installing Freebuff 0.0.201', '正在安装 Freebuff 0.0.201'],
  ['What changed in Freebuff 0.0.201', 'Freebuff 0.0.201 更新内容'],
  ['You’re on Freebuff 0.0.201', '当前 Freebuff 版本为 0.0.201'],
  ['This document is over the 20 MB preview limit.', '此文档超过 20 MB 的预览上限。'],
  ['Send now: stops this response (Ctrl+Enter)', '立即发送：停止当前回复（Ctrl+Enter）'],
  ['Waiting for “My App” to finish in this project. This chat starts when it’s done.', '正在等待此项目中的“My App”结束，随后将启动此聊天。'],
  ['This model is closed right now (09:00–17:00). Choose another.', '此模型当前不可用（09:00–17:00）。请选择其他模型。'],
  ['Invite sent to friend@example.com', '邀请已发送至 friend@example.com'],
  ['Files must be under C:\\Work\\My App', '文件必须位于 C:\\Work\\My App 下'],
  ['File actions for app.ts', 'app.ts 的文件操作'],
  ['Forks of My Project', 'My Project 的分支聊天'],
  ['Open in Visual Studio Code', '在 Visual Studio Code 中打开'],
  ['Peak pricing: a session now uses 3 hours (3x) until 18:00, then 1x.', '高峰定价：当前每次会话消耗 3 小时（3x），持续至 18:00，之后为 1x。'],
  ['Off-peak pricing: a session now uses 1 hour (1x) until 09:00, then 3x at 09:00.', '非高峰定价：当前每次会话消耗 1 小时（1x），持续至 09:00，之后于 09:00 恢复为 3x。'],
  ["The accounts on this device share one daily allowance, and what's left today doesn't cover an hour of DeepSeek V4.1 Flash. Pick a model with a lower multiplier to keep going.", '此设备上的账户共用每日额度，今天的剩余额度不足以使用 DeepSeek V4.1 Flash 一小时。请选择倍率更低的模型以继续。'],
]
for (const [original, expected] of cases) assert.equal(translate(original), expected)
console.log('PASS: ' + cases.length + ' Freebuff 0.0.201 dynamic translation assertions')
