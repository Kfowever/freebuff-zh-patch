const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const context={Node:{},NodeFilter:{},document:{readyState:'loading',addEventListener(){}}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../freebuff-zh-cn.js'),'utf8'),context);const t=context.__FREEBUFF_ZH_PATCH__.translate;
const cases=[
 ['Chats','聊天'],['Browser','浏览器'],['Updates','更新'],['Subscriber role','订阅者角色'],['Not active','未激活'],
 ['Connect your GitHub account','连接你的 GitHub 账户'],['Manage on web','在网页上管理'],['Type','类型'],
 ['Loading integrations…','正在加载集成…'],['Loading Earn…','正在加载赚取页面…'],
 ['0 hours available','0 小时可用'],['1 hour available','1 小时可用'],['1,000 hours available','1,000 小时可用'],
 ['5 / 5 hrs','5 / 5 小时'],['0% used','0% 已使用'],['2 days','2 天'],['1 month','1 个月'],
 ['About Activity','关于活动'],['About Hours charged','关于已扣除的小时额度'],
 ['Removed “00000000-1111-4222-8333-444444444444” — files and chat history were kept.','已移除“00000000-1111-4222-8333-444444444444” — 文件和聊天记录已保留。'],
 ['Get 7x usage for $8. DeepSeek V4.1 Flash 10/17: 7 hours a day on Starter instead of 1 hour for free. $8/mo.','花费 $8 获得 7 倍用量。DeepSeek V4.1 Flash 10/17: 每日可在 Starter 方案中使用 7 小时额度；免费额度为每天 1 小时。月费 $8。'],
];
for(const [en,zh]of cases){assert.equal(t(en),zh,en);assert.equal(t(zh),zh,'repeat '+en)}
console.log(`PASS: ${cases.length*2} Freebuff 0.8.1 visible-label assertions`);
