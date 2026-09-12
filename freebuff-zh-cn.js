/*
 * Freebuff Desktop 简体中文界面补丁
 * Runtime DOM localization layer. No network access and no user-data access.
 */
(() => {
  'use strict'

  const PATCH_ID = 'freebuff-zh-cn'
  const PATCH_VERSION = '0.6.1'
  if (globalThis.__FREEBUFF_ZH_PATCH__?.id === PATCH_ID) return

  const exact = new Map(
    Object.entries({
      // Model picker and bring-your-own-key provider management.
      'Freebucks balance temporarily unavailable.': '暂时无法获取 Freebucks 余额。',
      'Freebucks balance': 'Freebucks 余额',
      'Smart & Fast': '智能且快速',
      'Smart & Fast · May use data for AI training': '智能且快速 · 可能将数据用于 AI 训练',
      'Queue · May use data for AI training': '需要排队 · 可能将数据用于 AI 训练',
      'Your API providers': '你的 API 服务商',
      'YOUR API PROVIDERS': '你的 API 服务商',
      'Your keys · Your provider’s billing': '使用你的密钥 · 由你的服务商计费',
      'Your API key': '你的 API 密钥',
      'Connect a provider…': '连接服务商…',
      'Connect a provider...': '连接服务商…',
      'Connect a provider': '连接服务商',
      'Manage providers…': '管理服务商…',
      'Manage providers': '管理服务商',
      'Add or manage your API keys': '添加或管理你的 API 密钥',
      'Connect a provider to use your own API key. Available across projects on this computer.':
        '连接服务商以使用你自己的 API 密钥。此电脑上的各项目均可使用。',
      'You can switch this task to your API provider. After switching, start a new task to use Freebuff models again.':
        '你可以将此任务切换到自己的 API 服务商。切换后，如需再次使用 Freebuff 模型，请新建任务。',
      'This task uses your selected provider. Start a new task to use Freebuff models or switch providers.':
        '此任务使用你所选的服务商。如需使用 Freebuff 模型或切换服务商，请新建任务。',
      'Select a provider in the model picker of a new or existing Freebuff task. Once a task uses your API key, start a new task to return to Freebuff models.':
        '在新建或现有 Freebuff 任务的模型菜单中选择服务商。任务使用你的 API 密钥后，如需返回 Freebuff 模型，请新建任务。',
      'THIS COMPUTER': '此电脑',
      'Your models. Your provider account.': '使用你的模型和服务商账户。',
      'Model requests go directly to your provider and use its billing. BYOK tasks are ad-free.':
        '模型请求直接发送到你的服务商，并由其计费。使用自有 API 密钥的任务不含广告。',
      'Connect your first provider': '连接你的第一个服务商',
      'Bring an OpenRouter key, or connect another OpenAI-compatible service.':
        '使用 OpenRouter 密钥，或连接其他兼容 OpenAI 接口的服务。',
      'Add provider': '添加服务商',
      'Loading providers…': '正在加载服务商…',
      'CONNECTED PROVIDERS': '已连接的服务商',
      'Close API providers': '关闭 API 服务商管理',
      'About privacy and supported features': '隐私与支持的功能',
      'Enabled sync and diagnostics keep their existing behavior. Mobile Mirror can sync task transcripts. Auto-run and hosted research tools are unavailable for BYOK.':
        '已启用的同步与诊断功能保持现有行为。手机镜像可同步任务记录。使用自有 API 密钥时，不支持自动运行和托管研究工具。',
      'Changes are saved immediately.': '更改会立即保存。',
      'Shared by Desktop and CLI on this computer.': '此电脑上的桌面应用和 CLI 共享此配置。',
      Done: '完成',
      Provider: '服务商',
      Providers: '服务商',
      'Search providers…': '搜索服务商…',
      'No providers found. Try “Custom”.': '未找到服务商。请尝试“自定义”。',
      'Custom endpoint': '自定义端点',
      'OpenAI-compatible': '兼容 OpenAI 接口',
      'Requests go to': '请求发送至',
      'Provider setup ↗': '服务商配置指南 ↗',
      'Preset only. Your model’s coding support still needs testing.': '这只是预设配置，模型的编程支持仍需测试。',
      'Base URL': 'API 基础地址',
      'Provider base URL': '服务商 API 基础地址',
      'Use HTTPS, or HTTP for a server on this computer.': '请使用 HTTPS；本机服务器也可使用 HTTP。',
      'API key': 'API 密钥',
      'Provider API key': '服务商 API 密钥',
      'Paste your API key': '粘贴你的 API 密钥',
      'Hide API key': '隐藏 API 密钥',
      'Show API key': '显示 API 密钥',
      Hide: '隐藏',
      Show: '显示',
      'Saved in your OS credential store. Never in project files.': '保存在操作系统凭据存储中，不会写入项目文件。',
      'Model ID': '模型 ID',
      'Provider model ID': '服务商模型 ID',
      'Copy the exact ID from your provider. Coding support is untested.': '请从服务商处复制准确的模型 ID。编程支持尚未测试。',
      'Advanced settings': '高级设置',
      'Name and model limits': '名称与模型限制',
      'Connection name': '连接名称',
      Optional: '可选',
      'For example, Personal': '例如：个人账户',
      'Provider connection name': '服务商连接名称',
      'Context window tokens': '上下文窗口令牌数',
      'Configured context window': '配置的上下文窗口',
      'Maximum output tokens': '最大输出令牌数',
      'Configured maximum output tokens': '配置的最大输出令牌数',
      'Use limits supported by your model. These are budgets, not detected capabilities.':
        '请填写模型支持的限制值。这些是用量上限，并非自动检测到的模型能力。',
      'Coding untested': '编程能力尚未测试',
      'Check connection': '检查连接',
      'Checking…': '正在检查…',
      'Replace key': '更换密钥',
      'New API key': '新 API 密钥',
      'Existing tasks keep their old connection revision. Use the replacement in a new task.':
        '现有任务继续使用旧版连接。请在新任务中使用更换后的密钥。',
      'Save replacement key': '保存新密钥',
      'Cancel replacement': '取消更换',
      'Remove provider': '移除服务商',
      'Keep provider': '保留服务商',
      'Removing…': '正在移除…',
      '? Tasks using it will stop before their next model request.': '？使用它的任务将在下一次模型请求前停止。',
      'Save provider': '保存服务商',
      'Provider added. Select it in the model picker of a new or existing Freebuff task.':
        '服务商已添加。请在新建或现有 Freebuff 任务的模型菜单中选择它。',
      'Credential verified. Coding support is still untested.': '凭据已验证。编程支持仍未测试。',
      'Endpoint reachable. Authentication and coding support still need an inference test.':
        '端点可访问。身份验证和编程支持仍需通过推理测试确认。',
      'Key replaced. Select this updated connection in a new task.': '密钥已更换。请在新任务中选择此更新后的连接。',
      // Freebuff 0.0.109: navigation, thread mentions, history and refunds.
      'Open tabs': '打开的标签页',
      'Freebuff menu': 'Freebuff 菜单',
      Spaces: '空间',
      'New space': '新建空间',
      'New space in': '在此项目中新建空间：',
      'Close this space': '关闭此空间',
      'Close space': '关闭空间',
      'Use folder name': '使用文件夹名称',
      'Rename…': '重命名…',
      'Reset name': '重置名称',
      'Start a new thread': '新建任务',
      'App tools': '应用工具',
      Refresh: '刷新',
      'Search connectors': '搜索连接器',
      'All connectors': '全部连接器',
      'Remove connector': '移除连接器',
      Message: '消息',
      'Attach images': '附加图片',
      'Type a message — / for skills, @ for threads or files': '输入消息 — / 选择技能，@ 引用任务或文件',
      'Project threads and files': '项目中的任务和文件',
      Threads: '任务',
      'Shared workspace': '共享工作区',
      Worktree: '工作树',
      'Thread mentions tip': '任务引用提示',
      'Thread mentions': '任务引用',
      New: '新功能',
      'Your threads can talk to each other.': '你的任务之间可以互相引用。',
      'Bring context from an earlier conversation into this one.': '将先前对话的上下文带入当前任务。',
      'Example prompt': '提示示例',
      'Use the approach from': '参考此任务中的方法：',
      'to add sign-in here.': '，在这里添加登录功能。',
      'Try it': '试一试',
      'Type @ to choose a thread': '输入 @ 以选择任务',
      'Saved thread snapshot · read-only': '已保存的任务快照 · 只读',
      'Could not load history': '无法加载历史记录',
      'This history page changed. Return to latest and try again.': '此页历史记录已发生变化。请返回最新消息后重试。',
      'Conversation outside the viewport — focus to read': '对话位于可视区域外 — 聚焦以阅读',
      'Conversation pages': '对话分页',
      'Older messages': '更早的消息',
      'Newer messages': '较新的消息',
      'Return to latest': '返回最新消息',
      'Return to latest messages': '返回最新消息',
      'Show the full prompt': '显示完整提示',
      'Show more': '展开更多',
      'Show less': '收起',
      Collapse: '折叠',
      Expand: '展开',
      Conversation: '对话',
      'Editing an earlier message — sending will replace it, remove all later messages and rewind the agent’s subsequent file changes.':
        '正在编辑较早的消息 — 发送后将替换该消息、移除其后的所有消息，并撤销智能体随后对文件的更改。',
      'Freebuff finished responding': 'Freebuff 已完成回复',
      'Response stopped': '回复已停止',
      'Response failed': '回复失败',
      'Mission paused. Send a message to continue.': '目标已暂停。发送消息以继续。',
      'Hosted session slots are in use': '托管会话名额已满',
      'Sprint — focused and complete': '冲刺 — 专注完成任务',
      'Could not refresh this proposal. Its controls will return when Freebuff reconnects.':
        '无法刷新此提案。Freebuff 重新连接后将恢复操作控件。',
      'Retrying session end': '正在重试结束会话',
      'Refund processing': '退款处理中',
      'Refund unconfirmed': '退款尚未确认',
      'Session settled · no refund': '会话已结算 · 无退款',
      'Session ended · refund unconfirmed': '会话已结束 · 退款尚未确认',
      'Your conversation is saved. Desktop will retry automatically when connected.':
        '你的对话已保存。桌面应用将在连接后自动重试。',
      'Session ended. Waiting for final usage charges; your balance will refresh automatically.':
        '会话已结束。正在等待最终用量结算；余额将自动刷新。',
      'Final refund confirmed by the server.': '服务器已确认最终退款。',
      'The server did not report a refund amount. No credit is assumed.': '服务器未返回退款金额，暂不计入退款余额。',
      'Session refunds': '会话退款',
      'Recent session refunds': '最近的会话退款',
      'Previous session': '上一会话',
      'Your balance is unavailable. Starting a session may spend Freebucks from your daily allowance or wallet. Continue?':
        '无法获取余额。启动会话可能消耗每日额度或钱包中的 Freebucks。是否继续？',
      'Ends your current session. Your balance is unavailable. Starting a session may spend Freebucks from your daily allowance or wallet. Continue?':
        '将结束当前会话。无法获取余额，启动会话可能消耗每日额度或钱包中的 Freebucks。是否继续？',
      'Unlock by referring friends': '邀请好友以解锁',
      'Novita route — evaluation only': 'Novita 通道 — 仅供评估',
      'Anonymous provider retains prompts': '匿名服务商会保留提示内容',
      'Rate limited and shared by all users: queues when busy, then answers on DeepSeek V4.1 Flash.':
        '所有用户共享且有速率限制：繁忙时排队，随后由 DeepSeek V4.1 Flash 回答。',
      'Freebuff couldn’t load': 'Freebuff 无法加载',
      'Part of the interface did not start. Reload once; if this screen returns, reinstall the latest version. Your projects and conversations are safe.':
        '部分界面未能启动。请重新加载一次；若再次出现此页面，请重新安装最新版本。你的项目和对话不会丢失。',
      'Reload Freebuff': '重新加载 Freebuff',
      'Get latest installer': '获取最新版安装程序',

      // New connector catalog and access review UI.
      Connecting: '正在连接',
      Reconnecting: '正在重新连接',
      'Needs approval': '需要批准',
      Review: '审查',
      'Reconnect required': '需要重新连接',
      Reconnect: '重新连接',
      'Connection failed': '连接失败',
      Manage: '管理',
      'Choose tools': '选择工具',
      'Choose tools for': '选择工具：',
      Disabled: '已禁用',
      Connected: '已连接',
      'Ready when needed': '随时可用',
      Disconnected: '未连接',
      Available: '可用',
      Connect: '连接',
      'Community setup': '社区配置',
      'Setup guide': '配置指南',
      'Set up': '配置',
      'Run it and show me its tools': '运行并显示工具',
      'Connector was added. Refresh your connectors to continue setup.': '连接器已添加。请刷新连接器以继续配置。',
      'Connect and choose tools': '连接并选择工具',
      'What may': '允许',
      'do?': '执行哪些操作？',
      'It reported': '此服务提供了',
      'tools. Nothing can be called until you choose. Servers label their own tools, so treat these hints as a claim, not a guarantee.':
        '个工具。选择前不会调用任何工具。工具标签由服务器自行声明，仅供参考，并非保证。',
      None: '全不选',
      'Safe only': '仅选择标记为安全的工具',
      Enabled: '已启用',
      Disable: '禁用',
      Enable: '启用',
      Keep: '保留',
      'Community setup guide': '社区配置指南',
      'Setup documentation': '配置文档',
      Connection: '连接',
      'Configuration name:': '配置名称：',
      '. Available to every agent on this computer.': '。此电脑上的所有智能体均可使用。',
      'from this computer? This also removes its saved access and shared CLI configuration.':
        '从此电脑移除？这也会移除其保存的访问授权和共享 CLI 配置。',
      'Paste the': '粘贴服务器说明中的',
      community: '社区',
      'Review connection': '审查连接',
      'Retry connection': '重试连接',
      'Follow the': '请参阅',
      'setup guide to check supported clients, account requirements, and get your MCP configuration. Then add it here to review access and choose tools.':
        '配置指南，确认支持的客户端和账户要求，并获取 MCP 配置。然后在此添加配置、审查访问权限并选择工具。',
      'Add MCP configuration': '添加 MCP 配置',
      'Connect to review access and choose which tools Freebuff may use.': '连接以审查访问权限，并选择 Freebuff 可以使用的工具。',
      'This connector was removed. Return to your connectors to continue.': '此连接器已移除。请返回“你的连接器”以继续。',
      'Add custom MCP': '添加自定义 MCP',
      'MCP configuration JSON': 'MCP 配置 JSON',
      'block from the server’s instructions. It is written to': '配置块。配置将写入',
      '. Nothing runs until you review and approve it.': '。审查并批准后才会运行。',
      'Connector name': '连接器名称',
      'Connector views': '连接器视图',
      Discover: '发现',
      'Your connectors': '你的连接器',
      'Couldn’t refresh your connectors.': '无法刷新你的连接器。',
      'Showing the last known connection states.': '正在显示上次已知的连接状态。',
      'Connection states are unavailable.': '无法获取连接状态。',
      'Search results': '搜索结果',
      'Top connectors': '热门连接器',
      'Show all': '显示全部',
      'Your custom connectors': '你的自定义连接器',
      'No active connections': '没有活动连接',
      'Your tools belong here': '在这里添加你的工具',
      'Try another name or description.': '请尝试其他名称或描述。',
      'Ready, disabled, and unapproved connectors are listed under Your connectors.':
        '就绪、已禁用和待批准的连接器列在“你的连接器”中。',
      'Discover a connector or add your own MCP server to get started.': '查找连接器或添加自己的 MCP 服务器以开始使用。',
      'Explore connectors': '探索连接器',
      'Connections are shared across your agents.': '你的智能体之间共享连接。',
      'A custom MCP server that runs on your computer.': '在你的电脑上运行的自定义 MCP 服务器。',
      'A custom MCP server connected through its own address.': '通过独立地址连接的自定义 MCP 服务器。',

      // Descriptions shipped by the app's connector catalog, not live tool output.
      'Find, create, and update issues, projects, and comments.': '查找、创建和更新问题、项目及评论。',
      'Search your workspace and create or update connected pages.': '搜索工作区，创建或更新已连接的页面。',
      'Investigate errors, performance issues, releases, and projects.': '排查错误、性能问题，查看发行版本及项目。',
      'Use Stripe’s API and developer documentation from your agent.': '通过智能体使用 Stripe API 和开发者文档。',
      'Inspect projects, databases, logs, and development resources.': '查看项目、数据库、日志和开发资源。',
      'Manage Cloudflare services and inspect account configuration.': '管理 Cloudflare 服务并查看账户配置。',
      'Work with repositories, issues, pull requests, and GitHub projects.': '处理仓库、议题、拉取请求及 GitHub 项目。',
      'Access projects, issues, merge requests, and GitLab workflows.': '访问项目、议题、合并请求及 GitLab 工作流。',
      'Find and manage workspaces, projects, tasks, and reports.': '查找和管理工作区、项目、任务及报告。',
      'Search and update Jira, Confluence, Bitbucket, and other Atlassian work.': '搜索和更新 Jira、Confluence、Bitbucket 及其他 Atlassian 工作内容。',
      'Query bases and create or update records within your permissions.': '在你的权限范围内查询数据库、创建或更新记录。',
      'Search and manage tasks, Docs, workspace members, and Chat.': '搜索和管理任务、文档、工作区成员及聊天。',
      'Use CRM data for reports, workflows, and account-aware automation.': '使用 CRM 数据生成报告、执行工作流及基于账户信息的自动化。',
      'Search support conversations and contacts, and manage Help Center content.': '搜索客服对话与联系人，管理帮助中心内容。',
      'Choose approved actions from connected apps and automate workflows.': '选择已连接应用中获准的操作，并自动执行工作流。',
      'Connect agents to real-time product catalog and commerce capabilities.': '让智能体访问实时商品目录和电商功能。',
      'Search documentation and manage projects, deployments, and logs.': '搜索文档，管理项目、部署及日志。',
      'Give an agent current Netlify context and deployment capabilities.': '为智能体提供当前 Netlify 上下文及部署功能。',
      'Manage projects and branches, inspect databases, and run SQL.': '管理项目与分支，查看数据库并运行 SQL。',
      'Explore data, query collections, and manage database deployments.': '探索数据、查询集合并管理数据库部署。',
      'Investigate logs, metrics, traces, dashboards, monitors, and incidents.': '查看日志、指标、追踪、仪表盘、监控及事件。',
      'Manage App Platform, Droplets, Kubernetes clusters, and cloud resources.': '管理 App Platform、Droplets、Kubernetes 集群及云资源。',
      'Search, explore, and analyze the indices available to your account.': '搜索、探索和分析账户可访问的索引。',
      'Expose a local Convex project to tools for code, data, logs, and functions.': '让工具访问本地 Convex 项目的代码、数据、日志及函数。',
      'Run local code and dependency security checks through the Snyk CLI.': '通过 Snyk CLI 在本地检查代码和依赖的安全性。',
      'Manage services, deploys, databases, logs, and metrics.': '管理服务、部署、数据库、日志及指标。',
      'Manage projects, APIs, and documentation through Appwrite.': '通过 Appwrite 管理项目、API 及文档。',
      'Work with Auth0 tenant configuration and Management API resources.': '处理 Auth0 租户配置及 Management API 资源。',
      'Use current Clerk SDK patterns and authentication implementation guidance.': '使用当前 Clerk SDK 的用法及身份验证实现指南。',
      'Upload, organize, transform, and analyze media assets.': '上传、整理、转换和分析媒体资源。',
      'Inspect datasets and run governed queries against BigQuery.': '查看数据集，并在管控范围内执行 BigQuery 查询。',
      'Connect agents to governed Unity Catalog data and SQL tools.': '让智能体访问受管控的 Unity Catalog 数据和 SQL 工具。',
      'Connect to Snowflake-managed MCP servers for governed data access.': '连接 Snowflake 管理的 MCP 服务器，在管控范围内访问数据。',
      'Search and manage vector collections for semantic retrieval.': '搜索和管理用于语义检索的向量集合。',
      'Manage Redis, QStash, Workflow, Vector, and Search resources.': '管理 Redis、QStash、Workflow、Vector 和 Search 资源。',
      'Connect an agent to a local Turso database using the Turso CLI MCP mode.': '通过 Turso CLI 的 MCP 模式将智能体连接到本地 Turso 数据库。',
      'Inspect databases, schema, branches, and query performance.': '查看数据库、结构、分支及查询性能。',
      'Use a Directus project’s API and data model through an MCP setup.': '通过 MCP 配置使用 Directus 项目的 API 和数据模型。',
      'Manage content, schemas, datasets, and GROQ queries.': '管理内容、结构、数据集及 GROQ 查询。',
      'Manage structured content operations in Contentful.': '管理 Contentful 中的结构化内容操作。',
      'Search, update, publish, and manage Storyblok content.': '搜索、更新、发布和管理 Storyblok 内容。',
      'Set up a DatoCMS content-management MCP workflow.': '配置 DatoCMS 内容管理 MCP 工作流。',
      'Set up the Prismic MCP server for repository and content context.': '配置 Prismic MCP 服务器以获取仓库及内容上下文。',
      'This vendor repository is archived; follow the linked README only for its documented setup.': '此供应商仓库已归档；请仅按照链接中 README 记载的方式配置。',
      'Query and manage SingleStore data from an MCP-compatible client.': '通过兼容 MCP 的客户端查询和管理 SingleStore 数据。',
      'Use Timescale’s Tiger CLI MCP server for database context.': '使用 Timescale 的 Tiger CLI MCP 服务器获取数据库上下文。',
      'Search and analyze Elasticsearch data with Elastic MCP tools.': '使用 Elastic MCP 工具搜索和分析 Elasticsearch 数据。',
      'Read, write, query, and manage data in a Redis database.': '读取、写入、查询和管理 Redis 数据库中的数据。',
      'Use Better Auth’s MCP guidance for authentication integrations.': '使用 Better Auth 的 MCP 指南实现身份验证集成。',
      'Manage self-hosted Coolify resources with its documented MCP server.': '使用文档中提供的 MCP 服务器管理自托管 Coolify 资源。',
      'Expose and secure a self-hosted MCP endpoint through an ngrok gateway.': '通过 ngrok 网关公开并保护自托管 MCP 端点。',
      'Search Hub models, datasets, Spaces, and documentation.': '搜索 Hub 模型、数据集、Spaces 及文档。',
      'Search the web through Perplexity’s official MCP server.': '通过 Perplexity 官方 MCP 服务器搜索网页。',
      'Manage voice agents and generate audio through its hosted MCP.': '通过其托管的 MCP 管理语音智能体并生成音频。',
      'Search, crawl, and extract web content for AI workflows.': '为 AI 工作流搜索、抓取和提取网页内容。',
      'Search LiveKit docs, public code, examples, and changelogs.': '搜索 LiveKit 文档、公开代码、示例及更新日志。',
      'Query experiments, production logs, and evaluation results.': '查询实验、生产日志及评估结果。',
      'Inspect Weights & Biases experiment data through its MCP server.': '通过 MCP 服务器查看 Weights & Biases 实验数据。',
      'Analyze product events, insights, feature flags, and errors.': '分析产品事件、洞察、功能开关及错误。',
      'Query product analytics through Mixpanel’s MCP server.': '通过 Mixpanel MCP 服务器查询产品分析数据。',
      'Use a community MCP server to inspect privacy-friendly analytics.': '使用社区 MCP 服务器查看注重隐私的分析数据。',
      'Use New Relic observability through its hosted MCP server.': '通过托管的 MCP 服务器使用 New Relic 可观测性功能。',
      'Search the web for AI agents through Tavily’s MCP server.': '通过 Tavily MCP 服务器为 AI 智能体搜索网页。',
      'Search the web and retrieve research context for AI agents.': '为 AI 智能体搜索网页并检索研究资料。',
      'Investigate incidents and on-call work through a setup guide.': '按照配置指南排查事件并处理值班工作。',
      'Access pipelines, jobs, and workflow status through MCP.': '通过 MCP 访问流水线、作业及工作流状态。',
      'Access pipelines, jobs, logs, and test data through MCP.': '通过 MCP 访问流水线、作业、日志及测试数据。',
      'Inspect production errors, deploys, and session replay data.': '查看生产错误、部署及会话回放数据。',
      'Inspect application errors through Honeybadger’s MCP server.': '通过 Honeybadger MCP 服务器查看应用错误。',
      'Use browser automation and inspection from an MCP client.': '通过 MCP 客户端使用浏览器自动化和检查功能。',
      'Search logs, alerts, dashboards, and Cloud SIEM through MCP.': '通过 MCP 搜索日志、告警、仪表盘及 Cloud SIEM。',
      'Search, compare, and run Replicate models from an MCP client.': '通过 MCP 客户端搜索、比较和运行 Replicate 模型。',
      'Browse live model data, rankings, pricing, docs, and test inference.': '浏览实时模型数据、排名、价格和文档，并测试推理。',
      'Connect an agent to your Mistral Studio workspace.': '将智能体连接到你的 Mistral Studio 工作区。',
      'Ground agents with Google Maps places and geospatial context.': '为智能体提供 Google Maps 地点及地理空间上下文。',
      'Connect maps, geospatial services, or documentation through MCP.': '通过 MCP 连接地图、地理空间服务或文档。',
      'Search workspace content, send messages, and manage canvases.': '搜索工作区内容、发送消息并管理画布。',
      'Requires a Slack app identity and administrator-approved OAuth scopes.': '需要 Slack 应用身份及管理员批准的 OAuth 权限范围。',
      'Search mail and work with messages through Google Workspace.': '通过 Google Workspace 搜索和处理邮件。',
      'Google’s server is in Developer Preview and needs a Google Cloud project.': 'Google 服务器目前处于开发者预览阶段，需要 Google Cloud 项目。',
      'Search, read, and create Drive files within Google permissions.': '在 Google 权限范围内搜索、读取和创建云端硬盘文件。',
      'Read and manage Google Calendar events with a local server.': '通过本地服务器读取和管理 Google 日历活动。',
      'Connect Microsoft Graph data and work tools through an MCP server.': '通过 MCP 服务器连接 Microsoft Graph 数据及工作工具。',
      'Bring Figma design context and supported canvas actions to an agent.': '为智能体提供 Figma 设计上下文及受支持的画布操作。',
      'Remote access is limited to Figma MCP Catalog clients; confirm Desktop support before setup.': '远程访问仅限 Figma MCP Catalog 客户端；配置前请确认是否支持桌面版。',
      'Search, create, edit, and export Canva designs and assets.': '搜索、创建、编辑和导出 Canva 设计及资源。',
      'Requires a Canva account and a client registration or compatible client metadata.': '需要 Canva 账户，以及客户端注册或兼容的客户端元数据。',
      'Find and use Dropbox files from an MCP-compatible workspace.': '在兼容 MCP 的工作区中查找和使用 Dropbox 文件。',
      'Dropbox describes this remote server as an open beta.': 'Dropbox 将此远程服务器标记为公开测试版。',
      'Work with boards, lists, cards, checklists, and workspace data.': '处理看板、列表、卡片、检查清单及工作区数据。',
      'Query docs, tables, rows, and pages with a community server.': '通过社区服务器查询文档、表格、数据行及页面。',
      'Access Discord servers and messages through a community server.': '通过社区服务器访问 Discord 服务器及消息。',
      'Find and manage customer-support tickets with an MCP server.': '通过 MCP 服务器查找和管理客服工单。',
      'Work with support mailboxes and conversations using a community server.': '通过社区服务器处理客服邮箱及对话。',
      'Schedule events and manage availability through Calendly’s MCP server.': '通过 Calendly MCP 服务器安排活动并管理可用时间。',
      'Create forms and analyze responses through Typeform’s MCP server.': '通过 Typeform MCP 服务器创建表单并分析回复。',
      'Work with audiences, campaigns, and marketing data via a community server.': '通过社区服务器处理受众、营销活动及营销数据。',
      'Use Mailgun sending and domain data through a community server.': '通过社区服务器使用 Mailgun 发送功能及域名数据。',
      'Send and manage transactional email through Resend’s MCP server.': '通过 Resend MCP 服务器发送和管理事务邮件。',
      'Manage campaigns and contacts through a community MCP server.': '通过社区 MCP 服务器管理营销活动及联系人。',
      'Use orders, payments, customers, catalog, and invoice data.': '使用订单、付款、客户、商品目录及发票数据。',
      'Use PayPal merchant tools through its local or remote MCP server.': '通过本地或远程 MCP 服务器使用 PayPal 商家工具。',
      'Access payment and merchant resources with a community server.': '通过社区服务器访问付款及商家资源。',
      'Work with products, customers, payments, and subscriptions.': '处理产品、客户、付款及订阅。',
      'Use billing and subscription data via a community MCP server.': '通过社区 MCP 服务器使用账单及订阅数据。',
      'Inspect store, product, order, and subscription data with a community server.': '通过社区服务器查看商店、产品、订单及订阅数据。',

      // Main navigation and panels
      'Open threads': '打开的任务',
      Home: '主页',
      'New thread': '新建任务',
      'New messages': '新消息',
      Finished: '已完成',
      'Turn failed': '执行失败',
      Stopped: '已停止',
      'Auto stopped': '已自动停止',
      'Merge conflict': '合并冲突',
      'Something went wrong': '出现问题',
      'Try again': '重试',
      'Premium model': '高级模型',
      '100% free agent': '100% 免费智能体',
      Images: '图像',
      Balanced: '平衡',
      "Some models aren't available in Japan yet": '部分模型暂未在日本提供',
      "Some models aren't available on this connection": '当前网络连接暂不提供部分模型',
      "We couldn't confirm your region, so we're showing models available everywhere":
        '无法确认你所在的地区，因此目前只显示全球可用的模型',
      "We couldn't finish a network check, so we're showing models available everywhere":
        '网络检查未能完成，因此目前只显示全球可用的模型',
      Queue: '队列',
      Files: '文件',
      Changes: '更改',
      Preview: '预览',
      Terminal: '终端',
      Notes: '笔记',
      'Thread tools': '任务工具',
      SKILLS: '技能',
      QUEUE: '队列',
      Auto: '自动',
      'Nothing queued.': '队列为空。',
      'Select a thread to show tools.': '选择一个任务以显示工具。',
      'Collapse explorer': '折叠侧栏',
      'Expand explorer': '展开侧栏',
      'Resize explorer panel': '调整侧栏宽度',
      Collapsed: '已折叠',
      'Projects': '项目',
      'Open project': '打开项目',
      'Open project…': '打开项目…',
      'Start your streak': '开始连续使用',
      'Threads you close land here.': '你关闭的任务会显示在这里。',
      'Thread catalog': '任务目录',
      Active: '进行中',
      Archived: '已归档',
      Pinned: '已置顶',
      'Needs attention': '需要关注',
      Recent: '最近',
      Never: '从不',
      'No active threads': '没有进行中的任务',
      'No archived threads': '没有已归档的任务',
      'Archive inactive threads after': '自动归档不活跃任务的时间',
      'Pin thread': '置顶任务',
      'Unpin thread': '取消置顶任务',
      'Mark handled': '标记为已处理',
      'Move up': '上移',
      'Move down': '下移',
      'Archive thread': '归档任务',
      'Return to Recent': '移回“最近”',
      Rename: '重命名',
      'Show Freebuff data': '显示 Freebuff 数据',
      'Remove from projects': '从项目中移除',
      'Close its open tabs first': '请先关闭它已打开的标签页',

      // Account and appearance
      Account: '账户',
      'Your account': '你的账户',
      Appearance: '外观',
      Light: '浅色',
      Dark: '深色',
      'Match system': '跟随系统',
      'Usage dashboard': '用量面板',
      'Sign out': '退出登录',
      'Signing out...': '正在退出登录…',
      'Signed out': '已退出登录',
      'Waiting for sign-in… (retry)': '正在等待登录…（重试）',
      'Sign-in failed — retry': '登录失败 — 重试',
      'Sign in to Freebuff': '登录 Freebuff',
      'Cancel sign-in': '取消登录',
      'Could not start sign-in — Freebuff’s local service is not responding. Restart the app.':
        '无法开始登录 — Freebuff 本地服务无响应。请重启应用。',
      'Could not start sign-in.': '无法开始登录。',
      'Freebuff sign-in needed': '需要登录 Freebuff',
      'Message not sent': '消息未发送',
      'Message not queued': '消息未加入队列',
      'Could not stop the turn': '无法停止当前轮次',
      'Could not resume the queue': '无法恢复队列',
      'Could not switch agent': '无法切换智能体',
      'Could not change reasoning effort': '无法更改推理投入程度',
      'Could not switch agent mode': '无法切换智能体模式',
      'Could not change workspace mode': '无法更改工作区模式',
      'Could not rename this tab': '无法重命名此标签页',
      'Could not edit message': '无法编辑消息',
      'Administrator approval required': '需要管理员审批',
      'Freebuff needs your approval to run an administrator command':
        'Freebuff 需要你的批准才能运行管理员命令',
      'Files open as tabs in the main window': '文件将在主窗口中以标签页打开',
      'Could not open tab': '无法打开标签页',
      'Could not reopen that tab': '无法重新打开该标签页',
      'Could not load this tab': '无法加载该标签页',
      'The conversation changed underneath the edit — try again': '编辑期间会话已发生变化 — 请重试',

      // Composer and messages
      'Type a message — / for skills, @ for files': '输入消息 — / 选择技能，@ 引用文件',
      'Type a message — sending resumes the queue': '输入消息 — 发送后将恢复队列',
      'Type a message — added to the queue': '输入消息 — 将添加到队列',
      'Edit your message — Enter resends from here': '编辑消息 — 按 Enter 从此处重新发送',
      'Attach files, photos, or a folder': '附加文件、图片或文件夹',
      'Send message': '发送消息',
      'Stop the running turn': '停止当前任务',
      'Stopping the running turn': '正在停止当前任务',
      'Stopping…': '正在停止…',
      'Copy message': '复制消息',
      'Message copied': '消息已复制',
      Copied: '已复制',
      'Copy code': '复制代码',
      'Copy command': '复制命令',
      'Revert message': '还原此消息',
      'Fork from here': '从此处分支',
      'Fork chat and current workspace files into a new isolated thread':
        '将聊天和当前工作区文件复制到新的隔离任务',
      'Agent mode': '智能体模式',
      Build: '构建',
      Plan: '计划',
      'Plan mode — describe what the agent should design': '计划模式 — 描述希望智能体设计的内容',
      'Give feedback': '提供反馈',
      'Suggested next steps': '建议的后续步骤',
      Skills: '技能',
      'Edit skills': '编辑技能',
      'Add new skills': '添加新技能',
      'Run the Freebuff skill': '运行 Freebuff 技能',
      'Run skill': '运行技能',
      'Project files': '项目文件',
      '⇥ open': '⇥ 打开',
      '↵ mention · ⇥ open folder': '↵ 引用 · ⇥ 打开文件夹',
      'Pending code comments': '待发送的代码评论',
      'Remove comment': '移除评论',
      'Discard all pending comments': '放弃所有待发送评论',
      'Clear all': '全部清除',
      'Terminal context for next prompt': '下一条提示的终端上下文',
      'Terminal context — sent with your message': '终端上下文 — 将随消息发送',
      'Remove terminal context': '移除终端上下文',
      'Queue paused after an error.': '队列因错误暂停。',
      'Queue paused.': '队列已暂停。',
      'The queue is paused.': '队列已暂停。',
      'Resume it, or send a message to continue.': '恢复队列，或发送消息以继续。',
      'Resume queue': '恢复队列',
      'Send and resume queue (Enter)': '发送并恢复队列（Enter）',
      'Add to queue (Enter)': '加入队列（Enter）',
      'Send (Enter)': '发送（Enter）',
      'Send message and resume queue': '发送消息并恢复队列',
      'Add to queue': '加入队列',
      'Edit before sending': '发送前编辑',
      'Drop files, photos, or folders to attach': '拖放文件、照片或文件夹以添加附件',
      'Remove attachment': '移除附件',
      'Close image preview': '关闭图片预览',
      'Not enough room left in the message for that suggestion': '消息剩余空间不足，无法加入该建议',
      'Not enough room left in the message to quote that': '消息剩余空间不足，无法引用该内容',
      'Attaching files needs the desktop app': '添加文件需要使用桌面应用',
      'Pasting files needs the desktop app': '粘贴文件需要使用桌面应用',
      'Drag-and-drop needs the desktop app': '拖放操作需要使用桌面应用',

      // Thread and window actions
      'Move to new window': '移至新窗口',
      'Close window': '关闭窗口',
      'Minimize window': '最小化窗口',
      'Maximize window': '最大化窗口',
      'Restore window': '还原窗口',
      'Closed tabs': '已关闭的标签页',
      'Open tabs': '打开的标签页',
      'Search closed tabs': '搜索已关闭的标签页',
      'Closing this tab…': '正在关闭此标签页…',
      'Jump to new messages': '跳到新消息',
      'Jump to the latest': '跳到最新消息',
      'Scroll to new messages': '滚动到新消息',
      'Scroll to latest': '滚动到最新消息',
      'New messages': '新消息',
      'Time since the agent finished': '智能体完成后的时间',
      'Time since your latest prompt': '距你上次提问的时间',

      // Workspace and project settings
      'Project settings…': '项目设置…',
      'Project settings': '项目设置',
      'Close project settings': '关闭项目设置',
      'Startup script': '启动脚本',
      'Run this bash command once in each new Isolated workspace, after its first message and before the agent starts. Local threads do not run it.':
        '在每个新的隔离工作区中运行一次此 bash 命令：发送第一条消息后、智能体启动前执行。本地任务不会运行它。',
      'Enter a bash command or leave the field empty.': '请输入 bash 命令，或将此字段留空。',
      'Loading project settings…': '正在加载项目设置…',
      'Settings saved': '设置已保存',
      'Include AGENTS.md': '包含 AGENTS.md',
      'Include your project’s AGENTS.md (or CLAUDE.md) instructions in the agent’s context. Applies to every thread from its next message.':
        '将项目中的 AGENTS.md（或 CLAUDE.md）指令加入智能体上下文。从下一条消息开始，适用于该项目的所有任务。',
      Connectors: '连接器',
      'Connectors…': '连接器…',
      'Close connectors': '关闭连接器',
      'Search connectors': '搜索连接器',
      'No servers configured yet. Add one to': '尚未配置服务器。请添加到',
      ', then reload.': '，然后重新加载。',
      'Add connector': '添加连接器',
      'Add connector…': '添加连接器…',
      'Clear search': '清除搜索',
      'Reload from disk': '从磁盘重新加载',
      'Back to skills': '返回技能列表',
      'Search skills to add…': '搜索要添加的技能…',
      'Open a project to get started': '打开一个项目以开始',
      'Locate folder…': '定位文件夹…',
      'Finish signing in to your connector in the browser.': '请在浏览器中完成连接器登录。',
      'Nothing has started yet. Adding this connector runs a program on your computer with the same permissions as you. Its tool list cannot be read without starting it, so you are asked again afterwards about what it may do.':
        '尚未启动任何程序。添加此连接器会以与你相同的权限在电脑上运行程序；启动前无法读取工具列表，之后还会再次询问允许执行的操作。',
      'Nothing has been contacted yet. Adding this connector lets Freebuff talk to this address, and it may ask you to sign in. Its tool list cannot be read without connecting, so you are asked again afterwards about what it may do.':
        '尚未连接任何地址。添加此连接器后 Freebuff 可以与该地址通信，并可能要求你登录；连接前无法读取工具列表，之后还会再次询问允许执行的操作。',
      'Starting Freebuff orchestrator…': 'Freebuff 编排器正在启动…',
      Isolated: '隔离模式',
      Branch: '分支',
      'Started from': '起始分支',
      'Starts from': '将从此分支开始',
      'Starting branch': '起始分支',
      'Open Terminal': '打开终端',
      'Couldn’t open Terminal': '无法打开终端',
      'Couldn’t open your workspace': '无法打开工作区',
      'Opening your workspace…': '正在打开工作区…',
      'Opening your saved workspace took too long.': '打开已保存的工作区耗时过长。',
      'Open without saved tabs': '不恢复已保存的标签页',
      'Your conversations and project files stay saved.': '你的会话和项目文件仍会保留。',
      'Choosing a folder needs the desktop app.': '选择文件夹需要使用桌面应用。',
      'Use an isolated workspace': '使用隔离工作区',
      'Could not open your workspace': '无法打开工作区',
      'Could not set the starting branch': '无法设置起始分支',
      'Freebuff needs Git Bash': 'Freebuff 需要 Git Bash',
      'Agents write shell commands in bash, which Windows doesn’t ship. Git for Windows includes it and takes about a minute to install.':
        '智能体会使用 bash 编写 shell 命令，但 Windows 并未自带 bash。Git for Windows 包含它，安装大约需要一分钟。',
      'Download Git for Windows': '下载 Git for Windows',
      Premium: '高级',
      Recommended: '推荐',
      'Weekly limit': '每周限额',
      'Daily limit': '每日限额',
      '1 tab only': '仅限 1 个标签页',
      'Limited-time trial': '限时试用',
      'Limited access': '受限访问',
      'Lower limits': '额度降低',
      'Meet Freebucks': '认识 Freebucks',
      'Sessions are now bought with Freebucks — a daily allowance you spend on any model.':
        '现在使用 Freebucks 购买会话——这是可用于任意模型的每日额度。',
      'A fresh pool every day': '每天刷新额度',
      'Your daily Freebucks refill at midnight Pacific. Nothing to earn, nothing to wait for.':
        '你的 Freebucks 每天太平洋时间午夜补充，无需赚取，也无需等待。',
      'No more weekly or monthly session caps': '不再设置每周或每月会话上限',
      'The only thing that counts is what you spend. An hour of any model is one price, charged once when the session starts.':
        '只按实际支出计算。任意模型的一小时会话均按一个价格计费，并在会话开始时一次扣除。',
      'Spend it how you like': '按需使用',
      'Every model shows its price per hour. Pick the cheap one all day, or save up for the expensive one.':
        '每个模型都会显示每小时价格。可以全天使用便宜模型，也可以积攒额度使用高价模型。',
      'Got it': '知道了',
      Free: '免费',
      Freebucks: 'Freebucks',
      'Free sessions': '免费会话',
      'Premium sessions': '高级会话',
      'Premium session time remaining': '高级会话剩余时间',
      'Get more sessions': '获取更多会话',
      'Get more': '获取更多',
      'Use wallet': '使用钱包余额',
      Switch: '切换',
      Upgrade: '升级',
      'Open Earn': '打开“赚取”页面',
      'See plans': '查看方案',
      'Refer friends → earn Freebucks': '邀请好友 → 赚取 Freebucks',
      'Each qualified referral pays Freebucks, claimed on the Earn page.':
        '每位符合条件的受邀好友都会带来 Freebucks，可在“赚取”页面领取。',
      'Engage with a post, level up, and get more daily sessions':
        '参与帖子互动、提升等级并获得更多每日会话',
      'Referrals, bounties and Trust — everything that pays Freebucks':
        '邀请、悬赏和 Trust——所有可获得 Freebucks 的方式',
      'Reward session unlocked': '奖励会话已解锁',
      'Earned sessions': '已赚取会话',
      'your plan sessions': '你的方案会话',
      'daily plan sessions': '每日方案会话',
      'weekly plan sessions': '每周方案会话',
      'monthly plan sessions': '每月方案会话',
      'Free sessions are used first · today resets in': '优先使用免费会话 · 今日额度重置倒计时',
      'Unlimited messages and tool calls until it ends. Already paid for — switching models ends it and buys a new one.':
        '结束前可不限量使用消息和工具调用。费用已支付——切换模型会结束当前会话并购买新会话。',
      'Go to tab →': '前往标签页 →',
      'Deep reasoning': '深度推理',
      'Smart & fast': '智能且快速',
      'Most capable model for complex, demanding work': '能力最强，适合复杂且高要求的工作',
      'Reliable agentic workhorse for everyday tasks': '可靠的智能体主力模型，适合日常任务',
      'Balanced agentic coding model for everyday work': '均衡的智能体编程模型，适合日常工作',
      'Fast and affordable agentic coding model': '快速且经济的智能体编程模型',
      'Queues, then falls back · May use data for AI training':
        '繁忙时排队，随后切换至 DeepSeek V4 Flash · 可能将数据用于 AI 训练',
      'Queues, then falls back': '繁忙时排队，随后切换至 DeepSeek V4 Flash',
      'May use data for AI training': '可能将数据用于 AI 训练',
      'Strong all-around': '综合能力强',
      daily: '每日',
      left: '剩余',
      '/hr': '/小时',
      'Refer friends for more free sessions': '邀请好友，获得更多免费会话',
      'Copy invite link': '复制邀请链接',
      '✓ Copied!': '✓ 已复制！',
      'GLM 5.2 dashboard ↗': 'GLM 5.2 面板 ↗',
      'Claim bounties and track referrals': '领取奖励并查看邀请进度',
      'Referrals qualify once a GitHub account (4+ months old) is connected':
        '关联注册满 4 个月的 GitHub 账户后，邀请才会计入奖励',
      'Connect GitHub to qualify ↗': '关联 GitHub 以满足条件 ↗',
      'GLM 5.2 unlocked': 'GLM 5.2 已解锁',
      'Complete a bounty to unlock': '完成一个悬赏任务即可解锁',
      'earned from bounties': '通过悬赏任务获得',
      'GLM 5.2 — today’s sessions used': 'GLM 5.2 — 今日会话已用尽',
      'Refer friends to unlock GLM 5.2': '邀请好友以解锁 GLM 5.2',
      'Each qualified referral earns a daily 1-hour session of the most powerful open-source model':
        '每位符合条件的受邀好友每天可获得一个 1 小时会话，用于最强大的开源模型',

      // Queue and execution
      Resume: '继续',
      'Resume the queue': '继续队列',
      'Close tab when done': '完成后关闭标签页',
      'Close tab when queue finishes': '队列完成后关闭标签页',
      'Tab close scheduled': '已计划关闭标签页',
      'Nothing is running or queued': '没有正在运行或排队的任务',
      'Auto-run is deciding what is next': '自动运行正在决定下一步',
      Scope: '范围',
      'Deciding what is next…': '正在决定下一步…',
      'Keep working automatically when the queue empties. Anything you queue takes over.':
        '队列为空时自动继续工作；你加入队列的任务会优先执行。',
      'Let this tab keep working on its own when the queue empties': '队列为空时让此标签页自动继续工作',
      'Delete the queued close action to cancel': '删除排队的关闭操作即可取消',
      'After everything above finishes, close this tab and clean up the thread':
        '上方所有任务完成后，关闭此标签页并清理任务',
      'That turn failed, so the rest of the queue is paused.': '该轮执行失败，因此队列其余任务已暂停。',
      'This tab is stopped.': '此标签页已停止。',
      'Send now': '立即发送',
      'Sending now…': '正在发送…',
      'Edit prompt': '编辑提示',
      'Drag the row to reorder': '拖动此行以重新排序',
      'Could not delete that item': '无法删除该项目',
      'This tab will close once the queue finishes. Click to cancel.':
        '队列完成后将关闭此标签页。点击即可取消。',
      'Close this tab when the queue finishes. Adds a row to the end of the queue.':
        '队列完成后关闭此标签页。该操作会在队列末尾添加一行。',
      'Waiting for the model…': '正在等待模型…',
      'Waiting on a background command…': '正在等待后台命令…',
      'Waiting for a Freebuff session…': '正在等待 Freebuff 会话…',
      'Session ready — sending request…': '会话已就绪 — 正在发送请求…',
      'Freebuff is at capacity — retrying…': 'Freebuff 当前繁忙 — 正在重试…',
      'No internet — turns resume when you reconnect': '网络已断开 — 重新连接后将继续',
      'Picked up after a restart': '已在重启后恢复',
      'Tab closed and reopened': '标签页已关闭并重新打开',
      'Your free session ended': '你的免费会话已结束',
      Thinking: '思考中',
      'Worked ·': '已执行 ·',
      step: '步',
      'done': '已完成',
      'working…': '处理中…',
      'Thinking…': '思考中…',
      'Waiting for this thread to finish': '等待此任务完成',
      'Wait for this thread to finish': '等待此任务完成',
      'Forking…': '正在创建分支…',
      'Prompt history': '提示历史',
      'In progress': '进行中',
      'Agent to-do list': '智能体待办列表',
      'Files changed in this turn': '本轮更改的文件',
      'large diff': '差异过大',
      'Read tree': '读取目录树',
      'Find files': '查找文件',
      'Administrator request': '管理员权限请求',
      'Write doc': '写入文档',
      'Search web': '搜索网页',
      'Read URL': '读取 URL',
      'Read docs': '读取文档',
      'Edit notebook': '编辑笔记本',

      // Plan review and agent questions added in Freebuff 0.0.93
      'Plan approval': '计划审批',
      'Questions from the agent': '智能体的问题',
      'The plan is ready for your review': '计划已准备好，等待你审阅',
      'Freebuff has a question': 'Freebuff 有一个问题',
      'Copy plan': '复制计划',
      'Copy plan as Markdown': '将计划复制为 Markdown',
      'Plan copied': '计划已复制',
      'Feedback for the next plan revision': '下一次计划修订的反馈',
      'Previous question': '上一个问题',
      'Next question': '下一个问题',
      'Could not send answers': '无法发送回答',
      'Could not skip the questions': '无法跳过问题',
      'Changed during agent work': '智能体工作期间发生更改',

      // Mission controls added in Freebuff 0.0.64
      Mission: '目标',
      'Edit mission': '编辑目标',
      'Mission prompt': '目标提示',
      Effort: '投入程度',
      'Minimal — only a major concrete gain': '最小 — 仅追求重大且具体的改进',
      'Lean — buy clear improvements': '精简 — 追求明确改进',
      'Balanced — refine while gains are clear': '平衡 — 在收益明确时继续改进',
      'Thorough — pursue smaller credible gains': '详尽 — 追求较小但可信的改进',
      'Exhaustive — stop when gains are marginal': '穷尽 — 改进收益变小后停止',
      'Sprint — roughly complete beats polished': '冲刺 — 大致完成优先于精雕细琢',
      'Focused — complete and checked': '专注 — 完整并经过检查',
      'Crafted — correct, clean, and proven': '精制 — 正确、简洁且经过验证',
      'Thorough — strong on every quality dimension': '详尽 — 各项质量维度均达到高标准',
      'Exhaustive — the best version you can prove': '穷尽 — 做到能够验证的最佳版本',
      Explore: '探索',
      Commit: '提交',
      'Merge PR': '合并 PR',
      Custom: '自定义',
      'Write your own': '自行编写',
      'Investigate and report back, changing nothing': '调查并报告结果，不做任何更改',
      'Do the work and commit locally, but never push': '完成工作并在本地提交，但绝不推送',
      'Take it all the way to a merged pull request': '一直推进到拉取请求合并完成',
      "Complete the user's request fully. When the work is correct, lean, and verified, commit it, open a pull request, drive its checks to green, and merge it.":
        '完整完成用户请求。工作正确、精简且经过验证后，提交更改、创建拉取请求、确保检查通过并合并。',
      'What finishing looks like, and what happens to the finished work.':
        '完成目标的标准，以及完成后的处理方式。',
      'Set a mission to keep working toward automatically once the queue finishes':
        '队列完成后自动继续推进此目标',
      'Working toward this mission automatically once the queue finishes. Anything you queue takes over.':
        '队列完成后将自动推进此目标。你加入队列的任务会优先执行。',
      'Mission is deciding what is next': '目标正在决定下一步',
      'Could not change the mission': '无法更改目标',
      'Could not change mission effort': '无法更改目标投入程度',
      'Could not save the mission': '无法保存目标',
      'Keeps going on its own once the queue is empty.': '队列为空后自动继续执行。',
      'Saved missions': '已保存的目标',
      'Save this mission': '保存此目标',
      'Forget this mission': '忘记此目标',
      'Keep this mission for other threads and projects': '将此目标保留给其他任务和项目',
      'Pause queued work': '暂停排队中的任务',
      'Let the current turn finish, then pause queued work': '等待当前任务完成后，再暂停排队中的任务',
      'Pause the queue': '暂停队列',
      'Could not pause the queue': '无法暂停队列',

      // Welcome, loading and empty states
      'Welcome to Freebuff': '欢迎使用 Freebuff',
      'Start building with Freebuff': '开始使用 Freebuff 构建',
      'Pick a project and start a thread, or pick up where you left off.':
        '选择一个项目并新建任务，或继续上次的工作。',
      'Sign in to open a project and start your first thread.': '登录后打开项目并开始第一个任务。',
      'Sign-in opens in your browser.': '登录页面将在浏览器中打开。',
      'Waiting for your browser — this screen continues on its own.':
        '正在等待浏览器完成登录 — 此页面会自动继续。',
      'Loading thread…': '正在加载任务…',
      'Couldn’t load this thread': '无法加载此任务',
      'Connecting…': '正在连接…',
      'Reconnecting…': '正在重新连接…',

      // Feedback and dialogs
      'Report issue or feature': '报告问题或提出功能建议',
      'Share feedback': '分享反馈',
      'Help us make Freebuff better.': '帮助我们改进 Freebuff。',
      'Tell us what went wrong or what you’d like to see.': '告诉我们哪里出了问题，或你希望看到什么。',
      'Close feedback': '关闭反馈',
      'What kind of feedback is this?': '这是什么类型的反馈？',
      'Good result': '结果很好',
      'Something worked especially well': '某项功能运行得特别好',
      'Bad result': '结果不理想',
      'The agent missed or broke something': '智能体遗漏或破坏了某些内容',
      'App bug': '应用错误',
      'A crash, error, or UI problem': '崩溃、错误或界面问题',
      Other: '其他',
      'An idea, question, or anything else': '想法、问题或其他内容',
      'Describe the issue or feature you’d like to see.': '描述你遇到的问题或希望看到的功能。',
      'Sign in to send feedback': '登录后发送反馈',
      'Your draft will stay here while you finish signing in.': '完成登录前，你的草稿会保留在这里。',
      'Open sign-in again': '再次打开登录',
      'Sign in': '登录',
      'Includes your app version and operating system.': '将包含你的应用版本和操作系统信息。',
      'Sending...': '正在发送…',
      'Send feedback': '发送反馈',
      'Feedback sent. Thank you!': '反馈已发送，谢谢！',
      Cancel: '取消',
      'Cancel (Esc)': '取消（Esc）',
      Close: '关闭',
      Save: '保存',
      Delete: '删除',
      Deny: '拒绝',
      'Approve command': '批准命令',
      'Administrator access requested': '请求管理员权限',
      Command: '命令',
      'Runs from': '运行目录',
      'Waiting…': '正在等待…',
      'This command will have full administrator access. Freebuff will invoke your operating system’s native authentication prompt only after you approve it here.':
        '此命令将获得完整的管理员权限。只有在你于此处批准后，Freebuff 才会调用操作系统的原生身份验证提示。',

      // Hosted-model/session notices
      'Another tab is using the hosted model': '另一个标签页正在使用托管模型',
      'Ends the other tab’s session.': '这会结束另一个标签页的会话。',
      'Use it here': '在此处使用',
      'This tab has the slot — send your message again.': '此标签页已获得会话名额 — 请重新发送消息。',
      'Could not move the session to this tab.': '无法将会话移至此标签页。',
      'Specific to this model.': '仅适用于此模型。',
      'Shared across all premium models.': '所有高级模型共享此额度。',
      'Shared across all available free models.': '所有可用免费模型共享此额度。',
      'Switch to DeepSeek V4 Flash to keep going.': '切换到 DeepSeek V4 Flash 以继续。',
      'Usage incomplete': '用量不完整',
      'Token usage': '令牌用量',
      'Thread token usage': '任务令牌用量',
      'Compacts at': '压缩于',
      'Thread usage': '任务用量',
      'Cumulative provider-reported usage in the current thread transcript.':
        '当前任务记录中由提供商报告的累计用量。',
      'Some thread usage is missing': '部分任务用量缺失',
      'These totals include only requests reported before an interruption.':
        '这些总计仅包含中断前已报告的请求。',
      'Reasoning effort': '推理力度',
      'Extra high': '极高',
      'Bare minimum deliberation': '最低限度思考',
      'Fastest replies, least deliberation': '回复最快，思考最少',
      'More deliberation, slower': '思考更多，速度更慢',
      'Deepest available, slowest': '最深入的思考，速度最慢',
      'Maximum deliberation': '最大程度思考',
      'Everything it has': '全部能力',
      'Coding agent and model': '编码智能体和模型',
      'Your subscription': '你的订阅',
      'Signed in': '已登录',
      'Copied — run it in your terminal': '已复制 — 请在终端运行',

      // Codex/Claude integrations
      Install: '安装',
      Download: '下载',
      'Download for Freebuff': '下载供 Freebuff 使用',
      'Retry download': '重试下载',
      'Installing…': '正在安装…',
      'Starting download…': '正在开始下载…',
      'Step 2 of 2 · Sign in with a Claude Pro, Max, Team, or Enterprise plan':
        '第 2/2 步 · 使用 Claude Pro、Max、Team 或 Enterprise 方案登录',
      'Step 2 of 2 · Sign in to Codex with ChatGPT or an API key':
        '第 2/2 步 · 使用 ChatGPT 或 API 密钥登录 Codex',
      'Codex is signed out': 'Codex 已退出登录',
      'Claude Code is signed out': 'Claude Code 已退出登录',
      'Claude Code is blocked by policy': 'Claude Code 已被策略阻止',
      'Codex CLI needs updating': 'Codex CLI 需要更新',
      'Update Codex': '更新 Codex',
      'Could not run the update.': '无法执行更新。',
      'Codex updated — send your message again.': 'Codex 已更新 — 请重新发送消息。',
      'Updating…': '正在更新…',

      // Mobile mirroring
      Mobile: '移动端',
      "Mirror this computer's open threads to the Freebuff iOS app, and let the phone send messages and approve elevated commands.":
        '将此电脑中打开的任务镜像到 Freebuff iOS 应用，并允许手机发送消息及批准提权命令。',
      'Mirror to my phone': '镜像到我的手机',
      'This computer:': '此电脑：',
      'Sign in to enable.': '登录后启用。',
      Off: '关闭',
      On: '开启',

      // Files, diffs, preview, terminal and notes
      'Couldn’t list files': '无法列出文件',
      'Loading files': '正在加载文件',
      'Could not list files': '无法列出文件',
      'Filter files': '筛选文件',
      'No matches': '无匹配项',
      'No files': '无文件',
      'No file path contains that text.': '没有文件路径包含该文本。',
      'This workspace has no files to show.': '此工作区没有可显示的文件。',
      'Open workspace in File Explorer': '在文件资源管理器中打开工作区',
      'Choose application for workspace': '选择用于打开工作区的应用',
      'No changes to show.': '没有可显示的更改。',
      All: '全部',
      Uncommitted: '未提交',
      'Changes scope': '更改范围',
      'Working directory changes': '工作目录更改',
      'Resolve with agent': '让智能体解决',
      'Loading changes': '正在加载更改',
      'Couldn’t load changes': '无法加载更改',
      'No worktree yet': '尚无工作树',
      'No changes': '没有更改',
      'The working tree is clean — everything is committed.': '工作树是干净的 — 所有更改均已提交。',
      Retry: '重试',
      'Comment on this line — sent with your next message': '评论此行 — 将随下一条消息发送',
      'Click a line to comment': '点击一行以添加评论',
      'Binary file.': '二进制文件。',
      'Loading diff…': '正在加载差异…',
      'Loading diff viewer…': '正在加载差异查看器…',
      'Diff too large to display.': '差异过大，无法显示。',
      'Could not load diff.': '无法加载差异。',
      'Could not load changes.': '无法加载更改。',
      'Working-tree changes since the last commit': '自上次提交以来的工作树更改',
      'Could not apply the changes.': '无法应用更改。',
      'Couldn’t open that change in the file browser.': '无法在文件浏览器中打开该更改。',
      'That file no longer exists. Opened its nearest existing folder instead.':
        '该文件已不存在，已改为打开最近的现有文件夹。',
      'Apply changes to this folder': '将更改应用到此文件夹',
      'Reading the thread’s workspace…': '正在读取任务工作区…',
      'Follow the details in the thread transcript.': '详情请查看任务记录。',
      'An agent opens a standalone HTML page or starts this project’s dev server from the thread workspace, then shows it here.':
        '智能体会从任务工作区打开独立 HTML 页面或启动项目开发服务器，然后在此处显示。',
      'Preparing the preview': '正在准备预览',
      'Agent is preparing the preview…': '智能体正在准备预览…',
      'Preview setup is queued…': '预览设置已排队…',
      'Reload the page': '重新加载页面',
      'Preview is starting…': '预览正在启动…',
      'Preview is live': '预览已运行',
      'Preview failed — open to relaunch': '预览失败 — 打开以重新启动',
      'Launch preview': '启动预览',
      Relaunch: '重新启动',
      'The dev server process exited.': '开发服务器进程已退出。',
      'The dev server died.': '开发服务器已退出。',
      'Open in your browser': '在浏览器中打开',
      'Close the HTML preview': '关闭 HTML 预览',
      'Stop the dev server': '停止开发服务器',
      'Ended with an error': '因错误结束',
      'thread preview': '任务预览',
      'Thread shell': '任务终端',
      'Terminal input': '终端输入',
      'Couldn’t open this file': '无法打开此文件',
      'Loading file…': '正在加载文件…',
      'Could not read this file': '无法读取此文件',
      'Could not save this file': '无法保存此文件',
      'Could not open that folder.': '无法打开该文件夹。',
      'Showing the first 512 KB': '正在显示前 512 KB',
      'Showing the first 512 KB read-only': '正在以只读方式显示前 512 KB',
      'This file changed on disk. Reload it before you save again.':
        '此文件已在磁盘上发生变化，请重新加载后再保存。',
      'Jot an idea for this project…': '记下这个项目的想法…',
      'Nothing jotted yet': '还没有笔记',
      'Capture ideas as they come': '随时记录灵感',
      'Save note (Enter)': '保存笔记（Enter）',
      'Save note': '保存笔记',
      'Copy note': '复制笔记',
      'Edit note': '编辑笔记',
      'Delete note': '删除笔记',
      'Loading notes…': '正在加载笔记…',
      'Could not save your notes': '无法保存笔记',
      'Couldn’t copy to clipboard': '无法复制到剪贴板',
      'Add to Chat': '添加到聊天',
      Restart: '重启',

      // Queue, feedback, stash and skills
      'Could not reorder the queue': '无法重新排列队列',
      "Couldn't schedule tab close": '无法安排关闭标签页',
      'Could not change the auto-run scope': '无法更改自动运行范围',
      'Could not change auto-run': '无法更改自动运行',
      'Could not edit that item': '无法编辑该项目',
      "Couldn't send that item": '无法发送该项目',
      'Could not queue that suggestion': '无法将该建议加入队列',
      'Close sponsor break': '关闭赞助展示',
      Sponsored: '赞助内容',
      'Sponsored break': '赞助内容间歇',
      'Sponsored proposal': '赞助任务提案',
      'Sponsored proposal options': '赞助任务提案选项',
      'Starting sponsored thread…': '正在启动赞助任务…',
      'Sponsored thread running': '赞助任务正在运行',
      'Sponsored thread committed its work': '赞助任务已提交更改',
      'Sponsored thread landed a PR': '赞助任务已创建 PR',
      'Sponsored thread failed': '赞助任务失败',
      'Sponsored PR merged': '赞助 PR 已合并',
      'Start sponsored thread': '启动赞助任务',
      'Create pull request': '创建拉取请求',
      'View what it did': '查看执行内容',
      'Watch this run': '查看任务运行情况',
      'Review the pull request': '审阅拉取请求',
      'view on GitHub': '在 GitHub 上查看',
      'Report this proposal': '举报此提案',
      'Why this?': '为什么会显示此内容？',
      'Dismiss sponsored proposal': '忽略赞助任务提案',
      'Dismiss sponsored message': '关闭赞助消息',
      'Turn off sponsored proposals': '关闭赞助任务提案',
      'Could not open that sponsored run': '无法打开该赞助任务',
      'The sponsored thread could not finish. Nothing was changed in your project.':
        '赞助任务未能完成。你的项目未发生任何更改。',
      'Matched to what you are building in this project. Sponsored proposals never read your code without your go-ahead.':
        '根据你在此项目中构建的内容匹配。未经你允许，赞助任务提案绝不会读取代码。',
      'Sponsored tasks can’t run on Windows yet: Freebuff has no way to keep an advertiser’s commands inside the workspace on this operating system.':
        '赞助任务目前无法在 Windows 上运行：Freebuff 尚无法在此操作系统中将广告方命令限制在工作区内。',
      'Sponsored tasks need bubblewrap (`bwrap`) to stay inside the workspace. Install it and reopen this project to accept.':
        '赞助任务需要 bubblewrap（`bwrap`）才能限制在工作区内运行。请安装后重新打开此项目以接受任务。',
      'Sponsored tasks need the Freebuff desktop app, which is what asks you to approve the task before it runs. Open this project in the app to accept.':
        '赞助任务需要 Freebuff 桌面应用；任务运行前由应用请求你的批准。请在应用中打开此项目以接受任务。',
      'Sponsored tasks can’t run on this operating system: Freebuff has no way to keep an advertiser’s commands inside the workspace here.':
        '赞助任务无法在此操作系统上运行：Freebuff 无法在这里将广告方命令限制在工作区内。',
      'Sponsored tasks can’t run here yet.': '赞助任务目前无法在此处运行。',
      'That model’s tab limit is reached — this tab kept the default.':
        '该模型的标签页额度已用尽——此标签页已保留默认模型。',
      'Sign in…': '登录…',
      'Shell Session': 'Shell 会话',
      'Learn more': '了解更多',
      'Tell us more': '请详细说明',
      'What happened, and what did you expect?': '发生了什么？你的预期是什么？',
      'Saving is paused until they load': '加载完成前将暂停保存',
      'Jot an idea…': '记下一个想法…',
      'Showing Freebuff data needs the desktop app.': '显示 Freebuff 数据需要使用桌面应用。',
      'Could not open Freebuff’s data folder.': '无法打开 Freebuff 数据文件夹。',
      'Open PR': '打开 PR',
      'Drag to reorder': '拖动以重新排序',
      'Protected from automatic archive': '受保护，不会自动归档',
      'Open the stash': '打开暂存',
      'Stashed messages': '已暂存消息',
      'Stash this message': '暂存此消息',
      'Files only': '仅文件',
      'Discard this stashed message': '丢弃此暂存消息',
      'Search skills': '搜索技能',
      'Close skill search': '关闭技能搜索',
      'Create from scratch': '从头创建',
      'Start a new project skill with a guided template': '使用引导模板创建新的项目技能',
      'Popular skills': '热门技能',
      'Filter popular skills by category': '按类别筛选热门技能',
      'Inserting skill…': '正在插入技能…',
      'Use skill now': '立即使用技能',
      'Done editing skills': '完成技能编辑',
      'Queue skill': '将技能加入队列',
      'Run this thread in a separate Git worktree so its changes don’t affect your current folder.':
        '在独立 Git 工作树中运行此任务，其更改不会影响当前文件夹。',
      'This folder isn’t a git repository, so isolated workspaces aren’t available. Threads run directly in the folder.':
        '此文件夹不是 Git 仓库，无法使用隔离工作区；任务将直接在此文件夹中运行。',
      'This thread runs directly in the shared project folder.': '此任务直接在共享项目文件夹中运行。',
      'Current branch in this shared folder — pick another to switch':
        '共享文件夹中的当前分支 — 选择其他分支以切换',

      // Updater
      'Closing safely, then reopening the updated app.': '将安全关闭应用，然后重新打开更新后的版本。',
      'You can keep working while the update downloads.': '更新下载期间你可以继续工作。',
      'Cancel download': '取消下载',
      'It will restart after your active work finishes.': '当前工作完成后，应用将重启。',
      'Restart now': '立即重启',
      'Keep this version': '保留此版本',
      'Freebuff update': 'Freebuff 更新',
      'Checking for updates': '正在检查更新',
      'Keep working': '继续工作',
      'All up to date': '已是最新版本',
      'You have the latest available version. Freebuff will keep checking in the background.':
        '你已使用最新可用版本。Freebuff 会继续在后台检查更新。',
      'Development build': '开发版本',
      'Update checks are unavailable here': '此版本无法检查更新',
      'Install a packaged Freebuff build to test automatic updates.': '请安装打包版 Freebuff 以测试自动更新。',
      'Connection problem': '连接问题',
      'Could not check for updates': '无法检查更新',
      'Freebuff could not reach the update service. Try again, or download the latest installer.':
        'Freebuff 无法连接更新服务。请重试，或下载最新安装程序。',
      'Download manually': '手动下载',
      'Not now': '暂不',
      'Finish setup': '完成设置',
      'Move Freebuff to Applications': '将 Freebuff 移到“应用程序”',
      'Download installer': '下载安装程序',
      'Update interrupted': '更新已中断',
      'Your current version is untouched. Try the update again, or download the installer.':
        '当前版本未受影响。请重试更新，或下载安装程序。',
      'Install now for the quickest update, or let Freebuff wait until your active work is finished.':
        '立即安装可最快完成更新，也可以等当前工作完成后再安装。',
      'Install and restart': '安装并重启',
      'Install when idle': '空闲时安装',
      'Skip this version': '跳过此版本',
      'Close update dialog': '关闭更新对话框',
      'Updates are verified before installation.': '更新会在安装前进行验证。',

      // Startup recovery page
      'Freebuff couldn’t load': 'Freebuff 无法加载',
      'Reload Freebuff': '重新加载 Freebuff',
      'Get latest installer': '获取最新安装程序',
      'Part of the interface did not start. Reload once; if this screen returns, reinstall the latest version. Your projects and conversations are safe.':
        '部分界面未能启动。请重新加载一次；如果此页面再次出现，请重新安装最新版本。你的项目和会话数据是安全的。',
    }),
  )

  let regionNameTranslations = null

  function translateRegionName(region) {
    if (region === 'your region') return '你所在的地区'
    if (!regionNameTranslations) {
      regionNameTranslations = new Map()
      try {
        const englishNames = new Intl.DisplayNames(['en'], { type: 'region' })
        const chineseNames = new Intl.DisplayNames(['zh-CN'], { type: 'region' })
        for (let first = 65; first <= 90; first += 1) {
          for (let second = 65; second <= 90; second += 1) {
            const code = String.fromCharCode(first, second)
            const english = englishNames.of(code)
            const chinese = chineseNames.of(code)
            if (english && english !== code && chinese && chinese !== code) {
              regionNameTranslations.set(english, chinese)
            }
          }
        }
      } catch {
        // Keep the English region name when Intl.DisplayNames is unavailable.
      }
    }
    return regionNameTranslations.get(region) ?? region
  }

  function translateUnavailableRegion(_match, region) {
    return `部分模型暂未在${translateRegionName(region)}提供`
  }

  function translatePrivacyConnection(_match, signalList) {
    const labels = {
      'anonymized network': '匿名网络',
      proxy: '代理',
      relay: '中继',
      'residential proxy': '住宅代理',
      Tor: 'Tor',
      VPN: 'VPN',
      'hosting network': '托管网络',
      'privacy service': '隐私服务',
    }
    const translatedSignals = signalList
      .split(/,\s*(?:or\s+)?|\s+or\s+/)
      .filter(Boolean)
      .map((signal) => labels[signal] ?? signal)
      .join('、')
    return `检测到正在使用${translatedSignals}；使用直连网络可获得更多模型`
  }

  const patterns = [
    [/^New API key for (.+)$/, '$1 的新 API 密钥'],
    [/^Reasoning effort for (.+)$/, '$1 的推理力度'],
    [/^(Commit|Custom|Investigate|Merge PR) · Effort (\d+)$/,
      (_match, label, effort) => `${exact.get(label) ?? label} · 投入程度 ${effort}`],
    [/^Details for (.+)$/, '$1 的详细信息'],
    [/^All connectors \((\d+)\)$/, '全部连接器（$1）'],
    [/^Part of the interface did not start\.\s+Reload once; if this screen returns, reinstall the\s+latest version\.\s+Your projects and conversations are safe\.$/,
      '部分界面未能启动。请重新加载一次；若再次出现此页面，请重新安装最新版本。你的项目和对话不会丢失。'],
    [/^Claim earned Freebucks when starting this session, then spend ([\d,.]+) Freebucks( and end your current session)?\?$/,
      (_match, cost, end) => `启动此会话时领取已赚取的 Freebucks，然后花费 ${cost} Freebucks${end ? '并结束当前会话' : ''}？`],
    [/^Session started (.+)$/, '会话开始于 $1'],
    [/^([\d,.]+) Freebucks refunded$/, '已退还 $1 Freebucks'],
    [/^Retrying (\d+) session ends$/, '正在重试结束 $1 个会话'],
    [/^(\d+) refunds processing$/, '$1 笔退款处理中'],
    [/^No connector matches “(.+)”\.$/, '没有匹配“$1”的连接器。'],
    [/^Connected · Manage (.+)$/, '已连接 · 管理 $1'],
    [/^Choose tools for (.+)$/, '为 $1 选择工具'],
    [/^Connect to (.+)\?$/, '连接到 $1？'],
    [/^Run (.+)\?$/, '运行 $1？'],
    [/^Manage (.+)$/, '管理 $1'],
    [/^Connecting (.+)$/, '正在连接 $1'],
    [/^Reconnect (.+)$/, '重新连接 $1'],
    [/^Connect (.+)$/, '连接 $1'],
    [/^Review (.+)$/, '审查 $1'],
    [/^Enable (.+)$/, '启用 $1'],
    [/^Disable (.+)$/, '禁用 $1'],
    [/^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?) daily · resets in (.+)$/, '$1/$2 每日额度 · 将在 $3 后重置'],
    [/^resets in (.+)$/, '将在 $1 后重置'],
    [/^On · synced (.+)$/, '开启 · 已于 $1 同步'],
    [/^Error: (.+)$/, '错误：$1'],
    [
      /^(\d+(?:\.\d+)?) Freebucks · Labor Day weekend \(through (.+) PT\)$/,
      '$1 Freebucks · 劳动节周末（太平洋时间 $2 结束）',
    ],
    [
      /^Peak pricing · \+(\d+(?:\.\d+)?) Freebucks until (.+) PT · May use data for AI training$/,
      '高峰价格 · 太平洋时间 $2 前额外需要 $1 Freebucks · 可能将数据用于 AI 训练',
    ],
    [
      /^Step 1 of 2 · Download Claude Code (.+) for Freebuff \((\d+) MB; (\d+) MB installed\)\.$/,
      '第 1/2 步 · 下载供 Freebuff 使用的 Claude Code $1（下载 $2 MB；安装后 $3 MB）。',
    ],
    [/^Step 1 of 2 · Downloading Claude Code (.+) · (\d+)%$/, '第 1/2 步 · 正在下载 Claude Code $1 · $2%'],
    [
      /^Step 1 of 2 · Verifying and installing Claude Code (.+)$/,
      '第 1/2 步 · 正在验证并安装 Claude Code $1',
    ],
    [
      /^Step 1 of 2 · Install the Claude Code CLI — the Claude Desktop app does not include it$/,
      '第 1/2 步 · 安装 Claude Code CLI — Claude Desktop 应用并未包含该组件',
    ],
    [/^Step 1 of 2 · Install the (.+) CLI$/, '第 1/2 步 · 安装 $1 CLI'],
    [/^Update the (.+) CLI · (.+)$/, '更新 $1 CLI · $2'],
    [/^Freebuff has (\d+) questions$/, 'Freebuff 有 $1 个问题'],
    [/^Search (\d+) connectors…$/, '搜索 $1 个连接器…'],
    [/^No connector matches “(.+)”\.$/, '没有匹配“$1”的连接器。'],
    [
      /^(\d+(?:\.\d+)?\/\d+(?:\.\d+)?) sessions today\. Each lasts up to 1 hour\. Resets (.+)\.$/,
      '今日会话：$1。每个会话最长持续 1 小时。重置时间：$2。',
    ],
    [
      /^(\d+(?:\.\d+)?\/\d+(?:\.\d+)?) starts today\. Each start opens up to 1 hour; ending early still uses one start\. Resets (.+)\.$/,
      '今日启动次数：$1。每次启动可使用最长 1 小时；提前结束仍会消耗一次。重置时间：$2。',
    ],
    [
      /^(\d+(?:\.\d+)?) of today's (\d+(?:\.\d+)?) Freebucks left\. Spent before your wallet, and they do not carry over — refills in (.+)\.$/,
      '今日 $2 Freebucks 中剩余 $1。优先于钱包余额使用，且不会结转 — 将在 $3 后补充。',
    ],
    [
      /^(\$[\d.]+) of usage left this month, out of (\$[\d.]+)\. That is what your sessions cost to run, not what you are billed\.$/,
      '本月 $2 使用额度中剩余 $1。这是会话的运行成本，不是向你收取的费用。',
    ],
    [/^Out of Freebucks · more in (.+)$/, 'Freebucks 已用尽 · 将在 $1 后补充'],
    [/^Running low · today's refill in (.+)$/, '余额即将用尽 · 今日额度将在 $1 后补充'],
    [/^Free sessions are used first · today resets in (.+)$/, '优先使用免费会话 · 今日额度将在 $1 后重置'],
    [
      /^Today's Freebucks are spent\. This uses (\d+(?:\.\d+)?) from your wallet and ends your current session\.$/,
      '今日 Freebucks 已用尽。将从钱包余额中使用 $1，并结束当前会话。',
    ],
    [
      /^Today's Freebucks are spent\. This uses (\d+(?:\.\d+)?) from your wallet\.$/,
      '今日 Freebucks 已用尽。将从钱包余额中使用 $1。',
    ],
    [
      /^Ends your session and starts a new one for (\d+(?:\.\d+)?) Freebucks\.$/,
      '结束当前会话，并使用 $1 Freebucks 启动新会话。',
    ],
    [
      /^Premium sessions reset in (.+) · MiMo and V4 Flash stay unmetered$/,
      '高级会话将在 $1 后重置 · MiMo 和 V4 Flash 仍不计量',
    ],
    [/^Today's premium sessions are used · resets in (.+)$/, '今日高级会话已用尽 · 将在 $1 后重置'],
    [
      /^(\d+(?:\.\d+)?) Freebucks buys one hour of unlimited messages and tool calls\. Charged once, when the session starts\.$/,
      '$1 Freebucks 可购买 1 小时不限量消息和工具调用。会话开始时一次扣除。',
    ],
    [
      /^(\d+(?:\.\d+)?) Freebucks an hour, more than the (\d+(?:\.\d+)?) you have left today plus your wallet\.$/,
      '每小时需要 $1 Freebucks，超过你今日剩余额度与钱包余额之和（$2）。',
    ],
    [/^connected · (\d+) tools?$/, '已连接 · $1 个工具'],
    [/^(\d+)\/(\d+) tabs? in use$/, '已使用 $1/$2 个标签页'],
    [/^frees in (\d+)m$/, '将在 $1 分钟后释放'],
    [
      /^(\d+(?:\.\d+)?) of (\d+(?:\.\d+)?) premium sessions left today \((\d+(?:\.\d+)?) free \+ (\d+(?:\.\d+)?) from (.+)\)$/,
      '今日剩余 $1/$2 个高级会话（$3 个免费 + $4 个来自 $5）',
    ],
    [
      /^(\d+(?:\.\d+)?) of (\d+(?:\.\d+)?) free premium sessions left today$/,
      '今日剩余 $1/$2 个免费高级会话',
    ],
    [
      /^(\d+(?:\.\d+)?) of (\d+(?:\.\d+)?) plan sessions left this week$/,
      '本周剩余 $1/$2 个方案会话',
    ],
    [
      /^(\d+(?:\.\d+)?) of (\d+(?:\.\d+)?) plan sessions left this billing period$/,
      '本计费周期剩余 $1/$2 个方案会话',
    ],
    [/^(\d+(?:\.\d+)?) of (\d+(?:\.\d+)?) free sessions left this week$/, '本周剩余 $1/$2 个免费会话'],
    [/^(\d+(?:\.\d+)?) of (\d+(?:\.\d+)?) free sessions left this month$/, '本月剩余 $1/$2 个免费会话'],
    [/^(.+) plan usage$/, '$1 方案用量'],
    [
      /^That turn failed, so the rest of the queue is paused\. Start running the queued item\.$/,
      '该轮执行失败，因此队列其余任务已暂停。开始运行排队项目。',
    ],
    [
      /^That turn failed, so the rest of the queue is paused\. Start running the (\d+) queued items\.$/,
      '该轮执行失败，因此队列其余任务已暂停。开始运行 $1 个排队项目。',
    ],
    [/^This tab is stopped\. Start running the queued item\.$/, '此标签页已停止。开始运行排队项目。'],
    [
      /^This tab is stopped\. Start running the (\d+) queued items\.$/,
      '此标签页已停止。开始运行 $1 个排队项目。',
    ],
    [/^The queue is paused\. Start running the queued item\.$/, '队列已暂停。开始运行排队项目。'],
    [
      /^The queue is paused\. Start running the (\d+) queued items\.$/,
      '队列已暂停。开始运行 $1 个排队项目。',
    ],
    [
      /^DeepSeek V4 Flash (\d{2}\/\d{2}) is paused here after a steep price increase — pausing it is what keeps these sessions free for everyone\. We're working to bring it back\.$/,
      'DeepSeek V4 Flash $1 因价格大幅上涨已在此暂停；暂停该模型有助于继续为所有人提供免费会话。我们正努力恢复提供。',
    ],
    [/^Some models aren't available in (.+) yet$/, translateUnavailableRegion],
    [/^Using a (.+)\? More models are available on a direct connection$/, translatePrivacyConnection],
    [
      /^GLM 5\.2 promo — bounties pay up to (\d+) a day$/,
      'GLM 5.2 活动 — 悬赏任务每天最多奖励 $1 个会话',
    ],
    [/^(\d+) left today · ends (.+)$/, '今日剩余 $1 个会话 · 结束时间：$2'],
    [/^Complete a bounty to unlock · ends (.+)$/, '完成一个悬赏任务即可解锁 · 结束时间：$1'],
    [/^\+(\d+) sessions?\/day from referrals$/, '邀请奖励：每天 +$1 个会话'],
    [
      /^(\d+) sessions? left today · resets in (.+) · earned from bounties$/,
      '今日剩余 $1 个会话 · 将在 $2 后重置 · 通过悬赏任务获得',
    ],
    [
      /^(\d+) sessions? left today · earned from bounties$/,
      '今日剩余 $1 个会话 · 通过悬赏任务获得',
    ],
    [
      /^(\d+) sessions? left today · resets in (.+) · invite friends for \+1\/day \((\d+) earned\)$/,
      '今日剩余 $1 个会话 · 将在 $2 后重置 · 邀请好友每天增加 1 个会话（已获得 $3）',
    ],
    [
      /^(\d+) sessions? left today · invite friends for \+1\/day \((\d+) earned\)$/,
      '今日剩余 $1 个会话 · 邀请好友每天增加 1 个会话（已获得 $2）',
    ],
    [
      /^Resets in (.+) · refer more friends for \+1\/day \((\d+) earned\)$/,
      '将在 $1 后重置 · 继续邀请好友每天增加 1 个会话（已获得 $2）',
    ],
    [
      /^refer more friends for \+1\/day \((\d+) earned\)$/,
      '继续邀请好友每天增加 1 个会话（已获得 $1）',
    ],
    [
      /^Each qualified referral adds \+1 session per day \(up to \+(\d+)\)$/,
      '每位符合条件的受邀好友每天增加 1 个会话（最多 +$1）',
    ],
    [/^Max bonus earned \((\d+)\/(\d+)\)$/, '已获得最高奖励（$1/$2）'],
    [
      /^Refer more friends for \+1\/day \((\d+)\/(\d+)\)$/,
      '继续邀请好友，每天增加 1 个会话（$1/$2）',
    ],
    [/^invite friends for \+1\/day \((\d+) earned\)$/, '邀请好友，每天增加 1 个会话（已获得 $1）'],
    [/^(\d+) sessions? left today$/, '今日剩余 $1 个会话'],
    [/^Mission stopped:\s*(.+)$/, '目标已停止：$1'],
    [
      /^Used (\d+(?:\.\d+)?) (premium )?sessions? so far\.\s+Stays active between turns;\s+ends when you close the tab or its 1-hour (?:window|session) expires\.\s+(\d+(?:\.\d+)?\/\d+(?:\.\d+)?) (premium )?sessions used (today|this week)\.\s+(Specific to this model|Shared across all premium models|Shared across all available free models)\.\s+Each lasts up to 1 hour;\s+closing the tab ends it early, counts only time used \(rounded up to 0\.1\)\.\s+Resets (.+)\.$/,
      translateActiveSessionTooltip,
    ],
    [
      /^(\d+(?:\.\d+)?\/\d+(?:\.\d+)?) (premium )?sessions used (today|this week)\.\s+(Specific to this model|Shared across all premium models|Shared across all available free models)\.\s+Each lasts up to 1 hour;\s+closing the tab ends it early, counts only time used \(rounded up to 0\.1\)\.\s+Resets (.+)\.$/,
      translateSessionQuotaDetails,
    ],
    [
      /^You've used all ([\d,.]+) (premium sessions|sessions for this model|sessions) (today|this week)\.(?: (Switch to DeepSeek V4 Flash to keep going\.))? Resets (.+)\.$/,
      translateExhaustedSessionTooltip,
    ],
    [
      /^Out of (premium sessions|sessions for this model|sessions) (today|this week) · resets in (.+)$/,
      translateOutOfSessions,
    ],
    [/^(\d+(?:\.\d+)?) premium sessions? · ([\d:]+) left$/, '$1 个高级会话 · 剩余 $2'],
    [/^(\d+(?:\.\d+)?) sessions? · ([\d:]+) left$/, '$1 个会话 · 剩余 $2'],
    [/^(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?) premium sessions$/, '$1/$2 个高级会话'],
    [/^(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?) sessions$/, '$1/$2 个会话'],
    [/^(\d+(?:\.\d+)?) premium sessions?$/, '$1 个高级会话'],
    [/^(\d+(?:\.\d+)?) sessions?$/, '$1 个会话'],
    [/^The dev server (?:process )?(?:exited|died)\.$/, '开发服务器已退出。'],
    [/^(\d+) day streak$/, '$1 天连续使用'],
    [/^(\d+) days streak$/, '$1 天连续使用'],
    [/^🎁\s*(\d+) more days to unlock \+1 bonus session every day$/, '🎁 再坚持 $1 天，即可每天额外获得 1 个会话'],
    [/^(\d+) more days to unlock \+1 bonus session every day$/, '再坚持 $1 天，即可每天额外获得 1 个会话'],
    [/^Context (\d+)%\. Show token usage details$/, '上下文 $1%。显示令牌用量详情'],
    [/^Context (\d+)%$/, '上下文 $1%'],
    [/^Context ([\d.]+[kKmM]?)$/, '上下文 $1'],
    [/^Account: (.+)$/, '账户：$1'],
    [/^(.+) account$/, '$1 账户'],
    [/^Workspace and settings for (.+)$/, '$1 的工作区和设置'],
    [/^Insert (.+) skill$/, '插入 $1 技能'],
    [/^Move (.+) to a new window$/, '将“$1”移至新窗口'],
    [/^Close (.+)$/, '关闭“$1”'],
    [/^Edit "(.+)" before sending$/, '发送前编辑“$1”'],
    [/^New thread \((.+)\)$/, '新建任务（$1）'],
    [/^Close tab \((.+)\)$/, '关闭标签页（$1）'],
    [/^(\d+) queued prompts?$/, '$1 条排队中的提示'],
    [/^Auto-run stopped: (.+)$/, '自动运行已停止：$1'],
    [/^(.+) has merge conflicts$/, '$1 存在合并冲突'],
    [/^(.+) closed without merge$/, '$1 已关闭且未合并'],
    [/^(.+) — open in browser$/, '$1 — 在浏览器中打开'],
    [/^Threads in (.+)$/, '$1 中的任务'],
    [/^New thread in (.+)$/, '在 $1 中新建任务'],
    [/^Search (.+) threads$/, '搜索$1任务'],
    [/^No threads match “(.+)”$/, '没有匹配“$1”的任务'],
    [/^Preview (.+)$/, '预览 $1'],
    [/^Loading (.+)$/, '正在加载 $1'],
    [/^Remove (.+)$/, '移除 $1'],
    [/^(\d+) queued items?$/, '$1 个排队项目'],
    [/^(\d+) code comments? — sent with your message$/, '$1 条代码评论 — 将随消息发送'],
    [/^(.+) more — keep typing$/, '还有 $1 项 — 继续输入'],
    [/^…and (\d+) more — keep typing to narrow it down$/, '…还有 $1 项 — 继续输入以缩小范围'],
    [/^Open the stash \((\d+) messages?\)$/, '打开暂存（$1 条消息）'],
    [/^More actions for (.+)$/, '“$1”的更多操作'],
    [/^Reorder (.+)$/, '重新排序“$1”'],
    [/^Dismiss notification: (.+)$/, '关闭通知：$1'],
    [/^Delete “(.+)”$/, '删除“$1”'],
    [/^Installing Freebuff (.+)$/, '正在安装 Freebuff $1'],
    [/^Downloading Freebuff (.+)$/, '正在下载 Freebuff $1'],
    [/^Freebuff (.+) is ready$/, 'Freebuff $1 已就绪'],
    [/^Freebuff (.+) is current$/, 'Freebuff $1 已是最新版本'],
    [/^Freebuff (.+) could not be installed$/, '无法安装 Freebuff $1'],
    [/^Freebuff (.+) is available$/, 'Freebuff $1 可用'],
    [/^Update from (.+) to (.+)$/, '从 $1 更新到 $2'],
    [/^Looking for a newer version than Freebuff (.+)\.$/, '正在查找比 Freebuff $1 更新的版本。'],
    [/^(\d+) pixels$/, '$1 像素'],
  ]

  function sessionUnit(premium) {
    return `${premium ? '高级' : ''}会话`
  }

  function sessionPeriod(period) {
    return period === 'this week' ? '本周' : '今日'
  }

  function sessionScope(scope) {
    const translations = {
      'Specific to this model': '此额度仅适用于当前模型。',
      'Shared across all premium models': '所有高级模型共享此额度。',
      'Shared across all available free models': '所有可用免费模型共享此额度。',
    }
    return translations[scope] ?? scope
  }

  function sessionTier(tier) {
    const translations = {
      'premium sessions': '高级会话',
      'sessions for this model': '当前模型的会话',
      sessions: '会话',
    }
    return translations[tier] ?? tier
  }

  function translateActiveSessionTooltip(
    _match,
    cost,
    activePremium,
    ratio,
    quotaPremium,
    period,
    scope,
    reset,
  ) {
    return `已使用 ${cost} 个${sessionUnit(activePremium)}。会话会在多轮对话间保持有效；关闭标签页或 1 小时窗口到期时结束。${sessionPeriod(period)}已使用 ${ratio} 个${sessionUnit(quotaPremium)}。${sessionScope(scope)}每个会话最长持续 1 小时；提前关闭标签页会结束会话，仅按实际使用时长计费（向上取整到 0.1）。重置时间：${reset}。`
  }

  function translateSessionQuotaDetails(_match, ratio, premium, period, scope, reset) {
    return `${sessionPeriod(period)}已使用 ${ratio} 个${sessionUnit(premium)}。${sessionScope(scope)}每个会话最长持续 1 小时；提前关闭标签页会结束会话，仅按实际使用时长计费（向上取整到 0.1）。重置时间：${reset}。`
  }

  function translateExhaustedSessionTooltip(_match, limit, tier, period, switchHint, reset) {
    const hint = switchHint ? '切换到 DeepSeek V4 Flash 以继续。' : ''
    return `你已用尽${sessionPeriod(period)}的 ${limit} 个${sessionTier(tier)}。${hint}重置时间：${reset}。`
  }

  function translateOutOfSessions(_match, tier, period, remaining) {
    return `${sessionPeriod(period)}的${sessionTier(tier)}已用尽 · 将在 ${remaining} 后重置`
  }

  const translatedAttributes = ['aria-label', 'aria-valuetext', 'data-tooltip', 'placeholder', 'title']
  const ignoredContentSelector = [
    'script',
    'style',
    'code',
    'pre',
    'textarea',
    '[data-freebuff-zh-ignore]',
    '[contenteditable]:not([contenteditable="false"])',
    '.bubble',
    '.user-sticky-bubble',
    '.user-message-text',
    '.prose',
    '.fold-reasoning-text',
    '.reasoning-text',
    '.act-arg',
    '.tool-row-details',
    '.file-view-body',
    '.change-diff',
    '.diff-comment-text',
    '.xterm',
    '.terminal-context-output',
    '.note-text',
    '.qnote',
  ].join(',')
  const stats = { text: 0, attributes: 0, contextual: 0, passes: 0 }

  function shouldIgnoreContent(element) {
    // Links and buttons inside user content are still user content.
    return Boolean(element?.closest?.(ignoredContentSelector) ||
      (element?.closest?.('.byok-saved-heading') && element?.closest?.('strong')))
  }

  function translateValue(value) {
    if (typeof value !== 'string' || value.length === 0) return value
    const leading = value.match(/^\s*/)?.[0] ?? ''
    const trailing = value.match(/\s*$/)?.[0] ?? ''
    const key = value.trim()
    if (!key) return value
    const direct = exact.get(key)
    if (direct !== undefined) return `${leading}${direct}${trailing}`
    for (const [pattern, replacement] of patterns) {
      if (pattern.test(key)) return `${leading}${key.replace(pattern, replacement)}${trailing}`
    }
    return value
  }

  function translateTextNode(node) {
    const parent = node.parentElement
    if (!parent) return
    // The provider option title contains a user-chosen connection name and a
    // separate app-owned badge. Preserve only the direct name text.
    if (parent.matches?.('.agent-option-title') && parent.closest?.('.agent-provider-option')) return
    if (shouldIgnoreContent(parent)) {
      translateMessageDisclosure(node, parent)
      return
    }
    const before = node.nodeValue
    const after = translateUiLabel(before, parent) ?? translateValue(before)
    if (after !== before) {
      node.nodeValue = after
      stats.text += 1
    }
  }

  function translateMessageDisclosure(node, parent) {
    // The native disclosure control lives inside .bubble in 0.0.109. Only its
    // direct label is UI; the sibling .user-message-text remains user content.
    const button = parent.tagName === 'SPAN' ? parent.parentElement : parent
    const disclosure = button?.parentElement
    const bubble = disclosure?.parentElement
    if (button?.tagName !== 'BUTTON' || !button.matches?.('.user-message-toggle') ||
        !disclosure?.matches?.('.user-message-disclosure') ||
        !bubble?.matches?.('.user-message-bubble') ||
        shouldIgnoreContent(bubble.parentElement) ||
        parent.closest?.(ignoredContentSelector.replace('.bubble,', ''))) return
    const key = node.nodeValue.trim()
    if (key !== 'Show more' && key !== 'Show less') return
    node.nodeValue = translateValue(node.nodeValue)
    stats.contextual += 1
  }

  // These words can also be filenames, commands or user text. Translate only
  // the dedicated app-owned label, never the adjoining .act-arg/output.
  const toolNameLabels = { Search: '搜索', Read: '读取', Run: '运行' }
  const toolStatusLabels = { success: '成功', failure: '失败', running: '运行中' }

  function translateUiLabel(value, element) {
    const key = value.trim()
    let translated
    const isToolHeader =
      element.parentElement?.matches?.('.tool-row-head') &&
      element.parentElement.parentElement?.matches?.('.tool-row')
    if (isToolHeader && element.matches?.('.act-name') && Object.hasOwn(toolNameLabels, key)) {
      translated = toolNameLabels[key]
    } else if (isToolHeader && element.matches?.('.tool-row-status') && Object.hasOwn(toolStatusLabels, key.toLowerCase())) {
      translated = toolStatusLabels[key.toLowerCase()]
    } else if (element.tagName === 'BUTTON' && element.matches?.('.quote-btn') && key === 'Quote') {
      translated = '引用'
    }
    return translated === undefined ? null : value.replace(key, translated)
  }

  function translateAttributes(element) {
    // A composer's placeholder describes the UI, not the user's draft. Keep
    // text/value protection and all enclosing ignored regions in force.
    const isUiTextarea =
      element.tagName === 'TEXTAREA' &&
      !element.hasAttribute('data-freebuff-zh-ignore') &&
      !shouldIgnoreContent(element.parentElement)
    if (!isUiTextarea && shouldIgnoreContent(element)) return
    for (const name of translatedAttributes) {
      if (isUiTextarea && name === 'aria-valuetext') continue
      if (!element.hasAttribute(name)) continue
      const before = element.getAttribute(name)
      const after = translateValue(before)
      if (after !== before) {
        element.setAttribute(name, after)
        stats.attributes += 1
      }
    }
  }

  function contextCandidates(scope, selector) {
    const candidates = []
    const closest = scope.matches?.(selector) ? scope : scope.closest?.(selector)
    if (closest) candidates.push(closest)
    for (const candidate of scope.querySelectorAll?.(selector) ?? []) candidates.push(candidate)
    return Array.from(new Set(candidates))
  }

  function applyContextRules(root) {
    const scope =
      root.nodeType === Node.ELEMENT_NODE ||
      root.nodeType === Node.DOCUMENT_NODE ||
      root.nodeType === Node.DOCUMENT_FRAGMENT_NODE
        ? root
        : root.parentElement
    if (!scope?.querySelectorAll) return
    for (const button of contextCandidates(scope, '.acts-toggle')) {
      if (shouldIgnoreContent(button)) continue
      // Freebuff 0.0.93 nests the split "step" + "s" nodes in .acts-label.
      for (const label of [button, ...button.querySelectorAll('.acts-label')]) {
        if (shouldIgnoreContent(label)) continue
        for (const child of label.childNodes) {
          if (child.nodeType !== Node.TEXT_NODE) continue
          if (child.nodeValue.trim() === 's') {
            child.nodeValue = ''
            stats.contextual += 1
          }
        }
      }
    }
    for (const heading of contextCandidates(scope, '.turn-changes-head')) {
      if (shouldIgnoreContent(heading)) continue
      const labels = Array.from(heading.querySelectorAll('span'))
      const label = labels.find((candidate) => /^Agent changed\s+\d+\s+files?$/.test(candidate.textContent.trim()))
      if (!label || shouldIgnoreContent(label)) continue
      const match = label.textContent.trim().match(/^Agent changed\s+(\d+)\s+files?$/)
      if (!match) continue
      label.textContent = `智能体修改了 ${match[1]} 个文件`
      stats.contextual += 1
    }
  }

  function translateTree(root) {
    if (!root) return
    if (root.nodeType === Node.TEXT_NODE) {
      translateTextNode(root)
      applyContextRules(root)
      return
    }
    if (
      root.nodeType !== Node.ELEMENT_NODE &&
      root.nodeType !== Node.DOCUMENT_NODE &&
      root.nodeType !== Node.DOCUMENT_FRAGMENT_NODE
    )
      return
    if (root.nodeType === Node.ELEMENT_NODE) translateAttributes(root)
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT)
    let current
    while ((current = walker.nextNode())) {
      if (current.nodeType === Node.TEXT_NODE) translateTextNode(current)
      else translateAttributes(current)
    }
    applyContextRules(root)
    stats.passes += 1
  }

  function start() {
    document.documentElement.lang = 'zh-CN'
    translateTree(document.documentElement)
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'characterData') translateTree(mutation.target)
        else if (mutation.type === 'attributes') translateAttributes(mutation.target)
        else for (const node of mutation.addedNodes) translateTree(node)
      }
    })
    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: translatedAttributes,
    })
    globalThis.__FREEBUFF_ZH_PATCH__.observer = observer
  }

  globalThis.__FREEBUFF_ZH_PATCH__ = {
    id: PATCH_ID,
    version: PATCH_VERSION,
    stats,
    translate: translateValue,
    translateAll: () => translateTree(document.documentElement),
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true })
  else start()
})()
