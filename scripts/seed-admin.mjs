// Seeds the admin account for FlightFly.
//
// This creates the Firebase Auth user (email + password) via the public
// Identity Toolkit REST API. The Firestore profile (users/{uid} with
// role: "admin") is created automatically on the admin's FIRST sign-in
// through the app, because admin@flightfly.com is in the ADMIN_EMAILS
// allowlist (mirrored by isAdminEmail() in firestore.rules).
//
// Usage:
//   node scripts/seed-admin.mjs
//   SEED_ADMIN_EMAIL=ops@flightfly.com SEED_ADMIN_PASSWORD='...' node scripts/seed-admin.mjs
//
// The script is idempotent: it reports "already exists" if the email is taken.

import { requireEnv } from "./env.mjs"

const API_KEY = requireEnv("NEXT_PUBLIC_FIREBASE_API_KEY")
const EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@flightfly.com"
const PASSWORD = process.env.SEED_ADMIN_PASSWORD || "Admin@12345"

async function main() {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD, returnSecureToken: true }),
  })
  const data = await res.json()

  if (res.ok) {
    console.log(`\n[OK] Admin account created.`)
    console.log(`  Email:    ${EMAIL}`)
    console.log(`  Password: ${PASSWORD}`)
    console.log(`  UID:      ${data.localId}`)
  } else if (data?.error?.message === "EMAIL_EXISTS") {
    console.log(`\n[SKIP] ${EMAIL} already has an auth account. Nothing to do.`)
  } else {
    console.error(`\n[FAIL] ${data?.error?.message || "Unknown error"}`)
    process.exit(1)
  }

  console.log(`\nNext step: sign in once at http://localhost:3001/login with these`)
  console.log(`credentials. First sign-in writes users/{uid} with role=admin to`)
  console.log(`Firestore (allowlist-based) and unlocks /admin.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})