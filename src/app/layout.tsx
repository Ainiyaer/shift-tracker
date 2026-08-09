import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Shift Tracker',
  description: 'Track your work shifts and calculate total hours worked',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-white">{children}</body>
    </html>
  )
}
