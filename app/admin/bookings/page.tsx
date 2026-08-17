"use client"

import { useMemo, useState } from "react"
import { useAllBookings, setBookingStatus, deleteBooking } from "@/lib/app-data"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Check, X, Trash2, Search, FileText } from "lucide-react"
import type { Booking, BookingStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

const STATUS_OPTIONS = ["all", "pending", "approved", "rejected", "cancelled"] as const
type StatusFilter = (typeof STATUS_OPTIONS)[number]

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-rose-50 text-rose-700 border-rose-200",
  cancelled: "bg-slate-100 text-slate-600 border-slate-200",
}

const STATUS_DOT: Record<string, string> = {
  pending: "bg-amber-500",
  approved: "bg-emerald-500",
  rejected: "bg-rose-500",
  cancelled: "bg-slate-400",
}

function statusBadge(status: string) {
  return (
    <Badge variant="outline" className={cn("capitalize", STATUS_STYLES[status])}>
      {status}
    </Badge>
  )
}

export default function AdminBookingsPage() {
  const { user } = useAuth()
  const { bookings, loading, refresh } = useAllBookings(user)
  const [filter, setFilter] = useState<StatusFilter>("all")
  const [query, setQuery] = useState("")
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState("")

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: bookings.length }
    for (const s of STATUS_OPTIONS) if (s !== "all") c[s] = bookings.filter((b) => b.status === s).length
    return c
  }, [bookings])

  const visible = useMemo(() => {
    let list = bookings
    if (filter !== "all") list = list.filter((b) => b.status === filter)
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(
        (b) =>
          b.refId.toLowerCase().includes(q) ||
          b.passengerName.toLowerCase().includes(q) ||
          (b.userEmail || "").toLowerCase().includes(q) ||
          b.itemTitle.toLowerCase().includes(q)
      )
    }
    return [...list].sort((a, b) => {
      const at = a.createdAt && typeof a.createdAt === "object" ? a.createdAt.seconds || 0 : 0
      const bt = b.createdAt && typeof b.createdAt === "object" ? b.createdAt.seconds || 0 : 0
      return bt - at
    })
  }, [bookings, filter, query])

  const act = (b: Booking, status: Booking["status"]) => async () => {
    setBusy(b.id)
    setError("")
    try {
      await setBookingStatus(user!, b.id, status)
      refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update booking status.")
    } finally {
      setBusy(null)
    }
  }

  const remove = (b: Booking) => async () => {
    setBusy(b.id)
    setError("")
    try {
      await deleteBooking(user!, b.id)
      refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete booking.")
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Badge className="mb-2 bg-[#1E40AF] font-semibold text-white">POSTGRES · REAL-TIME</Badge>
          <h1 className="text-2xl font-semibold tracking-[-0.01em]">Reservation Manager</h1>
          <p className="text-sm text-muted-foreground">Approve, reject or cancel customer bookings — synced live from PostgreSQL.</p>
        </div>
      </div>

      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-600">{error}</div>}

      {/* Status filter chips with counts */}
      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              "flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium transition-all",
              filter === s
                ? "border-[#1E40AF] bg-[#1E40AF] text-white shadow-md"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
            )}
          >
            {s !== "all" && <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT[s])} />}
            <span className="capitalize">{s}</span>
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                filter === s ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
              )}
            >
              {counts[s] ?? 0}
            </span>
          </button>
        ))}
      </div>

      <Card className="rounded-xl">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-4 text-[#1E40AF]" /> Reservations
            </CardTitle>
            <CardDescription>{loading ? "Syncing…" : `${visible.length} booking(s)`}</CardDescription>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search ref, customer, item…"
              className="h-10 pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Ref</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-mono text-xs font-semibold text-[#1E40AF]">{b.refId}</TableCell>
                    <TableCell>
                      <p className="font-medium">{b.passengerName}</p>
                      <p className="text-xs text-muted-foreground">{b.userEmail}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{b.itemTitle}</p>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">{b.itemType}</p>
                    </TableCell>
                    <TableCell className="font-semibold text-emerald-600">{b.price}</TableCell>
                    <TableCell>{statusBadge(b.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {b.status === "pending" && (
                          <>
                            <Button size="sm" onClick={act(b, "approved")} disabled={busy === b.id} className="h-8 bg-emerald-600 hover:bg-emerald-700">
                              <Check className="size-3.5" data-icon="inline-start" /> Approve
                            </Button>
                            <Button size="sm" variant="outline" onClick={act(b, "rejected")} disabled={busy === b.id} className="h-8 border-rose-200 text-rose-600 hover:bg-rose-50">
                              <X className="size-3.5" data-icon="inline-start" /> Reject
                            </Button>
                          </>
                        )}
                        <Button size="icon-sm" variant="ghost" onClick={remove(b)} disabled={busy === b.id} aria-label={`Delete ${b.refId}`} className="text-muted-foreground hover:text-destructive">
                          <Trash2 />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {visible.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center">
                      <p className="text-sm font-medium text-muted-foreground">No bookings match your filters.</p>
                      <button
                        onClick={() => {
                          setFilter("all")
                          setQuery("")
                        }}
                        className="mt-1 text-xs font-medium text-[#1E40AF] hover:underline"
                      >
                        Clear filters
                      </button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}