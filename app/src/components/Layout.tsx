import { NavLink } from 'react-router-dom'
import type { ReactNode } from 'react'

const links = [
  { to: '/basics', label: '通用解剖', color: 'var(--color-basics)' },
  { to: '/deepseek', label: 'DeepSeek Harness', color: 'var(--color-dsh)' },
  { to: '/pi', label: 'Pi', color: 'var(--color-pi)' },
  { to: '/codex', label: 'Codex', color: 'var(--color-codex)' },
  { to: '/compare', label: '对比', color: 'var(--color-ink)' },
]

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-line bg-paper/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4">
          <NavLink to="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span
              className="inline-block h-3.5 w-3.5 rounded-full"
              style={{
                background:
                  'conic-gradient(var(--color-dsh), var(--color-pi), var(--color-codex), var(--color-dsh))',
              }}
            />
            Harness Explainer
          </NavLink>
          <nav className="flex flex-1 items-center gap-1 overflow-x-auto text-sm">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className="rounded-full px-3 py-1.5 whitespace-nowrap text-ink-soft transition-colors hover:bg-black/5"
                style={({ isActive }) =>
                  isActive ? { color: l.color, background: 'color-mix(in srgb, ' + l.color + ' 10%, transparent)' } : undefined
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
          <a
            className="hidden text-xs text-ink-soft sm:block"
            href="https://poloclub.github.io/transformer-explainer/"
            target="_blank"
            rel="noreferrer"
          >
            致敬 Transformer Explainer
          </a>
        </div>
      </header>
      <main>{children}</main>
      <footer className="mt-24 border-t border-line py-10 text-center text-sm text-ink-soft">
        <p>
          Harness Explainer · 教学演示站点 · 内容基于公开资料整理，观点归属原作者
        </p>
        <p className="mt-1 text-xs">
          DeepSeek Harness · Pi (pi.dev) · OpenAI Codex —— 三大 Agent Harness 的交互图解
        </p>
      </footer>
    </div>
  )
}
