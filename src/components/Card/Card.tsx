import { motion, useAnimation } from 'framer-motion'
import { useEffect, useRef } from 'react'
import type { Card as CardType } from '../../engine/types'
import styles from './Card.module.css'

// ── Suit helpers ────────────────────────────────────────────────────────────

const SUIT_SYMBOL: Record<CardType['suit'], string> = {
  hearts: '♥',
  diamonds: '♦',
  spades: '♠',
  clubs: '♣',
}

const SUIT_COLOR: Record<CardType['suit'], 'red' | 'black'> = {
  hearts: 'red',
  diamonds: 'red',
  spades: 'black',
  clubs: 'black',
}

function displayRank(rank: CardType['rank']): string {
  return rank === 'T' ? '10' : rank
}

const FACE_CARDS = new Set<CardType['rank']>(['J', 'Q', 'K'])

// ── Subcomponents ───────────────────────────────────────────────────────────

function CardFace({ card }: { card: CardType }) {
  const colorClass = styles[SUIT_COLOR[card.suit]]
  const symbol = SUIT_SYMBOL[card.suit]
  const rank = displayRank(card.rank)

  return (
    <div className={`${styles.face} ${colorClass}`}>
      <div className={styles.corner}>
        <span className={styles.rank}>{rank}</span>
        <span className={styles.suit}>{symbol}</span>
      </div>

      {FACE_CARDS.has(card.rank) ? (
        <div className={`${styles.faceCardLabel} ${colorClass}`}>{card.rank}</div>
      ) : (
        <div className={`${styles.suitCenter} ${colorClass}`}>{symbol}</div>
      )}

      <div className={`${styles.corner} ${styles.cornerBottom}`}>
        <span className={styles.rank}>{rank}</span>
        <span className={styles.suit}>{symbol}</span>
      </div>
    </div>
  )
}

function CardBack() {
  return (
    <div className={styles.back}>
      <div className={styles.backPattern} />
    </div>
  )
}

// ── Main component ──────────────────────────────────────────────────────────

export interface CardProps {
  card: CardType
  /** Origin point for the deal-fly animation (deck pile position) */
  dealOrigin?: { x: number; y: number }
  /** Stagger delay in seconds for sequential dealing */
  dealDelay?: number
  /** Set true when card is first added to a hand to trigger deal animation */
  isNew?: boolean
}

export function Card({ card, dealOrigin, dealDelay = 0, isNew = false }: CardProps) {
  const controls = useAnimation()
  const prevFaceUp = useRef(card.faceUp)

  // Initial deal animation — fly from deck origin to final position
  useEffect(() => {
    if (!isNew) return
    const originX = dealOrigin?.x ?? 120
    const originY = dealOrigin?.y ?? -80

    void controls.start({
      x: [originX, 0],
      y: [originY, 0],
      opacity: [0, 1],
      scale: [0.85, 1],
      transition: {
        delay: dealDelay,
        duration: 0.38,
        ease: [0.22, 1, 0.36, 1],
      },
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Flip animation when faceUp changes
  const rotateY = card.faceUp ? 0 : 180

  useEffect(() => {
    if (prevFaceUp.current !== card.faceUp) {
      prevFaceUp.current = card.faceUp
    }
  }, [card.faceUp])

  return (
    <div className={styles.scene}>
      <motion.div
        className={styles.card}
        animate={{
          ...controls,
          rotateY,
        }}
        transition={{
          rotateY: { duration: 0.4, ease: 'easeInOut' },
        }}
        initial={
          isNew
            ? { x: dealOrigin?.x ?? 120, y: dealOrigin?.y ?? -80, opacity: 0, scale: 0.85 }
            : { rotateY }
        }
      >
        <CardFace card={card} />
        <CardBack />
      </motion.div>
    </div>
  )
}
