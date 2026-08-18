import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyIdToken, bearerToken } from "@/lib/server-auth"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function PATCH(req: Request) {
  const identity = await verifyIdToken(bearerToken(req))
  if (!identity) return NextResponse.json({ error: "Unauthorized." }, { status: 401 })

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const displayName =
    typeof body.displayName === "string" ? body.displayName.trim().slice(0, 80) : ""
  if (!displayName) {
    return NextResponse.json({ error: "Display name is required." }, { status: 400 })
  }

  const user = await db.user.update({
    where: { uid: identity.uid },
    data: { displayName },
    select: { uid: true, email: true, displayName: true, role: true },
  })

  return NextResponse.json({ user })
}