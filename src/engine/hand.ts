import type { Card, HandValue, Rank } from './types'

export function cardNumericValue(rank: Rank): number {
  if (rank === 'A') return 11
  if (['T', 'J', 'Q', 'K'].includes(rank)) return 10
  return parseInt(rank, 10)
}

export function getHandValue(cards: Card[]): HandValue {
  let total = 0
  let aces = 0

  for (const card of cards) {
    const v = cardNumericValue(card.rank)
    total += v
    if (card.rank === 'A') aces++
  }

  // Reduce aces from 11 to 1 as needed to avoid busting
  while (total > 21 && aces > 0) {
    total -= 10
    aces--
  }

  return {
    total,
    isSoft: aces > 0,
    isBust: total > 21,
  }
}

/** True only when the two-card hand is a pair (same rank value, not necessarily same rank symbol) */
export function isPair(cards: Card[]): boolean {
  if (cards.length !== 2) return false
  return cardNumericValue(cards[0].rank) === cardNumericValue(cards[1].rank)
}

/**
 * Returns the rank used for pair strategy lookup.
 * Face cards (T/J/Q/K) all normalize to 'T'.
 */
export function getPairRank(cards: Card[]): Rank | null {
  if (!isPair(cards)) return null
  const rank = cards[0].rank
  if (['J', 'Q', 'K'].includes(rank)) return 'T'
  return rank
}

export function canDouble(cards: Card[]): boolean {
  return cards.length === 2
}

export function canSplit(cards: Card[]): boolean {
  return isPair(cards)
}

export function isSoft(cards: Card[]): boolean {
  return getHandValue(cards).isSoft
}

/** Dealer upcard numeric value for strategy lookup (Ace = 11) */
export function dealerUpcardValue(card: Card): number {
  return cardNumericValue(card.rank)
}
