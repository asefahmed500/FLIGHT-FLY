"use client"

import { useRef } from "react"

interface GlareCardProps {
  children: React.ReactNode
  className?: string
  glareColor?: string
  rounded?: string
}

// Cursor-tracked glare card — adapted from Originkit's shine-card, but CSS-only
// (no WebGL). A soft spotlight burns through wherever the pointer is, plus a
// faint moving sheen so the surface always feels metallic.
export function GlareCard({
  children,
  className = "",
  glareColor = "rgba(255, 255, 255, 0.22)",
  rounded = "1rem",
}: GlareCardProps) {
  const ref = useRef<HTMLDivElement | null>(null)

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty("--glare-x", `${e.clientX - rect.left}px`)
    el.style.setProperty("--glare-y", `${e.clientY - rect.top}px`)
    el.style.setProperty("--glare-opacity", "1")
  }

  const handleLeave = () => {
    const el = ref.current
    if (!el) return
    el.style.setProperty("--glare-opacity", "0")
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`glare-card relative ${className}`}
    >
      {children}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{ borderRadius: rounded }}
      >
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            opacity: "var(--glare-opacity, 0)",
            background: `radial-gradient(340px circle at var(--glare-x, 50%) var(--glare-y, 50%), ${glareColor}, transparent 55%)`,
          }}
        />
      </div>
    </div>
  )
}
