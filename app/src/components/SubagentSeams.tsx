import { useState } from 'react'
import { Figure } from './ui'

const ACCENT = 'var(--color-dsh)'

type ProviderId = 'spawn' | 'fork' | 'acp' | 'codex' | 'claude-code'

interface Provider {
  id: ProviderId
  name: string
  isolation: string
  channel: string
  useCase: string
  /** harness 调 harness：dsh 把另一个完整 harness 当子代理调度 */
  harnessInHarness?: boolean
}

const PROVIDERS: Provider[] = [
  {
    id: 'spawn',
    name: '进程内 spawn',
    isolation: '最弱：与主代理共享进程，只隔离上下文',
    channel: '内存中的类型化事件',
    useCase: '派生一个轻量帮手，查个文件、跑个独立小任务',
  },
  {
    id: 'fork',
    name: '进程内 fork',
    isolation: '弱：同进程，但继承并分叉当前会话状态',
    channel: '内存中的类型化事件',
    useCase: '从当前会话「岔开一条岔路」，试错不影响主线',
  },
  {
    id: 'acp',
    name: 'ACP',
    isolation: '强：独立进程，走标准协议',
    channel: 'Agent Client Protocol（跨进程协议）',
    useCase: '接入任何实现了 ACP 的外部 agent，与厂商解耦',
  },
  {
    id: 'codex',
    name: 'Codex',
    isolation: '强：完整的外部 harness 进程',
    channel: 'Codex harness 的对外协议',
    useCase: '把 OpenAI Codex 当子代理调度——harness 调 harness',
    harnessInHarness: true,
  },
  {
    id: 'claude-code',
    name: 'Claude Code',
    isolation: '强：完整的外部 harness 进程',
    channel: 'Claude Code 的对外接口',
    useCase: '把 Claude Code 当子代理调度——harness 调 harness',
    harnessInHarness: true,
  },
]

export default function SubagentSeams() {
  const [sel, setSel] = useState<ProviderId>('codex')
  const p = PROVIDERS.find((x) => x.id === sel)!

  return (
    <Figure caption="同一个子智能体接缝，五种 provider。点击切换——注意后两个：dsh 可以把另外两个完整 harness 当子代理用。">
      {/* provider picker */}
      <div className="flex flex-wrap gap-2 border-b border-line bg-paper px-5 py-4">
        {PROVIDERS.map((x) => {
          const on = x.id === sel
          return (
            <button
              key={x.id}
              onClick={() => setSel(x.id)}
              className="rounded-full border px-3.5 py-1.5 text-sm font-medium transition active:scale-95"
              style={
                on
                  ? { borderColor: ACCENT, background: ACCENT, color: 'white' }
                  : {
                      borderColor: 'var(--color-line)',
                      background: 'white',
                      color: 'var(--color-ink-soft)',
                    }
              }
            >
              {x.name}
              {x.harnessInHarness && (
                <span className="ml-1.5 text-[10px]" style={{ opacity: on ? 0.9 : 0.6 }}>
                  ★
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* detail */}
      <div className="grid gap-4 px-5 py-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        {/* mini diagram: main loop → seam → provider */}
        <div className="flex items-center justify-center gap-3 rounded-xl border border-line bg-paper p-5">
          <div className="rounded-xl border-2 px-4 py-3 text-center" style={{ borderColor: ACCENT }}>
            <div className="text-xs font-bold text-ink">dsh 主循环</div>
            <div className="mt-0.5 font-mono text-[10px] text-ink-soft">core/agent-loop</div>
          </div>
          <div className="flex flex-col items-center text-ink-soft">
            <span className="font-mono text-[10px]">subagent seam</span>
            <span className="text-xl leading-none">⟶</span>
          </div>
          <div
            className="rounded-xl border-2 border-dashed px-4 py-3 text-center"
            style={{ borderColor: p.harnessInHarness ? ACCENT : 'var(--color-ink-soft)' }}
          >
            <div className="text-xs font-bold text-ink">{p.name}</div>
            <div className="mt-0.5 font-mono text-[10px] text-ink-soft">
              {p.harnessInHarness ? '另一个完整 harness' : 'provider'}
            </div>
          </div>
        </div>

        {/* facts */}
        <dl className="flex flex-col gap-2.5">
          {(
            [
              ['隔离程度', p.isolation],
              ['通信方式', p.channel],
              ['典型用途', p.useCase],
            ] as const
          ).map(([k, v]) => (
            <div key={k} className="rounded-lg border border-line bg-white px-3.5 py-2.5">
              <dt className="text-xs font-semibold tracking-wider text-ink-soft">{k}</dt>
              <dd className="mt-1 text-sm leading-6 text-ink">{v}</dd>
            </div>
          ))}
          {p.harnessInHarness && (
            <p
              className="rounded-lg px-3.5 py-2.5 text-xs leading-6"
              style={{
                background: 'color-mix(in srgb, var(--color-dsh) 8%, white)',
                color: 'var(--color-ink-soft)',
              }}
            >
              ★ 因为子智能体只是一个 provider 接口，而 Codex / Claude Code 恰好也实现了这个接口——
              对 dsh 来说，调度另一个 harness 和调度一个进程内帮手，没有本质区别。
            </p>
          )}
        </dl>
      </div>
    </Figure>
  )
}
