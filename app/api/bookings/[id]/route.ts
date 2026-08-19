import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyIdToken, bearerToken, isAdminIdentity } from "@/lib/server-auth"
import type { BookingStatus } from "@/lib/types"

export const runtime = "nodejs"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const identity = await verifyIdToken(bearerToken(req))
  if (!identity) return NextResponse.json({ error: "Unauthorized." }, { status: 401 })

  let body: { status?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }
  const status = body.status as BookingStatus
  if (status !== "pending" && status !== "approved" && status !== "rejected" && status !== "cancelled") {
    return NextResponse.json({ error: "Invalid booking status." }, { status: 400 })
  }

  const booking = await db.booking.findUnique({ where: { id } })
  if (!booking) return NextResponse.json({ error: "Booking not found." }, { status: 404 })

  const isAdmin = await isAdminIdentity(identity)
  if (!isAdmin) {
    // Customers may only cancel their own pending bookings.
    if (booking.userId !== identity.uid || booking.status !== "pending" || status !== "cancelled") {
      return NextResponse.json({ error: "You can only cancel your own pending bookings." }, { status: 403 })
    }
  }

  const updated = await db.booking.update({ where: { id }, data: { status } })

  // Notify the customer about their booking status change.
  const STATUS_TEXT: Record<string, string> = {
    approved: "approved — your e-ticket is being issued",
    rejected: "rejected — contact concierge for alternatives",
    cancelled: "cancelled — any held funds are released",
    pending: "moved back to pending review",
  }
  await db.notification
    .create({
      data: {
        userId: updated.userId,
        title: `Booking ${updated.refId} ${status}`,
        body: `${updated.itemTitle} (${updated.price}) ${STATUS_TEXT[status] ?? `status: ${status}`}.`,
      },
    })
    .catch(() => {})

  return NextResponse.json({ id: updated.id, status: updated.status })
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const identity = await verifyIdToken(bearerToken(req))
  if (!identity) return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  if (!(await isAdminIdentity(identity))) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 })
  }

  const existing = await db.booking.findUnique({
    where: { id },
    select: { id: true, refId: true, userId: true, itemTitle: true, finalPrice: true },
  })
  if (!existing) return NextResponse.json({ error: "Booking not found." }, { status: 404 })

  // Notify the customer BEFORE the delete cascades their notification rows.
  await db.notification
    .create({
      data: {
        userId: existing.userId,
        title: `Booking ${existing.refId} removed`,
        body: `${existing.itemTitle} (${existing.finalPrice}) was removed by our concierge team. Contact support with any questions.`,
      },
    })
    .catch(() => {})

  await db.booking.delete({ where: { id } }).catch(() => {})
  return NextResponse.json({ ok: true })
}