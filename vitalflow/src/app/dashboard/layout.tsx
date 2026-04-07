import { Navigation } from '@/components/shared/Navigation'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto pb-24">
        {children}
      </div>
      <Navigation />
    </div>
  )
}
