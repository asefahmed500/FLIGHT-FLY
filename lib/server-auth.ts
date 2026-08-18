import { db } from "@/lib/db"
import { isAdminEmail } from "@/lib/config"
import type { UserRole } from "@/lib/types"

const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY

export interface AuthIdentity {
  uid: string
  email: string
  displayName: string | null
  photoURL: string | null
}

// Verify a Firebase ID token server-side using the Identity Toolkit
// getAccountInfo endpoint (no firebase-admin dependency required).
// Returns null for invalid tokens OR disabled accounts.
export async function verifyIdToken(idToken: string | undefined | null): Promise<AuthIdentity | null> {
  if (!idToken || !API_KEY) return null
  try {
    const res = await fetch(
      `https://www.googleapis.com/identitytoolkit/v3/relyingparty/getAccountInfo?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
        cache: "no-store",
      }
    )
    if (!res.ok) return null
    const data = await res.json()
    const acct = data?.users?.[0]
    if (!acct?.localId) return null
    if (acct.disabled) return null
    return {
      uid: acct.localId,
      email: acct.email ?? "",
      displayName: acct.displayName ?? null,
      photoURL: acct.photoUrl ?? null,
    }
  } catch {
    return null
  }
}

// Allowlist emails are always admins (mirrors lib/config.ts + Firestore rules).
export function roleForEmail(email: string): UserRole {
  return isAdminEmail(email) ? "admin" : "customer"
}

// Resolve the effective role: allowlist admin wins, otherwise the Postgres role.
export async function resolveEffectiveRole(identity: AuthIdentity): Promise<UserRole> {
  if (isAdminEmail(identity.email)) return "admin"
  const user = await db.user.findUnique({ where: { uid: identity.uid }, select: { role: true } })
  return user?.role === "admin" ? "admin" : "customer"
}

// Upsert the Firebase identity into Postgres (the "in sync" step).
// displayName is owned by Postgres once created (/api/users/me updates it);
// sync never overwrites an existing name with the Auth-side fallback.
export async function syncUser(identity: AuthIdentity) {
  const role = await resolveEffectiveRole(identity)
  const user = await db.user.upsert({
    where: { uid: identity.uid },
    create: {
      uid: identity.uid,
      email: identity.email,
      displayName:
        identity.displayName || identity.email.split("@")[0] || "VIP Traveler",
      photoURL: identity.photoURL,
      role,
    },
    update: {
      email: identity.email,
      photoURL: identity.photoURL,
      role,
    },
  })
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
  }
}

export async function isAdminIdentity(identity: AuthIdentity): Promise<boolean> {
  return (await resolveEffectiveRole(identity)) === "admin"
}

export function bearerToken(req: Request): string | undefined {
  const header = req.headers.get("authorization") ?? ""
  return header.startsWith("Bearer ") ? header.slice(7) : undefined
}