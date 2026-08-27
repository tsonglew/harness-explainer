// Shared vocabulary for the generic agent loop, reused across chapters.

export const LOOP_COLORS = {
  user: '#7c3aed',
  prompt: '#8b5cf6',
  model: '#0ea5e9',
  toolcall: '#f59e0b',
  gate: '#ef4444',
  exec: '#22c55e',
  result: '#14b8a6',
  final: '#16181d',
} as const

export type LoopPhaseKey = keyof typeof LOOP_COLORS

export const LOOP_PHASES: { key: LoopPhaseKey; label: string; sub: string }[] = [
  { key: 'user', label: '用户输入', sub: 'user message' },
  { key: 'prompt', label: '组装 Prompt', sub: 'system + 历史 + 工具定义' },
  { key: 'model', label: '模型调用', sub: '流式生成' },
  { key: 'toolcall', label: '工具调用', sub: 'tool_call' },
  { key: 'gate', label: '沙箱 / 审批', sub: 'policy check' },
  { key: 'exec', label: '工具执行', sub: 'run in sandbox' },
  { key: 'result', label: '结果写回', sub: 'tool_result → context' },
]

export const CHAPTER_COLORS = {
  basics: 'var(--color-basics)',
  dsh: 'var(--color-dsh)',
  pi: 'var(--color-pi)',
  codex: 'var(--color-codex)',
} as const
