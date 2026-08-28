import FourTools from '../components/FourTools'
import LayerStack from '../components/LayerStack'
import PiExtensions from '../components/PiExtensions'
import PiLiveDemo from '../components/PiLiveDemo'
import PiLoopStage from '../components/PiLoopStage'
import { ScrollStep, StickyStage } from '../components/ScrollStage'
import { Callout, ChapterHero, Chip, Figure, Prose, SectionHeading } from '../components/ui'
import { PI_LOOP_STEP_PHASES, PI_PHASE_META } from '../data/piTrace'

const ACCENT = 'var(--color-pi)'

/* ------------------------------------------------------------------ */
/* Scroll narrative: the four layers of the monorepo.                  */
/* ------------------------------------------------------------------ */

const LAYER_STEPS = [
  {
    name: 'pi-coding-agent',
    title: '你直接使用的 CLI',
    body: '顶层是你打交道的命令行：会话保存、重启/分支、指令文件、主题、命令模板、导出、非交互模式、用量统计。功能不少，但每一件都是「用户直接要的东西」。',
  },
  {
    name: 'pi-tui',
    title: '终端 UI 的本分',
    body: '组件树、缓存渲染行、只重绘变化的行、缓冲更新防闪烁——终端 UI 该做的，一件不多。这一层不知道什么是 agent。',
  },
  {
    name: 'pi-agent-core',
    title: '那条极简循环住在这里',
    body: '用户输入 → 模型回复 → 工具校验 → 工具结果，循环到模型不再要工具为止。外加两件小事：队列输入与附件、直连/代理执行。没有审批，没有隐藏状态。',
  },
  {
    name: 'pi-ai',
    title: '模型层',
    body: '流式输出、schema 校验的工具调用、推理输出、跨 provider 上下文迁移、用量记账。换 provider 不换上下文，是这一层的职责。',
  },
]

function LayersChapter() {
  return (
    <StickyStage
      stage={(active) => (
        <Figure caption="pi 的 monorepo 四层，随左侧滚动逐层高亮展开。每张职责清单都很短——这正是「极简」的证据。">
          <LayerStack active={active} />
        </Figure>
      )}
    >
      {LAYER_STEPS.map((s, i) => (
        <ScrollStep key={s.name} index={i}>
          <code className="font-mono text-sm font-bold" style={{ color: ACCENT }}>
            {s.name}
          </code>
          <h3 className="mt-1.5 text-xl font-bold tracking-tight text-ink">{s.title}</h3>
          <p className="mt-2 text-[15px] leading-8 text-ink-soft">{s.body}</p>
        </ScrollStep>
      ))}
    </StickyStage>
  )
}

/* ------------------------------------------------------------------ */
/* Scroll narrative: the minimal loop, phase by phase.                 */
/* ------------------------------------------------------------------ */

const LOOP_STEPS = [
  {
    phase: 'user',
    title: '用户输入',
    body: '任务直接进入会话上下文，没有预处理管线。pi-agent-core 支持队列输入：agent 还在跑，你也能继续追加消息。',
  },
  {
    phase: 'reply',
    title: '模型回复',
    body: '模型流式输出文本，需要动手时输出结构化的 tool_call——schema 校验在 pi-ai 完成。模型只「说」，执行权在 harness 手里。',
  },
  {
    phase: 'validate',
    title: '工具校验',
    body: 'pi-agent-core 校验参数：符合 schema 就执行。注意对照通用章——这里之后本该有一个审批关卡，pi 里它不存在。YOLO by default：信任被显式交给用户和模型，而不是藏在 UI 后面。',
  },
  {
    phase: 'result',
    title: '工具结果',
    body: '结果作为 tool_result 写回会话，成为显式上下文的一部分。没有隐藏状态：你在屏幕上看到的历史，就是模型在下一次请求里看到的历史。',
  },
  {
    phase: 'final',
    title: '终止条件',
    body: '模型不再要工具，循环就停。退出条件和通用循环一样朴素——整条循环身上什么都没多挂，这就是 pi 的「更瘦的 Agent Loop」。',
  },
] as const

function LoopChapter() {
  return (
    <StickyStage
      stage={(active) => (
        <Figure caption="pi-agent-core 的循环随滚动逐阶段推进。注意 工具校验 之后那个被划掉的虚线节点——通用循环里的审批关卡，在这里从未被造出来。">
          <PiLoopStage active={active} />
        </Figure>
      )}
    >
      {LOOP_STEPS.map((s, i) => {
        const meta = PI_PHASE_META[s.phase as keyof typeof PI_PHASE_META]
        return (
          <ScrollStep key={s.phase} index={i}>
            <span
              className="inline-block w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
              style={{ background: meta.color }}
            >
              阶段 {i + 1} / {PI_LOOP_STEP_PHASES.length} · {meta.label}
            </span>
            <h3 className="mt-2 text-xl font-bold tracking-tight text-ink">{s.title}</h3>
            <p className="mt-2 text-[15px] leading-8 text-ink-soft">{s.body}</p>
          </ScrollStep>
        )
      })}
    </StickyStage>
  )
}

/* ------------------------------------------------------------------ */
/* Page.                                                               */
/* ------------------------------------------------------------------ */

export default function Pi() {
  return (
    <div>
      <ChapterHero
        tag="Pi · pi.dev"
        title="极简主义的回答：用不到就不造"
        sub="Pi 是一个 minimal agent harness：四层 monorepo、四个默认工具、一条扁平循环。它的设计信条是「if I don't need it, it won't be built」——显式上下文、无隐藏状态、无后台任务与隐藏子代理，计划和任务就放在普通文件里。"
        accent={ACCENT}
      />

      {/* Live demo */}
      <SectionHeading
        id="demo"
        kicker="01 · 先跑起来"
        title="亲手跑一次 pi 的循环"
        accent={ACCENT}
        lead="下面是一个模拟的 pi agent。点「运行」：模型回复逐字流出，工具调用实时弹出，结果写回会话——右侧同步展示下一次模型请求实际收到的 messages。悬停任意事件，看它拼进了哪条 message。"
      />
      <div className="mx-auto max-w-6xl px-4">
        <PiLiveDemo />
      </div>
      <Prose>
        <Callout accent={ACCENT}>
          <strong>试一试：</strong>① 关掉 <Chip color={ACCENT}>bash</Chip> 再运行——跑到「跑测试」那一步，
          模型只能表示无法验证，循环提前结束；② 把最大循环拉到 1，看循环被强制截断；
          ③ 悬停左侧的 tool_result，右侧会高亮它派生出的那条 <Chip color={ACCENT}>tool</Chip> message——
          你看到的历史，就是模型看到的历史。
        </Callout>
      </Prose>

      {/* Philosophy */}
      <SectionHeading
        id="philosophy"
        kicker="02 · 哲学"
        title="YOLO by default"
        accent={ACCENT}
        lead="大多数 harness 在工具执行前设一道审批关卡；pi 默认没有。校验通过即执行，不停下来问人。"
      />
      <Prose>
        <p>
          这条信条贯穿整个系统：<Chip color={ACCENT}>显式上下文</Chip>——你看到的历史就是模型看到的历史，
          没有隐藏状态；<Chip color={ACCENT}>计划放普通文件</Chip>——任务清单是工作区里的
          markdown，不是某个内部数据结构；<Chip color={ACCENT}>无后台任务与隐藏子代理</Chip>——
          没有什么在你看不见的地方悄悄运行。
        </p>
        <Callout accent={ACCENT}>
          <strong>核心洞察：</strong>极简不是「功能少」，而是「每一行存在的代码都能说出理由」。
          用不到的机制，pi 干脆不造。
        </Callout>
      </Prose>

      {/* Scroll chapter A: layers */}
      <SectionHeading
        id="layers"
        kicker="03 · 分层"
        title="四层 monorepo，每层都很薄"
        accent={ACCENT}
        lead="pi 的代码分成四个包：顶层 pi-coding-agent 是你直接使用的 CLI；往下依次是终端 UI、agent 循环、模型层。往下滚动，逐层拆开看。"
      />
      <div className="mt-4">
        <LayersChapter />
      </div>

      {/* Scroll chapter B: the loop */}
      <SectionHeading
        id="loop"
        kicker="04 · 循环"
        title="一条更瘦的 Agent Loop"
        accent={ACCENT}
        lead="pi-agent-core 的循环和你在通用章看到的骨架同构：用户输入 → 模型回复 → 工具校验 → 工具结果，扁平重复，直到模型不再要工具。往下滚动，逐阶段推进——注意它身上什么都没多挂。"
      />
      <div className="mt-4">
        <LoopChapter />
      </div>
      <Prose>
        <p>
          和通用章的回放对照着看：没有审批关卡（<Chip color={ACCENT}>YOLO by default</Chip>），
          没有隐藏状态——结果写回的是显式上下文，你看到的和模型看到的一致。
          循环之外，这一层只多做两件小事：队列输入（agent 在跑你也能追加消息）和附件。
        </p>
      </Prose>

      {/* Tools */}
      <SectionHeading
        id="tools"
        kicker="05 · 工具"
        title="默认工具只有四个"
        accent={ACCENT}
        lead="read、write、edit、bash——这就是 pi 默认交给模型的全部能力（另有可选的受限搜索与列目录）。少到可以逐个看完。"
      />
      <div className="mx-auto max-w-5xl px-4">
        <FourTools />
      </div>
      <Prose>
        <p>
          四个里最讲究的是 <Chip color={ACCENT}>edit</Chip>：它是
          <Chip color={ACCENT}>精确文本替换</Chip>——给出 old_string 与 new_string，
          唯一命中才执行，匹配不到或命中多处就拒绝。编辑的正确性不靠模型「小心一点」，
          靠工具的校验规则兜底。
        </p>
      </Prose>

      {/* Extensions */}
      <SectionHeading
        id="extensions"
        kicker="06 · 扩展"
        title="扩展不是 MCP：外部 CLI + markdown 模板"
        accent={ACCENT}
        lead="pi 的扩展不需要协议。新命令就是一个 markdown 模板文件；新能力就是一个能被 bash 调用的外部 CLI 工具。"
      />
      <div className="py-2">
        <PiExtensions />
      </div>

      <div className="mx-auto max-w-3xl px-4 pt-14 text-center">
        <p className="text-sm text-ink-soft">
          极简的另一面：有的 harness 选择把审批、沙箱与平台能力全部做进内核——
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <a
            href="#/codex"
            className="rounded-full bg-codex px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
          >
            Codex：平台化的回答 →
          </a>
          <a
            href="#/compare"
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
          >
            横向对比：四种 harness 哲学 →
          </a>
        </div>
        <p className="mt-4 text-xs text-ink-soft">
          <a href="#/deepseek" className="underline underline-offset-2 hover:text-pi">
            ← 回到 DeepSeek 章
          </a>
        </p>
      </div>
    </div>
  )
}
