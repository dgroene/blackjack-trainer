import { useCallback, useState } from 'react'
import { createShoe, dealCard, getCountStats, shouldReshuffle } from '../engine/deck'
import type { Card, Shoe } from '../engine/types'

const NUM_DECKS = 6

export function useDeck() {
  const [shoe, setShoe] = useState<Shoe>(() => createShoe(NUM_DECKS))

  /**
   * Deals a single card from the shoe, reshuffling first if needed.
   * Returns the card synchronously via a ref trick so callers can
   * chain multiple deals without waiting for React to re-render.
   */
  const deal = useCallback((faceUp: boolean): Card => {
    let dealtCard!: Card
    setShoe((prev) => {
      const currentShoe = shouldReshuffle(prev, NUM_DECKS) ? createShoe(NUM_DECKS) : prev
      const { card, shoe: next } = dealCard(currentShoe, faceUp)
      dealtCard = card
      return next
    })
    return dealtCard
  }, [])

  const reshuffle = useCallback(() => {
    setShoe(createShoe(NUM_DECKS))
  }, [])

  /** Exposes running/true count for future card counting UI */
  const countStats = getCountStats(shoe)

  return { shoe, deal, reshuffle, countStats }
}
