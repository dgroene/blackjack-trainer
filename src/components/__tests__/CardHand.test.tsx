import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CardHand } from '../CardHand/CardHand'
import type { Card } from '../../engine/types'

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, style }: React.HTMLAttributes<HTMLDivElement>) => (
      <div className={className} style={style}>{children}</div>
    ),
  },
  useAnimation: () => ({ start: vi.fn() }),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

function makeCard(rank: Card['rank'], faceUp = true): Card {
  return { rank, suit: 'hearts', faceUp }
}

describe('CardHand', () => {
  it('renders the correct number of cards', () => {
    const cards = [makeCard('A'), makeCard('7')]
    const { container } = render(<CardHand cards={cards} />)
    expect(container.querySelectorAll('[class*="scene"]').length).toBe(2)
  })

  it('shows the hand label when provided', () => {
    render(<CardHand cards={[makeCard('K'), makeCard('6')]} label="Dealer" />)
    expect(screen.getByText('Dealer')).toBeDefined()
  })

  it('shows soft total for A+7', () => {
    render(<CardHand cards={[makeCard('A'), makeCard('7')]} showTotal />)
    expect(screen.getByText('Soft 18')).toBeDefined()
  })

  it('shows hard total for K+6', () => {
    render(<CardHand cards={[makeCard('K'), makeCard('6')]} showTotal />)
    expect(screen.getByText('16')).toBeDefined()
  })

  it('shows Blackjack for A+T', () => {
    render(<CardHand cards={[makeCard('A'), makeCard('T')]} showTotal />)
    expect(screen.getByText('Blackjack!')).toBeDefined()
  })

  it('shows Bust for K+Q+5', () => {
    render(<CardHand cards={[makeCard('K'), makeCard('Q'), makeCard('5')]} showTotal />)
    expect(screen.getByText('Bust')).toBeDefined()
  })

  it('hides total for face-down cards', () => {
    const cards = [makeCard('A'), { rank: 'T' as const, suit: 'spades' as const, faceUp: false }]
    render(<CardHand cards={cards} showTotal />)
    // Only the face-up A is counted — total should show Soft 11, not Blackjack
    expect(screen.getByText('Soft 11')).toBeDefined()
    expect(screen.queryByText('Blackjack!')).toBeNull()
  })

  it('renders empty hand without crashing', () => {
    const { container } = render(<CardHand cards={[]} />)
    expect(container.querySelector('[class*="hand"]')).toBeDefined()
  })
})
