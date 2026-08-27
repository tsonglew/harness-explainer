import { useEffect, useMemo, useState } from 'react'

export type LoopNode = {
  label: string
  sub?: string
  color: string
}

/**
 * A circular agent-loop diagram. A "token" orbits the ring, lighting each node
 * in sequence to convey "this is a loop, not a straight line".
 */
export function LoopRing({
  nodes,
  size = 460,
  autoMs = 1400,
  centerTitle = 'agent loop',
  centerSub = '直到模型不再调用工具',
}: {
  nodes: LoopNode[]
  size?: number
  autoMs?: number
  centerTitle?: string
  centerSub?: string
}) {
  const [active, setActive] = useState(0)
  const n = nodes.length

  useEffect(() => {
    const t = window.setInterval(() => setActive((a) => (a + 1) % n), autoMs)
    return () => window.clearInterval(t)
  }, [n, autoMs])

  const cx = size / 2
  const cy = size / 2
  const R = size / 2 - 88

  const pos = useMemo(
    () =>
      nodes.map((_, i) => {
        const ang = (i / n) * Math.PI * 2 - Math.PI / 2
        return { x: cx + R * Math.cos(ang), y: cy + R * Math.sin(ang), ang }
      }),
    [n, cx, cy, R, nodes],
  )

  const arc = (a0: number, a1: number) => {
    const x0 = cx + R * Math.cos(a0)
    const y0 = cy + R * Math.sin(a0)
    const x1 = cx + R * Math.cos(a1)
    const y1 = cy + R * Math.sin(a1)
    return `M ${x0} ${y0} A ${R} ${R} 0 0 1 ${x1} ${y1}`
  }

  return (
    <svg width="100%" viewBox={`0 0 ${size} ${size}`} role="img" aria-label={centerTitle} style={{ maxWidth: size }}>
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="var(--color-line)" strokeWidth="2" />
      {/* hot arc: from previous node to active node, plus fading trail */}
      {pos.map((p, i) => {
        const prevIdx = (i - 1 + n) % n
        const isHot = i === active
        const isTrail = i === (active - 1 + n) % n
        return (
          <path
            key={'seg' + i}
            d={arc(pos[prevIdx].ang, p.ang)}
            fill="none"
            stroke={nodes[i].color}
            strokeWidth={isHot ? 4 : 2.5}
            opacity={isHot ? 0.95 : isTrail ? 0.35 : 0.08}
            strokeLinecap="round"
            className={isHot ? 'animate-dash' : undefined}
            style={{ transition: 'opacity .4s ease' }}
          />
        )
      })}
      <text x={cx} y={cy - 10} textAnchor="middle" fontSize="21" fontWeight="700" fill="var(--color-ink)">
        {centerTitle}
      </text>
      <text x={cx} y={cy + 16} textAnchor="middle" fontSize="12.5" fill="var(--color-ink-soft)">
        {centerSub}
      </text>
      {pos.map((p, i) => {
        const node = nodes[i]
        const isHot = i === active
        const cos = Math.cos(p.ang)
        const sin = Math.sin(p.ang)
        let anchor: 'start' | 'end' | 'middle' = cos > 0.35 ? 'start' : cos < -0.35 ? 'end' : 'middle'
        const lx = anchor === 'start' ? p.x + 24 : anchor === 'end' ? p.x - 24 : p.x
        // top node: stack sub ABOVE label; bottom node: stack below; sides: beside
        const ly = anchor === 'middle' ? (sin < 0 ? p.y - 42 : p.y + 30) : p.y + 4
        const subY = anchor === 'middle' ? (sin < 0 ? p.y - 26 : p.y + 46) : ly + 15
        return (
          <g key={node.label}>
            {isHot && (
              <circle cx={p.x} cy={p.y} r={26} fill="none" stroke={node.color} strokeWidth="1.5" opacity="0.35" className="animate-pulse-soft" />
            )}
            <circle
              cx={p.x}
              cy={p.y}
              r={isHot ? 16 : 12}
              fill={isHot ? node.color : 'white'}
              stroke={node.color}
              strokeWidth="2.5"
              style={{ transition: 'all .4s ease' }}
            />
            <text x={lx} y={ly} textAnchor={anchor} fontSize="13.5" fontWeight={isHot ? 700 : 500} fill={isHot ? node.color : 'var(--color-ink)'}>
              {node.label}
            </text>
            {node.sub && (
              <text x={lx} y={subY} textAnchor={anchor} fontSize="10.5" fill="var(--color-ink-soft)">
                {node.sub}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
