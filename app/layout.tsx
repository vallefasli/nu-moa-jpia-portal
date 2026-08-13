import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { AuthSync } from '@/components/AuthSync'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NU MOA JPIA Portal',
  description: 'Membership Portal for NU MOA JPIA',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthSync />
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}
