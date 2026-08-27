import FourTools from '../components/FourTools'
import LayerStack from '../components/LayerStack'
import PiExtensions from '../components/PiExtensions'
import PiLoopReplay from '../components/PiLoopReplay'
import { Callout, ChapterHero, Chip, Prose, SectionHeading } from '../components/ui'

const ACCENT = 'var(--color-pi)'

export default function Pi() {
  return (
    <div>
      <ChapterHero
        tag="Pi · pi.dev"
        title="极简主义的回答：用不到就不造"
        sub="Pi 是一个 minimal agent harness：四层 monorepo、四个默认工具、一条扁平循环。它的设计信条是「if I don't need it, it won't be built」——显式上下文、无隐藏状态、无后台任务与隐藏子代理，计划和任务就放在普通文件里。"
        accent={ACCENT}
      />

      <SectionHeading
        id="philosophy"
        kicker="01 · 哲学"
        title="YOLO by default"
        accent={ACCENT}
        lead="大多数 harness 在工具执行前设一道审批关卡；pi 默认没有。YOLO by default——不设隐藏审批，校验通过即执行。信任被显式地交给了用户和模型，而不是藏在一层 UI 后面。"
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
          后面四个交互件会反复验证同一句话：用不到的机制，pi 干脆不造。
        </Callout>
      </Prose>

      <SectionHeading
        id="layers"
        kicker="02 · 分层"
        title="四层 monorepo，每层都很薄"
        accent={ACCENT}
        lead="pi 的代码分成四个包：顶层 pi-coding-agent 是你直接使用的 CLI；往下依次是终端 UI、agent 循环、模型层。依赖单向向下，没有循环，没有框架层。"
      />
      <div className="mx-auto max-w-5xl px-4">
        <LayerStack />
      </div>
      <Prose>
        <p>
          注意每张职责清单都很短。pi-tui 做的最「重」的事也不过是缓存渲染行、只重绘变化的行、
          缓冲更新防闪烁——终端 UI 的本分。整个栈的默认工具加起来只有四个。
        </p>
      </Prose>

      <SectionHeading
        id="loop"
        kicker="03 · 循环"
        title="一条更瘦的 Agent Loop"
        accent={ACCENT}
        lead="pi-agent-core 的循环和你在通用章看到的骨架同构：用户输入 → 模型回复 → 工具校验 → 工具结果，扁平重复，直到模型不再要工具。差别在于它身上什么都没多挂。"
      />
      <div className="mx-auto max-w-5xl px-4">
        <PiLoopReplay />
      </div>
      <Prose>
        <p>
          和通用章的回放对照着看：没有审批关卡（<Chip color={ACCENT}>YOLO by default</Chip>），
          没有隐藏状态——结果写回的是显式上下文，你看到的和模型看到的一致。
          循环之外，这一层只多做两件小事：队列输入（agent 在跑你也能追加消息）和附件。
        </p>
      </Prose>

      <SectionHeading
        id="tools"
        kicker="04 · 工具"
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

      <SectionHeading
        id="extensions"
        kicker="05 · 扩展"
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
