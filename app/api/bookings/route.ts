import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyIdToken, bearerToken, isAdminIdentity } from "@/lib/server-auth"
import type { BookingItemType, BookingStatus, PaymentType } from "@/lib/types"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const ITEM_TYPES = ["flight", "hotel", "tour", "package", "visa", "ticket"] as const
const PAYMENT_TYPES = ["card", "invoice"] as const

function newRefId(): string {
  return `FL-${Math.random().toString(36).slice(2, 7).toUpperCase()}`
}

function serializeBooking(b: {
  id: string
  refId: string
  userId: string
  userEmail: string
  passengerName: string
  email: string
  phone: string | null
  itemTitle: string
  itemType: BookingItemType
  price: string
  cabinClass: string
  paymentType: PaymentType
  travelDate: string | null
  guests: number | null
  nationality: string | null
  passportNumber: string | null
  specialRequests: string | null
  status: BookingStatus
  createdAt: Date
}) {
  return {
    id: b.id,
    refId: b.refId,
    userId: b.userId,
    userEmail: b.userEmail,
    passengerName: b.passengerName,
    email: b.email,
    phone: b.phone,
    itemTitle: b.itemTitle,
    itemType: b.itemType,
    price: b.price,
    cabinClass: b.cabinClass,
    paymentType: b.paymentType,
    travelDate: b.travelDate,
    guests: b.guests,
    nationality: b.nationality,
    passportNumber: b.passportNumber,
    specialRequests: b.specialRequests,
    status: b.status,
    createdAt: b.createdAt.toISOString(),
  }
}

export async function GET(req: Request) {
  const identity = await verifyIdToken(bearerToken(req))
  if (!identity) return NextResponse.json({ error: "Unauthorized." }, { status: 401 })

  const url = new URL(req.url)
  const userId = url.searchParams.get("userId")

  // My bookings, or (admin) all bookings.
  if (userId) {
    if (userId !== identity.uid && !(await isAdminIdentity(identity))) {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 })
    }
    const rows = await db.booking.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(rows.map(serializeBooking))
  }

  if (!(await isAdminIdentity(identity))) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 })
  }
  const rows = await db.booking.findMany({ orderBy: { createdAt: "desc" } })
  return NextResponse.json(rows.map(serializeBooking))
}

export async function POST(req: Request) {
  const identity = await verifyIdToken(bearerToken(req))
  if (!identity) return NextResponse.json({ error: "Unauthorized." }, { status: 401 })

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const passengerName = typeof body.passengerName === "string" ? body.passengerName.trim() : ""
  const email = typeof body.email === "string" ? body.email.trim() : ""
  const itemTitle = typeof body.itemTitle === "string" ? body.itemTitle.trim() : ""
  const price = typeof body.price === "string" ? body.price.trim() : ""
  const cabinClass = typeof body.cabinClass === "string" ? body.cabinClass.trim() : ""
  const itemType = body.itemType as BookingItemType
  const paymentType = body.paymentType as PaymentType

  const phone = typeof body.phone === "string" ? body.phone.trim() : ""
  const travelDate = typeof body.travelDate === "string" ? body.travelDate.trim() : ""
  const nationality = typeof body.nationality === "string" ? body.nationality.trim() : ""
  const passportNumber = typeof body.passportNumber === "string" ? body.passportNumber.trim() : ""
  const specialRequests = typeof body.specialRequests === "string" ? body.specialRequests.trim() : ""
  const guests = typeof body.guests === "number" ? body.guests : null

  if (!passengerName || !email || !itemTitle || !price || !cabinClass) {
    return NextResponse.json({ error: "Missing required booking fields." }, { status: 400 })
  }
  if (!ITEM_TYPES.includes(itemType)) {
    return NextResponse.json({ error: "Invalid item type." }, { status: 400 })
  }
  if (!PAYMENT_TYPES.includes(paymentType)) {
    return NextResponse.json({ error: "Invalid payment type." }, { status: 400 })
  }
  if (!/^\+?[0-9 ()-]{7,20}$/.test(phone)) {
    return NextResponse.json({ error: "A valid contact phone number is required." }, { status: 400 })
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(travelDate)) {
    return NextResponse.json({ error: "A travel date is required (YYYY-MM-DD)." }, { status: 400 })
  }
  if (!nationality) {
    return NextResponse.json({ error: "Nationality is required." }, { status: 400 })
  }
  if (guests !== null && (!Number.isInteger(guests) || guests < 1 || guests > 12)) {
    return NextResponse.json({ error: "Number of travelers must be between 1 and 12." }, { status: 400 })
  }

  const refId = newRefId()
  const booking = await db.booking.create({
    data: {
      refId,
      userId: identity.uid,
      userEmail: identity.email,
      passengerName,
      email,
      phone,
      itemTitle,
      itemType,
      price,
      cabinClass,
      paymentType,
      travelDate,
      guests,
      nationality,
      passportNumber: passportNumber || null,
      specialRequests: specialRequests || null,
      status: "pending",
    },
  })

  // Notify the customer + every admin (never block the response on failures).
  const notify = db.notification
    .create({
      data: {
        userId: identity.uid,
        title: "Reservation received",
        body: `${refId} · ${itemTitle} is pending approval. Track it in your dashboard.`,
      },
    })
    .catch(() => {})

  const adminNotify = db.user
    .findMany({ where: { role: "admin" }, select: { uid: true } })
    .then((admins) =>
      db.notification.createMany({
        data: admins.map((a) => ({
          userId: a.uid,
          title: "New booking received",
          body: `${refId} · ${passengerName} booked ${itemTitle} (${price}).`,
        })),
      })
    )
    .catch(() => {})

  await Promise.all([notify, adminNotify])

  return NextResponse.json({ id: booking.id, refId }, { status: 201 })
}