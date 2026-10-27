// Dependency-free DOM doubles. Run dom.html separately for browser integration.
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const source = fs.readFileSync(path.join(__dirname, '..', 'freebuff-zh-cn.js'), 'utf8')
let assertions = 0
const equal = (actual, expected, label) => { assert.equal(actual, expected, label); assertions++ }

function element(tagName = 'div', parentElement = null, attributes = {}) {
  return {
    nodeType: 1, tagName: tagName.toUpperCase(), parentElement, attributes, childNodes: [],
    matches(selector) {
      return selector.split(',').some(part => {
        part = part.trim()
        if (part.startsWith('.')) return (this.attributes.class ?? '').split(' ').includes(part.slice(1))
        if (part === '[data-freebuff-zh-ignore]') return this.hasAttribute('data-freebuff-zh-ignore')
        if (part === '[contenteditable]:not([contenteditable="false"])') {
          return this.hasAttribute('contenteditable') && this.attributes.contenteditable !== 'false'
        }
        return part.toUpperCase() === this.tagName
      })
    },
    closest(selector) { for (let node = this; node; node = node.parentElement) if (node.matches(selector)) return node; return null },
    hasAttribute(name) { return Object.hasOwn(this.attributes, name) },
    getAttribute(name) { return this.attributes[name] },
    setAttribute(name, value) { this.attributes[name] = value },
    querySelectorAll(selector) {
      const result = []
      for (const child of this.childNodes) if (child.nodeType === 1) {
        if (child.matches(selector)) result.push(child)
        result.push(...child.querySelectorAll(selector))
      }
      return result
    },
    get textContent() { return this.childNodes.map(child => child.textContent ?? child.nodeValue).join('') },
    set textContent(value) { this.childNodes = [{ nodeType: 3, parentElement: this, nodeValue: value }] },
  }
}

function boot(root) {
  let onReady, onMutation
  const context = {
    Node: { ELEMENT_NODE: 1, TEXT_NODE: 3, DOCUMENT_NODE: 9, DOCUMENT_FRAGMENT_NODE: 11 },
    NodeFilter: { SHOW_ELEMENT: 1, SHOW_TEXT: 4 },
    MutationObserver: class { constructor(callback) { onMutation = callback } observe() {} },
    document: {
      readyState: 'loading', documentElement: root,
      addEventListener(_event, callback) { onReady = callback },
      createTreeWalker(scope) {
        const nodes = []
        const visit = node => { for (const child of node.childNodes ?? []) { nodes.push(child); visit(child) } }
        visit(scope)
        let index = 0
        return { nextNode() { return nodes[index++] ?? null } }
      },
    },
  }
  vm.runInNewContext(source, context)
  onReady()
  return { context, onMutation }
}

function runScenario(name, container, tag = 'a', expected = 'Plan') {
  const root = element('main')
  container.parentElement = root
  root.childNodes.push(container)
  const target = element(tag, container, { title: 'Plan' })
  const text = { nodeType: 3, nodeValue: 'Plan', parentElement: target }
  target.childNodes.push(text)
  container.childNodes.push(target)
  const { context, onMutation } = boot(root)
  equal(text.nodeValue, expected, `${name}: initial text`)
  equal(target.getAttribute('title'), expected, `${name}: initial attribute`)
  text.nodeValue = 'Plan'
  target.setAttribute('title', 'Plan')
  onMutation([{ type: 'characterData', target: text }, { type: 'attributes', target }])
  equal(text.nodeValue, expected, `${name}: character mutation`)
  equal(target.getAttribute('title'), expected, `${name}: attribute mutation`)
  text.nodeValue = 'Plan'
  target.setAttribute('title', 'Plan')
  onMutation([{ type: 'childList', addedNodes: [target] }])
  equal(text.nodeValue, expected, `${name}: added subtree text`)
  equal(target.getAttribute('title'), expected, `${name}: added subtree attribute`)
  // Contextual rules must respect the same boundary as ordinary translations.
  target.setAttribute('class', 'acts-toggle')
  text.nodeValue = 's'
  context.__FREEBUFF_ZH_PATCH__.translateAll()
  equal(text.nodeValue, expected === 'Plan' ? 's' : '', `${name}: contextual suffix`)
  target.setAttribute('class', 'turn-changes-head')
  const label = element('span', target)
  label.textContent = 'Agent changed 2 files'
  target.childNodes = [label]
  context.__FREEBUFF_ZH_PATCH__.translateAll()
  equal(label.textContent, expected === 'Plan' ? 'Agent changed 2 files' : '智能体修改了 2 个文件', `${name}: contextual heading`)
}

runScenario('chat link', element('div', null, { class: 'bubble' }))
runScenario('chat button', element('div', null, { class: 'bubble' }), 'button')
runScenario('sticky user summary', element('div', null, { class: 'user-sticky-bubble' }), 'span')
runScenario('user message text', element('div', null, { class: 'user-message-text' }), 'span')

// 0.8.1: actual contenteditable composer metadata is UI; its children are draft.
{
  const root = element('main')
  const composer = element('div', root, {
    class: 'composer-input', contenteditable: 'true', 'data-composer-input': '',
    'data-placeholder': 'Type a message — / for commands, @ for threads or files',
    'aria-placeholder': 'Type a message — / for commands, @ for threads or files',
    'aria-label': 'Message', 'aria-valuetext': 'Plan', title: 'Plan',
  })
  composer.textContent = 'New chat'
  root.childNodes.push(composer)
  const { onMutation } = boot(root)
  equal(composer.textContent, 'New chat', 'contenteditable draft is unchanged')
  for (const name of ['data-placeholder', 'aria-placeholder']) {
    equal(composer.getAttribute(name), '输入消息 — 输入 / 使用命令，输入 @ 搜索任务或文件', `${name} UI metadata`)
    composer.setAttribute(name, 'Type a message — added to the queue')
    onMutation([{ type: 'attributes', attributeName: name, target: composer }])
    equal(composer.getAttribute(name), '输入消息 — 将添加到队列', `${name} mutation`)
  }
  equal(composer.getAttribute('aria-label'), '消息', 'composer accessible name')
  equal(composer.getAttribute('aria-valuetext'), 'Plan', 'composer accessible draft value')
  equal(composer.getAttribute('title'), 'Plan', 'composer non-UI attributes')
  equal(composer.textContent, 'New chat', 'metadata mutations preserve draft')
}
for (const attributes of [{ class: 'bubble' }, { 'data-freebuff-zh-ignore': '' }]) {
  const root = element('div', null, attributes)
  const composer = element('div', root, {
    class: 'composer-input', contenteditable: 'true', 'data-composer-input': '',
    'data-placeholder': 'Type a message — / for commands, @ for threads or files',
  })
  composer.textContent = 'New chat'
  root.childNodes.push(composer)
  boot(root)
  equal(composer.getAttribute('data-placeholder'), 'Type a message — / for commands, @ for threads or files', 'nested composer metadata is protected')
  equal(composer.textContent, 'New chat', 'nested composer text is protected')
}
{
  function titleScenario(wrapper, className, expected, outer = element('main')) {
    wrapper.parentElement = outer
    outer.childNodes.push(wrapper)
    const title = element('span', wrapper, { class: className })
    title.textContent = 'New chat'
    wrapper.childNodes.push(title)
    const { onMutation } = boot(outer)
    equal(title.textContent, expected, `${className} contextual default`)
    title.childNodes[0].nodeValue = 'Plan'
    onMutation([{ type: 'characterData', target: title.childNodes[0] }])
    equal(title.textContent, 'Plan', `${className} custom rename`)
  }
  titleScenario(element('button', null, { class: 'tab-select', 'aria-controls': 'thread-workspace' }), 'tab-title', '新建聊天')
  titleScenario(element('button', null, { class: 'tab-select', 'aria-controls': 'file-workspace' }), 'tab-title', 'New chat')
  titleScenario(element('div', null, { class: 'sidebar-thread' }), 'sidebar-thread-title', '新建聊天')
  titleScenario(element('div', null, { class: 'sidebar-thread' }), 'sidebar-thread-title', 'New chat', element('div', null, { class: 'bubble' }))
}
for (const [tooltip, expected] of [['Chat only', '仅聊天'], ['D:\\projects\\Chat only', 'Chat only']]) {
  const root = element('main')
  const picker = element('button', root, { class: 'new-thread-project-trigger', 'data-tooltip': tooltip })
  const name = element('span', picker, { class: 'repo-name' })
  const leaf = element('span', name, { class: 'repo-name-repo' })
  leaf.textContent = 'Chat only'
  root.childNodes.push(picker); picker.childNodes.push(name); name.childNodes.push(leaf)
  boot(root)
  equal(leaf.textContent, expected, 'projectless label versus a custom project name')
}
{
  const root = element('main')
  const hint = element('p', root, { class: 'workspace-settings-hint' })
  const parts = ['No sessions charged in the last ', '7', ' days.'].map(nodeValue => ({ nodeType: 3, parentElement: hint, nodeValue }))
  hint.childNodes.push(...parts); root.childNodes.push(hint)
  const { onMutation } = boot(root)
  equal(hint.textContent, '最近 7 天内没有计费会话。', 'split usage empty state')
  equal(hint.childNodes[1], parts[1], 'split usage count node identity')
  parts[1].nodeValue = '14'
  onMutation([{ type: 'characterData', target: parts[1] }])
  equal(hint.textContent, '最近 14 天内没有计费会话。', 'split usage count update')
}

// Actual 0.0.190 surfaces can contain strings that coincide with UI labels.
// Verify both first render and observer updates preserve those user values.
for (const name of [
  'sidebar-thread-title', 'threads-row-title-text', 'sidebar-project-name',
  'tab-title', 'search-result-title', 'mcp-server-name', 'agent-option-name',
  'reasoning-preview', 'todo-dock-text', 'question-text',
  'question-option-body', 'qtitle', 'file-code-editor',
  'file-markdown-content', 'diff-view-body', 'attachment-chip-name',
]) runScenario(`0.0.190 ${name}`, element('div', null, { class: name }), 'span')
runScenario('file tree name', element('button', null, { class: 'file-row file' }), 'span')
runScenario('file creation controls', element('form', null, { class: 'file-row file-create-row' }), 'span', '计划')

{
  const root = element('main')
  const terminal = element('div', root, { class: 'terminal-tab' })
  const label = element('span', terminal, { class: 'explorer-tab-label', title: 'Plan' })
  label.textContent = 'Plan'
  root.childNodes.push(terminal)
  terminal.childNodes.push(label)
  const { onMutation } = boot(root)
  equal(label.textContent, 'Plan', 'user terminal title')
  label.childNodes[0].nodeValue = 'Hours'
  onMutation([{ type: 'characterData', target: label.childNodes[0] }])
  equal(label.textContent, 'Hours', 'dynamic user terminal title')
  equal(label.getAttribute('title'), 'Plan', 'terminal title attribute')
}

{
  const root = element('article', null, { class: 'byok-saved byok-chatgpt' })
  const heading = element('div', root, { class: 'byok-saved-heading' })
  const title = element('strong', heading)
  title.textContent = 'Codex sign-in'
  root.childNodes.push(heading)
  heading.childNodes.push(title)
  boot(root)
  equal(title.textContent, 'Codex 登录', 'built-in sign-in heading is app UI')
}
runScenario('highlighted code', element('code'), 'span')
runScenario('nested preformatted text', element('pre'), 'span')
runScenario('explicit ignore', element('div', null, { 'data-freebuff-zh-ignore': '' }), 'span')
runScenario('editable content', element('div', null, { contenteditable: 'true' }), 'span')
runScenario('note link', element('div', null, { class: 'note-text' }))
runScenario('normal UI', element('div'), 'button', '计划')
runScenario('noneditable UI', element('div', null, { contenteditable: 'false' }), 'button', '计划')

for (const protection of ['none', 'bubble', 'explicit', 'editable', 'explicit-self']) {
  const root = element('main')
  const attrs = protection === 'bubble' ? { class: 'bubble' }
    : protection === 'explicit' ? { 'data-freebuff-zh-ignore': '' }
    : protection === 'editable' ? { contenteditable: 'true' } : {}
  const wrapper = element('div', root, attrs)
  root.childNodes.push(wrapper)
  const input = element('textarea', wrapper, {
    placeholder: 'Type a message — / for skills, @ for files',
    'aria-label': 'Plan', 'aria-valuetext': 'Plan', title: 'Plan',
    ...(protection === 'explicit-self' ? { 'data-freebuff-zh-ignore': '' } : {}),
  })
  input.value = 'Plan'
  input.textContent = 'Plan'
  wrapper.childNodes.push(input)
  const { onMutation } = boot(root)
  equal(input.getAttribute('placeholder'), protection === 'none' ? '输入消息 — / 选择技能，@ 引用文件' : 'Type a message — / for skills, @ for files', `${protection}: placeholder`)
  equal(input.getAttribute('aria-label'), protection === 'none' ? '计划' : 'Plan', `${protection}: accessible name`)
  equal(input.getAttribute('title'), protection === 'none' ? '计划' : 'Plan', `${protection}: input tooltip`)
  equal(input.getAttribute('aria-valuetext'), 'Plan', `${protection}: accessible user value`)
  equal(input.value, 'Plan', `${protection}: draft value`)
  equal(input.textContent, 'Plan', `${protection}: default draft text`)
  input.setAttribute('placeholder', 'Type a message — added to the queue')
  onMutation([{ type: 'attributes', target: input }])
  equal(input.getAttribute('placeholder'), protection === 'none' ? '输入消息 — 将添加到队列' : 'Type a message — added to the queue', `${protection}: updated placeholder`)
}

for (const protection of ['none', 'bubble', 'explicit-label']) {
  const root = element('main', null, protection === 'bubble' ? { class: 'bubble' } : {})
  const button = element('button', root, { class: 'acts-toggle' })
  const label = element('span', button, { class: 'acts-label', ...(protection === 'explicit-label' ? { 'data-freebuff-zh-ignore': '' } : {}) })
  root.childNodes.push(button)
  button.childNodes.push(label)
  label.childNodes = ['Worked · ', '2', ' step', 's'].map(nodeValue => ({ nodeType: 3, nodeValue, parentElement: label }))
  const suffix = label.childNodes[3]
  const expected = protection === 'none' ? '已执行 · 2 步' : 'Worked · 2 steps'
  const { onMutation } = boot(root)
  equal(label.textContent, expected, `${protection}: nested execution label`)
  suffix.nodeValue = 's'
  onMutation([{ type: 'characterData', target: suffix }])
  equal(label.textContent, expected, `${protection}: changed plural suffix`)
  label.childNodes[1].nodeValue = '3'
  suffix.nodeValue = 's'
  onMutation([{ type: 'characterData', target: label.childNodes[1] }, { type: 'characterData', target: suffix }])
  equal(label.textContent, expected.replace('2', '3'), `${protection}: changed count and suffix`)
}
for (const protectedContent of [false, true]) {
  const root = element('main', null, protectedContent ? { class: 'bubble' } : {})
  const row = element('div', root, { class: 'act tool-row' })
  const head = element('button', row, { class: 'tool-row-head tool-row-toggle' })
  root.childNodes.push(row)
  row.childNodes.push(head)
  const label = element('span', head, { class: 'act-name' })
  const arg = element('span', head, { class: 'act-arg' })
  const status = element('span', head, { class: 'tool-row-status' })
  head.childNodes.push(label, arg, status)
  label.textContent = 'Search'
  arg.textContent = 'Read Run Search Quote success /project/Read.php ^Run$'
  status.textContent = 'success'
  const quote = element('button', root, { class: 'quote-btn' })
  quote.textContent = 'Quote'
  const plain = element('button', root)
  plain.textContent = 'Quote'
  root.childNodes.push(quote, plain)
  const { context, onMutation } = boot(root)
  equal(label.textContent, protectedContent ? 'Search' : '搜索', 'scoped search label')
  equal(status.textContent, protectedContent ? 'success' : '成功', 'scoped status')
  equal(quote.textContent, protectedContent ? 'Quote' : '引用', 'scoped quote button')
  equal(plain.textContent, 'Quote', 'unrelated Quote text')
  equal(arg.textContent, 'Read Run Search Quote success /project/Read.php ^Run$', 'tool arguments unchanged')
  for (const [before, after] of [['Read', '读取'], ['Run', '运行']]) {
    label.childNodes[0].nodeValue = before
    onMutation([{ type: 'characterData', target: label.childNodes[0] }])
    equal(label.textContent, protectedContent ? before : after, `dynamic ${before} label`)
    equal(context.__FREEBUFF_ZH_PATCH__.translate(before), before, `${before} is not a global translation`)
  }
  for (const [before, after] of [['running', '运行中'], ['failure', '失败']]) {
    status.childNodes[0].nodeValue = before
    onMutation([{ type: 'characterData', target: status.childNodes[0] }])
    equal(status.textContent, protectedContent ? before : after, `dynamic ${before} status`)
  }
}
for (const protection of ['none', 'outer-bubble', 'explicit', 'editable', 'wrong-wrapper', 'user-text']) {
  const root = element('main', null, protection === 'outer-bubble' ? { class: 'bubble' } : {})
  const bubble = element('div', root, { class: 'bubble user-message-bubble',
    ...(protection === 'explicit' ? { 'data-freebuff-zh-ignore': '' } : {}),
    ...(protection === 'editable' ? { contenteditable: 'true' } : {}) })
  root.childNodes.push(bubble)
  const body = element('div', bubble, { class: 'user-message-text' })
  body.textContent = 'Show more'
  const disclosure = element('div', bubble, { class: protection === 'wrong-wrapper' ? 'unrelated' : 'user-message-disclosure' })
  bubble.childNodes.push(body, disclosure)
  const button = element('button', disclosure, { class: 'user-message-toggle' })
  disclosure.childNodes.push(button)
  const label = element('span', button, protection === 'user-text' ? { class: 'user-message-text' } : {})
  label.textContent = 'Show more'
  button.childNodes.push(label)
  const { onMutation } = boot(root)
  equal(body.textContent, 'Show more', `${protection}: user message unchanged`)
  equal(label.textContent, protection === 'none' ? '展开更多' : 'Show more', `${protection}: disclosure`)
  label.childNodes[0].nodeValue = 'Show less'
  onMutation([{ type: 'characterData', target: label.childNodes[0] }])
  equal(label.textContent, protection === 'none' ? '收起' : 'Show less', `${protection}: dynamic disclosure`)
}
{
  const root = element('main')
  const composer = element('textarea', root, { role: 'combobox', 'aria-label': 'Message', placeholder: 'Type a message — / for skills, @ for threads or files' })
  composer.value = '@Auth redesign Show more'
  root.childNodes.push(composer)
  boot(root)
  equal(composer.getAttribute('placeholder'), '输入消息 — / 选择技能，@ 引用任务或文件', '0.0.109 composer hint')
  equal(composer.getAttribute('aria-label'), '消息', '0.0.109 composer accessible name')
  equal(composer.value, '@Auth redesign Show more', '0.0.109 draft and mention unchanged')
}
{
  const root = element('main')
  const heading = element('div', root, { class: 'byok-saved-heading' })
  const name = element('strong', heading, { title: 'Connect a provider' })
  name.textContent = 'Connect a provider'
  heading.childNodes.push(name)
  const option = element('button', root, { class: 'agent-provider-option' })
  const title = element('span', option, { class: 'agent-option-title' })
  title.textContent = 'Done'
  const badge = element('span', title, { class: 'model-badge byo' })
  badge.textContent = 'Your API key'
  title.childNodes.push(badge)
  option.childNodes.push(title)
  const keyInput = element('input', root, { type: 'password', placeholder: 'Paste your API key', 'aria-label': 'Provider API key' })
  keyInput.value = 'synthetic-test-key-DoNotTranslate'
  const endpoint = element('input', root, { type: 'url', 'aria-label': 'Provider base URL' })
  endpoint.value = 'https://provider.example/v1'
  root.childNodes.push(heading, option, keyInput, endpoint)
  const { onMutation } = boot(root)
  equal(name.textContent, 'Connect a provider', 'saved provider name unchanged')
  equal(name.getAttribute('title'), 'Connect a provider', 'saved provider title unchanged')
  equal(title.childNodes[0].nodeValue, 'Done', 'picker connection name unchanged')
  equal(badge.textContent, '你的 API 密钥', 'provider UI badge translated')
  equal(keyInput.getAttribute('placeholder'), '粘贴你的 API 密钥', 'key input placeholder translated')
  equal(keyInput.value, 'synthetic-test-key-DoNotTranslate', 'key input value unchanged')
  equal(endpoint.value, 'https://provider.example/v1', 'provider URL value unchanged')
  name.childNodes[0].nodeValue = 'Your API providers'
  title.childNodes[0].nodeValue = 'Connect a provider'
  onMutation([{type: 'characterData', target: name.childNodes[0]}, {type: 'characterData', target: title.childNodes[0]}])
  equal(name.textContent, 'Your API providers', 'dynamic saved provider name unchanged')
  equal(title.childNodes[0].nodeValue, 'Connect a provider', 'dynamic picker name unchanged')
}
{
  const guide = 'Balances now read in hours instead of Freebucks: 1 hour = 5 Freebucks, an hour on MiMo v2.6 Flash Slow. Nothing was taken from your balance, and a 3x model uses 3 hours per session hour.'
  const guideZh = '余额现在以小时而非 Freebucks 显示：每 1 小时 = 5 Freebucks；在 MiMo v2.6 Flash Slow 上运行 1 小时。余额没有被扣除，而 3 倍耗用模型每运行 1 小时会消耗 3 小时额度。'
  const en = `5 hours left of today's 5. Daily hours refill each day and don't carry over. ${guide}`
  const zh = `今日 5 小时额度中剩余 5 小时。每日小时额度每天补充，不会结转。${guideZh}`
  const root = element('main')
  const balance = element('div', root, { class: 'sidebar-new-chat sidebar-balance', 'data-tooltip': en })
  const chat = element('div', root, { class: 'bubble', 'data-tooltip': en })
  chat.textContent = en
  root.childNodes.push(balance, chat)
  const { onMutation } = boot(root)
  equal(balance.getAttribute('data-tooltip'), zh, 'full balance tooltip attribute')
  equal(chat.textContent, en, 'balance words in chat remain user content')
  equal(chat.getAttribute('data-tooltip'), en, 'chat tooltip remains user content')
  const portal = element('div', root, { class: 'tooltip' })
  portal.textContent = en
  root.childNodes.push(portal)
  onMutation([{ type: 'childList', addedNodes: [portal] }])
  equal(portal.textContent, zh, 'balance tooltip portal added on hover')
  const refreshedEn = `1 hour left of today's 5. Daily hours refill each day and don't carry over. Last known balance; refreshing. ${guide}`
  const refreshedZh = `今日 5 小时额度中剩余 1 小时。每日小时额度每天补充，不会结转。当前为上次确认的余额，正在刷新。${guideZh}`
  balance.setAttribute('data-tooltip', refreshedEn)
  portal.childNodes[0].nodeValue = refreshedEn
  onMutation([{ type: 'attributes', target: balance }, { type: 'characterData', target: portal.childNodes[0] }])
  equal(balance.getAttribute('data-tooltip'), refreshedZh, 'stale balance attribute mutation')
  equal(portal.textContent, refreshedZh, 'visible stale balance text mutation')
}
{
  const root = element('main')
  const modal = element('section', root, { class: 'modal', 'aria-label': 'Stop this sponsored task?' })
  modal.textContent = 'Quit and stop Settings’s sponsored task?'
  const chat = element('div', root, { class: 'bubble', title: 'Stop task' })
  chat.textContent = 'Quit and stop Settings’s sponsored task?'
  const composer = element('div', root, { class: 'composer-input', 'data-composer-input': '', contenteditable: 'true', 'data-placeholder': 'Freebuff has a question — answer above to continue' })
  composer.textContent = 'Stop task'
  root.childNodes.push(modal, chat, composer)
  const { onMutation } = boot(root)
  equal(modal.textContent, '退出并停止 Settings 的赞助任务？', '0.9.0 sponsor name preserved in modal')
  equal(modal.getAttribute('aria-label'), '要停止此赞助任务吗？', '0.9.0 modal accessible label')
  equal(chat.textContent, 'Quit and stop Settings’s sponsored task?', '0.9.0 modal words in user chat protected')
  equal(chat.getAttribute('title'), 'Stop task', '0.9.0 user attributes protected')
  equal(composer.textContent, 'Stop task', '0.9.0 composer draft protected')
  equal(composer.getAttribute('data-placeholder'), 'Freebuff 有一个问题——请在上方回答以继续', '0.9.0 question composer placeholder')
  modal.childNodes[0].nodeValue = 'Stop and close session'
  onMutation([{ type: 'characterData', target: modal.childNodes[0] }])
  equal(modal.textContent, '停止并关闭会话', '0.9.0 modal update')
}
console.log(`PASS: ${assertions} DOM protection assertions (DOM doubles)`)
