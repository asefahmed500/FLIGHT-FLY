import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyIdToken, bearerToken, isAdminIdentity } from "@/lib/server-auth"
import { verifyBookableItem } from "@/lib/verify-item"
import { rateLimit, clientKeyFromReq } from "@/lib/rate-limit"
import { REF_PREFIX } from "@/lib/config"
import type { BookingItemType, BookingStatus, PaymentType } from "@/lib/types"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const ITEM_TYPES = ["flight", "hotel", "tour", "package", "visa", "ticket"] as const
const PAYMENT_TYPES = ["card", "invoice"] as const

function newRefId(): string {
  return `${REF_PREFIX}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`
}

function parseAmount(price: string): number | null {
  const m = price.replace(/,/g, "").match(/([\d.]+)/)
  if (!m) return null
  const n = Number(m[1])
  return Number.isFinite(n) ? n : null
}

function formatAmount(n: number): string {
  return `$${Number.isInteger(n) ? n : n.toFixed(2)}`
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
  promoCode: string | null
  discount: string | null
  finalPrice: string
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
    promoCode: b.promoCode,
    discount: b.discount,
    finalPrice: b.finalPrice,
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

  // Admin listing: optional pagination + CSV export.
  const take = Math.min(Number(url.searchParams.get("take") ?? 0) || 100, 200)
  const page = Math.max(Number(url.searchParams.get("page") ?? 1), 1)
  const skip = (page - 1) * take

  if (url.searchParams.get("format") === "csv") {
    const rows = await db.booking.findMany({ orderBy: { createdAt: "desc" } })
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`
    const header = "refId,createdAt,status,itemType,itemTitle,passengerName,email,phone,travelDate,guests,nationality,price,promoCode,finalPrice"
    const lines = rows.map((b) =>
      [
        b.refId,
        b.createdAt.toISOString(),
        b.status,
        b.itemType,
        b.itemTitle,
        b.passengerName,
        b.email,
        b.phone ?? "",
        b.travelDate ?? "",
        b.guests ?? "",
        b.nationality ?? "",
        b.price,
        b.promoCode ?? "",
        b.finalPrice,
      ]
        .map(esc)
        .join(",")
    )
    return new NextResponse([header, ...lines].join("\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="flightfly-bookings-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    })
  }

  const [rows, total] = await Promise.all([
    db.booking.findMany({ orderBy: { createdAt: "desc" }, take, skip }),
    db.booking.count(),
  ])
  return NextResponse.json({ items: rows.map(serializeBooking), total, page, take })
}

export async function POST(req: Request) {
  const identity = await verifyIdToken(bearerToken(req))
  if (!identity) return NextResponse.json({ error: "Unauthorized." }, { status: 401 })

  // Rate limit: 10 booking attempts per 10 minutes per user.
  const rl = rateLimit(`book:${clientKeyFromReq(req, identity.uid)}`, 10, 10 * 60 * 1000)
  if (!rl.ok) {
    return NextResponse.json(
      { error: `Too many booking attempts. Try again in ${rl.retryAfterSec}s.` },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    )
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const passengerName = typeof body.passengerName === "string" ? body.passengerName.trim().slice(0, 80) : ""
  const email = typeof body.email === "string" ? body.email.trim().slice(0, 120) : ""
  const itemId = typeof body.itemId === "string" ? body.itemId.trim().slice(0, 120) : ""
  const cabinClass = typeof body.cabinClass === "string" ? body.cabinClass.trim().slice(0, 60) : ""
  const itemType = body.itemType as BookingItemType
  const paymentType = body.paymentType as PaymentType

  const phone = typeof body.phone === "string" ? body.phone.trim().slice(0, 20) : ""
  const travelDate = typeof body.travelDate === "string" ? body.travelDate.trim() : ""
  const nationality = typeof body.nationality === "string" ? body.nationality.trim().slice(0, 60) : ""
  const passportNumber = typeof body.passportNumber === "string" ? body.passportNumber.trim().slice(0, 20) : ""
  const specialRequests = typeof body.specialRequests === "string" ? body.specialRequests.trim().slice(0, 500) : ""
  const guests = typeof body.guests === "number" ? body.guests : null
  const promoCode = typeof body.promoCode === "string" ? body.promoCode.trim().toUpperCase().slice(0, 24) : ""

  if (!passengerName || !email || !cabinClass) {
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
  if (travelDate < new Date().toISOString().split("T")[0]) {
    return NextResponse.json({ error: "Travel date cannot be in the past." }, { status: 400 })
  }
  if (!nationality) {
    return NextResponse.json({ error: "Nationality is required." }, { status: 400 })
  }
  if (guests !== null && (!Number.isInteger(guests) || guests < 1 || guests > 12)) {
    return NextResponse.json({ error: "Number of travelers must be between 1 and 12." }, { status: 400 })
  }

  // SECURITY: never trust client price/title — verify against Firestore.
  const item = await verifyBookableItem(itemId || undefined, typeof body.itemTitle === "string" ? body.itemTitle.trim() : undefined)
  if (!item) {
    return NextResponse.json(
      { error: "This item is no longer available. Refresh the page and try again." },
      { status: 400 }
    )
  }
  const itemTitle = item.title
  const price = item.price
  const baseAmount = parseAmount(price)
  if (baseAmount == null) {
    return NextResponse.json({ error: "Item pricing is unavailable. Try again later." }, { status: 400 })
  }

  // Promo code (optional): validate against Postgres and compute final price.
  let finalPrice = price
  let discount: string | null = null
  let appliedPromo: string | null = null
  if (promoCode) {
    const promo = await db.promoCode.findUnique({ where: { code: promoCode } })
    const valid =
      promo &&
      promo.active &&
      (!promo.expiresAt || promo.expiresAt.getTime() > Date.now()) &&
      promo.percentOff > 0 &&
      promo.percentOff <= 90
    if (!valid) {
      return NextResponse.json({ error: "That promo code is not valid or has expired." }, { status: 400 })
    }
    const off = (baseAmount * (promo as NonNullable<typeof promo>).percentOff) / 100
    finalPrice = formatAmount(Math.max(0, Math.round((baseAmount - off) * 100) / 100))
    discount = `-${(promo as NonNullable<typeof promo>).percentOff}%`
    appliedPromo = promo.code
    await db.promoCode
      .update({ where: { code: promoCode }, data: { usageCount: { increment: 1 } } })
      .catch(() => {})
  }

  // refId collisions are extremely rare but retried rather than 500ing.
  let booking: { id: string; refId: string } | null = null
  for (let attempt = 0; attempt < 3 && !booking; attempt++) {
    try {
      booking = await db.booking.create({
        data: {
          refId: newRefId(),
          userId: identity.uid,
          userEmail: identity.email,
          passengerName,
          email,
          phone,
          itemTitle,
          itemType,
          price,
          promoCode: appliedPromo,
          discount,
          finalPrice,
          cabinClass,
          paymentType,
          travelDate,
          guests,
          nationality,
          passportNumber: passportNumber || null,
          specialRequests: specialRequests || null,
          status: "pending",
        },
        select: { id: true, refId: true },
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : ""
      if (!msg.includes("Unique constraint")) throw err
    }
  }
  if (!booking) {
    return NextResponse.json({ error: "Could not allocate a booking reference. Try again." }, { status: 500 })
  }
  const refId = booking.refId

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
          body: `${refId} · ${passengerName} booked ${itemTitle} (${finalPrice}).`,
        })),
      })
    )
    .catch(() => {})

  await Promise.all([notify, adminNotify])

  return NextResponse.json({ id: booking.id, refId }, { status: 201 })
}