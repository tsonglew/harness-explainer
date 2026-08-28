import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'

/**
 * Scroll-driven narrative infrastructure (Transformer-Explainer style):
 * a scrolling text column on the left, a sticky visual stage on the right.
 * The stage receives the index of the ScrollStep currently in the middle
 * of the viewport and can highlight/animate accordingly.
 */

// Split contexts: `setActive` is stable (observer effects never re-run),
// `active` changes per step and only re-renders consumers.
const ActiveCtx = createContext(0)
const SetActiveCtx = createContext<((i: number) => void) | null>(null)

export function StickyStage({
  children,
  stage,
  className = '',
}: {
  /** ScrollStep children forming the scrolling narrative column. */
  children: ReactNode
  /** Sticky visual: a node, or a render prop receiving the active step index. */
  stage: ReactNode | ((active: number) => ReactNode)
  className?: string
}) {
  const [active, setActive] = useState(0)

  return (
    <SetActiveCtx.Provider value={setActive}>
      <ActiveCtx.Provider value={active}>
        <div className={`mx-auto flex max-w-6xl flex-col gap-6 px-4 lg:flex-row lg:gap-10 ${className}`}>
          {/* scrolling narrative */}
          <div className="min-w-0 lg:w-[42%] lg:shrink-0">{children}</div>
          {/* sticky stage */}
          <div className="min-w-0 flex-1">
            <div className="lg:sticky lg:top-20">
              {typeof stage === 'function' ? stage(active) : stage}
            </div>
          </div>
        </div>
      </ActiveCtx.Provider>
    </SetActiveCtx.Provider>
  )
}

/**
 * One narrative beat. Becomes active when its middle band crosses the
 * viewport center (IntersectionObserver with a -45%/-45% root margin).
 * Requires an explicit `index` so the stage can map steps deterministically.
 */
export function ScrollStep({
  index,
  children,
  className = '',
}: {
  index: number
  children: ReactNode
  className?: string
}) {
  const setActive = useContext(SetActiveCtx)
  const active = useContext(ActiveCtx)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !setActive) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(index)
        }
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [index, setActive])

  const on = active === index

  return (
    <div
      ref={ref}
      className={`py-6 transition-opacity duration-500 lg:min-h-[52vh] lg:py-16 lg:flex lg:flex-col lg:justify-center ${
        on ? 'lg:opacity-100' : 'lg:opacity-35'
      } ${className}`}
    >
      {children}
    </div>
  )
}
