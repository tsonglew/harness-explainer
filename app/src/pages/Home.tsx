import { Link } from 'react-router-dom'
import { LoopRing } from '../components/LoopRing'
import { LOOP_COLORS, LOOP_PHASES } from '../data/loop'

const chapters = [
  {
    to: '/deepseek',
    accent: 'var(--color-dsh)',
    name: 'DeepSeek Harness',
    aka: 'dsh',
    tag: '一切皆插件',
    desc: '基于 Cordis 元框架的极繁内核：工具、沙箱、会话、甚至 agent 循环本身，都是可以拔插替换的插件。',
  },
  {
    to: '/pi',
    accent: 'var(--color-pi)',
    name: 'Pi',
    aka: 'pi.dev',
    tag: '极简工具箱',
    desc: '「用不到就不做」：四个包、四个工具、一条扁平循环，把所有隐藏状态都摊在阳光下。',
  },
  {
    to: '/codex',
    accent: 'var(--color-codex)',
    name: 'Codex Harness',
    aka: 'OpenAI',
    tag: '平台化的单循环',
    desc: '一条被工程化到极致的单智能体循环，通过 JSON-RPC App Server 暴露，能嵌进 CLI、IDE 或任何客户端。',
  },
] as const

export default function Home() {
  return (
    <div>
      {/* hero */}
      <div className="border-b border-line bg-[radial-gradient(1200px_500px_at_50%_-100px,color-mix(in_srgb,var(--color-basics)_9%,transparent),transparent)]">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 px-4 py-16 text-center">
          <span className="rounded-full border border-line bg-white px-4 py-1.5 text-xs font-medium text-ink-soft shadow-sm">
            交互式学习 · 无需任何前置知识 · 纯前端运行
          </span>
          <h1 className="max-w-3xl text-4xl leading-tight font-bold tracking-tight text-ink sm:text-5xl">
            拆开 <span className="text-basics">Agent Harness</span>，
            看看智能体的心脏是怎么跳动的
          </h1>
          <p className="max-w-2xl text-base leading-8 text-ink-soft">
            大模型本身只会「说话」。真正让它能读文件、跑命令、改代码的，是包在它外面的那一层
            <strong className="text-ink">运行时 —— Agent Harness</strong>。
            本站用可交互的图解，带你逐层看懂三个代表性实现的内部机制。
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/basics"
              className="rounded-full bg-basics px-6 py-3 text-sm font-semibold text-white shadow transition hover:opacity-90"
            >
              从「什么是 Harness」开始 →
            </Link>
            <Link
              to="/compare"
              className="rounded-full border border-line bg-white px-6 py-3 text-sm font-semibold text-ink transition hover:bg-black/5"
            >
              直接看三者对比
            </Link>
          </div>

          <div className="w-full overflow-x-auto">
            <div className="mx-auto flex min-w-[560px] max-w-[560px] justify-center">
              <LoopRing
                size={520}
                nodes={LOOP_PHASES.map((p) => ({ label: p.label, sub: p.sub, color: LOOP_COLORS[p.key] }))}
                centerTitle="agent loop"
                centerSub="直到模型不再调用工具"
              />
            </div>
          </div>
        </div>
      </div>

      {/* the idea */}
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-ink">为什么值得搞懂 Harness？</h2>
        <p className="mt-4 text-[15px] leading-8 text-ink-soft">
          2025–2026 年，「harness」成了智能体工程的核心词。同一个大模型，套上不同的
          harness，能力天差地别——因为循环怎么转、上下文怎么管、工具怎么调、权限怎么批，
          全都由 harness 决定。理解了这层，你才算真正理解了一个「智能体产品」。
        </p>
      </div>

      {/* chapters */}
      <div className="mx-auto max-w-6xl px-4 pb-8">
        <div className="grid gap-5 md:grid-cols-3">
          {chapters.map((c) => (
            <Link
              key={c.to}
              to={c.to}
              className="group rounded-2xl border border-line bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full px-3 py-1 text-xs font-semibold text-white" style={{ background: c.accent }}>
                  {c.aka}
                </span>
                <span className="text-xs text-ink-soft">{c.tag}</span>
              </div>
              <h3 className="mt-4 text-xl font-bold text-ink">{c.name}</h3>
              <p className="mt-2 text-sm leading-7 text-ink-soft">{c.desc}</p>
              <span className="mt-4 inline-block text-sm font-semibold" style={{ color: c.accent }}>
                进入章节 <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* meta line */}
      <div className="mx-auto max-w-3xl px-4 pb-4 text-center text-xs text-ink-soft">
        本站是教学演示，结构灵感来自 Polo Club 的{' '}
        <a className="underline" href="https://poloclub.github.io/transformer-explainer/" target="_blank" rel="noreferrer">
          Transformer Explainer
        </a>
        。内容基于公开资料整理，观点归属原作者。
      </div>
    </div>
  )
}
