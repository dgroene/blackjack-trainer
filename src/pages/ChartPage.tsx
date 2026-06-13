import { Link } from 'react-router-dom'
import { StrategyChart } from '../components/StrategyChart/StrategyChart'
import styles from './ChartPage.module.css'

export function ChartPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/" className={styles.backLink}>← Back to game</Link>
        <div className={styles.headerCenter}>
          <h1 className={styles.title}>Basic Strategy</h1>
          <p className={styles.subtitle}>Vegas Strip · 6 Decks · S17 · DAS · No Surrender</p>
        </div>
        {/* Spacer so the title stays truly centred with the back link on the left */}
        <div className={styles.headerSpacer} aria-hidden />
      </header>

      {/* Dealer column label */}
      <p className={styles.dealerLabel}>← Dealer upcard →</p>

      <StrategyChart />
    </div>
  )
}
