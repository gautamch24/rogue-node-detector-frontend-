'use client'

import { ThemeProvider } from "@/components/theme-provider"
import { useEffect, useState } from "react"

export default function ThemeProviderWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    // Return a placeholder with the same structure
    // to prevent layout shift during hydration
    return <>{children}</>
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      {children}
    </ThemeProvider>
  )
}
