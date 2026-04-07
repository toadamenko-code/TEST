'use client'

import { useState } from 'react'
import { MoodCheckIn } from '@/components/dashboard/MoodCheckIn'
import { cn } from '@/lib/utils'
import { Smile } from 'lucide-react'

const MOOD_EMOJIS = ['', '😢', '😕', '😐', '🙂', '😄']
const MOOD_LABELS = ['', 'Awful', 'Bad', 'Okay', 'Good', 'Great']
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// Mock data for last 7 days
const mockWeekMoods = [3, 4, 2, 5, 4, 3, 0] // 0 = not logged
const mockFrequentTags = ['tired', 'anxious', 'calm', 'energized', 'focused', 'grateful']

const tagColors = [
  'bg-[var(--vf-blue)]/10 text-[var(--vf-blue)]',
  'bg-[var(--vf-purple)]/10 text-[var(--vf-purple)]',
  'bg-[var(--vf-green)]/10 text-[var(--vf-green)]',
  'bg-[var(--vf-orange)]/10 text-[var(--vf-orange)]',
]

const mockHistory = [
  { date: 'Apr 6', mood: 4, emoji: '🙂', energy: 7, tags: ['energized', 'focused'] },
  { date: 'Apr 5', mood: 5, emoji: '😄', energy: 9, tags: ['happy', 'motivated', 'grateful'] },
  { date: 'Apr 4', mood: 2, emoji: '😕', energy: 3, tags: ['tired', 'anxious'] },
  { date: 'Apr 3', mood: 3, emoji: '😐', energy: 5, tags: ['calm'] },
  { date: 'Apr 2', mood: 4, emoji: '🙂', energy: 6, tags: ['focused', 'social'] },
]

const moodColor = [
  '',
  'bg-[var(--mood-1)]',
  'bg-[var(--mood-2)]',
  'bg-[var(--mood-3)]',
  'bg-[var(--mood-4)]',
  'bg-[var(--mood-5)]',
]

export default function MoodPage() {
  const [loggedToday, setLoggedToday] = useState(false)
  const [todayEntry, setTodayEntry] = useState<{
    mood_score: number
    energy_score: number
    stress_score: number
    tags: string[]
    notes: string
  } | null>(null)

  const handleSave = (data: typeof todayEntry) => {
    setTodayEntry(data)
    setLoggedToday(true)
  }

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
            const mood = mockWeekMoods[i]
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
      <div className="rounded-2xl bg-card border border-border/50 p-4 shadow-sm">
        <h2 className="font-semibold text-base mb-3">Frequent Feelings</h2>
        <div className="flex flex-wrap gap-2">
          {mockFrequentTags.map((tag, i) => (
            <span
              key={tag}
              className={cn('text-sm px-3 py-1.5 rounded-full font-medium', tagColors[i % tagColors.length])}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Log history */}
      <div className="rounded-2xl bg-card border border-border/50 p-4 shadow-sm">
        <h2 className="font-semibold text-base mb-3">Recent History</h2>
        <div className="space-y-3">
          {mockHistory.map(entry => (
            <div key={entry.date} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
              <span className="text-2xl">{entry.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{entry.date}</p>
                  <span className="text-xs text-muted-foreground">Energy {entry.energy}/10</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {entry.tags.map(tag => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div
                className={cn('w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold', moodColor[entry.mood] + '/20')}
              >
                {entry.mood}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
