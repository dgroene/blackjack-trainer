import type { Card, Rank, Shoe, Suit } from './types'

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades']
const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K']

/** Hi-Lo count value for each rank (future card counting extension) */
const HI_LO_VALUE: Record<Rank, number> = {
  '2': 1,
  '3': 1,
  '4': 1,
  '5': 1,
  '6': 1,
  '7': 0,
  '8': 0,
  '9': 0,
  T: -1,
  J: -1,
  Q: -1,
  K: -1,
  A: -1,
}

function buildDeck(): Card[] {
  const deck: Card[] = []
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank, faceUp: true })
    }
  }
  return deck
}

/** Fisher-Yates shuffle — mutates the array in place */
function shuffleInPlace(cards: Card[]): void {
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[cards[i], cards[j]] = [cards[j], cards[i]]
  }
}

export function createShoe(numDecks = 6): Shoe {
  const cards: Card[] = []
  for (let d = 0; d < numDecks; d++) {
    cards.push(...buildDeck())
  }
  shuffleInPlace(cards)
  return { cards, dealtCount: 0, runningCount: 0, trueCount: 0 }
}

export function dealCard(shoe: Shoe, faceUp: boolean): { card: Card; shoe: Shoe } {
  if (shoe.cards.length === 0) {
    throw new Error('Shoe is empty')
  }
  const [topCard, ...remaining] = shoe.cards
  const card: Card = { ...topCard, faceUp }
  const newDealtCount = shoe.dealtCount + 1
  const newRunningCount = faceUp
    ? shoe.runningCount + HI_LO_VALUE[card.rank]
    : shoe.runningCount

  const decksRemaining = (shoe.cards.length - 1) / 52
  const newTrueCount = decksRemaining > 0 ? newRunningCount / decksRemaining : newRunningCount

  return {
    card,
    shoe: {
      cards: remaining,
      dealtCount: newDealtCount,
      runningCount: newRunningCount,
      trueCount: newTrueCount,
    },
  }
}

/** Reshuffle when fewer than 25% of cards remain */
export function shouldReshuffle(shoe: Shoe, numDecks = 6): boolean {
  const totalCards = numDecks * 52
  return shoe.cards.length < totalCards * 0.25
}

/** Expose count stats for future card counting UI */
export function getCountStats(shoe: Shoe): { runningCount: number; trueCount: number } {
  return { runningCount: shoe.runningCount, trueCount: shoe.trueCount }
}
