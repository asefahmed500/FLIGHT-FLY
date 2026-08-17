import { NextResponse } from "next/server"
import { verifyIdToken, syncUser } from "@/lib/server-auth"

export const runtime = "nodejs"

export async function POST(req: Request) {
  let body: { idToken?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const identity = await verifyIdToken(body.idToken)
  if (!identity) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  try {
    const user = await syncUser(identity)
    return NextResponse.json({ user })
  } catch (err) {
    console.error("Sync user failed:", err)
    return NextResponse.json({ error: "Failed to sync user." }, { status: 500 })
  }
}