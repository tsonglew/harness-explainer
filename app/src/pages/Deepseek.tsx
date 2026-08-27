import JournalReplay from '../components/JournalReplay'
import PluginAssembler from '../components/PluginAssembler'
import SubagentSeams from '../components/SubagentSeams'
import TurnStepPlayer from '../components/TurnStepPlayer'
import { Callout, ChapterHero, Chip, CodeBlock, Prose, SectionHeading } from '../components/ui'

const ACCENT = 'var(--color-dsh)'

const DERIVE_PSEUDO = `function deriveMessages(journal) {
  const messages = [systemPrompt()]            // 每次请求重新组装
  for (const event of journal) {               // 日志只增不改，顺序遍历
    switch (event.kind) {
      case 'user_message':    messages.push({ role: 'user',      ...event })
      case 'model_response':
      case 'tool_call':       messages.push({ role: 'assistant', ...event })
      case 'tool_result':     messages.push({ role: 'tool',      ...event })
      case 'approval_decision': break          // 只为审计存在，不进上下文
    }
  }
  return messages
}`

const CAPABILITY_SEAMS = [
  'ctx.sandbox',
  'ctx.fs',
  'ctx.shell',
  'ctx.subprocess',
  'ctx.terminals',
  'ctx.jobs',
  'ctx.commands',
] as const

export default function Deepseek() {
  return (
    <div>
      <ChapterHero
        tag="DeepSeek Harness · dsh"
        title="没有特权核心：一切皆插件"
        sub="dsh 建在 Cordis 元框架上：插件贡献服务、类型化事件、可逆副作用。它没有特权核心——模型、工具、UI 甚至 agent loop 本身都是可替换的插件。约 453K 行代码（2026-08，vendored Cordis fork），设计理念是「把模型当数据库驱动，而非系统中心」。"
        accent={ACCENT}
      />

      <SectionHeading
        id="philosophy"
        kicker="01 · 哲学"
        title="模型只是插件之一"
        accent={ACCENT}
        lead="大多数 harness 把模型放在系统中心，其他模块围着它转。dsh 反过来：Cordis 核心只做插件装配与事件路由，模型通过 llm/llm 适配器接入——像数据库驱动一样，可以整个换掉。"
      />
      <Prose>
        <p>
          Cordis 给 dsh 带来三条铁律：<Chip color={ACCENT}>插件贡献服务</Chip>（任何能力都由插件注册）、
          <Chip color={ACCENT}>类型化事件</Chip>（模块间不靠函数直调，靠事件通信）、
          <Chip color={ACCENT}>可逆副作用</Chip>（对系统的修改被设计成可回滚）。
          于是整个系统没有哪一部分是「特殊」的：工具是插件，沙箱策略是插件，模型适配器也是插件。
        </p>
        <Callout accent={ACCENT}>
          <strong>核心洞察：</strong>没有特权核心。这意味着你可以换掉 dsh 的几乎任何一层——换模型、换 UI、
          换审批策略——而不用动其余部分。后面三个交互件会分别验证这句话。
        </Callout>
      </Prose>

      <SectionHeading
        id="assembly"
        kicker="02 · 装配"
        title="Layers / Bundles / Profiles：启动时装出一台 dsh"
        accent={ACCENT}
        lead="dsh 的功能以 bundle 为单位组织：dsh-base 提供模型适配器、工具、持久化、沙箱与审批策略、设置、凭据、遥测；上面再二选一套个外壳——dsh-web-app（浏览器 UI）或 dsh-headless（无服务单次运行）。"
      />
      <div className="mx-auto max-w-5xl px-4">
        <PluginAssembler />
      </div>
      <Prose>
        <p>
          启动时配置按固定顺序叠加：bundles → profile patches → home patches → CLI
          overlays，越靠后的层优先级越高。所以团队可以用 profile 统一规定审批策略，
          个人再在家目录里覆盖，命令行参数则拥有最终话语权——每一层都只是「补丁」，不是特权。
        </p>
      </Prose>

      <SectionHeading
        id="journal"
        kicker="03 · 会话"
        title="Model-visible means logged"
        accent={ACCENT}
        lead="core/session 不维护一份可变的「对话状态」。它只有一条不可变事件日志；模型看到的 messages[] 是每次请求时用 deriveMessages() 从日志现算出来的视图。"
      />
      <div className="mx-auto max-w-5xl px-4">
        <JournalReplay />
      </div>
      <Prose>
        <CodeBlock
          code={DERIVE_PSEUDO}
          caption="deriveMessages 的伪代码：日志是唯一事实来源，messages 是纯函数投影。"
          hlLines={[9]}
        />
        <Callout accent={ACCENT}>
          <strong>铁律：</strong>「Model-visible means logged」——模型能看见的一切，必须先落在日志里。
          反过来不成立：像 <Chip color={ACCENT}>approval_decision</Chip>{' '}
          这样的事件只为审计存在，永远不会出现在 messages 里。日志只增不改，所以会话可以回放、审计、从任意点分叉。
        </Callout>
      </Prose>

      <SectionHeading
        id="loop"
        kicker="04 · 循环"
        title="turn 与 step，以及工具的受保护路径"
        accent={ACCENT}
        lead="core/agent-loop 里，一个 turn 是 0 到 n 个 step；每个 step = 一次模型请求 + 它触发的工具调用。而每个工具调用都必须走完 core/tools 的受保护管线：pre-execute → execute → post-execute → result。"
      />
      <div className="mx-auto max-w-5xl px-4">
        <TurnStepPlayer />
      </div>
      <Prose>
        <p>
          注意工具本身也不直接碰系统：execute 阶段走的是
          {CAPABILITY_SEAMS.slice(0, 3).map((s) => (
            <span key={s}>
              {' '}
              <Chip color={ACCENT}>{s}</Chip>
            </span>
          ))}{' '}
          这样的<Chip color={ACCENT}>能力接缝</Chip>（共 7 条：
          {CAPABILITY_SEAMS.map((s) => (
            <code key={s} className="mx-0.5 font-mono text-[13px] text-ink-soft">
              {s.replace('ctx.', '')}
            </code>
          ))}
          ）。这些接缝可以被整体重定向——比如把文件系统和 shell 全部指向一台远端沙箱机，工具代码一行不用改。
        </p>
      </Prose>

      <SectionHeading
        id="subagents"
        kicker="05 · 接缝"
        title="子智能体也是插件：五种 provider"
        accent={ACCENT}
        lead="派生子智能体在 dsh 里不是写死的功能，而是一条 provider 接缝：进程内 spawn、进程内 fork、ACP、Codex、Claude Code，五种实现任选。"
      />
      <div className="mx-auto max-w-5xl px-4">
        <SubagentSeams />
      </div>
      <Prose>
        <p>
          最后两种值得停一下：Codex 和 Claude Code 本身就是两个完整的 agent harness。
          因为子智能体只是一条 provider 接口，dsh 可以把它们当子代理调度——
          <Chip color={ACCENT}>harness 调 harness</Chip>。
          这是「一切皆插件」推到极致后的自然结果：别家的整个系统，在你这里只是一个可替换的 provider。
        </p>
      </Prose>

      <div className="mx-auto max-w-3xl px-4 pt-14 text-center">
        <p className="text-sm text-ink-soft">
          插件哲学的另一面：有的 harness 选择把一切做进内核，有的选择几乎什么都不做——
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <a
            href="#/pi"
            className="rounded-full bg-pi px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
          >
            Pi：极简主义的回答 →
          </a>
          <a
            href="#/codex"
            className="rounded-full bg-codex px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
          >
            Codex：平台化的回答 →
          </a>
        </div>
        <p className="mt-4 text-xs text-ink-soft">
          <a href="#/basics" className="underline underline-offset-2 hover:text-dsh">
            ← 回到通用解剖
          </a>
        </p>
      </div>
    </div>
  )
}
