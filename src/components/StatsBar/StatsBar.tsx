import type { Stats } from '../../hooks/useStats'
import styles from './StatsBar.module.css'

interface StatsBarProps {
  stats: Stats
  accuracyPercent: number | null
  onOpenModal: () => void
}

export function StatsBar({ stats, accuracyPercent, onOpenModal }: StatsBarProps) {
  return (
    <div className={styles.bar} onClick={onOpenModal} role="button" aria-label="Open stats">
      <div className={styles.stat}>
        <span className={styles.label}>Streak</span>
        <span className={`${styles.value} ${styles.streak}`}>
          {stats.currentStreak > 0 ? `🔥 ${stats.currentStreak}` : stats.currentStreak}
        </span>
      </div>

      <div className={styles.divider} />

      <div className={styles.stat}>
        <span className={styles.label}>Correct</span>
        <span className={`${styles.value} ${styles.correct}`}>{stats.correct}</span>
      </div>

      <div className={styles.stat}>
        <span className={styles.label}>Incorrect</span>
        <span className={`${styles.value} ${styles.incorrect}`}>{stats.incorrect}</span>
      </div>

      {accuracyPercent !== null && (
        <>
          <div className={styles.divider} />
          <div className={styles.stat}>
            <span className={styles.label}>Accuracy</span>
            <span className={styles.value}>{accuracyPercent}%</span>
          </div>
        </>
      )}

      <span className={styles.hint}>click for details</span>
    </div>
  )
}
