"use client"

import { useEffect, useRef } from "react"

interface StardustProps {
  className?: string
  density?: number
}

// Stardust — adapted from Originkit's stardust. A slow drift of glowing
// particles that flicker and float upward. Canvas 2D, pauses off-screen and
// renders a single static frame under prefers-reduced-motion. Zero deps.
export function Stardust({ className = "", density = 70 }: StardustProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches
    let raf = 0
    let inView = true
    let needsResize = true
    let w = 0
    let h = 0
    let dpr = 1

    interface Mote {
      x: number
      y: number
      r: number
      vy: number
      sway: number
      phase: number
      flicker: number
      warm: boolean
    }
    let motes: Mote[] = []

    const seed = () => {
      const count = Math.max(24, Math.round((density * (w * h)) / (1280 * 500)))
      motes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.6 + Math.random() * 1.6,
        vy: 6 + Math.random() * 14,
        sway: 8 + Math.random() * 18,
        phase: Math.random() * Math.PI * 2,
        flicker: 0.4 + Math.random() * 1.3,
        warm: Math.random() < 0.45,
      }))
    }

    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1)
      w = canvas.clientWidth || 1
      h = canvas.clientHeight || 1
      const pw = Math.round(w * dpr)
      const ph = Math.round(h * dpr)
      if (canvas.width !== pw || canvas.height !== ph) {
        canvas.width = pw
        canvas.height = ph
        seed()
      }
    }

    const draw = (t: number) => {
      if (needsResize) {
        resize()
        needsResize = false
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      for (const m of motes) {
        const tw = 0.45 + 0.55 * Math.sin(t * 0.001 * m.flicker + m.phase)
        const px = m.x + Math.sin(t * 0.0004 + m.phase) * m.sway
        const alpha = 0.12 + tw * 0.5
        ctx.beginPath()
        ctx.arc(px, m.y, m.r, 0, Math.PI * 2)
        ctx.fillStyle = m.warm
          ? `rgba(251, 191, 36, ${alpha})`
          : `rgba(226, 232, 240, ${alpha * 0.85})`
        ctx.fill()
        if (!reduced) {
          m.y -= (m.vy * 0.016) * (0.6 + tw * 0.5)
          if (m.y < -4) {
            m.y = h + 4
            m.x = Math.random() * w
          }
        }
      }
    }

    const io = new IntersectionObserver(([e]) => (inView = e.isIntersecting), { threshold: 0 })
    io.observe(canvas)
    const ro = new ResizeObserver(() => (needsResize = true))
    ro.observe(canvas)

    const loop = (t: number) => {
      if (inView && !document.hidden) draw(t)
      if (!reduced) raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
    }
  }, [density])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  )
}
