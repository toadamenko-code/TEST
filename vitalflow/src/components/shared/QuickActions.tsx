'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, Smile, Camera, Droplets, AlertCircle, Scale, Dumbbell, Heart } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

const actions = [
  { id: 'mood', label: 'Log Mood', icon: Smile, color: 'var(--vf-blue)', href: '/dashboard/mood' },
  { id: 'food', label: 'Log Food', icon: Camera, color: 'var(--vf-green)', href: '/dashboard/nutrition' },
  { id: 'water', label: 'Log Water', icon: Droplets, color: 'var(--vf-teal)', href: '/dashboard/nutrition' },
  { id: 'symptom', label: 'Log Symptom', icon: AlertCircle, color: 'var(--vf-orange)', href: '/dashboard/cycle' },
  { id: 'weight', label: 'Log Weight', icon: Scale, color: 'var(--vf-purple)', href: '/dashboard/fitness' },
  { id: 'workout', label: 'Log Workout', icon: Dumbbell, color: 'var(--vf-red)', href: '/dashboard/fitness' },
  { id: 'intimacy', label: 'Log Intimacy', icon: Heart, color: 'var(--vf-pink)', href: '/dashboard/cycle' },
]

export function QuickActions() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleAction = (href: string) => {
    setOpen(false)
    router.push(href)
  }

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen(true)}
        className={cn(
          'fixed bottom-24 right-4 z-50',
          'w-14 h-14 rounded-full shadow-lg',
          'bg-[var(--vf-blue)] text-white',
          'flex items-center justify-center',
          'transition-all active:scale-95 hover:bg-[var(--vf-blue)]/90',
          'shadow-[0_4px_20px_rgba(0,122,255,0.4)]'
        )}
        aria-label="Quick actions"
      >
        <Plus className="w-6 h-6" strokeWidth={2.5} />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl pb-10 pt-0">
          <SheetHeader className="pt-4 pb-2 px-6">
            <div className="w-10 h-1 rounded-full bg-muted mx-auto mb-3" />
            <SheetTitle className="text-lg font-semibold text-left">Quick Log</SheetTitle>
          </SheetHeader>

          <div className="grid grid-cols-4 gap-3 px-4 pt-2">
            {actions.map(({ id, label, icon: Icon, color, href }) => (
              <button
                key={id}
                onClick={() => handleAction(href)}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-muted/60 hover:bg-muted active:scale-95 transition-all"
              >
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: `${color}18` }}
                >
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <span className="text-[10px] font-medium text-muted-foreground text-center leading-tight">
                  {label}
                </span>
              </button>
            ))}
            <button
              onClick={() => setOpen(false)}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-muted/60 hover:bg-muted active:scale-95 transition-all"
            >
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-muted">
                <X className="w-5 h-5 text-muted-foreground" />
              </div>
              <span className="text-[10px] font-medium text-muted-foreground">Cancel</span>
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
