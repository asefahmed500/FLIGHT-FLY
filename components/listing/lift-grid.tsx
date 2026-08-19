"use client"

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react"

interface LiftGridProps {
  children: React.ReactNode
  columns?: number
  className?: string
  glow?: boolean
  glowColor?: string
  perspective?: number
}

// Hover-reactive grid — adapted from Originkit's interactive-grid: the hovered
// card lifts up and forward in 3D while its orthogonal neighbours tilt up with
// it. The wrapper carries the responsive grid classes; cells are direct grid
// children so nothing (like the injected <style>) disturbs layout. Pure CSS,
// zero dependencies.
export function LiftGrid({
  children,
  columns = 6,
  className = "",
  glow = true,
  glowColor = "rgba(79, 70, 229, 0.45)",
  perspective = 1600,
}: LiftGridProps) {
  const [hovered, setHovered] = useState<number | null>(null)
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (leaveTimer.current) clearTimeout(leaveTimer.current)
    }
  }, [])

  const count = useMemo(
    () => (Array.isArray(children) ? children.filter(Boolean).length : 1),
    [children]
  )

  const neighbours = useMemo(() => {
    if (hovered === null) return []
    const out: number[] = []
    if (hovered % columns !== 0) out.push(hovered - 1)
    if (hovered % columns !== columns - 1) out.push(hovered + 1)
    out.push(hovered - columns)
    out.push(hovered + columns)
    return out.filter((n) => n >= 0 && n < count)
  }, [hovered, columns, count])

  const onEnter = (i: number) => {
    if (leaveTimer.current) {
      clearTimeout(leaveTimer.current)
      leaveTimer.current = null
    }
    setHovered(i)
  }
  const onLeave = () => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current)
    leaveTimer.current = setTimeout(() => setHovered(null), 200)
  }

  return (
    <>
      <div className={className} style={{ perspective }}>
        {Array.isArray(children)
          ? children.map((child, i) => {
              const isBig = hovered === i
              const isSmall = !isBig && neighbours.includes(i)
              return (
                <div
                  key={i}
                  onPointerEnter={() => onEnter(i)}
                  onPointerLeave={onLeave}
                  className="lift-grid-cell will-change-transform"
                  style={
                    {
                      "--lift-z": glow ? "3px" : "0px",
                      "--lift-glow": glowColor,
                    } as CSSProperties
                  }
                  data-lift={isBig ? "big" : isSmall ? "small" : "idle"}
                >
                  {child}
                </div>
              )
            })
          : children}
      </div>

      <style>{`
        .lift-grid-cell {
          transition: transform 200ms cubic-bezier(0.22, 1, 0.36, 1);
          transform: scale(1) translate(0, 0) translateZ(0);
        }
        .lift-grid-cell[data-lift="small"] {
          transform: scale(1.04) translate(-2px, -2px) translateZ(0);
        }
        .lift-grid-cell[data-lift="big"] {
          transform: scale(1.08) translate(-8px, -8px) translateZ(15px);
          z-index: 5;
          position: relative;
        }
        .lift-grid-cell[data-lift="big"] > * {
          box-shadow: 0 20px 40px -12px rgba(17, 17, 17, 0.18);
          transition: box-shadow 200ms ease;
        }
        .lift-grid-cell[data-lift="big"] > *::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          box-shadow: 0 0 var(--lift-z) var(--lift-glow);
          pointer-events: none;
          animation: lift-glow-pulse 1.5s ease-in-out infinite alternate;
        }
        @keyframes lift-glow-pulse {
          from { opacity: 0.4; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  )
}
