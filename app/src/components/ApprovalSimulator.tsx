import { useState } from 'react'
import { Figure, Segmented } from './ui'

const ACCENT = 'var(--color-codex)'
const RED = '#ef4444'
const AMBER = '#d97706'

type Policy = 'auto' | 'ask' | 'deny'
type Decision = 'allow' | 'deny' | null

const TOOL_CALL = 'shell: rm -rf ./build && npm run build'

const POLICY_META: Record<Policy, { label: string; desc: string }> = {
  auto: { label: '自动放行', desc: 'trusted 环境：工具调用不中断，直接进沙箱执行。' },
  ask: { label: '询问', desc: 'on-request：harness 拦住调用，反向请求客户端，由人决定。' },
  deny: { label: '拒绝', desc: '只读 / 锁定策略：执行被直接拒绝，模型收到一个错误。' },
}

function FlowNode({
  title,
  sub,
  color,
  active = true,
}: {
  title: string
  sub?: string
  color: string
  active?: boolean
}) {
  return (
    <div
      className="rounded-xl border px-3.5 py-2.5 transition-all duration-300"
      style={{
        borderColor: active ? color : 'var(--color-line)',
        background: active ? `color-mix(in srgb, ${color} 8%, white)` : 'white',
        opacity: active ? 1 : 0.5,
      }}
    >
      <p className="font-mono text-[12px] font-semibold break-all text-ink">{title}</p>
      {sub && <p className="mt-0.5 text-[11px] leading-5 text-ink-soft">{sub}</p>}
    </div>
  )
}

function Arrow({ label, color = 'var(--color-ink-soft)' }: { label?: string; color?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-0.5 text-xs" style={{ color }}>
      <span>↓</span>
      {label && <span className="text-[11px]">{label}</span>}
    </div>
  )
}

/** The same tool call under three approval policies. */
export default function ApprovalSimulator() {
  const [policy, setPolicy] = useState<Policy>('ask')
  const [decision, setDecision] = useState<Decision>(null)

  const changePolicy = (p: Policy) => {
    setPolicy(p)
    setDecision(null)
  }

  // Resolve the final outcome for the current policy + user decision.
  const outcome: { label: string; color: string; desc: string } | null =
    policy === 'auto'
      ? { label: '✓ 已执行（exit 0）', color: ACCENT, desc: '命令在沙箱里运行，输出写回会话。模型继续。' }
      : policy === 'deny'
        ? {
            label: '✗ 已拒绝',
            color: RED,
            desc: '执行从未发生。模型收到的是一条错误结果，只能换个思路——比如改用不删目录的增量构建。',
          }
        : decision === 'allow'
          ? { label: '✓ 用户允许 → 已执行（exit 0）', color: ACCENT, desc: '审批通过后命令进沙箱执行。决策留痕在会话里。' }
          : decision === 'deny'
            ? {
                label: '✗ 用户拒绝',
                color: RED,
                desc: '模型收到「用户拒绝了这次执行」，通常会解释原因或提出更保守的方案。',
              }
            : null

  return (
    <Figure caption="同一个工具调用，三种审批策略，三种结局。策略由 harness 强制：模型只发出意图，批不批、拦不拦的权力不在它手里。">
      <div className="flex flex-wrap items-center gap-3 border-b border-line bg-paper px-5 py-3">
        <span className="text-xs font-semibold tracking-wider text-ink-soft uppercase">审批策略</span>
        <Segmented<Policy>
          value={policy}
          onChange={changePolicy}
          accent={ACCENT}
          options={[
            { value: 'auto', label: '自动放行' },
            { value: 'ask', label: '询问' },
            { value: 'deny', label: '拒绝' },
          ]}
        />
        <span className="text-xs text-ink-soft">{POLICY_META[policy].desc}</span>
      </div>

      <div className="mx-auto flex max-w-xl flex-col gap-1 px-5 py-5">
        <FlowNode title={`tool_call: ${TOOL_CALL}`} sub="模型发出的只是「意图」——一个结构化的工具调用请求" color="#0ea5e9" />
        <Arrow label="harness 拦截：对照审批策略与沙箱规则" color={AMBER} />
        <FlowNode
          title={`策略关卡 · ${POLICY_META[policy].label}`}
          sub={policy === 'ask' ? '执行被挂起，等待客户端的审批响应' : '无需人参与，策略直接给出结论'}
          color={AMBER}
        />

        {policy === 'ask' && (
          <>
            <Arrow label="server → client：requestApproval（就是侦听器里的第 8 帧）" color={AMBER} />
            <div className="flex justify-center gap-3 rounded-xl border border-dashed px-4 py-3" style={{ borderColor: AMBER }}>
              <span className="self-center text-xs text-ink-soft">客户端弹窗：允许这条命令吗？</span>
              <button
                onClick={() => setDecision('allow')}
                className="rounded-full px-4 py-1.5 text-xs font-semibold text-white transition active:scale-95"
                style={{ background: decision === 'allow' ? ACCENT : '#9ca3af' }}
              >
                允许
              </button>
              <button
                onClick={() => setDecision('deny')}
                className="rounded-full px-4 py-1.5 text-xs font-semibold text-white transition active:scale-95"
                style={{ background: decision === 'deny' ? RED : '#9ca3af' }}
              >
                拒绝
              </button>
            </div>
          </>
        )}

        <Arrow />
        {outcome ? (
          <FlowNode title={outcome.label} sub={outcome.desc} color={outcome.color} />
        ) : (
          <FlowNode title="… 等待你的决定" sub="在审批响应回来之前，这条命令不会触碰文件系统" color="var(--color-line)" active={false} />
        )}
      </div>

      <div className="border-t border-line bg-paper px-5 py-3 text-xs leading-6 text-ink-soft">
        注意不变量：无论哪种策略，模型拿到的都只是<em>结果</em>（执行输出或拒绝错误）。「能不能跑」从来不是模型回答的问题。
      </div>
    </Figure>
  )
}
