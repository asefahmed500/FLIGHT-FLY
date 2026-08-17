import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export function PageFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC] font-sans">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">{children}</main>
      <Footer />
    </div>
  )
}