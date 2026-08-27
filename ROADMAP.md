# Harness Explainer — 项目 Roadmap

> 一个可交互式学习 **Agent Harness（智能体运行时/外壳）架构** 的网站。
> 对标 [Transformer Explainer](https://poloclub.github.io/transformer-explainer/)：
> 用滚动叙事 + 内嵌可操作可视化，把黑盒拆开给你看。
>
> 三大主角：**DeepSeek Harness（dsh）** · **Pi（pi.dev）** · **OpenAI Codex Harness**

---

## 1. 项目定位

**一句话**：把「Agent Harness」这个 2025–2026 年才流行起来、却几乎人人都说不清的概念，
做成一个可以**点进去、拨一拨、跑一遍**的交互教科书。

- **目标读者**：AI 应用工程师、对 agent 内部机制好奇的开发者、想自研/选型 harness 的团队。
- **不做什么**：不做 LLM 原理科普（那是 Transformer Explainer 的事）；
  不做又一个「prompt 教程」；不在浏览器里真跑大模型（用录制好的真实 trace 回放）。
- **核心信念**：Harness 的本质是**工程结构**——循环、日志、工具、权限、协议。
  这些全部可以被可视化、被单步执行、被对比。

### 参考站的交互范式（要继承的）

| Transformer Explainer 的做法 | 我们的对应做法 |
|---|---|
| 用户输入自己的文本，实时跑 GPT-2 | 用户输入自己的「任务指令」，回放真实 agent trace |
| 拖动 temperature / top-k 滑杆 | 拨动「审批策略 / 沙箱模式 / 上下文上限」开关 |
| 悬停 token 查看注意力权重 | 悬停事件日志，查看它如何被 `deriveMessages()` 拼进 prompt |
| 逐模块滚动展开（Embedding → Attention → MLP） | 逐层展开（Loop → Session → Tools → Sandbox → 协议层） |
| 纯前端、无后端、可静态托管 | 同样纯前端静态站，trace 数据打包为 JSON |

---

## 2. 知识范围（Content Scope）

### 2.0 通用概念章：什么是 Harness？

所有现代 coding agent 共享同一副骨架——**单智能体事件循环**：

```
用户输入 → 组装 Prompt（系统提示 + 历史 + 工具定义）
        → 模型调用（流式）
        → 解析工具调用 → 沙箱/审批 → 执行工具
        → 结果写回会话 → （循环，直到模型不再要工具）
        → 输出最终回答
```

围绕这个循环的五大子系统，就是三个站点章节的统一分析框架：

1. **Agent Loop**（循环与步/回合的粒度）
2. **Session / Context**（会话模型、上下文压缩、"什么算模型可见"）
3. **Tools**（工具注册、执行管线、扩展方式）
4. **Sandbox & Approval**（执行边界与审批策略）
5. **Interface / Protocol**（CLI / TUI / Web / JSON-RPC，harness 如何被外部复用）

### 2.1 DeepSeek Harness（dsh）——「一切皆插件」的极繁内核

- 基于 **Cordis** 元框架：插件贡献**服务、类型化事件、可逆副作用**，没有特权核心，
  每一部分都可从配置替换。
- **Layers / Bundles / Profiles**：运行时 = 按序装配的插件树。
  `dsh-base`（模型适配器、工具、持久化、沙箱与审批策略、设置、凭据、遥测）→
  `dsh-web-app`（浏览器 UI）或 `dsh-headless`（无服务单次运行）。
- 核心包：`core/session`（**不可变事件日志**，`deriveMessages()` 重建模型历史，
  铁律 *"Model-visible means logged"*）、`core/system-prompt`、`core/tools`
  （受保护执行路径：pre-execute → execute → post-execute → result）、
  `core/agent-loop`（一个 turn 含 0..n 个 step，每个 step = 一次模型请求 + 其工具调用）、
  `llm/llm`。
- **能力接缝（capability seams）**：`ctx.sandbox` / `ctx.fs` / `ctx.shell` /
  `ctx.subprocess` 可整体重定向到远端。
- 子智能体接缝有 5 种 provider：进程内 spawn、进程内 fork、ACP、**Codex**、**Claude Code**
  ——可以把另外两个 harness 当子代理调度，天然的对比教学素材。

### 2.2 Pi（pi.dev）——「极简主义」的工具箱

- 设计信条：*"if I don't need it, it won't be built"*；显式上下文、无隐藏状态、
  YOLO by default（默认不设隐藏审批）。
- Monorepo 四层：
  - `pi-ai`：模型层（流式、schema 校验的工具调用、推理输出、跨 provider 上下文迁移、用量记账）
  - `pi-agent-core`：agent 循环（用户输入 → 模型回复 → 工具校验 → 工具结果，直到不再要工具）
  - `pi-tui`：终端 UI（组件树、缓存渲染行、只重绘变化行）
  - `pi-coding-agent`：CLI（会话保存、重启/分支、指令文件、主题、导出）
- 默认工具只有四个：**read / write / edit（精确文本替换）/ bash**。
- 扩展方式不是 MCP，而是「外部命令行工具 + markdown 命令模板」。

### 2.3 Codex Harness（OpenAI）——「平台化」的单循环

- 一个被工程化到极致的单智能体循环：prompt 构造 → Responses API 调用 →
  工具执行 → **上下文压缩（compaction）**。
- 会话原语三级：**Thread / Turn / Item**；thread 可启动、续跑、分支、归档。
- **App Server**：stdio 上的双向 **JSON-RPC（JSONL 帧）**，组件为
  Stdio Reader / Message Processor / Thread Manager / Core Threads；
  方法如 `thread/start`；请求 / 响应 / 通知三类消息。
  同一个 harness 由此跑在 CLI、IDE、桌面端、远端客户端。
- Harness 负责：会话状态管理、流式执行、工具调用、**沙箱与审批策略的强制**。

### 2.4 对比章：三种世界观

| 维度 | DeepSeek Harness | Pi | Codex |
|---|---|---|---|
| 哲学 | 极繁内核，一切皆插件 | 极简工具箱，够用就好 | 平台化的单一循环 |
| 循环粒度 | turn → step（step = 请求 + 工具） | 扁平循环直到无工具调用 | Thread → Turn → Item |
| 会话模型 | 不可变事件日志 + 派生 | 会话文件，可分支/重启 | Thread/Turn/Item，可归档 |
| 工具扩展 | 插件注册进受保护管线 | CLI 工具 + md 模板 | 内置工具 + 平台接口 |
| 权限 | 沙箱后端 + 审批策略插件 | 显式、默认放开 | 沙箱 + 审批流强制 |
| 对外接口 | web / headless 运行时 | TUI / CLI | JSON-RPC App Server |

---

## 3. 技术方案

| 层 | 选型 | 理由 |
|---|---|---|
| 构建 | **Vite + React 18 + TypeScript** | 纯静态产物，易托管；团队熟悉度优先于复刻参考站的 Svelte |
| 可视化 | **SVG + D3**（图）+ **Framer Motion**（动画） | 交互图需要精确命中/悬停，SVG 优于 Canvas |
| 叙事框架 | 自研轻量 `Section + StickyStage` 滚动组件 | 参考站同款：滚动驱动 + 钉住的舞台 |
| 数据 | 预录制的 **trace JSON**（事件序列） | 不在浏览器跑真模型；回放可单步、可变速、可断点 |
| 交互引擎 | 通用 `StepPlayer`（播放/暂停/单步/滑杆） | 三大章节复用同一播放器，只换"剧本" |
| 部署 | **Vercel / GitHub Pages**（纯静态） | 零运维 |
| 语言 | 中文为主，术语保留英文；预留 i18n | 主要受众为中文开发者 |

### 站点结构（IA）

```
/                      首页：什么是 Harness？+ 循环总览动画
/basics                通用解剖：五大子系统 + 可单步的 Agent Loop 游乐场
/deepseek              dsh 章：插件装配器 / 事件日志回放 / turn-step 步进
/pi                    Pi 章：四层拆解 / 极简循环 / 四工具管线
/codex                 Codex 章：JSON-RPC 侦听器 / Thread 树 / 审批流模拟
/compare               三栏对比：按维度切换，联动高亮
```

---

## 4. 阶段路线图

### Phase 0 · 研究与内容大纲 ✅ 进行中
- [x] 三站原始资料收集（官方文档/博客/源码结构），见 `docs/research.md`
- [ ] 每个子系统写出 200–400 字「讲解词」初稿（教学文案）
- [ ] 确定统一术语表（loop/step/turn/item/journal 的中英对照）
- [ ] 采集/编写 3 份可回放 trace（每站一份，JSON 事件序列）

**产出**：`docs/content/*.md` + `src/data/traces/*.json`

### Phase 1 · 站点骨架与交互引擎
- [ ] Vite + React + TS 脚手架，Tailwind，路由（6 页）
- [ ] 滚动叙事组件：`Section`（章节锚点）+ `StickyStage`（钉住舞台）
- [ ] `StepPlayer`：事件序列播放器（播放/单步/进度/速度）
- [ ] 设计系统：配色（三站各一个主题色）、图例、等宽代码风格
- [ ] CI + 预览部署

**里程碑 M1**：首页可滚动，能用占位数据播放一个 demo trace。

### Phase 2 · 通用章 `/basics`
- [ ] 「Harness 解剖图」：五大子系统环状/分层图，悬停出说明
- [ ] **Agent Loop 游乐场**：输入任务文本 → 单步看 7 个阶段流转，
      可调「最大步数」「审批策略（自动/每次询问）」「上下文窗口」三个旋钮
- [ ] 词汇卡片（Glossary）组件

**里程碑 M2**：完全不懂 agent 的人，玩 5 分钟能说出循环的 7 个阶段。

### Phase 3 · DeepSeek Harness 章
- [ ] **插件装配器**：勾选 bundles/plugins，实时渲染插件树与启动顺序
      （bundles → profile patches → home patches → CLI overlays）
- [ ] **事件日志回放**：左栏不可变 journal，右栏 `deriveMessages()` 的输出，
      悬停联动高亮（讲透 "Model-visible means logged"）
- [ ] **turn/step 步进器**：一条 trace 逐 step 播放，展示 pre-execute → … → result 管线
- [ ] 子智能体接缝图（5 种 provider，含调度 Codex/Claude Code）

**里程碑 M3**：dsh 章完整可交互，通过一次同行评审（正确性）。

### Phase 4 · Pi 章
- [ ] **四层拆解图**：pi-ai / pi-agent-core / pi-tui / pi-coding-agent 依赖栈，
      点击每层展开职责与代码量对比（极简的视觉化：薄！）
- [ ] 极简循环动画：与通用章同构但「更瘦」，直观对比
- [ ] 四工具管线演示：read/write/edit/bash 的输入输出示例
- [ ] 「扩展不是 MCP」：演示 CLI 工具 + markdown 命令模板如何接入

**里程碑 M4**：Pi 章上线。

### Phase 5 · Codex Harness 章
- [ ] **JSON-RPC 侦听器**：左侧客户端请求（`thread/start`…），
      右侧流式 JSONL 帧，可暂停在任意帧查看 schema
- [ ] **Thread 树**：Thread → Turn → Item 的树状回放，演示分支/归档
- [ ] **审批流模拟**：同一工具调用在「自动 / 询问 / 拒绝」三种策略下的三种结局
- [ ] 上下文压缩（compaction）动画：窗口逼近上限时历史被摘要

**里程碑 M5**：三站章节齐备。

### Phase 6 · 对比章 + 打磨 + 发布
- [ ] `/compare`：三栏联动视图，按 6 个维度切换，同一份任务在三种哲学下的路径差异
- [ ] 移动端适配、键盘可达性、性能（首屏 < 200KB gzip 目标）
- [ ] 文案三审（正确性 / 表述 / 版权与引用标注）
- [ ] 部署上线 + README + 分享卡片

**里程碑 M6**：v1.0 发布。

---

## 5. 时间估算（单人节奏）

| 阶段 | 估算 |
|---|---|
| Phase 0 | 3–5 天 |
| Phase 1 | 1 周 |
| Phase 2 | 1 周 |
| Phase 3 | 1.5 周（内容最重） |
| Phase 4 | 1 周 |
| Phase 5 | 1 周 |
| Phase 6 | 3–5 天 |
| **合计** | **约 6 周** |

## 6. 风险与对策

| 风险 | 对策 |
|---|---|
| dsh 刚开源（2026-08），细节可能快速变化 | 内容锚定到具体 commit；页面标注「基于版本/日期」 |
| 可视化开发量被低估 | 引擎（StepPlayer）先行；每章复用同一套播放器 |
| 版权与事实准确性 | 所有论断挂引用（`docs/research.md`）；发布前三审 |
| 交互式「真实感」不足 | 优先录制真实开源项目的 trace，而非手写剧本 |

## 7. 下一步（现在）

1. 确认本 roadmap（范围、技术栈、章节划分）。
2. 确认后进入 Phase 0 收尾 + Phase 1 脚手架。
