"use client"

import { useEffect, useRef } from "react"

interface CurvedMarqueeProps {
  text: string
  className?: string
  speed?: number
  curveHeight?: number
  fontSize?: number
}

// Curved Marquee — adapted from Originkit's curvedmarquee. Text flows
// endlessly along a curved SVG path; dragging flings it with momentum and the
// strip fades at both edges. Pauses off-screen and under reduced motion.
export function CurvedMarquee({
  text,
  className = "",
  speed = 26,
  curveHeight = 26,
  fontSize = 15,
}: CurvedMarqueeProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const offsetRef = useRef(0)
  const velRef = useRef(0)
  const dragRef = useRef({ active: false, x: 0, lastT: 0 })
  const textPathRef = useRef<SVGTextPathElement | null>(null)

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return

    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches

    let raf = 0
    let inView = true
    let last = performance.now()

    const io = new IntersectionObserver(([e]) => (inView = e.isIntersecting), { threshold: 0 })
    io.observe(wrap)

    const width = wrap.clientWidth || 800
    const loopLen = Math.max(200, width + 400)

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const d = dragRef.current
      if (!d.active) {
        if (Math.abs(velRef.current) > 2) {
          offsetRef.current += velRef.current * dt
          velRef.current *= 0.94
        } else {
          velRef.current = 0
          if (!reduced) offsetRef.current -= speed * dt
        }
      }
      offsetRef.current = ((offsetRef.current % loopLen) + loopLen) % loopLen
      if (textPathRef.current) {
        textPathRef.current.setAttribute("startOffset", `${offsetRef.current}`)
      }
      raf = requestAnimationFrame(frame)
    }
    if (!reduced) raf = requestAnimationFrame(frame)

    const onDown = (e: PointerEvent) => {
      dragRef.current = { active: true, x: e.clientX, lastT: performance.now() }
      wrap.setPointerCapture?.(e.pointerId)
    }
    const onMove = (e: PointerEvent) => {
      const d = dragRef.current
      if (!d.active) return
      const dx = e.clientX - d.x
      d.x = e.clientX
      offsetRef.current += dx * 1.4
      const now = performance.now()
      const dt = Math.max(1, now - d.lastT)
      d.lastT = now
      velRef.current = (dx * 1.4 * 1000) / dt
    }
    const onUp = (e: PointerEvent) => {
      dragRef.current.active = false
      wrap.releasePointerCapture?.(e.pointerId)
    }

    wrap.addEventListener("pointerdown", onDown)
    wrap.addEventListener("pointermove", onMove)
    wrap.addEventListener("pointerup", onUp)
    wrap.addEventListener("pointercancel", onUp)

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      wrap.removeEventListener("pointerdown", onDown)
      wrap.removeEventListener("pointermove", onMove)
      wrap.removeEventListener("pointerup", onUp)
      wrap.removeEventListener("pointercancel", onUp)
    }
  }, [speed])

  const repeat = ` ${text} ·`.repeat(8).trim()
  const w = 2400
  const path = `M 0 ${curveHeight} Q ${w / 4} 0 ${w / 2} ${curveHeight} T ${w} ${curveHeight}`

  return (
    <div
      ref={wrapRef}
      className={`relative touch-none select-none ${className}`}
      style={{ cursor: "grab" }}
      aria-hidden="true"
    >
      <svg
        viewBox={`0 0 ${w} ${curveHeight * 2}`}
        width="100%"
        height={curveHeight * 2}
        preserveAspectRatio="none"
        style={{ display: "block", maskImage: "linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)", WebkitMaskImage: "linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)" }}
      >
        <defs>
          <path id="ff-curve-path" d={path} fill="none" />
        </defs>
        <text fill="currentColor" fontSize={fontSize} fontWeight={600} letterSpacing="2">
          <textPath ref={textPathRef} href="#ff-curve-path">
            {repeat}
          </textPath>
        </text>
      </svg>
    </div>
  )
}
