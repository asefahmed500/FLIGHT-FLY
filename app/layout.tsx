import { Inter } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AuthProvider } from "@/lib/auth-context"
import { Chatbot } from "@/components/chatbot"
import { BookingProvider } from "@/components/booking-provider"
import { cn } from "@/lib/utils"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata = {
  title: "FlightFly | Luxury Travel, Flights, Hotels & Experiences",
  description: "Book premium flights, 5-star handpicked hotels, executive car rentals, luxury cruises, and holiday packages with FlightFly.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased scroll-smooth", inter.variable, "font-sans")}
    >
      <body className="min-h-screen bg-[#FAFAFA] text-[#111111] selection:bg-[#4F46E5] selection:text-white">
        <AuthProvider>
          <ThemeProvider>
            <TooltipProvider>
              {children}
              <Chatbot />
              <BookingProvider />
            </TooltipProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
