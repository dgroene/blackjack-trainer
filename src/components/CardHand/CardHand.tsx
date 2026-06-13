import { getHandValue } from '../../engine/hand'
import type { Card as CardType } from '../../engine/types'
import { Card } from '../Card/Card'
import styles from './CardHand.module.css'

export interface CardHandProps {
  cards: CardType[]
  label?: string
  /** Show running total below the hand */
  showTotal?: boolean
  /** New cards starting at this index should trigger deal animation */
  newCardStartIndex?: number
  dealOrigin?: { x: number; y: number }
  variant?: 'dealer' | 'player'
}

export function CardHand({
  cards,
  label,
  showTotal = true,
  newCardStartIndex = -1,
  dealOrigin,
  variant = 'player',
}: CardHandProps) {
  const faceUpCards = cards.filter((c) => c.faceUp)
  const { total, isSoft, isBust } = getHandValue(faceUpCards)
  const isBlackjack = faceUpCards.length === 2 && total === 21

  const totalLabel = (() => {
    if (faceUpCards.length === 0) return null
    if (isBlackjack) return 'Blackjack!'
    if (isBust) return 'Bust'
    return isSoft ? `Soft ${total}` : String(total)
  })()

  const totalClass = [
    styles.total,
    isBust ? styles.totalBust : '',
    isBlackjack ? styles.totalBlackjack : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={[styles.hand, variant === 'dealer' ? styles.handDealer : styles.handPlayer]
        .filter(Boolean)
        .join(' ')}
    >
      {label && <span className={styles.label}>{label}</span>}

      {cards.map((card, i) => (
        <Card
          key={`${card.rank}-${card.suit}-${i}`}
          card={card}
          isNew={i >= newCardStartIndex && newCardStartIndex >= 0}
          dealDelay={(i - Math.max(newCardStartIndex, 0)) * 0.15}
          dealOrigin={dealOrigin}
        />
      ))}

      {showTotal && totalLabel && (
        <span className={totalClass}>{totalLabel}</span>
      )}
    </div>
  )
}
