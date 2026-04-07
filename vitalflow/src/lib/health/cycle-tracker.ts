import { CyclePhase, CyclePhaseInfo } from '@/lib/types/cycle'

export function getCyclePhase(dayInCycle: number, cycleLength = 28): CyclePhase {
  if (dayInCycle <= 5) return 'menstrual'
  if (dayInCycle <= 13) return 'follicular'
  if (dayInCycle <= 16) return 'ovulation'
  return 'luteal'
}

export function getCyclePhaseInfo(
  lastPeriodStart: Date,
  cycleLength = 28
): CyclePhaseInfo {
  const today = new Date()
  const diffMs = today.getTime() - lastPeriodStart.getTime()
  const dayInCycle = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1
  const adjustedDay = ((dayInCycle - 1) % cycleLength) + 1
  const phase = getCyclePhase(adjustedDay, cycleLength)

  const ovulationDay = Math.floor(cycleLength / 2) - 1
  const daysUntilOvulation = ovulationDay - adjustedDay
  const daysUntilNextPeriod = cycleLength - adjustedDay + 1

  const phaseData: Record<CyclePhase, Omit<CyclePhaseInfo, 'phase' | 'dayInCycle' | 'daysUntilNextPeriod' | 'daysUntilOvulation'>> = {
    menstrual: {
      label: 'Menstrual',
      description: 'Your body is shedding the uterine lining. Rest is your superpower right now.',
      nutritionTip: 'Focus on iron-rich foods (leafy greens, lentils, red meat) and anti-inflammatory omega-3s.',
      energyLevel: 'low',
      color: 'var(--cycle-menstrual)',
    },
    follicular: {
      label: 'Follicular',
      description: 'Estrogen is rising — you\'ll feel more energized and motivated.',
      nutritionTip: 'Great time for lighter, fresh foods. Your metabolism is efficient. Add fermented foods for gut support.',
      energyLevel: 'moderate',
      color: 'var(--cycle-follicular)',
    },
    ovulation: {
      label: 'Ovulation',
      description: 'Peak energy and confidence. You\'re glowing! Libido tends to peak now.',
      nutritionTip: 'Focus on antioxidants (berries, colorful veg) to support egg quality and reduce inflammation.',
      energyLevel: 'high',
      color: 'var(--cycle-ovulation)',
    },
    luteal: {
      label: 'Luteal',
      description: 'Progesterone rises. Energy may dip — honor that. Some PMS symptoms may appear.',
      nutritionTip: 'Magnesium-rich foods (dark chocolate, nuts, seeds) help with cravings and mood. Complex carbs stabilize blood sugar.',
      energyLevel: 'moderate',
      color: 'var(--cycle-luteal)',
    },
  }

  return {
    phase,
    dayInCycle: adjustedDay,
    daysUntilNextPeriod: Math.max(0, daysUntilNextPeriod),
    daysUntilOvulation: Math.max(0, daysUntilOvulation),
    ...phaseData[phase],
  }
}
