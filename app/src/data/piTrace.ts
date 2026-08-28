// Flat loop trace for the pi chapter: user → reply → validate → result,
// repeated until the model stops asking for tools. No approval gate,
// no hidden state — the loop is deliberately "thinner" than the generic one.

export type PiPhase = 'user' | 'reply' | 'validate' | 'result' | 'final'

export interface PiFrame {
  phase: PiPhase
  title: string
  body: string
  kind: 'text' | 'code'
  note?: string
  back?: boolean // loop jumps back to the model here
}

export const PI_PHASE_META: Record<PiPhase, { label: string; color: string }> = {
  user: { label: '用户输入', color: '#d97706' },
  reply: { label: '模型回复', color: '#0ea5e9' },
  validate: { label: '工具校验', color: '#f59e0b' },
  result: { label: '工具结果', color: '#22c55e' },
  final: { label: '循环终止', color: '#16181d' },
}

/** Ordered loop nodes rendered as the flat loop diagram (final is the exit). */
export const PI_LOOP_NODES: PiPhase[] = ['user', 'reply', 'validate', 'result']

/** Scroll-step order for the loop narrative: the four nodes plus the exit. */
export const PI_LOOP_STEP_PHASES: PiPhase[] = [...PI_LOOP_NODES, 'final']

export const PI_TRACE: PiFrame[] = [
  {
    phase: 'user',
    title: '用户输入',
    body: '把 src/config.ts 里的超时从 10s 改成 30s，然后跑一遍测试。',
    kind: 'text',
    note: '输入直接进入会话上下文。pi-agent-core 支持队列输入：agent 还在跑，你也能继续追加消息。',
  },
  {
    phase: 'reply',
    title: '模型回复 #1',
    body: '（流式输出）\n先读一下配置文件。\n→ tool_call: read({ path: "src/config.ts" })',
    kind: 'text',
    note: '模型只输出结构化的 tool_call（由 pi-ai 做 schema 校验），执行权在 harness 手里。',
  },
  {
    phase: 'validate',
    title: '工具校验 #1',
    body: 'pi-agent-core 校验参数：\nread({ path: "src/config.ts" })\n✓ 参数符合 schema → 直接执行',
    kind: 'code',
    note: '注意这一步之后什么都没有：没有审批关卡。YOLO by default——校验通过就执行，不停下来问人。',
  },
  {
    phase: 'result',
    title: '工具结果 #1',
    body: 'export const TIMEOUT_MS = 10_000\nexport const RETRIES = 3\n…\n\n→ 作为 tool_result 写回会话',
    kind: 'code',
    note: '结果成为显式上下文的一部分。没有隐藏状态：你看到的历史，就是模型看到的历史。',
    back: true,
  },
  {
    phase: 'reply',
    title: '模型回复 #2',
    body: '（流式输出）\n看到 TIMEOUT_MS = 10_000 了，做精确替换。\n→ tool_call: edit({ … })',
    kind: 'text',
    note: 'edit 是精确文本替换：给出 old_string 与 new_string，不是模糊编辑。',
  },
  {
    phase: 'validate',
    title: '工具校验 #2',
    body: 'edit({\n  path: "src/config.ts",\n  old_string: "TIMEOUT_MS = 10_000",\n  new_string: "TIMEOUT_MS = 30_000"\n})\n✓ old_string 在文件中唯一命中 → 执行',
    kind: 'code',
    note: 'edit 的校验多一条：old_string 必须唯一匹配，否则拒绝执行——精确性靠这条保证。',
  },
  {
    phase: 'result',
    title: '工具结果 #2',
    body: '✓ src/config.ts：1 处替换\n\n→ 作为 tool_result 写回会话',
    kind: 'code',
    note: '循环回到模型。整个循环就是这四个阶段的扁平重复。',
    back: true,
  },
  {
    phase: 'reply',
    title: '模型回复 #3',
    body: '（流式输出）\n改完了，跑测试验证。\n→ tool_call: bash({ command: "pnpm test" })',
    kind: 'text',
    note: 'bash 是第四个也是最后一个默认工具：构建、测试、git，都走它。',
  },
  {
    phase: 'validate',
    title: '工具校验 #3',
    body: 'bash({ command: "pnpm test" })\n✓ 参数符合 schema → 直接执行',
    kind: 'code',
    note: '还是同一道校验，还是直接放行。没有为「危险命令」特设的隐藏审批。',
  },
  {
    phase: 'result',
    title: '工具结果 #3',
    body: '✓ 24 passed, 0 failed (exit 0)\n\n→ 作为 tool_result 写回会话',
    kind: 'code',
    note: '测试通过。结果照例回到显式上下文。',
    back: true,
  },
  {
    phase: 'final',
    title: '循环终止',
    body: '已把 TIMEOUT_MS 从 10_000 改为 30_000，测试全部通过。\n\n（本轮回复不带任何 tool_call → 循环终止）',
    kind: 'text',
    note: '退出条件和通用循环一样朴素：模型不再要工具，循环就停。',
  },
]
