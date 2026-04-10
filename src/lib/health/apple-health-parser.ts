export interface ParsedHealthData {
  steps: { date: string; value: number }[]
  sleepHours: { date: string; value: number }[]
  heartRate: { date: string; value: number }[]
  weight: { date: string; value: number; unit: string }[]
  workouts: {
    type: string
    date: string
    durationMinutes: number
    calories: number
    distanceKm?: number
  }[]
  activeCalories: { date: string; value: number }[]
}

/**
 * Parses Apple Health export XML (export.xml) client-side.
 * Apple Health XML structure:
 * <HealthData>
 *   <Record type="HKQuantityTypeIdentifierStepCount" value="..." startDate="..." endDate="..."/>
 *   <Workout workoutActivityType="..." duration="..." totalEnergyBurned="..." startDate="..."/>
 * </HealthData>
 */
export function parseAppleHealthXML(xmlString: string): ParsedHealthData {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlString, 'text/xml')

  const result: ParsedHealthData = {
    steps: [],
    sleepHours: [],
    heartRate: [],
    weight: [],
    workouts: [],
    activeCalories: [],
  }

  // Parse Records
  const records = doc.querySelectorAll('Record')
  const dailySteps: Record<string, number> = {}
  const dailySleep: Record<string, number> = {}
  const dailyCalories: Record<string, number> = {}

  records.forEach((record) => {
    const type = record.getAttribute('type') || ''
    const value = parseFloat(record.getAttribute('value') || '0')
    const startDate = record.getAttribute('startDate') || ''
    const date = startDate.split(' ')[0] // YYYY-MM-DD

    if (type === 'HKQuantityTypeIdentifierStepCount') {
      dailySteps[date] = (dailySteps[date] || 0) + value
    } else if (type === 'HKCategoryTypeIdentifierSleepAnalysis') {
      // value 0 = InBed, 1 = Asleep — we want Asleep
      if (value === 1 || value === 2) { // Asleep or Core
        const endDate = record.getAttribute('endDate') || ''
        const startMs = new Date(startDate).getTime()
        const endMs = new Date(endDate).getTime()
        const hours = (endMs - startMs) / (1000 * 60 * 60)
        dailySleep[date] = (dailySleep[date] || 0) + hours
      }
    } else if (type === 'HKQuantityTypeIdentifierHeartRate') {
      result.heartRate.push({ date, value })
    } else if (type === 'HKQuantityTypeIdentifierBodyMass') {
      const unit = record.getAttribute('unit') || 'kg'
      result.weight.push({ date, value, unit })
    } else if (type === 'HKQuantityTypeIdentifierActiveEnergyBurned') {
      dailyCalories[date] = (dailyCalories[date] || 0) + value
    }
  })

  // Convert daily aggregates to arrays
  result.steps = Object.entries(dailySteps)
    .map(([date, value]) => ({ date, value: Math.round(value) }))
    .sort((a, b) => a.date.localeCompare(b.date))

  result.sleepHours = Object.entries(dailySleep)
    .map(([date, value]) => ({ date, value: Math.round(value * 10) / 10 }))
    .sort((a, b) => a.date.localeCompare(b.date))

  result.activeCalories = Object.entries(dailyCalories)
    .map(([date, value]) => ({ date, value: Math.round(value) }))
    .sort((a, b) => a.date.localeCompare(b.date))

  // Parse Workouts
  const workouts = doc.querySelectorAll('Workout')
  workouts.forEach((workout) => {
    const type = workout.getAttribute('workoutActivityType') || ''
    const startDate = workout.getAttribute('startDate') || ''
    const duration = parseFloat(workout.getAttribute('duration') || '0')
    const calories = parseFloat(workout.getAttribute('totalEnergyBurned') || '0')
    const distance = parseFloat(workout.getAttribute('totalDistance') || '0')

    const friendlyType = type
      .replace('HKWorkoutActivityType', '')
      .replace(/([A-Z])/g, ' $1')
      .trim()

    result.workouts.push({
      type: friendlyType,
      date: startDate.split(' ')[0],
      durationMinutes: Math.round(duration),
      calories: Math.round(calories),
      distanceKm: distance > 0 ? Math.round(distance * 10) / 10 : undefined,
    })
  })

  return result
}
