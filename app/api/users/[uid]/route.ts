import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyIdToken, bearerToken, isAdminIdentity, roleForEmail } from "@/lib/server-auth"
import type { UserRole } from "@/lib/types"

export const runtime = "nodejs"

export async function PATCH(req: Request, { params }: { params: Promise<{ uid: string }> }) {
  const { uid } = await params
  const identity = await verifyIdToken(bearerToken(req))
  if (!identity) return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  if (!(await isAdminIdentity(identity))) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 })
  }

  let body: { role?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }
  if (body.role !== "customer" && body.role !== "admin") {
    return NextResponse.json({ error: "Role must be 'customer' or 'admin'." }, { status: 400 })
  }

  const target = await db.user.findUnique({ where: { uid }, select: { email: true } })
  if (!target) return NextResponse.json({ error: "User not found." }, { status: 404 })

  // Allowlisted admins can never be demoted.
  const role = body.role as UserRole
  if (roleForEmail(target.email) === "admin" && role === "customer") {
    return NextResponse.json({ error: "Allowlisted admin accounts cannot be demoted." }, { status: 400 })
  }

  const user = await db.user.update({
    where: { uid },
    data: { role },
    select: { uid: true, email: true, displayName: true, photoURL: true, role: true, createdAt: true },
  })

  return NextResponse.json({
    user: {
      id: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
    },
  })
}