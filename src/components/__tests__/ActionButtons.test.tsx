import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ActionButtons } from '../ActionButtons/ActionButtons'

const allEnabled = { canHit: true, canStand: true, canDouble: true, canSplit: true }
const allDisabled = { canHit: false, canStand: false, canDouble: false, canSplit: false }
const noop = vi.fn()

describe('ActionButtons', () => {
  it('shows Deal New Hand button when showNewHand is true', () => {
    render(
      <ActionButtons available={allDisabled} onHit={noop} onStand={noop}
        onDouble={noop} onSplit={noop} onNewHand={noop} showNewHand />
    )
    expect(screen.getByText('Deal New Hand')).toBeDefined()
    expect(screen.queryByText('Hit')).toBeNull()
  })

  it('shows action buttons when showNewHand is false', () => {
    render(
      <ActionButtons available={allEnabled} onHit={noop} onStand={noop}
        onDouble={noop} onSplit={noop} onNewHand={noop} showNewHand={false} />
    )
    expect(screen.getByText('Hit')).toBeDefined()
    expect(screen.getByText('Stand')).toBeDefined()
    expect(screen.getByText('Double')).toBeDefined()
    expect(screen.getByText('Split')).toBeDefined()
  })

  it('disables buttons based on available flags', () => {
    render(
      <ActionButtons available={allDisabled} onHit={noop} onStand={noop}
        onDouble={noop} onSplit={noop} onNewHand={noop} showNewHand={false} />
    )
    expect(screen.getByText<HTMLButtonElement>('Hit').disabled).toBe(true)
    expect(screen.getByText<HTMLButtonElement>('Double').disabled).toBe(true)
    expect(screen.getByText<HTMLButtonElement>('Split').disabled).toBe(true)
  })

  it('calls onHit when Hit is clicked', () => {
    const onHit = vi.fn()
    render(
      <ActionButtons available={allEnabled} onHit={onHit} onStand={noop}
        onDouble={noop} onSplit={noop} onNewHand={noop} showNewHand={false} />
    )
    fireEvent.click(screen.getByText('Hit'))
    expect(onHit).toHaveBeenCalledOnce()
  })

  it('calls onStand when Stand is clicked', () => {
    const onStand = vi.fn()
    render(
      <ActionButtons available={allEnabled} onHit={noop} onStand={onStand}
        onDouble={noop} onSplit={noop} onNewHand={noop} showNewHand={false} />
    )
    fireEvent.click(screen.getByText('Stand'))
    expect(onStand).toHaveBeenCalledOnce()
  })

  it('calls onNewHand when Deal button clicked', () => {
    const onNewHand = vi.fn()
    render(
      <ActionButtons available={allDisabled} onHit={noop} onStand={noop}
        onDouble={noop} onSplit={noop} onNewHand={onNewHand} showNewHand />
    )
    fireEvent.click(screen.getByText('Deal New Hand'))
    expect(onNewHand).toHaveBeenCalledOnce()
  })
})
