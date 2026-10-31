const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm')
const assert = require('node:assert/strict')
const source = fs.readFileSync(path.join(__dirname, '../freebuff-zh-cn.js'), 'utf8')
const context = { Node: {}, NodeFilter: {}, document: { readyState: 'loading', addEventListener() {} } }
vm.runInNewContext(source
  .replace('const exact = new Map(', 'const exact = globalThis.__exact = new Map(')
  .replace('const patterns = [', 'const patterns = globalThis.__patterns = ['), context)
const dictionary = source.slice(source.indexOf('Object.entries({'), source.indexOf('\n    }),'))
const keys = [...dictionary.matchAll(/^\s*("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|[A-Za-z_$][\w$]*)\s*:/gm)]
  .map(m => /^['"]/.test(m[1]) ? vm.runInNewContext(m[1]) : m[1])
assert.equal(keys.length, context.__exact.size, 'all dictionary keys are unique and audited')
const patterns = context.__patterns.map(([re]) => re.source + '/' + re.flags)
assert.equal(new Set(patterns).size, patterns.length, 'no duplicate regex rules hide later translations')
for (const [en, zh] of context.__exact) {
  assert.ok(zh && typeof zh === 'string', `nonempty translation: ${en}`)
  for (const amount of en.match(/\$\d+(?:\.\d+)?/g) ?? []) {
    const number = amount.slice(1)
    assert.ok(zh.includes(amount) || zh.includes(number + ' 美元') || zh.includes(number + '美元'), `preserve ${amount}: ${en}`)
  }
}
assert.equal(context.__FREEBUFF_ZH_PATCH__.version, '0.10.1')
console.log(`PASS: ${keys.length} unique dictionary entries and ${patterns.length} unique dynamic rules`)
