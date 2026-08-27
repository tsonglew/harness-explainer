import AgentLoopPlayground from '../components/AgentLoopPlayground'
import SubsystemMap from '../components/SubsystemMap'
import { Callout, ChapterHero, Chip, Figure, Prose, SectionHeading } from '../components/ui'

const ACCENT = 'var(--color-basics)'

function ModelVsHarness() {
  return (
    <Figure caption="模型只会「说话」；让它真正做事的，是包在外面的一整层运行时。">
      <div className="flex flex-col items-center gap-6 p-8 md:flex-row md:justify-center">
        {/* model box */}
        <div className="flex w-full max-w-[240px] flex-col items-center rounded-2xl border-2 border-dashed border-line bg-paper p-6 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-3xl">
            🧠
          </div>
          <h3 className="mt-3 font-bold text-ink">大语言模型</h3>
          <p className="mt-1 text-xs leading-6 text-ink-soft">
            输入 token → 输出 token。
            <br />
            它不能读文件、不能联网、不能跑命令。
          </p>
          <span className="mt-3 rounded-full bg-black/5 px-3 py-1 font-mono text-[11px] text-ink-soft">
            text in → text out
          </span>
        </div>

        {/* arrow */}
        <div className="rotate-90 text-3xl text-ink-soft md:rotate-0">⟶</div>

        {/* harness box */}
        <div className="relative w-full max-w-[340px] rounded-2xl border-2 border-basics bg-white p-6">
          <span className="absolute -top-3 left-5 rounded-full bg-basics px-3 py-0.5 text-xs font-bold text-white">
            Harness
          </span>
          <ul className="mt-2 space-y-2.5 text-sm text-ink">
            {[
              ['🔁', '反复驱动模型，直到任务完成'],
              ['🧩', '把工具定义塞进 prompt'],
              ['🛠️', '真正执行工具调用'],
              ['🗂️', '管理会话与上下文'],
              ['🔒', '沙箱隔离与审批把关'],
              ['🖥️', '提供命令行 / 网页 / 协议入口'],
            ].map(([icon, txt]) => (
              <li key={txt} className="flex items-center gap-2.5">
                <span>{icon}</span>
                <span>{txt}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Figure>
  )
}

const GLOSSARY = [
  ['harness', '运行时外壳。包在模型外、驱动它完成多步任务的整套工程。'],
  ['agent loop', '核心循环：组装 prompt → 调模型 → 执行工具 → 写回结果，直到模型不再要工具。'],
  ['turn / step', '一次「回合」。不同实现里粒度不同：有的把一次模型调用算一步，有的把「请求+工具」算一步。'],
  ['tool call', '模型输出的一段结构化指令，请求执行某个工具。'],
  ['context window', '模型一次能「看见」的 token 上限。harness 要在其中塞下历史、系统提示与工具定义。'],
  ['compaction', '上下文快满时，把旧历史压缩成摘要，腾出空间。'],
  ['journal / event log', '会话被记录成的事件序列。重建历史、审计、分支都基于它。'],
  ['sandbox', '隔离环境，让工具执行不直接伤害宿主系统。'],
  ['approval', '工具执行前的人类关卡：自动、询问、还是拒绝。'],
  ['subagent', '由主循环派生出的子智能体，用于隔离上下文或并行干活。'],
] as const

export default function Basics() {
  return (
    <div>
      <ChapterHero
        tag="通用解剖"
        title="所有 coding agent，共享同一副骨架"
        sub="不管是 DeepSeek、Pi 还是 Codex，拆开外壳，里面都是同一个模式：一条循环，五个子系统。先把这个通用解剖学搞懂，再看三个具体实现，会快得多。"
        accent={ACCENT}
      />

      <SectionHeading
        id="what"
        kicker="01 · 概念"
        title="模型 ≠ 智能体"
        accent={ACCENT}
        lead="很多人把「大模型」和「智能体」混为一谈。其实模型只是智能体里最出名、但最不「能干」的那部分。"
      />
      <Prose>
        <p>
          一个裸模型能做的只有一件事：<Chip color={ACCENT}>给定一段文本，续写下一段文本</Chip>。
          它没有手，没有记忆，不能访问你的文件系统。那为什么 ChatGPT、Claude Code、Codex
          看起来「无所不能」？因为有人给模型套上了一层精心设计的运行时——
          <strong>harness</strong>。
        </p>
        <p>
          Harness 负责把一个「只会续写」的模型，变成一个「能干活」的智能体：它反复调用模型、解析模型想用的工具、
          真正去执行、把结果喂回去、管理越来越长的上下文、并在危险操作前拦一道。
        </p>
        <ModelVsHarness />
        <Callout accent={ACCENT}>
          <strong>一句话：</strong>模型决定智能体「有多聪明」，harness 决定智能体「能干什么、怎么干、安不安全」。
          同一个模型，换个 harness，判若两人。
        </Callout>
      </Prose>

      <SectionHeading
        id="anatomy"
        kicker="02 · 解剖"
        title="五大子系统"
        accent={ACCENT}
        lead="任何 harness 都可以拆成五个子系统。点击下面图中的任意一个，看看它的职责。"
      />
      <div className="mx-auto max-w-3xl px-4">
        <Figure caption="中央的 Agent Loop 是引擎，四个子系统围绕它协作。点击节点查看说明。">
          <div className="p-4">
            <SubsystemMap />
          </div>
        </Figure>
      </div>

      <SectionHeading
        id="loop"
        kicker="03 · 游乐场"
        title="亲手跑一遍 Agent Loop"
        accent={ACCENT}
        lead="这是全站最重要的一张图。下面是一个真实循环的逐步回放——你可以改任务、换审批策略、调上下文窗口，观察循环如何随之变化。点「播放」，或拖动进度条。"
      />
      <div className="mx-auto max-w-5xl px-4 pb-4">
        <AgentLoopPlayground />
      </div>
      <Prose>
        <Callout accent={ACCENT}>
          <strong>试一试：</strong>① 把审批策略从「每次询问」切到「自动放行」，注意那些「审批关卡」步骤消失了，循环变得更顺；
          ② 把「上下文窗口」拉到最小、循环次数拉到最大，你会看到 <Chip color={ACCENT}>compaction</Chip>{' '}
          被触发——这正是长任务不崩溃的关键。
        </Callout>
      </Prose>

      <SectionHeading
        id="glossary"
        kicker="04 · 词汇表"
        title="接下来的章节会反复用到这些词"
        accent={ACCENT}
      />
      <div className="mx-auto grid max-w-5xl gap-3 px-4 sm:grid-cols-2">
        {GLOSSARY.map(([term, def]) => (
          <div key={term} className="rounded-xl border border-line bg-white p-4">
            <code className="font-mono text-sm font-bold text-basics">{term}</code>
            <p className="mt-1.5 text-sm leading-6 text-ink-soft">{def}</p>
          </div>
        ))}
      </div>

      <div className="mx-auto max-w-3xl px-4 pt-14 text-center">
        <p className="text-sm text-ink-soft">骨架清楚了。接下来，看三个性格迥异的实现——</p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <a href="#/deepseek" className="rounded-full bg-dsh px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90">
            DeepSeek Harness →
          </a>
          <a href="#/pi" className="rounded-full bg-pi px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90">
            Pi →
          </a>
          <a href="#/codex" className="rounded-full bg-codex px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90">
            Codex →
          </a>
        </div>
      </div>
    </div>
  )
}
