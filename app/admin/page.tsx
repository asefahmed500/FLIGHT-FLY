"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatCard } from "@/components/stat-card"
import { DollarSign, FileText, Users, ShieldCheck, ArrowRight } from "lucide-react"
import { useAllBookings, useUsers } from "@/lib/app-data"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"
import type { Booking } from "@/lib/types"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function parsePrice(value: string | undefined | null): number {
  if (!value) return 0
  const num = parseFloat(value.replace(/[^0-9.]/g, ""))
  return Number.isFinite(num) ? num : 0
}

function bookingMonth(b: { createdAt?: { seconds?: number; nanoseconds?: number } | string }): number {
  const t = b.createdAt
  if (t && typeof t === "object" && "seconds" in t && typeof t.seconds === "number") {
    return new Date(t.seconds * 1000).getMonth()
  }
  if (typeof t === "string") return new Date(t).getMonth()
  return -1
}

function ts(b: { createdAt?: { seconds?: number; nanoseconds?: number } | string }): number {
  const t = b.createdAt
  if (t && typeof t === "object" && "seconds" in t && typeof t.seconds === "number") {
    return t.seconds * 1000
  }
  if (typeof t === "string") {
    const v = new Date(t).getTime()
    if (Number.isFinite(v)) return v
  }
  return 0
}

function gross(b: Booking): number {
  return parsePrice(b.finalPrice || b.price)
}

export default function AdminOverviewPage() {
  const { user } = useAuth()
  const { bookings, loading } = useAllBookings(user)
  const { users, loading: usersLoading } = useUsers(user)

  const approved = bookings.filter((b) => b.status === "approved")
  const pending = bookings.filter((b) => b.status === "pending")
  const revenue = approved.reduce((sum, b) => sum + gross(b), 0)
  const avgTicket = approved.length ? revenue / approved.length : 0

  const monthly: Record<number, number> = {}
  approved.forEach((b) => {
    const m = bookingMonth(b)
    if (m >= 0) monthly[m] = (monthly[m] || 0) + gross(b)
  })
  const revenueData = MONTH_NAMES.map((month, i) => ({ month, revenue: monthly[i] || 0 }))

  const fmt = (n: number) => (n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n.toFixed(0)}`)
  const loadingAll = loading || usersLoading

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Badge className="bg-amber-500 text-slate-950 font-semibold mb-2">ADMIN PRIVILEGE ACCESS</Badge>
        <h1 className="text-2xl font-semibold tracking-[-0.01em]">Executive Travel Control Center</h1>
        <p className="text-sm text-muted-foreground">Role-based dashboard secured by PostgreSQL + admin allowlist.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Approved Revenue"
          value={loadingAll ? undefined : fmt(revenue)}
          loading={loadingAll}
          hint={<span className="text-emerald-600 font-medium">{approved.length} approved bookings</span>}
          icon={<DollarSign className="size-5" />}
          iconClassName="bg-emerald-500/10 text-emerald-600"
        />
        <StatCard
          label="Total Reservations"
          value={loading ? undefined : bookings.length}
          loading={loading}
          hint={<span className="text-blue-600 font-medium">{pending.length} awaiting review</span>}
          icon={<FileText className="size-5" />}
          iconClassName="bg-[#4F46E5]/10 text-[#4F46E5]"
        />
        <StatCard
          label="Active Users"
          value={usersLoading ? undefined : users.length}
          loading={usersLoading}
          hint={<span className="text-amber-600 font-medium">Auth accounts synced</span>}
          icon={<Users className="size-5" />}
          iconClassName="bg-amber-500/10 text-amber-500"
        />
        <StatCard
          label="Security Status"
          value={<span className="text-lg font-semibold text-emerald-700">rules_version = &apos;2&apos;</span>}
          hint={<span className="text-emerald-600 font-medium">Role-Based Access Enforced</span>}
          icon={<ShieldCheck className="size-5" />}
          iconClassName="bg-emerald-500/10 text-emerald-500"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Card className="rounded-xl lg:col-span-8">
          <CardHeader>
            <CardTitle>Monthly Revenue Breakdown ($)</CardTitle>
            <CardDescription>Computed from approved bookings in PostgreSQL</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-72 w-full" />
            ) : approved.length === 0 ? (
              <div className="flex h-72 flex-col items-center justify-center gap-2 text-center">
                <DollarSign className="size-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No approved bookings yet — the chart fills in once revenue flows.</p>
              </div>
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%" minHeight={280}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#4F46E5" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-xl lg:col-span-4">
          <CardHeader>
            <CardTitle>Platform Performance</CardTitle>
            <CardDescription>Live from PostgreSQL &amp; Auth SDK</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {loadingAll ? (
              <Skeleton className="h-24 w-full" />
            ) : (
              <>
                <div className="flex items-center justify-between rounded-lg border-b border-border pb-2 text-sm">
                  <span className="text-muted-foreground">Booking Conversion Rate</span>
                  <span className="font-semibold">
                    {bookings.length ? `${((approved.length / bookings.length) * 100).toFixed(1)}%` : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border-b border-border pb-2 text-sm">
                  <span className="text-muted-foreground">Avg. Ticket Price</span>
                  <span className="font-semibold">{approved.length ? fmt(avgTicket) : "—"}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border-b border-border pb-2 text-sm">
                  <span className="text-muted-foreground">Pending Reviews</span>
                  <span className="font-semibold">{pending.length}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border-b border-border pb-2 text-sm">
                  <span className="text-muted-foreground">Rejected</span>
                  <span className="font-semibold">{bookings.filter((b) => b.status === "rejected").length}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent reservations table */}
      <Card className="rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Reservations</CardTitle>
            <CardDescription>Latest bookings synced from PostgreSQL</CardDescription>
          </div>
          <Button render={<Link href="/admin/bookings" />} size="sm" variant="outline">
            View all <ArrowRight className="size-3.5" data-icon="inline-end" />
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-24 w-full" />
          ) : bookings.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No reservations yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Ref</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...bookings]
                  .sort((a, b) => ts(b) - ts(a))
                  .slice(0, 5)
                  .map((b: Booking) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-mono text-xs font-semibold text-[#4F46E5]">{b.refId}</TableCell>
                      <TableCell className="font-medium">{b.passengerName}</TableCell>
                      <TableCell>
                        <p className="font-medium">{b.itemTitle}</p>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">{b.itemType}</p>
                      </TableCell>
                      <TableCell className="font-semibold text-emerald-600">
                        {b.finalPrice && b.finalPrice !== b.price ? (
                          <span>
                            <span className="mr-1 line-through text-muted-foreground">{b.price}</span>
                            {b.finalPrice}
                          </span>
                        ) : (
                          b.price
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "capitalize",
                            b.status === "approved" && "bg-emerald-50 text-emerald-700 border-emerald-200",
                            b.status === "pending" && "bg-amber-50 text-amber-700 border-amber-200",
                            b.status === "rejected" && "bg-rose-50 text-rose-700 border-rose-200",
                            b.status === "cancelled" && "bg-slate-100 text-slate-600 border-slate-200"
                          )}
                        >
                          {b.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}