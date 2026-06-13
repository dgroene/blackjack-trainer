import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import type { DecisionResult } from '../../hooks/useGameEngine'
import styles from './FeedbackToast.module.css'

interface FeedbackToastProps {
  decision: DecisionResult | null
  /** Toast is visible only when the game is paused for feedback (result phase) */
  visible: boolean
}

export function FeedbackToast({ decision, visible }: FeedbackToastProps) {
  const [showWhy, setShowWhy] = useState(false)

  // Reset expanded state when a new decision arrives
  const key = decision
    ? `${decision.playerAction}-${decision.correctAction}-${String(decision.isCorrect)}`
    : 'none'

  if (!decision) return null

  const isCorrect = decision.isCorrect

  return (
    <AnimatePresence mode="wait">
      {visible && (
        <div className={styles.overlay} aria-live="polite" aria-atomic="true">
          <motion.div
            key={key}
            role="status"
            className={`${styles.toast} ${isCorrect ? styles.correct : styles.incorrect}`}
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            onAnimationStart={() => setShowWhy(false)}
          >
            <div className={styles.icon}>{isCorrect ? '✓' : '✗'}</div>

            <div
              className={`${styles.verdict} ${isCorrect ? styles.correctVerdict : styles.incorrectVerdict}`}
            >
              {isCorrect ? 'Correct!' : 'Incorrect'}
            </div>

            {!isCorrect && (
              <div className={styles.rule}>
                Correct play: <strong>{labelFor(decision.correctAction)}</strong>
              </div>
            )}

            {!isCorrect && (
              <>
                <button className={styles.whyBtn} onClick={() => setShowWhy((p) => !p)}>
                  {showWhy ? 'Hide' : 'Why?'}
                </button>

                <AnimatePresence>
                  {showWhy && (
                    <motion.div
                      className={styles.explanation}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {decision.message}
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}

            <div className={styles.continueHint}>
              {isCorrect ? 'Keep going!' : 'Click Deal to continue'}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

function labelFor(action: DecisionResult['correctAction']): string {
  switch (action) {
    case 'H': return 'Hit'
    case 'S': return 'Stand'
    case 'D':
    case 'Ds': return 'Double Down'
    case 'P': return 'Split'
  }
}
