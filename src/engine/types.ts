export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades'

export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K'

export interface Card {
  suit: Suit
  rank: Rank
  faceUp: boolean
}

export interface Shoe {
  cards: Card[]
  /** Number of cards dealt so far — used for count tracking */
  dealtCount: number
  /** Hi-Lo running count (future card counting extension) */
  runningCount: number
  /** True count = runningCount / decksRemaining (future extension) */
  trueCount: number
}

/**
 * H  = Hit
 * S  = Stand
 * D  = Double down; fall back to Hit if doubling not available
 * Ds = Double down; fall back to Stand if doubling not available
 * P  = Split
 */
export type Action = 'H' | 'S' | 'D' | 'Ds' | 'P'

export interface HandValue {
  total: number
  isSoft: boolean
  isBust: boolean
}
