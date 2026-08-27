import { useState } from 'react'
import { Figure } from './ui'
import { THREAD_OPS, THREAD_TREE, type ThreadTreeNode } from '../data/codexTrace'

const ACCENT = 'var(--color-codex)'

const KIND_ICON: Record<ThreadTreeNode['kind'], string> = {
  thread: '▸',
  turn: '↻',
  item: '·',
}

/** Thread → Turn → Item tree; click any node to inspect it. */
export default function ThreadTree() {
  const [sel, setSel] = useState('thr_01')
  const node = THREAD_TREE.find((n) => n.id === sel) ?? THREAD_TREE[0]

  return (
    <Figure caption="会话原语三级：Thread / Turn / Item。thread 可启动、续跑、分支、归档——会话是数据，不是一次性的进程内存。点击任意节点查看详情。">
      {/* lifecycle ops */}
      <div className="flex flex-wrap gap-2 border-b border-line bg-paper px-5 py-3">
        {THREAD_OPS.map((o) => (
          <span
            key={o.op}
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1 text-xs"
            title={o.desc}
          >
            <span className="font-semibold" style={{ color: ACCENT }}>
              {o.op}
            </span>
            <code className="font-mono text-[11px] text-ink-soft">{o.method}</code>
          </span>
        ))}
      </div>

      <div className="grid gap-5 px-5 py-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        {/* tree */}
        <div className="scroll-thin max-h-[420px] overflow-y-auto rounded-xl border border-line bg-white">
          <div className="border-b border-line/60 px-3 py-2 text-xs font-semibold tracking-wider text-ink-soft uppercase">
            工作区 · 3 个 thread
          </div>
          <ol>
            {THREAD_TREE.map((n) => {
              const active = n.id === sel
              return (
                <li key={n.id}>
                  <button
                    onClick={() => setSel(n.id)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left transition"
                    style={{
                      paddingLeft: `${12 + n.depth * 20}px`,
                      background: active ? `color-mix(in srgb, ${ACCENT} 10%, white)` : undefined,
                    }}
                  >
                    <span
                      className="w-4 shrink-0 text-center font-mono text-[11px]"
                      style={{ color: n.kind === 'thread' ? ACCENT : 'var(--color-ink-soft)' }}
                    >
                      {KIND_ICON[n.kind]}
                    </span>
                    <span
                      className={`min-w-0 truncate text-[13px] ${
                        n.kind === 'thread' ? 'font-semibold text-ink' : n.kind === 'turn' ? 'font-medium text-ink' : 'text-ink-soft'
                      }`}
                    >
                      {n.label}
                    </span>
                    {n.meta && (
                      <span
                        className="ml-auto shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap"
                        style={{
                          color: n.metaColor,
                          background: `color-mix(in srgb, ${n.metaColor ?? ACCENT} 12%, white)`,
                        }}
                      >
                        {n.meta}
                      </span>
                    )}
                  </button>
                </li>
              )
            })}
          </ol>
        </div>

        {/* detail panel */}
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="rounded-full px-3 py-1 text-xs font-semibold text-white" style={{ background: ACCENT }}>
              {node.kind}
            </span>
            {node.meta && (
              <span className="text-xs font-semibold" style={{ color: node.metaColor }}>
                {node.meta}
              </span>
            )}
          </div>
          <div className="rounded-xl border border-line bg-paper p-4">
            <p className="font-mono text-[13px] font-semibold text-ink">{node.label}</p>
            <p className="mt-2 text-sm leading-7 text-ink-soft">{node.detail}</p>
          </div>
          <p className="text-xs leading-6 text-ink-soft">
            缩进层级即包含关系：thread 包含若干 turn，turn 包含若干 item——消息、工具调用、工具结果都是 item。
          </p>
        </div>
      </div>
    </Figure>
  )
}
