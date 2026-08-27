import { Figure } from './ui'
import { PlayerControls, useStepPlayer } from './StepPlayer'
import { DSH_TRACE, PHASE_META, PIPELINE, type TurnPhase } from '../data/dshTrace'

const ACCENT = 'var(--color-dsh)'

/** The protected tool pipeline: pre-execute → execute → post-execute → result. */
function Pipeline({ phase }: { phase: TurnPhase }) {
  const activeIdx = PIPELINE.indexOf(phase)
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto py-1">
      {PIPELINE.map((p, i) => {
        const meta = PHASE_META[p]
        const lit = activeIdx >= 0 && i <= activeIdx
        const current = i === activeIdx
        return (
          <div key={p} className="flex shrink-0 items-center gap-1.5">
            {i > 0 && (
              <span className="text-xs" style={{ color: lit ? ACCENT : 'var(--color-line)' }}>
                →
              </span>
            )}
            <span
              className="rounded-full border px-2.5 py-1 font-mono text-[11px] font-semibold whitespace-nowrap transition-all duration-300"
              style={{
                borderColor: current ? meta.color : lit ? ACCENT : 'var(--color-line)',
                background: current
                  ? meta.color
                  : lit
                    ? 'color-mix(in srgb, var(--color-dsh) 8%, white)'
                    : 'white',
                color: current ? 'white' : lit ? 'var(--color-ink)' : 'var(--color-ink-soft)',
                opacity: lit ? 1 : 0.5,
              }}
            >
              {meta.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default function TurnStepPlayer() {
  const { step, setStep, playing, next, prev, toggle } = useStepPlayer(DSH_TRACE.length, {
    interval: 1600,
  })
  const f = DSH_TRACE[step]
  const meta = PHASE_META[f.phase]

  return (
    <Figure caption="core/agent-loop 的一个 turn：turn = 0..n 个 step，每个 step = 一次模型请求 + 它的工具调用。注意工具执行被夹在 pre/post 之间——这就是 core/tools 的受保护路径。">
      {/* turn / step grouping header */}
      <div className="flex flex-wrap items-center gap-2 border-b border-line bg-paper px-5 py-3">
        <span
          className="rounded-full px-3 py-1 text-xs font-bold text-white"
          style={{ background: ACCENT }}
        >
          turn {f.turn}
        </span>
        <span className="rounded-full border border-line bg-white px-3 py-1 font-mono text-xs text-ink">
          step {f.step} / {f.stepsInTurn}
        </span>
        <span
          className="rounded-full px-3 py-1 text-xs font-semibold text-white transition-colors duration-300"
          style={{ background: meta.color }}
        >
          {meta.label}
        </span>
        <span className="ml-auto hidden text-xs text-ink-soft sm:block">
          turn 结束条件：模型不再请求工具
        </span>
      </div>

      <div className="grid gap-5 px-5 py-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        {/* stage body */}
        <div className="min-w-0">
          <div className="mb-2 text-xs font-semibold tracking-wider text-ink-soft uppercase">
            {f.title}
          </div>
          <div className="scroll-thin min-h-[150px] overflow-auto rounded-xl border border-line bg-paper p-4">
            <pre className="font-mono text-[13px] leading-6 whitespace-pre-wrap text-ink">{f.body}</pre>
          </div>
          {f.note && (
            <p
              className="mt-3 rounded-lg px-3 py-2 text-xs leading-6"
              style={{
                background: `color-mix(in srgb, ${meta.color} 8%, white)`,
                color: 'var(--color-ink-soft)',
              }}
            >
              💡 {f.note}
            </p>
          )}
        </div>

        {/* protected pipeline + step list */}
        <div className="min-w-0">
          <div className="mb-2 text-xs font-semibold tracking-wider text-ink-soft uppercase">
            受保护执行路径
          </div>
          <div className="rounded-xl border border-line bg-white p-3">
            <Pipeline phase={f.phase} />
            <p className="mt-2 text-xs leading-5 text-ink-soft">
              {f.phase === 'request' || f.phase === 'tool_call'
                ? '模型侧阶段：还没到工具管线。'
                : 'core/tools 强制每个工具调用走完这条管线，没有后门。'}
            </p>
          </div>

          <div className="mt-4 mb-2 text-xs font-semibold tracking-wider text-ink-soft uppercase">
            本 turn 的两个 step
          </div>
          <ol className="flex flex-col gap-1.5">
            {[1, 2].map((s) => {
              const current = s === f.step
              return (
                <li
                  key={s}
                  className="rounded-lg border px-3 py-2 text-xs transition-all duration-300"
                  style={{
                    borderColor: current ? ACCENT : 'var(--color-line)',
                    background: current ? 'color-mix(in srgb, var(--color-dsh) 7%, white)' : 'white',
                    opacity: current ? 1 : 0.55,
                  }}
                >
                  <span className="font-mono font-semibold text-ink">step {s}</span>
                  <span className="ml-2 text-ink-soft">
                    {s === 1 ? 'read_file：先读配置' : 'edit_file：把 10s 改成 30s'}
                  </span>
                </li>
              )
            })}
          </ol>
        </div>
      </div>

      <div className="border-t border-line bg-paper px-5 py-4">
        <PlayerControls
          step={step}
          nSteps={DSH_TRACE.length}
          playing={playing}
          accent={ACCENT}
          onToggle={toggle}
          onPrev={prev}
          onNext={next}
          onScrub={setStep}
          labels={DSH_TRACE.map((fr) => `step ${fr.step} · ${fr.title}`)}
        />
      </div>
    </Figure>
  )
}
