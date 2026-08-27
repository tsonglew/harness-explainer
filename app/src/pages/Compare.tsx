import DimensionCompare from '../components/DimensionCompare'
import SameTaskPaths from '../components/SameTaskPaths'
import { Callout, ChapterHero, Chip, Prose, SectionHeading } from '../components/ui'
import { CHAPTER_COLORS } from '../data/loop'

const ACCENT = 'var(--color-ink)'

export default function Compare() {
  return (
    <div>
      <ChapterHero
        tag="对比章 · Compare"
        title="三种世界观，没有银弹"
        sub="看完插件化的 dsh、极简的 Pi、平台化的 Codex，是时候把它们放上同一把尺子。这一章做两件事：按六个维度把三者并排量一遍；再把同一个任务丢给它们，看三种哲学各自怎么走。"
        accent={ACCENT}
      />

      <SectionHeading
        id="dimensions"
        kicker="01 · 维度"
        title="六个维度，三种答案"
        accent={ACCENT}
        lead="同一张表，三个 harness 并排。点击任意一行，三栏联动高亮，并给出这一维度为什么重要的解读。"
      />
      <div className="mx-auto max-w-5xl px-4">
        <DimensionCompare />
      </div>
      <Prose>
        <p>
          注意表里几乎每一行都呼应着前面某一章的交互件：循环粒度对应
          <Chip color={CHAPTER_COLORS.dsh}>turn/step 步进器</Chip>与
          <Chip color={CHAPTER_COLORS.codex}>Thread 树</Chip>，会话模型对应
          <Chip color={CHAPTER_COLORS.dsh}>事件日志回放</Chip>，权限对应
          <Chip color={CHAPTER_COLORS.codex}>审批流模拟</Chip>与 pi 的
          <Chip color={CHAPTER_COLORS.pi}>YOLO by default</Chip>。
          对比不是新内容，而是把已经看过的机制放回同一坐标系。
        </p>
      </Prose>

      <SectionHeading
        id="same-task"
        kicker="02 · 实战"
        title="同一个任务，三种走法"
        accent={ACCENT}
        lead="维度表是静态的。换成动态视角：把「改掉所有 var 并跑测试」这同一个任务交给三个 harness，三栏同步步进——同一拍里，它们各自在做什么。"
      />
      <div className="mx-auto max-w-6xl px-4">
        <SameTaskPaths />
      </div>
      <Prose>
        <p>
          差异集中在第 4 拍「动手修改」：<Chip color={CHAPTER_COLORS.dsh}>dsh</Chip>{' '}
          由审批策略插件裁决，规则本身也是可替换的插件；
          <Chip color={CHAPTER_COLORS.pi}>pi</Chip> 校验通过即执行，信任显式地交给用户；
          <Chip color={CHAPTER_COLORS.codex}>Codex</Chip>{' '}
          则由 harness 强制审批流，server 反向请求客户端，模型只拿到结果。
          同一个意图，三种权限哲学。
        </p>
      </Prose>

      <SectionHeading
        id="tradeoff"
        kicker="03 · 取舍"
        title="没有银弹，只有取舍"
        accent={ACCENT}
        lead="三个 harness 没有谁是「最强」——它们各自把赌注押在了不同的地方。选型的问题因此变成：你是谁，你愿意接受哪种取舍。"
      />
      <Prose>
        <p>
          <Chip color={CHAPTER_COLORS.pi}>个人开发者 / 重度终端用户</Chip>
          ：要的是快、透明、可掌控。pi
          的四个默认工具加一条扁平循环，源码一个下午能读完；YOLO
          换来零摩擦，代价是安全网要自己拉——适合信得过自己、也信得过模型的场景。
        </p>
        <p>
          <Chip color={CHAPTER_COLORS.dsh}>团队 / 企业环境</Chip>：要的是可定制、可审计、可管控。dsh
          的审批策略、沙箱后端、能力接缝全部可替换，团队用 profile
          统一收权、个人在局部放开；453K 行买的是「没有特权核心」——代价是复杂度本身。
        </p>
        <p>
          <Chip color={CHAPTER_COLORS.codex}>产品 / 平台方</Chip>：要把 agent
          能力铺到每一个端。Codex 把循环关进 App Server，端只是 JSON-RPC
          的客户端；会话、沙箱与审批的内核只有一份——代价是你得接受平台定义的边界。
        </p>
        <Callout accent={ACCENT}>
          <strong>收尾的话：</strong>harness 的选型不是选「最好的」，而是选你愿意接受哪种取舍——
          极简换来透明，极繁换来可替换，平台化换来覆盖面。理解了循环、会话、工具、权限、协议这五件事，
          下一个新 harness 出现时，你已经有了一把自己的尺子。
        </Callout>
      </Prose>

      <div className="mx-auto max-w-3xl px-4 pt-14 text-center">
        <p className="text-sm text-ink-soft">
          六个维度、三条路径都走完了——回到起点，再看一眼那个一切开始的循环：
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <a
            href="#/"
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
          >
            ← 回到首页
          </a>
        </div>
        <p className="mt-4 text-xs text-ink-soft">
          <a href="#/codex" className="underline underline-offset-2 hover:text-ink">
            ← 回到 Codex 章
          </a>
        </p>
      </div>
    </div>
  )
}
