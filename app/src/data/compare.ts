// Data for the compare chapter: six dimensions across the three harnesses,
// plus the same-task execution paths driven by the synchronized step player.

import { CHAPTER_COLORS } from './loop'

export type HarnessKey = 'dsh' | 'pi' | 'codex'

export interface HarnessMeta {
  key: HarnessKey
  name: string
  color: string
}

export const HARNESSES: HarnessMeta[] = [
  { key: 'dsh', name: 'DeepSeek Harness', color: CHAPTER_COLORS.dsh },
  { key: 'pi', name: 'Pi', color: CHAPTER_COLORS.pi },
  { key: 'codex', name: 'Codex', color: CHAPTER_COLORS.codex },
]

export interface Dimension {
  key: string
  label: string
  why: string
  cells: Record<HarnessKey, string>
}

export const DIMENSIONS: Dimension[] = [
  {
    key: 'philosophy',
    label: '哲学',
    why: '哲学决定了其他所有选择——它回答的是「这个系统里什么是不可替换的」。dsh 的答案是什么都可以换，pi 的答案是什么都不多造，Codex 的答案是循环只有一条、端可以无限多。',
    cells: {
      dsh: '极繁内核，一切皆插件',
      pi: '极简工具箱，够用就好',
      codex: '平台化的单一循环',
    },
  },
  {
    key: 'granularity',
    label: '循环粒度',
    why: '粒度决定可观察性的上限：切得越细，调试、回放、计费就越精确，代价是抽象层数变多。粗粒度的扁平循环好读，细粒度的 turn/step 与 Thread/Turn/Item 好管。',
    cells: {
      dsh: 'turn → step（step = 请求 + 工具）',
      pi: '扁平循环直到无工具调用',
      codex: 'Thread → Turn → Item',
    },
  },
  {
    key: 'session',
    label: '会话模型',
    why: '会话模型决定「能不能回到过去」：回放、分叉、审计、跨端续跑，全部建立在这一层。日志派生最严谨，普通文件最透明，三级原语最适合被平台管理。',
    cells: {
      dsh: '不可变事件日志 + 派生',
      pi: '会话文件，可分支/重启',
      codex: 'Thread/Turn/Item，可归档',
    },
  },
  {
    key: 'extensibility',
    label: '工具扩展',
    why: '扩展机制决定生态的形状：给框架写插件，能力进受保护管线、约束最强；给循环喂 CLI 与 md 模板，门槛最低、什么都能接；平台接口则把扩展留给了客户端。',
    cells: {
      dsh: '插件注册进受保护管线',
      pi: 'CLI 工具 + md 模板',
      codex: '内置工具 + 平台接口',
    },
  },
  {
    key: 'permission',
    label: '权限',
    why: '权限决定 agent 闯祸的半径。同样的模型能力，在「默认放开」和「审批流强制」下是两个物种——这一维度的选择本质上是：你信任谁，信任到什么程度。',
    cells: {
      dsh: '沙箱后端 + 审批策略插件',
      pi: '显式、默认放开',
      codex: '沙箱 + 审批流强制',
    },
  },
  {
    key: 'interface',
    label: '对外接口',
    why: '对外接口决定 harness 能长进哪里：TUI/CLI 是个人终端工具的天花板，web/headless 面向自动化与定制前端，而协议化的 App Server 让同一个内核铺到所有端。',
    cells: {
      dsh: 'web / headless 运行时',
      pi: 'TUI / CLI',
      codex: 'JSON-RPC App Server',
    },
  },
]

// ---------------------------------------------------------------------------
// Same-task paths: one task, three executions, synchronized beat by beat.

export const TASK_BRIEF = '把项目里的 var 全部改成 let / const，并跑一遍测试确认'

/** Shared beat labels: step i of every path happens at the same beat. */
export const PATH_BEATS = ['起步', '第一次请求', '定位目标', '动手修改', '结果落盘', '收尾']

export interface PathStep {
  title: string
  note: string
}

export const SAME_TASK_PATHS: Record<HarnessKey, PathStep[]> = {
  dsh: [
    {
      title: '装配启动',
      note: 'bundles → profile patches → CLI overlays 叠出本机配置；工具与审批策略以插件身份注册进管线。',
    },
    {
      title: 'turn 开始 · step 1',
      note: 'deriveMessages() 从不可变事件日志现算 messages，模型请求这才出发。',
    },
    {
      title: 'step 1：搜索工具',
      note: 'search 走受保护管线：pre-execute → execute → post-execute，命中 12 处 var。',
    },
    {
      title: 'step 2：编辑被拦下',
      note: 'edit_file 命中审批策略插件的「询问」规则——执行挂起，等人批准后才进沙箱。',
    },
    {
      title: '批准后执行 + 审计',
      note: '12 处替换落盘，bash 跑测试；approval_decision 与 tool_result 一并追加进日志。',
    },
    {
      title: 'turn 结束',
      note: '模型不再要工具。整段会话可从日志任意回放、从任意事件分叉。',
    },
  ],
  pi: [
    {
      title: '打开 CLI',
      note: '输入任务，直接进入显式上下文——你看到的历史就是模型看到的历史。',
    },
    {
      title: '模型回复 #1',
      note: '扁平循环第一圈：tool_call: bash grep -rn "var " src/。',
    },
    {
      title: '校验即执行',
      note: 'YOLO by default：参数过 schema 就跑，没有审批关卡，命中 12 处。',
    },
    {
      title: '模型回复 #2',
      note: 'tool_call: edit 逐个精确替换——old_string 唯一命中才执行，否则拒绝。',
    },
    {
      title: '结果写回 + 测试',
      note: 'tool_result 回到显式上下文；顺手 bash pnpm test，24 passed。',
    },
    {
      title: '循环终止',
      note: '模型不再要工具，循环就停。会话文件落盘，可重启、可分支。',
    },
  ],
  codex: [
    {
      title: 'thread/start',
      note: '客户端连上 App Server，一条 JSON-RPC 创建 Thread，turn 开始。',
    },
    {
      title: 'prompt 构造 → Responses API',
      note: '系统指令 + thread 历史组装请求，前缀命中缓存，模型流式回复。',
    },
    {
      title: 'item：tool_call 搜索',
      note: 'grep 调用作为 item 追加进 thread，在沙箱内执行，命中 12 处 var。',
    },
    {
      title: 'item：编辑被审批拦截',
      note: '策略强制：server 反向请求客户端审批，人点「允许」才放行——模型无权自问自答。',
    },
    {
      title: '沙箱内执行编辑',
      note: '每个 item 依次落进 thread；上下文逼近上限时 compaction 折叠旧历史。',
    },
    {
      title: 'turn 终止 · thread 归档',
      note: 'thread 可归档、可 resume——换个端（IDE、桌面）接着同一条会话。',
    },
  ],
}
