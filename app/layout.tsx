import type React from "react"
import "@/app/globals.css"
import { Inter, Open_Sans } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth/auth-provider"
import { Toaster } from "@/components/ui/sonner"
import { Suspense } from "react"
import { SessionProvider } from "next-auth/react"

const inter = Inter({ subsets: ["latin"] })
const openSans = Open_Sans({ subsets: ["latin"] })

export const metadata = {
  title: "Hallynk - Student Hostel Booking Platform for Ghana",
  description: "Find and book verified, affordable student hostels across Ghana's universities",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={openSans.className}>
        <Suspense>
          <SessionProvider>
          <AuthProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Toaster position="top-right" richColors />
            </ThemeProvider>
          </AuthProvider>
          </SessionProvider>
        </Suspense>
      </body>
    </html>
  );
}
