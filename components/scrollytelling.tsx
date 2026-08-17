"use client"

import { useEffect, useRef, useState } from "react"
import { Compass, Gem, TicketCheck, Crown } from "lucide-react"

interface Step {
  id: string
  label: string
  title: string
  description: string
  image: string
  icon: React.ComponentType<{ className?: string }>
}

const STEPS: Step[] = [
  {
    id: "step-discover",
    label: "01 · Share your dream",
    title: "Tell us where your heart wants to go",
    description:
      "Dates, budget, travel style — a quick brief is all we need. Our planners read between the lines to design around how you actually travel.",
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=1200&auto=format&fit=crop",
    icon: Compass,
  },
  {
    id: "step-curate",
    label: "02 · We curate in secret",
    title: "A private shortlist, handpicked for you",
    description:
      "Inventory desks negotiate unpublished fares, suites and experiences — never shown on the open market — and we present only the ones worth your time.",
    image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=1200&auto=format&fit=crop",
    icon: Gem,
  },
  {
    id: "step-approve",
    label: "03 · You approve & we book",
    title: "One tap confirms your reservation",
    description:
      "Review, approve and pay by card or corporate invoice. Your booking is instantly saved to your dashboard with a live pending → approved status.",
    image: "https://images.unsplash.com/photo-1556388158-158ea5ccacbd?q=80&w=1200&auto=format&fit=crop",
    icon: TicketCheck,
  },
  {
    id: "step-fly",
    label: "04 · VIP from touchdown",
    title: "Pampered from the moment you land",
    description:
      "Fast-track, transfers, lounge access and a 24/7 concierge on speed dial. Your digital passes live in your dashboard as QR-ready passes.",
    image: "https://images.unsplash.com/photo-1530521954074-e64f6810b32d?q=80&w=1200&auto=format&fit=crop",
    icon: Crown,
  },
]

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

export function ScrollytellingSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  const [activeIndex, setActiveIndex] = useState(0)
  const [prevIndex, setPrevIndex] = useState(-1)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const update = () => {
      const rect = el.getBoundingClientRect()
      const total = Math.max(1, el.offsetHeight - window.innerHeight)
      const p = clamp(-rect.top / total, 0, 1)
      setProgress(p)

      const next = Math.min(STEPS.length - 1, Math.floor(p * STEPS.length))
      setActiveIndex((cur) => {
        if (cur !== next) setPrevIndex(cur)
        return next
      })
    }

    const raf = () => requestAnimationFrame(update)
    window.addEventListener("scroll", raf, { passive: true })
    window.addEventListener("resize", raf, { passive: true })
    const t = setTimeout(update, 0)

    return () => {
      window.removeEventListener("scroll", raf)
      window.removeEventListener("resize", raf)
      clearTimeout(t)
    }
  }, [])

  const jumpToStep = (index: number) => {
    const el = sectionRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const total = Math.max(1, el.offsetHeight - window.innerHeight)
    const target = window.scrollY + rect.top + (index / STEPS.length) * total
    window.scrollTo({ top: target, behavior: "smooth" })
  }

  // Enter animation is driven purely by scroll progress (0 → 1 across each step's segment).
  const local = clamp(progress * STEPS.length - activeIndex, 0, 1)
  const activeStep = STEPS[activeIndex]
  const prevStep = prevIndex >= 0 ? STEPS[prevIndex] : null

  const enterOpacity = activeIndex === 0 ? 1 : local
  const enterY = activeIndex === 0 ? 0 : (1 - local) * 28

  return (
    <section id="how-it-works" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 max-w-2xl">
          <div className="mb-2.5 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[#D97706]">
            <Compass className="h-3.5 w-3.5" /> The FlightFly Way
          </div>
          <h2 className="text-3xl font-semibold tracking-[-0.01em] text-[#0F172A] sm:text-4xl">
            A four-step journey, delegated to experts
          </h2>
          <p className="mt-3 text-sm font-normal text-slate-500">
            Scroll to move through how we plan, curate, book and pamper — every stage is a decision you keep control of.
          </p>
        </div>

        {/* Tall scroll track */}
        <div ref={sectionRef} className="relative h-[400vh]">
          <div className="sticky top-24 h-[calc(100vh-8.5rem)] overflow-hidden rounded-3xl border border-slate-200/80 bg-[#0F172A] shadow-xl shadow-slate-900/10">
            <div className="flex h-full flex-col gap-6 p-6 sm:p-8 lg:grid lg:grid-cols-[300px_1fr] lg:items-center lg:gap-10 lg:p-10">
              {/* Step rail */}
              <div className="flex flex-col gap-3">
                {STEPS.map((step, i) => {
                  const isActive = i === activeIndex
                  const isDone = i < activeIndex
                  const Icon = step.icon
                  return (
                    <button
                      key={step.id}
                      onClick={() => jumpToStep(i)}
                      className={`group flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-300 ${
                        isActive
                          ? "border-amber-400/50 bg-amber-400/10"
                          : "border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/10"
                      }`}
                    >
                      <span
                        className={`flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                          isActive ? "bg-amber-400 text-slate-950" : isDone ? "bg-emerald-400/20 text-emerald-300" : "bg-white/10 text-slate-400"
                        }`}
                      >
                        <Icon className="size-4" />
                      </span>
                      <span className="min-w-0">
                        <span
                          className={`block text-[10px] font-semibold uppercase tracking-widest transition-colors ${
                            isActive ? "text-amber-400" : "text-slate-500"
                          }`}
                        >
                          {step.label}
                        </span>
                        <span
                          className={`block truncate text-sm font-medium transition-colors ${
                            isActive ? "text-white" : isDone ? "text-slate-300" : "text-slate-400"
                          }`}
                        >
                          {step.title}
                        </span>
                      </span>
                    </button>
                  )
                })}

                {/* Progress rail */}
                <div className="mt-2 hidden h-1 w-full overflow-hidden rounded-full bg-white/10 lg:block">
                  <div
                    className="h-full rounded-full bg-amber-400 transition-[width] duration-100"
                    style={{ width: `${Math.round(progress * 100)}%` }}
                  />
                </div>
              </div>

              {/* Pinned stage: image + copy, driven by scroll progress */}
              <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                <div className="relative h-56 w-full overflow-hidden rounded-2xl sm:h-72 lg:h-80">
                  {prevStep && (
                    <img
                      src={prevStep.image}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 h-full w-full object-cover transition-none"
                      style={{ opacity: 1 - local, transform: `translateY(${-(1 - local) * 16}px)` }}
                    />
                  )}
                  <img
                    src={activeStep.image}
                    alt={activeStep.title}
                    className="absolute inset-0 h-full w-full object-cover"
                    style={{ opacity: enterOpacity, transform: `translateY(${enterY}px)` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <span className="absolute right-4 top-4 rounded-full bg-amber-400/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-950">
                    Step {activeIndex + 1} of {STEPS.length}
                  </span>
                </div>

                <div className="max-w-md">
                  <h3 className="text-2xl font-semibold tracking-[-0.01em] text-white sm:text-3xl">
                    {activeStep.title}
                  </h3>
                  <p className="mt-2 text-sm font-normal leading-relaxed text-slate-300">{activeStep.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}