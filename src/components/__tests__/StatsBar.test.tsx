import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StatsBar } from '../StatsBar/StatsBar'
import type { Stats } from '../../hooks/useStats'

const stats: Stats = {
  correct: 10,
  incorrect: 3,
  currentStreak: 4,
  longestStreak: 7,
  totalDecisions: 13,
}

describe('StatsBar', () => {
  it('renders correct count', () => {
    render(<StatsBar stats={stats} accuracyPercent={77} onOpenModal={vi.fn()} />)
    expect(screen.getByText('10')).toBeDefined()
  })

  it('renders incorrect count', () => {
    render(<StatsBar stats={stats} accuracyPercent={77} onOpenModal={vi.fn()} />)
    expect(screen.getByText('3')).toBeDefined()
  })

  it('renders accuracy when provided', () => {
    render(<StatsBar stats={stats} accuracyPercent={77} onOpenModal={vi.fn()} />)
    expect(screen.getByText('77%')).toBeDefined()
  })

  it('hides accuracy when null', () => {
    render(<StatsBar stats={stats} accuracyPercent={null} onOpenModal={vi.fn()} />)
    expect(screen.queryByText('%')).toBeNull()
  })

  it('calls onOpenModal when clicked', () => {
    const onOpenModal = vi.fn()
    render(<StatsBar stats={stats} accuracyPercent={null} onOpenModal={onOpenModal} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onOpenModal).toHaveBeenCalledOnce()
  })
})
