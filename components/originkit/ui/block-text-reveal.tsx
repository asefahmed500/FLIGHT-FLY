"use client"

interface BlockTextRevealProps {
  text: string
  /** 0 → 1 progress; words light up in order as it grows. */
  progress: number
  className?: string
  activeClass?: string
}

// Block Text Reveal — adapted from Originkit's block-text-reveal. Words start
// dim and light up one by one as the driven progress grows; each lit word
// transitions through a soft blur so the sweep reads as one motion, not a
// hard toggle. Pure render — no listeners; the parent drives progress.
export function BlockTextReveal({
  text,
  progress,
  className = "",
  activeClass = "",
}: BlockTextRevealProps) {
  const words = text.split(/\s+/).filter(Boolean)
  const litCount = Math.round(Math.max(0, Math.min(1, progress)) * words.length)

  return (
    <p className={className}>
      {words.map((word, i) => {
        const lit = i < litCount
        return (
          <span key={`${word}-${i}`}>
            <span
              className="inline-block transition-[color,opacity,filter] duration-300 ease-out"
              style={
                lit
                  ? undefined
                  : { color: "var(--reveal-dim, #64748b)", opacity: 0.55, filter: "blur(0.4px)" }
              }
            >
              {lit ? <span className={activeClass}>{word}</span> : word}
            </span>{" "}
          </span>
        )
      })}
    </p>
  )
}
