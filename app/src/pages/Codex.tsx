import ApprovalSimulator from '../components/ApprovalSimulator'
import CompactionDemo from '../components/CompactionDemo'
import RpcSniffer from '../components/RpcSniffer'
import ThreadTree from '../components/ThreadTree'
import { Callout, ChapterHero, Chip, Prose, SectionHeading } from '../components/ui'

const ACCENT = 'var(--color-codex)'

export default function Codex() {
  return (
    <div>
      <ChapterHero
        tag="Codex Harness · OpenAI"
        title="平台化的回答：一个 harness，跑遍所有端"
        sub="Codex 是一个被工程化到极致的单智能体循环：prompt 构造 → Responses API 调用 → 缓存 → 工具执行 → 上下文压缩。但它真正的野心在循环之外——把整个 harness 通过 App Server 暴露成一套协议，让 CLI、IDE、桌面端、远端客户端跑在同一个内核上。"
        accent={ACCENT}
      />

      <SectionHeading
        id="philosophy"
        kicker="01 · 哲学"
        title="循环是骨架，协议才是本体"
        accent={ACCENT}
        lead="和你在通用章看到的骨架相比，Codex 的 agent loop 同构得近乎无聊：一条单智能体事件循环，反复做 prompt 构造、模型调用、工具执行。真正的设计决定是：把这条循环关进一个 server 进程，只留一条协议缝给外面。"
      />
      <Prose>
        <p>
          harness 在循环里管四件事：<Chip color={ACCENT}>会话状态管理</Chip>、
          <Chip color={ACCENT}>流式执行</Chip>、<Chip color={ACCENT}>工具调用</Chip>、
          <Chip color={ACCENT}>沙箱与审批策略的强制</Chip>。循环之外，上下文逼近上限时还有一道
          <Chip color={ACCENT}>compaction</Chip> 兜底。这些全部是 harness 的职责，一样都不留给模型自觉。
        </p>
        <Callout accent={ACCENT}>
          <strong>核心洞察：</strong>同一个 harness，跑在 CLI、IDE、桌面端和远端客户端上。
          端只是协议的客户端——界面可以千变万化，会话、工具、沙箱与审批的内核只有一份。
          这就是「Codex as a platform」的含义：不是给每个端各写一个 agent，而是把 agent 做成平台。
        </Callout>
      </Prose>

      <SectionHeading
        id="protocol"
        kicker="02 · 协议"
        title="App Server：stdio 上的双向 JSON-RPC"
        accent={ACCENT}
        lead="客户端与内核之间只有一条 stdio 管道，上面跑双向 JSON-RPC：一条消息就是一行 JSON（JSONL 帧）。消息分三类——请求、响应、通知；请求与响应靠 id 配对，通知没有 id，是 server 单向推送的事件流。"
      />
      <div className="mx-auto max-w-5xl px-4">
        <RpcSniffer />
      </div>
      <Prose>
        <p>
          管道内侧是四个组件：<Chip color={ACCENT}>Stdio Reader</Chip> 按行读写帧，
          <Chip color={ACCENT}>Message Processor</Chip> 按 method 路由，
          <Chip color={ACCENT}>Thread Manager</Chip> 管会话生命周期，
          <Chip color={ACCENT}>Core Threads</Chip> 里跑实际的 agent loop。
          注意回放里的第 8 帧：方向反了——server 也能向 client 发请求。模型要执行 shell 命令时，
          harness 反向请求客户端审批，这正是「双向」的意义。
        </p>
      </Prose>

      <SectionHeading
        id="session"
        kicker="03 · 会话"
        title="Thread / Turn / Item：会话的三级原语"
        accent={ACCENT}
        lead="Codex 把会话建模成三级：Thread 是一次完整的工作会话，Turn 是其中一轮「输入 → 循环 → 终止」，Item 是 turn 里最小的条目——用户消息、模型回复、工具调用、工具结果，全是 item。"
      />
      <div className="mx-auto max-w-5xl px-4">
        <ThreadTree />
      </div>
      <Prose>
        <p>
          关键是 thread 的四个生命周期操作：<Chip color={ACCENT}>启动</Chip>、
          <Chip color={ACCENT}>续跑</Chip>、<Chip color={ACCENT}>分支</Chip>、
          <Chip color={ACCENT}>归档</Chip>。会话不是一次性的进程内存，而是可管理的数据：
          试错就 fork 一个平行线程，告一段落就 archive，需要时再 resume 回来。
        </p>
      </Prose>

      <SectionHeading
        id="approval"
        kicker="04 · 强制"
        title="沙箱与审批：harness 的职责，不是模型的自觉"
        accent={ACCENT}
        lead="模型发出的工具调用只是「意图」。能不能执行、在哪执行，由 harness 按审批策略与沙箱规则决定——同一条命令，在不同策略下有三种结局。"
      />
      <div className="mx-auto max-w-5xl px-4">
        <ApprovalSimulator />
      </div>
      <Prose>
        <Callout accent={ACCENT}>
          <strong>铁律：</strong>审批不是模型「小心一点」，而是 harness 强制的策略。
          无论策略是自动放行、询问还是拒绝，模型拿到的都只是<em>结果</em>——执行输出或一条错误。
          「能不能跑」这个问题，从来不由模型回答。
        </Callout>
      </Prose>

      <SectionHeading
        id="compaction"
        kicker="05 · 上下文"
        title="Compaction：给循环一个装得下的上下文"
        accent={ACCENT}
        lead="每轮 turn 的 item 都追加进上下文，占用只增不减；而模型窗口有硬上限。Codex 的解法是把压缩做进循环：逼近阈值时，旧历史被折叠成一段摘要，占用骤降，循环继续。"
      />
      <div className="mx-auto max-w-5xl px-4">
        <CompactionDemo />
      </div>
      <Prose>
        <p>
          完整的请求管线是：<Chip color={ACCENT}>prompt 构造</Chip> →
          <Chip color={ACCENT}>Responses API 调用</Chip> → <Chip color={ACCENT}>缓存</Chip>（前缀不变，
          旧 token 命中缓存）→ <Chip color={ACCENT}>工具执行</Chip> → 必要时{' '}
          <Chip color={ACCENT}>compaction</Chip>。缓存让重发变便宜，压缩让窗口装得下——
          会话因此可以拉得很长，而模型始终只看得到一份「系统指令 + 摘要 + 近期历史」。
        </p>
      </Prose>

      <div className="mx-auto max-w-3xl px-4 pt-14 text-center">
        <p className="text-sm text-ink-soft">
          三个具体实现都看完了：插件化的 dsh、极简的 pi、平台化的 Codex——
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <a
            href="#/compare"
            className="rounded-full bg-codex px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
          >
            横向对比：四种 harness 哲学 →
          </a>
        </div>
        <p className="mt-4 text-xs text-ink-soft">
          <a href="#/pi" className="underline underline-offset-2 hover:text-codex">
            ← 回到 Pi 章
          </a>
        </p>
      </div>
    </div>
  )
}
