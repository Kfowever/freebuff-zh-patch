const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const engine=fs.readFileSync(path.join(__dirname,'../FreebuffZhPatch.ps1'),'utf8');
const original=engine.match(/\$HostedOriginalText = @'\r?\n([\s\S]*?)\r?\n'@/)[1];
const patched=engine.match(/\$HostedLocalizedText = @'\r?\n([\s\S]*?)\r?\n'@/)[1];assert.equal(Buffer.byteLength(original),Buffer.byteLength(patched));new vm.Script(patched);let assertions=2;
for(const [url,top,expected]of [['https://freebuff.com/workspace',true,1],['https://staging-auth.freebuff.com/workspace',true,1],['https://staging-2-auth.freebuffweb.site/workspace',true,1],['https://freebuff.com.evil.test/',true,0],['https://evil.test/',true,0],['https://freebuff.com/',false,0],['http://freebuff.com/',true,0],['about:blank',true,0]]){
 let create,load,executions=0;const w={on:(name,cb)=>{if(name==='did-finish-load')load=cb},getURL:()=>url,executeJavaScript:code=>{assert.equal(code,'synthetic-runtime');executions++;return Promise.resolve()}};
 const electron={app:{on:(name,cb)=>{assert.equal(name,'web-contents-created');create=cb}},BrowserWindow:{fromWebContents:()=>top?{}:null}};
 const context={queueMicrotask:fn=>fn(),require:n=>n==='electron'?electron:n==='node:fs'?{readFileSync:(file,encoding)=>{assert.ok(file.endsWith('orchestrator/ui/assets/freebuff-zh-cn.js')||file.endsWith('orchestrator\\ui\\assets\\freebuff-zh-cn.js'));assert.equal(encoding,'utf8');return 'synthetic-runtime'}}:path,process:{resourcesPath:'/resource'},URL,console};
 vm.runInNewContext(patched,context);create({},w);load();assert.equal(executions,expected,url);assertions++;
}
console.log('PASS: '+assertions+' hosted-workspace hook assertions (mock Electron)');
