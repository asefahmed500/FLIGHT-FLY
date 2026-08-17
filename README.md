# ✈️ FLIGHT-FLY

<div align="center">

**FlightFly** — a full-stack luxury travel booking platform for flights, hotels, tours, visas, tickets and curated packages.

Next.js 16 · PostgreSQL + Prisma 7 · Firebase Auth & Firestore · Tailwind CSS v4 · shadcn-style UI

</div>

---

## Overview

FlightFly is a production-grade travel agency web app with:

- **Customer storefront** — hero search, category browsing, live deals, featured destinations, tours, visa services, tickets & experiences
- **Full booking flow** — enriched reservation form (contact, travel date, travelers, nationality, passport, special requests) with client + server validation, persisted entirely in **PostgreSQL**
- **Customer portal** — reservations, digital boarding passes with real **QR codes**, downloadable **PDF e-tickets** (jsPDF), wishlist, profile settings
- **Admin portal** — dashboard analytics (revenue chart, KPIs), reservation manager with filters/search, user & privilege manager, deals manager, content CRM
- **Notification system** — real-time booking lifecycle notifications for customers and admins
- **Security** — Firebase Auth (client) + Identity Toolkit token verification (server), role-based access control, Firestore security rules

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack, RSC) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + shadcn-style components (Base UI) |
| State | Zustand (booking, favorites, toasts) |
| Forms | React Hook Form + Zod |
| Primary DB | PostgreSQL + Prisma 7 |
| Auth | Firebase Authentication |
| Live content | Cloud Firestore (catalog + deals) |
| Charts | Recharts |
| PDF / QR | jsPDF + qrcode |

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm (`npm i -g pnpm`)
- PostgreSQL 14+ running locally
- A Firebase project (Auth + Firestore enabled)

### 1. Install dependencies

```bash
pnpm install
```

### 2. Environment variables

Create `.env` and `.env.local` (both are git-ignored — never commit secrets):

```bash
# .env — Prisma datasource
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/flightflydb?schema=public"

# .env.local — Firebase web app config (from Firebase console → Project settings)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

### 3. Database setup

```bash
pnpm prisma migrate dev    # applies all migrations (schema, booking details, notifications)
pnpm prisma generate       # regenerates the client into lib/generated
```

### 4. Seed live content (optional but recommended)

```bash
node scripts/seed-catalog.mjs   # 28 catalog docs → Firestore
node scripts/seed-deals.mjs     # 14 deals → Firestore
```

Both scripts authenticate as the admin allowlist account and are idempotent.

### 5. Run

```bash
pnpm dev        # http://localhost:3000
pnpm build      # production build
pnpm start      # serve production build
pnpm typecheck  # tsc --noEmit
pnpm lint       # eslint
```

---

## Project Structure

```
app/
  page.tsx                 # Landing page (sections + interstitial banners)
  flights/ hotels/ ...     # Listing pages (catalog + deals)
  catalog/[id]/            # Catalog item detail
  deals/[id]/              # Deal detail
  login/                   # Auth (sign in / create account)
  dashboard/               # Customer portal (overview, bookings, passes, wishlist, profile)
  admin/                   # Admin portal (overview, bookings, users, deals, CRM, security)
  api/
    bookings/              # GET/POST + [id] PATCH/DELETE (Postgres)
    users/                 # Role management
    favorites/             # Wishlist
    notifications/         # GET list + PATCH mark-read
components/
  ui/                      # shadcn-style primitives (table, card, dialog, ...)
  listing/                 # ListingCard, catalog/deal listings, universal CardCta
  dashboard/               # DashboardShell, NotificationBell
  booking-modal.tsx        # Enriched reservation form + PDF e-ticket
lib/
  stores/                  # Zustand stores
  e-ticket.ts              # jsPDF e-ticket generator with QR
  app-data.ts              # Typed data hooks + mutations (authed fetch)
  server-auth.ts           # Identity Toolkit token verification
prisma/                    # Schema + migrations
scripts/                   # Seed scripts (catalog, deals)
```

---

## Roles & Accounts

| Role | Access |
| --- | --- |
| `customer` | Storefront, booking, own dashboard, passes, wishlist |
| `admin` | Everything + `/admin` portal (all users' bookings, role manager, deals, CRM) |

Admin allowlist: emails in the server allowlist are always admin regardless of DB role.
Role changes for other users are made by an admin in **Admin → Users**.

---

## Data Model (PostgreSQL)

- **User** — uid (Firebase), email, displayName, role
- **Booking** — refId (`FL-XXXXX`), passenger + contact details, enriched traveler info (phone, travelDate, guests, nationality, passport, specialRequests), item, price, cabinClass, paymentType, status
- **Favorite** — per-user wishlist entries
- **Notification** — per-user booking lifecycle messages with read state

Firestore holds only live marketing content (`catalog`, `deals`) — all transactional data lives in Postgres.

---

## Key Features Walkthrough

1. **Book** — any card's primary CTA opens the reservation modal → validated form → `POST /api/bookings` → row in Postgres + notifications to customer & admins
2. **Admin review** — `/admin/bookings` → approve/reject with filter chips + search → customer receives a notification, pass unlocks on approval
3. **Pass & e-ticket** — `/dashboard/passes` shows boarding-pass cards with live QR codes; "E-Ticket PDF" downloads a branded ticket (jsPDF + QR)
4. **Notifications** — bell in the dashboard header with unread badge and mark-all-read

---

## Deployment Notes

- Set `DATABASE_URL` and all `NEXT_PUBLIC_FIREBASE_*` vars in your host's environment
- Run `pnpm prisma migrate deploy` against the production database
- API routes are `force-dynamic` (auth-token based) — deploy on Node runtime hosts (Vercel, Railway, Fly.io, etc.)

---

## License

MIT — free to use and adapt.
