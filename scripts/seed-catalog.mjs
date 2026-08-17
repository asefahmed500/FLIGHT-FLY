// Seeds the Firestore `catalog` collection with all landing-page content
// (visa, tickets, tours, destinations, testimonials, features, promo banner),
// including DEAL flags + original prices so every card shows the deal styling.
//
// Authenticates as the admin account (allowlist) to satisfy the Firestore
// rules (catalog writes require isAdmin()). Ensures users/{uid} has
// role: "admin" first, then upserts each catalog document.
//
// Usage:
//   node scripts/seed-catalog.mjs
//   SEED_ADMIN_EMAIL=admin@flightfly.com SEED_ADMIN_PASSWORD='...' node scripts/seed-catalog.mjs

import { requireEnv } from "./env.mjs"

const API_KEY = requireEnv("NEXT_PUBLIC_FIREBASE_API_KEY")
const PROJECT = requireEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID")
const EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@flightfly.com"
const PASSWORD = process.env.SEED_ADMIN_PASSWORD || "Admin@12345"

const DB = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`

const CATALOG = [
  // ---- Visa services ----
  { id: "visa-schengen", kind: "visa", title: "Schengen Area Tourist Visa", subtitle: "30-day multi-entry visa with concierge dossier review", price: "$220", originalPrice: "$280", deal: true, badge: "Approval 5-7 Days", rating: 4.9, image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=800&auto=format&fit=crop" },
  { id: "visa-usa", kind: "visa", title: "US B1/B2 Visitor Visa", subtitle: "Appointment booking, DS-160 help & interview coaching", price: "$285", badge: "Priority Slots", rating: 5.0, image: "https://images.unsplash.com/photo-1522083165195-3424ed129620?q=80&w=800&auto=format&fit=crop" },
  { id: "visa-uk", kind: "visa", title: "UK Standard Visitor Visa", subtitle: "6-month multi-entry with document translation service", price: "$240", badge: "Premium Lounge", rating: 4.8, image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=800&auto=format&fit=crop" },
  { id: "visa-uae", kind: "visa", title: "UAE & Dubai Visit Visa", subtitle: "30-day single-entry issued in under 48 hours", price: "$95", originalPrice: "$120", deal: true, badge: "Same-Day Express", rating: 4.9, image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800&auto=format&fit=crop" },
  // ---- Tickets & experiences ----
  { id: "ticket-burj", kind: "ticket", title: "Burj Khalifa At The Top Sky", subtitle: "Level 148 sunset access with lounge & refreshments", price: "$135", originalPrice: "$170", deal: true, badge: "LEVEL 148", rating: 5.0, image: "https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=800&auto=format&fit=crop" },
  { id: "ticket-cirque", kind: "ticket", title: "Cirque du Soleil Premium Seats", subtitle: "Reserved club section with backstage meet & greet", price: "$210", badge: "FRONT ROW", rating: 4.9, image: "https://images.unsplash.com/photo-1503095396549-807759245b35?q=80&w=800&auto=format&fit=crop" },
  { id: "ticket-opera", kind: "ticket", title: "Sydney Opera House Gala Night", subtitle: "Orchestra stalls with interval champagne service", price: "$180", badge: "VIP ORCHESTRA", rating: 4.8, image: "https://images.unsplash.com/photo-1541506491-6506b79e2c3c?q=80&w=800&auto=format&fit=crop" },
  { id: "ticket-cruise", kind: "ticket", title: "Monaco Grand Prix Yacht Spectator", subtitle: "Trackside yacht viewing platform with hosted bar", price: "$1,450", badge: "YACHT PASS", rating: 5.0, image: "https://images.unsplash.com/photo-1506029642148-0c0d40b08579?q=80&w=800&auto=format&fit=crop" },
  // ---- Tours ----
  { id: "tour-1", kind: "tour", title: "Dubai Desert Safari & VIP BBQ Dinner", subtitle: "Dune bashing, camel rides and a private VIP BBQ dinner under the stars.", location: "Dubai, UAE", duration: "6 Hours", groupSize: "Max 8 People", price: "$120", originalPrice: "$150", deal: true, badge: "Best Seller", rating: 4.9, reviews: "1,420", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800&auto=format&fit=crop" },
  { id: "tour-2", kind: "tour", title: "Eiffel Tower VIP Sunset Champagne Tour", subtitle: "Skip-the-line summit access with a glass of champagne at sunset.", location: "Paris, France", duration: "3 Hours", groupSize: "Small Group", price: "$210", badge: "Top Rated", rating: 4.8, reviews: "980", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop" },
  { id: "tour-3", kind: "tour", title: "Kyoto Heritage Temples & Tea Ceremony", subtitle: "Ancient temples, zen gardens and a private tea ceremony with a master.", location: "Kyoto, Japan", duration: "Full Day", groupSize: "Private Tour", price: "$165", badge: "Cultural Classic", rating: 5.0, reviews: "750", image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop" },
  { id: "tour-4", kind: "tour", title: "Grand Canyon VIP Helicopter & Landing", subtitle: "Helicopter flight with a champagne picnic landing on the canyon floor.", location: "Nevada, USA", duration: "4.5 Hours", groupSize: "Max 6 Passengers", price: "$450", badge: "VIP Helicopter", rating: 5.0, reviews: "2,100", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop" },
  // ---- Destinations ----
  { id: "dest-paris", kind: "destination", title: "Paris", subtitle: "Flight + 4 Nights at Eiffel Luxury Hotel", country: "France", price: "$680", badge: "Most Popular", rating: 4.9, reviews: "1,240 reviews", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop" },
  { id: "dest-bali", kind: "destination", title: "Bali", subtitle: "Private Pool Villa + Flights Included", country: "Indonesia", price: "$520", badge: "Trending Luxury", rating: 4.9, reviews: "980 reviews", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800&auto=format&fit=crop" },
  { id: "dest-dubai", kind: "destination", title: "Dubai", subtitle: "5-Star Resort Stay + Desert Safari", country: "United Arab Emirates", price: "$890", originalPrice: "$1,050", deal: true, badge: "Executive Pick", rating: 5.0, reviews: "2,150 reviews", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800&auto=format&fit=crop" },
  { id: "dest-tokyo", kind: "destination", title: "Tokyo", subtitle: "First-Class Flight & Ginza Boutique Hotel", country: "Japan", price: "$950", badge: "Top Rated", rating: 4.8, reviews: "1,890 reviews", image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=800&auto=format&fit=crop" },
  { id: "dest-newyork", kind: "destination", title: "New York", subtitle: "Manhattan Luxury Suite + Direct Flight", country: "United States", price: "$430", badge: "Flash Deal", rating: 4.7, reviews: "3,400 reviews", image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=800&auto=format&fit=crop" },
  { id: "dest-maldives", kind: "destination", title: "Maldives", subtitle: "Overwater Bungalows + Sea Plane Transfer", country: "Tropical Paradise", price: "$1,250", originalPrice: "$1,450", deal: true, badge: "VIP Honeymoon", rating: 5.0, reviews: "860 reviews", image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=800&auto=format&fit=crop" },
  // ---- Testimonials ----
  { id: "test-1", kind: "testimonial", title: "Sarah Jenkins", role: "VP of Global Marketing, TechScale", text: "FlightFly simplified our quarterly corporate retreat for 45 executives. The concierge team secured First-Class flight upgrades and managed all ground transfers effortlessly.", verified: "Verified Corporate Account", rating: 5, image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop" },
  { id: "test-2", kind: "testimonial", title: "Dr. Alexander Wright", role: "Chief Surgeon & Luxury Traveler", text: "Our Maldives honeymoon booked through FlightFly was pure magic. Overwater bungalow with private sea plane transfer and 24/7 dedicated support. Unmatched luxury!", verified: "VIP Platinum Traveler", rating: 5, image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop" },
  { id: "test-3", kind: "testimonial", title: "Elena Rostova", role: "Managing Director, Rostova Capital", text: "I travel over 100,000 miles a year for international negotiations. FlightFly’s best-price guarantee and instant 24/7 concierge response make them my exclusive travel partner.", verified: "Verified Business Traveler", rating: 5, image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop" },
  // ---- Why Choose Us features ----
  { id: "feat-1", kind: "feature", title: "Best Price Guarantee", subtitle: "We match any lower published rate online or refund 100% of the price difference instantly.", icon: "shield", rating: 0, price: "", badge: "", image: "" },
  { id: "feat-2", kind: "feature", title: "24/7 Dedicated Support", subtitle: "Personal corporate travel concierge ready to assist you via call, email, or WhatsApp anywhere globally.", icon: "headset", rating: 0, price: "", badge: "", image: "" },
  { id: "feat-3", kind: "feature", title: "Flexible Free Cancellation", subtitle: "Cancel flights, hotels, and tours up to 24 hours prior to departure with zero penalty fees.", icon: "refresh", rating: 0, price: "", badge: "", image: "" },
  { id: "feat-4", kind: "feature", title: "Bank-Grade Secure Payment", subtitle: "Protected by 256-bit SSL encryption, supporting corporate invoicing, Credit Card, and Apple Pay.", icon: "card", rating: 0, price: "", badge: "", image: "" },
  { id: "feat-5", kind: "feature", title: "Curated Luxury Standards", subtitle: "Every hotel, airline suite, and tour guide is hand-inspected to meet executive 5-star standards.", icon: "award", rating: 0, price: "", badge: "", image: "" },
  { id: "feat-6", kind: "feature", title: "Verified Global Partners", subtitle: "Direct partnerships with over 500 airlines and 85,000 luxury resorts worldwide.", icon: "building", rating: 0, price: "", badge: "", image: "" },
  // ---- Promo banner (single) ----
  { id: "promo-main", kind: "promo", title: "Flash Sale", subtitle: "Save Up to 45% Off First & Business Class", text: "Use code at checkout for instant executive discounts.", code: "FLYGOLD45", rating: 0, price: "", badge: "", image: "" },
]

function fields(obj) {
  const out = {}
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) continue
    if (typeof value === "boolean") out[key] = { booleanValue: value }
    else if (typeof value === "number") out[key] = Number.isInteger(value) ? { integerValue: value } : { doubleValue: value }
    else out[key] = { stringValue: String(value) }
  }
  return out
}

async function json(url, options) {
  const res = await fetch(url, options)
  const body = await res.json().catch(() => ({}))
  return { ok: res.ok, status: res.status, body }
}

async function main() {
  // 1. Sign in as admin to get an ID token.
  const auth = await json(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD, returnSecureToken: true }),
    }
  )
  if (!auth.ok) {
    console.error(`[FAIL] Sign-in failed: ${auth.body?.error?.message || auth.status}`)
    process.exit(1)
  }
  const idToken = auth.body.idToken
  const uid = auth.body.localId
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` }
  console.log(`[OK] Signed in as ${EMAIL} (${uid})`)

  // 2. Ensure users/{uid} has role admin (create allowed via allowlist rule).
  const userDoc = await json(`${DB}/users?documentId=${uid}`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      fields: fields({ role: "admin", email: EMAIL, displayName: "FlightFly Admin", uid, createdAt: new Date().toISOString() }),
    }),
  })
  if (userDoc.ok) console.log(`[OK] users/${uid} created with role admin.`)
  else if (userDoc.status === 409 || /ALREADY_EXISTS/.test(userDoc.body?.error?.message || "")) console.log(`[SKIP] users/${uid} already exists.`)
  else console.error(`[WARN] users/${uid} not created: ${userDoc.body?.error?.message || userDoc.status}`)

  // 3. Upsert each catalog document (PATCH creates-or-replaces).
  let ok = 0
  let skip = 0
  let fail = 0
  for (const item of CATALOG) {
    const res = await json(`${DB}/catalog/${item.id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ fields: fields(item) }),
    })
    if (res.ok) ok++
    else if (res.status === 404) { skip++; }
    else { fail++; console.error(`  [FAIL] ${item.id}: ${res.body?.error?.message || res.status}`) }
  }
  console.log(`\n[DONE] catalog seeded: ${ok} written, ${skip} missing-doc skips, ${fail} failed.`)
  if (fail > 0) process.exitCode = 1
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})