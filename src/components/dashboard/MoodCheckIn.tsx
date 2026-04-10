'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { MOOD_TAGS } from '@/lib/types/mood'

const MOOD_EMOJIS = [
  { score: 1, emoji: '😢', label: 'Awful' },
  { score: 2, emoji: '😕', label: 'Bad' },
  { score: 3, emoji: '😐', label: 'Okay' },
  { score: 4, emoji: '🙂', label: 'Good' },
  { score: 5, emoji: '😄', label: 'Great' },
]

const moodBg = ['', 'bg-[var(--mood-1)]', 'bg-[var(--mood-2)]', 'bg-[var(--mood-3)]', 'bg-[var(--mood-4)]', 'bg-[var(--mood-5)]']

interface MoodCheckInProps {
  onSave?: (data: {
    mood_score: number
    energy_score: number
    stress_score: number
    tags: string[]
    notes: string
  }) => void
  compact?: boolean
}

export function MoodCheckIn({ onSave, compact = false }: MoodCheckInProps) {
  const [selectedMood, setSelectedMood] = useState<number | null>(null)
  const [energy, setEnergy] = useState(5)
  const [stress, setStress] = useState(5)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [saved, setSaved] = useState(false)

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const handleSave = () => {
    if (!selectedMood) return
    onSave?.({ mood_score: selectedMood, energy_score: energy, stress_score: stress, tags: selectedTags, notes })
    setSaved(true)
  }

  if (saved && selectedMood) {
    const emoji = MOOD_EMOJIS.find(m => m.score === selectedMood)
    return (
      <div className="text-center py-6">
        <div className="text-4xl mb-2">{emoji?.emoji}</div>
        <p className="font-semibold text-foreground">Mood logged!</p>
        <p className="text-sm text-muted-foreground mt-1">Energy {energy}/10 · Stress {stress}/10</p>
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 justify-center mt-3">
            {selectedTags.map(tag => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-[var(--vf-blue)]/10 text-[var(--vf-blue)]">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Emoji picker */}
      <div>
        <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wide">How are you feeling?</p>
        <div className="flex items-center justify-between gap-1">
          {MOOD_EMOJIS.map(({ score, emoji, label }) => (
            <button
              key={score}
              onClick={() => setSelectedMood(score)}
              className={cn(
                'flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-all border-2',
                selectedMood === score
                  ? 'border-transparent scale-105 shadow-md ' + moodBg[score] + '/20'
                  : 'border-transparent bg-muted/50 hover:bg-muted'
              )}
            >
              <span className={cn('text-2xl transition-transform', selectedMood === score && 'scale-125')}>
                {emoji}
              </span>
              {!compact && (
                <span className="text-[10px] text-muted-foreground font-medium">{label}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {!compact && (
        <>
          {/* Energy */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Energy</p>
              <span className="text-sm font-bold text-[var(--vf-blue)]">{energy}/10</span>
            </div>
            <Slider
              value={[energy]}
              onValueChange={([v]) => setEnergy(v)}
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
          </div>

          {/* Stress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Stress</p>
              <span className="text-sm font-bold text-[var(--vf-purple)]">{stress}/10</span>
            </div>
            <Slider
              value={[stress]}
              onValueChange={([v]) => setStress(v)}
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
          </div>

          {/* Tags */}
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Tags</p>
            <div className="flex flex-wrap gap-1.5">
              {MOOD_TAGS.slice(0, 12).map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    'text-xs px-3 py-1.5 rounded-full border transition-all',
                    selectedTags.includes(tag)
                      ? 'bg-[var(--vf-blue)] text-white border-[var(--vf-blue)]'
                      : 'border-border text-muted-foreground hover:border-[var(--vf-blue)] hover:text-[var(--vf-blue)]'
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Notes (optional)</p>
            <Textarea
              placeholder="What's on your mind?"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="resize-none text-sm rounded-xl"
              rows={2}
            />
          </div>
        </>
      )}

      <Button
        onClick={handleSave}
        disabled={!selectedMood}
        className="w-full bg-[var(--vf-blue)] hover:bg-[var(--vf-blue)]/90 text-white rounded-xl h-11"
      >
        Save Check-in
      </Button>
    </div>
  )
}
