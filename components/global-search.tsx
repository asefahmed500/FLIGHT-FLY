"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useDeals, useCatalog } from "@/lib/firestore-data"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Plane, Building2, Compass, Package, Sticker, Ticket, MapPin, Tag, CornerDownLeft, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface SearchHit {
  id: string
  title: string
  subtitle: string
  image: string
  href: string
  typeLabel: string
  icon: React.ComponentType<{ className?: string }>
  score: number
}

const KIND_META: Record<string, { label: string; href: (id: string) => string; icon: React.ComponentType<{ className?: string }> }> = {
  destination: { label: "Destination", href: (id) => `/catalog/${id}`, icon: MapPin },
  tour: { label: "Tour", href: (id) => `/catalog/${id}`, icon: Compass },
  visa: { label: "Visa", href: (id) => `/catalog/${id}`, icon: Sticker },
  ticket: { label: "Tickets", href: (id) => `/catalog/${id}`, icon: Ticket },
}

const DEAL_META: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  flights: { label: "Flight", icon: Plane },
  hotels: { label: "Hotel", icon: Building2 },
  packages: { label: "Package", icon: Package },
  tours: { label: "Tour", icon: Compass },
  visa: { label: "Visa", icon: Sticker },
  tickets: { label: "Tickets", icon: Ticket },
}

// Fuzzy token ranker — a token scores per field (title ×3, subtitle ×2,
// category ×1) using exact/prefix/substring/typo word matching, so
// "dubai flight" surfaces the Dubai flight deal above a tour that merely
// mentions Dubai, and "dubi" still finds Dubai.
// Bounded Levenshtein (edit distance) with an early exit once the distance
// exceeds `max` — cheap enough for the ~40-item catalog, catches typos like
// "dubi" → "dubai" or "maldivs" → "maldives".
function editDistanceWithin(a: string, b: string, max: number): boolean {
  if (Math.abs(a.length - b.length) > max) return false
  if (a === b) return true
  const prev = new Array<number>(b.length + 1)
  const cur = new Array<number>(b.length + 1)
  for (let j = 0; j <= b.length; j++) prev[j] = j
  for (let i = 1; i <= a.length; i++) {
    cur[0] = i
    let rowMin = cur[0]
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost)
      if (cur[j] < rowMin) rowMin = cur[j]
    }
    if (rowMin > max) return false // this row can only get worse
    for (let j = 0; j <= b.length; j++) prev[j] = cur[j]
  }
  return prev[b.length] <= max
}

// Word-level fuzzy match for one token against a text field.
// exact word  → 4 · prefix of a word → 3 · substring → 2 · typo (edit ≤1-2) → 1
function tokenFieldScore(token: string, field: string): number {
  if (!field) return 0
  const words = field.toLowerCase().split(/[^\p{L}\p{N}]+/u)
  let best = 0
  for (const w of words) {
    if (!w) continue
    let s = 0
    if (w === token) s = 4
    else if (w.startsWith(token)) s = 3
    else if (w.includes(token)) s = 2
    else {
      // typo allowance scales with token length: 3-4 chars → 1 edit, 5+ → 2
      const max = token.length >= 5 ? 2 : token.length >= 3 ? 1 : 0
      if (max > 0 && w.length >= 3 && editDistanceWithin(token, w, max)) s = 1
    }
    if (s > best) best = s
    if (best === 4) break
  }
  return best
}

// Rank one item against the query tokens. Title matches weigh ×3, subtitle ×2,
// category ×1. Items matching EVERY token get a 1.5× boost so "paris hotel"
// ranks a Paris hotel above a Paris tour; single-token matches still surface
// (best-effort) instead of returning nothing.
function scoreItem(hay: { title: string; subtitle: string; category: string }, tokens: string[]): number {
  if (tokens.length === 0) return 0
  let total = 0
  let matched = 0
  for (const t of tokens) {
    const s =
      tokenFieldScore(t, hay.title) * 3 +
      tokenFieldScore(t, hay.subtitle) * 2 +
      tokenFieldScore(t, hay.category) * 1
    if (s > 0) {
      matched++
      total += s
    }
  }
  if (matched === 0) return 0
  return matched === tokens.length ? total * 1.5 : total
}

export function GlobalSearch({ className, inputClassName }: { className?: string; inputClassName?: string }) {
  const router = useRouter()
  const { deals, loading: dealsLoading } = useDeals()
  const { catalog, loading: catalogLoading } = useCatalog()
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [debounced, setDebounced] = useState("")
  const [activeIdx, setActiveIdx] = useState(-1)
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(query.trim().toLowerCase())
      setActiveIdx(-1)
    }, 120)
    return () => clearTimeout(t)
  }, [query])

  // Close on outside click
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("pointerdown", onDown)
    return () => document.removeEventListener("pointerdown", onDown)
  }, [])

  const hits = useMemo<SearchHit[]>(() => {
    if (debounced.length < 1) return []
    const tokens = debounced.split(/[\s,]+/).filter((t) => t.length >= 1)
    if (tokens.length === 0) return []

    const all: SearchHit[] = []

    for (const d of deals) {
      const s = scoreItem({ title: d.title, subtitle: d.subtitle, category: d.category }, tokens)
      if (s > 0) {
        const meta = DEAL_META[d.category] ?? { label: "Deal", icon: Tag }
        all.push({
          id: d.id,
          title: d.title,
          subtitle: d.subtitle,
          image: d.image,
          href: `/deals/${d.id}`,
          typeLabel: `Deal · ${meta.label}`,
          icon: meta.icon,
          score: s + 1, // live deals rank slightly above catalog entries
        })
      }
    }
    for (const c of catalog) {
      const meta = KIND_META[c.kind]
      if (!meta) continue
      const s = scoreItem({ title: c.title, subtitle: c.subtitle || "", category: c.kind }, tokens)
      if (s > 0) {
        all.push({
          id: c.id,
          title: c.title,
          subtitle: c.subtitle || "",
          image: c.image,
          href: meta.href(c.id),
          typeLabel: meta.label,
          icon: meta.icon,
          score: s,
        })
      }
    }
    return all.sort((a, b) => b.score - a.score).slice(0, 6)
  }, [debounced, deals, catalog])

  const loading = dealsLoading || catalogLoading
  // Panel opens on focus (trending) or as soon as a keyword is being typed.
  const hasQuery = debounced.length >= 1
  const showPanel = open

  // Trending keywords shown while the box is empty — clicking one runs the
  // search immediately.
  const TRENDING = ["Dubai", "Maldives", "Tokyo", "Paris", "Bali", "Business Class"]

  const go = (href: string) => {
    setOpen(false)
    setQuery("")
    router.push(href)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false)
      inputRef.current?.blur()
    } else if (e.key === "ArrowDown" && hits.length > 0) {
      e.preventDefault()
      setOpen(true)
      setActiveIdx((i) => (i + 1) % hits.length)
    } else if (e.key === "ArrowUp" && hits.length > 0) {
      e.preventDefault()
      setActiveIdx((i) => (i <= 0 ? hits.length - 1 : i - 1))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (activeIdx >= 0 && hits[activeIdx]) go(hits[activeIdx].href)
      else if (query.trim()) go(`/deals?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <div ref={wrapRef} className={cn("relative", className)} role="search">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="Search destinations, tours, hotels…"
        aria-label="Search FlightFly"
        className={cn(
          "h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-[13px] font-normal text-[#111111] outline-none transition-colors placeholder:text-slate-400 focus:border-[#4F46E5] focus:bg-white focus:ring-2 focus:ring-[#4F46E5]/15 [&::-webkit-search-cancel-button]:hidden",
          inputClassName
        )}
      />

      {showPanel && (
        <div className="absolute left-0 right-0 top-12 z-[60] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">
          {loading ? (
            <div className="space-y-2 p-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : !hasQuery ? (
            <div className="p-3">
              <p className="mb-2 flex items-center gap-1.5 px-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Trending searches
              </p>
              <div className="flex flex-wrap gap-1.5">
                {TRENDING.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setQuery(t)
                      inputRef.current?.focus()
                    }}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-[#4F46E5]/40 hover:bg-white hover:text-[#4F46E5]"
                  >
                    {t}
                  </button>
                ))}
              </div>
              <p className="mt-2.5 px-1 text-[11px] text-slate-400">
                Start typing to search {deals.length + catalog.length}+ flights, hotels, tours &amp; deals
              </p>
            </div>
          ) : hits.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-sm font-medium text-[#111111]">No matches for &ldquo;{query.trim()}&rdquo;</p>
              <p className="mt-1 text-xs text-slate-500">Try a city, hotel, airline or experience.</p>
            </div>
          ) : (
            <>
              <ul className="max-h-[22rem] overflow-y-auto py-1.5">
                {hits.map((hit, i) => (
                  <li key={`${hit.href}-${hit.id}`}>
                    <Link
                      href={hit.href}
                      onClick={() => {
                        setOpen(false)
                        setQuery("")
                      }}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 transition-colors",
                        i === activeIdx ? "bg-slate-100" : "hover:bg-slate-50"
                      )}
                    >
                      <img src={hit.image} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-semibold text-[#111111]">{hit.title}</span>
                        <span className="block truncate text-xs text-slate-500">{hit.subtitle}</span>
                      </span>
                      <span className="flex shrink-0 items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                        <hit.icon className="h-3 w-3" /> {hit.typeLabel}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between border-t border-slate-100 px-3 py-2 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <CornerDownLeft className="h-3 w-3" /> open · ↑↓ navigate · esc close
                </span>
                <button
                  type="button"
                  className="font-medium text-[#4F46E5] hover:underline"
                  onClick={() => query.trim() && go(`/deals?q=${encodeURIComponent(query.trim())}`)}
                >
                  See all results
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
