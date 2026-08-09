'use client'

import { useEffect, useState } from 'react'

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Shift Tracker</h1>
        <p className="text-gray-400 mb-8">Track your work shifts and never get underpaid again.</p>
        <div className="bg-slate-900 p-6 rounded-lg border border-slate-800">
          <p className="mb-4">App is loading... If you see this, the deployment is working!</p>
          <p className="text-sm text-gray-500">Check back in a moment for the full app.</p>
        </div>
      </div>
    </div>
  )
}
