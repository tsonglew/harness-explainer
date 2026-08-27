import { Figure } from './ui'
import { Timeline } from './Timeline'
import { PlayerControls, useStepPlayer } from './StepPlayer'
import { PI_LOOP_NODES, PI_PHASE_META, PI_TRACE, type PiPhase } from '../data/piTrace'

const ACCENT = 'var(--color-pi)'

/** The flat loop: user → reply → validate → result, and back. */
function LoopDiagram({ phase }: { phase: PiPhase }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {PI_LOOP_NODES.map((p, i) => {
        const meta = PI_PHASE_META[p]
        const current = p === phase
        return (
          <div key={p} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-xs text-ink-soft">→</span>}
            <span
              className="rounded-full border px-2.5 py-1 font-mono text-[11px] font-semibold whitespace-nowrap transition-all duration-300"
              style={{
                borderColor: current ? meta.color : 'var(--color-line)',
                background: current ? meta.color : 'white',
                color: current ? 'white' : 'var(--color-ink-soft)',
              }}
            >
              {meta.label}
            </span>
          </div>
        )
      })}
      <span className="text-xs text-ink-soft">↩ 回到模型回复</span>
      <span
        className="ml-auto rounded-full border px-2.5 py-1 font-mono text-[11px] font-semibold whitespace-nowrap transition-all duration-300"
        style={{
          borderColor: phase === 'final' ? PI_PHASE_META.final.color : 'var(--color-line)',
          background: phase === 'final' ? PI_PHASE_META.final.color : 'white',
          color: phase === 'final' ? 'white' : 'var(--color-ink-soft)',
        }}
      >
        ⇥ 模型不再要工具 → 终止
      </span>
    </div>
  )
}

export default function PiLoopReplay() {
  const { step, setStep, playing, next, prev, toggle } = useStepPlayer(PI_TRACE.length, {
    interval: 1600,
  })
  const f = PI_TRACE[step]
  const meta = PI_PHASE_META[f.phase]

  return (
    <Figure caption="pi-agent-core 的循环：用户输入 → 模型回复 → 工具校验 → 工具结果，扁平重复，直到模型不再要工具。和通用章的 Agent Loop 对照着看：这里没有审批关卡，也没有压缩、队列之外的任何隐藏机制。">
      {/* flat loop diagram */}
      <div className="border-b border-line bg-paper px-5 py-3">
        <LoopDiagram phase={f.phase} />
      </div>

      <div className="grid gap-5 px-5 py-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        {/* event list */}
        <div>
          <div className="mb-2 text-xs font-semibold tracking-wider text-ink-soft uppercase">执行轨迹</div>
          <Timeline
            events={PI_TRACE.map((fr, i) => ({ id: String(i), title: fr.title, detail: fr.note, kind: fr.phase }))}
            step={step}
            onSelect={(i) => setStep(i)}
            accent={ACCENT}
            kindColor={(k) => PI_PHASE_META[k as PiPhase].color}
          />
        </div>

        {/* stage body */}
        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex items-center gap-2">
            <span
              className="rounded-full px-3 py-1 text-xs font-semibold text-white transition-colors duration-300"
              style={{ background: meta.color }}
            >
              {f.title}
            </span>
            {f.back && <span className="text-xs text-ink-soft">↩ 回到模型</span>}
          </div>

          <div className="scroll-thin min-h-[190px] overflow-auto rounded-xl border border-line bg-paper p-4">
            {f.kind === 'code' ? (
              <pre className="font-mono text-[13px] leading-6 whitespace-pre-wrap text-ink">{f.body}</pre>
            ) : (
              <p className="text-sm leading-7 whitespace-pre-wrap text-ink">{f.body}</p>
            )}
          </div>

          {f.note && (
            <p
              className="rounded-lg px-3 py-2 text-xs leading-6"
              style={{ background: `color-mix(in srgb, ${meta.color} 8%, white)`, color: 'var(--color-ink-soft)' }}
            >
              💡 {f.note}
            </p>
          )}

          {f.phase === 'validate' && (
            <p
              className="rounded-lg border border-dashed px-3 py-2 text-xs leading-6 text-ink-soft"
              style={{ borderColor: `color-mix(in srgb, ${ACCENT} 45%, transparent)` }}
            >
              对照通用章：这里本该有一个「审批关卡」节点——pi 里它不存在。YOLO by default，校验通过即执行。
            </p>
          )}
        </div>
      </div>

      <div className="border-t border-line bg-paper px-5 py-4">
        <PlayerControls
          step={step}
          nSteps={PI_TRACE.length}
          playing={playing}
          accent={ACCENT}
          onToggle={toggle}
          onPrev={prev}
          onNext={next}
          onScrub={setStep}
          labels={PI_TRACE.map((fr) => fr.title)}
        />
      </div>
    </Figure>
  )
}
