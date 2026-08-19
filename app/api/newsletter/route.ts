import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { rateLimit, clientKeyFromReq } from "@/lib/rate-limit"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

// Public newsletter signup. No auth — the form lives on the marketing page —
// so it is rate limited per IP and stores nothing beyond the email itself.
export async function POST(req: Request) {
  const rl = rateLimit(`newsletter:${clientKeyFromReq(req)}`, 5, 10 * 60 * 1000)
  if (!rl.ok) {
    return NextResponse.json(
      { error: `Too many attempts. Try again in ${rl.retryAfterSec}s.` },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    )
  }

  let body: { email?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase().slice(0, 160) : ""
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 })
  }

  try {
    const existing = await db.newsletterSubscriber.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ ok: true, alreadySubscribed: true })
    }
    await db.newsletterSubscriber.create({ data: { email } })
    return NextResponse.json({ ok: true, alreadySubscribed: false }, { status: 201 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : ""
    if (msg.includes("Unique constraint")) {
      return NextResponse.json({ ok: true, alreadySubscribed: true })
    }
    return NextResponse.json({ error: "Could not save your subscription. Try again." }, { status: 500 })
  }
}
