'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Lightbulb, Sparkles, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts'

const radarData = [
  { axis: 'Sleep', value: 7 },
  { axis: 'Nutrition', value: 6 },
  { axis: 'Activity', value: 8 },
  { axis: 'Mood', value: 7 },
  { axis: 'Hydration', value: 5 },
  { axis: 'Cycle', value: 8 },
]

const PATTERN_CARDS = [
  {
    emoji: '💤',
    title: 'Sleep & Mood',
    insight: 'Your mood scores are 40% higher on days you sleep 7+ hours. Last week you averaged 6.8h — just 12 more minutes each night could meaningfully shift your emotional baseline.',
    color: 'var(--vf-indigo)',
  },
  {
    emoji: '🌙',
    title: 'Cycle & Energy',
    insight: 'Your energy dips 2–3 days before your period starts. You\'re now in follicular phase — energy will climb over the next week. Try iron-rich foods like spinach and lentils in the luteal window to buffer the dip.',
    color: 'var(--vf-purple)',
  },
  {
    emoji: '🏃',
    title: 'Movement & Mood',
    insight: 'On days you walk 8,000+ steps your evening mood averages 4.2 vs 2.8 on sedentary days. That\'s a 50% lift. Even a 20-minute lunchtime walk makes the difference.',
    color: 'var(--vf-green)',
  },
]

const MEAL_PLAN = [
  {
    day: 'Mon',
    breakfast: 'Spinach & banana smoothie + overnight oats with chia seeds',
    lunch: 'Quinoa tabbouleh with roasted chickpeas & lemon tahini',
    dinner: 'Grilled salmon with asparagus & wild rice',
  },
  {
    day: 'Tue',
    breakfast: 'Avocado toast on sourdough + poached egg & microgreens',
    lunch: 'Miso soup with tofu & a brown rice bowl with edamame',
    dinner: 'Chicken stir-fry with broccoli, snap peas & sesame ginger sauce',
  },
  {
    day: 'Wed',
    breakfast: 'Greek yogurt parfait with walnuts, honey & mixed berries',
    lunch: 'Lentil & sweet potato soup + seeded rye bread',
    dinner: 'Baked cod with herb crust, roasted tomatoes & couscous',
  },
  {
    day: 'Thu',
    breakfast: 'Buckwheat pancakes with fresh strawberries & maple syrup',
    lunch: 'Mediterranean wrap: hummus, roasted veg, feta, spinach',
    dinner: 'Turkey meatballs in marinara with zucchini noodles',
  },
  {
    day: 'Fri',
    breakfast: 'Matcha oat bowl with coconut yogurt, kiwi & pumpkin seeds',
    lunch: 'Asian noodle salad with edamame, cucumber & sesame dressing',
    dinner: 'Lamb kofta with roasted cauliflower & pomegranate yogurt sauce',
  },
]

const AI_RESPONSE = `You're in your **follicular phase** (day 10), which means estrogen is rising and your brain is firing on all cylinders. This is scientifically the best time to take on challenges, have hard conversations, and push in workouts.

But here's the pattern I'm seeing: your sleep dropped to 6.2 hours on Tuesday and Wednesday, and your mood scores followed — down to 2/5 Thursday morning. Then you walked 9,200 steps on Thursday afternoon, and by evening your mood recovered to 4/5.

The trio that's working for you: **7+ hours sleep + 8k steps + follicular phase** = your peak state. You were there on Monday and Thursday.

This week, with your period due in 18 days, you have a window to build momentum. I'd recommend: front-load your harder workouts to days 10–14, prioritize sleep before day 24, and add magnesium-rich foods (dark chocolate, almonds, spinach) from day 18 onward to soften the PMS window.`

export default function InsightsPage() {
  const [aiExpanded, setAiExpanded] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null)
  const [aiError, setAiError] = useState(false)
  const [mealPlan, setMealPlan] = useState(MEAL_PLAN)
  const [mealPlanLoading, setMealPlanLoading] = useState(false)
  const [mealPlanKey, setMealPlanKey] = useState(0)

  const fetchAnalysis = async () => {
    if (aiAnalysis) return // already loaded
    setAiLoading(true)
    setAiError(false)
    try {
      const res = await fetch('/api/ai/why-do-i-feel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentMood: 3,
          currentEnergy: 6,
          cyclePhase: 'luteal',
          cycleDay: 22,
          last7DaysSleep: [7.5, 6.0, 8.0, 5.5, 7.0, 6.5, 7.0],
          last7DaysMood: [4, 3, 4, 2, 3, 4, 3],
          last7DaysSteps: [8200, 4500, 9100, 3200, 7800, 6400, 5100],
          recentSymptoms: ['bloating', 'fatigue'],
          recentMeals: ['oatmeal with berries', 'chicken salad', 'pasta with vegetables'],
        }),
      })
      const data = await res.json()
      setAiAnalysis(data.analysis)
    } catch {
      setAiError(true)
    } finally {
      setAiLoading(false)
    }
  }

  const regenerateMealPlan = async () => {
    setMealPlanLoading(true)
    try {
      const res = await fetch('/api/ai/meal-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cyclePhase: 'follicular',
          cycleDay: 10,
          dietaryPreferences: [],
          healthGoals: ['energy', 'cycle-regularity'],
          daysCount: 5,
        }),
      })
      const data = await res.json()
      if (data.days?.length) {
        setMealPlan(data.days)
        setMealPlanKey(k => k + 1)
      }
    } catch {
      // keep existing plan on error
    } finally {
      setMealPlanLoading(false)
    }
  }

  return (
    <div className="px-4 pt-6 pb-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-xl bg-[var(--vf-blue)]/10 flex items-center justify-center">
          <Lightbulb className="w-5 h-5 text-[var(--vf-blue)]" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Insights &amp; Patterns</h1>
      </div>

      {/* Why do I feel this way */}
      <div className="rounded-2xl bg-gradient-to-br from-[var(--vf-blue)]/10 to-[var(--vf-purple)]/10 border border-[var(--vf-blue)]/20 p-4 shadow-sm">
        <button
          className="w-full flex items-center gap-3"
          onClick={() => {
            setAiExpanded(prev => !prev)
            if (!aiExpanded) fetchAnalysis()
          }}
        >
          <div className="w-10 h-10 rounded-2xl bg-[var(--vf-blue)]/15 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-[var(--vf-blue)]" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-sm">Why do I feel this way?</p>
            <p className="text-xs text-muted-foreground">Tap to get your personalized analysis</p>
          </div>
          {aiExpanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        {aiExpanded && (
          <div className="mt-4">
            {aiLoading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Analyzing your week...
              </div>
            )}
            {aiError && (
              <p className="text-sm text-muted-foreground">Couldn&apos;t load analysis right now — try again.</p>
            )}
            {aiAnalysis && (
              <div className="space-y-2.5">
                {aiAnalysis.split('\n\n').map((para, i) => (
                  <p key={i} className="text-sm text-foreground/85 leading-relaxed">
                    {para.split('**').map((part, j) =>
                      j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                    )}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Weekly wellness radar */}
      <div className="rounded-2xl bg-card border border-border/50 p-4 shadow-sm">
        <h2 className="font-semibold text-base mb-1">Wellness Radar</h2>
        <p className="text-xs text-muted-foreground mb-3">This week&apos;s scores (1–10)</p>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="currentColor" className="text-border" />
              <PolarAngleAxis
                dataKey="axis"
                tick={{ fontSize: 11, fill: 'currentColor', className: 'text-muted-foreground' }}
              />
              <Radar
                name="This Week"
                dataKey="value"
                stroke="var(--vf-blue)"
                fill="var(--vf-blue)"
                fillOpacity={0.15}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pattern cards */}
      <div className="space-y-3">
        <h2 className="font-semibold text-base">Your Patterns</h2>
        {PATTERN_CARDS.map(card => (
          <div
            key={card.title}
            className="rounded-2xl bg-card border border-border/50 p-4 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{card.emoji}</span>
              <h3 className="font-semibold text-sm" style={{ color: card.color }}>{card.title}</h3>
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed">{card.insight}</p>
          </div>
        ))}
      </div>

      {/* Weekly summary */}
      <div className="rounded-2xl bg-card border border-border/50 p-4 shadow-sm">
        <h2 className="font-semibold text-base mb-2">Weekly Summary</h2>
        <p className="text-sm text-foreground/80 leading-relaxed">
          This week you logged <strong>3 workouts</strong>, slept an average of <strong>6.8 hours</strong>, and your mood peaked on <strong>Thursday</strong> — follicular phase day 3, after pasta for dinner and a solid 7.5-hour night. Your hydration was your weakest pillar at 5/8 glasses average. One extra glass in the afternoon could be the easiest win this week.
        </p>
      </div>

      {/* Meal plan */}
      <div className="rounded-2xl bg-card border border-border/50 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-semibold text-base">Your Weekly Meal Plan</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Follicular phase — energizing &amp; fresh</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl h-8 text-xs"
            onClick={regenerateMealPlan}
            disabled={mealPlanLoading}
          >
            <RefreshCw className={`w-3 h-3 mr-1.5 ${mealPlanLoading ? 'animate-spin' : ''}`} />
            {mealPlanLoading ? 'Generating...' : 'Regenerate'}
          </Button>
        </div>
        <div className="space-y-4" key={mealPlanKey}>
          {mealPlan.map(day => (
            <div key={day.day} className="border-b border-border/50 last:border-0 pb-3 last:pb-0">
              <p className="text-xs font-bold text-[var(--vf-blue)] mb-2 uppercase tracking-wide">{day.day}</p>
              <div className="space-y-1.5">
                {[
                  { label: '🌅 Breakfast', meal: day.breakfast },
                  { label: '☀️ Lunch', meal: day.lunch },
                  { label: '🌙 Dinner', meal: day.dinner },
                ].map(({ label, meal }) => (
                  <div key={label} className="flex gap-2 text-sm">
                    <span className="text-muted-foreground shrink-0 text-xs pt-0.5 w-20">{label}</span>
                    <span className="text-foreground/80 text-xs leading-relaxed">{meal}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
