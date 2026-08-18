import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyIdToken, bearerToken } from "@/lib/server-auth"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(req: Request) {
  const identity = await verifyIdToken(bearerToken(req))
  if (!identity) return NextResponse.json({ error: "Unauthorized." }, { status: 401 })

  const rows = await db.favorite.findMany({
    where: { userId: identity.uid },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(
    rows.map((f) => ({
      id: f.dealId,
      dealTitle: f.dealTitle,
      dealPrice: f.dealPrice,
      dealImage: f.dealImage,
      dealCategory: f.dealCategory,
    }))
  )
}

export async function POST(req: Request) {
  const identity = await verifyIdToken(bearerToken(req))
  if (!identity) return NextResponse.json({ error: "Unauthorized." }, { status: 401 })

  let body: { deal?: { id?: string; title?: string; price?: string; category?: string; image?: string } }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }
  const dealId = body.deal?.id?.trim().slice(0, 120)
  if (!dealId) return NextResponse.json({ error: "Deal id is required." }, { status: 400 })

  const existing = await db.favorite.findUnique({
    where: { userId_dealId: { userId: identity.uid, dealId } },
  })
  if (existing) {
    await db.favorite.delete({ where: { id: existing.id } })
    return NextResponse.json({ added: false })
  }

  await db.favorite.create({
    data: {
      userId: identity.uid,
      dealId,
      dealTitle: (body.deal?.title || dealId).slice(0, 200),
      dealPrice: (body.deal?.price || "").slice(0, 40),
      dealImage: body.deal?.image?.slice(0, 500) ?? null,
      dealCategory: body.deal?.category?.slice(0, 40) ?? null,
    },
  })
  return NextResponse.json({ added: true }, { status: 201 })
}

export async function DELETE(req: Request) {
  const identity = await verifyIdToken(bearerToken(req))
  if (!identity) return NextResponse.json({ error: "Unauthorized." }, { status: 401 })

  const dealId = new URL(req.url).searchParams.get("dealId")
  if (!dealId) return NextResponse.json({ error: "Missing dealId." }, { status: 400 })

  const existing = await db.favorite.findUnique({
    where: { userId_dealId: { userId: identity.uid, dealId } },
  })
  if (!existing) return NextResponse.json({ error: "Favorite not found." }, { status: 404 })

  await db.favorite.delete({ where: { id: existing.id } })
  return NextResponse.json({ ok: true })
}