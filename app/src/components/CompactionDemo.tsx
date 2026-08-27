import { PlayerControls, useStepPlayer } from './StepPlayer'
import { Figure } from './ui'
import { COMPACTION_FRAMES, COMPACTION_THRESHOLD } from '../data/codexTrace'

const ACCENT = 'var(--color-codex)'

/** Context window filling up, then compaction folding old history into a summary. */
export default function CompactionDemo() {
  const { step, setStep, playing, next, prev, toggle } = useStepPlayer(COMPACTION_FRAMES.length, {
    interval: 2000,
  })
  const f = COMPACTION_FRAMES[step]
  const used = f.segments.reduce((s, seg) => s + seg.pct, 0)

  return (
    <Figure caption="上下文窗口的占用随对话只增不减；越过阈值时 harness 触发 compaction：旧历史被折叠成一段摘要，占用骤降，循环继续。压缩时机由 harness 计算，不靠模型自觉。">
      <div className="px-5 pt-5">
        {/* usage bar */}
        <div className="mb-1 flex items-baseline justify-between text-xs">
          <span className="font-semibold text-ink">{f.title}</span>
          <span className="font-mono text-ink-soft">
            占用 {used}% / 阈值 {COMPACTION_THRESHOLD}%
          </span>
        </div>
        <div className="relative h-10 overflow-hidden rounded-xl border border-line bg-paper">
          <div className="flex h-full">
            {f.segments.map((seg, i) => (
              <div
                key={i}
                className="flex h-full items-center justify-center overflow-hidden transition-all duration-700"
                style={{ width: `${seg.pct}%`, background: seg.color }}
                title={`${seg.label} · ${seg.pct}%`}
              >
                {seg.pct >= 10 && (
                  <span className="truncate px-1 text-[10px] font-semibold whitespace-nowrap text-white">{seg.label}</span>
                )}
              </div>
            ))}
          </div>
          {/* threshold marker */}
          <div
            className="absolute inset-y-0 border-l-2 border-dashed"
            style={{ left: `${COMPACTION_THRESHOLD}%`, borderColor: '#ef4444' }}
          >
            <span className="absolute -top-0 right-1 rounded bg-white/85 px-1 text-[10px] font-semibold" style={{ color: '#ef4444' }}>
              阈值
            </span>
          </div>
        </div>

        {/* legend */}
        <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-ink-soft">
          {Array.from(new Map(f.segments.map((s) => [s.label, s.color]))).map(([label, color]) => (
            <span key={label} className="inline-flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: color }} />
              {label}
            </span>
          ))}
          {f.compacted && (
            <span className="inline-flex items-center gap-1 font-semibold" style={{ color: '#ef4444' }}>
              ✂ 旧历史已折叠
            </span>
          )}
        </div>
      </div>

      <div className="px-5 py-4">
        <p
          className="rounded-lg px-3 py-2 text-xs leading-6"
          style={{
            background: f.compacted
              ? 'color-mix(in srgb, #ef4444 7%, white)'
              : `color-mix(in srgb, ${ACCENT} 8%, white)`,
            color: 'var(--color-ink-soft)',
          }}
        >
          💡 {f.note}
        </p>
      </div>

      <div className="border-t border-line bg-paper px-5 py-4">
        <PlayerControls
          step={step}
          nSteps={COMPACTION_FRAMES.length}
          playing={playing}
          accent={ACCENT}
          onToggle={toggle}
          onPrev={prev}
          onNext={next}
          onScrub={setStep}
          labels={COMPACTION_FRAMES.map((fr) => fr.title)}
        />
      </div>
    </Figure>
  )
}
