import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyIdToken, bearerToken } from "@/lib/server-auth"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(req: Request) {
  const identity = await verifyIdToken(bearerToken(req))
  if (!identity) return NextResponse.json({ error: "Unauthorized." }, { status: 401 })

  const rows = await db.notification.findMany({
    where: { userId: identity.uid },
    orderBy: { createdAt: "desc" },
    take: 20,
  })

  const unread = await db.notification.count({
    where: { userId: identity.uid, read: false },
  })

  return NextResponse.json(
    rows.map((n) => ({
      id: n.id,
      userId: n.userId,
      title: n.title,
      body: n.body,
      read: n.read,
      createdAt: n.createdAt.toISOString(),
    }))
  )
}

export async function PATCH(req: Request) {
  const identity = await verifyIdToken(bearerToken(req))
  if (!identity) return NextResponse.json({ error: "Unauthorized." }, { status: 401 })

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  if (body.all === true) {
    await db.notification.updateMany({
      where: { userId: identity.uid, read: false },
      data: { read: true },
    })
    return NextResponse.json({ ok: true })
  }

  const id = typeof body.id === "string" ? body.id : ""
  if (!id) return NextResponse.json({ error: "Missing notification id." }, { status: 400 })

  const existing = await db.notification.findUnique({ where: { id } })
  if (!existing || existing.userId !== identity.uid) {
    return NextResponse.json({ error: "Notification not found." }, { status: 404 })
  }

  await db.notification.update({ where: { id }, data: { read: true } })
  return NextResponse.json({ ok: true })
}