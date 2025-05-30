import Header from '@/components/Header'
import { ClerkLoaded } from '@clerk/nextjs'
import React from 'react'

function DashboardLayout({children}:{children: React.ReactNode}) {
  return (
    <ClerkLoaded>
      <div>
        <Header />
        <main>
          {children}
        </main>
      </div>
    </ClerkLoaded>
  )
}

export default DashboardLayout