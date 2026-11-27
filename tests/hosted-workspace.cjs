const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const profile=JSON.parse(fs.readFileSync(path.join(__dirname,'../library/profiles/0.0.196.0.json'),'utf8'));const original=profile.hostedOriginalText,patched=profile.hostedLocalizedText;assert.equal(Buffer.byteLength(original),Buffer.byteLength(patched));new vm.Script(patched);let assertions=2;
for(const [url,top,expected]of [['https://freebuff.com/workspace',true,1],['https://staging-auth.freebuff.com/workspace',true,1],['https://staging-2-auth.freebuffweb.site/workspace',true,1],['https://freebuff.com.evil.test/',true,0],['https://evil.test/',true,0],['https://freebuff.com/',false,0],['http://freebuff.com/',true,0],['about:blank',true,0]]){
 let create,load,executions=0;const w={on:(name,cb)=>{if(name==='did-finish-load')load=cb},getURL:()=>url,executeJavaScript:code=>{assert.equal(code,'synthetic-runtime');executions++;return Promise.resolve()}};
 const electron={app:{on:(name,cb)=>{assert.equal(name,'web-contents-created');create=cb}},BrowserWindow:{fromWebContents:()=>top?{}:null}};
 const context={queueMicrotask:fn=>fn(),require:n=>n==='electron'?electron:n==='node:fs'?{readFileSync:(file,encoding)=>{assert.ok(file.endsWith('orchestrator/ui/assets/freebuff-zh-cn.js')||file.endsWith('orchestrator\\ui\\assets\\freebuff-zh-cn.js'));assert.equal(encoding,'utf8');return 'synthetic-runtime'}}:path,process:{resourcesPath:'/resource'},URL,console};
 vm.runInNewContext(patched,context);create({},w);load();assert.equal(executions,expected,url);assertions++;
}
{
  const profile206 = JSON.parse(fs.readFileSync(path.join(__dirname, '../library/profiles/0.0.206.0.json'), 'utf8'))
  assert.equal(Buffer.byteLength(profile206.hostedOriginalText), Buffer.byteLength(profile206.hostedLocalizedText))
  const runtime = fs.readFileSync(path.join(__dirname, '../library/freebuff-zh-cn.js'), 'utf8')
  let register, loaded, shown
  const context = {
    fs: { readFileSync: () => runtime },
    path,
    process: { resourcesPath: '/resources' },
    queueMicrotask: callback => callback(),
    app: { on: (_event, callback) => { register = callback } },
    BrowserWindow: { fromWebContents: () => ({}) },
    askSync: (parent, options) => { shown = { parent, options }; return 1 },
    URL,
    console,
  }
  vm.runInNewContext(profile206.hostedLocalizedText, context)
  register({}, { on: (_event, callback) => callback(), getURL: () => 'https://freebuff.com/',
    executeJavaScript: code => { loaded = code; return Promise.resolve() } })
  assert.equal(loaded, runtime)
  const parent = {}
  const options = { title: 'Quit Freebuff?', message: 'Freebuff is still working.',
    detail: 'Quitting stops the agents now. The next time you open Freebuff, interrupted turns continue automatically from their latest saved step.',
    buttons: ['Cancel', 'Quit anyway'], defaultId: 0, cancelId: 0, noLink: true }
  assert.equal(context.askSync(parent, options), 1)
  assert.equal(shown.parent, parent)
  assert.equal(shown.options.title, '退出 Freebuff？')
  assert.equal(shown.options.buttons.join('|'), '取消|仍要退出')
  assert.equal(shown.options.defaultId, options.defaultId)
  assert.equal(shown.options.cancelId, options.cancelId)
  assert.equal(shown.options.noLink, options.noLink)
  assert.match(shown.options.detail, /中断的轮次会从最近保存的步骤自动继续/)
  context.askSync(parent, { ...options, detail: 'Quitting ends Example $&’s sponsored task, and it won’t resume.' })
  assert.match(shown.options.detail, /Example \$& 赞助的任务，该任务无法恢复/)
  context.askSync(parent, { ...options, detail: 'Quitting ends 4 sponsored tasks, and they won’t resume.' })
  assert.match(shown.options.detail, /4 个赞助任务/)
  const unrelated = { ...options, title: 'Another prompt' }
  context.askSync(parent, unrelated)
  assert.equal(shown.options, unrelated)
  assertions += 13
}
console.log('PASS: '+assertions+' hosted-workspace and native quit assertions (mock Electron)');
