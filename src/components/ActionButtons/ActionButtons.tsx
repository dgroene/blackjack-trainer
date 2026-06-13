import styles from './ActionButtons.module.css'

interface AvailableActions {
  canHit: boolean
  canStand: boolean
  canDouble: boolean
  canSplit: boolean
}

interface ActionButtonsProps {
  available: AvailableActions
  onHit: () => void
  onStand: () => void
  onDouble: () => void
  onSplit: () => void
  onNewHand: () => void
  showNewHand: boolean
}

export function ActionButtons({
  available,
  onHit,
  onStand,
  onDouble,
  onSplit,
  onNewHand,
  showNewHand,
}: ActionButtonsProps) {
  if (showNewHand) {
    return (
      <div className={styles.container}>
        <button className={`${styles.btn} ${styles.newHand}`} onClick={onNewHand}>
          Deal New Hand
        </button>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <button
        className={`${styles.btn} ${styles.hit}`}
        onClick={onHit}
        disabled={!available.canHit}
      >
        Hit
      </button>
      <button
        className={`${styles.btn} ${styles.stand}`}
        onClick={onStand}
        disabled={!available.canStand}
      >
        Stand
      </button>
      <button
        className={`${styles.btn} ${styles.double}`}
        onClick={onDouble}
        disabled={!available.canDouble}
      >
        Double
      </button>
      <button
        className={`${styles.btn} ${styles.split}`}
        onClick={onSplit}
        disabled={!available.canSplit}
      >
        Split
      </button>
    </div>
  )
}
