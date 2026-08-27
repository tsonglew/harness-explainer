// Turn/step trace for the dsh chapter: one turn with two steps, each step
// walking the protected tool pipeline pre-execute → execute → post-execute → result.

export type TurnPhase = 'request' | 'tool_call' | 'pre' | 'exec' | 'post' | 'result'

export interface TraceFrame {
  turn: number
  step: number // 1-based step index within the turn
  stepsInTurn: number
  phase: TurnPhase
  title: string
  body: string
  note?: string
}

export const PHASE_META: Record<TurnPhase, { label: string; color: string }> = {
  request: { label: '模型请求', color: '#0ea5e9' },
  tool_call: { label: '工具调用', color: '#f59e0b' },
  pre: { label: 'pre-execute', color: '#ef4444' },
  exec: { label: 'execute', color: '#22c55e' },
  post: { label: 'post-execute', color: '#8b5cf6' },
  result: { label: 'result', color: '#14b8a6' },
}

/** Ordered pipeline stages of one tool call, rendered as the protected path. */
export const PIPELINE: TurnPhase[] = ['pre', 'exec', 'post', 'result']

export const DSH_TRACE: TraceFrame[] = [
  // ---- step 1: read before write ----
  {
    turn: 1,
    step: 1,
    stepsInTurn: 2,
    phase: 'request',
    title: '模型请求',
    body: 'deriveMessages(journal) → messages[]\n+ system prompt + 工具 schema\n→ POST 给模型适配器（llm/llm）',
    note: 'step 的起点：core/session 从事件日志重建模型历史，组装出这一次请求。',
  },
  {
    turn: 1,
    step: 1,
    stepsInTurn: 2,
    phase: 'tool_call',
    title: '模型决定调用工具',
    body: 'read_file({ path: "src/config.ts" })',
    note: '模型只输出结构化的 tool_call，执行权在 harness 手里。',
  },
  {
    turn: 1,
    step: 1,
    stepsInTurn: 2,
    phase: 'pre',
    title: 'pre-execute',
    body: 'core/tools 的受保护路径第一关：\n· 参数 schema 校验\n· 沙箱与审批策略判定\n→ read_file 是只读操作，策略自动放行',
    note: '任何工具都必须先过 pre-execute：校验 + 策略，不过就直接拒绝，execute 不会发生。',
  },
  {
    turn: 1,
    step: 1,
    stepsInTurn: 2,
    phase: 'exec',
    title: 'execute',
    body: '通过 ctx.fs 能力接缝读取文件：\n"export const TIMEOUT_MS = 10_000"',
    note: '工具不直接碰文件系统，而是走 ctx.fs —— 这条接缝可以被整体重定向到远端沙箱。',
  },
  {
    turn: 1,
    step: 1,
    stepsInTurn: 2,
    phase: 'post',
    title: 'post-execute',
    body: '输出截断 / 大小检查 / 遥测打点\n→ 结果合规，包装成 tool_result',
    note: 'post-execute 是结果离开工具前的最后一道加工：裁剪、审计、指标都在这里。',
  },
  {
    turn: 1,
    step: 1,
    stepsInTurn: 2,
    phase: 'result',
    title: 'result',
    body: 'tool_result 追加进不可变事件日志\n→ step 1 完成，循环继续',
    note: '结果先落日志（"Model-visible means logged"），下一个 step 才能被模型看见。',
  },
  // ---- step 2: the actual edit ----
  {
    turn: 1,
    step: 2,
    stepsInTurn: 2,
    phase: 'request',
    title: '模型请求',
    body: 'deriveMessages(journal) → messages[]\n（此时已包含 step 1 的 tool_result）\n→ 再次请求模型',
    note: 'step 之间不存隐藏状态：第二个 step 的历史完全由日志重新派生。',
  },
  {
    turn: 1,
    step: 2,
    stepsInTurn: 2,
    phase: 'tool_call',
    title: '模型决定调用工具',
    body: 'edit_file({ path: "src/config.ts",\n  old: "10_000", new: "30_000" })',
    note: '模型看到了文件内容，决定执行修改。',
  },
  {
    turn: 1,
    step: 2,
    stepsInTurn: 2,
    phase: 'pre',
    title: 'pre-execute',
    body: 'edit_file 是写操作：\n· 参数校验通过\n· 审批策略 = 每次询问\n→ 循环暂停，等待人类点击「允许」',
    note: '同一个管线，不同的策略判定：读操作放行，写操作拦下来问人。',
  },
  {
    turn: 1,
    step: 2,
    stepsInTurn: 2,
    phase: 'exec',
    title: 'execute',
    body: '用户允许后，通过 ctx.fs 写入：\n✓ 已更新 src/config.ts（1 处替换）',
    note: '副作用真正发生在这里——而且在 Cordis 里，副作用被设计成可逆的。',
  },
  {
    turn: 1,
    step: 2,
    stepsInTurn: 2,
    phase: 'post',
    title: 'post-execute',
    body: '记录 diff 摘要 + 遥测\n→ 包装成 tool_result',
    note: '审批决定与执行结果都会作为事件落日志，事后可审计、可回放。',
  },
  {
    turn: 1,
    step: 2,
    stepsInTurn: 2,
    phase: 'result',
    title: 'result',
    body: 'tool_result 落日志。模型下一请求不再带 tool_call\n→ turn 1 结束（turn = 0..n 个 step）',
    note: 'turn 的退出条件：模型不再请求任何工具。这个 turn 恰好用了 2 个 step。',
  },
]
