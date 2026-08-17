// Shared env loader for seed scripts.
// Reads NEXT_PUBLIC_FIREBASE_* and DATABASE_URL from .env.local / .env so
// secrets never need to be hardcoded (GitHub secret scanning flags them).
//
// Usage: import { env } from "./env.mjs"

import { readFileSync } from "node:fs"
import { resolve } from "node:path"

function parseEnvFile(path) {
  try {
    const raw = readFileSync(path, "utf8")
    const out = {}
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/)
      if (!m) continue
      let value = m[2]
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }
      out[m[1]] = value
    }
    return out
  } catch {
    return {}
  }
}

const files = [".env.local", ".env"]
const merged = {}
for (const f of files) {
  Object.assign(merged, parseEnvFile(resolve(process.cwd(), f)))
}

export function requireEnv(name) {
  const value = process.env[name] ?? merged[name]
  if (!value) {
    console.error(
      `Missing ${name}. Add it to .env.local (see README) and re-run this script.`
    )
    process.exit(1)
  }
  return value
}

export const env = merged