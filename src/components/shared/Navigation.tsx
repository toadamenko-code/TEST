'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Apple, Heart, Activity, Lightbulb, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/dashboard/nutrition', icon: Apple, label: 'Food' },
  { href: '/dashboard/cycle', icon: Heart, label: 'Cycle' },
  { href: '/dashboard/fitness', icon: Activity, label: 'Fitness' },
  { href: '/dashboard/insights', icon: Lightbulb, label: 'Insights' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border">
      <div className="max-w-2xl mx-auto px-2">
        <div className="flex items-center justify-around py-2">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all',
                  active
                    ? 'text-[var(--vf-blue)]'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className={cn('w-5 h-5', active && 'fill-current')} strokeWidth={active ? 2.5 : 1.5} />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
