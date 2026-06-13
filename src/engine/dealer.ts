import type { Card } from './types'
import { getHandValue } from './hand'

/**
 * Vegas Strip rule: dealer stands on soft 17.
 * Returns true if dealer must take another card.
 */
export function shouldDealerHit(cards: Card[]): boolean {
  const { total, isSoft, isBust } = getHandValue(cards)
  if (isBust) return false
  if (total < 17) return true
  // Soft 17: stand (S17 rule)
  if (total === 17 && isSoft) return false
  return false
}

/** Returns true if dealer has a natural blackjack (Ace + 10-value on first two cards) */
export function isDealerBlackjack(cards: Card[]): boolean {
  if (cards.length !== 2) return false
  const { total } = getHandValue(cards)
  return total === 21
}
