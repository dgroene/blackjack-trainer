import type { Action } from '../../engine/types'
import { HARD, SOFT, PAIRS } from '../../engine/strategy'
import styles from './StrategyChart.module.css'

/** Dealer upcard column headers */
const DEALER_COLS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'A']

const ALL_H: Action[] = ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H']
const ALL_S: Action[] = ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S']

// ── Hard totals ───────────────────────────────────────────────────────────────
const HARD_ROWS: { label: string; actions: Action[] }[] = [
  { label: '5 – 8', actions: ALL_H },
  { label: '9',     actions: HARD[9] },
  { label: '10',    actions: HARD[10] },
  { label: '11',    actions: HARD[11] },
  { label: '12',    actions: HARD[12] },
  { label: '13',    actions: HARD[13] },
  { label: '14',    actions: HARD[14] },
  { label: '15',    actions: HARD[15] },
  { label: '16',    actions: HARD[16] },
  { label: '17+',   actions: ALL_S },
]

// ── Soft totals ───────────────────────────────────────────────────────────────
const SOFT_ROWS: { label: string; actions: Action[] }[] = [
  { label: 'A, 2', actions: SOFT[2] },
  { label: 'A, 3', actions: SOFT[3] },
  { label: 'A, 4', actions: SOFT[4] },
  { label: 'A, 5', actions: SOFT[5] },
  { label: 'A, 6', actions: SOFT[6] },
  { label: 'A, 7', actions: SOFT[7] },
  { label: 'A, 8', actions: SOFT[8] },
  { label: 'A, 9', actions: SOFT[9] },
]

// ── Pairs ─────────────────────────────────────────────────────────────────────
const PAIR_ROWS: { label: string; actions: Action[] }[] = [
  { label: 'A, A',   actions: PAIRS['A'] },
  { label: '2, 2',   actions: PAIRS['2'] },
  { label: '3, 3',   actions: PAIRS['3'] },
  { label: '4, 4',   actions: PAIRS['4'] },
  { label: '5, 5',   actions: PAIRS['5'] },
  { label: '6, 6',   actions: PAIRS['6'] },
  { label: '7, 7',   actions: PAIRS['7'] },
  { label: '8, 8',   actions: PAIRS['8'] },
  { label: '9, 9',   actions: PAIRS['9'] },
  { label: '10, 10', actions: PAIRS['T'] },
]

// ── Helpers ───────────────────────────────────────────────────────────────────
function cellClass(action: Action): string {
  switch (action) {
    case 'H':  return styles.cellH
    case 'S':  return styles.cellS
    case 'D':  return styles.cellD
    case 'Ds': return styles.cellDs
    case 'P':  return styles.cellP
    default:   return ''
  }
}

function cellText(action: Action): string {
  switch (action) {
    case 'H':  return 'H'
    case 'S':  return 'S'
    case 'D':  return 'D'
    case 'Ds': return 'D'   // same letter, slightly darker shade — see CSS
    case 'P':  return 'P'
    default:   return ''
  }
}

// ── Grid sub-component ────────────────────────────────────────────────────────
interface GridProps {
  title: string
  rows: { label: string; actions: Action[] }[]
}

function StrategyGrid({ title, rows }: GridProps) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{title}</h2>

      {/* Wrap in a scrollable div so the table never forces the page wider */}
      <div className={styles.tableWrap}>
        <table className={styles.table} aria-label={`${title} strategy`}>
          <thead>
            <tr>
              <th className={styles.cornerCell} scope="col">Player \ Dealer</th>
              {DEALER_COLS.map(col => (
                <th key={col} className={styles.colHead} scope="col">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.label}>
                <th className={styles.rowHead} scope="row">{row.label}</th>
                {row.actions.map((action, i) => (
                  <td
                    key={i}
                    className={`${styles.cell} ${cellClass(action)}`}
                    aria-label={`${row.label} vs ${DEALER_COLS[i]}: ${action}`}
                  >
                    {cellText(action)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────
export function StrategyChart() {
  return (
    <div className={styles.chart}>
      {/* Legend */}
      <div className={styles.legend} aria-label="Action legend">
        <span className={`${styles.legendItem} ${styles.cellH}`}>H — Hit</span>
        <span className={`${styles.legendItem} ${styles.cellS}`}>S — Stand</span>
        <span className={`${styles.legendItem} ${styles.cellD}`}>D — Double</span>
        <span className={`${styles.legendItem} ${styles.cellP}`}>P — Split</span>
      </div>

      <StrategyGrid title="Hard Totals" rows={HARD_ROWS} />
      <StrategyGrid title="Soft Totals" rows={SOFT_ROWS} />
      <StrategyGrid title="Pairs"       rows={PAIR_ROWS} />

      <p className={styles.footnote}>
        D in soft totals falls back to Stand (Ds) when doubling not available · Vegas Strip S17 · DAS · No Surrender
      </p>
    </div>
  )
}
