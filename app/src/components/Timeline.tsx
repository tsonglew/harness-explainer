import { useEffect, useRef } from 'react'

export type TimelineEvent = {
  id: string
  title: string
  detail?: string
  kind: string
}

/** Vertical event list with active highlight + auto-scroll. Shared by journal/RPC views. */
export function Timeline({
  events,
  step,
  onSelect,
  accent,
  kindColor,
}: {
  events: TimelineEvent[]
  step: number
  onSelect: (i: number) => void
  accent: string
  kindColor: (kind: string) => string
}) {
  const activeRef = useRef<HTMLButtonElement | null>(null)
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [step])

  return (
    <div className="scroll-thin max-h-[420px] overflow-y-auto rounded-xl border border-line bg-white">
      <ol>
        {events.map((e, i) => {
          const active = i === step
          const done = i < step
          const color = kindColor(e.kind)
          return (
            <li key={e.id} className="border-b border-line/60 last:border-0">
              <button
                ref={active ? activeRef : undefined}
                onClick={() => onSelect(i)}
                className="flex w-full items-start gap-3 px-3 py-2.5 text-left transition"
                style={{
                  background: active ? `color-mix(in srgb, ${color} 10%, white)` : undefined,
                  opacity: done ? 0.72 : active ? 1 : 0.45,
                }}
              >
                <span
                  className="mt-1 inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: color, boxShadow: active ? `0 0 0 4px color-mix(in srgb, ${color} 22%, transparent)` : undefined }}
                />
                <span className="min-w-0">
                  <span className="block font-mono text-[13px] font-semibold text-ink">{e.title}</span>
                  {e.detail && <span className="mt-0.5 block truncate text-xs text-ink-soft">{e.detail}</span>}
                </span>
                {active && (
                  <span className="ml-auto mt-1 text-[10px] font-semibold tracking-wider" style={{ color }}>
                    ●
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ol>
      <span className="sr-only" style={{ color: accent }} />
    </div>
  )
}
