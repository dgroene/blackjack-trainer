import { AnimatePresence, motion } from 'framer-motion'
import { useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ActionButtons } from '../components/ActionButtons/ActionButtons'
import { CardHand } from '../components/CardHand/CardHand'
import { DeckPile } from '../components/DeckPile/DeckPile'
import { FeedbackToast } from '../components/FeedbackToast/FeedbackToast'
import { StatsBar } from '../components/StatsBar/StatsBar'
import { StatsModal } from '../components/StatsModal/StatsModal'
import { useGameEngine } from '../hooks/useGameEngine'
import { useSound } from '../hooks/useSound'
import { useStats } from '../hooks/useStats'
import styles from './GamePage.module.css'

export function GamePage() {
  const { stats, accuracyPercent, recordCorrect, recordIncorrect, resetStats } = useStats()
  const [muted, setMuted] = useState(() => localStorage.getItem('bj-muted') === '1')
  const { play } = useSound(!muted)
  const [statsOpen, setStatsOpen] = useState(false)

  function toggleMute() {
    setMuted(m => {
      const next = !m
      localStorage.setItem('bj-muted', next ? '1' : '0')
      return next
    })
  }
  const deckRef = useRef<HTMLDivElement>(null)
  const [dealOrigin, setDealOrigin] = useState<{ x: number; y: number } | undefined>()

  useLayoutEffect(() => {
    function measure() {
      if (!deckRef.current) return
      const rect = deckRef.current.getBoundingClientRect()
      setDealOrigin({
        x: rect.left + rect.width / 2 - window.innerWidth / 2,
        y: rect.top + rect.height / 2 - window.innerHeight / 2,
      })
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  function handleCorrect() {
    recordCorrect()
    play('correct')
  }
  function handleIncorrect() {
    recordIncorrect()
    play('incorrect')
  }

  const { state, availableActions, newHand, hit, stand, double, split } = useGameEngine(
    handleCorrect,
    handleIncorrect
  )

  const { phase, playerHands, activeHandIndex, dealerCards, lastDecision, handOutcome } = state

  const showNewHand = phase === 'idle' || phase === 'result'
  const showFeedback = phase === 'result' && lastDecision !== null

  function handleNewHand() {
    play('deal')
    newHand()
  }

  return (
    <div className={styles.table}>
      {/* Top stats bar */}
      <div className={styles.topBar}>
        <StatsBar
          stats={stats}
          accuracyPercent={accuracyPercent}
          onOpenModal={() => setStatsOpen(true)}
        />
        <button
          className={styles.muteBtn}
          onClick={toggleMute}
          aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
          title={muted ? 'Unmute sounds' : 'Mute sounds'}
        >
          {muted ? '🔇' : '🔊'}
        </button>
      </div>

      {/* Main play area */}
      <div className={styles.playArea}>

        {/* Shoe in top-right corner — positioned inside playArea */}
        <div className={styles.shoeCorner}>
          <DeckPile ref={deckRef} remaining={state.shoe.cards.length} />
        </div>

        {/* Strategy chart link in top-left — positioned inside playArea */}
        <Link to="/chart" className={styles.chartToggle}>
          Strategy Chart
        </Link>

        {/* Dealer */}
        <div className={styles.dealerSection}>
          <CardHand
            cards={dealerCards}
            label="Dealer"
            showTotal={phase === 'result' || phase === 'dealerTurn'}
            newCardStartIndex={phase === 'playerTurn' ? 0 : -1}
            dealOrigin={dealOrigin}
            variant="dealer"
          />
        </div>

        {/* Center — outcome banner */}
        <div className={styles.centerInfo}>
          <AnimatePresence mode="wait">
            {phase === 'result' && handOutcome && (
              <motion.div
                key={handOutcome}
                className={`${styles.outcomeBanner} ${outcomeClass(handOutcome, styles)}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                {outcomeLabel(handOutcome)}
              </motion.div>
            )}
            {phase === 'idle' && (
              <motion.p
                key="idle"
                className={styles.idleMessage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                Press Deal to begin
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Player hands */}
        <div className={styles.playerSection}>
          <div className={styles.handsRow}>
            {playerHands.map((hand, i) => (
              <div key={hand.id} className={styles.handWrapper}>
                {playerHands.length > 1 && i === activeHandIndex && phase === 'playerTurn' && (
                  <div className={styles.activeIndicator} />
                )}
                <CardHand
                  cards={hand.cards}
                  label={playerHands.length > 1 ? `Hand ${i + 1}` : 'You'}
                  showTotal
                  newCardStartIndex={0}
                  dealOrigin={dealOrigin}
                  variant="player"
                />
              </div>
            ))}

            {phase === 'idle' && (
              <CardHand cards={[]} label="You" showTotal={false} variant="player" />
            )}
          </div>

          <ActionButtons
            available={availableActions}
            onHit={hit}
            onStand={stand}
            onDouble={double}
            onSplit={split}
            onNewHand={handleNewHand}
            showNewHand={showNewHand}
          />
        </div>
      </div>

      {/* Feedback overlay */}
      <FeedbackToast decision={lastDecision} visible={showFeedback} />

      {/* Stats modal */}
      <StatsModal
        stats={stats}
        accuracyPercent={accuracyPercent}
        open={statsOpen}
        onClose={() => setStatsOpen(false)}
        onReset={resetStats}
      />
    </div>
  )
}

function outcomeLabel(outcome: string): string {
  switch (outcome) {
    case 'win': return 'You Win'
    case 'loss': return 'Dealer Wins'
    case 'push': return 'Push'
    case 'blackjack': return '🃏 Blackjack!'
    case 'dealerBlackjack': return 'Dealer Blackjack'
    default: return ''
  }
}

function outcomeClass(outcome: string, s: typeof styles): string {
  switch (outcome) {
    case 'win': return s.outcomeWin
    case 'loss': return s.outcomeLoss
    case 'push': return s.outcomePush
    case 'blackjack':
    case 'dealerBlackjack': return s.outcomeBlackjack
    default: return ''
  }
}
