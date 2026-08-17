// Seeds the Firestore `deals` collection (live deals for the landing page,
// /deals listing, /flights /hotels /packages pages, and the admin Deals manager).
//
// Authenticates as the admin allowlist account to satisfy Firestore rules
// (deals writes require isAdminEmailUser()).
//
// Usage:
//   node scripts/seed-deals.mjs
//   SEED_ADMIN_EMAIL=admin@flightfly.com SEED_ADMIN_PASSWORD='...' node scripts/seed-deals.mjs

const API_KEY =
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
  "AIzaSyC6XzcshtQnNXx70NQugX4vBh2PAnS2ZZA"
const PROJECT = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "real-estate-ea5a9"
const EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@flightfly.com"
const PASSWORD = process.env.SEED_ADMIN_PASSWORD || "Admin@12345"

const DB = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`

const DEALS = [
  // ---- Flights ----
  { id: "deal-flights-emirates", category: "flights", title: "Emirates Business Class to Dubai", subtitle: "Non-stop luxury flight with limousine transfer & lounge access", originalPrice: "$2,400", discountPrice: "$1,650", badge: "SAVE $750", rating: 5.0, expires: "2 days left", image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=800&auto=format&fit=crop" },
  { id: "deal-flights-tokyo", category: "flights", title: "Tokyo First Class Suite with Singapore Airlines", subtitle: "Private cabin suite with fine dining and chef service", originalPrice: "$4,200", discountPrice: "$3,100", badge: "SAVE $1,100", rating: 4.9, expires: "3 days left", image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=800&auto=format&fit=crop" },
  { id: "deal-flights-paris", category: "flights", title: "Paris Business Class Round-Trip", subtitle: "Air France La Première upgrade window + SkyPriority", originalPrice: "$3,100", discountPrice: "$2,320", badge: "25% OFF", rating: 4.8, expires: "Weekend fares", image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=800&auto=format&fit=crop" },
  // ---- Hotels ----
  { id: "deal-hotel-maldives", category: "hotels", title: "Overwater Villa at Anantara Maldives", subtitle: "Includes daily champagne breakfast & ocean spa credit", originalPrice: "$1,890", discountPrice: "$1,290", badge: "32% OFF", rating: 4.9, expires: "Limited Capacity", image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=800&auto=format&fit=crop" },
  { id: "deal-hotel-ritz", category: "hotels", title: "The Ritz Paris Luxury Suite Package", subtitle: "Private butler service & Michelin dining voucher included", originalPrice: "$2,100", discountPrice: "$1,480", badge: "VIP INCLUSIVE", rating: 5.0, expires: "Exclusive Pass", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop" },
  { id: "deal-hotel-dubai", category: "hotels", title: "Burj Al Arab Ocean Suite Stay", subtitle: "Private beach access, Rolls-Royce airport transfer & breakfast", originalPrice: "$3,600", discountPrice: "$2,890", badge: "ICONIC STAY", rating: 5.0, expires: "3 rooms left", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800&auto=format&fit=crop" },
  // ---- Packages ----
  { id: "deal-pack-swiss", category: "packages", title: "Swiss Alps Helicopter & Chalet Escape", subtitle: "7-day luxury chalet stay + panoramic helicopter tour", originalPrice: "$3,500", discountPrice: "$2,650", badge: "EXECUTIVE DEAL", rating: 5.0, expires: "Selling Fast", image: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=800&auto=format&fit=crop" },
  { id: "deal-pack-amalfi", category: "packages", title: "Amalfi Coast Yacht & Villa Expedition", subtitle: "Private skippered yacht charter + cliffside hotel", originalPrice: "$4,800", discountPrice: "$3,400", badge: "SAVE 28%", rating: 4.9, expires: "Summer Special", image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=800&auto=format&fit=crop" },
  // ---- Tours ----
  { id: "deal-tour-dubai", category: "tours", title: "Dubai Desert Safari & VIP BBQ Dinner", subtitle: "Dune bashing, camel rides & private VIP BBQ under the stars", originalPrice: "$150", discountPrice: "$120", badge: "BEST SELLER", rating: 4.9, expires: "Daily departures", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800&auto=format&fit=crop" },
  { id: "deal-tour-grand", category: "tours", title: "Grand Canyon VIP Helicopter & Landing", subtitle: "Champagne picnic landing on the canyon floor", originalPrice: "$520", discountPrice: "$450", badge: "VIP FLIGHT", rating: 5.0, expires: "Sunset slots", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop" },
  // ---- Visa ----
  { id: "deal-visa-schengen", category: "visa", title: "Schengen Multi-Entry Visa Bundle", subtitle: "Visa processing + priority appointment + travel insurance", originalPrice: "$320", discountPrice: "$220", badge: "VISA DEAL", rating: 4.9, expires: "2 weeks left", image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=800&auto=format&fit=crop" },
  { id: "deal-visa-us", category: "visa", title: "US B1/B2 Express Visa Package", subtitle: "Interview coaching + priority slot booking in major cities", originalPrice: "$380", discountPrice: "$285", badge: "SAVE $95", rating: 5.0, expires: "Priority slots", image: "https://images.unsplash.com/photo-1522083165195-3424ed129620?q=80&w=800&auto=format&fit=crop" },
  // ---- Tickets ----
  { id: "deal-ticket-burj", category: "tickets", title: "Burj Khalifa Sky Duo Package", subtitle: "Two Level 148 sunset tickets with lounge refreshments", originalPrice: "$310", discountPrice: "$250", badge: "DUO SAVE", rating: 5.0, expires: "Selling Fast", image: "https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=800&auto=format&fit=crop" },
  { id: "deal-ticket-cirque", category: "tickets", title: "Cirque du Soleil Premium Duo", subtitle: "Reserved club section seats with backstage meet & greet", originalPrice: "$470", discountPrice: "$390", badge: "FRONT ROW", rating: 4.9, expires: "This season", image: "https://images.unsplash.com/photo-1503095396549-807759245b35?q=80&w=800&auto=format&fit=crop" },
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
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` }
  console.log(`[OK] Signed in as ${EMAIL} (${auth.body.localId})`)

  let ok = 0
  let fail = 0
  for (const deal of DEALS) {
    const res = await json(`${DB}/deals/${deal.id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        fields: fields({ ...deal, createdAt: new Date().toISOString() }),
      }),
    })
    if (res.ok) ok++
    else {
      fail++
      console.error(`  [FAIL] ${deal.id}: ${res.body?.error?.message || res.status}`)
    }
  }
  console.log(`\n[DONE] deals seeded: ${ok} written, ${fail} failed.`)
  if (fail > 0) process.exitCode = 1
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})