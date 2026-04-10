'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Settings, Sun, Moon, Monitor, Download, Trash2, Activity } from 'lucide-react'
import { toast } from 'sonner'

const HEALTH_GOALS = [
  { id: 'sleep', label: 'Better sleep' },
  { id: 'energy', label: 'More energy' },
  { id: 'gut', label: 'Gut health' },
  { id: 'cycle', label: 'Cycle regularity' },
  { id: 'weight', label: 'Weight management' },
  { id: 'fitness', label: 'Fitness' },
]

type Theme = 'light' | 'dark' | 'system'

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState('Sarah')
  const [dob, setDob] = useState('1995-03-15')
  const [height, setHeight] = useState('165')
  const [weightGoal, setWeightGoal] = useState('60')
  const [cycleLength, setCycleLength] = useState([28])
  const [cycleTracking, setCycleTracking] = useState(true)
  const [selectedGoals, setSelectedGoals] = useState<string[]>(['sleep', 'energy', 'cycle'])
  const [theme, setTheme] = useState<Theme>('system')
  const [clearDialogOpen, setClearDialogOpen] = useState(false)

  const toggleGoal = (id: string) => {
    setSelectedGoals(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id])
  }

  const handleExport = () => {
    toast('Preparing export...', {
      description: 'Your data export will be ready in a moment.',
    })
  }

  const handleClearData = () => {
    setClearDialogOpen(false)
    toast.success('All data cleared', { description: 'Your health data has been removed.' })
  }

  const themeOptions: { value: Theme; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: 'Light', icon: <Sun className="w-4 h-4" /> },
    { value: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" /> },
    { value: 'system', label: 'System', icon: <Monitor className="w-4 h-4" /> },
  ]

  return (
    <div className="px-4 pt-6 pb-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
          <Settings className="w-5 h-5 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      </div>

      {/* Profile */}
      <section>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Profile</h2>
        <div className="rounded-2xl bg-card border border-border/50 p-4 shadow-sm space-y-4">
          <div>
            <Label className="text-sm font-medium">Display Name</Label>
            <Input
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className="rounded-xl mt-1.5"
              placeholder="Your name"
            />
          </div>
          <div>
            <Label className="text-sm font-medium">Date of Birth</Label>
            <Input
              type="date"
              value={dob}
              onChange={e => setDob(e.target.value)}
              className="rounded-xl mt-1.5"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm font-medium">Height (cm)</Label>
              <Input
                type="number"
                value={height}
                onChange={e => setHeight(e.target.value)}
                className="rounded-xl mt-1.5"
                placeholder="165"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Weight goal (kg)</Label>
              <Input
                type="number"
                value={weightGoal}
                onChange={e => setWeightGoal(e.target.value)}
                className="rounded-xl mt-1.5"
                placeholder="60"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Preferences */}
      <section>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Preferences</h2>
        <div className="rounded-2xl bg-card border border-border/50 p-4 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Cycle Tracking</p>
              <p className="text-xs text-muted-foreground mt-0.5">Track your menstrual cycle</p>
            </div>
            <Switch
              checked={cycleTracking}
              onCheckedChange={setCycleTracking}
            />
          </div>
          {cycleTracking && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">Average Cycle Length</p>
                <span className="text-sm font-bold text-[var(--vf-blue)]">{cycleLength[0]} days</span>
              </div>
              <Slider
                value={cycleLength}
                onValueChange={setCycleLength}
                min={21}
                max={35}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
                <span>21 days</span>
                <span>35 days</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Health goals */}
      <section>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Health Goals</h2>
        <div className="rounded-2xl bg-card border border-border/50 p-4 shadow-sm">
          <div className="grid grid-cols-2 gap-2">
            {HEALTH_GOALS.map(goal => {
              const selected = selectedGoals.includes(goal.id)
              return (
                <button
                  key={goal.id}
                  onClick={() => toggleGoal(goal.id)}
                  className={cn(
                    'text-sm py-2.5 px-3 rounded-xl border transition-all text-left font-medium',
                    selected
                      ? 'bg-[var(--vf-blue)]/10 text-[var(--vf-blue)] border-[var(--vf-blue)]/30'
                      : 'border-border text-muted-foreground hover:border-[var(--vf-blue)]/30'
                  )}
                >
                  {selected && '✓ '}{goal.label}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Apple Health */}
      <section>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Apple Health</h2>
        <div className="rounded-2xl bg-card border border-border/50 p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--vf-red)]/10 flex items-center justify-center">
              <Activity className="w-4 h-4 text-[var(--vf-red)]" />
            </div>
            <div>
              <p className="text-sm font-medium">Not connected</p>
              <p className="text-xs text-muted-foreground">Manual XML import available</p>
            </div>
          </div>
          <div className="bg-muted/50 rounded-xl p-3">
            <p className="text-xs font-medium mb-1.5">How to export:</p>
            <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Open the Health app on your iPhone</li>
              <li>Tap your profile picture (top right)</li>
              <li>Tap &quot;Export All Health Data&quot;</li>
              <li>Share the ZIP file, extract it</li>
              <li>Upload <span className="font-mono">export.xml</span> in the Fitness tab</li>
            </ol>
          </div>
        </div>
      </section>

      {/* Theme */}
      <section>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Appearance</h2>
        <div className="rounded-2xl bg-card border border-border/50 p-4 shadow-sm">
          <div className="grid grid-cols-3 gap-2">
            {themeOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={cn(
                  'flex flex-col items-center gap-2 py-3 rounded-xl border transition-all',
                  theme === opt.value
                    ? 'bg-[var(--vf-blue)]/10 border-[var(--vf-blue)]/30 text-[var(--vf-blue)]'
                    : 'border-border text-muted-foreground hover:border-border/80'
                )}
              >
                {opt.icon}
                <span className="text-xs font-medium">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Data */}
      <section>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Data</h2>
        <div className="rounded-2xl bg-card border border-border/50 p-4 shadow-sm space-y-3">
          <Button
            variant="outline"
            className="w-full rounded-xl h-11 justify-start gap-3"
            onClick={handleExport}
          >
            <Download className="w-4 h-4 text-[var(--vf-blue)]" />
            <span className="text-sm font-medium">Export All Data</span>
          </Button>
          <Button
            variant="outline"
            className="w-full rounded-xl h-11 justify-start gap-3 border-[var(--vf-red)]/30 text-[var(--vf-red)] hover:bg-[var(--vf-red)]/5"
            onClick={() => setClearDialogOpen(true)}
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-sm font-medium">Clear All Data</span>
          </Button>
        </div>
      </section>

      {/* About */}
      <section>
        <div className="rounded-2xl bg-card border border-border/50 p-4 shadow-sm text-center space-y-1">
          <p className="text-sm font-semibold">VitalFlow</p>
          <p className="text-xs text-muted-foreground">Version 0.1.0</p>
          <p className="text-xs text-muted-foreground mt-2">Built with ❤️ for your health</p>
        </div>
      </section>

      {/* Confirm clear dialog */}
      <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <DialogContent className="rounded-3xl mx-4">
          <DialogHeader>
            <DialogTitle>Clear All Data?</DialogTitle>
          </DialogHeader>
          <div className="pt-2 space-y-4">
            <p className="text-sm text-muted-foreground">
              This will permanently delete all your logged health data including mood entries, cycle data, workouts, food logs, and measurements. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={() => setClearDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 rounded-xl bg-[var(--vf-red)] hover:bg-[var(--vf-red)]/90 text-white"
                onClick={handleClearData}
              >
                Clear Data
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
