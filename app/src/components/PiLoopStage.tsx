import { AnimatePresence, motion } from 'framer-motion'
import { PI_LOOP_NODES, PI_LOOP_STEP_PHASES, PI_PHASE_META, type PiPhase } from '../data/piTrace'

const ACCENT = 'var(--color-pi)'

const PHASE_NOTES: Record<PiPhase, string> = {
  user: '输入直接进入会话上下文。agent 还在跑也能继续追加消息（队列输入）。',
  reply: '模型只输出文本与结构化的 tool_call（由 pi-ai 做 schema 校验），执行权在 harness 手里。',
  validate: '校验通过即执行——注意这里之后什么都没有：没有审批关卡。YOLO by default。',
  result: '结果作为 tool_result 写回显式上下文。你看到的历史，就是模型看到的历史。',
  final: '模型不再要工具，循环就停。和通用循环一样朴素的退出条件。',
}

/**
 * Controlled flat-loop diagram for the sticky stage: highlights the phase
 * matching the active scroll step, with the missing approval gate shown
 * as a crossed-out ghost node.
 */
export default function PiLoopStage({ active }: { active: number }) {
  const phase = PI_LOOP_STEP_PHASES[Math.min(Math.max(active, 0), PI_LOOP_STEP_PHASES.length - 1)]
  const meta = PI_PHASE_META[phase]

  return (
    <div className="px-5 py-5">
      {/* flat loop nodes */}
      <div className="flex flex-wrap items-center gap-1.5">
        {PI_LOOP_NODES.map((p, i) => {
          const m = PI_PHASE_META[p]
          const current = p === phase
          return (
            <div key={p} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-xs text-ink-soft">→</span>}
              <span
                className="rounded-full border px-2.5 py-1 font-mono text-[11px] font-semibold whitespace-nowrap transition-all duration-300"
                style={{
                  borderColor: current ? m.color : 'var(--color-line)',
                  background: current ? m.color : 'white',
                  color: current ? 'white' : 'var(--color-ink-soft)',
                  boxShadow: current ? `0 0 0 4px color-mix(in srgb, ${m.color} 18%, transparent)` : undefined,
                }}
              >
                {m.label}
              </span>
              {/* ghost approval gate between validate and result */}
              {p === 'validate' && (
                <span className="flex items-center gap-1.5">
                  <span className="text-xs text-ink-soft">→</span>
                  <span
                    className="rounded-full border border-dashed px-2.5 py-1 font-mono text-[11px] whitespace-nowrap text-ink-soft/70 line-through"
                    title="pi 里没有这一站"
                  >
                    审批关卡
                  </span>
                </span>
              )}
            </div>
          )
        })}
        <span className="text-xs text-ink-soft">↩ 回到模型回复</span>
        <span
          className="rounded-full border px-2.5 py-1 font-mono text-[11px] font-semibold whitespace-nowrap transition-all duration-300"
          style={{
            borderColor: phase === 'final' ? PI_PHASE_META.final.color : 'var(--color-line)',
            background: phase === 'final' ? PI_PHASE_META.final.color : 'white',
            color: phase === 'final' ? 'white' : 'var(--color-ink-soft)',
          }}
        >
          ⇥ 模型不再要工具 → 终止
        </span>
      </div>

      {/* per-phase annotation */}
      <div className="mt-4 min-h-[86px]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={phase}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
            className="rounded-lg px-3.5 py-3 text-sm leading-7"
            style={{ background: `color-mix(in srgb, ${meta.color} 8%, white)` }}
          >
            <span
              className="mr-2 rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
              style={{ background: meta.color }}
            >
              {meta.label}
            </span>
            <span className="text-ink">{PHASE_NOTES[phase]}</span>
          </motion.div>
        </AnimatePresence>
      </div>

      <p className="mt-3 text-xs leading-6 text-ink-soft">
        和通用章的循环对照：少了<em className="not-italic" style={{ color: ACCENT }}>审批关卡</em>与一切隐藏机制，
        只剩四个阶段的扁平重复。
      </p>
    </div>
  )
}
