import { useCallback, useEffect, useRef, useState } from 'react'

/** Headless step-player engine: drives any visualization by an integer step index. */
export function useStepPlayer(
  nSteps: number,
  { autoPlay = false, interval = 1500 }: { autoPlay?: boolean; interval?: number } = {},
) {
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(autoPlay)
  const timer = useRef<number | null>(null)

  const stopTimer = () => {
    if (timer.current !== null) {
      window.clearInterval(timer.current)
      timer.current = null
    }
  }

  useEffect(() => {
    if (!playing) {
      stopTimer()
      return
    }
    timer.current = window.setInterval(() => {
      setStep((s) => {
        if (s >= nSteps - 1) {
          setPlaying(false)
          return s
        }
        return s + 1
      })
    }, interval)
    return stopTimer
  }, [playing, nSteps, interval])

  const next = useCallback(() => {
    setPlaying(false)
    setStep((s) => Math.min(nSteps - 1, s + 1))
  }, [nSteps])
  const prev = useCallback(() => {
    setPlaying(false)
    setStep((s) => Math.max(0, s - 1))
  }, [])
  const reset = useCallback(() => {
    setPlaying(false)
    setStep(0)
  }, [])
  const toggle = useCallback(() => {
    if (!playing && step >= nSteps - 1) setStep(0)
    setPlaying((p) => !p)
  }, [playing, step, nSteps])

  return { step, setStep, playing, next, prev, reset, toggle, atEnd: step >= nSteps - 1 }
}

/** Transport controls: play/pause, prev/next, scrubber. */
export function PlayerControls({
  step,
  nSteps,
  playing,
  accent,
  onToggle,
  onPrev,
  onNext,
  onScrub,
  labels,
}: {
  step: number
  nSteps: number
  playing: boolean
  accent: string
  onToggle: () => void
  onPrev: () => void
  onNext: () => void
  onScrub: (s: number) => void
  labels?: string[]
}) {
  const btn =
    'inline-flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-ink transition hover:bg-black/5 active:scale-95'
  return (
    <div className="flex items-center gap-3">
      <button className={btn} onClick={onPrev} disabled={step === 0} aria-label="上一步">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button
        className="inline-flex h-11 w-11 items-center justify-center rounded-full text-white transition active:scale-95"
        style={{ background: accent }}
        onClick={onToggle}
        aria-label={playing ? '暂停' : '播放'}
      >
        {playing ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="5" width="4" height="14" rx="1" />
            <rect x="14" y="5" width="4" height="14" rx="1" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5.5v13l11-6.5z" />
          </svg>
        )}
      </button>
      <button className={btn} onClick={onNext} disabled={step >= nSteps - 1} aria-label="下一步">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div className="flex flex-1 flex-col gap-1">
        <input
          type="range"
          min={0}
          max={nSteps - 1}
          value={step}
          onChange={(e) => onScrub(Number(e.target.value))}
          className="w-full accent-current"
          style={{ accentColor: accent }}
          aria-label="进度"
        />
        <div className="flex justify-between text-[11px] text-ink-soft">
          <span>
            {step + 1} / {nSteps}
          </span>
          {labels?.[step] && <span className="max-w-[70%] truncate text-right">{labels[step]}</span>}
        </div>
      </div>
    </div>
  )
}
