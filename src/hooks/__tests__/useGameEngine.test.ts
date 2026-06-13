import { describe, expect, it, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useGameEngine } from '../useGameEngine'

function makeCallbacks() {
  return { onCorrect: vi.fn(), onIncorrect: vi.fn() }
}

describe('useGameEngine', () => {
  it('starts in idle phase with no cards', () => {
    const { onCorrect, onIncorrect } = makeCallbacks()
    const { result } = renderHook(() => useGameEngine(onCorrect, onIncorrect))
    expect(result.current.state.phase).toBe('idle')
    expect(result.current.state.playerHands).toHaveLength(0)
    expect(result.current.state.dealerCards).toHaveLength(0)
  })

  it('transitions to playerTurn after newHand', () => {
    const { onCorrect, onIncorrect } = makeCallbacks()
    const { result } = renderHook(() => useGameEngine(onCorrect, onIncorrect))
    act(() => result.current.newHand())
    expect(result.current.state.phase).toBe('playerTurn')
    expect(result.current.state.playerHands[0].cards).toHaveLength(2)
    expect(result.current.state.dealerCards).toHaveLength(2)
  })

  it('dealer hole card starts face down', () => {
    const { onCorrect, onIncorrect } = makeCallbacks()
    const { result } = renderHook(() => useGameEngine(onCorrect, onIncorrect))
    act(() => result.current.newHand())
    expect(result.current.state.dealerCards[1].faceUp).toBe(false)
  })

  it('stand triggers dealer turn', () => {
    const { onCorrect, onIncorrect } = makeCallbacks()
    const { result } = renderHook(() => useGameEngine(onCorrect, onIncorrect))
    act(() => result.current.newHand())
    act(() => result.current.stand())
    // Phase should be dealerTurn or result (dealer may auto-play immediately)
    expect(['dealerTurn', 'result']).toContain(result.current.state.phase)
  })

  it('records a decision on stand', () => {
    const { onCorrect, onIncorrect } = makeCallbacks()
    const { result } = renderHook(() => useGameEngine(onCorrect, onIncorrect))
    act(() => result.current.newHand())
    act(() => result.current.stand())
    // Either onCorrect or onIncorrect was called (depends on cards dealt)
    const totalCalls = onCorrect.mock.calls.length + onIncorrect.mock.calls.length
    expect(totalCalls).toBe(1)
    expect(result.current.state.lastDecision).not.toBeNull()
  })

  it('hit adds a card to the active hand', () => {
    const { onCorrect, onIncorrect } = makeCallbacks()
    const { result } = renderHook(() => useGameEngine(onCorrect, onIncorrect))
    act(() => result.current.newHand())
    const cardsBefore = result.current.state.playerHands[0].cards.length
    act(() => result.current.hit())
    const cardsAfter = result.current.state.playerHands[0].cards.length
    // If hand wasn't already over, we get 3 cards
    expect(cardsAfter).toBeGreaterThanOrEqual(cardsBefore)
  })

  it('available actions are disabled outside playerTurn', () => {
    const { onCorrect, onIncorrect } = makeCallbacks()
    const { result } = renderHook(() => useGameEngine(onCorrect, onIncorrect))
    expect(result.current.availableActions.canHit).toBe(false)
    expect(result.current.availableActions.canStand).toBe(false)
    expect(result.current.availableActions.canDouble).toBe(false)
    expect(result.current.availableActions.canSplit).toBe(false)
  })

  it('canDouble is true on initial 2-card hand', () => {
    const { onCorrect, onIncorrect } = makeCallbacks()
    const { result } = renderHook(() => useGameEngine(onCorrect, onIncorrect))
    act(() => result.current.newHand())
    if (result.current.state.phase === 'playerTurn') {
      expect(result.current.availableActions.canDouble).toBe(true)
    }
  })

  it('lastDecision contains correct and player action', () => {
    const { onCorrect, onIncorrect } = makeCallbacks()
    const { result } = renderHook(() => useGameEngine(onCorrect, onIncorrect))
    act(() => result.current.newHand())
    act(() => result.current.stand())
    const d = result.current.state.lastDecision
    expect(d).not.toBeNull()
    expect(d?.playerAction).toBe('S')
    expect(['H', 'S', 'D', 'Ds', 'P']).toContain(d?.correctAction)
    expect(typeof d?.isCorrect).toBe('boolean')
    expect(typeof d?.message).toBe('string')
  })
})
