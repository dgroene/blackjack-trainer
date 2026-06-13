import { describe, it, expect } from 'vitest'
import { createShoe, dealCard, shouldReshuffle, getCountStats } from '../deck'

describe('createShoe', () => {
  it('creates 312 cards for a 6-deck shoe', () => {
    const shoe = createShoe(6)
    expect(shoe.cards).toHaveLength(312)
  })

  it('contains exactly 4 of each rank per deck', () => {
    const shoe = createShoe(1)
    const rankCounts: Record<string, number> = {}
    for (const card of shoe.cards) {
      rankCounts[card.rank] = (rankCounts[card.rank] ?? 0) + 1
    }
    for (const count of Object.values(rankCounts)) {
      expect(count).toBe(4)
    }
  })

  it('contains 13 ranks × 4 suits = 52 cards per deck', () => {
    const shoe = createShoe(2)
    expect(shoe.cards).toHaveLength(104)
  })

  it('initialises counts to zero', () => {
    const shoe = createShoe()
    expect(shoe.dealtCount).toBe(0)
    expect(shoe.runningCount).toBe(0)
    expect(shoe.trueCount).toBe(0)
  })
})

describe('dealCard', () => {
  it('removes one card from the shoe', () => {
    const shoe = createShoe(1)
    const { shoe: newShoe } = dealCard(shoe, true)
    expect(newShoe.cards).toHaveLength(51)
    expect(newShoe.dealtCount).toBe(1)
  })

  it('sets faceUp correctly on the dealt card', () => {
    const shoe = createShoe(1)
    const { card: faceUpCard } = dealCard(shoe, true)
    expect(faceUpCard.faceUp).toBe(true)
    const { card: faceDownCard } = dealCard(shoe, false)
    expect(faceDownCard.faceUp).toBe(false)
  })

  it('does not update running count for face-down cards', () => {
    const shoe = createShoe(1)
    const { shoe: newShoe } = dealCard(shoe, false)
    expect(newShoe.runningCount).toBe(0)
  })

  it('throws when shoe is empty', () => {
    const emptyShoe = createShoe(1)
    let s = emptyShoe
    for (let i = 0; i < 52; i++) {
      const result = dealCard(s, true)
      s = result.shoe
    }
    expect(() => dealCard(s, true)).toThrow('Shoe is empty')
  })
})

describe('shouldReshuffle', () => {
  it('returns false when shoe is full', () => {
    const shoe = createShoe(6)
    expect(shouldReshuffle(shoe, 6)).toBe(false)
  })

  it('returns true when fewer than 25% remain', () => {
    const shoe = createShoe(6)
    // Deal 240 cards (> 75% of 312)
    let s = shoe
    for (let i = 0; i < 240; i++) {
      const result = dealCard(s, true)
      s = result.shoe
    }
    expect(shouldReshuffle(s, 6)).toBe(true)
  })
})

describe('getCountStats', () => {
  it('returns running and true count', () => {
    const shoe = createShoe()
    const stats = getCountStats(shoe)
    expect(stats).toHaveProperty('runningCount')
    expect(stats).toHaveProperty('trueCount')
  })
})
