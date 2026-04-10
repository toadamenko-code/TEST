'use client'

import { useState, useEffect } from 'react'
import { MoodCheckIn } from '@/components/dashboard/MoodCheckIn'
import { cn } from '@/lib/utils'
import { Smile } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const MOOD_EMOJIS = ['', '😢', '😕', '😐', '🙂', '😄']
const MOOD_LABELS = ['', 'Awful', 'Bad', 'Okay', 'Good', 'Great']
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const tagColors = [
  'bg-[var(--vf-blue)]/10 text-[var(--vf-blue)]',
  'bg-[var(--vf-purple)]/10 text-[var(--vf-purple)]',
  'bg-[var(--vf-green)]/10 text-[var(--vf-green)]',
  'bg-[var(--vf-orange)]/10 text-[var(--vf-orange)]',
]

const moodColor = [
  '',
  'bg-[var(--mood-1)]',
  'bg-[var(--mood-2)]',
  'bg-[var(--mood-3)]',
  'bg-[var(--mood-4)]',
  'bg-[var(--mood-5)]',
]

interface MoodEntry {
  id: string
  mood_score: number
  energy_score: number
  stress_score: number
  tags: string[]
  notes: string
  recorded_at: string
}

export default function MoodPage() {
  const [loggedToday, setLoggedToday] = useState(false)
  const [todayEntry, setTodayEntry] = useState<{
    mood_score: number
    energy_score: number
    stress_score: number
    tags: string[]
    notes: string
  } | null>(null)
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([])
  const [weekMoods, setWeekMoods] = useState<number[]>([0, 0, 0, 0, 0, 0, 0])

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('recorded_at', sevenDaysAgo.toISOString())
        .order('recorded_at', { ascending: false })

      if (error) {
        toast.error('Failed to load mood history')
        return
      }

      if (data && data.length > 0) {
        setMoodHistory(data)

        // Check if today already has an entry
        const today = new Date().toISOString().split('T')[0]
        const todayData = data.find(e => e.recorded_at.startsWith(today))
        if (todayData) {
          setTodayEntry({
            mood_score: todayData.mood_score,
            energy_score: todayData.energy_score,
            stress_score: todayData.stress_score,
            tags: todayData.tags ?? [],
            notes: todayData.notes ?? '',
          })
          setLoggedToday(true)
        }

        // Build week moods (Mon=0 ... Sun=6)
        const newWeekMoods = [0, 0, 0, 0, 0, 0, 0]
        data.forEach(entry => {
          const d = new Date(entry.recorded_at)
          // getDay() returns 0=Sun,1=Mon...6=Sat; map to Mon-Sun index
          const jsDay = d.getDay()
          const idx = jsDay === 0 ? 6 : jsDay - 1
          if (newWeekMoods[idx] === 0) newWeekMoods[idx] = entry.mood_score
        })
        setWeekMoods(newWeekMoods)
      }
    }
    loadData()
  }, [])

  const handleSave = async (data: {
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
    setTodayEntry(data)
    setLoggedToday(true)

    // Update week moods for today
    const jsDay = new Date().getDay()
    const idx = jsDay === 0 ? 6 : jsDay - 1
    setWeekMoods(prev => {
      const next = [...prev]
      next[idx] = data.mood_score
      return next
    })
  }

  // Derive frequent tags from history
  const tagCounts: Record<string, number> = {}
  moodHistory.forEach(e => {
    (e.tags ?? []).forEach(tag => { tagCounts[tag] = (tagCounts[tag] ?? 0) + 1 })
  })
  const frequentTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([tag]) => tag)

  return (
    <div className="px-4 pt-6 pb-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-xl bg-[var(--vf-blue)]/10 flex items-center justify-center">
          <Smile className="w-5 h-5 text-[var(--vf-blue)]" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Mood &amp; Energy</h1>
      </div>

      {/* Today's check-in */}
      <div className="rounded-2xl bg-card border border-border/50 p-4 shadow-sm">
        <h2 className="font-semibold text-base mb-4">
          {loggedToday ? "Today's Entry" : "Today's Check-in"}
        </h2>
        {loggedToday && todayEntry ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{MOOD_EMOJIS[todayEntry.mood_score]}</span>
              <div>
                <p className="font-semibold">{MOOD_LABELS[todayEntry.mood_score]}</p>
                <p className="text-sm text-muted-foreground">Mood score {todayEntry.mood_score}/5</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-[var(--vf-blue)]">{todayEntry.energy_score}</p>
                <p className="text-xs text-muted-foreground">Energy / 10</p>
              </div>
              <div className="bg-muted/50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-[var(--vf-purple)]">{todayEntry.stress_score}</p>
                <p className="text-xs text-muted-foreground">Stress / 10</p>
              </div>
            </div>
            {todayEntry.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {todayEntry.tags.map(tag => (
                  <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-[var(--vf-blue)]/10 text-[var(--vf-blue)]">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {todayEntry.notes && (
              <p className="text-sm text-muted-foreground italic">&quot;{todayEntry.notes}&quot;</p>
            )}
          </div>
        ) : (
          <MoodCheckIn onSave={handleSave} />
        )}
      </div>

      {/* 7-day mood trend */}
      <div className="rounded-2xl bg-card border border-border/50 p-4 shadow-sm">
        <h2 className="font-semibold text-base mb-4">Last 7 Days</h2>
        <div className="flex items-end justify-between gap-1">
          {DAYS.map((day, i) => {
            const mood = weekMoods[i]
            return (
              <div key={day} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center text-lg transition-all',
                    mood > 0 ? moodColor[mood] + '/20' : 'bg-muted'
                  )}
                >
                  <span className={mood > 0 ? 'text-base' : 'text-muted-foreground text-xs'}>
                    {mood > 0 ? MOOD_EMOJIS[mood] : '—'}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground font-medium">{day}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Frequent tags */}
      {frequentTags.length > 0 && (
        <div className="rounded-2xl bg-card border border-border/50 p-4 shadow-sm">
          <h2 className="font-semibold text-base mb-3">Frequent Feelings</h2>
          <div className="flex flex-wrap gap-2">
            {frequentTags.map((tag, i) => (
              <span
                key={tag}
                className={cn('text-sm px-3 py-1.5 rounded-full font-medium', tagColors[i % tagColors.length])}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Log history */}
      {moodHistory.length > 0 && (
        <div className="rounded-2xl bg-card border border-border/50 p-4 shadow-sm">
          <h2 className="font-semibold text-base mb-3">Recent History</h2>
          <div className="space-y-3">
            {moodHistory.slice(0, 5).map(entry => {
              const d = new Date(entry.recorded_at)
              const dateLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              return (
                <div key={entry.id} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                  <span className="text-2xl">{MOOD_EMOJIS[entry.mood_score]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{dateLabel}</p>
                      <span className="text-xs text-muted-foreground">Energy {entry.energy_score}/10</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {(entry.tags ?? []).map(tag => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div
                    className={cn('w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold', moodColor[entry.mood_score] + '/20')}
                  >
                    {entry.mood_score}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
