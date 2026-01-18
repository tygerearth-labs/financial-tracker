import FinancialTrackerApp from '@/components/FinancialTrackerApp'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <FinancialTrackerApp>{children}</FinancialTrackerApp>
}
