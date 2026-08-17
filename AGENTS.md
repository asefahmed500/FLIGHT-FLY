<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# FlightFly — Agent Notes

Full-stack travel booking app: Next.js 16 App Router + PostgreSQL/Prisma 7 (transactional data) + Firebase Auth & Firestore (auth + live marketing content only).

## Commands

```bash
pnpm dev          # dev server on :3000
pnpm typecheck    # tsc --noEmit
pnpm lint         # eslint (0 errors required; warnings pre-existing)
pnpm build        # production build (Turbopack)
```

After changing `prisma/schema.prisma`: `pnpm prisma migrate dev --name <slug>` then **restart the dev server** — the running server keeps a stale Prisma client and API routes 500 on new fields.

## Critical conventions

- **Base UI, not Radix.** Components use `render={<Link/>}` instead of `asChild`. `Select.onValueChange` receives `(value: string | null, eventDetails)` — guard with `(v) => v && setX(v)`.
- **Menu items need groups.** `DropdownMenuLabel` must sit inside `DropdownMenuGroup` (Base UI throws `MenuGroupContext is missing` otherwise). Same rule for `SelectItem` → `SelectGroup`.
- **Icons in Buttons:** `data-icon="inline-start|inline-end"` on the icon; no manual size classes.
- **Lint rule:** no synchronous `setState` inside `useEffect` — wrap in `setTimeout(..., 0)`.
- **Cards/tables:** use `components/ui/card.tsx` + `table.tsx` primitives; card radius is `rounded-xl`, depth via shadows (no stacked borders, no hover-translate).
- **Universal card CTA:** `components/listing/card-cta.tsx` (View Details + primary action) — reuse it on new card components instead of hand-rolling buttons.

## Architecture

- **Auth split:** Firebase Auth client-side; API routes verify `Authorization: Bearer <idToken>` via Identity Toolkit REST (`lib/server-auth.ts`). Role model: allowlist emails are always admin; otherwise Postgres `User.role`. Customers hitting `/admin` are redirected to `/dashboard` (and vice versa).
- **Data split:** All transactional data (bookings, users, favorites, notifications) → Postgres via `/api/*` + `lib/app-data.ts` hooks (`useAppFetch` + `refresh()` — call `refresh()` after every mutation, nothing auto-refetches). Firestore holds only `catalog` + `deals` collections (public read, admin write per `firestore.rules`).
- **Zustand stores** in `lib/stores/` for booking modal, favorites, toasts. Global modals/toaster mounted once in `app/layout.tsx` via `BookingProvider` — open modals with `useBookingStore.getState().openBooking(item)`, never local modal state.
- **E-tickets:** `lib/e-ticket.ts` (jsPDF + qrcode) used by dashboard bookings, passes, and the booking modal confirmation step.

## Prisma 7 quirks

- Generator is `prisma-client` → output `lib/generated/prisma` (git-ignored). Import from `@/lib/generated/prisma/client`. Datasource block has NO `url` — it comes from `DATABASE_URL` in `.env` via `prisma.config.ts`.
- `pnpm-workspace.yaml` `allowBuilds` gates native builds (`prisma`, `@prisma/engines` true; `core-js` false). New packages with build scripts need an entry or lint fails.

## Seeds & test accounts

```bash
node scripts/seed-catalog.mjs   # 28 catalog docs → Firestore (idempotent)
node scripts/seed-deals.mjs     # 14 deals → Firestore (idempotent)
```

- Admin: `admin@flightfly.com` / `Admin@12345` — Customer: `asef@gmail.com` / `asef123456`
- Both scripts authenticate via Firebase REST as the admin account.

## Env files (never commit)

- `.env` → `DATABASE_URL` (postgres, localhost:5432/flightflydb)
- `.env.local` → all `NEXT_PUBLIC_FIREBASE_*` keys

## Browser automation notes

agent-browser works, but coordinate clicks miss on animated cards — use `agent-browser eval "...btn.click()"`. In PowerShell, quote refs (`click "@e34"`) or the `@` is parsed as splatting. Turbopack occasionally panics on `pnpm build` (CSS worker timeout) — it's transient, just rerun.
