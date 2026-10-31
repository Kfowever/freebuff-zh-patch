const assert = require('node:assert/strict')
const fs = require('node:fs'), vm = require('node:vm'), path = require('node:path')
const context = {Node:{}, NodeFilter:{}, document:{readyState:'loading', addEventListener(){}}}
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../library/freebuff-zh-cn.js'), 'utf8'), context)
const t = context.__FREEBUFF_ZH_PATCH__.translate
const guide = 'Balances now read in hours instead of Freebucks: 1 hour = 5 Freebucks, an hour on MiMo v2.6 Flash Slow. Nothing was taken from your balance, and a 3x model uses 3 hours per session hour.'
const guideZh = '余额现在以小时而非 Freebucks 显示：每 1 小时 = 5 Freebucks；在 MiMo v2.6 Flash Slow 上运行 1 小时。余额没有被扣除，而 3 倍耗用模型每运行 1 小时会消耗 3 小时额度。'
const hour = n => `${n} ${n === '1' ? 'hour' : 'hours'}`
const cases = [[guide, guideZh]]
for (const remaining of ['0', '1', '5', '1,000']) {
  for (const limit of ['1', '5', '1,000']) {
  for (const bonus of [null, '1', '2', '1,000']) {
    for (const stale of [false, true]) {
      for (const includeGuide of [false, true]) {
        const en = `${hour(remaining)} left of today's ${limit}. Daily hours refill each day and don't carry over.` +
          (bonus === null ? '' : ` Includes today's +${hour(bonus)} streak bonus: the streak adds to the daily pool, never the wallet.`) +
          (stale ? ' Last known balance; refreshing.' : '') + (includeGuide ? ` ${guide}` : '')
        const zh = `今日 ${limit} 小时额度中剩余 ${remaining} 小时。每日小时额度每天补充，不会结转。` +
          (bonus === null ? '' : `其中包含今日连续使用奖励的额外 ${bonus} 小时额度；该奖励加入每日额度，不会存入钱包。`) +
          (stale ? '当前为上次确认的余额，正在刷新。' : '') + (includeGuide ? guideZh : '')
        cases.push([en, zh])
      }
    }
  }
  }
}
for (const monthly of [null, '1', '5', '1,000']) {
  for (const stale of [false, true]) {
    for (const includeGuide of [false, true]) {
      const en = 'Bought hours and your plan bonus. Spent after your daily hours.' +
        (monthly === null ? '' : ` ${hour(monthly)} of it is this month's plan bonus, which is spent first and is replaced, not added to, at your next renewal.`) +
        (stale ? ' Last known balance; refreshing.' : '') + (includeGuide ? ` ${guide}` : '')
      const zh = '已购买的小时额度和方案奖励。在每日额度之后扣除。' +
        (monthly === null ? '' : `其中 ${monthly} 小时为本月方案奖励，将优先使用；下次续费时会替换原有奖励，不会叠加。`) +
        (stale ? '当前为上次确认的余额，正在刷新。' : '') + (includeGuide ? guideZh : '')
      cases.push([en, zh])
    }
  }
}
for (const balance of ['0', '1', '5', '1,000']) {
  for (const stale of [false, true]) cases.push([
    `Wallet: ${hour(balance)} remaining${stale ? ' (last known)' : ''}`,
    `钱包：剩余 ${balance} 小时额度${stale ? '（上次确认的余额）' : ''}`,
  ])
}
let assertions = 0
for (const [en, zh] of cases) {
  assert.equal(t(en), zh, en); assertions++
  assert.equal(t(zh), zh, `repeat translation: ${en}`); assertions++
}
// Do not silently drop unknown billing conditions from a future release.
for (const en of [
  `5 hours left of today's 5. Daily hours refill each day and don't carry over. New billing policy. ${guide}`,
  `Bought hours and your plan bonus. Spent after your daily hours. An unknown bonus condition. ${guide}`,
]) { assert.equal(t(en), en, 'unknown balance contract'); assertions++ }
console.log(`PASS: ${assertions} Freebuff 0.8.2 balance-tooltip assertions`)
