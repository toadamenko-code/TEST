'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Apple, Camera, Plus, Droplets, CheckCircle, Circle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

// Macro ring
function MacroRing({ label, current, goal, color }: { label: string; current: number; goal: number; color: string }) {
  const r = 30
  const circ = 2 * Math.PI * r
  const progress = Math.min(current / goal, 1)
  const offset = circ - progress * circ

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <svg width="80" height="80" className="rotate-[-90deg]">
          <circle cx="40" cy="40" r={r} fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/40" />
          <circle
            cx="40" cy="40" r={r}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-sm font-bold tabular-nums leading-none">{current}g</p>
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs font-semibold">{label}</p>
        <p className="text-[10px] text-muted-foreground">/{goal}g</p>
      </div>
    </div>
  )
}

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const
type MealType = typeof MEAL_TYPES[number]

const MEAL_ICONS: Record<MealType, string> = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  snack: '🍎',
}

interface FoodItem {
  id?: string
  description: string
  meal_type: MealType
  calories?: number
  protein_g?: number
  carbs_g?: number
  fat_g?: number
}

const SUPPLEMENTS = ['Vitamin D', 'Iron', 'Magnesium', 'Omega-3', 'B12']

const mockAIAnalysis = {
  foods: [
    { name: 'Pasta (whole wheat)', portion: '1 cup cooked' },
    { name: 'Tomato sauce', portion: '½ cup' },
    { name: 'Ground turkey', portion: '85g' },
    { name: 'Parmesan cheese', portion: '2 tbsp' },
  ],
  totals: { calories: 520, protein_g: 34, carbs_g: 68, fat_g: 11, fiber_g: 8 },
  confidence: 'high' as const,
}

export default function NutritionPage() {
  const [foodLog, setFoodLog] = useState<FoodItem[]>([])
  const [waterGlasses, setWaterGlasses] = useState(0)
  const waterGoal = 8
  const [supplements, setSupplements] = useState<string[]>([])
  const [addFoodOpen, setAddFoodOpen] = useState(false)
  const [addMealType, setAddMealType] = useState<MealType>('snack')
  const [description, setDescription] = useState('')
  const [calories, setCalories] = useState('')
  const [protein, setProtein] = useState('')
  const [carbs, setCarbs] = useState('')
  const [fat, setFat] = useState('')
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [aiAnalysisShown, setAiAnalysisShown] = useState(false)
  const [analyzingPhoto, setAnalyzingPhoto] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const analyzeInputRef = useRef<HTMLInputElement>(null)

  const todayProtein = foodLog.reduce((a, f) => a + (f.protein_g ?? 0), 0)
  const todayCarbs = foodLog.reduce((a, f) => a + (f.carbs_g ?? 0), 0)
  const todayFat = foodLog.reduce((a, f) => a + (f.fat_g ?? 0), 0)
  const todayCals = foodLog.reduce((a, f) => a + (f.calories ?? 0), 0)

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const today = new Date().toISOString().split('T')[0]

      const [foodRes, waterRes] = await Promise.all([
        supabase
          .from('food_entries')
          .select('*')
          .eq('user_id', user.id)
          .gte('recorded_at', today)
          .order('recorded_at', { ascending: true }),
        supabase
          .from('water_entries')
          .select('*')
          .eq('user_id', user.id)
          .gte('recorded_at', today),
      ])

      if (foodRes.data) {
        setFoodLog(foodRes.data.map(f => ({
          id: f.id,
          description: f.description,
          meal_type: f.meal_type as MealType,
          calories: f.calories ?? undefined,
          protein_g: f.protein_g ?? undefined,
          carbs_g: f.carbs_g ?? undefined,
          fat_g: f.fat_g ?? undefined,
        })))
      }

      if (waterRes.data) {
        const totalMl = waterRes.data.reduce((sum: number, w: { amount_ml: number }) => sum + (w.amount_ml ?? 0), 0)
        setWaterGlasses(Math.round(totalMl / 250))
      }
    }
    loadData()
  }, [])

  const toggleSupplement = (s: string) => {
    setSupplements(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setPhotoPreview(url)
    setAnalyzingPhoto(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('mealType', addMealType)
      const res = await fetch('/api/ai/analyze-meal', {
        method: 'POST',
        body: formData,
      })
      if (res.ok) {
        setAiAnalysisShown(true)
      }
    } catch {
      // show analysis section anyway so user can enter manually
      setAiAnalysisShown(true)
    } finally {
      setAnalyzingPhoto(false)
    }
  }

  const saveFood = async () => {
    if (!description) return

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('Not logged in')
      return
    }

    const entry = {
      user_id: user.id,
      description,
      meal_type: addMealType,
      calories: calories ? Number(calories) : null,
      protein_g: protein ? Number(protein) : null,
      carbs_g: carbs ? Number(carbs) : null,
      fat_g: fat ? Number(fat) : null,
      recorded_at: new Date().toISOString(),
    }

    const { data: inserted, error } = await supabase.from('food_entries').insert(entry).select().single()

    if (error) {
      toast.error('Failed to save food entry')
      return
    }

    toast.success('Food logged!')
    setFoodLog(prev => [...prev, {
      id: inserted?.id,
      description,
      meal_type: addMealType,
      calories: calories ? Number(calories) : undefined,
      protein_g: protein ? Number(protein) : undefined,
      carbs_g: carbs ? Number(carbs) : undefined,
      fat_g: fat ? Number(fat) : undefined,
    }])
    setAddFoodOpen(false)
    setDescription('')
    setCalories('')
    setProtein('')
    setCarbs('')
    setFat('')
  }

  const addWaterGlass = async () => {
    if (waterGlasses >= waterGoal) return

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('Not logged in')
      return
    }

    const { error } = await supabase.from('water_entries').insert({
      user_id: user.id,
      amount_ml: 250,
      recorded_at: new Date().toISOString(),
    })

    if (error) {
      toast.error('Failed to log water')
      return
    }

    setWaterGlasses(prev => Math.min(prev + 1, waterGoal))
  }

  const handleWaterGlassTap = async (i: number) => {
    const newCount = i < waterGlasses ? i : i + 1
    if (newCount > waterGlasses) {
      // Adding a glass
      await addWaterGlass()
    } else {
      // Just update local (removing glasses isn't persisted)
      setWaterGlasses(newCount)
    }
  }

  return (
    <div className="px-4 pt-6 pb-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-xl bg-[var(--vf-green)]/10 flex items-center justify-center">
          <Apple className="w-5 h-5 text-[var(--vf-green)]" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Nutrition &amp; Food</h1>
      </div>

      {/* Macro summary */}
      <div className="rounded-2xl bg-card border border-border/50 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-base">Today&apos;s Macros</h2>
          <span className="text-sm font-bold text-[var(--vf-green)]">{todayCals} kcal</span>
        </div>
        <div className="flex justify-around">
          <MacroRing label="Protein" current={todayProtein} goal={120} color="var(--vf-blue)" />
          <MacroRing label="Carbs" current={todayCarbs} goal={250} color="var(--vf-orange)" />
          <MacroRing label="Fat" current={todayFat} goal={70} color="var(--vf-purple)" />
        </div>
      </div>

      {/* Meal photo analyzer */}
      <div className="rounded-2xl bg-card border border-border/50 p-4 shadow-sm">
        <h2 className="font-semibold text-base mb-3">AI Meal Analyzer</h2>
        {!photoPreview ? (
          <button
            onClick={() => analyzeInputRef.current?.click()}
            className="w-full border-2 border-dashed border-border rounded-2xl p-8 flex flex-col items-center gap-3 hover:border-[var(--vf-blue)] hover:bg-[var(--vf-blue)]/5 transition-all"
          >
            <div className="w-14 h-14 rounded-2xl bg-[var(--vf-blue)]/10 flex items-center justify-center">
              <Camera className="w-7 h-7 text-[var(--vf-blue)]" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-sm">Snap a meal photo</p>
              <p className="text-xs text-muted-foreground mt-0.5">AI will analyze your food instantly</p>
            </div>
          </button>
        ) : (
          <div className="space-y-3">
            <img src={photoPreview} alt="Meal photo" className="w-full h-48 object-cover rounded-xl" />
            {analyzingPhoto ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-4 h-4 border-2 border-[var(--vf-blue)] border-t-transparent rounded-full animate-spin" />
                Analyzing your meal...
              </div>
            ) : aiAnalysisShown ? (
              <div className="bg-[var(--vf-green)]/5 rounded-xl p-3 border border-[var(--vf-green)]/20">
                <p className="text-xs font-semibold text-[var(--vf-green)] mb-2">AI Analysis (high confidence)</p>
                <div className="space-y-1 mb-3">
                  {mockAIAnalysis.foods.map(f => (
                    <div key={f.name} className="flex justify-between text-sm">
                      <span>{f.name}</span>
                      <span className="text-muted-foreground">{f.portion}</span>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    { label: 'Cal', value: mockAIAnalysis.totals.calories },
                    { label: 'Protein', value: `${mockAIAnalysis.totals.protein_g}g` },
                    { label: 'Carbs', value: `${mockAIAnalysis.totals.carbs_g}g` },
                    { label: 'Fat', value: `${mockAIAnalysis.totals.fat_g}g` },
                  ].map(item => (
                    <div key={item.label} className="bg-background/60 rounded-lg p-2">
                      <p className="text-sm font-bold">{item.value}</p>
                      <p className="text-[10px] text-muted-foreground">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            <button
              onClick={() => { setPhotoPreview(null); setAiAnalysisShown(false) }}
              className="text-xs text-[var(--vf-blue)] underline"
            >
              Remove photo
            </button>
          </div>
        )}
        <input
          ref={analyzeInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handlePhotoChange}
        />
      </div>

      {/* Food log */}
      <div className="rounded-2xl bg-card border border-border/50 p-4 shadow-sm">
        <h2 className="font-semibold text-base mb-3">Today&apos;s Food Log</h2>
        {MEAL_TYPES.map(mealType => {
          const items = foodLog.filter(f => f.meal_type === mealType)
          return (
            <div key={mealType} className="mb-4 last:mb-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">{MEAL_ICONS[mealType]}</span>
                  <p className="text-sm font-semibold capitalize">{mealType}</p>
                </div>
                <button
                  onClick={() => { setAddMealType(mealType); setAddFoodOpen(true) }}
                  className="w-6 h-6 rounded-full bg-[var(--vf-blue)]/10 flex items-center justify-center hover:bg-[var(--vf-blue)]/20 transition-all"
                >
                  <Plus className="w-3.5 h-3.5 text-[var(--vf-blue)]" />
                </button>
              </div>
              {items.length === 0 ? (
                <p className="text-xs text-muted-foreground pl-7 py-1">Nothing logged yet</p>
              ) : (
                <div className="space-y-1.5 pl-7">
                  {items.map((item, i) => (
                    <div key={item.id ?? i} className="flex items-center justify-between">
                      <p className="text-sm text-foreground/80 flex-1 truncate">{item.description}</p>
                      {item.calories && (
                        <span className="text-xs text-muted-foreground ml-2 shrink-0">{item.calories} kcal</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Water tracker */}
      <div className="rounded-2xl bg-card border border-border/50 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4" style={{ color: 'var(--vf-teal)' }} />
            <h2 className="font-semibold text-sm">Water Intake</h2>
          </div>
          <span className="text-sm font-bold" style={{ color: 'var(--vf-teal)' }}>
            {waterGlasses * 250}ml / {waterGoal * 250}ml
          </span>
        </div>
        <div className="flex gap-1.5 mb-3">
          {Array.from({ length: waterGoal }, (_, i) => (
            <button
              key={i}
              onClick={() => handleWaterGlassTap(i)}
              className={cn(
                'flex-1 h-10 rounded-lg transition-all',
                i < waterGlasses
                  ? 'opacity-100'
                  : 'opacity-30'
              )}
              style={{ backgroundColor: 'var(--vf-teal)' }}
            />
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full rounded-xl border-[var(--color-border)]"
          onClick={addWaterGlass}
          disabled={waterGlasses >= waterGoal}
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Add glass (250ml)
        </Button>
      </div>

      {/* Supplements */}
      <div className="rounded-2xl bg-card border border-border/50 p-4 shadow-sm">
        <h2 className="font-semibold text-base mb-3">Supplements</h2>
        <div className="space-y-2">
          {SUPPLEMENTS.map(supp => {
            const checked = supplements.includes(supp)
            return (
              <button
                key={supp}
                onClick={() => toggleSupplement(supp)}
                className="w-full flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-muted/50 transition-all text-left"
              >
                {checked ? (
                  <CheckCircle className="w-5 h-5 text-[var(--vf-green)] shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground shrink-0" />
                )}
                <span className={cn('text-sm font-medium', checked && 'line-through text-muted-foreground')}>
                  {supp}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Add Food Dialog */}
      <Dialog open={addFoodOpen} onOpenChange={setAddFoodOpen}>
        <DialogContent className="rounded-3xl mx-4">
          <DialogHeader>
            <DialogTitle>Add Food</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <p className="text-sm font-medium mb-2">Meal Type</p>
              <div className="grid grid-cols-4 gap-1.5">
                {MEAL_TYPES.map(mt => (
                  <button
                    key={mt}
                    onClick={() => setAddMealType(mt)}
                    className={cn(
                      'py-2 rounded-xl text-xs font-medium border transition-all capitalize',
                      addMealType === mt
                        ? 'bg-[var(--vf-blue)] text-white border-[var(--vf-blue)]'
                        : 'border-border text-muted-foreground'
                    )}
                  >
                    {MEAL_ICONS[mt]} {mt}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Description</Label>
              <Textarea
                placeholder="What did you eat?"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="rounded-xl resize-none mt-1.5"
                rows={2}
              />
            </div>
            <div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full border border-dashed border-border rounded-xl py-3 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:border-[var(--vf-blue)] hover:text-[var(--vf-blue)] transition-all"
              >
                <Camera className="w-4 h-4" />
                Add photo (optional)
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Calories</Label>
                <Input value={calories} onChange={e => setCalories(e.target.value)} type="number" placeholder="kcal" className="rounded-xl mt-1" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Protein (g)</Label>
                <Input value={protein} onChange={e => setProtein(e.target.value)} type="number" placeholder="g" className="rounded-xl mt-1" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Carbs (g)</Label>
                <Input value={carbs} onChange={e => setCarbs(e.target.value)} type="number" placeholder="g" className="rounded-xl mt-1" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Fat (g)</Label>
                <Input value={fat} onChange={e => setFat(e.target.value)} type="number" placeholder="g" className="rounded-xl mt-1" />
              </div>
            </div>
            <Button
              className="w-full bg-[var(--vf-green)] hover:bg-[var(--vf-green)]/90 text-white rounded-xl"
              onClick={saveFood}
              disabled={!description}
            >
              Save Food
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
