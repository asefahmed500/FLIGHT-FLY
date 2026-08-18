import type { Metadata } from "next"
import { FileText } from "lucide-react"

export const metadata: Metadata = {
  title: "Terms of Service — FlightFly",
  description: "The terms that govern your use of FlightFly.",
}

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4F46E5]/10 text-[#4F46E5]">
          <FileText className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-[-0.01em]">Terms of Service</h1>
          <p className="text-sm text-muted-foreground">Last updated: August 2026</p>
        </div>
      </div>
      <div className="flex flex-col gap-6 text-sm leading-relaxed text-slate-600">
        <section>
          <h2 className="mb-2 font-semibold text-slate-900">1. Booking reservations</h2>
          <p>
            Bookings are confirmed when a reservation reference is issued. Prices shown may include
            promotional discounts applied at checkout. All reservations are subject to availability.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-semibold text-slate-900">2. Cancellations &amp; refunds</h2>
          <p>
            You may cancel a pending or approved reservation from your dashboard. Refunds are issued
            according to the specific fare rules of the item booked and are processed by our concierge team.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-semibold text-slate-900">3. Account responsibility</h2>
          <p>
            You are responsible for keeping your login credentials secure and for activity under your
            account. Admin access is reserved for authorized staff.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-semibold text-slate-900">4. Limitation of liability</h2>
          <p>
            FlightFly acts as a booking platform. Travel services are provided by third parties; FlightFly
            is not liable for provider-level disruptions beyond facilitation of rebooking.
          </p>
        </section>
      </div>
    </main>
  )
}