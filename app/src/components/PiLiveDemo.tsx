import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  LIVE_FINAL,
  LIVE_TASK,
  LIVE_TURNS,
  TOOL_COLORS,
  TOOL_ORDER,
  systemMessage,
  type ToolId,
} from '../data/piLiveTrace'

const ACCENT = 'var(--color-pi)'

/* ------------------------------------------------------------------ */
/* Plan: flatten the script + knobs into a linear list of play steps.  */
/* Each step that lands in the model's context carries a `msg` index   */
/* pointing at its message in the next request — the hover-link target.*/
/* ------------------------------------------------------------------ */

type PlanStep =
  | { id: string; kind: 'user'; text: string; msg: number }
  | { id: string; kind: 'stream'; text: string; msg: number }
  | { id: string; kind: 'toolcall'; tool: ToolId; args: string; note: string; msg: number }
  | { id: string; kind: 'toolresult'; text: string; msg: number }
  | { id: string; kind: 'final'; text: string; msg: number }
  | { id: string; kind: 'cut'; text: string }

interface DemoConfig {
  tools: Record<ToolId, boolean>
  maxLoops: number
}

function buildPlan(cfg: DemoConfig): PlanStep[] {
  const steps: PlanStep[] = []
  let msg = 1 // message index 0 is the system prompt
  steps.push({ id: 'user', kind: 'user', text: LIVE_TASK, msg: msg++ })

  let loops = 0
  for (const turn of LIVE_TURNS) {
    const call = turn.toolCall
    if (call && !cfg.tools[call.tool]) {
      // Degraded branch: the tool is off, the model gives up here.
      steps.push({ id: `${turn.id}-deg`, kind: 'final', text: turn.degradedChunks!.join(''), msg: msg++ })
      return steps
    }
    if (call && loops >= cfg.maxLoops) {
      steps.push({ id: 'cut', kind: 'cut', text: `达到最大循环次数 ${cfg.maxLoops} —— 循环被强制终止。` })
      return steps
    }
    steps.push({ id: `${turn.id}-s`, kind: 'stream', text: turn.chunks.join(''), msg })
    if (call) {
      steps.push({ id: `${turn.id}-c`, kind: 'toolcall', tool: call.tool, args: call.args, note: call.note, msg })
      msg++ // assistant message (text + tool_call) is one message
      steps.push({ id: `${turn.id}-r`, kind: 'toolresult', text: turn.toolResult!, msg: msg++ })
      loops++
    } else {
      msg++
    }
  }
  steps.push({ id: 'final', kind: 'final', text: LIVE_FINAL.chunks.join(''), msg: msg++ })
  return steps
}

/* ------------------------------------------------------------------ */
/* Messages panel: what the next model request actually receives.      */
/* ------------------------------------------------------------------ */

interface MsgView {
  index: number
  role: 'system' | 'user' | 'assistant' | 'tool'
  parts: string[]
  live: boolean
}

const ROLE_STYLE: Record<MsgView['role'], { label: string; color: string }> = {
  system: { label: 'system', color: '#6b7280' },
  user: { label: 'user', color: '#d97706' },
  assistant: { label: 'assistant', color: '#0ea5e9' },
  tool: { label: 'tool', color: '#22c55e' },
}

function stepRole(s: PlanStep): MsgView['role'] | null {
  if (s.kind === 'cut') return null
  if (s.kind === 'user') return 'user'
  if (s.kind === 'toolresult') return 'tool'
  return 'assistant'
}

function stepText(s: PlanStep): string {
  switch (s.kind) {
    case 'toolcall':
      return `→ tool_call: ${s.args}`
    case 'cut':
      return ''
    default:
      return s.text
  }
}

function buildMessages(plan: PlanStep[], stepIdx: number, typed: number, sys: string): MsgView[] {
  const acc = new Map<number, MsgView>()
  const push = (s: PlanStep, text: string, live: boolean) => {
    const role = stepRole(s)
    if (!role || !('msg' in s)) return
    const cur = acc.get(s.msg) ?? { index: s.msg, role, parts: [], live: false }
    if (text) cur.parts.push(text)
    cur.live = cur.live || live
    acc.set(s.msg, cur)
  }
  for (const s of plan.slice(0, stepIdx)) push(s, stepText(s), false)
  const cur = plan[stepIdx]
  if (cur && (cur.kind === 'stream' || cur.kind === 'final')) push(cur, cur.text.slice(0, typed), true)
  return [
    { index: 0, role: 'system', parts: [sys], live: false },
    ...[...acc.values()].sort((a, b) => a.index - b.index),
  ]
}

/* ------------------------------------------------------------------ */
/* Event cards (left column, the "conversation" being played).         */
/* ------------------------------------------------------------------ */

function EventCard({ step, typed, active, hl, onHover }: {
  step: PlanStep
  typed: number
  active: boolean
  hl: boolean
  onHover: (id: string | null) => void
}) {
  const hoverProps = {
    onMouseEnter: () => onHover(step.id),
    onMouseLeave: () => onHover(null),
  }
  const ring = hl ? `0 0 0 2px color-mix(in srgb, ${ACCENT} 65%, transparent)` : undefined

  if (step.kind === 'user') {
    return (
      <motion.div
        {...hoverProps}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="ml-auto w-fit max-w-[90%] rounded-2xl rounded-br-sm px-3.5 py-2 text-sm text-white"
        style={{ background: ACCENT, boxShadow: ring }}
      >
        {step.text}
      </motion.div>
    )
  }

  if (step.kind === 'stream' || step.kind === 'final') {
    const text = active ? step.text.slice(0, typed) : step.text
    return (
      <motion.div
        {...hoverProps}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-fit max-w-[95%] rounded-2xl rounded-bl-sm border border-line bg-paper px-3.5 py-2 text-sm leading-6 text-ink"
        style={{ boxShadow: ring }}
      >
        <span className="mr-1.5 font-mono text-[10px] font-semibold tracking-wider text-sky-500 uppercase">
          {step.kind === 'final' ? 'assistant · final' : 'assistant'}
        </span>
        <span className="whitespace-pre-wrap">{text}</span>
        {active && <span className="animate-pulse-soft ml-0.5 inline-block h-3.5 w-[7px] translate-y-0.5 bg-sky-400" />}
      </motion.div>
    )
  }

  if (step.kind === 'toolcall') {
    const color = TOOL_COLORS[step.tool]
    return (
      <motion.div
        {...hoverProps}
        initial={{ opacity: 0, y: 8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="ml-6 rounded-xl border bg-white"
        style={{ borderColor: `color-mix(in srgb, ${color} 45%, var(--color-line))`, boxShadow: ring }}
      >
        <div
          className="flex items-center gap-2 rounded-t-xl border-b px-3 py-1.5"
          style={{ borderColor: 'var(--color-line)', background: `color-mix(in srgb, ${color} 8%, white)` }}
        >
          <span className="rounded px-1.5 py-0.5 font-mono text-[11px] font-bold text-white" style={{ background: color }}>
            {step.tool}
          </span>
          <span className="text-[11px] text-ink-soft">tool_call · pi-agent-core 校验中</span>
        </div>
        <pre className="scroll-thin overflow-x-auto px-3 py-2 font-mono text-[12px] leading-5 whitespace-pre-wrap text-ink">
          {step.args}
        </pre>
        <p className="px-3 pb-2 text-[11px] text-ink-soft">✓ {step.note}</p>
      </motion.div>
    )
  }

  if (step.kind === 'toolresult') {
    return (
      <motion.div
        {...hoverProps}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="ml-6 rounded-xl border border-line px-3 py-2"
        style={{ background: 'var(--color-code-bg)', boxShadow: ring }}
      >
        <span className="font-mono text-[10px] font-semibold tracking-wider text-emerald-400 uppercase">
          tool_result → 写回会话
        </span>
        <pre className="mt-1 font-mono text-[12px] leading-5 whitespace-pre-wrap" style={{ color: 'var(--color-code-fg)' }}>
          {step.text}
        </pre>
      </motion.div>
    )
  }

  // cut
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-dashed px-3.5 py-2 text-center text-xs text-ink-soft"
      style={{ borderColor: `color-mix(in srgb, ${ACCENT} 50%, transparent)` }}
    >
      ⛔ {step.text}
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/* Main component.                                                     */
/* ------------------------------------------------------------------ */

type Status = 'idle' | 'running' | 'paused' | 'done'
type Speed = 0.5 | 1 | 2

export default function PiLiveDemo() {
  const [task, setTask] = useState(LIVE_TASK)
  const [tools, setTools] = useState<Record<ToolId, boolean>>({ read: true, write: true, edit: true, bash: true })
  const [maxLoops, setMaxLoops] = useState(3)
  const [speed, setSpeed] = useState<Speed>(1)

  const [status, setStatus] = useState<Status>('idle')
  const [stepIdx, setStepIdx] = useState(0)
  const [typed, setTyped] = useState(0)
  const [hoverId, setHoverId] = useState<string | null>(null)
  const [hoverMsg, setHoverMsg] = useState<number | null>(null)

  const plan = useMemo(() => buildPlan({ tools, maxLoops }), [tools, maxLoops])
  const sys = systemMessage(TOOL_ORDER.filter((t) => tools[t]))
  const messages = useMemo(() => buildMessages(plan, stepIdx, typed, sys), [plan, stepIdx, typed, sys])

  /* Playback engine: stream text char-by-char; other steps advance after a beat. */
  useEffect(() => {
    if (status !== 'running') return
    const step = plan[stepIdx]
    if (!step) return
    const isStream = step.kind === 'stream' || step.kind === 'final'
    if (isStream && typed < step.text.length) {
      const t = window.setTimeout(() => setTyped((n) => Math.min(step.text.length, n + 2)), 26 / speed)
      return () => window.clearTimeout(t)
    }
    const base = isStream ? 500 : step.kind === 'toolcall' ? 800 : step.kind === 'toolresult' ? 900 : 600
    const t = window.setTimeout(() => {
      setTyped(0)
      // Always advance so the finished step joins the completed slice (full text,
      // no live cursor); only then flag the run as done. State updates inside the
      // timeout callback, not synchronously in the effect.
      setStepIdx((i) => i + 1)
      if (stepIdx >= plan.length - 1) setStatus('done')
    }, base / speed)
    return () => window.clearTimeout(t)
  }, [status, stepIdx, typed, plan, speed])

  /* Auto-scroll the event feed as it grows. */
  const feedRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const el = feedRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [stepIdx, typed])

  const reset = () => {
    setStatus('idle')
    setStepIdx(0)
    setTyped(0)
    setHoverId(null)
    setHoverMsg(null)
  }

  const start = () => {
    reset()
    setStatus('running')
  }

  /* Any knob change resets the run — the script branches on the knobs. */
  const changeTools = (t: ToolId) => {
    setTools((prev) => ({ ...prev, [t]: !prev[t] }))
    reset()
  }
  const changeMaxLoops = (v: number) => {
    setMaxLoops(v)
    reset()
  }
  const changeSpeed = (v: Speed) => setSpeed(v)
  const changeTask = (v: string) => {
    setTask(v)
    reset()
  }

  /* Hover linking: event id ↔ message index. */
  const hlMsg = hoverId ? (plan.find((s) => s.id === hoverId) as PlanStep & { msg?: number })?.msg ?? null : hoverMsg
  const msgToEvent = new Map(plan.flatMap((s) => ('msg' in s ? [[s.msg, s.id]] as const : [])))

  const started = status !== 'idle'
  const mainBtn =
    status === 'idle' ? { label: '▶ 运行', fn: start }
    : status === 'running' ? { label: '⏸ 暂停', fn: () => setStatus('paused') }
    : status === 'paused' ? { label: '▶ 继续', fn: () => setStatus('running') }
    : { label: '↺ 重播', fn: start }

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
      {/* task bar */}
      <div className="flex flex-col gap-3 border-b border-line bg-paper px-4 py-3 sm:flex-row sm:items-center">
        <input
          value={task}
          onChange={(e) => changeTask(e.target.value)}
          disabled={started}
          placeholder="给 pi 一个任务…"
          className="min-w-0 flex-1 rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-pi disabled:opacity-60"
          aria-label="任务指令"
        />
        <div className="flex gap-2">
          <button
            onClick={mainBtn.fn}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition active:scale-95"
            style={{ background: ACCENT }}
          >
            {mainBtn.label}
          </button>
          {started && (
            <button
              onClick={reset}
              className="rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink-soft transition hover:bg-black/5"
            >
              重置
            </button>
          )}
        </div>
      </div>

      {/* knobs */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-line px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="mr-1 text-xs text-ink-soft">工具</span>
          {TOOL_ORDER.map((t) => {
            const on = tools[t]
            const color = TOOL_COLORS[t]
            return (
              <button
                key={t}
                onClick={() => changeTools(t)}
                className="rounded-full border px-2.5 py-1 font-mono text-[11px] font-semibold transition"
                style={{
                  borderColor: on ? color : 'var(--color-line)',
                  background: on ? color : 'white',
                  color: on ? 'white' : 'var(--color-ink-soft)',
                  textDecoration: on ? undefined : 'line-through',
                }}
                aria-pressed={on}
              >
                {t}
              </button>
            )
          })}
        </div>
        <label className="flex items-center gap-2 text-xs text-ink-soft">
          最大循环
          <input
            type="range"
            min={1}
            max={3}
            step={1}
            value={maxLoops}
            onChange={(e) => changeMaxLoops(Number(e.target.value))}
            style={{ accentColor: ACCENT }}
            aria-label="最大循环次数"
          />
          <span className="font-mono font-semibold text-ink">{maxLoops}</span>
        </label>
        <div className="flex items-center gap-1.5 text-xs text-ink-soft">
          速度
          {([0.5, 1, 2] as Speed[]).map((v) => (
            <button
              key={v}
              onClick={() => changeSpeed(v)}
              className="rounded-full px-2 py-1 font-mono text-[11px] font-semibold transition"
              style={
                v === speed
                  ? { background: ACCENT, color: 'white' }
                  : { color: 'var(--color-ink-soft)', background: 'rgba(0,0,0,0.04)' }
              }
            >
              {v}x
            </button>
          ))}
        </div>
        <span className="ml-auto hidden text-[11px] text-ink-soft sm:block">
          {status === 'idle' ? '点击「运行」，看 pi 把任务跑完' : status === 'done' ? '运行结束 · 悬停左侧事件，看它拼进哪条 message' : status === 'paused' ? '已暂停' : '运行中…'}
        </span>
      </div>

      {/* stage: event feed + messages panel */}
      <div className="grid lg:grid-cols-2">
        <div ref={feedRef} className="scroll-thin flex h-[380px] flex-col gap-2.5 overflow-y-auto px-4 py-4 lg:h-[440px]">
          {!started && (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-ink-soft">
              <span className="text-2xl">🐢</span>
              <p>
                这是一个模拟的 pi agent。点「运行」，
                <br />
                模型回复会逐字流出，工具调用实时弹出。
              </p>
              <p className="text-xs">试试先关掉 bash，再运行。</p>
            </div>
          )}
          {started &&
            plan.slice(0, stepIdx).map((s) => (
              <EventCard key={s.id} step={s} typed={0} active={false} hl={hlMsg !== null && 'msg' in s && s.msg === hlMsg} onHover={setHoverId} />
            ))}
          {started && status !== 'done' && plan[stepIdx] && (
            <EventCard
              key={plan[stepIdx].id}
              step={plan[stepIdx]}
              typed={typed}
              active
              hl={hlMsg !== null && 'msg' in plan[stepIdx] && (plan[stepIdx] as PlanStep & { msg: number }).msg === hlMsg}
              onHover={setHoverId}
            />
          )}
          {status === 'done' && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-1 text-center text-xs text-ink-soft">
              — 运行结束 ·{' '}
              <button className="underline underline-offset-2" style={{ color: ACCENT }} onClick={start}>
                重播
              </button>{' '}
              —
            </motion.p>
          )}
        </div>

        {/* messages panel */}
        <div className="border-t border-line bg-paper lg:border-t-0 lg:border-l">
          <div className="border-b border-line px-4 py-2.5">
            <p className="text-xs font-semibold tracking-wider text-ink-soft uppercase">下一次模型请求实际收到的 messages</p>
            <p className="mt-0.5 text-[11px] text-ink-soft">悬停左侧事件 → 高亮它派生的那条 message（反之亦然）</p>
          </div>
          <div className="scroll-thin h-[300px] space-y-2 overflow-y-auto px-4 py-3 lg:h-[360px]">
            <AnimatePresence initial={false}>
              {(started ? messages : messages.slice(0, 1)).map((m) => {
                const meta = ROLE_STYLE[m.role]
                const hl = hlMsg === m.index
                return (
                  <motion.div
                    key={m.index}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    onMouseEnter={() => setHoverMsg(m.index)}
                    onMouseLeave={() => setHoverMsg(null)}
                    className="rounded-lg border bg-white px-3 py-2 transition-shadow"
                    style={{
                      borderColor: hl ? `color-mix(in srgb, ${ACCENT} 65%, var(--color-line))` : 'var(--color-line)',
                      boxShadow: hl ? `0 0 0 2px color-mix(in srgb, ${ACCENT} 40%, transparent)` : undefined,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="rounded px-1.5 py-0.5 font-mono text-[10px] font-bold text-white"
                        style={{ background: meta.color }}
                      >
                        {meta.label}
                      </span>
                      {m.live && <span className="animate-pulse-soft text-[10px] text-sky-500">● 生成中</span>}
                      {msgToEvent.has(m.index) && (
                        <button
                          className="ml-auto text-[10px] text-ink-soft underline underline-offset-2 hover:text-ink"
                          onClick={() => setHoverId(msgToEvent.get(m.index)!)}
                        >
                          来源事件
                        </button>
                      )}
                    </div>
                    <p className="mt-1 font-mono text-[11.5px] leading-5 whitespace-pre-wrap text-ink-soft">
                      {m.parts.join('\n')}
                    </p>
                  </motion.div>
                )
              })}
            </AnimatePresence>
            {started && messages.length === 1 && (
              <p className="text-center text-[11px] text-ink-soft">（还没有更多历史）</p>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-line bg-paper px-4 py-2.5 text-xs text-ink-soft">
        你看到的事件流，就是模型看到的上下文：每个 tool_result 都作为一条显式 message 进入下一次请求——没有隐藏状态。
      </div>
    </div>
  )
}
