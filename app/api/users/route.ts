import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyIdToken, bearerToken, isAdminIdentity } from "@/lib/server-auth"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(req: Request) {
  const identity = await verifyIdToken(bearerToken(req))
  if (!identity) return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  if (!(await isAdminIdentity(identity))) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 })
  }

  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { uid: true, email: true, displayName: true, photoURL: true, role: true, createdAt: true },
  })

  return NextResponse.json(
    users.map((u) => ({
      id: u.uid,
      email: u.email,
      displayName: u.displayName,
      photoURL: u.photoURL,
      role: u.role,
      createdAt: u.createdAt.toISOString(),
    }))
  )
}