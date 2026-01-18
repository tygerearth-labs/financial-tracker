'use client'

import { useProfile } from '@/contexts/ProfileContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import FinancialTrackerApp from '@/components/FinancialTrackerApp'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { activeProfile } = useProfile()
  const router = useRouter()

  useEffect(() => {
    // Allow access to home page even without active profile
    if (router.pathname === '/' || !activeProfile) {
      return
    }
  }, [activeProfile, router])

  return (
    <FinancialTrackerApp>
      {children}
    </FinancialTrackerApp>
  )
}
