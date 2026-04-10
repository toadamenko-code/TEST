'use client'

import { useState, useEffect } from 'react'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { QuickActions } from '@/components/shared/QuickActions'
import { CyclePhaseCard } from '@/components/dashboard/CyclePhaseCard'
import { MoodCheckIn } from '@/components/dashboard/MoodCheckIn'
import { getCyclePhaseInfo } from '@/lib/health/cycle-tracker'
import { Footprints, Moon, Smile, Droplets, Scale, Dumbbell, Sparkles, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

// Fallback for cycle phase if no real data yet
const FALLBACK_PERIOD_START = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)

const mockSteps = 7342
const mockStepsGoal = 10000
const mockSleep = 7.2

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

interface DashboardSummary {
  moodScore?: number
  waterGlasses: number
  workoutsThisWeek: number
  latestWeightKg?: number
  recentSymptoms: string[]
  lastPeriodStart: Date
  userName: string
}

export default function DashboardPage() {
  const [moodDone, setMoodDone] = useState(false)
  const [summary, setSummary] = useState<DashboardSummary>({
    waterGlasses: 0,
    workoutsThisWeek: 0,
    recentSymptoms: [],
    lastPeriodStart: FALLBACK_PERIOD_START,
    userName: 'Sarah',
  })

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const today = new Date().toISOString().split('T')[0]
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const [moodRes, waterRes, workoutRes, measurementRes, symptomRes, cycleRes] = await Promise.all([
        // Today's mood
        supabase
          .from('mood_entries')
          .select('mood_score')
          .eq('user_id', user.id)
          .gte('recorded_at', today)
          .order('recorded_at', { ascending: false })
          .limit(1),
        // Today's water
        supabase
          .from('water_entries')
          .select('amount_ml')
          .eq('user_id', user.id)
          .gte('recorded_at', today),
        // This week's workouts
        supabase
          .from('workout_entries')
          .select('id')
          .eq('user_id', user.id)
          .gte('recorded_at', sevenDaysAgo.toISOString()),
        // Latest measurement
        supabase
          .from('measurement_entries')
          .select('weight_kg')
          .eq('user_id', user.id)
          .order('recorded_at', { ascending: false })
          .limit(1),
        // Recent symptoms
        supabase
          .from('symptom_entries')
          .select('symptoms')
          .eq('user_id', user.id)
          .order('recorded_at', { ascending: false })
          .limit(1),
        // Most recent period start for cycle phase
        supabase
          .from('cycle_entries')
          .select('recorded_at')
          .eq('user_id', user.id)
          .eq('entry_type', 'period_start')
          .order('recorded_at', { ascending: false })
          .limit(1),
      ])

      const newSummary: DashboardSummary = {
        waterGlasses: 0,
        workoutsThisWeek: 0,
        recentSymptoms: [],
        lastPeriodStart: FALLBACK_PERIOD_START,
        userName: user.email?.split('@')[0] ?? 'Sarah',
      }

      if (moodRes.data && moodRes.data.length > 0) {
        newSummary.moodScore = moodRes.data[0].mood_score
        setMoodDone(true)
      }

      if (waterRes.data) {
        const totalMl = waterRes.data.reduce((sum: number, w: { amount_ml: number }) => sum + (w.amount_ml ?? 0), 0)
        newSummary.waterGlasses = Math.round(totalMl / 250)
      }

      if (workoutRes.data) {
        newSummary.workoutsThisWeek = workoutRes.data.length
      }

      if (measurementRes.data && measurementRes.data.length > 0) {
        newSummary.latestWeightKg = measurementRes.data[0].weight_kg ?? undefined
      }

      if (symptomRes.data && symptomRes.data.length > 0) {
        newSummary.recentSymptoms = symptomRes.data[0].symptoms ?? []
      }

      if (cycleRes.data && cycleRes.data.length > 0) {
        newSummary.lastPeriodStart = new Date(cycleRes.data[0].recorded_at)
      }

      setSummary(newSummary)
    }
    loadData()
  }, [])

  const phaseInfo = getCyclePhaseInfo(summary.lastPeriodStart)

  const handleMoodSave = async (data: {
    mood_score: number
    energy_score: number
    stress_score: number
    tags: string[]
    notes: string
  }) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('Not logged in')
      return
    }

    const { error } = await supabase.from('mood_entries').insert({
      user_id: user.id,
      mood_score: data.mood_score,
      energy_score: data.energy_score,
      stress_score: data.stress_score,
      tags: data.tags,
      notes: data.notes,
      recorded_at: new Date().toISOString(),
    })

    if (error) {
      toast.error('Failed to save mood')
      return
    }

    toast.success('Mood saved!')
    setMoodDone(true)
    setSummary(prev => ({ ...prev, moodScore: data.mood_score }))
  }

  const moodDisplay = summary.moodScore ? `${summary.moodScore}/5` : '—'

  return (
    <div className="px-4 pt-6 pb-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{getGreeting()} ✨</p>
          <h1 className="text-2xl font-bold tracking-tight capitalize">{summary.userName}</h1>
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
          <p className="text-base font-bold tabular-nums leading-none">{moodDisplay}</p>
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
          <MoodCheckIn onSave={handleMoodSave} compact />
        </div>
      )}

      {/* Quick stats row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-2xl bg-card border border-border/50 p-3 shadow-sm">
          <Scale className="w-4 h-4 text-[var(--vf-purple)] mb-2" />
          <p className="text-lg font-bold tabular-nums">
            {summary.latestWeightKg ? summary.latestWeightKg.toFixed(1) : '—'}
          </p>
          <p className="text-[10px] text-muted-foreground">kg · last logged</p>
        </div>
        <div className="rounded-2xl bg-card border border-border/50 p-3 shadow-sm">
          <Droplets className="w-4 h-4 text-[var(--vf-teal)] mb-2" style={{ color: 'var(--vf-teal)' }} />
          <p className="text-lg font-bold tabular-nums">{summary.waterGlasses}/8</p>
          <p className="text-[10px] text-muted-foreground">glasses today</p>
        </div>
        <div className="rounded-2xl bg-card border border-border/50 p-3 shadow-sm">
          <Dumbbell className="w-4 h-4 text-[var(--vf-green)] mb-2" />
          <p className="text-lg font-bold tabular-nums">{summary.workoutsThisWeek}</p>
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
          {summary.recentSymptoms.map(symptom => (
            <span
              key={symptom}
              className="text-xs px-3 py-1.5 rounded-full bg-[var(--vf-orange)]/10 text-[var(--vf-orange)] font-medium"
            >
              {symptom}
            </span>
          ))}
          {summary.recentSymptoms.length === 0 && (
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
          You&apos;re in your {phaseInfo.label.toLowerCase()} phase — {phaseInfo.description}
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
