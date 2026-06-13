import { useCallback, useState } from 'react'

const STORAGE_KEY = 'bj-trainer-stats'

export interface Stats {
  correct: number
  incorrect: number
  currentStreak: number
  longestStreak: number
  totalDecisions: number
}

const DEFAULT_STATS: Stats = {
  correct: 0,
  incorrect: 0,
  currentStreak: 0,
  longestStreak: 0,
  totalDecisions: 0,
}

function loadStats(): Stats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_STATS }
    return { ...DEFAULT_STATS, ...(JSON.parse(raw) as Partial<Stats>) }
  } catch {
    return { ...DEFAULT_STATS }
  }
}

function saveStats(stats: Stats): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats))
  } catch {
    // Storage unavailable — continue without persistence
  }
}

export function useStats() {
  const [stats, setStats] = useState<Stats>(loadStats)

  const recordCorrect = useCallback(() => {
    setStats((prev) => {
      const next: Stats = {
        correct: prev.correct + 1,
        incorrect: prev.incorrect,
        currentStreak: prev.currentStreak + 1,
        longestStreak: Math.max(prev.longestStreak, prev.currentStreak + 1),
        totalDecisions: prev.totalDecisions + 1,
      }
      saveStats(next)
      return next
    })
  }, [])

  const recordIncorrect = useCallback(() => {
    setStats((prev) => {
      const next: Stats = {
        correct: prev.correct,
        incorrect: prev.incorrect + 1,
        currentStreak: 0,
        longestStreak: prev.longestStreak,
        totalDecisions: prev.totalDecisions + 1,
      }
      saveStats(next)
      return next
    })
  }, [])

  const resetStats = useCallback(() => {
    const next = { ...DEFAULT_STATS }
    saveStats(next)
    setStats(next)
  }, [])

  const accuracyPercent =
    stats.totalDecisions > 0
      ? Math.round((stats.correct / stats.totalDecisions) * 100)
      : null

  return { stats, accuracyPercent, recordCorrect, recordIncorrect, resetStats }
}
