import { useState } from 'react'
import { Figure } from './ui'
import { DIMENSIONS, HARNESSES } from '../data/compare'

/** Six-dimension × three-harness table; clicking a row highlights that row in all three columns. */
export default function DimensionCompare() {
  const [sel, setSel] = useState(0)
  const dim = DIMENSIONS[sel]

  return (
    <Figure caption="六个维度 × 三个 harness。点击任意一行，三栏联动高亮，下方给出这一维度的解读。">
      <div className="scroll-thin overflow-x-auto">
        <table className="w-full min-w-[680px] border-collapse text-left text-sm">
          <thead>
            <tr>
              <th className="w-24 px-4 py-3 text-xs font-semibold tracking-wider text-ink-soft uppercase">
                维度
              </th>
              {HARNESSES.map((h) => (
                <th key={h.key} className="px-4 py-3">
                  <span className="flex items-center gap-2">
                    <span
                      className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ background: h.color }}
                    />
                    <span className="font-semibold" style={{ color: h.color }}>
                      {h.name}
                    </span>
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DIMENSIONS.map((d, i) => {
              const on = i === sel
              return (
                <tr
                  key={d.key}
                  onClick={() => setSel(i)}
                  className="cursor-pointer border-t border-line"
                >
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className="mr-2 font-mono text-[11px] text-ink-soft">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className={on ? 'font-semibold text-ink' : 'text-ink-soft'}>
                      {d.label}
                    </span>
                  </td>
                  {HARNESSES.map((h) => (
                    <td
                      key={h.key}
                      className="px-4 py-3.5 leading-6 text-ink transition-all duration-200"
                      style={
                        on
                          ? {
                              background: `color-mix(in srgb, ${h.color} 9%, white)`,
                              boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${h.color} 45%, transparent)`,
                            }
                          : undefined
                      }
                    >
                      {d.cells[h.key]}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="border-t border-line bg-paper px-5 py-4">
        <p className="text-xs font-semibold tracking-wider text-ink-soft uppercase">
          为什么「{dim.label}」重要
        </p>
        <p className="mt-1.5 text-sm leading-7 text-ink">{dim.why}</p>
      </div>
    </Figure>
  )
}
