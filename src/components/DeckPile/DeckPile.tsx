import { forwardRef } from 'react'
import styles from './DeckPile.module.css'

export interface DeckPileProps {
  remaining: number
}

/**
 * Visual shoe/deck pile. The `ref` is forwarded to the outer element so
 * `useGameEngine` can compute the animation origin for dealt cards.
 */
export const DeckPile = forwardRef<HTMLDivElement, DeckPileProps>(function DeckPile(
  { remaining },
  ref
) {
  return (
    <div>
      <div className={styles.pile} ref={ref}>
        <div className={styles.topCard}>
          <div className={styles.pattern} />
        </div>
      </div>
      <p className={styles.label}>Shoe</p>
      <p className={styles.remaining}>{remaining} left</p>
    </div>
  )
})
