import type { Metadata, Viewport } from "next"
import { Inter, Quicksand } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Header from "@/components/header"
import Footer from "@/components/footer"
import SoundEffects from "@/components/sound-effects"
import SafariThemeColor from "@/components/safari-theme-color"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const quicksand = Quicksand({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["300", "400", "500", "600", "700"],
})

export const metadata: Metadata = {
  metadataBase: new URL("https://srivibhuportfolio.vercel.app"),
  title: "Srivibhu Ponakala | Photography Portfolio",
  description: "Photography portfolio and visual storytelling by Srivibhu Ponakala.",
  openGraph: {
    title: "Srivibhu Ponakala | Photography Portfolio",
    description: "Automotive, travel, and lifestyle photography by Srivibhu Ponakala.",
    siteName: "Srivibhu Ponakala Photography",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Srivibhu Ponakala | Photography Portfolio",
    description: "Automotive, travel, and lifestyle photography by Srivibhu Ponakala.",
  },
}

export const viewport: Viewport = {
  // Set initial theme-color meta tag for iOS Safari
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${quicksand.variable}`} suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SafariThemeColor />
          <SoundEffects />
          <Header />
          <main>{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
