import { Callout, CodeBlock, Split } from './ui'

const ACCENT = 'var(--color-pi)'

const REVIEW_TEMPLATE = `---
description: 审阅当前分支的改动
---

运行 \`git diff main...HEAD\`，审阅这次改动：

- 是否有明显的 bug 或遗漏的边界情况
- 命名与风格是否与周边代码一致
- 按严重度排序，给出修改建议`

export default function PiExtensions() {
  return (
    <Split stageFirst stage={<CodeBlock code={REVIEW_TEMPLATE} caption="一个命令模板就是普通 markdown 文件：frontmatter 写描述，正文写 prompt。" hlLines={[1, 2, 3]} />}>
      <div className="prose-cn text-[15px] text-ink">
        <p>
          pi 的扩展机制里没有 MCP。想加一个「命令」？写一个 markdown 文件。左边这个
          <code className="mx-1 font-mono text-[13px]">review.md</code>
          放进指令目录后，就变成可调用的 <code className="mx-1 font-mono text-[13px]">/review</code>
          ——模板正文会被展开成一条普通 prompt，没有任何特殊协议。
        </p>
        <p>
          想要更强的能力？写一个外部 CLI 工具。默认工具里的{' '}
          <code className="mx-1 font-mono text-[13px]">bash</code> 天然能调用任何命令行程序，
          所以你的工具不需要实现某套协议、不需要常驻进程，能被 shell 调用就够了。
        </p>
        <Callout accent={ACCENT}>
          <strong>为什么不用 MCP：</strong>MCP 意味着一套协议、服务器生命周期、握手与能力协商。
          pi 的信条是 <em>"if I don't need it, it won't be built"</em>——
          外部 CLI 工具加一个 markdown 模板已经覆盖了它的扩展需求，于是 MCP 根本没有被造出来。
        </Callout>
      </div>
    </Split>
  )
}
