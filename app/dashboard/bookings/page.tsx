"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useMyBookings, setBookingStatus } from "@/lib/app-data"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
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
import { Download, Ticket, XCircle, Loader2 } from "lucide-react"
import { downloadETicket } from "@/lib/e-ticket"
import { useToastStore } from "@/lib/stores/toast-store"
import type { Booking } from "@/lib/types"

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-rose-50 text-rose-700 border-rose-200",
  cancelled: "bg-slate-100 text-slate-600 border-slate-200",
}

function CancelButton({ booking, onDone }: { booking: Booking; onDone: () => void }) {
  const { user } = useAuth()
  const pushToast = useToastStore((s) => s.push)
  const [busy, setBusy] = useState(false)

  const cancel = async () => {
    if (!user || busy) return
    setBusy(true)
    try {
      await setBookingStatus(user, booking.id, "cancelled")
      pushToast({
        variant: "success",
        title: "Reservation cancelled",
        description: `${booking.refId} has been cancelled.`,
      })
      onDone()
    } catch (err) {
      pushToast({
        variant: "error",
        title: "Could not cancel",
        description: err instanceof Error ? err.message : "Please try again.",
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button size="sm" variant="outline" className="h-9 border-rose-200 text-rose-600 hover:bg-rose-50" />}>
        {busy ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <XCircle data-icon="inline-start" />}
        Cancel
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel reservation {booking.refId}?</AlertDialogTitle>
          <AlertDialogDescription>
            This cancels {booking.itemTitle} ({booking.finalPrice || booking.price}). The action cannot be undone — you can rebook anytime while the offer is live.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep booking</AlertDialogCancel>
          <AlertDialogAction
            className="bg-rose-600 text-white hover:bg-rose-700"
            render={<Button />}
            onClick={(e) => {
              e.preventDefault()
              cancel()
            }}
          >
            {busy ? "Cancelling…" : "Yes, cancel it"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default function DashboardBookingsPage() {
  const { user } = useAuth()
  const { bookings, loading, refresh } = useMyBookings(user)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.01em]">My Reservations</h1>
        <p className="text-sm text-muted-foreground">Bookings synced from PostgreSQL in real time.</p>
      </div>

      {loading ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : bookings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <Ticket className="size-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">You have no bookings yet. Reserve a deal from the website.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {bookings.map((booking) => (
            <Card key={booking.id} className="rounded-xl">
              <CardContent className="p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="text-[10px]">{booking.itemType}</Badge>
                      <span className="font-mono text-xs text-muted-foreground">ID: {booking.refId}</span>
                      <Badge variant="outline" className={STATUS_STYLES[booking.status]}>{booking.status}</Badge>
                      {booking.promoCode && (
                        <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-[10px] text-emerald-700">
                          {booking.promoCode} {booking.discount}
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold tracking-[-0.01em]">{booking.itemTitle}</h3>
                    <p className="text-xs text-muted-foreground">
                      {booking.cabinClass} • Guest: {booking.passengerName} • {booking.paymentType === "card" ? "Credit / Debit Card" : "Corporate Invoice"}
                      {booking.travelDate ? ` • Travel: ${booking.travelDate}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      {booking.promoCode && booking.discount ? (
                        <>
                          <p className="text-xs text-slate-400 line-through">{booking.price}</p>
                          <p className="text-xl font-semibold text-primary">{booking.finalPrice || booking.price}</p>
                        </>
                      ) : (
                        <p className="text-xl font-semibold text-primary">{booking.finalPrice || booking.price}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      {booking.status === "pending" && <CancelButton booking={booking} onDone={refresh} />}
                      <Button size="sm" variant="outline" onClick={() => downloadETicket(booking, user?.email)}>
                        <Download className="size-3.5" data-icon="inline-start" /> E-Ticket
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}