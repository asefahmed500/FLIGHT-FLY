"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

// 3D coverflow — adapted from Originkit's coverflow-gallery pattern. The active
// card sits upright in the spotlight while neighbours tilt back in perspective;
// clicking a card brings it to centre. Zero extra dependencies.

interface CoverflowSlide {
  key: string
  content: React.ReactNode
}

interface CoverflowCarouselProps {
  slides: CoverflowSlide[]
  cardWidth?: number
  cardHeight?: number
  tilt?: number
  sideTilt?: number
  gap?: number
  dimOpacity?: number
  autoplay?: boolean
  autoplayDelay?: number
  className?: string
  prevLabel?: string
  nextLabel?: string
}

const PERSPECTIVE = 1600
const SCALE_STEP = 0.16
const MAX_VISIBLE = 2
const DEPTH = 240
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)"
const MOVE_MS = 600

export function CoverflowCarousel({
  slides,
  cardWidth = 420,
  cardHeight = 400,
  tilt = 7,
  sideTilt = 5,
  gap = 7,
  dimOpacity = 55,
  autoplay = false,
  autoplayDelay = 2.8,
  className,
  prevLabel = "Previous slide",
  nextLabel = "Next slide",
}: CoverflowCarouselProps) {
  const [active, setActive] = useState(0)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [maxCardWidth, setMaxCardWidth] = useState<number | null>(null)
  const lockRef = useRef(false)
  const n = slides.length

  // Responsive: shrink the card on narrow screens so neighbours stay visible
  // instead of being cut off by the viewport.
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const measure = () => {
      const w = el.getBoundingClientRect().width
      const maxW = Math.max(240, Math.min(cardWidth, Math.floor((w - 72) * 0.62)))
      setMaxCardWidth((prev) => (prev === null || Math.abs(prev - maxW) > 1 ? maxW : prev))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [cardWidth])

  const cw = maxCardWidth ?? cardWidth
  // Keep the neighbour overlap proportional to the card width.
  const stepOffset = Math.round((gap * 30 * cw) / cardWidth)

  // Keep active valid if the slide list changes.
  useEffect(() => {
    const t = setTimeout(() => {
      setActive((a) => Math.max(0, Math.min(n - 1, a)))
    }, 0)
    return () => clearTimeout(t)
  }, [n])

  const lock = useCallback(() => {
    lockRef.current = true
    window.setTimeout(() => {
      lockRef.current = false
    }, MOVE_MS)
  }, [])

  const step = useCallback(
    (dir: number) => {
      if (lockRef.current) return
      lock()
      setActive((a) => (((a + dir) % n) + n) % n)
    },
    [n, lock]
  )

  const handleCardClick = useCallback(
    (i: number) => {
      if (autoplay || lockRef.current) return
      lock()
      setActive((a) => (i === a ? (a + 1) % n : i))
    },
    [autoplay, n, lock]
  )

  // Autoplay — delay drives how long each card holds the spotlight.
  useEffect(() => {
    if (!autoplay || n < 2) return
    const id = window.setInterval(() => step(1), Math.max(0.3, autoplayDelay) * 1000)
    return () => window.clearInterval(id)
  }, [autoplay, autoplayDelay, n, step])

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault()
        step(1)
      } else if (e.key === "ArrowLeft") {
        e.preventDefault()
        step(-1)
      }
    },
    [step]
  )

  const dim = 1 - Math.max(0, Math.min(100, dimOpacity)) / 100
  const transition = `transform ${MOVE_MS}ms ${EASE}, opacity ${MOVE_MS}ms ${EASE}`

  return (
    <div className={className}>
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden outline-none"
        style={{
          perspective: `${PERSPECTIVE}px`,
          height: cardHeight,
          minHeight: 320,
        }}
        tabIndex={0}
        role="group"
        aria-roledescription="carousel"
        aria-label="Featured card carousel"
        onKeyDown={autoplay ? undefined : onKeyDown}
      >
        <div
          className="relative mx-auto"
          style={{
            width: cw,
            height: cardHeight,
            transformStyle: "preserve-3d",
          }}
        >
          {slides.map((slide, i) => {
            let rel = i - active
            if (rel > n / 2) rel -= n
            if (rel < -n / 2) rel += n

            const ax = Math.abs(rel)
            const visible = ax <= MAX_VISIBLE
            const isActive = rel === 0
            const sc = Math.max(0.4, 1 - ax * SCALE_STEP)
            const tx = rel * stepOffset
            const tz = -ax * DEPTH * (cw / cardWidth)
            const ry = -rel * tilt
            const rz = rel * sideTilt

            return (
              <div
                key={slide.key}
                className="absolute left-1/2 top-1/2"
                style={{
                  width: cw,
                  height: cardHeight,
                  transformStyle: "preserve-3d",
                  transformOrigin: "center center",
                  transform: `translate(-50%, -50%) translateX(${tx}px) translateZ(${tz}px) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${sc})`,
                  transition,
                  opacity: visible ? 1 : 0,
                  cursor: isActive ? "default" : "pointer",
                  zIndex: isActive ? 10 : Math.max(1, 10 - ax),
                }}
                onClick={autoplay ? undefined : () => handleCardClick(i)}
                aria-hidden={!visible}
              >
                <div
                  className="relative h-full w-full overflow-hidden rounded-xl shadow-2xl shadow-slate-900/20"
                  style={{ pointerEvents: isActive ? "auto" : "none" }}
                >
                  {slide.content}

                  {/* Dim overlay — darkens inactive cards; kept subtle so peers stay legible */}
                  <div
                    className="pointer-events-none absolute inset-0 rounded-xl bg-slate-950"
                    style={{ opacity: isActive ? 0 : dim, transition: `opacity ${MOVE_MS}ms ${EASE}` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {slides.map((s, i) => (
            <button
              key={s.key}
              type="button"
              onClick={() => {
                lock()
                setActive(i)
              }}
              aria-label={`Go to slide ${i + 1}`}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === active ? "w-6 bg-[#4F46E5]" : "w-1.5 bg-slate-300 hover:bg-slate-400"
              )}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label={prevLabel}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-800 transition-colors hover:bg-slate-100"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label={nextLabel}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-800 transition-colors hover:bg-slate-100"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}
