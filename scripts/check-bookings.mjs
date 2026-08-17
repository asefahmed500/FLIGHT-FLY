// Fetches all bookings via the app API as the admin, and prints the
// enriched traveler fields for the most recent bookings.
//
// Usage: node scripts/check-bookings.mjs

const API_KEY =
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
  "AIzaSyC6XzcshtQnNXx70NQugX4vBh2PAnS2ZZA"
const EMAIL = "admin@flightfly.com"
const PASSWORD = "Admin@12345"
const BASE = process.env.BASE_URL || "http://localhost:3000"

const signIn = await fetch(
  `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD, returnSecureToken: true }),
  }
)
const auth = await signIn.json()
if (!auth.idToken) {
  console.error("Sign-in failed:", auth.error?.message)
  process.exit(1)
}

const res = await fetch(`${BASE}/api/bookings`, {
  headers: { Authorization: `Bearer ${auth.idToken}` },
})
const bookings = await res.json()
if (!Array.isArray(bookings)) {
  console.error("API error:", JSON.stringify(bookings).slice(0, 200))
  process.exit(1)
}

console.log(`total bookings: ${bookings.length}`)
for (const b of bookings.slice(0, 4)) {
  console.log(
    `${b.refId} [${b.status}] ${b.itemTitle} | phone=${b.phone} date=${b.travelDate} guests=${b.guests} nat=${b.nationality} passport=${b.passportNumber ?? "—"} req=${b.specialRequests ?? "—"}`
  )
}
