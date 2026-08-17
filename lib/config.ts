// Global app configuration.
//
// Admin emails act as the role-based access control (RBAC) allowlist.
// - The app assigns `role: "admin"` only for signups matching this list.
// - `firestore.rules` mirrors this list in `isAdminEmail()` so privilege
//   escalation is blocked at the data layer too.
// Override at runtime with the `NEXT_PUBLIC_ADMIN_EMAILS` env var
// (comma-separated). See `.env.local.example`.

export const ADMIN_EMAILS = (
  process.env.NEXT_PUBLIC_ADMIN_EMAILS ??
  "asefahmed500@gmail.com,admin@flightfly.com"
)
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean)

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return ADMIN_EMAILS.includes(email.trim().toLowerCase())
}

export const REF_PREFIX = "FL"