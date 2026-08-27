import { useState } from 'react'
import { Figure } from './ui'

const ACCENT = 'var(--color-pi)'

interface Layer {
  name: string
  role: string
  duties: string[]
}

/** Top → bottom: the CLI the user touches down to the model layer. */
const LAYERS: Layer[] = [
  {
    name: 'pi-coding-agent',
    role: 'CLI · 你直接接触的一层',
    duties: ['会话保存', '重启 / 分支', '指令文件', '主题', '命令模板', '导出', '非交互模式', '用量统计'],
  },
  {
    name: 'pi-tui',
    role: '终端 UI',
    duties: ['组件树', '缓存渲染行', '只重绘变化的行', '缓冲更新防闪烁'],
  },
  {
    name: 'pi-agent-core',
    role: 'agent 循环',
    duties: ['用户输入 → 模型回复 → 工具校验 → 工具结果', '循环直到模型不再要工具', '队列输入与附件', '直连 / 代理执行'],
  },
  {
    name: 'pi-ai',
    role: '模型层',
    duties: ['流式输出', 'schema 校验的工具调用', '推理输出', '跨 provider 上下文迁移', '用量记账'],
  },
]

export default function LayerStack() {
  const [open, setOpen] = useState(2) // pi-agent-core expanded by default

  return (
    <Figure caption="pi 的 monorepo 四层：顶层是你打交道的 CLI，底层是模型层，每层只依赖自己下面那一层。点击任意一层展开它的职责清单——注意每张清单都很短。">
      <div className="px-5 py-5">
        <div className="mb-3 flex items-center justify-between text-xs text-ink-soft">
          <span>↑ 用户在这里</span>
          <span>模型在这里 ↓</span>
        </div>
        <ol className="flex flex-col gap-1.5">
          {LAYERS.map((layer, i) => {
            const on = i === open
            return (
              <li key={layer.name}>
                <button
                  onClick={() => setOpen(on ? -1 : i)}
                  className="flex w-full items-center gap-3 rounded-lg border px-4 py-2 text-left transition-all duration-200"
                  style={{
                    borderColor: on ? ACCENT : 'var(--color-line)',
                    background: on ? `color-mix(in srgb, ${ACCENT} 7%, white)` : 'white',
                  }}
                >
                  <code
                    className="font-mono text-[13px] font-bold"
                    style={{ color: on ? ACCENT : 'var(--color-ink)' }}
                  >
                    {layer.name}
                  </code>
                  <span className="ml-auto text-xs text-ink-soft">{layer.role}</span>
                  <span
                    className="text-xs transition-transform duration-200"
                    style={{ color: ACCENT, transform: on ? 'rotate(90deg)' : undefined }}
                  >
                    ▸
                  </span>
                </button>
                {on && (
                  <ul className="mt-1.5 flex flex-wrap gap-1.5 rounded-lg border border-line bg-paper px-3 py-2.5">
                    {layer.duties.map((d) => (
                      <li
                        key={d}
                        className="rounded-full border border-line bg-white px-2.5 py-1 text-xs text-ink"
                      >
                        {d}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            )
          })}
        </ol>
        <p className="mt-4 text-xs leading-6 text-ink-soft">
          四层就是全部。而且整个栈的默认工具只有四个：
          <code className="mx-0.5 font-mono text-[12px] text-ink">read</code>/
          <code className="mx-0.5 font-mono text-[12px] text-ink">write</code>/
          <code className="mx-0.5 font-mono text-[12px] text-ink">edit</code>/
          <code className="mx-0.5 font-mono text-[12px] text-ink">bash</code>。
        </p>
      </div>
    </Figure>
  )
}
