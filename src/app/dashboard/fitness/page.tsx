'use client'

import { useState, useRef } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Activity, Upload, Footprints, Flame, MapPin, Plus, Scale, Dumbbell, Bike, PersonStanding, Waves } from 'lucide-react'

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MOCK_WEEKLY_STEPS = [8200, 6500, 9100, 7800, 5200, 10300, 7342]
const MAX_STEPS = Math.max(...MOCK_WEEKLY_STEPS)

const WORKOUT_TYPES = ['Running', 'Walking', 'Cycling', 'Swimming', 'Strength', 'Yoga', 'HIIT', 'Pilates', 'Other']

const WORKOUT_ICONS: Record<string, React.ReactNode> = {
  Running: <Activity className="w-4 h-4" />,
  Walking: <Footprints className="w-4 h-4" />,
  Cycling: <Bike className="w-4 h-4" />,
  Swimming: <Waves className="w-4 h-4" />,
  Strength: <Dumbbell className="w-4 h-4" />,
  Yoga: <PersonStanding className="w-4 h-4" />,
  HIIT: <Flame className="w-4 h-4" />,
  Pilates: <PersonStanding className="w-4 h-4" />,
  Other: <Activity className="w-4 h-4" />,
}

interface Workout {
  type: string
  duration: number
  calories: number
  date: string
  notes?: string
}

const mockWorkouts: Workout[] = [
  { type: 'Running', duration: 35, calories: 280, date: 'Apr 6' },
  { type: 'Yoga', duration: 50, calories: 120, date: 'Apr 5' },
  { type: 'Strength', duration: 45, calories: 220, date: 'Apr 3' },
]

const STEPS_TODAY = 7342
const STEPS_GOAL = 10000
const ACTIVE_CALORIES = 340
const DISTANCE_KM = 5.2

const UNITS = ['kg', 'lbs'] as const

export default function FitnessPage() {
  const [workouts, setWorkouts] = useState<Workout[]>(mockWorkouts)
  const [workoutDialogOpen, setWorkoutDialogOpen] = useState(false)
  const [weightDialogOpen, setWeightDialogOpen] = useState(false)
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg')
  const [importStatus, setImportStatus] = useState<'idle' | 'processing' | 'done'>('idle')

  // workout form
  const [wType, setWType] = useState('Running')
  const [wDuration, setWDuration] = useState('')
  const [wCalories, setWCalories] = useState('')
  const [wNotes, setWNotes] = useState('')

  // weight form
  const [wWeight, setWWeight] = useState('')
  const [wWaist, setWWaist] = useState('')
  const [wHips, setWHips] = useState('')
  const [wChest, setWChest] = useState('')

  const xmlInputRef = useRef<HTMLInputElement>(null)

  const saveWorkout = () => {
    if (!wDuration) return
    setWorkouts(prev => [{
      type: wType,
      duration: Number(wDuration),
      calories: Number(wCalories) || 0,
      date: 'Today',
      notes: wNotes,
    }, ...prev])
    setWorkoutDialogOpen(false)
    setWDuration('')
    setWCalories('')
    setWNotes('')
  }

  const handleXmlImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return
    setImportStatus('processing')
    setTimeout(() => setImportStatus('done'), 2000)
  }

  const stepsProgress = (STEPS_TODAY / STEPS_GOAL) * 100

  return (
    <div className="px-4 pt-6 pb-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-xl bg-[var(--vf-green)]/10 flex items-center justify-center">
          <Activity className="w-5 h-5 text-[var(--vf-green)]" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Fitness &amp; Activity</h1>
      </div>

      {/* Apple Health import */}
      <div className="rounded-2xl bg-card border border-border/50 p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[var(--vf-red)]/10 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5 text-[var(--vf-red)]" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-sm">Import from Apple Health</h2>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              On iPhone: Health app → Profile → Export All Health Data → share the ZIP. Extract and upload <span className="font-mono">export.xml</span>.
            </p>
          </div>
        </div>
        <div className="mt-3">
          {importStatus === 'idle' && (
            <Button
              variant="outline"
              className="w-full rounded-xl h-10"
              onClick={() => xmlInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload export.xml
            </Button>
          )}
          {importStatus === 'processing' && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center py-2">
              <div className="w-4 h-4 border-2 border-[var(--vf-blue)] border-t-transparent rounded-full animate-spin" />
              Processing your health data...
            </div>
          )}
          {importStatus === 'done' && (
            <div className="flex items-center gap-2 text-sm text-[var(--vf-green)] justify-center py-2">
              ✓ Import complete! Data synced successfully.
            </div>
          )}
          <input
            ref={xmlInputRef}
            type="file"
            accept=".xml"
            className="hidden"
            onChange={handleXmlImport}
          />
        </div>
      </div>

      {/* Today's activity */}
      <div className="rounded-2xl bg-card border border-border/50 p-4 shadow-sm">
        <h2 className="font-semibold text-base mb-4">Today&apos;s Activity</h2>
        {/* Steps */}
        <div className="mb-4">
          <div className="flex items-end gap-2 mb-2">
            <span className="text-4xl font-bold tabular-nums tracking-tight">{STEPS_TODAY.toLocaleString()}</span>
            <span className="text-lg text-muted-foreground mb-0.5">steps</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${stepsProgress}%`, backgroundColor: 'var(--vf-blue)' }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">{STEPS_TODAY.toLocaleString()} / {STEPS_GOAL.toLocaleString()} goal</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Flame className="w-3.5 h-3.5 text-[var(--vf-orange)]" />
              <p className="text-xs text-muted-foreground">Active Calories</p>
            </div>
            <p className="text-xl font-bold">{ACTIVE_CALORIES}</p>
            <p className="text-xs text-muted-foreground">kcal</p>
          </div>
          <div className="bg-muted/50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <MapPin className="w-3.5 h-3.5 text-[var(--vf-green)]" />
              <p className="text-xs text-muted-foreground">Distance</p>
            </div>
            <p className="text-xl font-bold">{DISTANCE_KM}</p>
            <p className="text-xs text-muted-foreground">km</p>
          </div>
        </div>
      </div>

      {/* Weekly bar chart */}
      <div className="rounded-2xl bg-card border border-border/50 p-4 shadow-sm">
        <h2 className="font-semibold text-base mb-4">This Week</h2>
        <div className="flex items-end gap-1.5 h-28">
          {MOCK_WEEKLY_STEPS.map((steps, i) => {
            const height = (steps / MAX_STEPS) * 100
            const isToday = i === 6
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full flex items-end justify-center" style={{ height: '88px' }}>
                  <div
                    className="w-full rounded-t-lg transition-all"
                    style={{
                      height: `${height}%`,
                      backgroundColor: isToday ? 'var(--vf-blue)' : 'var(--vf-blue)',
                      opacity: isToday ? 1 : 0.35,
                    }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">{DAYS_OF_WEEK[i]}</p>
              </div>
            )
          })}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>0</span>
          <span>10k steps</span>
        </div>
      </div>

      {/* Workout log */}
      <div className="rounded-2xl bg-card border border-border/50 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-base">Workouts</h2>
          <Button
            size="sm"
            className="bg-[var(--vf-green)] hover:bg-[var(--vf-green)]/90 text-white rounded-xl h-8 text-xs"
            onClick={() => setWorkoutDialogOpen(true)}
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Log Workout
          </Button>
        </div>
        <div className="space-y-2.5">
          {workouts.slice(0, 3).map((w, i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-border/40 last:border-0">
              <div className="w-9 h-9 rounded-xl bg-[var(--vf-green)]/10 flex items-center justify-center text-[var(--vf-green)] shrink-0">
                {WORKOUT_ICONS[w.type] ?? <Activity className="w-4 h-4" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{w.type}</p>
                <p className="text-xs text-muted-foreground">{w.duration} min · {w.calories} kcal</p>
              </div>
              <span className="text-xs text-muted-foreground">{w.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Body measurements */}
      <div className="rounded-2xl bg-card border border-border/50 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-base">Body Measurements</h2>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl h-8 text-xs"
            onClick={() => setWeightDialogOpen(true)}
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Log
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Scale className="w-3.5 h-3.5 text-[var(--vf-purple)]" />
              <p className="text-xs text-muted-foreground">Weight</p>
            </div>
            <div className="flex items-baseline gap-1">
              <p className="text-2xl font-bold">62.4</p>
              <div className="flex gap-1">
                {UNITS.map(u => (
                  <button
                    key={u}
                    onClick={() => setWeightUnit(u)}
                    className={cn(
                      'text-[10px] px-1.5 py-0.5 rounded-full transition-all',
                      weightUnit === u ? 'bg-[var(--vf-purple)]/20 text-[var(--vf-purple)]' : 'text-muted-foreground'
                    )}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-muted/50 rounded-xl p-3">
            <p className="text-xs text-muted-foreground mb-1">BMI</p>
            <p className="text-2xl font-bold">21.4</p>
            <p className="text-xs text-[var(--vf-green)]">Healthy</p>
          </div>
        </div>
      </div>

      {/* Workout dialog */}
      <Dialog open={workoutDialogOpen} onOpenChange={setWorkoutDialogOpen}>
        <DialogContent className="rounded-3xl mx-4">
          <DialogHeader>
            <DialogTitle>Log Workout</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label className="text-sm font-medium">Workout Type</Label>
              <Select value={wType} onValueChange={setWType}>
                <SelectTrigger className="rounded-xl mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WORKOUT_TYPES.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-medium">Duration (min)</Label>
                <Input value={wDuration} onChange={e => setWDuration(e.target.value)} type="number" placeholder="45" className="rounded-xl mt-1.5" />
              </div>
              <div>
                <Label className="text-sm font-medium">Calories</Label>
                <Input value={wCalories} onChange={e => setWCalories(e.target.value)} type="number" placeholder="200" className="rounded-xl mt-1.5" />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Notes (optional)</Label>
              <Textarea value={wNotes} onChange={e => setWNotes(e.target.value)} placeholder="How did it feel?" className="rounded-xl resize-none mt-1.5" rows={2} />
            </div>
            <Button
              className="w-full bg-[var(--vf-green)] hover:bg-[var(--vf-green)]/90 text-white rounded-xl"
              onClick={saveWorkout}
              disabled={!wDuration}
            >
              Save Workout
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Weight dialog */}
      <Dialog open={weightDialogOpen} onOpenChange={setWeightDialogOpen}>
        <DialogContent className="rounded-3xl mx-4">
          <DialogHeader>
            <DialogTitle>Log Measurements</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label className="text-sm font-medium">Weight ({weightUnit})</Label>
              <Input value={wWeight} onChange={e => setWWeight(e.target.value)} type="number" placeholder="62.4" className="rounded-xl mt-1.5" />
            </div>
            <p className="text-xs text-muted-foreground -mt-2">Optional measurements (cm)</p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Waist</Label>
                <Input value={wWaist} onChange={e => setWWaist(e.target.value)} type="number" placeholder="cm" className="rounded-xl mt-1" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Hips</Label>
                <Input value={wHips} onChange={e => setWHips(e.target.value)} type="number" placeholder="cm" className="rounded-xl mt-1" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Chest</Label>
                <Input value={wChest} onChange={e => setWChest(e.target.value)} type="number" placeholder="cm" className="rounded-xl mt-1" />
              </div>
            </div>
            <Button
              className="w-full bg-[var(--vf-purple)] hover:bg-[var(--vf-purple)]/90 text-white rounded-xl"
              onClick={() => setWeightDialogOpen(false)}
              disabled={!wWeight}
            >
              Save Measurements
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
