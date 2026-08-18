// Server-side verification of bookable items against Firestore.
// Uses the public REST read (catalog/deals are public-read per firestore.rules)
// so booking prices can never be client-forged.

const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
const PROJECT = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`

export interface VerifiedItem {
  title: string
  price: string
  itemType: string
}

interface FsDoc {
  fields?: Record<string, { stringValue?: string; integerValue?: string; booleanValue?: boolean; doubleValue?: number }>
}

function str(doc: FsDoc, key: string): string {
  return doc.fields?.[key]?.stringValue ?? ""
}

async function getDoc(collection: string, id: string): Promise<FsDoc | null> {
  if (!API_KEY || !PROJECT) return null
  try {
    const res = await fetch(`${BASE}/${collection}/${encodeURIComponent(id)}?key=${API_KEY}`, {
      cache: "no-store",
    })
    if (!res.ok) return null
    return (await res.json()) as FsDoc
  } catch {
    return null
  }
}

const CATEGORY_TO_TYPE: Record<string, string> = {
  flights: "flight",
  hotels: "hotel",
  packages: "package",
  tours: "tour",
  visa: "visa",
  tickets: "ticket",
}

const KIND_TO_TYPE: Record<string, string> = {
  visa: "visa",
  ticket: "ticket",
  tour: "tour",
  destination: "package",
}

/**
 * Verify a bookable item by id (preferred) or exact title match.
 * Returns the canonical title + price + type from the database, or null
 * if no such item exists (caller should reject the booking).
 */
export async function verifyBookableItem(itemId?: string, title?: string): Promise<VerifiedItem | null> {
  if (itemId) {
    const deal = await getDoc("deals", itemId)
    if (deal?.fields) {
      return {
        title: str(deal, "title"),
        price: str(deal, "discountPrice"),
        itemType: CATEGORY_TO_TYPE[str(deal, "category")] ?? "package",
      }
    }
    const catalog = await getDoc("catalog", itemId)
    if (catalog?.fields) {
      const kind = str(catalog, "kind")
      return {
        title: str(catalog, "title"),
        price: str(catalog, "price"),
        itemType: KIND_TO_TYPE[kind] ?? "package",
      }
    }
  }

  if (title) {
    // Title match against deals (query on title field).
    try {
      const q = `${BASE}/deals?key=${API_KEY}&pageSize=50`
      const res = await fetch(q, { cache: "no-store" })
      if (res.ok) {
        const data = (await res.json()) as { documents?: FsDoc[] }
        const docs = data.documents ?? []
        const match = docs.find((d) => str(d, "title") === title)
        if (match) {
          return {
            title: str(match, "title"),
            price: str(match, "discountPrice"),
            itemType: CATEGORY_TO_TYPE[str(match, "category")] ?? "package",
          }
        }
      }
    } catch {
      // fall through to catalog
    }
    try {
      const q = `${BASE}/catalog?key=${API_KEY}&pageSize=100`
      const res = await fetch(q, { cache: "no-store" })
      if (res.ok) {
        const data = (await res.json()) as { documents?: FsDoc[] }
        const docs = data.documents ?? []
        const match = docs.find((d) => str(d, "title") === title)
        if (match) {
          const kind = str(match, "kind")
          return {
            title: str(match, "title"),
            price: str(match, "price"),
            itemType: KIND_TO_TYPE[kind] ?? "package",
          }
        }
      }
    } catch {
      // give up
    }
  }

  return null
}
