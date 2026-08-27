import { LOOP_COLORS, type LoopPhaseKey } from './loop'

export type FrameKind = 'text' | 'code' | 'json'

export interface Frame {
  phase: LoopPhaseKey
  title: string
  body: string
  kind: FrameKind
  tokens: number // cumulative context tokens AFTER this step
  note?: string
  back?: boolean // does the loop jump back to an earlier node here
}

const BASE_PROMPT = 940 // system prompt + tool definitions (static overhead)
const D_MODEL = 80
const D_CALL = 30
const D_RESULT = 260

export function buildTrace(opts: {
  task: string
  policy: 'auto' | 'ask'
  iterations: number
  window: number
}): Frame[] {
  const { task, policy, iterations, window } = opts
  const frames: Frame[] = []
  let tokens = BASE_PROMPT

  const push = (f: Omit<Frame, 'tokens'>, delta = 0) => {
    tokens += delta
    frames.push({ ...f, tokens })
  }

  push({
    phase: 'user',
    title: '用户输入',
    body: task,
    kind: 'text',
    note: '用户消息被追加到会话。此时上下文里已常驻系统提示与工具定义。',
  }, 40)

  const maybeCompact = () => {
    if (tokens > window * 0.82) {
      push({
        phase: 'prompt',
        title: '上下文压缩 (compaction)',
        body:
          '// 上下文逼近上限，harness 触发压缩：\n' +
          '// 把较早的对话与工具结果摘要成一段更短的总结，\n' +
          '// 保留关键决策，丢弃细节。\n' +
          'summary = compress(history)\n' +
          `tokens: ${tokens} → ${Math.round(window * 0.3)}`,
        kind: 'code',
        note: '没有这一步，上下文会溢出、模型会开始「失忆」。',
        back: true,
      })
      tokens = Math.round(window * 0.3)
    }
  }

  const toolScripts: { call: string; result: string }[] = [
    {
      call: 'shell: ls logs/',
      result: 'app.log\nerror.log\naccess.log',
    },
    {
      call: 'write_file: count_errors.py',
      result: '✓ 已写入 count_errors.py (23 行)',
    },
    {
      call: 'shell: python count_errors.py',
      result: 'ERROR count: 142',
    },
  ]

  for (let i = 0; i < iterations; i++) {
    const script = toolScripts[i % toolScripts.length]

    push({
      phase: 'prompt',
      title: '组装 Prompt',
      body:
        'messages = [\n' +
        '  { role: "system",    content: SYSTEM_PROMPT },\n' +
        '  ...history,\n' +
        '  { role: "user",      content: <用户输入> },\n' +
        ']\n' +
        'tools = [shell, read, write, edit]  // 工具定义一并附上',
      kind: 'code',
      note: '每一轮都重新拼装：系统提示 + 全部历史 + 工具 schema。',
    })

    push({
      phase: 'model',
      title: `模型调用 #${i + 1}`,
      body:
        i === 0
          ? `（流式生成）\n我先看看日志目录里有什么，再决定怎么统计。\n→ 决定调用工具：${script.call}`
          : `（流式生成）\n${i + 1 === iterations ? '任务接近完成，整理最终答案。' : '继续推进，调用：' + script.call}`,
      kind: 'text',
      note: '模型不直接执行任何事，只输出一段「我要调用某工具」的结构化文本。',
    }, D_MODEL)

    push({
      phase: 'toolcall',
      title: `工具调用 #${i + 1}`,
      body: script.call,
      kind: 'code',
      note: 'harness 解析出 tool_call，准备执行——但先过一道「关卡」。',
    }, D_CALL)

    if (policy === 'ask') {
      push({
        phase: 'gate',
        title: `审批关卡 #${i + 1}`,
        body:
          '⚠ 即将执行：' + script.call + '\n\n' +
          '  [ 允许一次 ]  [ 始终允许 ]  [ 拒绝 ]\n',
        kind: 'text',
        note: '策略为「每次询问」时，循环在此暂停，等待人类点击。',
      })
    } else {
      push({
        phase: 'gate',
        title: `沙箱检查 #${i + 1}`,
        body: '✓ 沙箱策略自动放行（无需人工确认）',
        kind: 'text',
        note: '策略为「自动」时，关卡瞬间通过，循环不停。',
      })
    }

    push({
      phase: 'exec',
      title: `工具执行 #${i + 1}`,
      body: '$ ' + script.call.split(':')[0] + ' …\n\n' + script.result,
      kind: 'code',
      note: '真正的副作用发生在这里：读文件、跑命令、写代码。',
    })

    maybeCompact()

    push({
      phase: 'result',
      title: `结果写回 #${i + 1}`,
      body: script.result + '\n\n→ 作为 tool_result 追加进会话历史',
      kind: 'text',
      note: '结果成为上下文的一部分，下一轮模型就能「看见」它。',
      back: true,
    }, D_RESULT)
  }

  push({
    phase: 'final',
    title: '输出最终回答',
    body:
      '统计完成：日志里共出现 142 次 ERROR。\n' +
      '我已写好 count_errors.py，你可以随时复跑。\n' +
      '\n（模型本轮没有再请求工具 → 循环终止）',
    kind: 'text',
    note: '循环的退出条件很简单：模型不再发出任何 tool_call。',
  }, D_MODEL)

  return frames
}

export const FRAME_COLOR = (phase: LoopPhaseKey) => LOOP_COLORS[phase]
