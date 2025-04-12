import type { Metadata } from 'next'
import './globals.css'
import ThemeProviderWrapper from '@/components/theme-provider-wrapper'

export const metadata: Metadata = {
  title: 'Rogue Node Detection',
  description: 'Network monitoring and rogue node detection visualization',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body suppressHydrationWarning>
        <ThemeProviderWrapper>
          {children}
        </ThemeProviderWrapper>
      </body>
    </html>
  )
}
