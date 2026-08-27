// Journal replay data for the dsh chapter: an append-only event log and the
// messages[] that core/session's deriveMessages() projects out of it.

export type JournalKind =
  | 'user_message'
  | 'model_response'
  | 'tool_call'
  | 'approval_decision'
  | 'tool_result'

export interface JournalEvent {
  id: string
  kind: JournalKind
  title: string
  detail: string
  payload: string
}

export type MessageRole = 'system' | 'user' | 'assistant' | 'tool'

export interface Message {
  role: MessageRole
  content: string
}

/** One append-only session: events are never edited, only appended. */
export const JOURNAL: JournalEvent[] = [
  {
    id: 'e1',
    kind: 'user_message',
    title: 'user_message',
    detail: '用户的任务指令进入日志',
    payload: '帮我看看 src/config.ts 里的超时设置，改成 30s',
  },
  {
    id: 'e2',
    kind: 'model_response',
    title: 'model_response',
    detail: '模型的流式输出，逐字也会落日志',
    payload: '我先读一下这个文件，确认现在的超时值。',
  },
  {
    id: 'e3',
    kind: 'tool_call',
    title: 'tool_call',
    detail: '模型请求 read_file',
    payload: 'read_file({ path: "src/config.ts" })',
  },
  {
    id: 'e4',
    kind: 'approval_decision',
    title: 'approval_decision',
    detail: '审批结果：只进日志，不进 messages',
    payload: 'policy=auto → allow（只读操作，策略自动放行）',
  },
  {
    id: 'e5',
    kind: 'tool_result',
    title: 'tool_result',
    detail: '工具输出写回日志',
    payload: 'export const TIMEOUT_MS = 10_000',
  },
  {
    id: 'e6',
    kind: 'model_response',
    title: 'model_response',
    detail: '模型基于结果决定下一步',
    payload: '现在是 10s，我把它改成 30s。',
  },
  {
    id: 'e7',
    kind: 'tool_call',
    title: 'tool_call',
    detail: '模型请求 edit_file',
    payload: 'edit_file({ path: "src/config.ts", old: "10_000", new: "30_000" })',
  },
  {
    id: 'e8',
    kind: 'approval_decision',
    title: 'approval_decision',
    detail: '写操作触发人工审批',
    payload: 'policy=ask → 用户点击「允许一次」',
  },
  {
    id: 'e9',
    kind: 'tool_result',
    title: 'tool_result',
    detail: '修改完成的结果',
    payload: '✓ 已更新 src/config.ts（1 处替换）',
  },
  {
    id: 'e10',
    kind: 'model_response',
    title: 'model_response',
    detail: '最终回答；不再请求工具，turn 结束',
    payload: '已把超时从 10s 改为 30s，改动在 src/config.ts。',
  },
]

const KIND_TO_ROLE: Partial<Record<JournalKind, MessageRole>> = {
  user_message: 'user',
  model_response: 'assistant',
  tool_call: 'assistant',
  tool_result: 'tool',
}

/**
 * Project a (prefix of the) event log into the messages[] sent to the model.
 * The log is the source of truth; messages are a pure, recomputable view.
 * approval_decision is audit-only: logged, but never model-visible.
 */
export function deriveMessages(events: JournalEvent[]): Message[] {
  const messages: Message[] = [
    { role: 'system', content: 'SYSTEM_PROMPT（由 core/system-prompt 组装，每次请求重新拼接）' },
  ]
  for (const e of events) {
    const role = KIND_TO_ROLE[e.kind]
    if (role) messages.push({ role, content: e.payload })
  }
  return messages
}

export const JOURNAL_KIND_COLOR: Record<JournalKind, string> = {
  user_message: '#7c3aed',
  model_response: '#0ea5e9',
  tool_call: '#f59e0b',
  approval_decision: '#ef4444',
  tool_result: '#14b8a6',
}

export const ROLE_LABEL: Record<MessageRole, string> = {
  system: 'system',
  user: 'user',
  assistant: 'assistant',
  tool: 'tool',
}
