import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StatsModal } from '../StatsModal/StatsModal'
import type { Stats } from '../../hooks/useStats'

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className }: React.HTMLAttributes<HTMLDivElement>) => (
      <div className={className}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

const stats: Stats = {
  correct: 8,
  incorrect: 2,
  currentStreak: 3,
  longestStreak: 5,
  totalDecisions: 10,
}

describe('StatsModal', () => {
  it('renders nothing when closed', () => {
    render(<StatsModal stats={stats} accuracyPercent={80} open={false} onClose={vi.fn()} onReset={vi.fn()} />)
    expect(screen.queryByText('Statistics')).toBeNull()
  })

  it('renders stats when open', () => {
    render(<StatsModal stats={stats} accuracyPercent={80} open onClose={vi.fn()} onReset={vi.fn()} />)
    expect(screen.getByText('Statistics')).toBeDefined()
    expect(screen.getByText('8')).toBeDefined()
    expect(screen.getByText('80%')).toBeDefined()
    expect(screen.getByText('5')).toBeDefined()
  })

  it('calls onClose when × is clicked', () => {
    const onClose = vi.fn()
    render(<StatsModal stats={stats} accuracyPercent={null} open onClose={onClose} onReset={vi.fn()} />)
    fireEvent.click(screen.getByLabelText('Close stats (Escape)'))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('shows confirm buttons after Reset is clicked', () => {
    render(<StatsModal stats={stats} accuracyPercent={null} open onClose={vi.fn()} onReset={vi.fn()} />)
    fireEvent.click(screen.getByText('Reset All Stats'))
    expect(screen.getByText('Yes, Reset')).toBeDefined()
    expect(screen.getByText('Cancel')).toBeDefined()
  })

  it('calls onReset after confirming', () => {
    const onReset = vi.fn()
    render(<StatsModal stats={stats} accuracyPercent={null} open onClose={vi.fn()} onReset={onReset} />)
    fireEvent.click(screen.getByText('Reset All Stats'))
    fireEvent.click(screen.getByText('Yes, Reset'))
    expect(onReset).toHaveBeenCalledOnce()
  })

  it('cancels reset without calling onReset', () => {
    const onReset = vi.fn()
    render(<StatsModal stats={stats} accuracyPercent={null} open onClose={vi.fn()} onReset={onReset} />)
    fireEvent.click(screen.getByText('Reset All Stats'))
    fireEvent.click(screen.getByText('Cancel'))
    expect(onReset).not.toHaveBeenCalled()
    expect(screen.getByText('Reset All Stats')).toBeDefined()
  })
})
