"use client"

import { useRef, type CSSProperties, type MouseEvent, type ReactNode } from "react"

interface GlassButtonProps {
  children: ReactNode
  onClick?: () => void
  type?: "button" | "submit" | "reset"
  disabled?: boolean
  className?: string
  ariaLabel?: string
  variant?: "glass" | "amber"
}

// Light Glass Button — adapted from Originkit's light-glass-button.
// A backdrop-blurred glass face with a cursor-tracked inner light and a rim
// that flares on whichever edge the light is nearest. `amber` is the brand
// variant: a big orange button with a warm border. Zero deps; pure CSS
// vars driven from pointer position, so no re-renders.
export function GlassButton({
  children,
  onClick,
  type = "button",
  disabled = false,
  className = "",
  ariaLabel,
  variant = "glass",
}: GlassButtonProps) {
  const ref = useRef<HTMLButtonElement | null>(null)

  const handleMove = (e: MouseEvent<HTMLButtonElement>) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = e.clientX - r.left
    const y = e.clientY - r.top
    el.style.setProperty("--gx", `${x}px`)
    el.style.setProperty("--gy", `${y}px`)
    // Edge flare strength — nearer the edge, the brighter that rim lights up.
    const nx = x / r.width
    const ny = y / r.height
    const top = 1 - ny
    const bottom = ny
    const left = 1 - nx
    const right = nx
    el.style.setProperty("--ft", top.toFixed(3))
    el.style.setProperty("--fb", bottom.toFixed(3))
    el.style.setProperty("--fl", left.toFixed(3))
    el.style.setProperty("--fr", right.toFixed(3))
    el.style.setProperty("--glow-o", "1")
  }

  const handleLeave = () => {
    const el = ref.current
    if (!el) return
    el.style.setProperty("--glow-o", "0")
    el.style.setProperty("--ft", "0")
    el.style.setProperty("--fb", "0")
    el.style.setProperty("--fl", "0")
    el.style.setProperty("--fr", "0")
  }

  return (
    <button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`glass-btn group relative inline-flex h-14 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl transition-[transform,box-shadow] duration-150 active:scale-[0.97] active:duration-100 disabled:pointer-events-none disabled:opacity-50 ${
        variant === "amber"
          ? "border-2 border-amber-300 bg-[#D97706] text-white shadow-lg shadow-amber-600/25 hover:bg-[#B45309] hover:shadow-xl"
          : "border border-amber-200/60 bg-white/60 text-[#111111] shadow-lg backdrop-blur-md hover:shadow-xl"
      } ${className}`}
      style={
        {
          "--gx": "50%",
          "--gy": "50%",
          "--ft": 0,
          "--fb": 0,
          "--fl": 0,
          "--fr": 0,
          "--glow-o": 0,
        } as CSSProperties
      }
    >
      {children}

      {/* Cursor-tracked inner light */}
      <span
        aria-hidden="true"
        className="glass-btn-light pointer-events-none absolute inset-0"
      />
      {/* Rim flare — brightest on the edge nearest the light */}
      <span aria-hidden="true" className="glass-btn-rim pointer-events-none absolute inset-0 rounded-2xl" />

      <style>{`
        .glass-btn-light {
          background: radial-gradient(160px circle at var(--gx) var(--gy), ${variant === "amber" ? "rgba(255, 255, 255, 0.35)" : "rgba(251, 191, 36, 0.22)"}, rgba(255, 255, 255, 0.25) 40%, transparent 65%);
          opacity: var(--glow-o);
          transition: opacity 0.25s ease-out;
        }
        .glass-btn-rim {
          box-shadow:
            inset 0 1.5px 0 ${variant === "amber" ? "rgba(255, 255, 255, calc(0.8 * var(--ft)))" : "rgba(251, 191, 36, calc(0.75 * var(--ft)))"},
            inset 0 -1.5px 0 ${variant === "amber" ? "rgba(255, 255, 255, calc(0.8 * var(--fb)))" : "rgba(251, 191, 36, calc(0.75 * var(--fb)))"},
            inset 1.5px 0 0 ${variant === "amber" ? "rgba(255, 255, 255, calc(0.8 * var(--fl)))" : "rgba(251, 191, 36, calc(0.75 * var(--fl)))"},
            inset -1.5px 0 0 ${variant === "amber" ? "rgba(255, 255, 255, calc(0.8 * var(--fr)))" : "rgba(251, 191, 36, calc(0.75 * var(--fr)))"};
          transition: box-shadow 0.25s ease-out;
        }
      `}</style>
    </button>
  )
}
