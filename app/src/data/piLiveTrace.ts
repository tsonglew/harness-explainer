// Script data for the Pi live demo: a simulated pi agent run.
// Each turn = streamed model text + optional tool call + tool result.
// When a turn's tool is switched off, `degradedChunks` replaces the turn:
// the model states it cannot proceed and the run ends there.

export type ToolId = 'read' | 'write' | 'edit' | 'bash'

export const TOOL_ORDER: ToolId[] = ['read', 'write', 'edit', 'bash']

export const TOOL_COLORS: Record<ToolId, string> = {
  read: '#0ea5e9',
  write: '#8b5cf6',
  edit: '#d97706',
  bash: '#22c55e',
}

export interface LiveTurn {
  id: string
  /** Model reply text, streamed in slices. */
  chunks: string[]
  toolCall?: {
    tool: ToolId
    args: string
    /** Validation note shown on the tool-call card. */
    note: string
  }
  toolResult?: string
  /** Fallback reply used when this turn's tool is disabled. Ends the run. */
  degradedChunks?: string[]
}

export const LIVE_TASK = '把 src/config.ts 里的超时从 10s 改成 30s，然后跑一遍测试。'

export const LIVE_TURNS: LiveTurn[] = [
  {
    id: 't1',
    chunks: ['先读一下配置文件，', '确认超时现在是怎么定义的。'],
    toolCall: {
      tool: 'read',
      args: 'read({ path: "src/config.ts" })',
      note: '参数符合 schema → 直接执行（没有审批关卡）',
    },
    toolResult: 'export const TIMEOUT_MS = 10_000\nexport const RETRIES = 3\n…',
    degradedChunks: ['read 工具已被关闭，我无法查看文件内容。', '这个任务只能到此为止。'],
  },
  {
    id: 't2',
    chunks: ['找到 TIMEOUT_MS = 10_000 了，', '用 edit 做精确文本替换。'],
    toolCall: {
      tool: 'edit',
      args: 'edit({\n  path: "src/config.ts",\n  old_string: "TIMEOUT_MS = 10_000",\n  new_string: "TIMEOUT_MS = 30_000"\n})',
      note: 'old_string 在文件中唯一命中 → 执行',
    },
    toolResult: '✓ src/config.ts：1 处替换',
    degradedChunks: ['edit 工具已被关闭，我无法修改文件。', '只能告诉你该怎么改，改不了。'],
  },
  {
    id: 't3',
    chunks: ['改完了，', '跑一遍测试验证。'],
    toolCall: {
      tool: 'bash',
      args: 'bash({ command: "pnpm test" })',
      note: '参数符合 schema → 直接执行',
    },
    toolResult: '✓ 24 passed, 0 failed (exit 0)',
    degradedChunks: ['bash 工具已被关闭，我无法运行测试。', '改动是否有效，没法验证了。'],
  },
]

/** Final answer turn: no tool_call, so the loop terminates. */
export const LIVE_FINAL = {
  chunks: ['已把 TIMEOUT_MS 从 10_000 改为 30_000，', '24 个测试全部通过。', '（本轮回复不带 tool_call → 循环终止）'],
}

/** System prompt line for the messages panel; reflects the enabled tools. */
export function systemMessage(enabled: ToolId[]): string {
  const tools = enabled.length > 0 ? enabled.join(' / ') : '（无）'
  return `你是 pi，一个 minimal coding agent。可用工具：${tools}。`
}
