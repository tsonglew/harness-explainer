import { useEffect, useMemo, useState } from 'react'
import { buildTrace, FRAME_COLOR, type Frame } from '../data/basicsTrace'
import { Segmented, SliderRow } from './ui'
import { Timeline } from './Timeline'
import { PlayerControls, useStepPlayer } from './StepPlayer'

function TokenMeter({ tokens, window }: { tokens: number; window: number }) {
  const ratio = Math.min(1, tokens / window)
  const color = ratio > 0.82 ? '#ef4444' : ratio > 0.6 ? '#f59e0b' : '#22c55e'
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-ink-soft">
        <span>上下文占用</span>
        <span className="font-mono">
          {tokens} / {window} tok
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-black/8">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${ratio * 100}%`, background: color }}
        />
      </div>
    </div>
  )
}

export default function AgentLoopPlayground() {
  const [task, setTask] = useState('帮我统计日志目录里 ERROR 出现了多少次，并写个脚本')
  const [policy, setPolicy] = useState<'auto' | 'ask'>('ask')
  const [iterations, setIterations] = useState(3)
  const [window, setWindow] = useState(2000)

  const frames: Frame[] = useMemo(
    () => buildTrace({ task, policy, iterations, window }),
    [task, policy, iterations, window],
  )

  const { step, setStep, playing, next, prev, reset, toggle } = useStepPlayer(frames.length, {
    interval: 1300,
  })

  // keep step in range when knobs shrink the trace
  useEffect(() => {
    if (step > frames.length - 1) setStep(frames.length - 1)
  }, [frames.length, step, setStep])

  const f = frames[Math.min(step, frames.length - 1)]
  const accent = FRAME_COLOR(f.phase)

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
      {/* knobs */}
      <div className="grid gap-4 border-b border-line bg-paper px-5 py-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-sm text-ink-soft">你的任务指令</span>
          <input
            value={task}
            onChange={(e) => {
              setTask(e.target.value)
              reset()
            }}
            className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-basics"
            placeholder="输入一个任务…"
          />
        </label>
        <div>
          <span className="mb-1 block text-sm text-ink-soft">审批策略</span>
          <Segmented
            value={policy}
            onChange={(v) => {
              setPolicy(v)
              reset()
            }}
            options={[
              { value: 'auto', label: '自动放行' },
              { value: 'ask', label: '每次询问' },
            ]}
          />
        </div>
        <SliderRow
          label="工具循环次数"
          value={iterations}
          min={1}
          max={3}
          onChange={(v) => {
            setIterations(v)
            reset()
          }}
          format={(v) => `${v} 次`}
        />
        <SliderRow
          label="上下文窗口"
          value={window}
          min={1500}
          max={4000}
          step={100}
          onChange={(v) => {
            setWindow(v)
            reset()
          }}
          format={(v) => `${v} tok`}
        />
      </div>

      {/* stage */}
      <div className="grid gap-5 px-5 py-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <div>
          <div className="mb-2 text-xs font-semibold tracking-wider text-ink-soft uppercase">执行轨迹</div>
          <Timeline
            events={frames.map((fr, i) => ({ id: String(i), title: fr.title, detail: fr.note, kind: fr.phase }))}
            step={step}
            onSelect={(i) => setStep(i)}
            accent={accent}
            kindColor={(k) => FRAME_COLOR(k as never)}
          />
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="rounded-full px-3 py-1 text-xs font-semibold text-white" style={{ background: accent }}>
              {f.title}
            </span>
            {f.back && <span className="text-xs text-ink-soft">↩ 回到循环</span>}
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
              style={{ background: `color-mix(in srgb, ${accent} 8%, white)`, color: 'var(--color-ink-soft)' }}
            >
              💡 {f.note}
            </p>
          )}

          <TokenMeter tokens={f.tokens} window={window} />
        </div>
      </div>

      {/* transport */}
      <div className="border-t border-line bg-paper px-5 py-4">
        <PlayerControls
          step={step}
          nSteps={frames.length}
          playing={playing}
          accent="#7c3aed"
          onToggle={toggle}
          onPrev={prev}
          onNext={next}
          onScrub={(s) => setStep(s)}
          labels={frames.map((fr) => fr.title)}
        />
      </div>
    </div>
  )
}
