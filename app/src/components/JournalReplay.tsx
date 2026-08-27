import { Figure } from './ui'
import { Timeline } from './Timeline'
import { PlayerControls, useStepPlayer } from './StepPlayer'
import {
  JOURNAL,
  JOURNAL_KIND_COLOR,
  ROLE_LABEL,
  deriveMessages,
  type MessageRole,
} from '../data/dshJournal'

const ACCENT = 'var(--color-dsh)'

const ROLE_COLOR: Record<MessageRole, string> = {
  system: '#16181d',
  user: '#7c3aed',
  assistant: '#0ea5e9',
  tool: '#14b8a6',
}

export default function JournalReplay() {
  const { step, setStep, playing, next, prev, toggle } = useStepPlayer(JOURNAL.length, {
    interval: 1300,
  })

  const active = JOURNAL[step]
  // the log is append-only: the visible prefix is everything up to `step`
  const prefix = JOURNAL.slice(0, step + 1)
  const messages = deriveMessages(prefix)
  // each visible event appends at most one message, always at the tail —
  // so the active event's derived message (if any) is the last one
  const activeMessageIndex = active.kind === 'approval_decision' ? null : messages.length - 1

  return (
    <Figure caption="左：core/session 的不可变事件日志（只增不改）。右：deriveMessages() 从日志前缀派生出的 messages[]。点击左侧任意事件，看它在右侧变成了哪条消息。">
      <div className="grid gap-5 p-5 lg:grid-cols-2">
        {/* journal */}
        <div className="min-w-0">
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-xs font-semibold tracking-wider text-ink-soft uppercase">
              事件日志（journal）
            </span>
            <span className="font-mono text-[11px] text-ink-soft">append-only</span>
          </div>
          <Timeline
            events={JOURNAL.map((e) => ({ id: e.id, title: e.title, detail: e.detail, kind: e.kind }))}
            step={step}
            onSelect={setStep}
            accent={ACCENT}
            kindColor={(k) => JOURNAL_KIND_COLOR[k as keyof typeof JOURNAL_KIND_COLOR]}
          />
          <p className="mt-2 min-h-10 rounded-lg bg-paper px-3 py-2 font-mono text-xs leading-5 text-ink-soft">
            {active.payload}
          </p>
        </div>

        {/* derived messages */}
        <div className="min-w-0">
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-xs font-semibold tracking-wider text-ink-soft uppercase">
              deriveMessages() → messages[]
            </span>
            <span className="font-mono text-[11px] text-ink-soft">纯函数 · 可重算</span>
          </div>
          <div className="scroll-thin flex max-h-[420px] flex-col gap-2 overflow-y-auto rounded-xl border border-line bg-paper p-3">
            {messages.map((m, i) => {
              const hot = i === activeMessageIndex
              const color = ROLE_COLOR[m.role]
              return (
                <div
                  key={i}
                  className="rounded-lg border bg-white px-3 py-2 transition-all duration-300"
                  style={{
                    borderColor: hot ? color : 'var(--color-line)',
                    boxShadow: hot ? `0 0 0 3px color-mix(in srgb, ${color} 20%, transparent)` : undefined,
                  }}
                >
                  <span
                    className="rounded px-1.5 py-0.5 font-mono text-[10px] font-bold text-white"
                    style={{ background: color }}
                  >
                    {ROLE_LABEL[m.role]}
                  </span>
                  <p className="mt-1.5 font-mono text-xs leading-5 break-words whitespace-pre-wrap text-ink">
                    {m.content}
                  </p>
                </div>
              )
            })}
            {activeMessageIndex === null && (
              <p className="rounded-lg border border-dashed border-line px-3 py-2 text-xs leading-5 text-ink-soft">
                ← {active.title} 不派生任何消息：审批决定只留在日志里供审计，模型永远看不见它。
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-line bg-paper px-5 py-4">
        <PlayerControls
          step={step}
          nSteps={JOURNAL.length}
          playing={playing}
          accent={ACCENT}
          onToggle={toggle}
          onPrev={prev}
          onNext={next}
          onScrub={setStep}
          labels={JOURNAL.map((e) => e.title)}
        />
      </div>
    </Figure>
  )
}
