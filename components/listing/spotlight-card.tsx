"use client"

import { useRef } from "react"

interface SpotlightCardProps {
  children: React.ReactNode
  className?: string
  spotlightColor?: string
  radius?: string
}

// Cursor-tracked spotlight card — adapted from Originkit's image-spotlight: a
// soft pool of light burns through the card following the pointer. CSS-only.
export function SpotlightCard({
  children,
  className = "",
  spotlightColor = "rgba(217, 119, 6, 0.16)",
  radius = "1rem",
}: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement | null>(null)

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty("--spot-x", `${e.clientX - rect.left}px`)
    el.style.setProperty("--spot-y", `${e.clientY - rect.top}px`)
    el.style.setProperty("--spot-opacity", "1")
  }

  const handleLeave = () => {
    const el = ref.current
    if (!el) return
    el.style.setProperty("--spot-opacity", "0")
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`relative ${className}`}
    >
      {children}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{ borderRadius: radius }}
      >
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            opacity: "var(--spot-opacity, 0)",
            background: `radial-gradient(260px circle at var(--spot-x, 50%) var(--spot-y, 50%), ${spotlightColor}, transparent 60%)`,
          }}
        />
      </div>
    </div>
  )
}
