import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card } from '../Card/Card'
import type { Card as CardType } from '../../engine/types'

// Framer Motion animations don't run in jsdom — mock to render children directly
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, style }: React.HTMLAttributes<HTMLDivElement>) => (
      <div className={className} style={style}>{children}</div>
    ),
  },
  useAnimation: () => ({ start: vi.fn() }),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

function makeCard(rank: CardType['rank'], suit: CardType['suit'] = 'spades', faceUp = true): CardType {
  return { rank, suit, faceUp }
}

describe('Card', () => {
  it('renders rank on a face-up card', () => {
    render(<Card card={makeCard('A')} />)
    // Rank appears twice (top-left corner + bottom-right corner)
    const ranks = screen.getAllByText('A')
    expect(ranks.length).toBeGreaterThanOrEqual(1)
  })

  it('renders 10 for rank T', () => {
    render(<Card card={makeCard('T')} />)
    expect(screen.getAllByText('10').length).toBeGreaterThanOrEqual(1)
  })

  it('renders spade symbol for spades', () => {
    render(<Card card={makeCard('K', 'spades')} />)
    expect(screen.getAllByText('♠').length).toBeGreaterThanOrEqual(1)
  })

  it('renders heart symbol for hearts', () => {
    render(<Card card={makeCard('7', 'hearts')} />)
    expect(screen.getAllByText('♥').length).toBeGreaterThanOrEqual(1)
  })

  it('renders diamond symbol for diamonds', () => {
    render(<Card card={makeCard('4', 'diamonds')} />)
    expect(screen.getAllByText('♦').length).toBeGreaterThanOrEqual(1)
  })

  it('renders club symbol for clubs', () => {
    render(<Card card={makeCard('2', 'clubs')} />)
    expect(screen.getAllByText('♣').length).toBeGreaterThanOrEqual(1)
  })

  it('renders face card label for J', () => {
    render(<Card card={makeCard('J', 'hearts')} />)
    expect(screen.getAllByText('J').length).toBeGreaterThanOrEqual(1)
  })

  it('renders face card label for Q', () => {
    render(<Card card={makeCard('Q', 'diamonds')} />)
    expect(screen.getAllByText('Q').length).toBeGreaterThanOrEqual(1)
  })

  it('renders face card label for K', () => {
    render(<Card card={makeCard('K', 'clubs')} />)
    expect(screen.getAllByText('K').length).toBeGreaterThanOrEqual(1)
  })

  it('renders both face and back elements (for flip animation)', () => {
    const { container } = render(<Card card={makeCard('9', 'spades', false)} />)
    // Both face and back divs should be present for CSS backface-visibility
    expect(container.querySelectorAll('[class*="face"]').length).toBeGreaterThanOrEqual(1)
    expect(container.querySelectorAll('[class*="back"]').length).toBeGreaterThanOrEqual(1)
  })
})
