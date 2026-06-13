import { describe, it, expect } from 'vitest'
import {
  getHandValue,
  isPair,
  getPairRank,
  canDouble,
  canSplit,
  cardNumericValue,
  dealerUpcardValue,
} from '../hand'
import type { Card } from '../types'

function makeCard(rank: Card['rank'], suit: Card['suit'] = 'hearts'): Card {
  return { rank, suit, faceUp: true }
}

describe('cardNumericValue', () => {
  it('values ace as 11', () => expect(cardNumericValue('A')).toBe(11))
  it('values T/J/Q/K as 10', () => {
    for (const r of ['T', 'J', 'Q', 'K'] as const) {
      expect(cardNumericValue(r)).toBe(10)
    }
  })
  it('values number cards by face', () => {
    expect(cardNumericValue('2')).toBe(2)
    expect(cardNumericValue('9')).toBe(9)
  })
})

describe('getHandValue', () => {
  it('calculates a simple hard hand', () => {
    const { total, isSoft, isBust } = getHandValue([makeCard('7'), makeCard('8')])
    expect(total).toBe(15)
    expect(isSoft).toBe(false)
    expect(isBust).toBe(false)
  })

  it('calculates soft hand (A+7 = soft 18)', () => {
    const { total, isSoft } = getHandValue([makeCard('A'), makeCard('7')])
    expect(total).toBe(18)
    expect(isSoft).toBe(true)
  })

  it('converts ace to 1 when needed to avoid bust', () => {
    const { total, isSoft } = getHandValue([makeCard('A'), makeCard('7'), makeCard('6')])
    expect(total).toBe(14)
    expect(isSoft).toBe(false)
  })

  it('handles blackjack (A+T)', () => {
    const { total } = getHandValue([makeCard('A'), makeCard('T')])
    expect(total).toBe(21)
  })

  it('detects bust', () => {
    const { isBust } = getHandValue([makeCard('K'), makeCard('Q'), makeCard('5')])
    expect(isBust).toBe(true)
  })

  it('handles multiple aces correctly', () => {
    // A + A = soft 12 (one ace as 11, one as 1)
    const { total, isSoft } = getHandValue([makeCard('A'), makeCard('A')])
    expect(total).toBe(12)
    expect(isSoft).toBe(true)
  })

  it('handles three aces without busting', () => {
    const { total } = getHandValue([makeCard('A'), makeCard('A'), makeCard('A')])
    expect(total).toBe(13)
  })

  it('returns hard 21 for K+Q+A', () => {
    const { total, isSoft } = getHandValue([makeCard('K'), makeCard('Q'), makeCard('A')])
    expect(total).toBe(21)
    expect(isSoft).toBe(false)
  })
})

describe('isPair', () => {
  it('returns true for same rank', () => {
    expect(isPair([makeCard('8'), makeCard('8')])).toBe(true)
  })

  it('returns true for same value (J and Q both = 10)', () => {
    expect(isPair([makeCard('J'), makeCard('Q')])).toBe(true)
  })

  it('returns false for different values', () => {
    expect(isPair([makeCard('7'), makeCard('8')])).toBe(false)
  })

  it('returns false for more than 2 cards', () => {
    expect(isPair([makeCard('7'), makeCard('7'), makeCard('7')])).toBe(false)
  })
})

describe('getPairRank', () => {
  it('returns the rank for a matching pair', () => {
    expect(getPairRank([makeCard('9'), makeCard('9')])).toBe('9')
  })

  it('normalises J/Q/K to T', () => {
    expect(getPairRank([makeCard('J'), makeCard('Q')])).toBe('T')
    expect(getPairRank([makeCard('K'), makeCard('K')])).toBe('T')
  })

  it('returns null for non-pair', () => {
    expect(getPairRank([makeCard('7'), makeCard('8')])).toBeNull()
  })
})

describe('canDouble', () => {
  it('returns true for exactly 2 cards', () => {
    expect(canDouble([makeCard('7'), makeCard('4')])).toBe(true)
  })

  it('returns false for more than 2 cards', () => {
    expect(canDouble([makeCard('2'), makeCard('3'), makeCard('4')])).toBe(false)
  })
})

describe('canSplit', () => {
  it('returns true for a pair', () => {
    expect(canSplit([makeCard('8'), makeCard('8')])).toBe(true)
  })

  it('returns false for a non-pair', () => {
    expect(canSplit([makeCard('8'), makeCard('7')])).toBe(false)
  })
})

describe('dealerUpcardValue', () => {
  it('values an Ace as 11', () => {
    expect(dealerUpcardValue(makeCard('A'))).toBe(11)
  })

  it('values a King as 10', () => {
    expect(dealerUpcardValue(makeCard('K'))).toBe(10)
  })
})
