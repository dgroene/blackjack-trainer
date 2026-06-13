import { describe, it, expect } from 'vitest'
import { getStrategyAction } from '../strategy'
import type { Card } from '../types'

function card(rank: Card['rank'], suit: Card['suit'] = 'spades'): Card {
  return { rank, suit, faceUp: true }
}

function dealer(rank: Card['rank']): Card {
  return card(rank)
}

// Shorthand: get action with doubling + splitting always available
function action(playerCards: Card[], dealerCard: Card, canDbl = true, canSpl = true) {
  return getStrategyAction(playerCards, dealerCard, canDbl, canSpl)
}

describe('Hard totals', () => {
  it('hard 8 vs any: always Hit', () => {
    expect(action([card('3'), card('5')], dealer('K'))).toBe('H')
    expect(action([card('3'), card('5')], dealer('5'))).toBe('H')
  })

  it('hard 9 vs 3: Double', () => {
    expect(action([card('5'), card('4')], dealer('3'))).toBe('D')
  })

  it('hard 9 vs 4: Double', () => {
    expect(action([card('5'), card('4')], dealer('4'))).toBe('D')
  })

  it('hard 9 vs 7: Hit', () => {
    expect(action([card('5'), card('4')], dealer('7'))).toBe('H')
  })

  it('hard 10 vs 9: Double', () => {
    expect(action([card('6'), card('4')], dealer('9'))).toBe('D')
  })

  it('hard 10 vs T: Hit', () => {
    expect(action([card('6'), card('4')], dealer('T'))).toBe('H')
  })

  it('hard 10 vs A: Hit', () => {
    expect(action([card('6'), card('4')], dealer('A'))).toBe('H')
  })

  it('hard 11 vs 10: Double', () => {
    expect(action([card('7'), card('4')], dealer('T'))).toBe('D')
  })

  it('hard 11 vs A: Hit', () => {
    expect(action([card('7'), card('4')], dealer('A'))).toBe('H')
  })

  it('hard 12 vs 4: Stand', () => {
    expect(action([card('7'), card('5')], dealer('4'))).toBe('S')
  })

  it('hard 12 vs 3: Hit', () => {
    expect(action([card('7'), card('5')], dealer('3'))).toBe('H')
  })

  it('hard 12 vs 7: Hit', () => {
    expect(action([card('7'), card('5')], dealer('7'))).toBe('H')
  })

  it('hard 13 vs 2: Stand', () => {
    expect(action([card('7'), card('6')], dealer('2'))).toBe('S')
  })

  it('hard 13 vs 7: Hit', () => {
    expect(action([card('7'), card('6')], dealer('7'))).toBe('H')
  })

  it('hard 16 vs 6: Stand', () => {
    expect(action([card('T'), card('6')], dealer('6'))).toBe('S')
  })

  it('hard 16 vs 7: Hit', () => {
    expect(action([card('T'), card('6')], dealer('7'))).toBe('H')
  })

  it('hard 17 vs A: Stand', () => {
    expect(action([card('T'), card('7')], dealer('A'))).toBe('S')
  })

  it('hard 20 vs A: Stand', () => {
    expect(action([card('T'), card('K')], dealer('A'))).toBe('S')
  })

  it('falls back to Hit when D but cannot double', () => {
    // hard 11 vs 6 would normally be D, but without doubling → H
    expect(action([card('7'), card('4')], dealer('6'), false, false)).toBe('H')
  })
})

describe('Soft totals', () => {
  it('soft 13 (A,2) vs 5: Double', () => {
    expect(action([card('A'), card('2')], dealer('5'))).toBe('D')
  })

  it('soft 13 (A,2) vs 4: Hit', () => {
    expect(action([card('A'), card('2')], dealer('4'))).toBe('H')
  })

  it('soft 15 (A,4) vs 4: Double', () => {
    expect(action([card('A'), card('4')], dealer('4'))).toBe('D')
  })

  it('soft 17 (A,6) vs 3: Double', () => {
    expect(action([card('A'), card('6')], dealer('3'))).toBe('D')
  })

  it('soft 17 (A,6) vs 2: Hit', () => {
    expect(action([card('A'), card('6')], dealer('2'))).toBe('H')
  })

  it('soft 18 (A,7) vs 2: Ds', () => {
    expect(action([card('A'), card('7')], dealer('2'))).toBe('Ds')
  })

  it('soft 18 (A,7) vs 3: Ds', () => {
    expect(action([card('A'), card('7')], dealer('3'))).toBe('Ds')
  })

  it('soft 18 (A,7) vs 7: Stand', () => {
    expect(action([card('A'), card('7')], dealer('7'))).toBe('S')
  })

  it('soft 18 (A,7) vs 9: Hit', () => {
    expect(action([card('A'), card('7')], dealer('9'))).toBe('H')
  })

  it('soft 18 (A,7) vs A: Hit', () => {
    expect(action([card('A'), card('7')], dealer('A'))).toBe('H')
  })

  it('soft 18 falls back to Stand when cannot double (Ds → S)', () => {
    expect(action([card('A'), card('7')], dealer('3'), false, false)).toBe('S')
  })

  it('soft 19 (A,8) vs any: Stand', () => {
    expect(action([card('A'), card('8')], dealer('9'))).toBe('S')
    expect(action([card('A'), card('8')], dealer('A'))).toBe('S')
  })

  it('soft 20 (A,9): Stand', () => {
    expect(action([card('A'), card('9')], dealer('6'))).toBe('S')
  })
})

describe('Pairs', () => {
  it('A,A: always Split', () => {
    for (const d of ['2', '7', 'T', 'A'] as const) {
      expect(action([card('A'), card('A')], dealer(d))).toBe('P')
    }
  })

  it('8,8: always Split', () => {
    for (const d of ['2', '9', 'T', 'A'] as const) {
      expect(action([card('8'), card('8')], dealer(d))).toBe('P')
    }
  })

  it('T,T: always Stand', () => {
    for (const d of ['2', '6', 'A'] as const) {
      expect(action([card('T'), card('T')], dealer(d))).toBe('S')
    }
  })

  it('5,5: treated as hard 10 — Double vs 2-9', () => {
    expect(action([card('5'), card('5')], dealer('6'))).toBe('D')
    expect(action([card('5'), card('5')], dealer('9'))).toBe('D')
  })

  it('5,5: Hit vs T', () => {
    expect(action([card('5'), card('5')], dealer('T'))).toBe('H')
  })

  it('2,2: Split vs 2-7', () => {
    for (const d of ['2', '3', '4', '5', '6', '7'] as const) {
      expect(action([card('2'), card('2')], dealer(d))).toBe('P')
    }
  })

  it('2,2: Hit vs 8-A', () => {
    for (const d of ['8', '9', 'T', 'A'] as const) {
      expect(action([card('2'), card('2')], dealer(d))).toBe('H')
    }
  })

  it('9,9: Split vs 2-6', () => {
    for (const d of ['2', '3', '4', '5', '6'] as const) {
      expect(action([card('9'), card('9')], dealer(d))).toBe('P')
    }
  })

  it('9,9: Stand vs 7', () => {
    expect(action([card('9'), card('9')], dealer('7'))).toBe('S')
  })

  it('9,9: Split vs 8-9', () => {
    expect(action([card('9'), card('9')], dealer('8'))).toBe('P')
    expect(action([card('9'), card('9')], dealer('9'))).toBe('P')
  })

  it('9,9: Stand vs T and A', () => {
    expect(action([card('9'), card('9')], dealer('T'))).toBe('S')
    expect(action([card('9'), card('9')], dealer('A'))).toBe('S')
  })

  it('6,6: Split vs 2-6', () => {
    for (const d of ['2', '3', '4', '5', '6'] as const) {
      expect(action([card('6'), card('6')], dealer(d))).toBe('P')
    }
  })

  it('6,6: Hit vs 7-A', () => {
    for (const d of ['7', '8', '9', 'T', 'A'] as const) {
      expect(action([card('6'), card('6')], dealer(d))).toBe('H')
    }
  })

  it('4,4: Split vs 5-6 only', () => {
    expect(action([card('4'), card('4')], dealer('5'))).toBe('P')
    expect(action([card('4'), card('4')], dealer('6'))).toBe('P')
    expect(action([card('4'), card('4')], dealer('4'))).toBe('H')
    expect(action([card('4'), card('4')], dealer('7'))).toBe('H')
  })

  it('face card pairs (J,Q) treated as T,T — Stand', () => {
    expect(action([card('J'), card('Q')], dealer('6'))).toBe('S')
  })
})
