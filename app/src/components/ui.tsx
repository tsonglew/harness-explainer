import type { ReactNode } from 'react'

/** Colored kicker + title + lead for a chapter section. */
export function SectionHeading({
  kicker,
  title,
  lead,
  accent,
  id,
}: {
  kicker: string
  title: string
  lead?: string
  accent: string
  id?: string
}) {
  return (
    <div id={id} className="mx-auto max-w-3xl scroll-mt-24 px-4 pt-20">
      <p className="text-sm font-semibold tracking-widest" style={{ color: accent }}>
        {kicker}
      </p>
      <h2 className="mt-2 text-3xl font-bold tracking-tight text-ink">{title}</h2>
      {lead && <p className="mt-3 text-base leading-8 text-ink-soft">{lead}</p>}
    </div>
  )
}

/** Page hero band for a chapter. */
export function ChapterHero({
  tag,
  title,
  sub,
  accent,
  children,
}: {
  tag: string
  title: string
  sub: string
  accent: string
  children?: ReactNode
}) {
  return (
    <div
      className="border-b border-line"
      style={{ background: `linear-gradient(180deg, color-mix(in srgb, ${accent} 7%, var(--color-paper)), var(--color-paper))` }}
    >
      <div className="mx-auto max-w-6xl px-4 py-16">
        <span
          className="inline-block rounded-full px-3 py-1 text-xs font-semibold text-white"
          style={{ background: accent }}
        >
          {tag}
        </span>
        <h1 className="mt-4 max-w-3xl text-4xl leading-tight font-bold tracking-tight text-ink">{title}</h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-ink-soft">{sub}</p>
        {children}
      </div>
    </div>
  )
}

export function Callout({ children, accent = 'var(--color-basics)' }: { children: ReactNode; accent?: string }) {
  return (
    <div
      className="my-4 rounded-xl border p-4 text-sm leading-7"
      style={{
        borderColor: `color-mix(in srgb, ${accent} 35%, transparent)`,
        background: `color-mix(in srgb, ${accent} 6%, white)`,
      }}
    >
      {children}
    </div>
  )
}

export function Chip({ children, color = 'var(--color-ink)' }: { children: ReactNode; color?: string }) {
  return (
    <code
      className="rounded-md px-1.5 py-0.5 font-mono text-[13px]"
      style={{ color, background: `color-mix(in srgb, ${color} 9%, transparent)` }}
    >
      {children}
    </code>
  )
}

export function Prose({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`prose-cn mx-auto max-w-3xl px-4 text-[15px] text-ink ${className}`}>{children}</div>
}

/** Dark code/JSON viewer. */
export function CodeBlock({
  code,
  caption,
  maxHeight,
  hlLines,
}: {
  code: string
  caption?: string
  maxHeight?: number
  hlLines?: number[]
}) {
  const lines = code.split('\n')
  return (
    <figure className="my-3">
      <div
        className="scroll-thin overflow-auto rounded-xl text-[13px] leading-6"
        style={{ background: 'var(--color-code-bg)', color: 'var(--color-code-fg)', maxHeight }}
      >
        <pre className="min-w-max px-4 py-3 font-mono">
          {lines.map((ln, i) => (
            <div
              key={i}
              className="px-2 -mx-2 rounded"
              style={hlLines?.includes(i + 1) ? { background: 'rgba(255,255,255,0.10)' } : undefined}
            >
              {ln || ' '}
            </div>
          ))}
        </pre>
      </div>
      {caption && <figcaption className="mt-1.5 text-xs text-ink-soft">{caption}</figcaption>}
    </figure>
  )
}

export function Figure({ children, caption }: { children: ReactNode; caption?: string }) {
  return (
    <figure className="my-6 overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
      {children}
      {caption && (
        <figcaption className="border-t border-line bg-paper px-4 py-2.5 text-xs text-ink-soft">{caption}</figcaption>
      )}
    </figure>
  )
}

/** Two-column layout: narrative left, sticky interactive stage right. */
export function Split({ children, stage, stageFirst = false }: { children: ReactNode; stage: ReactNode; stageFirst?: boolean }) {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 lg:flex-row">
      <div className={`min-w-0 flex-1 ${stageFirst ? 'lg:order-2' : ''}`}>{children}</div>
      <div className={`min-w-0 flex-1 ${stageFirst ? 'lg:order-1' : ''}`}>
        <div className="lg:sticky lg:top-20">{stage}</div>
      </div>
    </div>
  )
}

/** Segmented control (radio-style pill group). */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  accent = 'var(--color-basics)',
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string }[]
  accent?: string
}) {
  return (
    <div className="inline-flex rounded-full border border-line bg-white p-0.5">
      {options.map((o) => {
        const on = o.value === value
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className="rounded-full px-3 py-1.5 text-sm font-medium transition"
            style={on ? { background: accent, color: 'white' } : { color: 'var(--color-ink-soft)' }}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

/** Labeled slider row. */
export function SliderRow({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  format,
  accent = 'var(--color-basics)',
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (v: number) => void
  format?: (v: number) => string
  accent?: string
}) {
  return (
    <label className="block">
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-ink-soft">{label}</span>
        <span className="font-mono font-semibold text-ink">{format ? format(value) : value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
        style={{ accentColor: accent }}
      />
    </label>
  )
}
