import { Timeline } from './Timeline'
import { PlayerControls, useStepPlayer } from './StepPlayer'
import { CodeBlock, Figure } from './ui'
import {
  RPC_COMPONENTS,
  RPC_FRAMES,
  RPC_KIND_META,
  type RpcComponent,
  type RpcMsgKind,
} from '../data/codexTrace'

const ACCENT = 'var(--color-codex)'

/** The App Server pipeline: current frame's component is highlighted. */
function ComponentDiagram({ active, dir }: { active: RpcComponent; dir: 'c2s' | 's2c' }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {RPC_COMPONENTS.map((c, i) => {
        const on = c.id === active
        return (
          <div key={c.id} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-xs text-ink-soft">{i === 1 ? '⇄' : '→'}</span>}
            <span
              className="rounded-lg border px-2.5 py-1.5 transition-all duration-300"
              title={c.desc}
              style={{
                borderColor: on ? ACCENT : 'var(--color-line)',
                background: on ? `color-mix(in srgb, ${ACCENT} 10%, white)` : 'white',
                boxShadow: on ? `0 0 0 3px color-mix(in srgb, ${ACCENT} 18%, transparent)` : undefined,
              }}
            >
              <span className={`block font-mono text-[11px] font-semibold whitespace-nowrap ${on ? 'text-ink' : 'text-ink-soft'}`}>
                {c.label}
              </span>
              <span className="block text-[10px] whitespace-nowrap text-ink-soft">{c.desc}</span>
            </span>
          </div>
        )
      })}
      <span className="ml-auto rounded-full border border-line bg-white px-2.5 py-1 font-mono text-[11px] text-ink-soft">
        {dir === 'c2s' ? 'client → server' : 'server → client'}
      </span>
    </div>
  )
}

/** A sniffer on the stdio pipe: step through the JSONL frames one by one. */
export default function RpcSniffer() {
  const { step, setStep, playing, next, prev, toggle } = useStepPlayer(RPC_FRAMES.length, {
    interval: 2000,
  })
  const f = RPC_FRAMES[step]
  const meta = RPC_KIND_META[f.kind]

  return (
    <Figure caption="在 stdio 管道上监听客户端与 App Server 之间的 JSONL 帧：一行一条消息。请求与响应靠 id 配对，通知没有 id、不需要响应——server 靠它把流式事件推给客户端。注意第 8 帧：server 也会反向向 client 发请求（审批）。">
      {/* pipeline diagram */}
      <div className="border-b border-line bg-paper px-5 py-3">
        <ComponentDiagram active={f.component} dir={f.dir} />
      </div>

      <div className="grid gap-5 px-5 py-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        {/* JSONL stream */}
        <div>
          <div className="mb-2 flex items-center gap-3">
            <span className="text-xs font-semibold tracking-wider text-ink-soft uppercase">stdio · JSONL 帧</span>
            <span className="flex gap-2 text-[10px] text-ink-soft">
              {(Object.keys(RPC_KIND_META) as RpcMsgKind[]).map((k) => (
                <span key={k} className="inline-flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-full" style={{ background: RPC_KIND_META[k].color }} />
                  {RPC_KIND_META[k].label.split(' ')[0]}
                </span>
              ))}
            </span>
          </div>
          <Timeline
            events={RPC_FRAMES.map((fr, i) => ({
              id: String(i),
              title: `${fr.dir === 'c2s' ? '→' : '←'} ${fr.title}`,
              detail: fr.note,
              kind: fr.kind,
            }))}
            step={step}
            onSelect={(i) => setStep(i)}
            accent={ACCENT}
            kindColor={(k) => RPC_KIND_META[k as RpcMsgKind].color}
          />
        </div>

        {/* current frame detail */}
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex items-center gap-2">
            <span
              className="rounded-full px-3 py-1 text-xs font-semibold text-white transition-colors duration-300"
              style={{ background: meta.color }}
            >
              {meta.label}
            </span>
            <span className="font-mono text-xs text-ink-soft">
              {f.dir === 'c2s' ? 'client → app-server' : 'app-server → client'}
            </span>
          </div>

          <CodeBlock code={f.json} />

          <p
            className="rounded-lg px-3 py-2 text-xs leading-6"
            style={{ background: `color-mix(in srgb, ${meta.color} 8%, white)`, color: 'var(--color-ink-soft)' }}
          >
            💡 {f.note}
          </p>
        </div>
      </div>

      <div className="border-t border-line bg-paper px-5 py-4">
        <PlayerControls
          step={step}
          nSteps={RPC_FRAMES.length}
          playing={playing}
          accent={ACCENT}
          onToggle={toggle}
          onPrev={prev}
          onNext={next}
          onScrub={setStep}
          labels={RPC_FRAMES.map((fr) => fr.title)}
        />
      </div>
    </Figure>
  )
}
