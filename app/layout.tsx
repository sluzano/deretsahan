import type { Metadata, Viewport } from 'next'
import { Inter, Merriweather, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { ToastProvider } from '@/components/providers/toast-provider'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const merriweather = Merriweather({ 
  subsets: ['latin'],
  weight: ['300', '400', '700', '900'],
  variable: '--font-merriweather',
})

const geistMono = Geist_Mono({ 
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  title: {
    default: 'NewsPortal - Your Trusted Source for Breaking News',
    template: '%s | NewsPortal',
  },
  description: 'Stay informed with the latest breaking news, in-depth analysis, and comprehensive coverage of politics, technology, sports, entertainment, and more.',
  keywords: ['news', 'breaking news', 'politics', 'technology', 'sports', 'entertainment', 'business', 'health'],
  authors: [{ name: 'NewsPortal' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'NewsPortal',
    title: 'NewsPortal - Your Trusted Source for Breaking News',
    description: 'Stay informed with the latest breaking news and in-depth analysis.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NewsPortal',
    description: 'Your trusted source for breaking news and in-depth analysis.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8fafc' },
    { media: '(prefers-color-scheme: dark)', color: '#1e1b4b' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${merriweather.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased bg-background">
        <ThemeProvider>
          {children}
          <ToastProvider />
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
