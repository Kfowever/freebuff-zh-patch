const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');const c={Node:{},NodeFilter:{},document:{readyState:'loading',addEventListener(){}}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../freebuff-zh-cn.js'),'utf8'),c);const cases=[
  [
    "Skip all these questions",
    "跳过所有这些问题"
  ],
  [
    "Orchestration and scripting",
    "编排与脚本"
  ],
  [
    "I will hold only one Freebuff account. Creating, buying or sharing more than one account is not allowed, and every account I hold may be suspended if I do.",
    "我只持有一个 Freebuff 账户。我不得创建、购买或分享多个账户；如有违反，我持有的所有账户都可能被停用。"
  ],
  [
    "Zero tolerance",
    "零容忍"
  ],
  [
    "Checking suspension records",
    "正在检查停用记录"
  ],
  [
    "Deciding the appeal",
    "正在审核申诉"
  ],
  [
    "Your number isn’t verified yet. Enter the code we sent.",
    "你的号码尚未验证。请输入我们发送的验证码。"
  ],
  [
    "We reviewed your account and decided to give it another chance. Agree to the Freebuff usage rules below and your account is restored right away, at no cost.",
    "我们已审核你的账户，并决定再给你一次机会。请同意下方 Freebuff 使用规则，账户将立即免费恢复。"
  ],
  [
    "Verify your phone",
    "验证手机号"
  ],
  [
    "This suspension can't be appealed here. If you believe it's a mistake, email support from the address you sign in with.",
    "无法在此申诉此次停用。如认为有误，请使用登录账户的邮箱联系支持团队。"
  ],
  [
    "Restart the Freebuff CLI or Desktop to pick it back up.",
    "重启 Freebuff CLI 或桌面应用以继续。"
  ],
  [
    "Type your full name to sign.",
    "输入全名以签署。"
  ],
  [
    "Agree to all",
    "全部同意"
  ],
  [
    "Sign and continue",
    "签署并继续"
  ],
  [
    "Yearly",
    "按年"
  ],
  [
    "Introductory first month, then the list price;",
    "首月为优惠价，之后按标价收费；"
  ],
  [
    "Couldn’t load your account standing.",
    "无法加载账户状态。"
  ],
  [
    "Appealable ban",
    "可申诉的封禁"
  ],
  [
    "This account isn’t suspended. Accounts that break the rules below are.",
    "此账户未被停用。违反以下规则的账户将被停用。"
  ],
  [
    "Yearly payment",
    "年度付款"
  ],
  [
    "One year, no renewal. More payment options, including crypto and mobile wallets.",
    "有效期一年，不自动续订。还有更多付款方式，包括加密货币和移动钱包。"
  ],
  [
    "Renew for another year",
    "续订一年"
  ],
  [
    "Annual plan changes are not available yet",
    "暂不支持更改年度套餐"
  ],
  [
    "Cancel plan",
    "取消套餐"
  ],
  [
    "Pay to restore this plan. Any card works.",
    "付款以恢复此套餐。支持任意银行卡。"
  ],
  [
    "We could not check your discount. Reload Billing to try again.",
    "无法检查折扣。请重新加载账单页面再试。"
  ],
  [
    "Upgrades start a new month. Stripe shows the credit for unused paid time and the total before you pay.",
    "升级将开启新的计费月。付款前，Stripe 会显示未使用付费时长的抵扣金额和应付总额。"
  ],
  [
    "Annual plan changes open when the paid term ends.",
    "付费期限结束后即可更改年度套餐。"
  ],
  [
    "Your plan stays active",
    "你的套餐仍然有效"
  ],
  [
    "I accept that my plan benefits end immediately, with no refund",
    "我接受套餐权益立即终止且不予退款"
  ],
  [
    "Confirm your email",
    "确认邮箱"
  ],
  [
    "Confirm cancellation",
    "确认取消"
  ],
  [
    "Could not confirm this purchase. Try again.",
    "无法确认此次购买。请重试。"
  ],
  [
    "Buying hours isn’t available in this environment.",
    "当前环境不支持购买小时额度。"
  ],
  [
    "Payment card",
    "支付卡"
  ],
  [
    "Change card",
    "更换银行卡"
  ],
  [
    "Ready to confirm.",
    "可以确认。"
  ],
  [
    "Your ID couldn't be used for this account.",
    "此账户无法使用你的身份证件。"
  ],
  [
    "Identity verified",
    "身份已验证"
  ],
  [
    "Get verified",
    "开始验证"
  ],
  [
    "Your identity verification.",
    "你的身份验证。"
  ],
  [
    "Could not accept the terms.",
    "无法接受这些条款。"
  ],
  [
    "This account requires ID verification before it can start a free session.",
    "此账户必须先完成身份证件验证，才能开始免费会话。"
  ],
  [
    "Continue to verification",
    "继续验证"
  ],
  [
    "Thanks, your verification is complete.",
    "感谢，验证已完成。"
  ],
  [
    "We could not start your verification. Please try again.",
    "无法开始验证。请重试。"
  ],
  [
    "Country verified.",
    "国家/地区已验证。"
  ],
  [
    "Checking connection…",
    "正在检查连接…"
  ],
  [
    "Any VPN or proxy",
    "任何 VPN 或代理"
  ],
  [
    "Monthly bonus hours",
    "每月奖励时长"
  ],
  [
    "Name saved.",
    "姓名已保存。"
  ],
  [
    "Send new codes",
    "发送新验证码"
  ],
  [
    "That provider belongs to another Freebuff account.",
    "该提供方已关联到另一个 Freebuff 账户。"
  ],
  [
    "This permanently deletes your account. It cannot be undone.",
    "这将永久删除你的账户，且无法撤销。"
  ],
  [
    "Delete permanently",
    "永久删除"
  ],
  [
    "Permanent. Cancel any paid plan first.",
    "此操作永久生效。请先取消所有付费套餐。"
  ],
  [
    "Profile answers",
    "个人资料问答"
  ],
  [
    "No answers yet. Freebuff asks a few quick questions while the agent works.",
    "目前还没有回答。智能体工作期间，Freebuff 会提出几个简短问题。"
  ],
  [
    "You're connected",
    "已连接"
  ],
  [
    "This sign-in link was used",
    "此登录链接已使用"
  ],
  [
    "Try signing in again.",
    "请重新尝试登录。"
  ],
  [
    "Too many attempts. Wait an hour and try again.",
    "尝试次数过多。请等待一小时后重试。"
  ],
  [
    "That code has expired. Send a new one.",
    "验证码已过期。请重新发送。"
  ],
  [
    "Verifying a phone number won’t lift a suspension.",
    "验证手机号不会解除账户停用。"
  ],
  [
    "A plan is required",
    "需要套餐"
  ],
  [
    "Verify by SMS instead",
    "改用短信验证"
  ],
  [
    "You're all set",
    "已完成"
  ],
  [
    "Use a different number",
    "使用其他号码"
  ],
  [
    "Change number or resend",
    "更换号码或重新发送"
  ],
  [
    "Send code",
    "发送验证码"
  ],
  [
    "Email support",
    "发送邮件联系支持团队"
  ],
  [
    "Select a chat to open its terminal.",
    "选择一个聊天以打开终端。"
  ],
  [
    "Interactive cloud terminal",
    "交互式云终端"
  ],
  [
    "Your app preview will appear here.",
    "应用预览将在此处显示。"
  ],
  [
    "Reload preview",
    "重新加载预览"
  ],
  [
    "Browser is open in another panel.",
    "浏览器已在另一个面板中打开。"
  ],
  [
    "Open the streamed browser in this panel.",
    "在此面板中打开实时浏览器。"
  ],
  [
    "App preview",
    "应用预览"
  ],
  [
    "Import cookie file…",
    "导入 Cookie 文件…"
  ],
  [
    "New page",
    "新页面"
  ],
  [
    "Use these settings for new tabs",
    "将这些设置应用于新标签页"
  ],
  [
    "File exceeds the 2 MB preview limit.",
    "文件超过 2 MB 预览上限。"
  ],
  [
    "Couldn’t read file",
    "无法读取文件"
  ],
  [
    "Excel workbook",
    "Excel 工作簿"
  ],
  [
    "SQLite database",
    "SQLite 数据库"
  ],
  [
    "This file isn’t text, so it can’t be shown here.",
    "此文件不是文本文件，无法在此显示。"
  ],
  [
    "No matching files.",
    "没有匹配的文件。"
  ],
  [
    "Line totals include each saved edit.",
    "行数总计包含每次已保存的编辑。"
  ],
  [
    "Select the local project again to open its terminal.",
    "请重新选择本地项目以打开终端。"
  ],
  [
    "The terminal could not be stopped. Try again.",
    "无法停止终端。请重试。"
  ],
  [
    "Open local files in the latest Freebuff Desktop app.",
    "在最新版 Freebuff 桌面应用中打开本地文件。"
  ],
  [
    "For projects on this computer",
    "用于此电脑上的项目"
  ],
  [
    "This file is no longer in the project.",
    "此文件已不在项目中。"
  ],
  [
    "Could not check your join reward.",
    "无法检查你的加入奖励。"
  ],
  [
    "Your own AI providers aren’t available in this environment.",
    "当前环境不支持使用你自己的 AI 提供方。"
  ],
  [
    "Subscriber role active.",
    "订阅者身份已生效。"
  ],
  [
    "Link your Discord account.",
    "关联你的 Discord 账户。"
  ],
  [
    "Discord linking is not available right now.",
    "目前无法关联 Discord 账户。"
  ],
  [
    "No skills match your search.",
    "没有符合搜索条件的技能。"
  ],
  [
    "Not supported!",
    "不支持！"
  ],
  [
    "Third-party clients",
    "第三方客户端"
  ],
  [
    "I will not drive Freebuff from scripts, bots, schedulers, orchestrators or other programs, or run it headless to serve another app or API. Free mode is for my own interactive use.",
    "我不会通过脚本、机器人、定时任务、编排器或其他程序操控 Freebuff，也不会以无头模式运行 Freebuff 来为其他应用或 API 提供服务。免费模式仅供我本人交互使用。"
  ],
  [
    "No reselling or token misuse",
    "不得转售或滥用令牌"
  ],
  [
    "If I am detected breaking any of these rules again, my account, devices and network will be permanently banned with no appeal, even with an active subscription, and I will not be refunded.",
    "如果再次检测到我违反任何规则，我的账户、设备和网络将被永久封禁，且不得申诉；即使订阅仍有效，也不会退款。"
  ],
  [
    "Checking request history",
    "正在检查请求历史记录"
  ],
  [
    "Your account has been suspended for accessing Freebuff with a third-party client or proxy. Free mode is only available through official Freebuff clients (the CLI, Desktop, and freebuff.com).",
    "由于你使用第三方客户端或代理访问 Freebuff，账户已被暂停。免费模式仅可通过 Freebuff 官方客户端使用（CLI、Desktop 和 freebuff.com）。"
  ],
  [
    "Couldn’t restore your account. Try again.",
    "无法恢复你的账户，请重试。"
  ],
  [
    "Agree to the Freebuff usage rules, then we review your account history. Some suspensions can only be lifted with a paid plan.",
    "请同意 Freebuff 使用规则，然后我们会审核你的账户历史记录。部分暂停状态只能通过付费套餐解除。"
  ],
  [
    "Your account can be restored at no cost: verify your mobile number with a one-time SMS code. This is your account’s one appeal, so if a third-party client is detected again, the ban is permanent.",
    "你的账户可以免费恢复：使用一次性短信验证码验证手机号码。这是该账户唯一一次申诉机会；如果再次检测到第三方客户端，账户将被永久封禁。"
  ],
  [
    "Confirming your payment…",
    "正在确认付款…"
  ],
  [
    "The agreement you signed still applies: this was the account’s one appeal.",
    "你签署的协议仍然有效：这是该账户唯一一次申诉机会。"
  ],
  [
    "Confirm every rule to continue.",
    "请确认每一条规则以继续。"
  ],
  [
    "Type your full legal name to sign",
    "输入你的法定全名以签署"
  ],
  [
    "Couldn’t start checkout. Try again.",
    "无法开始结账，请重试。"
  ],
  [
    "Due to the severity of the violation on this account, the only way to lift the suspension is to subscribe to a plan. Your account is reinstated as soon as the payment clears.",
    "由于此账户违规情节严重，只有订阅套餐才能解除暂停。付款成功后，账户会立即恢复。"
  ],
  [
    "Exit preview",
    "退出预览"
  ],
  [
    "Final ban",
    "永久封禁"
  ],
  [
    "Usage rules",
    "使用规则"
  ],
  [
    "Pay once",
    "一次性付款"
  ],
  [
    "For crypto and more local payment options, choose Pay once.",
    "如需使用加密货币或其他本地付款方式，请选择“一次性付款”。"
  ],
  [
    "Plan changes are not available yet",
    "暂不支持更改套餐"
  ],
  [
    "Pay once for a year",
    "一次性购买一年"
  ],
  [
    "Switch at renewal",
    "在续订时切换"
  ],
  [
    "Plans aren’t available in this environment.",
    "此环境中无法使用套餐。"
  ],
  [
    "Pay to restore this plan, or choose a different monthly plan below. A plan change takes effect only after payment succeeds.",
    "付款以恢复此套餐，或在下方选择其他月度套餐。只有付款成功后，套餐更改才会生效。"
  ],
  [
    "Pay once for the year, without auto-renewal",
    "一次性购买一年，不会自动续订"
  ],
  [
    "Allowances are confirmed at checkout.",
    "具体额度将在结账时确认。"
  ],
  [
    "Cancelling takes effect immediately.",
    "取消将立即生效。"
  ],
  [
    "Reason",
    "原因"
  ],
  [
    "Cancel plan now",
    "立即取消套餐"
  ],
  [
    "Could not confirm your saved card. Auto top-up was not changed.",
    "无法验证已保存的银行卡。自动充值设置未更改。"
  ],
  [
    "Bought hours expire one year after purchase.",
    "购买的时长自购买之日起一年后过期。"
  ],
  [
    "Add a card to finish turning on auto top-up.",
    "添加银行卡以完成自动充值设置。"
  ],
  [
    "Add card and enable",
    "添加银行卡并启用"
  ],
  [
    "Verify your ID next.",
    "接下来请验证身份证件。"
  ],
  [
    "Both steps are done.",
    "两个步骤均已完成。"
  ],
  [
    "Freebuff keeps the result, a keyed hash of your document (never the document number itself), the issuing country and document type, the scores and the warnings Didit raises. We do not keep your photos, your selfie or your name and date of birth from the document. Didit keeps its copy for up to the retention period set in our Didit account, then deletes it; biometric data is never kept longer than necessary for this purpose and in any case no longer than three years after your last interaction with Freebuff. Deleting your Freebuff account asks Didit to erase your verification, except where the account was suspended for abuse.",
    "Freebuff 会保留验证结果、你证件的带密钥哈希值（绝不会保留证件号码本身）、签发国家或地区、证件类型、评分以及 Didit 提供的警告。我们不会保留你的证件照片、自拍照，也不会保留证件上的姓名和出生日期。Didit 会按我们在其账户中设置的保留期限保存副本，之后将其删除；生物识别数据仅在实现此目的所需的时间内保留，且无论如何不会超过你最后一次使用 Freebuff 后的三年。删除 Freebuff 账户时，我们会要求 Didit 删除你的验证信息；因滥用而被暂停的账户除外。"
  ],
  [
    "Freebuff is free because each person gets one free account. By accepting these terms, the identity you just verified (your ID document and your face) is locked to this Freebuff account.",
    "Freebuff 免费使用，是因为每个人都可以拥有一个免费账户。接受这些条款后，你刚刚验证的身份（身份证件和人脸）将绑定到此 Freebuff 账户。"
  ],
  [
    "Verifying with a false, forged or altered identity, or with someone else's, is also a violation: it leads to the permanent suspension of the account and of every account that shares a device with it.",
    "使用虚假、伪造或篡改的身份进行验证，或使用他人的身份验证，同样属于违规：该账户以及所有共用设备的账户都将被永久暂停。"
  ],
  [
    "If you believe we made a mistake, contact support before creating another account.",
    "如果你认为我们处理有误，请先联系支持团队，再创建其他账户。"
  ],
  [
    "Verification required",
    "需要验证"
  ],
  [
    "Verify your identity with a photo of your ID and a short selfie to get a verified badge.",
    "上传身份证件照片并拍摄一段简短自拍，以验证身份并获得已验证徽章。"
  ],
  [
    "Could not save your consent.",
    "无法保存你的同意状态。"
  ],
  [
    "Your identity is verified and locked to this account.",
    "你的身份已通过验证，并绑定到此账户。"
  ],
  [
    "This account needs to verify its identity.",
    "此账户需要验证身份。"
  ],
  [
    "There is nothing to verify on this account right now.",
    "此账户目前无需进行验证。"
  ],
  [
    "Identity verification is not available right now. Please try again later.",
    "身份验证目前不可用，请稍后重试。"
  ],
  [
    "Consent to identity verification",
    "同意进行身份验证"
  ],
  [
    "Your verification is waiting for you to finish it.",
    "身份验证尚未完成，请继续操作。"
  ],
  [
    "Your verification could not be completed.",
    "无法完成身份验证。"
  ],
  [
    "Continue verification",
    "继续验证"
  ],
  [
    "Accept and finish",
    "接受并完成"
  ],
  [
    "Still not working? You can request a review of your region.",
    "仍然无法解决？你可以申请审核所在地区。"
  ],
  [
    "We couldn’t confirm your region yet. Keep using Freebuff from your usual home or mobile connection and try again later.",
    "我们暂时无法确认你所在的地区。请继续使用平时的家庭网络或移动网络访问 Freebuff，稍后再试。"
  ],
  [
    "Your region is confirmed. It can take up to an hour to apply everywhere.",
    "已确认你所在的地区。此更改可能需要最多一小时才能全面生效。"
  ],
  [
    "Verified country",
    "已验证的国家或地区"
  ],
  [
    "Country saved.",
    "国家或地区已保存。"
  ],
  [
    "Select your country",
    "选择你的国家或地区"
  ],
  [
    "Daily hours by location",
    "各地区每日可用时长"
  ],
  [
    "Email changed.",
    "电子邮件已更改。"
  ],
  [
    "Confirm change",
    "确认更改"
  ],
  [
    "Email and password",
    "电子邮件和密码"
  ],
  [
    "Sign-in methods aren’t available in this environment.",
    "此环境中无法使用登录方式设置。"
  ],
  [
    "Account storage is unavailable. Try again before deleting.",
    "账户存储不可用。请重试后再删除。"
  ],
  [
    "Checking account…",
    "正在检查账户…"
  ],
  [
    "The change could not be completed. Refresh the domain details, then retry the same change.",
    "无法完成更改。请刷新域名详情，然后重试相同的更改。"
  ],
  [
    "Answer saved.",
    "回答已保存。"
  ],
  [
    "Your answers to Freebuff's quick questions. They choose which sponsors you see in Freebuff, stay with Freebuff and are never sent to ad networks.",
    "你对 Freebuff 快速问题的回答将用于决定你在 Freebuff 中看到哪些赞助内容。这些回答会保留在 Freebuff，不会发送给广告网络。"
  ],
  [
    "These choose which sponsors you see in Freebuff. They stay with Freebuff and are never sent to ad networks. Change or clear any of them; your reward hours are kept.",
    "这些回答用于决定你在 Freebuff 看到哪些赞助内容。回答仅保留在 Freebuff，不会发送给广告网络。你可以更改或清除回答，已获得的奖励时长会保留。"
  ],
  [
    "Clear all answers",
    "清除所有回答"
  ],
  [
    "This sign-in link is incomplete",
    "此登录链接不完整"
  ],
  [
    "Already connected",
    "已连接"
  ],
  [
    "Open Freebuff",
    "打开 Freebuff"
  ],
  [
    "Return to your app or terminal. If it is still waiting, start sign-in again.",
    "返回你的应用或终端。如果它仍在等待，请重新开始登录。"
  ],
  [
    "This sign-in link is invalid",
    "此登录链接无效"
  ],
  [
    "Contact support",
    "联系支持团队"
  ],
  [
    "We can’t send codes to this country, so another number from it won’t work either. Use your own mobile number in another country, or email support@freebuff.com.",
    "我们无法向此国家或地区发送验证码，因此换用该地区的其他号码也无法解决。请使用你在其他国家或地区的本人手机号码，或发送邮件至 support@freebuff.com。"
  ],
  [
    "Turn off any VPN or proxy, or try another connection.",
    "请关闭 VPN 或代理，或尝试其他网络连接。"
  ],
  [
    "Check your country and mobile number.",
    "请检查国家或地区以及手机号码。"
  ],
  [
    "You’ve tried 3 different numbers in the last 2 days. Use one of those, or try again later.",
    "你在过去 2 天内尝试了 3 个不同的号码。请使用其中一个号码，或稍后重试。"
  ],
  [
    "SMS is unavailable right now. Try again later.",
    "短信服务目前不可用，请稍后重试。"
  ],
  [
    "Due to suspected multi-account abuse, a plan is required to continue.",
    "由于系统怀疑存在滥用多个账户的情况，你需要订阅套餐才能继续。"
  ],
  [
    "This takes a few seconds.",
    "此过程需要几秒钟。"
  ],
  [
    "Return to Freebuff and try again.",
    "返回 Freebuff 后重试。"
  ],
  [
    "Code sent to",
    "验证码已发送至"
  ],
  [
    "Country calling code",
    "国家或地区区号"
  ],
  [
    "Other ways to verify",
    "其他验证方式"
  ],
  [
    "We’ll text you a code. Use your own mobile number: temporary, virtual and shared numbers aren’t accepted.",
    "我们会向你发送短信验证码。请使用本人的手机号码；不接受临时号码、虚拟号码或共享号码。"
  ],
  [
    "Reconnecting terminal…",
    "正在重新连接终端…"
  ],
  [
    "The local terminal could not attach.",
    "无法连接到本地终端。"
  ],
  [
    "Invalid terminal output frame",
    "终端输出帧无效"
  ],
  [
    "Terminal input backed up. Reconnect before sending more input.",
    "终端输入已积压。请重新连接后再发送更多输入。"
  ],
  [
    "Cloud terminal disconnected. Reconnect to continue.",
    "云端终端已断开。请重新连接以继续。"
  ],
  [
    "Terminal stream unavailable. Reconnect to continue.",
    "终端数据流不可用。请重新连接以继续。"
  ],
  [
    "The terminal changed. Reconnect the terminal panel.",
    "终端已更改。请重新连接终端面板。"
  ],
  [
    "Terminal unavailable. Reconnect to try again.",
    "终端不可用。请重新连接后重试。"
  ],
  [
    "Couldn’t load the preview. Try again.",
    "无法加载预览，请重试。"
  ],
  [
    "Couldn’t connect to the browser.",
    "无法连接到浏览器。"
  ],
  [
    "App address in cloud browser",
    "云端浏览器中的应用地址"
  ],
  [
    "Take over browser",
    "接管浏览器"
  ],
  [
    "Cloud preview",
    "云端预览"
  ],
  [
    "Couldn’t display the preview. Try reloading or opening it in a new tab.",
    "无法显示预览。请尝试重新加载，或在新标签页中打开。"
  ],
  [
    "The selected project changed. Try opening the browser again.",
    "所选项目已更改。请尝试重新打开浏览器。"
  ],
  [
    "New browser profile name",
    "新浏览器配置名称"
  ],
  [
    "Local browser page",
    "本地浏览器页面"
  ],
  [
    "Send a message to start this chat’s files",
    "发送消息以开始查看此聊天的文件"
  ],
  [
    "Saved edits could not be restored in this browser.",
    "无法在此浏览器中恢复已保存的编辑内容。"
  ],
  [
    "Showing the first 200 KB.",
    "仅显示前 200 KB。"
  ],
  [
    "Compressed archive",
    "压缩归档文件"
  ],
  [
    "PowerPoint deck",
    "PowerPoint 演示文稿"
  ],
  [
    "Binary file",
    "二进制文件"
  ],
  [
    "No changed lines.",
    "没有更改的行。"
  ],
  [
    "Send a message to start this chat’s terminal",
    "发送消息以启动此聊天的终端"
  ],
  [
    "The terminal could not be stopped. Reconnect the local project to close it.",
    "无法停止终端。请重新连接本地项目以将其关闭。"
  ],
  [
    "Collapse right panel",
    "折叠右侧面板"
  ],
  [
    "Available in Freebuff Desktop",
    "可在 Freebuff Desktop 中使用"
  ],
  [
    "This Discord account claimed its join reward on another Freebuff account.",
    "此 Discord 账户已在另一个 Freebuff 账户中领取加入奖励。"
  ],
  [
    "You joined before the new-member reward began.",
    "你加入时，新成员奖励活动尚未开始。"
  ],
  [
    "Join the Freebuff Discord to receive your subscriber role.",
    "加入 Freebuff Discord 以获得订阅用户身份组。"
  ],
  [
    "Discord disconnected.",
    "Discord 已断开连接。"
  ],
  [
    "No skills installed. Discover or create a skill to get started.",
    "尚未安装技能。发现或创建技能以开始使用。"
  ],
  [
    "New skill",
    "新建技能"
  ],
  [
    "American Samoa",
    "美属萨摩亚"
  ],
  [
    "Central African Republic",
    "中非共和国"
  ],
  [
    "Cape Verde",
    "佛得角"
  ],
  [
    "Western Sahara",
    "西撒哈拉"
  ],
  [
    "United Kingdom",
    "英国"
  ],
  [
    "Hong Kong SAR China",
    "中国香港"
  ],
  [
    "North Korea",
    "朝鲜"
  ],
  [
    "Sri Lanka",
    "斯里兰卡"
  ],
  [
    "Macao SAR China",
    "中国澳门"
  ],
  [
    "Norfolk Island",
    "诺福克岛"
  ],
  [
    "Papua New Guinea",
    "巴布亚新几内亚"
  ],
  [
    "Saudi Arabia",
    "沙特阿拉伯"
  ],
  [
    "Sierra Leone",
    "塞拉利昂"
  ],
  [
    "Sint Maarten",
    "荷属圣马丁"
  ],
  [
    "United States",
    "美国"
  ],
  [
    "U.S. Virgin Islands",
    "美属维尔京群岛"
  ],
  [
    "today",
    "今天"
  ],
  [
    "Open Discord",
    "打开 Discord"
  ],
  [
    "This line has changed since the comment was written — it will be sent with the original quote.",
    "此行自撰写评论后已更改，发送时将使用原始引用。"
  ],
  [
    "I will only use Freebuff through its official clients: the Freebuff CLI, Freebuff Desktop and freebuff.com. No third-party harnesses, routers, gateways or wrappers, including OmniRoute, Pi, OpenCode, Cline, Roo Code, Kilo Code, Continue, Aider, LiteLLM, OpenRouter-style proxies, freebuff2api, or Cursor or Claude Code pointed at Freebuff, and no other AI client or agent controlling Freebuff.",
    "我只会通过 Freebuff 官方客户端使用 Freebuff：Freebuff CLI、Freebuff Desktop 和 freebuff.com。我不会使用任何第三方运行环境、路由器、网关或包装工具，包括 OmniRoute、Pi、OpenCode、Cline、Roo Code、Kilo Code、Continue、Aider、LiteLLM、OpenRouter 类代理、freebuff2api，也不会让 Cursor 或 Claude Code 接入 Freebuff，或使用其他 AI 客户端或智能体控制 Freebuff。"
  ],
  [
    "One account per person",
    "每人仅限一个账户"
  ],
  [
    "I will not resell, share, proxy or relay Freebuff access, and I will not use it for anything other than my own software work, or for any illegal purpose.",
    "我不会转售、共享、代理或中继 Freebuff 访问权限；我只会将其用于自己的软件开发工作，不会用于任何非法目的。"
  ],
  [
    "Signature recorded",
    "签名已记录"
  ],
  [
    "Checking linked accounts and devices",
    "正在检查关联账户和设备"
  ],
  [
    "Couldn’t submit the appeal. Try again.",
    "无法提交申诉，请重试。"
  ],
  [
    "Suspended",
    "已封禁"
  ],
  [
    "Start appeal",
    "开始申诉"
  ],
  [
    "Self-service appeal unavailable",
    "自助申诉不可用"
  ],
  [
    "Your account is reinstated",
    "你的账户已恢复"
  ],
  [
    "Usage agreement",
    "使用协议"
  ],
  [
    "Confirm each rule. These are the rules accounts are suspended for.",
    "请逐条确认规则。违反这些规则会导致账户被封禁。"
  ],
  [
    "Billing interval",
    "计费周期"
  ],
  [
    "A plan does not exempt this account from detection. If a violation is detected again, the account is banned permanently and the plan is cancelled without a refund.",
    "订阅套餐不会让此账户免于违规检测。如果再次检测到违规，账户将被永久封禁，套餐也会取消且不予退款。"
  ],
  [
    "The appeal flow as a suspended account sees it. Nothing is signed, sent or charged.",
    "这是封禁账户用户看到的申诉流程。不会签署、发送或扣款。"
  ],
  [
    "In good standing",
    "状态正常"
  ],
  [
    "Current plan",
    "当前套餐"
  ],
  [
    "Plan cancelled. Paid perks have ended.",
    "套餐已取消，付费权益已结束。"
  ],
  [
    "I accept that my plan will not renew and the paid year is not refunded",
    "我确认套餐不会续订，已付费的年度费用不予退款"
  ],
  [
    "Choose a reason",
    "请选择原因"
  ],
  [
    "Keep plan",
    "保留套餐"
  ],
  [
    "Card saved. Auto top-up is on.",
    "支付卡已保存，自动充值已开启。"
  ],
  [
    "Top-up amount",
    "充值金额"
  ],
  [
    "Auto top-up needs a saved card.",
    "自动充值需要先保存支付卡。"
  ],
  [
    "Billed in USD, separate from your hours and plan.",
    "以美元单独计费，不计入你的时长或套餐。"
  ],
  [
    "To confirm that each person holds only one free Freebuff account, we use Didit (Didit Identity S.L.), an identity verification provider, to check a photo of your government ID and a short video selfie, and to check the network you connect from.",
    "为确认每人仅持有一个 Freebuff 免费账户，我们会使用身份验证服务商 Didit（Didit Identity S.L.）核验你的政府签发证件照片和一段简短自拍视频，并检查你连接所用的网络。"
  ],
  [
    "Use only your own, genuine identity. A verification that uses a false, forged or altered document, someone else's identity, or a photo or video that is not a live capture of you, or that uses an identity already used on another Freebuff account, leads to the permanent suspension of every associated account.",
    "只能使用你本人真实身份。若验证使用虚假、伪造或篡改的证件、他人身份、非本人实时拍摄的照片或视频，或已用于其他 Freebuff 账户的身份，所有关联账户都将被永久封禁。"
  ],
  [
    "You agree that you will not create, use or control any other Freebuff account, including by verifying, or trying to verify, the same identity on another account, now or in the future.",
    "你同意现在及今后都不会创建、使用或控制其他 Freebuff 账户，包括在其他账户上验证或尝试验证相同身份。"
  ],
  [
    "A suspension for abuse applies to the person, not just one account: if an account verified with your identity is suspended for how it was used, every other account verified with the same identity is suspended too, including accounts verified later. Being verified does not exempt an account from any of our rules.",
    "因滥用而封禁针对的是个人，而不只是单个账户：如果一个使用你身份验证的账户因使用方式被封禁，所有使用相同身份验证的其他账户也会被封禁，包括之后验证的账户。完成身份验证并不意味着账户可以不遵守任何规则。"
  ],
  [
    "Could not load verification.",
    "无法加载身份验证。"
  ],
  [
    "Freebuff gives each person one free account. Some activity on this account means we need to confirm that, so please verify your identity with a photo of your ID and a short selfie.",
    "Freebuff 为每人提供一个免费账户。此账户上的某些活动需要我们确认这一点，请使用证件照片和简短自拍完成身份验证。"
  ],
  [
    "Identity verification",
    "身份验证"
  ],
  [
    "Could not start verification.",
    "无法开始验证。"
  ],
  [
    "Verification is busy right now, so you can continue for now. We may ask again later.",
    "验证服务当前繁忙，你暂时可以继续使用。之后我们可能会再次要求验证。"
  ],
  [
    "It takes a few minutes: a photo of your ID and a short selfie, run by our verification partner, Didit. Use your own, genuine ID: a false or borrowed identity, or one already used on another account, leads to a permanent suspension of every account involved.",
    "验证由我们的合作伙伴 Didit 处理，需要几分钟：拍摄证件照片并录制一段简短自拍。请使用本人真实证件：虚假或借用的身份，或已用于其他账户的身份，都会导致涉及的所有账户被永久封禁。"
  ],
  [
    "This account has been suspended because the identity verified on it is already used on another Freebuff account.",
    "此账户已被封禁，因为用于验证此账户的身份已用于另一个 Freebuff 账户。"
  ],
  [
    "I consent to Freebuff and Didit processing my ID document and biometric data (facial geometry) as described above.",
    "我同意 Freebuff 和 Didit 按上述说明处理我的身份证件和生物识别数据（面部几何信息）。"
  ],
  [
    "Your verification is being reviewed. This page will update when it is done.",
    "你的验证正在审核中。审核完成后，此页面会更新。"
  ],
  [
    "Your last verification was not finished in time. You can start a new one.",
    "上次验证未能及时完成。你可以重新开始验证。"
  ],
  [
    "Identity-lock terms",
    "身份锁定条款"
  ],
  [
    "Could not confirm your country.",
    "无法确认你的国家/地区。"
  ],
  [
    "After your phone number.",
    "填写手机号之后。"
  ],
  [
    "Chose the wrong country? You can request a review of your region.",
    "选错了国家/地区？你可以申请复核所在地区。"
  ],
  [
    "This account’s region is set to limited access, and a review can’t change it. If you think this is a mistake, email support from the address you sign in with.",
    "此账户所在地区目前受到访问限制，复核也无法更改此限制。如果你认为有误，请使用登录账户的邮箱联系支持团队。"
  ],
  [
    "A review can’t change your region. If you think this is a mistake, email support from the address you sign in with.",
    "复核无法更改你的所在地区。如果你认为有误，请使用登录账户的邮箱联系支持团队。"
  ],
  [
    "Valid until",
    "有效期至"
  ],
  [
    "Which country are you in?",
    "你所在的国家/地区是？"
  ],
  [
    "I'm not using a VPN, proxy or iCloud Private Relay. I understand that choosing a country that doesn't match my connection may lead to a permanent ban of my device and network.",
    "我没有使用 VPN、代理或 iCloud Private Relay。我明白，选择与当前网络连接不符的国家/地区，可能导致我的设备和网络被永久封禁。"
  ],
  [
    "Confirm country",
    "确认国家/地区"
  ],
  [
    "Daily hours on a plan",
    "套餐每日可用时长"
  ],
  [
    "Request a review",
    "申请复核"
  ],
  [
    "New email",
    "新邮箱"
  ],
  [
    "Send codes",
    "发送验证码"
  ],
  [
    "Sign in with that provider using this account’s email before linking it.",
    "请先使用此账户的邮箱登录该服务，再进行关联。"
  ],
  [
    "Account deletion isn’t available in this environment.",
    "此环境暂不支持删除账户。"
  ],
  [
    "Couldn’t confirm deletion. Try again.",
    "无法确认删除操作，请重试。"
  ],
  [
    "Delete your account and its data",
    "删除账户及其数据"
  ],
  [
    "Cloudflare could not apply the change. Try again, or contact support if it keeps failing.",
    "Cloudflare 无法应用此更改。请重试；如果问题持续，请联系支持团队。"
  ],
  [
    "Answers cleared. Sponsors are no longer matched to them.",
    "回答已清除。赞助商将不再与这些回答匹配。"
  ],
  [
    "Hide answers",
    "隐藏回答"
  ],
  [
    "Profile answers aren’t available in this environment.",
    "此环境暂不支持个人资料回答。"
  ],
  [
    "Clearing your answers stops sponsors being matched to them.",
    "清除回答后，赞助商将不再与这些回答匹配。"
  ],
  [
    "Use a mobile number instead of a landline.",
    "请使用手机号码，而不要使用固定电话号码。"
  ],
  [
    "We can’t send a code over this network right now. Try another connection, such as mobile data instead of Wi-Fi.",
    "目前无法通过此网络发送验证码。请尝试其他连接方式，例如使用移动数据而不是 Wi-Fi。"
  ],
  [
    "SMS is unavailable in this country.",
    "此国家/地区暂不支持短信验证。"
  ],
  [
    "Incorrect code. Try again.",
    "验证码错误，请重试。"
  ],
  [
    "Your account is suspended",
    "你的账户已暂停使用"
  ],
  [
    "your account’s Standing page",
    "账户状态页面"
  ],
  [
    "A plan replaces phone verification on this account. Once it’s active you’ll come straight back here to continue.",
    "此账户可通过套餐替代手机验证。套餐生效后，你会直接返回此处继续操作。"
  ],
  [
    "Analyzing account activity…",
    "正在分析账户活动…"
  ],
  [
    "Sign in with the account that has this number, or use a different number here.",
    "请使用绑定此号码的账户登录，或在此处改用其他号码。"
  ],
  [
    "Enter code",
    "输入验证码"
  ],
  [
    "Mobile number",
    "手机号码"
  ],
  [
    "Verify with a paid plan",
    "使用付费套餐完成验证"
  ],
  [
    "Ascension Island",
    "阿森松岛"
  ],
  [
    "Burkina Faso",
    "布基纳法索"
  ],
  [
    "Cook Islands",
    "库克群岛"
  ],
  [
    "Christmas Island",
    "圣诞岛"
  ],
  [
    "Falkland Islands",
    "福克兰群岛"
  ],
  [
    "French Guiana",
    "法属圭亚那"
  ],
  [
    "Isle of Man",
    "马恩岛"
  ],
  [
    "South Korea",
    "韩国"
  ],
  [
    "Marshall Islands",
    "马绍尔群岛"
  ],
  [
    "Northern Mariana Islands",
    "北马里亚纳群岛"
  ],
  [
    "New Zealand",
    "新西兰"
  ],
  [
    "Puerto Rico",
    "波多黎各"
  ],
  [
    "Solomon Islands",
    "所罗门群岛"
  ],
  [
    "San Marino",
    "圣马力诺"
  ],
  [
    "Tristan da Cunha",
    "特里斯坦-达库尼亚群岛"
  ],
  [
    "Vatican City",
    "梵蒂冈"
  ],
  [
    "South Africa",
    "南非"
  ],
  [
    "Join Discord",
    "加入 Discord"
  ],
  [
    "Today’s join rewards are claimed. Check again tomorrow.",
    "今天的加入奖励已领取，请明天再来查看。"
  ],
  [
    "Your Discord account was less than 7 days old when you joined. This reward is not available.",
    "你加入时，Discord 账户注册未满 7 天，因此无法领取此奖励。"
  ],
  [
    "Discord isn’t available in this environment.",
    "此环境暂不支持 Discord。"
  ],
  [
    "A paid plan unlocks the subscriber role and private channels.",
    "付费套餐可解锁订阅者身份组和私人频道。"
  ],
  [
    "Review complete",
    "审核完成"
  ],
  [
    "Loading projects…",
    "正在加载项目…"
  ],
  [
    "Loading API…",
    "正在加载 API…"
  ],
  [
    "About auto top-up",
    "关于自动充值"
  ],
  [
    "Manage API",
    "管理 API"
  ],
  [
    "Daily hours on a free account",
    "免费账户每日时长"
  ],
  [
    "Delete account",
    "删除账户"
  ],
  [
    "Remove domain",
    "移除域名"
  ],
  [
    "Loading your answers…",
    "正在加载你的回答…"
  ],
  [
    "Sign in with that account",
    "使用该账户登录"
  ],
  [
    "Loading offers…",
    "正在加载优惠…"
  ],
  [
    "Connecting terminal…",
    "正在连接终端…"
  ],
  [
    "Preview taking a while? Try reloading or opening it in a new tab.",
    "预览加载时间较长？请尝试重新加载或在新标签页中打开。"
  ],
  [
    "Loading preview…",
    "正在加载预览…"
  ],
  [
    "Loading extensions…",
    "正在加载扩展…"
  ],
  [
    "Loading files…",
    "正在加载文件…"
  ],
  [
    "Loading GitHub connection…",
    "正在加载 GitHub 连接…"
  ],
  [
    "Loading models…",
    "正在加载模型…"
  ],
  [
    "Loading Discord…",
    "正在加载 Discord…"
  ],
  [
    "Loading Cloud projects…",
    "正在加载云端项目…"
  ],
  [
    "Restore my account",
    "恢复我的账户"
  ],
  [
    "Review outcome",
    "查看审核结果"
  ],
  [
    "Enable automatic top-up",
    "启用自动充值"
  ],
  [
    "Enable with new card",
    "使用新卡启用"
  ],
  [
    "Loading country…",
    "正在加载国家/地区…"
  ],
  [
    "Free account",
    "免费账户"
  ],
  [
    "Loading usage…",
    "正在加载用量…"
  ],
  [
    "Connect a custom domain",
    "连接自定义域名"
  ],
  [
    "Preview access ended. Sign in again or reopen this chat.",
    "预览访问已失效。请重新登录或重新打开此聊天。"
  ],
  [
    "Preview address",
    "预览地址"
  ],
  [
    "Preview not displaying? Open in new tab",
    "预览没有显示？在新标签页中打开"
  ],
  [
    "Close page",
    "关闭页面"
  ],
  [
    "Loading changes…",
    "正在加载更改…"
  ],
  [
    "Manage GitHub access",
    "管理 GitHub 访问权限"
  ],
  [
    "Connect Claude Code",
    "连接 Claude Code"
  ],
  [
    "A skill can include at most 100 supporting files.",
    "一个技能最多可包含 100 个配套文件。"
  ],
  [
    "Loading skills…",
    "正在加载技能…"
  ],
  [
    "Reviewing your account",
    "正在审核你的账户"
  ],
  [
    "Preview the appeal flow",
    "预览申诉流程"
  ],
  [
    "Loading payment settings…",
    "正在加载付款设置…"
  ],
  [
    "About country verification",
    "关于国家或地区验证"
  ],
  [
    "Loading sign-in methods…",
    "正在加载登录方式…"
  ],
  [
    "Connect domain",
    "连接域名"
  ],
  [
    "Close secret editor",
    "关闭密钥编辑器"
  ],
  [
    "Sign in with another account",
    "使用其他账户登录"
  ],
  [
    "Loading terms…",
    "正在加载条款…"
  ],
  [
    "Connect Discord",
    "连接 Discord"
  ],
  [
    "Close terminal",
    "关闭终端"
  ],
  [
    "Connecting to browser…",
    "正在连接浏览器…"
  ],
  [
    "Connecting to preview…",
    "正在连接预览…"
  ],
  [
    "Close browser data",
    "关闭浏览器数据"
  ],
  [
    "Loading image…",
    "正在加载图片…"
  ],
  [
    "Sign in to start a project",
    "登录以开始项目"
  ],
  [
    "Connect GitHub",
    "连接 GitHub"
  ],
  [
    "Discord account",
    "Discord 账户"
  ],
  [
    "Loading secrets…",
    "正在加载密钥…"
  ],
  [
    "Remove skill",
    "移除技能"
  ],
  [
    "Connect Codex",
    "连接 Codex"
  ],
  [
    "Connect and join the Freebuff Discord to earn 6 hours as a new member.",
    "关联账户并加入 Freebuff Discord，新成员可获得 6 小时。"
  ],
  [
    "This account's region is set to limited access, so verifying a country can't change it. Your daily allowance is 5 hours. If you think this is wrong, you can request a review below.",
    "此账户所在地区目前受到访问限制，因此验证国家/地区不会改变此限制。你的每日额度为 5 小时。如果你认为有误，可以在下方申请复核。"
  ],
  [
    "Your account has limited access. If you think this is wrong, you can request a review of your region.",
    "你的账户受到访问限制。如果你认为有误，可以申请复核所在地区。"
  ],
  [
    "Get up to 70 hours a day with Pro",
    "升级 Pro，每天最高可获得 70 小时"
  ],
  [
    "/ month",
    "/ 月"
  ],
  [
    "21 hours a day",
    "每日 21 小时"
  ],
  [
    "60 hours wallet bonus each month, not rolled over",
    "每月奖励 60 小时钱包额度，未用部分不结转"
  ],
  [
    "Upgrade to Starter",
    "升级至 Starter"
  ],
  [
    "US$25 for 500 hours",
    "US$25 可购买 500 小时额度"
  ],
  [
    "Buy US$25",
    "购买 US$25"
  ],
  [
    "Add card and enable.",
    "添加支付卡并启用。"
  ],
  [
    "Paid through 2026-12-31",
    "已付费至 2026-12-31"
  ],
  [
    "Code sent to +1 555-0100",
    "验证码已发送至 +1 555-0100"
  ],
  [
    "The monthly limit can be at most $500",
    "每月上限不得超过 $500"
  ],
  [
    "Your account has limited access. If you think this is wrong, you can request a review of your region.",
    "你的账户受到访问限制。如果你认为有误，可以申请复核所在地区。"
  ],
  [
    "Your region is confirmed; full access is back. It can take up to an hour to apply everywhere.",
    "所在地区已确认，完整访问权限已恢复。所有位置最多可能需要一小时才会生效。"
  ],
  [
    "Wrong region? You can request a review.",
    "地区不正确？你可以申请复核。"
  ],
  [
    "Your account is suspended. To appeal, visit https://freebuff.com",
    "你的账户已被停用。如需申诉，请访问 https://freebuff.com"
  ],
  [
    "Plan change scheduled for Nov 1.",
    "套餐更改已安排在 Nov 1 生效。"
  ],
  [
    "Cancellation scheduled. Your plan remains active through Nov 1.",
    "已安排取消。你的套餐将持续有效至 Nov 1。"
  ],
  [
    "Verify a mobile number from Canada.",
    "请验证来自 Canada 的手机号码。"
  ],
  [
    "A photo of an ID issued in Canada (passport, national ID card, driving licence or residence permit) and a short selfie.",
    "需要提供 Canada 签发的身份证件照片（护照、国民身份证、驾照或居留许可）以及一段简短自拍。"
  ],
  [
    "We’ll check that this connection is in Canada. Use your own device on home internet or mobile data. A verified country lasts 30 days on every app.",
    "我们会检查此网络连接是否位于 Canada。请使用自己的设备连接家庭网络或移动数据。验证后的国家或地区在所有应用中有效期为 30 天。"
  ],
  [
    "Verify again after Nov 1",
    "请在 Nov 1 后重新验证"
  ],
  [
    "This removes the secret from project app. Code that depends on it may stop working.",
    "这会从 project app 中移除此密钥。依赖它的代码可能会停止工作。"
  ],
  [
    "Repeatable · up to 3×",
    "可重复领取 · 最多 3 次"
  ],
  [
    "You’re signed in as user@example.com.",
    "当前登录账户：user@example.com。"
  ],
  [
    "You can keep your plan with 25% off your next month.",
    "保留套餐即可享受下月 25% 的折扣。"
  ],
  [
    "Request again after Nov 1",
    "可在 Nov 1 后再次申请"
  ],
  [
    "Cancellation scheduled.",
    "已安排取消。"
  ],
  [
    "No requests in the last 7 days.",
    "过去 7 天内没有请求。"
  ],
  [
    "Upgrade to Pro",
    "升级至 Pro"
  ],
  [
    "Redirects to https://example.com",
    "重定向至 https://example.com"
  ],
  [
    "Your rank: 12",
    "你的排名：12"
  ],
  [
    "1 hours a day",
    "每日 1 小时"
  ],
  [
    "1 hours wallet bonus each month, not rolled over",
    "每月奖励 1 小时钱包额度，未用部分不结转"
  ],
  [
    "Connect and join the Freebuff Discord to earn 1 hours as a new member.",
    "关联账户并加入 Freebuff Discord，新成员可获得 1 小时额度。"
  ],
  [
    "21 hours a day",
    "每日 21 小时"
  ],
  [
    "21 hours wallet bonus each month, not rolled over",
    "每月奖励 21 小时钱包额度，未用部分不结转"
  ],
  [
    "Connect and join the Freebuff Discord to earn 21 hours as a new member.",
    "关联账户并加入 Freebuff Discord，新成员可获得 21 小时额度。"
  ],
  [
    "40 hours a day",
    "每日 40 小时"
  ],
  [
    "40 hours wallet bonus each month, not rolled over",
    "每月奖励 40 小时钱包额度，未用部分不结转"
  ],
  [
    "Connect and join the Freebuff Discord to earn 40 hours as a new member.",
    "关联账户并加入 Freebuff Discord，新成员可获得 40 小时额度。"
  ],
  [
    "70 hours a day",
    "每日 70 小时"
  ],
  [
    "70 hours wallet bonus each month, not rolled over",
    "每月奖励 70 小时钱包额度，未用部分不结转"
  ],
  [
    "Connect and join the Freebuff Discord to earn 70 hours as a new member.",
    "关联账户并加入 Freebuff Discord，新成员可获得 70 小时额度。"
  ],
  [
    "1,000 hours a day",
    "每日 1,000 小时"
  ],
  [
    "1,000 hours wallet bonus each month, not rolled over",
    "每月奖励 1,000 小时钱包额度，未用部分不结转"
  ],
  [
    "Connect and join the Freebuff Discord to earn 1,000 hours as a new member.",
    "关联账户并加入 Freebuff Discord，新成员可获得 1,000 小时额度。"
  ],
  [
    "Buy US$8",
    "购买 US$8"
  ],
  [
    "US$8 for 500 hours",
    "US$8 可购买 500 小时额度"
  ],
  [
    "US$8 / month",
    "US$8 /月"
  ],
  [
    "Buy US$25",
    "购买 US$25"
  ],
  [
    "US$25 for 500 hours",
    "US$25 可购买 500 小时额度"
  ],
  [
    "US$25 / month",
    "US$25 /月"
  ],
  [
    "Buy US$60",
    "购买 US$60"
  ],
  [
    "US$60 for 500 hours",
    "US$60 可购买 500 小时额度"
  ],
  [
    "US$60 / month",
    "US$60 /月"
  ],
  [
    "Buy $1,000.50",
    "购买 $1,000.50"
  ],
  [
    "$1,000.50 for 500 hours",
    "$1,000.50 可购买 500 小时额度"
  ],
  [
    "$1,000.50 / month",
    "$1,000.50 /月"
  ],
  [
    "Upgrade to Starter",
    "升级至 Starter"
  ],
  [
    "Upgrade to Plus",
    "升级至 Plus"
  ],
  [
    "Upgrade to Pro",
    "升级至 Pro"
  ],
  [
    "This account's region is set to limited access, so verifying a country can't change it. Your daily allowance is 21 hours. If you think this is wrong, you can request a review below.",
    "此账户所在地区的访问权限受限，验证国家或地区无法改变此限制。你的每日额度为 21 小时。如认为有误，可以在下方申请复核。"
  ],
  [
    "We couldn’t confirm your region yet. Keep using Freebuff from your usual home or mobile connection and try again later. You can try again after 2026年11月18日.",
    "暂时无法确认你所在的地区。请继续通过常用的家庭网络或移动网络使用 Freebuff，稍后再试。你可以在 2026年11月18日 后重试。"
  ]
];for(const [en,zh]of cases){assert.equal(c.__FREEBUFF_ZH_PATCH__.translate(en),zh,en);assert.equal(c.__FREEBUFF_ZH_PATCH__.translate(zh),zh,'idempotence: '+en)}console.log('PASS: '+cases.length*2+' settings translation assertions');