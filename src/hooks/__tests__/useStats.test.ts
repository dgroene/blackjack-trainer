import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useStats, type Stats } from '../useStats'

const STORAGE_KEY = 'bj-trainer-stats'

beforeEach(() => localStorage.clear())
afterEach(() => localStorage.clear())

describe('useStats', () => {
  it('starts with zero stats', () => {
    const { result } = renderHook(() => useStats())
    expect(result.current.stats.correct).toBe(0)
    expect(result.current.stats.incorrect).toBe(0)
    expect(result.current.stats.currentStreak).toBe(0)
    expect(result.current.stats.longestStreak).toBe(0)
    expect(result.current.stats.totalDecisions).toBe(0)
  })

  it('records a correct decision and increments streak', () => {
    const { result } = renderHook(() => useStats())
    act(() => result.current.recordCorrect())
    expect(result.current.stats.correct).toBe(1)
    expect(result.current.stats.currentStreak).toBe(1)
    expect(result.current.stats.longestStreak).toBe(1)
    expect(result.current.stats.totalDecisions).toBe(1)
  })

  it('records an incorrect decision and resets streak', () => {
    const { result } = renderHook(() => useStats())
    act(() => result.current.recordCorrect())
    act(() => result.current.recordCorrect())
    act(() => result.current.recordIncorrect())
    expect(result.current.stats.incorrect).toBe(1)
    expect(result.current.stats.currentStreak).toBe(0)
    expect(result.current.stats.longestStreak).toBe(2) // preserved
    expect(result.current.stats.totalDecisions).toBe(3)
  })

  it('tracks the longest streak across resets', () => {
    const { result } = renderHook(() => useStats())
    act(() => { result.current.recordCorrect(); result.current.recordCorrect(); result.current.recordCorrect() })
    act(() => result.current.recordIncorrect())
    act(() => result.current.recordCorrect())
    expect(result.current.stats.longestStreak).toBe(3)
    expect(result.current.stats.currentStreak).toBe(1)
  })

  it('persists stats to localStorage', () => {
    const { result } = renderHook(() => useStats())
    act(() => result.current.recordCorrect())
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!) as Stats
    expect(stored.correct).toBe(1)
  })

  it('loads persisted stats on mount', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ correct: 5, incorrect: 2, currentStreak: 3, longestStreak: 7, totalDecisions: 7 })
    )
    const { result } = renderHook(() => useStats())
    expect(result.current.stats.correct).toBe(5)
    expect(result.current.stats.longestStreak).toBe(7)
  })

  it('resets all stats and clears localStorage', () => {
    const { result } = renderHook(() => useStats())
    act(() => result.current.recordCorrect())
    act(() => result.current.resetStats())
    expect(result.current.stats.correct).toBe(0)
    expect(result.current.stats.currentStreak).toBe(0)
    expect(result.current.stats.longestStreak).toBe(0)
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!) as Stats
    expect(stored.correct).toBe(0)
  })

  it('returns null accuracy when no decisions', () => {
    const { result } = renderHook(() => useStats())
    expect(result.current.accuracyPercent).toBeNull()
  })

  it('calculates accuracy percentage', () => {
    const { result } = renderHook(() => useStats())
    act(() => { result.current.recordCorrect(); result.current.recordCorrect(); result.current.recordIncorrect() })
    expect(result.current.accuracyPercent).toBe(67)
  })

  it('handles corrupt localStorage gracefully', () => {
    localStorage.setItem(STORAGE_KEY, 'not-json')
    const { result } = renderHook(() => useStats())
    expect(result.current.stats.correct).toBe(0)
  })
})
