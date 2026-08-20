"use client"

import { useRef, type CSSProperties, type ReactNode } from "react"

interface ImageSpotlightProps {
  children: ReactNode
  className?: string
  veil?: string
  radius?: string
}

// Image Spotlight — adapted from Originkit's image-spotlight. A dark veil
// covers the image; a soft spotlight burns through it wherever the cursor is.
// Pure CSS vars set via pointer position — no re-renders, no listeners leak.
export function ImageSpotlight({
  children,
  className = "",
  veil = "rgba(8, 12, 24, 0.5)",
  radius = "0.75rem",
}: ImageSpotlightProps) {
  const ref = useRef<HTMLDivElement | null>(null)

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty("--sp-x", `${e.clientX - r.left}px`)
    el.style.setProperty("--sp-y", `${e.clientY - r.top}px`)
    el.style.setProperty("--sp-o", "1")
  }

  const handleLeave = () => {
    ref.current?.style.setProperty("--sp-o", "0")
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`group/spot relative ${className}`}
      style={{ "--sp-x": "50%", "--sp-y": "50%", "--sp-o": 0 } as CSSProperties}
    >
      {children}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/spot:opacity-100"
        style={{
          borderRadius: radius,
          opacity: "var(--sp-o, 0)",
          background: `radial-gradient(190px circle at var(--sp-x, 50%) var(--sp-y, 50%), transparent 0%, transparent 34%, ${veil} 78%)`,
        }}
      />
    </div>
  )
}
