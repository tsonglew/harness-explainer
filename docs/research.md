# Research Notes — 资料来源

> Phase 0 收集的资料。所有正文论断应能追溯到本文件中的来源。
> 采集日期：2026-08-27。

## 参考站（交互范式）

- Transformer Explainer — <https://poloclub.github.io/transformer-explainer/>
  - 结构：demo 区（输入文本、temperature/top-k/top-p 采样）+ 逐模块滚动讲解
  - 技术：Svelte + D3.js，GPT-2 small 经 ONNX Runtime 跑在浏览器内

## DeepSeek Harness（dsh）

官方：
- 开发者预览公告（"Everything is a plugin"）— <https://deepseek.com/harness/>
- 架构文档 — <https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/architecture.md>
  - Cordis：插件贡献服务、类型化事件、可逆副作用；无特权核心
  - Layers / Profiles / Bundles；启动顺序 bundles → profile patches → home patches → CLI overlays
  - `dsh-base`：模型适配器、工具、持久化、沙箱与审批策略、设置、凭据、遥测
  - `dsh-web-app`（web）/ `dsh-headless`（headless）
  - 核心包：`core/session`、`core/system-prompt`、`core/tools`、`core/agent`、
    `core/agent-loop`、`core/scope`、`llm/llm`
  - session：不可变事件日志 + `deriveMessages()`；"Model-visible means logged"
  - tools：pre-execute → execute → post-execute → result
  - agent-loop：turn = 0..n step；step = 一次模型请求 + 其工具调用
  - 能力接缝：`ctx.sandbox` / `ctx.fs` / `ctx.shell` / `ctx.subprocess` / `ctx.terminals` / `ctx.jobs` / `ctx.commands`

第三方分析：
- Eigent AI：开源 agent runtime，MIT，基于 Cordis — <https://www.eigent.ai/blog/deepseek-harness-agent-runtime>
- Developers Digest：约 453K 行，vendored Cordis fork（2026-08-13）— <https://www.developersdigest.tech/blog/deepseek-harness-dsh-first-look>
- Medium（kaliarch）：子智能体接缝有 5 种 provider——进程内 spawn、进程内 fork、ACP、Codex、Claude Code — <https://medium.com/@kaliarch/deepseek-harness-when-the-agent-loop-itself-becomes-a-plugin-7fad0aa9de1c>
- Towards AI："把模型当数据库驱动，而非系统中心" — <https://pub.towardsai.net/deepseek-harness-explained-when-the-ai-model-is-just-a-plugin-16b2496f3d01>

## Pi（pi.dev / earendil-works）

官方：
- 官网 — <https://pi.dev/>（"a minimal agent harness"，extensions / skills / prompt templates / themes）
- 源码 — <https://github.com/earendil-works/pi>
- 作者自述（Mario Zechner / badlogic，2025-11-30）— <https://mariozechner.at/posts/2025-11-30-pi-coding-agent/>
  - 四包结构：`pi-ai`（模型层：流式、schema 校验工具调用、推理输出、跨 provider 上下文迁移、用量记账）、
    `pi-agent-core`（循环：用户输入→模型回复→工具校验→工具结果，直到无工具调用；队列输入、附件、直连/代理执行）、
    `pi-tui`（组件树、缓存渲染行、只重绘变化行、缓冲更新防闪烁）、
    `pi-coding-agent`（会话保存、重启/分支、指令文件、主题、命令模板、导出、非交互、用量）
  - 默认工具：read / write / edit（精确文本替换）/ bash；可选受限的搜索/列目录
  - 扩展走外部 CLI 工具 + markdown 命令模板，而非 MCP
  - 原则："if I don't need it, it won't be built"；显式上下文；无隐藏状态；
    计划/任务放普通文件；无后台任务与隐藏子代理；YOLO by default
- 架构文档 — <https://pt-act-pi-mono.mintlify.app/concepts/architecture>

第三方：
- Medium 解剖文（2026-02）— <https://shivamagarwal7.medium.com/agentic-ai-pi-anatomy-of-a-minimal-coding-agent-powering-openclaw-5ecd4dd6b440>
- Armin Ronacher 导读（2026-01-31）— <https://lucumr.pocoo.org/2026/1/31/pi/>
- HN 讨论 — <https://news.ycombinator.com/item?id=46844822>
- agentarchitectures.com 条目 — <https://agentarchitectures.com/framework/pi-dev>

## OpenAI Codex Harness

官方：
- "Codex as a platform: build on the open agent harness"（2026-08-19）—
  <https://developers.openai.com/blog/codex-as-a-platform>
  （harness 管理会话状态、流式执行、工具调用，并强制沙箱与审批策略）
- "Unlocking the Codex harness: how we built the App Server"（2026-02-04）—
  <https://openai.com/index/unlocking-the-codex-harness/>
- "Harness engineering: leveraging Codex in an agent-first world"（2026-02-11）—
  <https://openai.com/index/harness-engineering/>

第三方：
- Codex Harness / App Server 解析：stdio 上双向 JSON-RPC（JSONL）；
  组件 Stdio Reader / Message Processor / Thread Manager / Core Threads；
  会话原语 Thread / Turn / Item；thread 可启动/续跑/分支/归档；方法如 `thread/start` —
  <https://supergok.com/codex-harness-architecture-app-server/>
- agent loop 内部（prompt 构造 → Responses API → 缓存 → compaction）—
  <https://www.swequiz.com/articles/openai-codex-architecture>
- Agent Loop 解剖（含上下文压缩时机）— <https://stevekinney.com/writing/agent-loops>
- Claude Code vs Codex 对比（同一骨架：单智能体事件循环）—
  <https://blog.ivan.digital/claude-code-vs-openai-codex-agentic-planner-vs-shell-first-surgeon-d6ce988526e8>
- 学术：终端 coding agent 四层架构（推理/上下文工程/工具/持久化）—
  <https://arxiv.org/html/2603.05344v1>

## 待补充（Phase 0 剩余）

- [ ] dsh 源码树结构截图/模块清单（锁定 commit）
- [ ] Pi 各包代码量统计（用于"极简"可视化）
- [ ] Codex CLI 开源仓库的 harness 模块划分
- [ ] 三份可回放 trace 的采集方案
