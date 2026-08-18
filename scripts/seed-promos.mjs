// Seeds the promo codes marketed on the landing page (FLYGOLD45, VIP50FLY)
// so they become real, redeemable codes validated against PostgreSQL.
//
// Usage: node scripts/seed-promos.mjs   (requires DATABASE_URL in .env)

import pg from "pg"
import { env } from "./env.mjs"

const pool = new pg.Pool({ connectionString: env.DATABASE_URL || process.env.DATABASE_URL })

const PROMOS = [
  { code: "FLYGOLD45", percent: 45, desc: "Flash sale — up to 45% off premium cabins" },
  { code: "VIP50FLY", percent: 50, desc: "VIP Privilege Club welcome voucher" },
]

for (const p of PROMOS) {
  const { rows } = await pool.query('SELECT id FROM "PromoCode" WHERE code = $1', [p.code])
  if (rows.length > 0) {
    console.log(`[skip] ${p.code} already exists`)
    continue
  }
  await pool.query(
    'INSERT INTO "PromoCode" (id, code, "percentOff", active, description) VALUES (gen_random_uuid()::text, $1, $2, true, $3)',
    [p.code, p.percent, p.desc]
  )
  console.log(`[ok] created ${p.code} (-${p.percent}%)`)
}

const { rows: count } = await pool.query('SELECT count(*)::int AS n FROM "PromoCode"')
console.log(`[done] promo codes in database: ${count[0].n}`)
await pool.end()