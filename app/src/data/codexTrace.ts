// Data for the Codex chapter: a JSON-RPC trace between a client and the
// App Server, the Thread/Turn/Item session tree, and the compaction frames.

/* ---------------- App Server: bidirectional JSON-RPC over stdio ---------------- */

export type RpcMsgKind = 'request' | 'response' | 'notification'

/** Where the frame flows: c2s = client → App Server, s2c = App Server → client. */
export type RpcDir = 'c2s' | 's2c'

/** App Server components a frame can highlight. */
export type RpcComponent = 'client' | 'stdio' | 'processor' | 'threads' | 'core'

export interface RpcFrame {
  kind: RpcMsgKind
  dir: RpcDir
  /** short label, usually the method name */
  title: string
  /** pretty-printed JSON of the raw JSONL frame */
  json: string
  component: RpcComponent
  note: string
}

export const RPC_KIND_META: Record<RpcMsgKind, { label: string; color: string }> = {
  request: { label: '请求 request', color: '#0ea5e9' },
  response: { label: '响应 response', color: '#10a37f' },
  notification: { label: '通知 notification', color: '#d97706' },
}

/** The App Server pipeline, in the order a client request travels. */
export const RPC_COMPONENTS: { id: RpcComponent; label: string; desc: string }[] = [
  { id: 'client', label: 'Client', desc: 'CLI / IDE / 桌面端 / 远端' },
  { id: 'stdio', label: 'Stdio Reader', desc: '按行读写 JSONL 帧' },
  { id: 'processor', label: 'Message Processor', desc: '按 method 路由' },
  { id: 'threads', label: 'Thread Manager', desc: '会话的启动 / 续跑 / 分支 / 归档' },
  { id: 'core', label: 'Core Threads', desc: 'agent loop 实际执行' },
]

export const RPC_FRAMES: RpcFrame[] = [
  {
    kind: 'request',
    dir: 'c2s',
    title: 'initialize',
    json: `{
  "jsonrpc": "2.0",
  "id": 0,
  "method": "initialize",
  "params": {
    "clientInfo": { "name": "codex-cli", "version": "0.42.0" }
  }
}`,
    component: 'stdio',
    note: '每个客户端的第一句话。Stdio Reader 按行读取：stdio 上一条消息就是一行 JSON（JSONL 帧）。',
  },
  {
    kind: 'response',
    dir: 's2c',
    title: 'initialize → result',
    json: `{
  "jsonrpc": "2.0",
  "id": 0,
  "result": {
    "serverInfo": { "name": "codex-app-server" },
    "capabilities": { "threads": true, "approvals": true }
  }
}`,
    component: 'stdio',
    note: '响应带着同一个 id: 0 回来——JSON-RPC 靠 id 把响应配回请求。能力协商完成，连接建立。',
  },
  {
    kind: 'request',
    dir: 'c2s',
    title: 'thread/start',
    json: `{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "thread/start",
  "params": {
    "cwd": "~/work/webapp",
    "approvalPolicy": "on-request",
    "sandbox": "workspace-write"
  }
}`,
    component: 'processor',
    note: 'Message Processor 按 method 路由：thread/* 族的方法交给 Thread Manager。注意审批与沙箱策略是会话参数，由 harness 强制。',
  },
  {
    kind: 'response',
    dir: 's2c',
    title: 'thread/start → threadId',
    json: `{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "thread": { "id": "thr_01", "status": "active" }
  }
}`,
    component: 'threads',
    note: 'Thread Manager 创建会话，返回 thread id。Thread 是最高级的会话原语：可启动、续跑、分支、归档。',
  },
  {
    kind: 'request',
    dir: 'c2s',
    title: 'turn/start',
    json: `{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "turn/start",
  "params": {
    "threadId": "thr_01",
    "input": [
      { "type": "userMessage", "text": "清理构建脚本，跑一遍构建" }
    ]
  }
}`,
    component: 'threads',
    note: '在 thread 里开一轮 turn。用户输入作为一个 item 传入——Thread / Turn / Item 三级原语在这里齐了。',
  },
  {
    kind: 'notification',
    dir: 's2c',
    title: 'turn/started',
    json: `{
  "jsonrpc": "2.0",
  "method": "turn/started",
  "params": { "threadId": "thr_01", "turnId": "turn_1" }
}`,
    component: 'core',
    note: '通知没有 id：它不需要响应，是 server 单向推送的事件流。Core Threads 开始跑 agent loop。',
  },
  {
    kind: 'notification',
    dir: 's2c',
    title: 'item/agentMessage/delta',
    json: `{
  "jsonrpc": "2.0",
  "method": "item/agentMessage/delta",
  "params": {
    "threadId": "thr_01",
    "itemId": "msg_1",
    "delta": "先看一下现在的构建脚本…"
  }
}`,
    component: 'core',
    note: '模型的输出以增量通知流式推回客户端——流式执行是 harness 管的，客户端只管渲染。',
  },
  {
    kind: 'request',
    dir: 's2c',
    title: 'item/tool/call → 请求审批',
    json: `{
  "jsonrpc": "2.0",
  "id": 7,
  "method": "item/tool/requestApproval",
  "params": {
    "threadId": "thr_01",
    "tool": "shell",
    "command": "rm -rf ./build && npm run build"
  }
}`,
    component: 'core',
    note: '注意方向反了：这是 server 发给 client 的请求（id: 7）。模型要执行 shell 命令，harness 按审批策略拦住，反向请求客户端做决定。',
  },
  {
    kind: 'response',
    dir: 'c2s',
    title: '审批结果 → accept',
    json: `{
  "jsonrpc": "2.0",
  "id": 7,
  "result": { "decision": "accept" }
}`,
    component: 'core',
    note: '用户点了「允许」，响应带着同一个 id: 7 回去。怎么询问是客户端 UI 的事；批不批、拦不拦，是 harness 强制的事。',
  },
  {
    kind: 'notification',
    dir: 's2c',
    title: 'item/completed (tool)',
    json: `{
  "jsonrpc": "2.0",
  "method": "item/completed",
  "params": {
    "threadId": "thr_01",
    "item": {
      "type": "commandExecution",
      "command": "rm -rf ./build && npm run build",
      "exitCode": 0
    }
  }
}`,
    component: 'core',
    note: '工具在沙箱里执行完毕，结果作为一个完成的 item 广播出来，同时写回会话上下文。',
  },
  {
    kind: 'notification',
    dir: 's2c',
    title: 'turn/completed',
    json: `{
  "jsonrpc": "2.0",
  "method": "turn/completed",
  "params": {
    "threadId": "thr_01",
    "turnId": "turn_1",
    "status": "completed"
  }
}`,
    component: 'core',
    note: '模型不再要工具，本轮 turn 结束。循环终止条件和通用章一致，只是每一步都变成了协议事件。',
  },
  {
    kind: 'response',
    dir: 's2c',
    title: 'turn/start → result',
    json: `{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "turn": { "id": "turn_1", "status": "completed" }
  }
}`,
    component: 'processor',
    note: '最初那条 turn/start 请求（id: 2）直到现在才拿到最终响应。一个请求可以引出任意多条通知——双向 JSON-RPC 的意义就在这里。',
  },
]

/* ---------------- Thread / Turn / Item session tree ---------------- */

export type ThreadNodeKind = 'thread' | 'turn' | 'item'

export interface ThreadTreeNode {
  id: string
  kind: ThreadNodeKind
  /** indent level: 0 = thread, 1 = turn, 2 = item */
  depth: 0 | 1 | 2
  label: string
  /** small status chip, e.g. 活跃 / 已归档 */
  meta?: string
  metaColor?: string
  detail: string
}

/** The four lifecycle operations a thread supports. */
export const THREAD_OPS = [
  { op: '启动', method: 'thread/start', desc: '开一个新会话' },
  { op: '续跑', method: 'thread/resume', desc: '随时回到旧会话继续' },
  { op: '分支', method: 'thread/fork', desc: '从某个 turn 分出平行线程' },
  { op: '归档', method: 'thread/archive', desc: '退出活跃列表，历史保留' },
] as const

export const THREAD_TREE: ThreadTreeNode[] = [
  {
    id: 'thr_01',
    kind: 'thread',
    depth: 0,
    label: '重构构建脚本',
    meta: '活跃',
    metaColor: '#10a37f',
    detail:
      'thread/start 创建的主会话。thread 是最高级会话原语：它有独立的历史与状态，可以续跑（resume）、分支（fork）、归档（archive）。',
  },
  {
    id: 'thr_01_t1',
    kind: 'turn',
    depth: 1,
    label: 'Turn 1 ·「看看现在怎么构建的」',
    detail:
      '一轮 turn = 一次完整的「用户输入 → agent 循环 → 终止」。turn 之下挂的每一个条目都是 item。',
  },
  {
    id: 'thr_01_t1_i1',
    kind: 'item',
    depth: 2,
    label: 'userMessage：看看现在怎么构建的',
    detail: '用户输入是一个 item。三级原语里最小的一级：会话里发生的一切——消息、工具调用、工具结果——都是 item。',
  },
  {
    id: 'thr_01_t1_i2',
    kind: 'item',
    depth: 2,
    label: 'agentMessage：先读 package.json…',
    detail: '模型的流式回复聚合成一个 agentMessage item，写回会话。',
  },
  {
    id: 'thr_01_t1_i3',
    kind: 'item',
    depth: 2,
    label: 'toolCall：shell cat package.json',
    detail: '工具调用也是 item。它从发起到完成的状态变化，就是你在上面 JSON-RPC 侦听器里看到的通知流。',
  },
  {
    id: 'thr_01_t2',
    kind: 'turn',
    depth: 1,
    label: 'Turn 2 ·「全量重建太慢，换增量的」',
    detail: '第二轮 turn。thr_02 就是从这里分支出去的——fork 以某个 turn 为分叉点，之前的 item 历史被继承。',
  },
  {
    id: 'thr_01_t2_i1',
    kind: 'item',
    depth: 2,
    label: 'userMessage：全量重建太慢，换增量的',
    detail: '续跑不需要新协议：在同一个 thread 里再发一轮 turn/start 就行。',
  },
  {
    id: 'thr_01_t2_i2',
    kind: 'item',
    depth: 2,
    label: 'toolCall：shell rm -rf ./build && npm run build',
    meta: '需审批',
    metaColor: '#d97706',
    detail:
      '这条命令触发了审批策略。harness 把它拦在沙箱外，反向请求客户端批准后才执行——下一节的审批流模拟会拆开这一步。',
  },
  {
    id: 'thr_01_t3',
    kind: 'turn',
    depth: 1,
    label: 'Turn 3 ·「再加上 watch 模式」',
    meta: '进行中',
    metaColor: '#0ea5e9',
    detail: '进行中的 turn。会话还在生长，item 会持续追加到这个 turn 下面。',
  },
  {
    id: 'thr_02',
    kind: 'thread',
    depth: 0,
    label: '方案 B：迁到 tsup',
    meta: '分支自 thr_01 · Turn 2',
    metaColor: '#0ea5e9',
    detail:
      'thread/fork 的产物：从 thr_01 的 Turn 2 分出的平行线程。分叉点之前的历史被继承，之后各走各的——试错不用污染主线程。',
  },
  {
    id: 'thr_02_t1',
    kind: 'turn',
    depth: 1,
    label: 'Turn 1 ·「试试用 tsup 重写出来」',
    detail: '分支线程里的第一轮 turn。它拥有自己的 item 历史，与 thr_01 互不影响。',
  },
  {
    id: 'thr_03',
    kind: 'thread',
    depth: 0,
    label: '旧实验：webpack 迁移',
    meta: '已归档',
    metaColor: '#8a8f98',
    detail:
      'thread/archive 归档的会话：退出活跃列表，但完整历史保留，随时可以 resume 回来。归档不是删除。',
  },
  {
    id: 'thr_03_t1',
    kind: 'turn',
    depth: 1,
    label: 'Turn 1 ·「webpack 4 升 5 要改什么」',
    detail: '归档 thread 里的历史 turn 依然可查阅。会话是数据，不是一次性的进程内存。',
  },
]

/* ---------------- Context compaction frames ---------------- */

export interface CtxSegment {
  label: string
  pct: number
  color: string
}

export interface CompactionFrame {
  title: string
  segments: CtxSegment[]
  note: string
  /** true on the frame where compaction fires */
  compacted?: boolean
}

/** Context window is treated as 100%; compaction fires past this line. */
export const COMPACTION_THRESHOLD = 85

const SYSTEM = { label: '系统指令 + AGENTS.md', color: '#0ea5e9' }
const HISTORY = (n: number) => ({ label: `历史 · Turn ${n}`, color: '#10a37f' })
const SUMMARY = { label: '压缩摘要', color: '#d97706' }

export const COMPACTION_FRAMES: CompactionFrame[] = [
  {
    title: '开局',
    segments: [{ ...SYSTEM, pct: 18 }],
    note: '每个请求都以精心构造的 prompt 开头：系统指令、工具定义、AGENTS.md。前缀稳定，后面的缓存才命中得了。',
  },
  {
    title: '对话增长 · Turn 1',
    segments: [{ ...SYSTEM, pct: 18 }, { ...HISTORY(1), pct: 17 }],
    note: '每一轮 turn 的消息、工具调用与结果都追加进上下文。因为前缀不变，已有部分命中 prompt 缓存，不用重新计费与计算。',
  },
  {
    title: '对话增长 · Turn 2–3',
    segments: [{ ...SYSTEM, pct: 18 }, { ...HISTORY(1), pct: 17 }, { ...HISTORY(2), pct: 17 }, { ...HISTORY(3), pct: 17 }],
    note: '上下文只增不减。缓存让重发旧 token 变便宜，但窗口本身是有上限的——便宜不等于装得下。',
  },
  {
    title: '逼近上限',
    segments: [
      { ...SYSTEM, pct: 18 },
      { ...HISTORY(1), pct: 17 },
      { ...HISTORY(2), pct: 17 },
      { ...HISTORY(3), pct: 17 },
      { ...HISTORY(4), pct: 17 },
    ],
    note: '占用越过阈值。harness 知道窗口还剩多少——压缩时机是 harness 算的，不靠模型自觉。',
  },
  {
    title: 'Compaction！',
    segments: [{ ...SYSTEM, pct: 18 }, { ...SUMMARY, pct: 11 }, { ...HISTORY(4), pct: 17 }],
    compacted: true,
    note: '旧的 Turn 1–3 被折叠成一段摘要：关键结论保留，逐字历史退场。占用从 86% 骤降到 46%，循环继续。',
  },
  {
    title: '继续增长 · Turn 5',
    segments: [{ ...SYSTEM, pct: 18 }, { ...SUMMARY, pct: 11 }, { ...HISTORY(4), pct: 17 }, { ...HISTORY(5), pct: 17 }],
    note: '模型看到的是「系统指令 + 摘要 + 近期历史」。会话可以因此拉得很长，而窗口始终装得下。',
  },
  {
    title: '再次逼近',
    segments: [
      { ...SYSTEM, pct: 18 },
      { ...SUMMARY, pct: 11 },
      { ...HISTORY(4), pct: 17 },
      { ...HISTORY(5), pct: 17 },
      { ...HISTORY(6), pct: 17 },
    ],
    note: '占用再次爬向阈值——下一次 compaction 会把更多旧历史折进摘要。这是一个可以永远转下去的循环。',
  },
]
