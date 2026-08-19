"use client"

import { useRef } from "react"

interface TiltCardProps {
  children: React.ReactNode
  className?: string
  maxTilt?: number
  glare?: boolean
}

// Cursor-tracked 3D tilt for card grids — adapted from Originkit's
// interactive-grid lift idea but kept subtle (max ~6deg) so content stays
// legible. Pure transform, no layout shift, GPU-friendly.
export function TiltCard({ children, className = "", maxTilt = 6, glare = true }: TiltCardProps) {
  const ref = useRef<HTMLDivElement | null>(null)

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    el.style.transform = `perspective(900px) rotateX(${(-py * maxTilt).toFixed(2)}deg) rotateY(${(px * maxTilt).toFixed(2)}deg) translateZ(0)`
    el.style.setProperty("--tilt-x", `${(px + 0.5) * 100}%`)
    el.style.setProperty("--tilt-y", `${(py + 0.5) * 100}%`)
  }

  const handleLeave = () => {
    const el = ref.current
    if (!el) return
    el.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0)"
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`relative transition-transform duration-300 ease-out will-change-transform ${className}`}
    >
      {children}
      {glare && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover/card:opacity-100"
          style={{
            background:
              "radial-gradient(420px circle at var(--tilt-x, 50%) var(--tilt-y, 50%), rgba(255,255,255,0.14), transparent 55%)",
          }}
        />
      )}
    </div>
  )
}
