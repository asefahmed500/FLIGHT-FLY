import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyIdToken, bearerToken, isAdminIdentity } from "@/lib/server-auth"
import { rateLimit, clientKeyFromReq } from "@/lib/rate-limit"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(req: Request) {
  // Public mode: the landing promo banner advertises one active promo.
  // Exposes only what the banner already shouts from the rooftops — the code
  // and its discount — with no auth required.
  if (new URL(req.url).searchParams.get("featured") === "1") {
    const rows = await db.promoCode.findMany({
      where: { active: true, percentOff: { gte: 1, lte: 90 } },
      orderBy: { createdAt: "desc" },
      take: 5,
    })
    const now = Date.now()
    const live = rows.find((p) => !p.expiresAt || p.expiresAt.getTime() > now) ?? null
    if (!live) return NextResponse.json({ promo: null })
    return NextResponse.json({
      promo: {
        code: live.code,
        percentOff: live.percentOff,
        expiresAt: live.expiresAt ? live.expiresAt.toISOString() : null,
      },
    })
  }

  const identity = await verifyIdToken(bearerToken(req))
  if (!identity) return NextResponse.json({ error: "Unauthorized." }, { status: 401 })

  if (!(await isAdminIdentity(identity))) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 })
  }

  const rows = await db.promoCode.findMany({ orderBy: { createdAt: "desc" } })
  return NextResponse.json(
    rows.map((p) => ({
      id: p.id,
      code: p.code,
      percentOff: p.percentOff,
      active: p.active,
      description: p.description,
      usageCount: p.usageCount,
      expiresAt: p.expiresAt ? p.expiresAt.toISOString() : null,
      createdAt: p.createdAt.toISOString(),
    }))
  )
}

// Public-ish endpoint (any signed-in user): validate a code without redeeming.
export async function POST(req: Request) {
  const identity = await verifyIdToken(bearerToken(req))
  if (!identity) return NextResponse.json({ error: "Unauthorized." }, { status: 401 })

  // Validate endpoint vs admin create: distinguish by body shape.
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const isAdmin = await isAdminIdentity(identity)

  // Admin create/update: { code, percentOff, description?, expiresAt? }
  if (isAdmin && typeof body.code === "string" && typeof body.percentOff === "number") {
    const code = body.code.trim().toUpperCase().slice(0, 24)
    const percentOff = Math.round(body.percentOff)
    if (!/^[A-Z0-9]{3,24}$/.test(code)) {
      return NextResponse.json({ error: "Code must be 3-24 letters/digits." }, { status: 400 })
    }
    if (!Number.isInteger(percentOff) || percentOff < 1 || percentOff > 90) {
      return NextResponse.json({ error: "Percent off must be 1-90." }, { status: 400 })
    }
    const description =
      typeof body.description === "string" ? body.description.trim().slice(0, 200) : null
    const expiresAt =
      typeof body.expiresAt === "string" && !isNaN(Date.parse(body.expiresAt))
        ? new Date(body.expiresAt)
        : null

    const promo = await db.promoCode.upsert({
      where: { code },
      create: { code, percentOff, description, expiresAt },
      update: {
        percentOff,
        description,
        expiresAt,
        active: body.active === false ? false : true,
      },
    })
    return NextResponse.json({ promo }, { status: 201 })
  }

  // Customer validate: { validate: "CODE" }
  const code = typeof body.validate === "string" ? body.validate.trim().toUpperCase().slice(0, 24) : ""
  if (!code) return NextResponse.json({ error: "Missing code to validate." }, { status: 400 })

  const rl = rateLimit(`promo:${clientKeyFromReq(req, identity.uid)}`, 20, 60 * 1000)
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429 })
  }

  const promo = await db.promoCode.findUnique({ where: { code } })
  const valid =
    !!promo &&
    promo.active &&
    (!promo.expiresAt || promo.expiresAt.getTime() > Date.now())

  if (!valid) {
    return NextResponse.json({ valid: false, error: "That code is not valid or has expired." })
  }

  return NextResponse.json({
    valid: true,
    code: promo!.code,
    percentOff: promo!.percentOff,
    description: promo!.description,
  })
}

export async function PATCH(req: Request) {
  const identity = await verifyIdToken(bearerToken(req))
  if (!identity) return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  if (!(await isAdminIdentity(identity))) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 })
  }

  let body: { id?: string; active?: boolean }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  if (!body.id) return NextResponse.json({ error: "Missing promo id." }, { status: 400 })

  const existing = await db.promoCode.findUnique({ where: { id: body.id } })
  if (!existing) return NextResponse.json({ error: "Promo not found." }, { status: 404 })

  const promo = await db.promoCode.update({
    where: { id: body.id },
    data: { active: body.active ?? !existing.active },
  })
  return NextResponse.json({ promo })
}

export async function DELETE(req: Request) {
  const identity = await verifyIdToken(bearerToken(req))
  if (!identity) return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  if (!(await isAdminIdentity(identity))) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 })
  }

  const id = new URL(req.url).searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Missing promo id." }, { status: 400 })

  const existing = await db.promoCode.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: "Promo not found." }, { status: 404 })

  await db.promoCode.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}