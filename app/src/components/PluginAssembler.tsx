import { useState } from 'react'
import { Figure } from './ui'
import { PlayerControls, useStepPlayer } from './StepPlayer'

const ACCENT = 'var(--color-dsh)'

type PluginId = 'dsh-base' | 'dsh-web-app' | 'dsh-headless' | 'telemetry' | 'web-search' | 'approval-policy'

interface PluginDef {
  id: PluginId
  name: string
  desc: string
  /** rendered as a child of this node in the assembly tree */
  parent?: PluginId
  /** dsh-web-app and dsh-headless are alternative shells: picking one drops the other */
  mutexWith?: PluginId
}

const PLUGINS: PluginDef[] = [
  {
    id: 'dsh-base',
    name: 'dsh-base',
    desc: '模型适配器 · 工具 · 持久化 · 沙箱与审批策略 · 设置 · 凭据 · 遥测',
  },
  {
    id: 'dsh-web-app',
    name: 'dsh-web-app',
    desc: '浏览器 UI 外壳，把 base 的能力渲染成界面',
    parent: 'dsh-base',
    mutexWith: 'dsh-headless',
  },
  {
    id: 'dsh-headless',
    name: 'dsh-headless',
    desc: '无界面外壳：单次运行、跑完即退出，适合 CI',
    parent: 'dsh-base',
    mutexWith: 'dsh-web-app',
  },
  {
    id: 'telemetry',
    name: 'plugin/telemetry',
    desc: '可选：用量与延迟打点',
    parent: 'dsh-base',
  },
  {
    id: 'web-search',
    name: 'tool/web-search',
    desc: '可选：给模型多一件联网搜索的工具',
    parent: 'dsh-base',
  },
  {
    id: 'approval-policy',
    name: 'policy/custom-approval',
    desc: '可选：换掉默认审批策略（比如写操作一律询问）',
    parent: 'dsh-base',
  },
]

const DEFAULT_ON = new Set<PluginId>(['dsh-base', 'dsh-web-app', 'telemetry'])

/** Startup assembly order: each stage applies on top of the previous ones. */
const STAGES: { name: string; detail: (on: Set<PluginId>) => string }[] = [
  {
    name: 'bundles',
    detail: (on) =>
      PLUGINS.filter((p) => on.has(p.id))
        .map((p) => p.name)
        .join(' · ') || '（空）',
  },
  {
    name: 'profile patches',
    detail: (on) =>
      on.has('approval-policy')
        ? 'profile "team"：覆盖默认审批策略'
        : '未启用自定义策略 → 无 patch',
  },
  {
    name: 'home patches',
    detail: (on) => `~/.dsh：用户级覆盖（主题、默认模型${on.has('telemetry') ? '、遥测开关' : ''}）`,
  },
  {
    name: 'CLI overlays',
    detail: (on) =>
      on.has('dsh-headless')
        ? 'dsh run --headless --once（命令行参数最后压上）'
        : 'dsh --profile team（命令行参数最后压上）',
  },
]

function Toggle({
  def,
  on,
  disabled,
  onToggle,
}: {
  def: PluginDef
  on: boolean
  disabled: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className="flex w-full items-start gap-3 rounded-xl border px-3.5 py-3 text-left transition active:scale-[0.99]"
      style={{
        borderColor: on ? ACCENT : 'var(--color-line)',
        background: on ? 'color-mix(in srgb, var(--color-dsh) 6%, white)' : 'white',
        opacity: disabled ? 0.45 : 1,
      }}
    >
      <span
        className="mt-0.5 inline-flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-md border text-[11px] font-bold text-white"
        style={{
          borderColor: on ? ACCENT : 'var(--color-line)',
          background: on ? ACCENT : 'white',
        }}
      >
        {on ? '✓' : ''}
      </span>
      <span className="min-w-0">
        <span className="block font-mono text-[13px] font-semibold text-ink">{def.name}</span>
        <span className="mt-0.5 block text-xs leading-5 text-ink-soft">{def.desc}</span>
      </span>
    </button>
  )
}

export default function PluginAssembler() {
  const [on, setOn] = useState<Set<PluginId>>(DEFAULT_ON)
  const { step, setStep, playing, next, prev, toggle: togglePlay } = useStepPlayer(STAGES.length, {
    autoPlay: true,
    interval: 750,
  })

  const toggle = (def: PluginDef) => {
    setOn((prev) => {
      const next = new Set(prev)
      if (next.has(def.id)) {
        next.delete(def.id)
      } else {
        next.add(def.id)
        if (def.mutexWith) next.delete(def.mutexWith)
      }
      return next
    })
    // replay the assembly sequence from stage 1 on every selection change
    setStep(0)
    if (!playing) togglePlay()
  }

  const selected = PLUGINS.filter((p) => on.has(p.id))
  const childrenOf = (id: PluginId) => selected.filter((p) => p.parent === id)
  const baseOn = on.has('dsh-base')

  return (
    <Figure caption="左边勾选插件，右边实时渲染装配树；下方是启动时的四层叠加顺序。试试把外壳从 dsh-web-app 切成 dsh-headless。">
      <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        {/* plugin toggles */}
        <div className="flex flex-col gap-2">
          <div className="mb-1 text-xs font-semibold tracking-wider text-ink-soft uppercase">
            选择要装配的 bundle / plugin
          </div>
          <Toggle
            def={PLUGINS[0]}
            on={baseOn}
            disabled={false}
            onToggle={() => toggle(PLUGINS[0])}
          />
          {PLUGINS.slice(1).map((def) => (
            <div key={def.id} className={def.parent === 'dsh-base' ? 'ml-5' : ''}>
              <Toggle def={def} on={on.has(def.id)} disabled={!baseOn} onToggle={() => toggle(def)} />
            </div>
          ))}
          <p className="mt-1 text-xs leading-5 text-ink-soft">
            dsh-web-app 与 dsh-headless 是互斥的两种「外壳」；dsh-base 关掉后，一切无处挂载。
          </p>
        </div>

        {/* assembly tree */}
        <div className="min-w-0">
          <div className="mb-1 text-xs font-semibold tracking-wider text-ink-soft uppercase">
            装配树（Cordis 运行时）
          </div>
          <div className="rounded-xl border border-line bg-paper p-4 font-mono text-[13px] leading-7">
            <div className="font-semibold text-ink">cordis · 无特权核心</div>
            {selected.length === 0 ? (
              <div className="text-ink-soft">└── （什么都没装——核心本身几乎不做任何事）</div>
            ) : (
              selected
                .filter((p) => !p.parent)
                .map((root, ri, roots) => (
                  <div key={root.id}>
                    <div className="text-ink">
                      {ri === roots.length - 1 && childrenOf(root.id).length === 0 ? '└── ' : '├── '}
                      <span style={{ color: ACCENT }}>{root.name}</span>
                    </div>
                    {childrenOf(root.id).map((child, ci, kids) => (
                      <div key={child.id} className="pl-6 text-ink-soft">
                        {ci === kids.length - 1 ? '└── ' : '├── '}
                        {child.name}
                      </div>
                    ))}
                  </div>
                ))
            )}
          </div>

          {/* startup order */}
          <div className="mt-4 mb-2 text-xs font-semibold tracking-wider text-ink-soft uppercase">
            启动叠加顺序
          </div>
          <ol className="flex flex-col gap-1.5">
            {STAGES.map((s, i) => {
              const lit = i <= step
              const current = i === step
              return (
                <li
                  key={s.name}
                  className="rounded-lg border px-3 py-2 transition-all duration-300"
                  style={{
                    borderColor: lit ? ACCENT : 'var(--color-line)',
                    background: lit ? 'color-mix(in srgb, var(--color-dsh) 7%, white)' : 'white',
                    opacity: lit ? 1 : 0.45,
                    boxShadow: current ? `0 0 0 3px color-mix(in srgb, ${ACCENT} 18%, transparent)` : undefined,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-flex h-5 w-5 items-center justify-center rounded-full font-mono text-[11px] font-bold text-white"
                      style={{ background: lit ? ACCENT : 'var(--color-line)' }}
                    >
                      {i + 1}
                    </span>
                    <span className="font-mono text-[13px] font-semibold text-ink">{s.name}</span>
                  </div>
                  <p className="mt-1 pl-7 text-xs leading-5 text-ink-soft">{s.detail(on)}</p>
                </li>
              )
            })}
          </ol>
        </div>
      </div>

      <div className="border-t border-line bg-paper px-5 py-4">
        <PlayerControls
          step={step}
          nSteps={STAGES.length}
          playing={playing}
          accent={ACCENT}
          onToggle={togglePlay}
          onPrev={prev}
          onNext={next}
          onScrub={setStep}
          labels={STAGES.map((s) => s.name)}
        />
      </div>
    </Figure>
  )
}
