"use client"

import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useMyBookings } from "@/lib/app-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { StatCard } from "@/components/stat-card"
import { Ticket, Sparkles, ShieldCheck, ArrowRight, Plane } from "lucide-react"
import { FlightFlyMark } from "@/components/icons"

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-rose-50 text-rose-700 border-rose-200",
  cancelled: "bg-slate-100 text-slate-600 border-slate-200",
}

export default function DashboardOverviewPage() {
  const { user, profile, role } = useAuth()
  const { bookings, loading } = useMyBookings(user)

  const activeBookings = bookings.filter((b) => b.status !== "cancelled")
  const confirmed = bookings.filter((b) => b.status === "approved").length
  const pending = bookings.filter((b) => b.status === "pending").length

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.01em]">
          Welcome back, {profile?.displayName?.split(" ")[0] || "Traveler"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {role === "admin" ? "Executive access active." : "Your VIP travel dashboard."}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Reservations"
          value={bookings.length}
          loading={loading}
          hint={<span className="text-emerald-600 font-medium">{confirmed} confirmed</span>}
          icon={<Ticket className="size-5" />}
        />
        <StatCard
          label="Pending Approval"
          value={pending}
          loading={loading}
          hint={<span className="text-amber-600 font-medium">Awaiting admin review</span>}
          icon={<Sparkles className="size-5" />}
          iconClassName="bg-amber-500/10 text-amber-500"
        />
        <StatCard
          label="Active Trips"
          value={activeBookings.length}
          loading={loading}
          hint={<span className="text-muted-foreground font-medium">Upcoming & in-progress</span>}
          icon={<Plane className="size-5" />}
          iconClassName="bg-[#1E40AF]/10 text-[#1E40AF]"
        />
        <StatCard
          label="Firebase Account"
          value={<span className="truncate text-lg font-semibold">{user?.email || "Authenticated"}</span>}
          hint={<span className="text-emerald-600 font-medium">Auth &amp; Postgres Synced</span>}
          icon={<ShieldCheck className="size-5" />}
          iconClassName="bg-emerald-500/10 text-emerald-500"
        />
      </div>

      <Card className="rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Reservations</CardTitle>
            <CardDescription>Live from PostgreSQL</CardDescription>
          </div>
          <Button render={<Link href="/dashboard/bookings" />} size="sm" variant="outline">
              View all <ArrowRight className="ml-1 size-3.5" data-icon="inline-end" />
            </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <FlightFlyMark className="size-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No reservations yet.</p>
              <Button render={<Link href="/#popular-deals" />} size="sm">Browse deals</Button>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {bookings.slice(0, 5).map((b) => (
                <li key={b.id} className="flex flex-col gap-2 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px]">{b.itemType}</Badge>
                      <span className="font-mono text-xs text-muted-foreground">{b.refId}</span>
                      <Badge variant="outline" className={STATUS_STYLES[b.status]}>{b.status}</Badge>
                    </div>
                    <p className="mt-1 truncate font-semibold">{b.itemTitle}</p>
                    <p className="text-xs text-muted-foreground">{b.cabinClass} • {b.passengerName}</p>
                  </div>
                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <span className="text-lg font-semibold text-primary">{b.price}</span>
                    <Button render={<Link href="/dashboard/passes" />} size="sm" variant="ghost">Pass</Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}