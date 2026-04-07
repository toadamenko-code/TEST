'use client'

import { CyclePhaseInfo } from '@/lib/types/cycle'
import { cn } from '@/lib/utils'
import { Zap, Leaf, Sun, Moon } from 'lucide-react'

interface CyclePhaseCardProps {
  phaseInfo: CyclePhaseInfo
  className?: string
}

const phaseIcons = {
  menstrual: Moon,
  follicular: Leaf,
  ovulation: Sun,
  luteal: Zap,
}

const phaseBg = {
  menstrual: 'from-red-500/15 to-red-600/5',
  follicular: 'from-green-500/15 to-green-600/5',
  ovulation: 'from-orange-500/15 to-orange-600/5',
  luteal: 'from-purple-500/15 to-purple-600/5',
}

const energyLabel = {
  low: 'Low energy',
  moderate: 'Moderate energy',
  high: 'High energy',
}

const energyColor = {
  low: 'bg-[var(--vf-red)]/10 text-[var(--vf-red)]',
  moderate: 'bg-[var(--vf-orange)]/10 text-[var(--vf-orange)]',
  high: 'bg-[var(--vf-green)]/10 text-[var(--vf-green)]',
}

export function CyclePhaseCard({ phaseInfo, className }: CyclePhaseCardProps) {
  const Icon = phaseIcons[phaseInfo.phase]

  return (
    <div
      className={cn(
        'rounded-2xl p-4 bg-gradient-to-br border border-border/50',
        phaseBg[phaseInfo.phase],
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${phaseInfo.color}22` }}
          >
            <Icon className="w-5 h-5" style={{ color: phaseInfo.color }} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              {phaseInfo.label} Phase
            </p>
            <p className="text-sm font-semibold">Day {phaseInfo.dayInCycle}</p>
          </div>
        </div>
        <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full', energyColor[phaseInfo.energyLevel])}>
          {energyLabel[phaseInfo.energyLevel]}
        </span>
      </div>

      <p className="text-sm text-foreground/80 mb-3 leading-relaxed">
        {phaseInfo.description}
      </p>

      <div className="bg-background/50 rounded-xl p-3">
        <p className="text-xs font-semibold text-muted-foreground mb-1">NUTRITION TIP</p>
        <p className="text-sm text-foreground/80 leading-relaxed">{phaseInfo.nutritionTip}</p>
      </div>

      <div className="flex gap-3 mt-3">
        <div className="flex-1 text-center bg-background/40 rounded-xl p-2">
          <p className="text-lg font-bold tabular-nums">{phaseInfo.daysUntilNextPeriod}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">days to period</p>
        </div>
        <div className="flex-1 text-center bg-background/40 rounded-xl p-2">
          <p className="text-lg font-bold tabular-nums">
            {phaseInfo.daysUntilOvulation > 0 ? phaseInfo.daysUntilOvulation : '—'}
          </p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">days to ovulation</p>
        </div>
      </div>
    </div>
  )
}
