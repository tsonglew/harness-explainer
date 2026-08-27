import { useState } from 'react'

type Sub = {
  key: string
  label: string
  en: string
  color: string
  x: number
  y: number
  desc: string
}

const SUBS: Sub[] = [
  {
    key: 'session',
    label: '会话 / 上下文',
    en: 'Session & Context',
    color: '#8b5cf6',
    x: 90,
    y: 60,
    desc: '记住发生过什么。决定哪些历史被拼进 prompt、何时触发压缩摘要、会话如何持久化与分支。',
  },
  {
    key: 'tools',
    label: '工具',
    en: 'Tools',
    color: '#f59e0b',
    x: 470,
    y: 60,
    desc: '智能体的「手」。定义有哪些能力（读文件、跑命令、搜索）、如何注册、如何被执行管线调用。',
  },
  {
    key: 'gate',
    label: '沙箱 / 审批',
    en: 'Sandbox & Approval',
    color: '#ef4444',
    x: 90,
    y: 300,
    desc: '权力的边界。工具真正执行前要过的关卡：自动放行、询问人类，还是直接拒绝；以及在哪里隔离执行。',
  },
  {
    key: 'iface',
    label: '接口 / 协议',
    en: 'Interface & Protocol',
    color: '#14b8a6',
    x: 470,
    y: 300,
    desc: 'harness 对外的样子。是命令行、终端 UI、网页，还是一套 JSON-RPC，供别的程序把整个智能体嵌进去。',
  },
]

export default function SubsystemMap() {
  const [sel, setSel] = useState<string>('session')
  const active = SUBS.find((s) => s.key === sel)!

  const CX = 280
  const CY = 180

  return (
    <div>
      <svg viewBox="0 0 560 360" className="w-full">
        {/* connectors */}
        {SUBS.map((s) => (
          <line
            key={'ln' + s.key}
            x1={CX}
            y1={CY}
            x2={s.x}
            y2={s.y}
            stroke={sel === s.key ? s.color : 'var(--color-line)'}
            strokeWidth={sel === s.key ? 3 : 1.5}
            className={sel === s.key ? 'animate-dash' : undefined}
          />
        ))}
        {/* center */}
        <g>
          <circle cx={CX} cy={CY} r={64} fill="var(--color-basics)" />
          <text x={CX} y={CY - 4} textAnchor="middle" fontSize="17" fontWeight="700" fill="white">
            Agent Loop
          </text>
          <text x={CX} y={CY + 16} textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.85)">
            中央引擎
          </text>
        </g>
        {/* satellites */}
        {SUBS.map((s) => {
          const on = sel === s.key
          return (
            <g key={s.key} onClick={() => setSel(s.key)} style={{ cursor: 'pointer' }}>
              <circle
                cx={s.x}
                cy={s.y}
                r={on ? 46 : 40}
                fill={on ? s.color : 'white'}
                stroke={s.color}
                strokeWidth="2.5"
                style={{ transition: 'all .3s ease' }}
              />
              <text x={s.x} y={s.y - 2} textAnchor="middle" fontSize="13" fontWeight="700" fill={on ? 'white' : s.color}>
                {s.label}
              </text>
              <text x={s.x} y={s.y + 15} textAnchor="middle" fontSize="9.5" fill={on ? 'rgba(255,255,255,.8)' : 'var(--color-ink-soft)'}>
                {s.en}
              </text>
            </g>
          )
        })}
      </svg>

      <div
        className="mt-3 rounded-xl border p-4 text-sm leading-7"
        style={{
          borderColor: `color-mix(in srgb, ${active.color} 40%, transparent)`,
          background: `color-mix(in srgb, ${active.color} 7%, white)`,
        }}
      >
        <span className="font-bold" style={{ color: active.color }}>
          {active.label}
        </span>
        <span className="ml-2 font-mono text-xs text-ink-soft">{active.en}</span>
        <p className="mt-1 text-ink">{active.desc}</p>
      </div>
    </div>
  )
}
