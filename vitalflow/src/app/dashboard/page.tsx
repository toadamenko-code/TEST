import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { Activity } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="px-4 pt-6 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-muted-foreground">Good morning ✨</p>
          <h1 className="text-2xl font-bold">Your Dashboard</h1>
        </div>
        <ThemeToggle />
      </div>

      {/* Coming soon placeholder */}
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 rounded-3xl bg-[var(--vf-blue)]/10 flex items-center justify-center mb-4">
          <Activity className="w-10 h-10 text-[var(--vf-blue)]" />
        </div>
        <h2 className="text-xl font-semibold mb-2">VitalFlow is building...</h2>
        <p className="text-muted-foreground text-sm max-w-xs">
          Your personal health dashboard is being set up. Check back in a moment!
        </p>
      </div>
    </div>
  )
}
