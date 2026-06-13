import type { Action, Card, Rank } from './types'
import { dealerUpcardValue, getPairRank, getHandValue, isPair } from './hand'

/**
 * Vegas Strip rules: 6 decks, dealer stands on soft 17, double any 2 cards,
 * double after split allowed, re-split up to 4 hands.
 *
 * Columns: dealer upcard 2,3,4,5,6,7,8,9,T,A  (indices 0–9)
 * D  = Double (fall back to Hit if can't double)
 * Ds = Double (fall back to Stand if can't double)
 */

// Hard totals 4–21
// Hard 17+ is always Stand, handled in getHardAction()
const HARD: Record<number, Action[]> = {
  //        2    3    4    5    6    7    8    9    T    A
  4: ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  5: ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  6: ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  7: ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  8: ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  9: ['H', 'D', 'D', 'D', 'D', 'H', 'H', 'H', 'H', 'H'],
  10: ['D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'H', 'H'],
  11: ['D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'H'],
  12: ['H', 'H', 'S', 'S', 'S', 'H', 'H', 'H', 'H', 'H'],
  13: ['S', 'S', 'S', 'S', 'S', 'H', 'H', 'H', 'H', 'H'],
  14: ['S', 'S', 'S', 'S', 'S', 'H', 'H', 'H', 'H', 'H'],
  15: ['S', 'S', 'S', 'S', 'S', 'H', 'H', 'H', 'H', 'H'],
  16: ['S', 'S', 'S', 'S', 'S', 'H', 'H', 'H', 'H', 'H'],
}

// Soft totals: key is the non-ace card value (2–9 → soft 13–20)
// A+A is handled as a pair before reaching here
const SOFT: Record<number, Action[]> = {
  //        2     3     4     5     6     7    8    9    T    A
  2: ['H', 'H', 'H', 'D', 'D', 'H', 'H', 'H', 'H', 'H'], // A,2  soft 13
  3: ['H', 'H', 'H', 'D', 'D', 'H', 'H', 'H', 'H', 'H'], // A,3  soft 14
  4: ['H', 'H', 'D', 'D', 'D', 'H', 'H', 'H', 'H', 'H'], // A,4  soft 15
  5: ['H', 'H', 'D', 'D', 'D', 'H', 'H', 'H', 'H', 'H'], // A,6  soft 16 (key=5 means non-ace=5)
  6: ['H', 'D', 'D', 'D', 'D', 'H', 'H', 'H', 'H', 'H'], // A,6  soft 17
  7: ['Ds', 'Ds', 'Ds', 'Ds', 'Ds', 'S', 'S', 'H', 'H', 'H'], // A,7  soft 18
  8: ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'], // A,8  soft 19
  9: ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'], // A,9  soft 20
}

// Pairs: key is the pair rank (A,2–9,T — face cards normalised to T)
const PAIRS: Record<Rank, Action[]> = {
  //        2    3    4    5    6    7    8    9    T    A
  A: ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
  '2': ['P', 'P', 'P', 'P', 'P', 'P', 'H', 'H', 'H', 'H'],
  '3': ['P', 'P', 'P', 'P', 'P', 'P', 'H', 'H', 'H', 'H'],
  '4': ['H', 'H', 'H', 'P', 'P', 'H', 'H', 'H', 'H', 'H'],
  '5': ['D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'H', 'H'], // treat as hard 10, never split
  '6': ['P', 'P', 'P', 'P', 'P', 'H', 'H', 'H', 'H', 'H'],
  '7': ['P', 'P', 'P', 'P', 'P', 'P', 'H', 'H', 'H', 'H'],
  '8': ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
  '9': ['P', 'P', 'P', 'P', 'P', 'S', 'P', 'P', 'S', 'S'],
  T: ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],
  J: ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],
  Q: ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],
  K: ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],
}

/** Maps dealer upcard numeric value to column index 0–9 */
function dealerIndex(upcardValue: number): number {
  if (upcardValue === 11) return 9 // Ace
  if (upcardValue === 10) return 8
  return upcardValue - 2 // 2→0 … 9→7
}

function getHardAction(total: number, colIdx: number): Action {
  if (total >= 17) return 'S'
  if (total <= 8) return 'H'
  return HARD[total][colIdx]
}

/**
 * Returns the basic strategy action for the given player hand and dealer upcard.
 *
 * Priority: Pairs → Soft → Hard
 *
 * @param playerCards  All cards in the player's current hand (face-up)
 * @param dealerUpcard The dealer's visible card
 * @param canDoubleDown Whether doubling is currently allowed (initial 2 cards only)
 * @param canSplitHand  Whether splitting is currently allowed
 */
export function getStrategyAction(
  playerCards: Card[],
  dealerUpcard: Card,
  canDoubleDown: boolean,
  canSplitHand: boolean
): Action {
  const upcardVal = dealerUpcardValue(dealerUpcard)
  const col = dealerIndex(upcardVal)
  const { total, isSoft } = getHandValue(playerCards)

  // 1. Pairs (only evaluate if splitting is actually available)
  if (canSplitHand && isPair(playerCards)) {
    const pairRank = getPairRank(playerCards)
    if (pairRank !== null) {
      const pairAction = PAIRS[pairRank][col]
      // If strategy says P but player can't split (shouldn't happen given canSplitHand guard),
      // fall through to soft/hard logic
      if (pairAction === 'P') return 'P'
      // 5,5 is treated as hard 10 — fall through
      if (pairRank !== '5') return pairAction
    }
  }

  // 2. Soft hands
  if (isSoft) {
    // Find the non-ace card value to key into SOFT table
    const nonAceValue = total - 11 // e.g. soft 18 → 18-11=7
    if (nonAceValue >= 2 && nonAceValue <= 9) {
      const softAction = SOFT[nonAceValue][col]
      // If strategy says D/Ds but player can't double, fall back
      if (!canDoubleDown) {
        if (softAction === 'D') return 'H'
        if (softAction === 'Ds') return 'S'
      }
      return softAction
    }
    // Soft 21 (A+T) — stand
    if (total >= 20) return 'S'
  }

  // 3. Hard hands
  const hardAction = getHardAction(total, col)
  if (!canDoubleDown && hardAction === 'D') return 'H'
  return hardAction
}

/** Stub for future surrender support — returns null (no surrender) */
export function getSurrenderAction(
  _playerCards: Card[], // eslint-disable-line @typescript-eslint/no-unused-vars
  _dealerUpcard: Card   // eslint-disable-line @typescript-eslint/no-unused-vars
): Action | null {
  return null
}

export { HARD, SOFT, PAIRS }
