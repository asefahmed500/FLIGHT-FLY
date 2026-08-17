"use client"

import { useAuth } from "@/lib/auth-context"
import { useMyBookings } from "@/lib/app-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Download, Ticket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { downloadETicket } from "@/lib/e-ticket"

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-rose-50 text-rose-700 border-rose-200",
  cancelled: "bg-slate-100 text-slate-600 border-slate-200",
}

export default function DashboardBookingsPage() {
  const { user } = useAuth()
  const { bookings, loading } = useMyBookings(user)

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
        <Card className="rounded-2xl">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <Ticket className="size-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">You have no bookings yet. Reserve a deal from the website.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {bookings.map((booking) => (
            <Card key={booking.id} className="rounded-2xl">
              <CardContent className="p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="text-[10px]">{booking.itemType}</Badge>
                      <span className="font-mono text-xs text-muted-foreground">ID: {booking.refId}</span>
                      <Badge variant="outline" className={STATUS_STYLES[booking.status]}>{booking.status}</Badge>
                    </div>
                    <h3 className="text-lg font-semibold tracking-[-0.01em]">{booking.itemTitle}</h3>
                    <p className="text-xs text-muted-foreground">
                      {booking.cabinClass} • Guest: {booking.passengerName} • {booking.paymentType === "card" ? "Credit / Debit Card" : "Corporate Invoice"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Total Amount</p>
                      <p className="text-xl font-semibold text-primary">{booking.price}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => downloadETicket(booking, user?.email)}>
                      <Download className="size-3.5" data-icon="inline-start" /> E-Ticket
                    </Button>
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