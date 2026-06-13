import { describe, it, expect } from 'vitest'
import { shouldDealerHit, isDealerBlackjack } from '../dealer'
import type { Card } from '../types'

function card(rank: Card['rank']): Card {
  return { rank, suit: 'clubs', faceUp: true }
}

describe('shouldDealerHit', () => {
  it('hits on hard 16', () => {
    expect(shouldDealerHit([card('T'), card('6')])).toBe(true)
  })

  it('hits on hard 16 with 3 cards', () => {
    expect(shouldDealerHit([card('7'), card('5'), card('4')])).toBe(true)
  })

  it('stands on hard 17', () => {
    expect(shouldDealerHit([card('T'), card('7')])).toBe(false)
  })

  it('stands on soft 17 (S17 rule)', () => {
    expect(shouldDealerHit([card('A'), card('6')])).toBe(false)
  })

  it('hits on soft 16 (A,5)', () => {
    expect(shouldDealerHit([card('A'), card('5')])).toBe(true)
  })

  it('stands on soft 18 (A,7)', () => {
    expect(shouldDealerHit([card('A'), card('7')])).toBe(false)
  })

  it('stands on 21', () => {
    expect(shouldDealerHit([card('A'), card('T')])).toBe(false)
  })

  it('does not hit on bust', () => {
    expect(shouldDealerHit([card('T'), card('T'), card('5')])).toBe(false)
  })
})

describe('isDealerBlackjack', () => {
  it('returns true for A+T', () => {
    expect(isDealerBlackjack([card('A'), card('T')])).toBe(true)
  })

  it('returns true for A+K', () => {
    expect(isDealerBlackjack([card('A'), card('K')])).toBe(true)
  })

  it('returns false for 3-card 21', () => {
    expect(isDealerBlackjack([card('7'), card('7'), card('7')])).toBe(false)
  })

  it('returns false for non-21 two cards', () => {
    expect(isDealerBlackjack([card('T'), card('9')])).toBe(false)
  })
})
