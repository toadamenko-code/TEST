'use client'

import { useState } from 'react'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { QuickActions } from '@/components/shared/QuickActions'
import { CyclePhaseCard } from '@/components/dashboard/CyclePhaseCard'
import { MoodCheckIn } from '@/components/dashboard/MoodCheckIn'
import { getCyclePhaseInfo } from '@/lib/health/cycle-tracker'
import { cn } from '@/lib/utils'
import { Footprints, Moon, Smile, Droplets, Scale, Dumbbell, Sparkles, AlertCircle } from 'lucide-react'

// Mock data
const mockLastPeriodStart = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago -> follicular
const phaseInfo = getCyclePhaseInfo(mockLastPeriodStart)

const mockSteps = 7342
const mockStepsGoal = 10000
const mockSleep = 7.2
const mockMoodLogged = false
const mockWeight = 62.4
const mockWaterGlasses = 5
const mockWaterGoal = 8
const mockWorkoutsThisWeek = 3
const mockSymptoms = ['fatigue', 'bloating', 'headache']

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function DashboardPage() {
  const [moodDone, setMoodDone] = useState(mockMoodLogged)

  return (
    <div className="px-4 pt-6 pb-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{getGreeting()} ✨</p>
          <h1 className="text-2xl font-bold tracking-tight">Sarah</h1>
        </div>
        <ThemeToggle />
      </div>

      {/* Today's snapshot strip */}
      <div className="grid grid-cols-4 gap-2">
        {/* Steps */}
        <div className="rounded-2xl bg-card border border-border/50 p-3 flex flex-col gap-1.5 shadow-sm">
          <Footprints className="w-4 h-4 text-[var(--vf-blue)]" />
          <p className="text-base font-bold tabular-nums leading-none">{mockSteps.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">Steps</p>
        </div>
        {/* Sleep */}
        <div className="rounded-2xl bg-card border border-border/50 p-3 flex flex-col gap-1.5 shadow-sm">
          <Moon className="w-4 h-4 text-[var(--vf-indigo)]" style={{ color: 'var(--vf-indigo)' }} />
          <p className="text-base font-bold tabular-nums leading-none">{mockSleep}h</p>
          <p className="text-[10px] text-muted-foreground">Sleep</p>
        </div>
        {/* Mood */}
        <div className="rounded-2xl bg-card border border-border/50 p-3 flex flex-col gap-1.5 shadow-sm">
          <Smile className="w-4 h-4 text-[var(--vf-green)]" />
          <p className="text-base font-bold tabular-nums leading-none">{moodDone ? '4/5' : '—'}</p>
          <p className="text-[10px] text-muted-foreground">Mood</p>
        </div>
        {/* Cycle phase badge */}
        <div
          className="rounded-2xl border border-border/50 p-3 flex flex-col gap-1.5 shadow-sm"
          style={{ backgroundColor: `${phaseInfo.color}18` }}
        >
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: phaseInfo.color }} />
          <p className="text-[11px] font-bold leading-none">{phaseInfo.label}</p>
          <p className="text-[10px] text-muted-foreground">Day {phaseInfo.dayInCycle}</p>
        </div>
      </div>

      {/* Cycle phase card */}
      <CyclePhaseCard phaseInfo={phaseInfo} />

      {/* Mood check-in (if not done) */}
      {!moodDone && (
        <div className="rounded-2xl bg-card border border-border/50 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Smile className="w-5 h-5 text-[var(--vf-blue)]" />
            <h2 className="font-semibold text-base">Mood Check-in</h2>
            <span className="ml-auto text-xs text-[var(--vf-orange)] bg-[var(--vf-orange)]/10 px-2 py-0.5 rounded-full font-medium">
              Today
            </span>
          </div>
          <MoodCheckIn onSave={() => setMoodDone(true)} compact />
        </div>
      )}

      {/* Quick stats row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-2xl bg-card border border-border/50 p-3 shadow-sm">
          <Scale className="w-4 h-4 text-[var(--vf-purple)] mb-2" />
          <p className="text-lg font-bold tabular-nums">{mockWeight}</p>
          <p className="text-[10px] text-muted-foreground">kg · last logged</p>
        </div>
        <div className="rounded-2xl bg-card border border-border/50 p-3 shadow-sm">
          <Droplets className="w-4 h-4 text-[var(--vf-teal)] mb-2" style={{ color: 'var(--vf-teal)' }} />
          <p className="text-lg font-bold tabular-nums">{mockWaterGlasses}/{mockWaterGoal}</p>
          <p className="text-[10px] text-muted-foreground">glasses today</p>
        </div>
        <div className="rounded-2xl bg-card border border-border/50 p-3 shadow-sm">
          <Dumbbell className="w-4 h-4 text-[var(--vf-green)] mb-2" />
          <p className="text-lg font-bold tabular-nums">{mockWorkoutsThisWeek}</p>
          <p className="text-[10px] text-muted-foreground">workouts / wk</p>
        </div>
      </div>

      {/* Recent symptoms */}
      <div className="rounded-2xl bg-card border border-border/50 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="w-4 h-4 text-[var(--vf-orange)]" />
          <h2 className="font-semibold text-sm">Recent Symptoms</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {mockSymptoms.map(symptom => (
            <span
              key={symptom}
              className="text-xs px-3 py-1.5 rounded-full bg-[var(--vf-orange)]/10 text-[var(--vf-orange)] font-medium"
            >
              {symptom}
            </span>
          ))}
          {mockSymptoms.length === 0 && (
            <p className="text-sm text-muted-foreground">No symptoms logged recently</p>
          )}
        </div>
      </div>

      {/* AI insight placeholder */}
      <div className="rounded-2xl bg-gradient-to-br from-[var(--vf-blue)]/10 to-[var(--vf-purple)]/10 border border-[var(--vf-blue)]/20 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-[var(--vf-blue)]" />
          <h2 className="font-semibold text-sm">Your Cycle-Aware Coach</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          You&apos;re in your follicular phase — a great time to push yourself. Add your food, mood, and workout data to unlock personalized insights.
        </p>
        <div className="mt-3 flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[var(--vf-blue)] animate-pulse" />
          <span className="text-xs text-[var(--vf-blue)] font-medium">Ready when you are</span>
        </div>
      </div>

      <QuickActions />
    </div>
  )
}
