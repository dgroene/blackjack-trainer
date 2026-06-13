import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DeckPile } from '../DeckPile/DeckPile'

describe('DeckPile', () => {
  it('renders the shoe label', () => {
    render(<DeckPile remaining={200} />)
    expect(screen.getByText('Shoe')).toBeDefined()
  })

  it('shows remaining card count', () => {
    render(<DeckPile remaining={147} />)
    expect(screen.getByText('147 left')).toBeDefined()
  })

  it('forwards ref to the pile element', () => {
    const ref = { current: null }
    render(<DeckPile remaining={100} ref={ref} />)
    expect(ref.current).not.toBeNull()
  })
})
