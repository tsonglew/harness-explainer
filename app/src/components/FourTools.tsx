import { useState } from 'react'
import { CodeBlock, Figure, Segmented } from './ui'

const ACCENT = 'var(--color-pi)'

type ToolId = 'read' | 'write' | 'edit' | 'bash'

interface Tool {
  id: ToolId
  desc: string
  input: string
  output: string
  inputCaption: string
  outputCaption: string
}

const TOOLS: Tool[] = [
  {
    id: 'read',
    desc: '读取文件内容。模型看世界主要靠它——先 read，再决定做什么。',
    input: 'read({\n  path: "src/config.ts"\n})',
    output: 'export const TIMEOUT_MS = 10_000\nexport const RETRIES = 3\n…',
    inputCaption: '调用：一个路径参数。',
    outputCaption: '输出：文件内容原样回到上下文。',
  },
  {
    id: 'write',
    desc: '整体写入：创建新文件，或完全覆盖旧文件。计划、笔记这类产物就写成普通文件。',
    input: 'write({\n  path: "notes/plan.md",\n  content: "# 计划\\n1. 读配置\\n2. 改超时\\n3. 跑测试"\n})',
    output: '✓ 已写入 notes/plan.md',
    inputCaption: '调用：路径 + 完整内容。',
    outputCaption: '输出：一句确认。计划落在普通文件里，不在隐藏状态里。',
  },
  {
    id: 'edit',
    desc: '精确文本替换：给出 old_string 和 new_string，把文件里唯一命中的那段原文换掉。不是模糊编辑——old_string 匹配不到或不唯一，就直接拒绝执行。精确性是这个工具的设计前提。',
    input: 'edit({\n  path: "src/config.ts",\n  old_string: "TIMEOUT_MS = 10_000",\n  new_string: "TIMEOUT_MS = 30_000"\n})',
    output: '✓ src/config.ts：1 处替换',
    inputCaption: '调用：old_string 必须在文件里唯一命中。',
    outputCaption: '输出：替换了几处，一目了然。',
  },
  {
    id: 'bash',
    desc: '跑 shell 命令。构建、测试、git——以及任何外部 CLI 工具，都经由此进出。它是 pi 扩展机制的底座。',
    input: 'bash({\n  command: "pnpm test"\n})',
    output: '✓ 24 passed, 0 failed\n(exit 0)',
    inputCaption: '调用：一条命令字符串。',
    outputCaption: '输出：stdout 与退出码。',
  },
]

export default function FourTools() {
  const [tool, setTool] = useState<ToolId>('edit')
  const t = TOOLS.find((x) => x.id === tool)!

  return (
    <Figure caption="pi 默认只给模型四个工具：read / write / edit / bash（另有可选的受限搜索与列目录）。点 tab 切换，看看每个工具的输入输出长什么样。">
      <div className="border-b border-line bg-paper px-5 py-4">
        <Segmented
          value={tool}
          onChange={setTool}
          accent={ACCENT}
          options={TOOLS.map((x) => ({ value: x.id, label: x.id }))}
        />
      </div>
      <div className="px-5 py-5">
        <p className="text-sm leading-7 text-ink">
          <code className="mr-1 font-mono font-bold" style={{ color: ACCENT }}>
            {t.id}
          </code>
          — {t.desc}
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <CodeBlock code={t.input} caption={t.inputCaption} hlLines={t.id === 'edit' ? [3, 4] : undefined} />
          <CodeBlock code={t.output} caption={t.outputCaption} />
        </div>
      </div>
    </Figure>
  )
}
