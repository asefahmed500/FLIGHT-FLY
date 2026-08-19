"use client"

import { useMemo, useState } from "react"
import { useAllBookings, setBookingStatus, deleteBooking } from "@/lib/app-data"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Check, X, Trash2, Search, FileText, Eye, Download, ChevronLeft, ChevronRight, Phone, Mail, CalendarDays, Users, Globe2, FileBadge, CreditCard, MessageSquare } from "lucide-react"
import { DataErrorBanner } from "@/components/data-error-banner"
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
  const { bookings, total, page, setPage, loading, error: loadError, refresh } = useAllBookings(user)
  const [filter, setFilter] = useState<StatusFilter>("all")
  const [query, setQuery] = useState("")
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [detail, setDetail] = useState<Booking | null>(null)
  const [exporting, setExporting] = useState(false)

  const pageCount = Math.max(1, Math.ceil(total / 25))

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
    return list
  }, [bookings, filter, query])

  const act = (b: Booking, status: BookingStatus) => async () => {
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

  const exportCsv = async () => {
    if (!user || exporting) return
    setExporting(true)
    try {
      const token = await user.getIdToken()
      const res = await fetch("/api/bookings?format=csv", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("Export failed")
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `flightfly-bookings-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setError("Could not export CSV.")
    } finally {
      setExporting(false)
    }
  }

  const detailRows = detail
    ? [
        { icon: Phone, label: "Phone", value: detail.phone || "—" },
        { icon: Mail, label: "Confirmation Email", value: detail.email },
        { icon: CalendarDays, label: "Travel Date", value: detail.travelDate || "To be confirmed" },
        { icon: Users, label: "Travelers", value: detail.guests != null ? String(detail.guests) : "—" },
        { icon: Globe2, label: "Nationality", value: detail.nationality || "—" },
        { icon: FileBadge, label: "Passport No.", value: detail.passportNumber || "—" },
        { icon: CreditCard, label: "Payment", value: detail.paymentType === "card" ? "Credit / Debit Card" : "Corporate Invoice" },
      ]
    : []

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Badge className="mb-2 bg-[#4F46E5] font-semibold text-white">POSTGRES · REAL-TIME</Badge>
          <h1 className="text-2xl font-semibold tracking-[-0.01em]">Reservation Manager</h1>
          <p className="text-sm text-muted-foreground">Approve, reject or cancel customer bookings — synced live from PostgreSQL.</p>
        </div>
        <Button variant="outline" size="sm" onClick={exportCsv} disabled={exporting} className="h-9 border-slate-200 text-xs">
          <Download data-icon="inline-start" /> {exporting ? "Exporting…" : "Export CSV"}
        </Button>
      </div>

      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-600">{error}</div>}

      <DataErrorBanner error={loadError} onRetry={refresh} context="reservations" />

      {/* Status filter chips with counts */}
      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              "flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium transition-all",
              filter === s
                ? "border-[#4F46E5] bg-[#4F46E5] text-white shadow-md"
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
              <FileText className="size-4 text-[#4F46E5]" /> Reservations
            </CardTitle>
            <CardDescription>
              {loading ? "Syncing…" : `${visible.length} shown · ${total} total`}
            </CardDescription>
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
            <>
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
                      <TableCell>
                        <button
                          onClick={() => setDetail(b)}
                          className="font-mono text-xs font-semibold text-[#4F46E5] hover:underline"
                        >
                          {b.refId}
                        </button>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{b.passengerName}</p>
                        <p className="text-xs text-muted-foreground">{b.userEmail}</p>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{b.itemTitle}</p>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">{b.itemType}</p>
                      </TableCell>
                      <TableCell>
                        {b.promoCode && b.finalPrice && b.finalPrice !== b.price ? (
                          <>
                            <p className="text-xs text-slate-400 line-through">{b.price}</p>
                            <p className="font-semibold text-emerald-600">{b.finalPrice}</p>
                          </>
                        ) : (
                          <span className="font-semibold text-emerald-600">{b.finalPrice || b.price}</span>
                        )}
                      </TableCell>
                      <TableCell>{statusBadge(b.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            aria-label={`View ${b.refId} details`}
                            onClick={() => setDetail(b)}
                            className="text-muted-foreground hover:text-[#4F46E5]"
                          >
                            <Eye />
                          </Button>
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
                          <AlertDialog>
                            <AlertDialogTrigger
                              render={
                                <Button
                                  size="icon-sm"
                                  variant="ghost"
                                  disabled={busy === b.id}
                                  aria-label={`Delete ${b.refId}`}
                                  className="text-muted-foreground hover:text-destructive"
                                />
                              }
                            >
                              <Trash2 />
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete booking {b.refId}?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This permanently removes {b.passengerName}&apos;s reservation for {b.itemTitle}. Consider rejecting or cancelling instead to keep the audit trail.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Keep it</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-rose-600 text-white hover:bg-rose-700"
                                  render={<Button />}
                                  onClick={(e) => {
                                    e.preventDefault()
                                    remove(b)()
                                  }}
                                >
                                  Delete permanently
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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
                          className="mt-1 text-xs font-medium text-[#4F46E5] hover:underline"
                        >
                          Clear filters
                        </button>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              {pageCount > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Page {page} of {pageCount}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)} className="h-8 text-xs">
                      <ChevronLeft data-icon="inline-start" /> Prev
                    </Button>
                    <Button variant="outline" size="sm" disabled={page >= pageCount} onClick={() => setPage(page + 1)} className="h-8 text-xs">
                      Next <ChevronRight data-icon="inline-end" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Booking detail dialog */}
      <Dialog open={!!detail} onOpenChange={(open) => !open && setDetail(null)}>
        <DialogContent className="sm:max-w-[520px] overflow-y-auto max-h-[92dvh] rounded-2xl bg-white p-0">
          {detail && (
            <>
              <div className="bg-[#111111] p-5 text-white">
                <div className="mb-2 flex items-center justify-between">
                  <DialogTitle className="text-lg font-semibold tracking-[-0.01em] text-white">
                    {detail.refId}
                  </DialogTitle>
                  {statusBadge(detail.status)}
                </div>
                <DialogDescription className="text-sm text-slate-300">
                  {detail.itemTitle} · <span className="uppercase">{detail.itemType}</span>
                </DialogDescription>
              </div>
              <div className="flex flex-col gap-4 p-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Traveler</p>
                  <p className="mt-1 text-base font-semibold text-[#111111]">{detail.passengerName}</p>
                  <p className="text-xs text-muted-foreground">Account: {detail.userEmail}</p>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  {detailRows.map((r) => (
                    <div key={r.label} className="flex items-center gap-2.5">
                      <r.icon className="size-3.5 shrink-0 text-[#4F46E5]" />
                      <div className="min-w-0 leading-tight">
                        <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">{r.label}</p>
                        <p className="truncate text-xs font-medium text-slate-800">{r.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">Class / Tier</p>
                    <p className="text-xs font-medium text-slate-800">{detail.cabinClass}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                      {detail.promoCode ? `Total (${detail.promoCode} ${detail.discount ?? ""})` : "Total"}
                    </p>
                    {detail.promoCode && detail.finalPrice !== detail.price ? (
                      <p className="text-xs">
                        <span className="mr-1 text-slate-400 line-through">{detail.price}</span>
                        <span className="font-semibold text-emerald-600">{detail.finalPrice}</span>
                      </p>
                    ) : (
                      <p className="text-sm font-semibold text-emerald-600">{detail.finalPrice || detail.price}</p>
                    )}
                  </div>
                </div>

                {detail.specialRequests && (
                  <div className="flex items-start gap-2.5 rounded-xl bg-slate-50 p-3">
                    <MessageSquare className="mt-0.5 size-3.5 shrink-0 text-slate-400" />
                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">Special Requests</p>
                      <p className="text-xs leading-snug text-slate-700">{detail.specialRequests}</p>
                    </div>
                  </div>
                )}

                {detail.status === "pending" && (
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => { act(detail, "approved")(); setDetail(null) }}>
                      <Check data-icon="inline-start" /> Approve
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50" onClick={() => { act(detail, "rejected")(); setDetail(null) }}>
                      <X data-icon="inline-start" /> Reject
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}