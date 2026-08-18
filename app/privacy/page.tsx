import type { Metadata } from "next"
import { ShieldCheck } from "lucide-react"

export const metadata: Metadata = {
  title: "Privacy Policy — FlightFly",
  description: "How FlightFly handles your personal and booking data.",
}

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4F46E5]/10 text-[#4F46E5]">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-[-0.01em]">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">Last updated: August 2026</p>
        </div>
      </div>
      <div className="flex flex-col gap-6 text-sm leading-relaxed text-slate-600">
        <section>
          <h2 className="mb-2 font-semibold text-slate-900">1. Data we collect</h2>
          <p>
            To process bookings we collect your name, email, phone number, nationality, passport details,
            travel dates, and guest counts. Marketing content (deals, catalog, promos) is served from public
            collections; transactional data is stored in our PostgreSQL database.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-semibold text-slate-900">2. How we use it</h2>
          <p>
            Your data is used to confirm reservations, generate e-tickets, send status notifications, and
            provide account features (favorites, passes, booking history). We never sell personal data.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-semibold text-slate-900">3. Authentication</h2>
          <p>
            Sign-in is handled by Firebase Authentication. Firestore security rules restrict writes of
            transactional data to authorized servers and admin actions to admin accounts.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-semibold text-slate-900">4. Your rights</h2>
          <p>
            You may update your profile at any time from your dashboard. For deletion requests, contact{" "}
            <a href="mailto:concierge@flightfly.com" className="text-[#4F46E5] underline">
              concierge@flightfly.com
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  )
}