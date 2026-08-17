"use client"

import { useEffect, useState } from "react"
import QRCode from "qrcode"
import { useAuth } from "@/lib/auth-context"
import { useMyBookings } from "@/lib/app-data"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { downloadETicket } from "@/lib/e-ticket"
import { FlightFlyMark } from "@/components/icons"
import { Plane, CalendarDays, Users, Armchair, Download, ScanLine } from "lucide-react"
import Link from "next/link"
import type { Booking } from "@/lib/types"

function PassCard({ pass, email }: { pass: Booking; email?: string | null }) {
  const [qr, setQr] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    QRCode.toDataURL(
      JSON.stringify({ ref: pass.refId, item: pass.passengerName, guest: pass.passengerName, status: pass.status }),
      { margin: 1, width: 240 }
    )
      .then((url) => {
        if (active) setQr(url)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [pass.refId, pass.itemTitle, pass.passengerName, pass.status])

  const meta = [
    { icon: Plane, label: "Type", value: pass.itemType.toUpperCase() },
    { icon: CalendarDays, label: "Travel Date", value: pass.travelDate || "To be confirmed" },
    { icon: Users, label: "Travelers", value: pass.guests != null ? String(pass.guests) : "1" },
    { icon: Armchair, label: "Class / Tier", value: pass.cabinClass },
  ]

  return (
    <Card className="relative overflow-hidden rounded-xl border-slate-800 bg-[#0F172A] text-white p-0">
      {/* Amber edge accent */}
      <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-amber-400 to-[#D97706]" />

      <CardContent className="p-0">
        <div className="grid gap-0 sm:grid-cols-[1fr_auto]">

          {/* Left: pass details */}
          <div className="flex flex-col gap-5 p-6 pl-8">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-white/10">
                  <FlightFlyMark className="size-4 text-amber-400" />
                </div>
                <div className="leading-tight">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">FlightFly Digital Pass</p>
                  <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-emerald-400" /> Approved — valid for travel
                  </p>
                </div>
              </div>
              <Badge className="shrink-0 bg-amber-400 text-slate-950 font-bold text-[10px] uppercase tracking-wide">
                {pass.cabinClass || "Pass"}
              </Badge>
            </div>

            <div>
              <h3 className="text-lg font-semibold leading-snug tracking-[-0.01em] text-white line-clamp-1">
                {pass.itemTitle}
              </h3>
              <p className="mt-1 font-mono text-2xl font-bold tracking-[0.2em] text-amber-300">
                {pass.refId}
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                Primary guest: <span className="font-medium text-slate-200">{pass.passengerName}</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              {meta.map((m) => (
                <div key={m.label} className="flex items-center gap-2.5">
                  <m.icon className="size-3.5 shrink-0 text-amber-400/80" />
                  <div className="min-w-0 leading-tight">
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">{m.label}</p>
                    <p className="truncate text-xs font-medium text-slate-200">{m.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: QR tear-off stub */}
          <div className="relative border-t border-dashed border-slate-700 sm:border-t-0 sm:border-l">
            {/* Notches */}
            <span className="absolute -top-2 left-1/2 hidden size-4 -translate-x-1/2 rounded-full bg-background sm:block" />
            <span className="absolute -bottom-2 left-1/2 hidden size-4 -translate-x-1/2 rounded-full bg-background sm:block" />

            <div className="flex h-full flex-col items-center justify-center gap-3 p-6 sm:w-52">
              <div className="flex h-36 w-36 items-center justify-center rounded-xl bg-white p-2 shadow-lg">
                {qr ? (
                  <img src={qr} alt={`QR code for booking ${pass.refId}`} className="h-full w-full" />
                ) : (
                  <Skeleton className="h-full w-full rounded-md" />
                )}
              </div>
              <p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-slate-400">
                <ScanLine className="size-3 text-amber-400/80" /> Scan at check-in
              </p>
              <Button
                size="sm"
                className="w-full bg-[#D97706] text-xs font-semibold text-white hover:bg-[#B45309]"
                onClick={() => downloadETicket(pass, email)}
              >
                <Download data-icon="inline-start" /> E-Ticket PDF
              </Button>
              <p className="text-center text-[10px] leading-snug text-slate-500 break-all">{email || pass.userEmail}</p>
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPassesPage() {
  const { user } = useAuth()
  const { bookings, loading } = useMyBookings(user)

  const passes = bookings.filter((b) => b.status === "approved")

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.01em]">Digital Passes &amp; QR Codes</h1>
        <p className="text-sm text-muted-foreground">Boarding passes and access codes for approved reservations.</p>
      </div>

      {loading ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-56 w-full max-w-2xl" />
          <Skeleton className="h-56 w-full max-w-2xl" />
        </div>
      ) : passes.length === 0 ? (
        <Card className="max-w-lg rounded-xl">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <ScanLine className="size-10 text-muted-foreground/40" />
            <p className="text-sm font-medium">No active passes yet</p>
            <p className="text-xs text-muted-foreground">
              Approved reservations appear here as digital passes with scannable QR codes and downloadable e-tickets.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {passes.map((pass) => (
            <PassCard key={pass.id} pass={pass} email={user?.email} />
          ))}
        </div>
      )}

      <Separator />
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-muted/50 p-4">
        <div>
          <p className="text-sm font-medium">More passes</p>
          <p className="text-xs text-muted-foreground">Additional QR passes appear as your reservations are approved.</p>
        </div>
        <Button render={<Link href="/#popular-deals" />} size="sm" variant="outline">
          Browse deals to book
        </Button>
      </div>
    </div>
  )
}