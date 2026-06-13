import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import type { Stats } from '../../hooks/useStats'
import styles from './StatsModal.module.css'

interface StatsModalProps {
  stats: Stats
  accuracyPercent: number | null
  open: boolean
  onClose: () => void
  onReset: () => void
}

export function StatsModal({ stats, accuracyPercent, open, onClose, onReset }: StatsModalProps) {
  const [confirming, setConfirming] = useState(false)
  const closeBtnRef = useRef<HTMLButtonElement>(null)

  // Wrap onClose so confirm state always resets on dismiss
  function handleClose() {
    setConfirming(false)
    onClose()
  }

  // Close on Escape key
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Move focus to close button when modal opens
  useEffect(() => {
    if (open) closeBtnRef.current?.focus()
  }, [open])

  function handleReset() {
    onReset()
    setConfirming(false)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={styles.backdrop}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}
        >
          <motion.div
            className={styles.modal}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <button ref={closeBtnRef} className={styles.closeBtn} onClick={handleClose} aria-label="Close stats (Escape)">×</button>
            <h2 className={styles.title}>Statistics</h2>

            <div className={styles.row}>
              <span className={styles.rowLabel}>Correct Decisions</span>
              <span className={`${styles.rowValue} ${styles.correct}`}>{stats.correct}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.rowLabel}>Incorrect Decisions</span>
              <span className={`${styles.rowValue} ${styles.incorrect}`}>{stats.incorrect}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.rowLabel}>Total Decisions</span>
              <span className={styles.rowValue}>{stats.totalDecisions}</span>
            </div>

            {accuracyPercent !== null && (
              <div className={styles.row}>
                <span className={styles.rowLabel}>Accuracy</span>
                <span className={`${styles.rowValue} ${styles.gold}`}>{accuracyPercent}%</span>
              </div>
            )}

            <div className={styles.dividerSection} />

            <div className={styles.row}>
              <span className={styles.rowLabel}>Current Streak</span>
              <span className={`${styles.rowValue} ${styles.streak}`}>
                {stats.currentStreak > 0 ? `🔥 ${stats.currentStreak}` : stats.currentStreak}
              </span>
            </div>
            <div className={styles.row}>
              <span className={styles.rowLabel}>Longest Streak</span>
              <span className={`${styles.rowValue} ${styles.gold}`}>{stats.longestStreak}</span>
            </div>

            {!confirming ? (
              <button className={styles.resetBtn} onClick={() => setConfirming(true)}>
                Reset All Stats
              </button>
            ) : (
              <div className={styles.confirmRow}>
                <button className={`${styles.confirmBtn} ${styles.confirmYes}`} onClick={handleReset}>
                  Yes, Reset
                </button>
                <button className={`${styles.confirmBtn} ${styles.confirmNo}`} onClick={() => setConfirming(false)}>
                  Cancel
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
