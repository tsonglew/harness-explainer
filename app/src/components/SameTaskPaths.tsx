import { Figure } from './ui'
import { PlayerControls, useStepPlayer } from './StepPlayer'
import { HARNESSES, PATH_BEATS, SAME_TASK_PATHS, TASK_BRIEF } from '../data/compare'

const N_STEPS = SAME_TASK_PATHS.dsh.length

/** One task, three harness executions, stepped in sync: same beat, three ways. */
export default function SameTaskPaths() {
  const { step, setStep, playing, next, prev, toggle } = useStepPlayer(N_STEPS, {
    interval: 2000,
  })

  return (
    <Figure caption="同一个任务，三种走法。三栏同步步进：同一拍里，三个 harness 各自在做什么一目了然。">
      {/* task brief header */}
      <div className="flex flex-wrap items-center gap-2 border-b border-line bg-paper px-5 py-3">
        <span className="text-xs font-semibold tracking-wider text-ink-soft uppercase">任务</span>
        <code className="rounded-md border border-line bg-white px-2 py-1 font-mono text-[13px] text-ink">
          {TASK_BRIEF}
        </code>
        <span className="ml-auto hidden text-xs text-ink-soft sm:block">
          同一拍，三种走法
        </span>
      </div>

      {/* three synchronized columns */}
      <div className="grid gap-4 px-5 py-5 md:grid-cols-3">
        {HARNESSES.map((h) => (
          <div key={h.key} className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: h.color }}
              />
              <span className="text-sm font-semibold" style={{ color: h.color }}>
                {h.name}
              </span>
            </div>
            <ol className="mt-3 flex flex-col gap-2">
              {SAME_TASK_PATHS[h.key].map((s, i) => {
                const current = i === step
                const past = i < step
                return (
                  <li
                    key={i}
                    className="rounded-xl border px-3 py-2.5 transition-all duration-300"
                    style={{
                      borderColor: current ? h.color : 'var(--color-line)',
                      background: current
                        ? `color-mix(in srgb, ${h.color} 8%, white)`
                        : 'white',
                      opacity: current ? 1 : past ? 0.8 : 0.45,
                    }}
                  >
                    <p className="flex items-baseline gap-2 text-[13px] font-semibold text-ink">
                      <span className="font-mono text-[11px]" style={{ color: h.color }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      {s.title}
                    </p>
                    <p className="mt-1 text-[11px] leading-5 text-ink-soft">{s.note}</p>
                  </li>
                )
              })}
            </ol>
          </div>
        ))}
      </div>

      <div className="border-t border-line bg-paper px-5 py-4">
        <PlayerControls
          step={step}
          nSteps={N_STEPS}
          playing={playing}
          accent="var(--color-ink)"
          onToggle={toggle}
          onPrev={prev}
          onNext={next}
          onScrub={setStep}
          labels={PATH_BEATS}
        />
      </div>
    </Figure>
  )
}
