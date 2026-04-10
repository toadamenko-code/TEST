'use client'

import { useState } from 'react'
import { getCyclePhaseInfo } from '@/lib/health/cycle-tracker'
import { CyclePhaseCard } from '@/components/dashboard/CyclePhaseCard'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Heart, Droplets, Calendar, AlertCircle } from 'lucide-react'

const mockLastPeriodStart = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
const CYCLE_LENGTH = 28
const phaseInfo = getCyclePhaseInfo(mockLastPeriodStart, CYCLE_LENGTH)

const FLOW_LEVELS = ['spotting', 'light', 'medium', 'heavy'] as const
type FlowLevel = typeof FLOW_LEVELS[number]

const SYMPTOM_PRESETS = [
  'cramps', 'bloating', 'headache', 'breast tenderness',
  'mood swings', 'fatigue', 'acne', 'back pain',
]

const SYMPTOM_ICONS: Record<string, string> = {
  cramps: '🫀', bloating: '💨', headache: '🤕', 'breast tenderness': '💙',
  'mood swings': '🌪️', fatigue: '😴', acne: '😣', 'back pain': '🦴',
}

// 7-day calendar strip
function getCalendarDays() {
  const today = new Date()
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - 3 + i)
    return d
  })
}

const calendarDays = getCalendarDays()
const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

// SVG ring
function CycleRing({ day, total, color }: { day: number; total: number; color: string }) {
  const r = 52
  const circ = 2 * Math.PI * r
  const progress = Math.min(day / total, 1)
  const offset = circ - progress * circ

  return (
    <svg width="140" height="140" className="rotate-[-90deg]">
      <circle cx="70" cy="70" r={r} fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/40" />
      <circle
        cx="70" cy="70" r={r}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
    </svg>
  )
}

export default function CyclePage() {
  const [periodDialogOpen, setPeriodDialogOpen] = useState(false)
  const [intimacyDialogOpen, setIntimacyDialogOpen] = useState(false)
  const [flowLevel, setFlowLevel] = useState<FlowLevel>('medium')
  const [periodNotes, setPeriodNotes] = useState('')
  const [intimacyNotes, setIntimacyNotes] = useState('')
  const [loggedSymptoms, setLoggedSymptoms] = useState<string[]>([])
  const [periodLogged, setPeriodLogged] = useState(false)
  const [intimacyLogged, setIntimacyLogged] = useState(false)

  const toggleSymptom = (s: string) => {
    setLoggedSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }

  return (
    <div className="px-4 pt-6 pb-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-xl bg-[var(--vf-pink)]/10 flex items-center justify-center">
          <Heart className="w-5 h-5 text-[var(--vf-pink)]" style={{ color: 'var(--vf-pink)' }} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Cycle Tracker</h1>
      </div>

      {/* Big cycle ring */}
      <div className="rounded-2xl bg-card border border-border/50 p-6 shadow-sm flex flex-col items-center">
        <div className="relative">
          <CycleRing day={phaseInfo.dayInCycle} total={CYCLE_LENGTH} color={phaseInfo.color} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-3xl font-bold tabular-nums">{phaseInfo.dayInCycle}</p>
            <p className="text-xs text-muted-foreground">of {CYCLE_LENGTH} days</p>
          </div>
        </div>
        <h2 className="text-lg font-semibold mt-2" style={{ color: phaseInfo.color }}>
          {phaseInfo.label} Phase
        </h2>
        <p className="text-sm text-muted-foreground text-center mt-1 max-w-xs">
          {phaseInfo.description}
        </p>
      </div>

      {/* Phase info card */}
      <CyclePhaseCard phaseInfo={phaseInfo} />

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          className="h-12 rounded-2xl border-[var(--vf-red)]/30 text-[var(--vf-red)] hover:bg-[var(--vf-red)]/5"
          onClick={() => setPeriodDialogOpen(true)}
        >
          <Droplets className="w-4 h-4 mr-2" />
          {periodLogged ? 'Period Logged ✓' : 'Log Period'}
        </Button>
        <Button
          variant="outline"
          className="h-12 rounded-2xl border-[var(--vf-pink)]/30 hover:bg-[var(--vf-pink)]/5"
          style={{ color: 'var(--vf-pink)' }}
          onClick={() => setIntimacyDialogOpen(true)}
        >
          <Heart className="w-4 h-4 mr-2" />
          {intimacyLogged ? 'Logged ✓' : 'Log Intimacy'}
        </Button>
      </div>

      {/* Calendar strip */}
      <div className="rounded-2xl bg-card border border-border/50 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-[var(--vf-blue)]" />
          <h2 className="font-semibold text-sm">Calendar</h2>
        </div>
        <div className="flex justify-between gap-1">
          {calendarDays.map((day, i) => {
            const isToday = day.toDateString() === new Date().toDateString()
            const dayOfWeek = day.getDay()
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <p className="text-[10px] text-muted-foreground">{dayNames[dayOfWeek]}</p>
                <div
                  className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-all',
                    isToday
                      ? 'text-white'
                      : 'text-foreground hover:bg-muted cursor-pointer'
                  )}
                  style={isToday ? { backgroundColor: phaseInfo.color } : undefined}
                >
                  {day.getDate()}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Symptom quick-log */}
      <div className="rounded-2xl bg-card border border-border/50 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="w-4 h-4 text-[var(--vf-orange)]" />
          <h2 className="font-semibold text-sm">Log Symptoms</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {SYMPTOM_PRESETS.map(symptom => (
            <button
              key={symptom}
              onClick={() => toggleSymptom(symptom)}
              className={cn(
                'text-sm px-3 py-2 rounded-xl border transition-all flex items-center gap-1.5',
                loggedSymptoms.includes(symptom)
                  ? 'bg-[var(--vf-orange)] text-white border-[var(--vf-orange)]'
                  : 'border-border text-muted-foreground hover:border-[var(--vf-orange)] hover:text-[var(--vf-orange)]'
              )}
            >
              <span>{SYMPTOM_ICONS[symptom]}</span>
              <span>{symptom}</span>
            </button>
          ))}
        </div>
        {loggedSymptoms.length > 0 && (
          <p className="text-xs text-muted-foreground mt-3">
            {loggedSymptoms.length} symptom{loggedSymptoms.length > 1 ? 's' : ''} logged today
          </p>
        )}
      </div>

      {/* Cycle stats */}
      <div className="rounded-2xl bg-card border border-border/50 p-4 shadow-sm">
        <h2 className="font-semibold text-base mb-3">Cycle Stats</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-2xl font-bold tabular-nums">{CYCLE_LENGTH}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">avg length</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold tabular-nums">{phaseInfo.daysUntilNextPeriod}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">days to period</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold tabular-nums">{phaseInfo.daysUntilOvulation > 0 ? phaseInfo.daysUntilOvulation : '—'}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">days to ovulation</p>
          </div>
        </div>
      </div>

      {/* Period dialog */}
      <Dialog open={periodDialogOpen} onOpenChange={setPeriodDialogOpen}>
        <DialogContent className="rounded-3xl mx-4">
          <DialogHeader>
            <DialogTitle>Log Period</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <p className="text-sm font-medium mb-2">Flow Level</p>
              <div className="grid grid-cols-4 gap-2">
                {FLOW_LEVELS.map(level => (
                  <button
                    key={level}
                    onClick={() => setFlowLevel(level)}
                    className={cn(
                      'py-2.5 rounded-xl text-xs font-medium border transition-all capitalize',
                      flowLevel === level
                        ? 'bg-[var(--vf-red)] text-white border-[var(--vf-red)]'
                        : 'border-border text-muted-foreground hover:border-[var(--vf-red)]'
                    )}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
            <Textarea
              placeholder="Notes (optional)"
              value={periodNotes}
              onChange={e => setPeriodNotes(e.target.value)}
              className="rounded-xl resize-none"
              rows={2}
            />
            <Button
              className="w-full bg-[var(--vf-red)] hover:bg-[var(--vf-red)]/90 text-white rounded-xl"
              onClick={() => { setPeriodLogged(true); setPeriodDialogOpen(false) }}
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Intimacy dialog */}
      <Dialog open={intimacyDialogOpen} onOpenChange={setIntimacyDialogOpen}>
        <DialogContent className="rounded-3xl mx-4">
          <DialogHeader>
            <DialogTitle>Log Intimacy</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">Tracking intimacy alongside your cycle helps identify patterns in libido and wellbeing.</p>
            <Textarea
              placeholder="Notes (optional)"
              value={intimacyNotes}
              onChange={e => setIntimacyNotes(e.target.value)}
              className="rounded-xl resize-none"
              rows={2}
            />
            <Button
              className="w-full rounded-xl text-white"
              style={{ backgroundColor: 'var(--vf-pink)' }}
              onClick={() => { setIntimacyLogged(true); setIntimacyDialogOpen(false) }}
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
