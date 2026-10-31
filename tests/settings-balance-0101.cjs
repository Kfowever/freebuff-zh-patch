const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');const c={Node:{},NodeFilter:{},document:{readyState:'loading',addEventListener(){}}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../freebuff-zh-cn.js'),'utf8'),c);let count=0;
for(const clock of ['00:00','09:00 Asia/Shanghai time'])for(const bonus of [null,'1','60','1,000'])for(const date of [null,'2026年11月18日'])for(const region of ['','full','limited']){
 const en=`Your daily hours refill at ${clock} and are spent before your wallet.`+(bonus?` ${bonus} ${bonus==='1'?'hour':'hours'} wallet bonus each month${date?`, next on ${date}`:''}; it replaces any unused bonus instead of adding to it.`:'')+(region==='full'?' Regional allowance. Your plan includes 21 hours a day in full-access countries.':region==='limited'?' Limited access. Verify your country in Account settings.':'');
 const zh=`你的每日小时额度会在 ${clock.replace(/ time$/,' 时区')} 刷新，并优先于钱包余额使用。`+(bonus?`每月奖励 ${bonus} 小时钱包额度${date?`，下次发放时间为 ${date}`:''}；未使用的奖励会被替换，不会累加。`:'')+(region==='full'?'地区额度：你的套餐在完整访问权限地区每天包含 21 小时。':region==='limited'?'访问权限受限。请在“账户设置”中验证所在国家/地区。':'');
 assert.equal(c.__FREEBUFF_ZH_PATCH__.translate(en),zh,en);assert.equal(c.__FREEBUFF_ZH_PATCH__.translate(zh),zh);count+=2;
}
const unknown='Your daily hours refill at 00:00 and are spent before your wallet. An unknown new billing condition.';assert.equal(c.__FREEBUFF_ZH_PATCH__.translate(unknown),unknown);count++;
console.log('PASS: '+count+' settings balance-contract assertions');
