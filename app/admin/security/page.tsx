"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldCheck } from "lucide-react"

const RULES = `rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // ---- Helpers ----
    function isAuthenticated() {
      return request.auth != null;
    }
    // Mirrors the NEXT_PUBLIC_ADMIN_EMAILS allowlist in lib/config.ts.
    // User roles now live in PostgreSQL (Prisma). Firestore only guards the
    // live landing content, so admin writes are gated by the email allowlist.
    function isAdminEmail(email) {
      return email in ['asefahmed500@gmail.com', 'admin@flightfly.com'];
    }
    function isAdminEmailUser() {
      return isAuthenticated() && isAdminEmail(request.auth.token.email);
    }

    // ---- deals/{id} (public read, admin write) ----
    match /deals/{dealId} {
      allow read: if true;
      allow create, update, delete: if isAdminEmailUser();
    }

    // ---- catalog/{id} (live landing content; public read, admin write) ----
    match /catalog/{catalogId} {
      allow read: if true;
      allow create, update, delete: if isAdminEmailUser();
    }

    // ---- default deny ----
    match /{document=**} {
      allow read, write: if false;
    }
  }
}`

export default function AdminSecurityPage() {
  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.01em]">Firestore Security Rules</h1>
        <p className="text-sm text-muted-foreground">
          <ShieldCheck className="mr-1 inline size-4 align-text-bottom text-emerald-500" />
          Access control: PostgreSQL (Prisma) for app data, Firestore rules for live landing content.
        </p>
      </div>

      <Card className="overflow-hidden rounded-2xl bg-[#0F172A] text-white">
        <CardHeader>
          <CardTitle className="text-amber-400">{"// Active firestore.rules"}</CardTitle>
          <CardDescription className="text-slate-400">Deployed to project real-estate-ea5a9</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <pre className="text-xs leading-relaxed text-slate-300">{RULES}</pre>
        </CardContent>
      </Card>
    </div>
  )
}