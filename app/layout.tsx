import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ToastProvider } from "@/hooks/use-toast"
import { LanguageProvider } from "@/hooks/use-language"
import { LanguageToggle } from "@/components/language-toggle"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Steel Count Project",
  description: "AI-powered steel object counting application",
  icons: {
    icon: "/favicon.ico",
  },
  generator: "Steel Count Project",
  applicationName: "Steel Count Project",
  referrer: "origin-when-cross-origin",
  authors: [{ name: "Steel Count Team" }],
  creator: "Steel Count Team",
  publisher: "Steel Count Team",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className}>
        <LanguageProvider>
          <ToastProvider>
            {/* Language Toggle - Fixed position */}
            {/* <div className="fixed top-4 right-4 z-50">
              <LanguageToggle />
            </div> */}
            {children}
          </ToastProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
