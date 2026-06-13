import { useCallback, useEffect, useReducer } from 'react'
import { createShoe, dealCard, shouldReshuffle } from '../engine/deck'
import { isDealerBlackjack, shouldDealerHit } from '../engine/dealer'
import { getFeedbackMessage } from '../engine/feedback'
import { canDouble, canSplit, getHandValue } from '../engine/hand'
import { getStrategyAction } from '../engine/strategy'
import type { Action, Card, Shoe } from '../engine/types'

const NUM_DECKS = 6

// ─── State shape ────────────────────────────────────────────────────────────

export type GamePhase = 'idle' | 'playerTurn' | 'dealerTurn' | 'result'

export interface PlayerHand {
  id: string
  cards: Card[]
  isComplete: boolean
}

export interface DecisionResult {
  playerAction: Action
  correctAction: Action
  isCorrect: boolean
  message: string
}

export interface GameState {
  phase: GamePhase
  shoe: Shoe
  playerHands: PlayerHand[]
  activeHandIndex: number
  dealerCards: Card[]
  /** The most recent player decision evaluation */
  lastDecision: DecisionResult | null
  /** Informational only — does not affect scoring */
  handOutcome: 'win' | 'loss' | 'push' | 'blackjack' | 'dealerBlackjack' | null
}

// ─── Reducer actions ─────────────────────────────────────────────────────────

type ReducerAction =
  | {
      type: 'NEW_HAND'
      shoe: Shoe
      playerCards: [Card, Card]
      dealerCards: [Card, Card]
    }
  | { type: 'PLAYER_ACT'; card: Card | null; shoe: Shoe; decision: DecisionResult }
  | { type: 'COMPLETE_ACTIVE_HAND' }
  | { type: 'PLAYER_SPLIT'; shoe: Shoe; secondCard: Card }
  | { type: 'DEALER_HIT'; card: Card; shoe: Shoe }
  | { type: 'REVEAL_HOLE_CARD' }
  | { type: 'RESOLVE' }

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeHand(cards: Card[], id: string): PlayerHand {
  return { id, cards, isComplete: false }
}

function computeHandOutcome(
  playerCards: Card[],
  dealerCards: Card[]
): GameState['handOutcome'] {
  const playerVal = getHandValue(playerCards)
  const dealerVal = getHandValue(dealerCards)

  if (playerVal.isBust) return 'loss'
  if (dealerVal.isBust) return 'win'

  if (playerVal.total > dealerVal.total) return 'win'
  if (playerVal.total < dealerVal.total) return 'loss'
  return 'push'
}

// ─── Reducer ─────────────────────────────────────────────────────────────────

function reducer(state: GameState, action: ReducerAction): GameState {
  switch (action.type) {
    case 'NEW_HAND': {
      const hand = makeHand(action.playerCards, 'hand-0')
      return {
        phase: 'playerTurn',
        shoe: action.shoe,
        playerHands: [hand],
        activeHandIndex: 0,
        dealerCards: action.dealerCards,
        lastDecision: null,
        handOutcome: null,
      }
    }

    case 'PLAYER_ACT': {
      const hands = state.playerHands.map((h, i) => {
        if (i !== state.activeHandIndex) return h
        const newCards = action.card ? [...h.cards, action.card] : h.cards
        const { isBust, total } = getHandValue(newCards)
        const isComplete = isBust || total === 21
        return { ...h, cards: newCards, isComplete }
      })

      const activeHand = hands[state.activeHandIndex]
      const allDone = hands.every((h) => h.isComplete)

      let phase: GamePhase = 'playerTurn'
      if (allDone || (activeHand?.isComplete && action.card === null)) {
        phase = 'dealerTurn'
      }

      return {
        ...state,
        shoe: action.shoe,
        playerHands: hands,
        lastDecision: action.decision,
        phase,
      }
    }

    case 'COMPLETE_ACTIVE_HAND': {
      const hands = state.playerHands.map((h, i) =>
        i === state.activeHandIndex ? { ...h, isComplete: true } : h
      )
      const nextIdx = state.activeHandIndex + 1
      const allDone = nextIdx >= hands.length || hands.slice(nextIdx).every((h) => h.isComplete)

      return {
        ...state,
        playerHands: hands,
        activeHandIndex: allDone ? state.activeHandIndex : nextIdx,
        phase: allDone ? 'dealerTurn' : 'playerTurn',
      }
    }

    case 'PLAYER_SPLIT': {
      const activeHand = state.playerHands[state.activeHandIndex]
      const [card1, card2] = activeHand.cards
      const hand1 = makeHand([card1], `hand-${state.playerHands.length}`)
      const hand2 = makeHand([card2, action.secondCard], `hand-${state.playerHands.length + 1}`)

      const hands = [
        ...state.playerHands.slice(0, state.activeHandIndex),
        hand1,
        hand2,
        ...state.playerHands.slice(state.activeHandIndex + 1),
      ]

      return {
        ...state,
        shoe: action.shoe,
        playerHands: hands,
        activeHandIndex: state.activeHandIndex,
      }
    }

    case 'REVEAL_HOLE_CARD': {
      const dealerCards = state.dealerCards.map((c, i) =>
        i === 1 ? { ...c, faceUp: true } : c
      )
      return { ...state, dealerCards }
    }

    case 'DEALER_HIT':
      return {
        ...state,
        shoe: action.shoe,
        dealerCards: [...state.dealerCards, action.card],
      }

    case 'RESOLVE': {
      const activeHand = state.playerHands[0]
      const outcome = computeHandOutcome(activeHand.cards, state.dealerCards)
      return { ...state, phase: 'result', handOutcome: outcome }
    }

    default:
      return state
  }
}

// ─── Initial state ────────────────────────────────────────────────────────────

function initialState(): GameState {
  return {
    phase: 'idle',
    shoe: createShoe(NUM_DECKS),
    playerHands: [],
    activeHandIndex: 0,
    dealerCards: [],
    lastDecision: null,
    handOutcome: null,
  }
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useGameEngine(onCorrect: () => void, onIncorrect: () => void) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState)

  // Dealer auto-play when phase transitions to dealerTurn
  useEffect(() => {
    if (state.phase !== 'dealerTurn') return

    // Reveal the hole card first
    dispatch({ type: 'REVEAL_HOLE_CARD' })

    let shoe = state.shoe
    let dealerCards = state.dealerCards.map((c) => ({ ...c, faceUp: true }))

    // Check for dealer blackjack — already handled in newHand, but
    // here we play out the dealer hand card by card
    const playDealer = () => {
      while (shouldDealerHit(dealerCards)) {
        const { card, shoe: nextShoe } = dealCard(shoe, true)
        dealerCards = [...dealerCards, card]
        shoe = nextShoe
        dispatch({ type: 'DEALER_HIT', card, shoe })
      }
      dispatch({ type: 'RESOLVE' })
    }

    // Small delay so the reveal animation can play before dealer hits
    const timer = setTimeout(playDealer, 600)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase])

  // ── Public actions ─────────────────────────────────────────────────────────

  const newHand = useCallback(() => {
    let shoe = state.shoe
    if (shouldReshuffle(shoe, NUM_DECKS)) shoe = createShoe(NUM_DECKS)

    const deal = (faceUp: boolean): { card: Card; shoe: Shoe } => {
      const result = dealCard(shoe, faceUp)
      shoe = result.shoe
      return result
    }

    const p1 = deal(true)
    const d1 = deal(true)
    const p2 = deal(true)
    const d2 = deal(false) // hole card

    dispatch({
      type: 'NEW_HAND',
      shoe,
      playerCards: [p1.card, p2.card],
      dealerCards: [d1.card, d2.card],
    })
  }, [state.shoe])

  const activeHand = state.playerHands[state.activeHandIndex]
  const dealerUpcard = state.dealerCards[0]

  function buildDecision(playerAction: Action): DecisionResult | null {
    if (!activeHand || !dealerUpcard) return null
    const canDbl = canDouble(activeHand.cards)
    const canSpl = canSplit(activeHand.cards) && state.playerHands.length < 4
    const correctAction = getStrategyAction(activeHand.cards, dealerUpcard, canDbl, canSpl)
    const isCorrect = playerAction === correctAction
    const message = getFeedbackMessage(correctAction, activeHand.cards, dealerUpcard)
    return { playerAction, correctAction, isCorrect, message }
  }

  const hit = useCallback(() => {
    if (!activeHand || !dealerUpcard) return
    const decision = buildDecision('H')
    if (!decision) return

    if (decision.isCorrect) onCorrect()
    else onIncorrect()

    let shoe = state.shoe
    const { card, shoe: nextShoe } = dealCard(shoe, true)
    shoe = nextShoe

    dispatch({ type: 'PLAYER_ACT', card, shoe, decision })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeHand, dealerUpcard, state.shoe, onCorrect, onIncorrect])

  const stand = useCallback(() => {
    if (!activeHand || !dealerUpcard) return
    const decision = buildDecision('S')
    if (!decision) return

    if (decision.isCorrect) onCorrect()
    else onIncorrect()

    dispatch({ type: 'PLAYER_ACT', card: null, shoe: state.shoe, decision })
    dispatch({ type: 'COMPLETE_ACTIVE_HAND' })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeHand, dealerUpcard, state.shoe, onCorrect, onIncorrect])

  const double = useCallback(() => {
    if (!activeHand || !dealerUpcard) return
    if (!canDouble(activeHand.cards)) return
    const decision = buildDecision('D')
    if (!decision) return

    if (decision.isCorrect) onCorrect()
    else onIncorrect()

    let shoe = state.shoe
    const { card, shoe: nextShoe } = dealCard(shoe, true)
    shoe = nextShoe

    // After doubling, hand is always complete
    dispatch({ type: 'PLAYER_ACT', card, shoe, decision })
    dispatch({ type: 'COMPLETE_ACTIVE_HAND' })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeHand, dealerUpcard, state.shoe, onCorrect, onIncorrect])

  const split = useCallback(() => {
    if (!activeHand || !dealerUpcard) return
    if (!canSplit(activeHand.cards)) return
    if (state.playerHands.length >= 4) return

    const decision = buildDecision('P')
    if (!decision) return

    if (decision.isCorrect) onCorrect()
    else onIncorrect()

    let shoe = state.shoe
    const { card, shoe: nextShoe } = dealCard(shoe, true)
    shoe = nextShoe

    dispatch({ type: 'PLAYER_SPLIT', shoe, secondCard: card })
    // Record as a PLAYER_ACT with no new card (split itself) so decision is stored
    dispatch({ type: 'PLAYER_ACT', card: null, shoe, decision })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeHand, dealerUpcard, state.playerHands.length, state.shoe, onCorrect, onIncorrect])

  // ── Derived availability ───────────────────────────────────────────────────

  const inPlayerTurn = state.phase === 'playerTurn'
  const availableActions = {
    canHit: inPlayerTurn,
    canStand: inPlayerTurn,
    canDouble: inPlayerTurn && !!activeHand && canDouble(activeHand.cards),
    canSplit:
      inPlayerTurn &&
      !!activeHand &&
      canSplit(activeHand.cards) &&
      state.playerHands.length < 4,
  }

  const dealerIsBlackjack =
    state.dealerCards.length === 2 && isDealerBlackjack(state.dealerCards)

  return {
    state,
    availableActions,
    dealerIsBlackjack,
    newHand,
    hit,
    stand,
    double,
    split,
  }
}
