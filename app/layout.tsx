import React from "react"
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: 'FiveM Hub - Scripts, MLO, Tools & More',
  description: 'The best platform to share and download FiveM resources - Scripts, MLO, Maps, Tools, Dumps and more!',
  keywords: ['FiveM', 'Scripts', 'MLO', 'GTA V', 'Roleplay', 'Resources', 'Maps', 'Tools'],
    generator: 'v0.app'
}

export const viewport = {
  themeColor: '#0f1419',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
